#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / "data" / "belden-models.json").read_text())
HOMES = ROOT / "homes"

PHONE = "607-693-1364"
PHONE_LINK = "16076931364"
DAVE_LINK = "16077608403"


def h(s):
    return html.escape(str(s or ""), quote=True)


def rel_img(model, prefix=""):
    return prefix + model["localImage"]


def title(model):
    return f"Belden {model['beldenId']} / {model['displayName']}"


def fmt_bath(v):
    if v is None:
        return "—"
    return str(int(v)) if float(v).is_integer() else str(v)


def type_label(model):
    return "Single Wide" if "Single" in model["homeType"] else "Double Wide"


def specs_line(model):
    return f"{model['numBedrooms']} bed • {fmt_bath(model['numBathrooms'])} bath • {model['squareFootage']:,} sq. ft."


def status(model):
    return "Call for current availability"


def head(page_title, desc, css_prefix=""):
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{h(page_title)} | Belden Homes Inc.</title>
  <meta name="description" content="{h(desc)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{css_prefix}assets/css/styles.css">
</head>
<body>
'''


def header(prefix=""):
    return f'''  <div class="topbar"><span>Trusted since 1973</span><a href="tel:{PHONE_LINK}">Call {PHONE}</a><span>1951 NY-7, Harpursville, NY 13787</span></div>
  <header class="site-header">
    <a class="brand" href="{prefix}index.html"><img src="{prefix}assets/img/belden-logo-transparent.png" alt="Belden Homes Inc logo"><span>Belden Homes Inc.</span></a>
    <button class="menu-toggle" aria-label="Open menu">Menu</button>
    <nav><a href="{prefix}index.html">Home</a><a href="{prefix}inventory.html">Inventory</a><a href="{prefix}services.html">Services</a><a href="{prefix}buying-process.html">Buying Process</a><a href="{prefix}design-visualizers.html">Visualizers</a><a href="{prefix}about.html">About</a><a href="{prefix}faq.html">FAQ</a><a href="{prefix}contact.html">Contact</a></nav>
  </header>
'''


def footer(prefix=""):
    return f'''  <footer class="footer">
    <div><img src="{prefix}assets/img/belden-logo-transparent.png" alt="Belden Homes Inc logo"><p>Family-owned manufactured, modular, and double-wide home dealer in Harpursville, New York.</p></div>
    <div><h3>Visit</h3><p>1951 NY-7, Harpursville, NY 13787</p><p>Mon–Fri 10:00 AM–3:00 PM<br>Sat 9:00 AM–1:00 PM<br>Call ahead; hours may change with weather.</p></div>
    <div><h3>Contact</h3><p><a href="tel:{PHONE_LINK}">{PHONE}</a><br>After-hours appointments: call/text Dave at <a href="tel:{DAVE_LINK}">607-760-8403</a></p><p><a class="text-link" href="{prefix}contact.html">Schedule a visit →</a></p></div>
  </footer>
  <script src="{prefix}assets/js/site.js"></script>
</body>
</html>'''


def home_card(model, prefix=""):
    page = f"{prefix}homes/{model['slug']}.html"
    img = rel_img(model, prefix)
    return f'''<article class="home-card" data-type="{h(model['homeType'])}" data-status="{h(status(model))}"><a href="{page}"><img src="{h(img)}" alt="{h(title(model))} floor plan"></a><div><span class="tag">Belden {h(model['beldenId'])} • {h(model['cardSize'])} {type_label(model)}</span><h3><a href="{page}">{h(title(model))}</a></h3><p>{h(specs_line(model))}</p><p class="muted">{h(model['series'])} • {h(model['buildingMethod'])}</p><a class="text-link" href="{page}">View model →</a></div></article>'''


def summary(model):
    return (f"Belden {model['beldenId']} is the {model['displayName']} from Cavco Clarion's "
            f"{model['series']} series. It is a {model['numBedrooms']}-bedroom, {fmt_bath(model['numBathrooms'])}-bath "
            f"{type_label(model).lower()} plan with {model['squareFootage']:,} sq. ft. and an exact floor plan dimension of {model['sizeExact']}. "
            f"Belden can help compare this model against the rest of the current six-model lineup and talk through site prep, delivery, and setup needs.")


def detail_page(model):
    pfx = "../"
    photos = model.get("photos") or []
    gallery = ""
    if photos:
        cards = []
        for i, photo in enumerate(photos[:12], 1):
            cards.append(f'''<a class="gallery-card" href="{h(photo['url'])}" target="_blank" rel="noopener"><img src="{h(photo['url'])}" alt="{h(photo.get('alt') or model['displayName'])}"><span>Photo {i}</span></a>''')
        more = f"<p class=\"muted\">Showing 12 of {len(photos)} available Cavco photos. Use the Cavco source link for the full gallery.</p>" if len(photos) > 12 else ""
        gallery = f'''<section class="section"><div class="section-head"><span class="eyebrow">Cavco photos</span><h2>Available listing photos</h2></div><div class="model-gallery">{''.join(cards)}</div>{more}</section>'''
    else:
        gallery = '<section class="section"><div class="note-card"><span class="eyebrow">Cavco photos</span><h2>No extra listing photos posted yet.</h2><p>Cavco currently provides the floor plan drawing for this model. Call Belden for real-time lot status, colors, options, and viewing availability.</p></div></section>'

    feature_items = ''.join(f"<li>{h(x)}</li>" for x in model.get("sellingFeatures", []) if x) or "<li>Floor plan dimensions, beds, baths, square footage, series, and building method verified from the Cavco listing.</li><li>Exact colors, decor packages, pricing, and lot availability should be confirmed directly with Belden.</li>"
    jsonld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": title(model),
        "brand": "Cavco Clarion",
        "model": model["modelNumber"],
        "description": summary(model),
        "image": model["lineDrawingUrl"],
        "url": model["sourceUrl"],
    }
    return head(title(model), summary(model), pfx) + header(pfx) + f'''  <main>
    <section class="model-hero"><div><a class="text-link" href="../inventory.html">← Back to inventory</a><span class="eyebrow">Belden model {h(model['beldenId'])} • {h(model['series'])}</span><h1>{h(title(model))}</h1><p>{h(model['homeType'])} built by Cavco / Cavco Clarion and offered through Belden Homes.</p><div class="stats"><span><b>{h(model['numBedrooms'])}</b> Beds</span><span><b>{h(fmt_bath(model['numBathrooms']))}</b> Baths</span><span><b>{model['squareFootage']:,}</b> Sq. Ft.</span><span><b>{h(model['sizeExact'])}</b> Size</span></div><div class="hero-actions"><a class="btn gold" href="tel:{PHONE_LINK}">Call Belden Homes</a><a class="btn navy" href="../contact.html?model={h(model['slug'])}">Request Info</a><a class="btn light" href="{h(model['sourceUrl'])}" target="_blank" rel="noopener">Cavco source</a></div></div><img src="../{h(model['localImage'])}" alt="{h(model['lineDrawingAlt'] or title(model))}"></section>
    <section class="section model-layout"><div><span class="eyebrow">Overview</span><h2>Plain-English summary</h2><p>{h(summary(model))}</p><p><strong>Current status:</strong> {h(status(model))}.</p><p><strong>Source note:</strong> Specs and media were scraped from the Cavco listing provided for Belden model {h(model['beldenId'])}.</p></div><aside class="spec-card"><h3>Specs</h3><dl><dt>Belden model</dt><dd>{h(model['beldenId'])}</dd><dt>Cavco model</dt><dd>{h(model['displayName'])}</dd><dt>Model number</dt><dd>{h(model['modelNumber'])}</dd><dt>Series</dt><dd>{h(model['series'])}</dd><dt>Building method</dt><dd>{h(model['buildingMethod'])}</dd><dt>Sections</dt><dd>{h(model['sections'])}</dd><dt>Home type</dt><dd>{h(model['homeType'])}</dd><dt>Exact dimensions</dt><dd>{h(model['sizeExact'])}</dd><dt>Source</dt><dd><a href="{h(model['sourceUrl'])}" target="_blank" rel="noopener">Cavco listing</a></dd></dl></aside></section>
    <section class="section"><div class="section-head"><span class="eyebrow">Listing data</span><h2>Facts scraped from Cavco</h2></div><div class="fact-grid"><div><strong>Belden ID</strong><span>{h(model['beldenId'])}</span></div><div><strong>Bedrooms</strong><span>{h(model['numBedrooms'])}</span></div><div><strong>Bathrooms</strong><span>{h(fmt_bath(model['numBathrooms']))}</span></div><div><strong>Square feet</strong><span>{model['squareFootage']:,}</span></div><div><strong>Width</strong><span>{h(model['widthFeet'])}'-{h(model['widthInches'])}"</span></div><div><strong>Length</strong><span>{h(model['lengthFeet'])}'-{h(model['lengthInches'])}"</span></div><div><strong>Asset ID</strong><span>{h(model['assetId'])}</span></div><div><strong>Series asset ID</strong><span>{h(model['seriesAssetId'])}</span></div></div></section>
    <section class="section"><div class="section-head"><span class="eyebrow">Features / notes</span><h2>What the listing includes</h2></div><ul class="feature-bullets">{feature_items}</ul></section>
    {gallery}
    <section class="cta-band"><div><span class="eyebrow">Ask about Belden {h(model['beldenId'])}</span><h2>Want this plan priced and compared?</h2><p>Call Belden with the Belden model number and Cavco model name. They can confirm availability, options, delivery timing, and setup scope.</p></div><div class="cta-actions"><a class="btn gold" href="tel:{PHONE_LINK}">Call {PHONE}</a><a class="btn light" href="../contact.html?model={h(model['slug'])}">Request info</a></div></section>
  </main>
  <script type="application/ld+json">{json.dumps(jsonld)}</script>
''' + footer(pfx)


def inventory_page():
    cards = ''.join(home_card(m) for m in DATA)
    return head("Current Inventory", "The six confirmed Belden Homes models with verified Cavco listing data.") + header() + f'''  <main><section class="page-hero"><span class="eyebrow">Current Inventory</span><h1>The six confirmed Belden home models</h1><p>These are the only models currently listed for Belden Homes. Specs and media were pulled from the Cavco listings Justin confirmed. Availability, colors, pricing, and delivery timing can change — call Belden to confirm the latest status.</p></section><section class="section filters"><button data-filter="all" class="active">All 6</button><button data-filter="Single Wide">Single Wide</button><button data-filter="Double Wide">Double Wide</button><button data-filter="Astro Creations">Astro Creations</button><button data-filter="Blazer Select">Blazer Select</button></section><section class="section card-grid inventory-grid">{cards}</section><section class="section note-card"><span class="eyebrow">Inventory note</span><h2>Confirmed model list</h2><p>The site now lists exactly these Belden model IDs: 62412, 62472, 15440, 62330, 16040, and 16202. Older placeholder inventory has been removed from the listing.</p></section></main>
''' + footer()


def index_page():
    cards = ''.join(home_card(m) for m in DATA)
    return head("Home", "Belden Homes Inc. manufactured, modular, and double wide homes in Harpursville, NY.") + header() + f'''  <main><section class="hero"><div class="hero-copy"><span class="eyebrow">Harpursville, New York • Family-owned • Since 1973</span><h1>Quality homes, local guidance, complete setup support.</h1><p>Belden Homes helps families across the Southern Tier compare factory-built homes, understand site needs, and move from first visit to final setup with a local team.</p><div class="hero-actions"><a class="btn gold" href="inventory.html">View the 6 Current Models</a><a class="btn navy" href="tel:{PHONE_LINK}">Call {PHONE}</a></div><div class="trust-row"><span>50+ years of experience</span><span>Turnkey setup guidance</span><span>Cavco / Cavco Clarion dealer</span></div></div><div class="hero-card"><img src="assets/img/belden-logo-transparent.png" alt="Belden Homes badge logo"><h2>More than a home dealer.</h2><p>For eligible customers, Belden can help coordinate foundation, driveway, well, septic, electric, delivery, installation, and finish work.</p></div></section>
<section class="section intro-grid"><div><span class="eyebrow">What Belden does</span><h2>A simpler way to buy a factory-built home.</h2><p>Buying a home can feel overwhelming. Belden helps you narrow the choices, understand the site work, and keep the process moving from floor plan to setup.</p></div><div class="feature-list"><div><strong>Manufactured & single wide homes</strong><span>Efficient HUD-code homes with practical layouts.</span></div><div><strong>Double wide homes</strong><span>More space, two-section delivery, foundation or slab options.</span></div><div><strong>Modular homes</strong><span>Factory-built sections assembled on-site to applicable building codes.</span></div><div><strong>Turnkey setup</strong><span>Site prep, foundation, utilities, driveway, septic, well, and finishing support when available.</span></div></div></section>
<section class="section"><div class="section-head"><span class="eyebrow">Confirmed models</span><h2>The current six-model lineup.</h2><a class="text-link" href="inventory.html">See inventory →</a></div><div class="card-grid inventory-preview six-model-preview">{cards}</div></section>
<section class="split section"><div><span class="eyebrow">Design before you decide</span><h2>Try interior and exterior visualizers.</h2><p>Explore finishes and exterior combinations with Cavco Clarion visualizer tools, then call Belden to talk through what’s realistic for your home and order.</p><a class="btn navy" href="design-visualizers.html">Open visualizers</a></div><div class="note-card"><h3>Service area</h3><p>Belden serves roughly a 50-mile radius around Harpursville, including Broome, Chenango, Delaware, and Otsego Counties. Call to confirm whether your land is inside the setup area.</p></div></section><section class="cta-band"><div><span class="eyebrow">Ready to talk?</span><h2>Call Belden before you get buried in floor plans.</h2><p>We’ll help you compare models, understand setup needs, and confirm what is actually available.</p></div><div class="cta-actions"><a class="btn gold" href="tel:{PHONE_LINK}">Call {PHONE}</a><a class="btn light" href="contact.html">Schedule a Visit</a></div></section></main>
''' + footer()


def sitemap():
    pages = ["index.html", "inventory.html", "services.html", "buying-process.html", "design-visualizers.html", "about.html", "faq.html", "contact.html"]
    pages += [f"homes/{m['slug']}.html" for m in DATA]
    return "\n".join(pages) + "\n"


def main():
    HOMES.mkdir(exist_ok=True)
    for old in HOMES.glob("*.html"):
        old.unlink()
    (ROOT / "index.html").write_text(index_page(), encoding="utf-8")
    (ROOT / "inventory.html").write_text(inventory_page(), encoding="utf-8")
    for m in DATA:
        (HOMES / f"{m['slug']}.html").write_text(detail_page(m), encoding="utf-8")
    (ROOT / "sitemap.txt").write_text(sitemap(), encoding="utf-8")
    state_path = ROOT / "state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    state.update({
        "project": "Belden Homes site preview",
        "lastChangedAt": datetime.now(timezone.utc).isoformat(),
        "lastFeature": "Updated inventory to the 6 confirmed Belden models with Cavco-scraped data",
        "confirmedModelIds": [m["beldenId"] for m in DATA],
        "blockers": [],
        "nextRecommendedImprovement": "Have Belden verify pricing/status/photos before production deployment."
    })
    state_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
    print(f"Rendered {len(DATA)} model pages and inventory/home listings")

if __name__ == "__main__":
    main()
