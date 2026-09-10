// Homepage composition; business details and model cards share the site's sources.
export function renderHomepage({models, hours, card, image}) {
  const interior = models.find(m => m.slug === 'hogancamp').photos.find(p => p.src.endsWith('img_5217.webp'));
  const office = models.find(m => m.slug === 'office').photos[0];
  const homes = ['shifty', 'greater-ops', 'ramsey'].map(slug => models.find(m => m.slug === slug));
  return `
<section class="home-hero" aria-labelledby="welcome-heading">
  <div class="container home-hero-layout">
    <div class="welcome-copy">
      <p class="eyebrow">Family-owned in Harpursville, NY</p>
      <h1 id="welcome-heading">Manufactured &amp; Modular Home Dealer <span>Since 1973</span></h1>
      <p class="lead">Serving homeowners throughout Upstate New York and northeastern Pennsylvania.</p>
      <p>Come in, look around, and ask questions. We’ll help you compare homes and understand what it takes to get one set up on your land.</p>
      <div class="hero-actions">
        <a class="btn primary" href="inventory.html">Explore our homes</a>
        <a class="text-link" href="contact.html">Plan a visit <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <figure class="welcome-photo">
      <img src="${interior.src}" srcset="${interior.src.replace('.webp', '-small.webp')} 640w, ${interior.src} 1200w" sizes="(max-width: 800px) calc(100vw - 48px), (max-width: 1300px) 48vw, 590px" width="${interior.width}" height="${interior.height}" alt="Furnished living room in a Belden display home, with wood ceiling beams and a fireplace" fetchpriority="high" decoding="async">
      <figcaption>Step inside a Belden display home.</figcaption>
    </figure>
  </div>
</section>
<div class="home-assurance">
  <ul class="container assurance-list" aria-label="A few things to know about Belden">
    <li><strong>More than 50 years</strong><span>Of experience serving local homeowners</span></li>
    <li><strong>Seven homes to tour</strong><span>At our Harpursville sales center</span></li>
    <li><strong>Home &amp; site experience</strong><span>Help with selection, delivery, and setup</span></li>
  </ul>
</div>
<section class="section home-models" aria-labelledby="home-models-heading">
  <div class="container">
    <div class="section-head">
      <div><p class="eyebrow">Homes &amp; floorplans</p><h2 id="home-models-heading">Find a layout that fits.</h2><p>Compare the space, then see it in person.</p></div>
      <a class="text-link" href="inventory.html">View all 8 models <span aria-hidden="true">→</span></a>
    </div>
    <div class="card-grid">${homes.map(m => card(m)).join('')}</div>
  </div>
</section>
<section class="section home-story" aria-labelledby="home-story-heading">
  <div class="container story-layout">
    <figure class="story-photo">${image({...office, alt:'Belden Homes sales center on Route 7 in Harpursville'})}<figcaption>Our sales center on Route 7 in Harpursville.</figcaption></figure>
    <div class="story-copy">
      <p class="eyebrow">A family business since 1973</p>
      <h2 id="home-story-heading">Local experience.<br> Personal attention.</h2>
      <p>Belden Homes has been here in Harpursville from the beginning. For more than 50 years, we’ve helped local customers choose a home and work through the details of getting it in place.</p>
      <p>That includes more than the home itself. We can coordinate site preparation, foundations, utilities, delivery, installation, and finish work in our service area.</p>
      <p class="story-invitation">Bring your property address and your questions. We’ll talk through the next steps together.</p>
      <div class="story-links"><a class="text-link" href="about.html">About our family business <span aria-hidden="true">→</span></a><a class="text-link" href="services.html">Setup services <span aria-hidden="true">→</span></a></div>
    </div>
  </div>
</section>
<section class="home-visit" aria-labelledby="home-visit-heading">
  <div class="container visit-panel">
    <div class="visit-copy">
      <p class="eyebrow">You’re welcome at Belden Homes</p>
      <h2 id="home-visit-heading">Come walk through our homes in Harpursville.</h2>
      <p>Take your time in the homes, compare the rooms, and talk with us about your plans. Seven models are available onsite; call to arrange an offsite tour of Camp.</p>
      <div class="hero-actions"><a class="btn visit-button" href="contact.html#directions">Plan your visit</a><a class="visit-phone" href="tel:16076931364">607-693-1364</a></div>
    </div>
    <div class="visit-hours"><h3>Stop by our sales center</h3><address>1951 NY-7<br>Harpursville, NY 13787</address>${hours}<p>For an after-hours appointment, call or text Dave at <a href="tel:16077608403">607-760-8403</a>.</p></div>
  </div>
</section>`;
}
