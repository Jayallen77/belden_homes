#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

import requests

MODELS = [
    {"belden_id": "62412", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-elite-10-28603h?series=%5B%22Astro+Creations%22%5D"},
    {"belden_id": "62472", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-mu-cephei-28683a?series=%5B%22Astro+Creations%22%5D"},
    {"belden_id": "15440", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-bungalow-12-24482a?series=%5B%22Astro+Creations%22%5D"},
    {"belden_id": "62330", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-mustang-14602b?series=%5B%22Blazer+Select%22%5D&page=4"},
    {"belden_id": "16040", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-charger-28523b?series=%5B%22Blazer+Select%22%5D"},
    {"belden_id": "16202", "url": "https://www.cavcohomes.com/building-center/clarion/floorplans/599-super-bee-28523f?series=%5B%22Blazer+Select%22%5D&page=2"},
]

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "belden-models.json"
IMG_DIR = ROOT / "assets" / "img"

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0 (compatible; HermesBeldenScraper/1.0)", "Accept": "application/json,text/html,*/*"})


def resource_url(url: str) -> str:
    p = urlparse(url)
    return f"{p.scheme}://{p.netloc}/resourceapi{p.path}" + (f"?{p.query}" if p.query else "")


def walk(obj):
    if isinstance(obj, dict):
        yield obj
        for v in obj.values():
            yield from walk(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from walk(v)


def ref_id(ref):
    if isinstance(ref, dict):
        r = ref.get("$ref")
        if r:
            return r.rsplit("/", 1)[-1]
    return None


def clean_feature_list(v):
    if not v:
        return []
    if isinstance(v, dict):
        v = v.get("feature") or []
    return [str(x).strip() for x in v if str(x).strip()]


def image_url_from_doc(doc):
    data = doc.get("data", {}) if isinstance(doc, dict) else {}
    assets = data.get("mediaAsset") or []
    for asset in assets:
        ximg = asset.get("ximage") or {}
        for size in ["original", "extraLarge", "large", "medium", "small"]:
            item = ximg.get(size) or ximg.get(size + "Image")
            if isinstance(item, dict) and item.get("url"):
                return item["url"], asset.get("imageAltText") or asset.get("description") or data.get("title") or data.get("displayName")
    return None, None


def download_image(url, filename):
    if not url:
        return None
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    dest = IMG_DIR / filename
    r = session.get(url, timeout=30)
    r.raise_for_status()
    dest.write_bytes(r.content)
    return f"assets/img/{filename}"


def scrape(model):
    api = resource_url(model["url"])
    r = session.get(api, timeout=45)
    r.raise_for_status()
    j = r.json()
    page = j.get("page", {})
    slug = urlparse(model["url"]).path.rstrip("/").split("/")[-1]

    floor_doc = None
    for obj in page.values():
        if isinstance(obj, dict) and obj.get("type") == "document":
            data = obj.get("data", {})
            if data.get("contentType") == "cavco:FloorplanDetails" and data.get("name") == slug:
                floor_doc = obj
                break
    if not floor_doc:
        candidates = []
        for obj in page.values():
            if isinstance(obj, dict) and obj.get("type") == "document":
                data = obj.get("data", {})
                if data.get("contentType") == "cavco:FloorplanDetails":
                    candidates.append(data.get("name"))
        raise RuntimeError(f"Floorplan doc not found for {slug}; candidates={candidates[:20]}")

    data = floor_doc["data"]
    line_doc = page.get(ref_id(data.get("lineDrawings")) or "", {})
    line_url, line_alt = image_url_from_doc(line_doc)

    photos = []
    photo_doc = page.get(ref_id(data.get("photos")) or "", {})
    if photo_doc:
        pdata = photo_doc.get("data", {})
        for asset in pdata.get("mediaAsset") or []:
            ximg = asset.get("ximage") or {}
            url = None
            for size in ["original", "extraLarge", "large", "medium", "small"]:
                item = ximg.get(size) or ximg.get(size + "Image")
                if isinstance(item, dict) and item.get("url"):
                    url = item["url"]; break
            if url:
                photos.append({"url": url, "alt": asset.get("imageAltText") or asset.get("description") or pdata.get("title")})

    base = re.sub(r"^599-", "", slug)
    local_img = download_image(line_url, f"belden-{model['belden_id']}-{base}.jpg")

    width_ft = data.get("flrPlanWidthFeet") or ""
    width_in = data.get("flrPlanWidthInches") or "0"
    length_ft = data.get("flrPlanLengthFeet") or ""
    length_in = data.get("flrPlanLengthInches") or "0"
    def dim(ft, inch):
        return f"{ft}'-{inch}\"" if inch and str(inch) != "0" else f"{ft}'"
    size_exact = f"{dim(width_ft, width_in)} x {dim(length_ft, length_in)}" if width_ft and length_ft else data.get("dimensionalArea") or ""
    card_size = f"{round(float(width_ft) + float(width_in or 0)/12):g} x {round(float(length_ft) + float(length_in or 0)/12):g}" if width_ft and length_ft else size_exact

    title = data.get("displayName") or slug
    model_name = data.get("modelName") or title.rsplit(" ", 1)[0]
    model_number = data.get("modelNumber") or title.rsplit(" ", 1)[-1]
    sections = data.get("sections") or ""
    double = "double" in sections.lower()
    home_type = "Double Wide Modular or Manufactured Home" if double else "Single Wide Manufactured Home"

    return {
        "beldenId": model["belden_id"],
        "slug": f"belden-{model['belden_id']}-{base}",
        "sourceSlug": slug,
        "sourceUrl": model["url"],
        "displayName": title,
        "modelName": model_name,
        "modelNumber": model_number,
        "series": data.get("series") or "",
        "squareFootage": data.get("squareFootage"),
        "sections": sections,
        "numBedrooms": data.get("numBedrooms"),
        "numBathrooms": data.get("numBathrooms"),
        "buildingMethod": data.get("buildingMethodValue") or "",
        "homeType": home_type,
        "description": data.get("description") or "",
        "sellingFeatures": clean_feature_list(data.get("floorplanSellingFeatures")),
        "sizeExact": size_exact,
        "cardSize": card_size,
        "widthFeet": width_ft,
        "widthInches": width_in,
        "lengthFeet": length_ft,
        "lengthInches": length_in,
        "assetId": data.get("assetId"),
        "seriesAssetId": data.get("seriesAssetId"),
        "lineDrawingUrl": line_url,
        "lineDrawingAlt": line_alt,
        "localImage": local_img,
        "photos": photos,
        "rawLastModificationDate": data.get("lastModificationDate"),
    }


def main():
    results = []
    for m in MODELS:
        print(f"Scraping {m['belden_id']} {m['url']}", file=sys.stderr)
        results.append(scrape(m))
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))

if __name__ == "__main__":
    main()
