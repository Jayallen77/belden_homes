#!/usr/bin/env python3
"""Make browser-sized derivatives; never modify the supplied originals."""
import json
import subprocess
import openpyxl
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/MODEL PHOTOS'
TMP = ROOT / 'tmp/launch'
OUT = ROOT / 'assets/models'
TMP.mkdir(parents=True, exist_ok=True)
workbook = openpyxl.load_workbook(ROOT / 'data/sources/OFFERED MODELS.xlsx', data_only=True)
rows = [list(row[:13]) for row in workbook.active.values if row[0]][1:]
manifest = json.loads((ROOT / 'data/model-assets.json').read_text())
models = []
for row in rows:
    name = row[0]
    slug = name.lower().replace(' ', '-')
    folder = OUT / slug
    folder.mkdir(parents=True, exist_ok=True)
    photos = []
    sheet = Image.new('RGB', (1000, 220 * 3), 'white')
    draw = ImageDraw.Draw(sheet)
    photo_sources = sorted((SOURCE / name / 'Photos').glob('*.HEIC'))
    exterior = manifest[slug].get('exterior')
    photo_sources.sort(key=lambda p: (p.name != exterior, p.name))
    for i, source in enumerate(photo_sources):
        jpg = TMP / (source.stem + '.jpg')
        if not jpg.exists() or jpg.stat().st_size < 10000:
            subprocess.run(['sips', '-s', 'format', 'jpeg', str(source), '--out', str(jpg)], check=True, stdout=subprocess.DEVNULL)
        im = ImageOps.exif_transpose(Image.open(jpg)).convert('RGB')
        im.thumbnail((1600, 1600))
        photo = folder / (source.stem.lower() + '.webp')
        im.save(photo, 'WEBP', quality=82)
        thumb = im.copy()
        thumb.thumbnail((640, 640))
        thumb.save(folder / (source.stem.lower() + '-small.webp'), 'WEBP', quality=78)
        photos.append({'src': str(photo.relative_to(ROOT)), 'width': im.width, 'height': im.height, 'alt': name + (' exterior at Belden Homes' if source.name == exterior else f' display home interior, photo {i + 1}')})
        im.thumbnail((240, 180))
        x,y = (i % 4) * 250, (i // 4) * 220
        sheet.paste(im, (x, y + 25))
        draw.text((x + 5,y + 5), source.stem, fill='black')
    sheet.save(TMP / (slug + '-photos.jpg'))
    source = ROOT / manifest[slug]['floorplan']
    if source.suffix == '.pdf':
        rendered = TMP / (slug + '-floorplan')
        subprocess.run(['pdftoppm', '-singlefile', '-scale-to', '2400', '-png', str(source), str(rendered)], check=True)
        im = Image.open(str(rendered) + '.png').convert('RGB')
    else:
        im = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    im.save(folder / 'floorplan.webp', 'WEBP', lossless=True)
    preview = im.copy()
    preview.thumbnail((1200, 900))
    preview.save(TMP / (slug + '-floorplan.jpg'))
    preview.save(folder / 'floorplan-preview.webp', 'WEBP', quality=88)
    models.append({'name': name, 'slug': slug, 'modelNumber': row[4], 'squareFootage': int(row[7]), 'bedrooms': int(row[8]), 'bathrooms': int(row[9]), 'type': 'Manufactured ' + row[10], 'viewing': 'offsite' if row[11] == 'Off Site' else 'onsite', 'floorplan': str((folder / 'floorplan.webp').relative_to(ROOT)), 'floorplanWidth': im.width, 'floorplanHeight': im.height, 'floorplanNote': manifest[slug].get('note',''), 'photos': photos})
(ROOT / 'data/belden-models.json').write_text(json.dumps(models, indent=2) + '\n')
print('Prepared', len(models), 'models;', sum(len(m['photos']) for m in models), 'photos')
