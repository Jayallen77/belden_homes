#!/usr/bin/env python3
"""Make browser-sized derivatives; never modify the supplied originals."""
import json
import subprocess
import argparse
import hashlib
import math
import openpyxl
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/MODEL PHOTOS'
TMP = ROOT / 'tmp/launch'
OUT = ROOT / 'assets/models'
TMP.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--refresh-photos', action='store_true', help='Reconvert existing photo derivatives after replacing a source photo.')
args = parser.parse_args()
workbook = openpyxl.load_workbook(ROOT / 'data/sources/OFFERED MODELS.xlsx', data_only=True)
rows = [list(row[:13]) for row in workbook.active.values if row[0]][1:]
manifest = json.loads((ROOT / 'data/model-assets.json').read_text())

def read_image(path):
    """Fully decode files before accepting them; sips may exit successfully on failure."""
    with Image.open(path) as image:
        image.load()
        return ImageOps.exif_transpose(image).convert('RGB')

def save_webp(image, path, **options):
    temporary = path.with_name(path.stem + '.pending.webp')
    try:
        image.save(temporary, 'WEBP', **options)
        decoded = read_image(temporary)
        if decoded.size != image.size:
            raise ValueError(f'Invalid image dimensions: {temporary}')
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)

# Check all source mappings before changing derivatives or catalog data.
for row in rows:
    slug = row[0].lower().replace(' ', '-')
    source = ROOT / manifest[slug]['floorplan']
    if not source.is_file():
        raise FileNotFoundError(source)
    photos = SOURCE / row[0] / 'Photos'
    for filename in manifest[slug].get('photoAlts', {}):
        if not (photos / filename).is_file():
            raise FileNotFoundError(photos / filename)

models = []
for row in rows:
    name = row[0]
    slug = name.lower().replace(' ', '-')
    folder = OUT / slug
    folder.mkdir(parents=True, exist_ok=True)
    photos = []
    photo_sources = sorted((SOURCE / name / 'Photos').glob('*.HEIC'))
    exterior = manifest[slug].get('exterior')
    photo_sources.sort(key=lambda p: (p.name != exterior, p.name))
    sheet = Image.new('RGB', (1000, 220 * max(1, math.ceil(len(photo_sources) / 4))), 'white')
    draw = ImageDraw.Draw(sheet)
    for i, source in enumerate(photo_sources):
        photo = folder / (source.stem.lower() + '.webp')
        thumbnail = folder / (source.stem.lower() + '-small.webp')
        if photo.is_file() and not args.refresh_photos:
            # Renames retain the original optimized image bytes.
            im = read_image(photo)
        else:
            digest = hashlib.sha256(source.read_bytes()).hexdigest()[:12]
            jpg = TMP / f'{slug}-{source.stem}-{digest}.jpg'
            if not jpg.is_file():
                subprocess.run(['sips', '-s', 'format', 'jpeg', str(source), '--out', str(jpg)], check=True, stdout=subprocess.DEVNULL)
            try:
                im = read_image(jpg)
            except (OSError, ValueError) as error:
                jpg.unlink(missing_ok=True)
                raise RuntimeError(f'HEIC conversion could not be decoded: {source}') from error
            im.thumbnail((1600, 1600))
            save_webp(im, photo, quality=82)
        if thumbnail.is_file() and not args.refresh_photos:
            read_image(thumbnail)
        else:
            thumb = im.copy()
            thumb.thumbnail((640, 640))
            save_webp(thumb, thumbnail, quality=78)
        alt = manifest[slug].get('photoAlts', {}).get(source.name)
        if not alt:
            alt = name + (' exterior at Belden Homes' if source.name == exterior else f' display home interior, photo {i + 1}')
        photos.append({'src': str(photo.relative_to(ROOT)), 'width': im.width, 'height': im.height, 'alt': alt})
        contact_image = im.copy()
        contact_image.thumbnail((240, 180))
        x,y = (i % 4) * 250, (i // 4) * 220
        sheet.paste(contact_image, (x, y + 25))
        draw.text((x + 5,y + 5), source.stem, fill='black')
    sheet.save(TMP / (slug + '-photos.jpg'))
    source = ROOT / manifest[slug]['floorplan']
    if source.suffix == '.pdf':
        rendered = TMP / (slug + '-floorplan')
        subprocess.run(['pdftoppm', '-singlefile', '-scale-to', '2400', '-png', str(source), str(rendered)], check=True)
        im = read_image(Path(str(rendered) + '.png'))
    else:
        im = read_image(source)
    floorplan = folder / 'floorplan.webp'
    existing = read_image(floorplan) if floorplan.is_file() else None
    unchanged = existing is not None and existing.size == im.size and existing.tobytes() == im.tobytes()
    if not unchanged:
        save_webp(im, floorplan, lossless=True)
    preview_file = folder / 'floorplan-preview.webp'
    if unchanged and preview_file.is_file():
        read_image(preview_file)
    else:
        preview = im.copy()
        preview.thumbnail((1200, 900))
        preview.save(TMP / (slug + '-floorplan.jpg'))
        save_webp(preview, preview_file, quality=88)
    models.append({'name': name, 'slug': slug, 'modelNumber': row[4], 'squareFootage': int(row[7]), 'bedrooms': int(row[8]), 'bathrooms': int(row[9]), 'type': 'Manufactured ' + row[10], 'viewing': 'offsite' if row[11] == 'Off Site' else 'onsite', 'floorplan': str((folder / 'floorplan.webp').relative_to(ROOT)), 'floorplanWidth': im.width, 'floorplanHeight': im.height, 'floorplanNote': manifest[slug].get('note',''), 'photos': photos})
(ROOT / 'data/belden-models.json').write_text(json.dumps(models, indent=2) + '\n')
print('Prepared', len(models), 'models;', sum(len(m['photos']) for m in models), 'photos')
