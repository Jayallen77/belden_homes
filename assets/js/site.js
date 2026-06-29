
document.querySelector('.menu-toggle')?.addEventListener('click',()=>document.querySelector('.site-header')?.classList.toggle('open'));
document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('.home-card').forEach(card=>{const txt=(card.innerText+' '+card.dataset.type+' '+card.dataset.status).toLowerCase();card.style.display=(f==='all'||txt.includes(f.toLowerCase()))?'block':'none';});}));
