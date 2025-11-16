// main.clean.js - consolidated, validated main script
/* Navigation, forms, donation modal (Naria placeholder), gallery, announcements, hero slider */

/* NAV */
function toggleNav(open) {
    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    if (!links || !toggle) return;
    if (typeof open === 'boolean') {
        links.classList.toggle('active', open);
        toggle.setAttribute('aria-expanded', String(open));
        return;
    }
    const isOpen = links.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.nav-toggle');
    if (btn) { e.preventDefault(); toggleNav(); return; }
    if (e.target.matches && e.target.matches('#navLinks a')) toggleNav(false);
});

/* Simple form handlers */
function handleSubmit(e) { e.preventDefault(); alert('Thanks — we will respond soon.'); e.target.reset(); }
function handlePrayerRequest(e) { e.preventDefault(); alert('Prayer request received.'); e.target.reset(); }
function handleNewsletterSignup(e) { e.preventDefault(); alert('Subscribed — thank you!'); e.target.reset(); }

/* Donation modal (client-only hosted-checkout placeholder) */
function showDonationModal() {
    let modal = document.getElementById('donationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'donationModal';
        modal.className = 'modal donation-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', 'Donation dialog');
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal" aria-label="Close donation dialog">&times;</button>
                <h2 id="donationTitle">Support Our Ministry</h2>
                <p id="donationDescription">Choose an amount and frequency to support our work. You will be redirected to a secure hosted checkout to complete the payment.</p>
                <div class="donation-options" role="list" aria-labelledby="donationTitle">
                    <button class="donation-amount" data-amount="10" type="button">$10</button>
                    <button class="donation-amount" data-amount="25" type="button">$25</button>
                    <button class="donation-amount" data-amount="50" type="button">$50</button>
                    <button class="donation-amount" data-amount="100" type="button">$100</button>
                    <button class="donation-amount custom" data-amount="custom" type="button">Custom</button>
                </div>
                <div class="custom-amount-input" style="display:none;">
                    <label for="customAmount">Custom Amount</label>
                    <input id="customAmount" type="number" min="1" step="1" />
                </div>
                <fieldset>
                    <legend>Frequency</nobr></legend>
                    <label><input type="radio" name="frequency" value="one-time" checked /> One-time</label>
                    <label><input type="radio" name="frequency" value="monthly" /> Monthly</label>
                </fieldset>
                <div class="donation-actions"><button id="proceedToNaria" class="submit-btn">Proceed to Checkout</button></div>
                <div class="donation-confirm-overlay" style="display:none;"></div>
            </div>`;
        document.body.appendChild(modal);

        // wiring
        const close = modal.querySelector('.close-modal');
        close.addEventListener('click', () => modal.classList.remove('active'));
        const amountBtns = modal.querySelectorAll('.donation-amount');
        const customWrapper = modal.querySelector('.custom-amount-input');
        const customInput = modal.querySelector('#customAmount');
        amountBtns.forEach(b => b.addEventListener('click', () => {
            amountBtns.forEach(x => x.classList.remove('selected'));
            b.classList.add('selected');
            if (b.classList.contains('custom')) customWrapper.style.display = 'block'; else customWrapper.style.display = 'none';
        }));
        modal.querySelector('#proceedToNaria').addEventListener('click', () => {
            const selected = modal.querySelector('.donation-amount.selected');
            if (!selected) { alert('Please choose an amount.'); return; }
            let amt = selected.dataset.amount === 'custom' ? parseFloat(customInput.value) : parseFloat(selected.dataset.amount);
            if (!amt || amt <= 0) { alert('Enter a valid amount.'); return; }
            const frequency = modal.querySelector('input[name="frequency"]:checked').value;
            const MERCHANT = ''; // TODO: set merchant id
            if (!MERCHANT) { alert('Checkout not configured.'); return; }
            const url = `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT)}&amount=${amt.toFixed(2)}&currency=USD&frequency=${encodeURIComponent(frequency)}&returnUrl=${encodeURIComponent(window.location.href)}`;
            window.location.href = url;
        });
    }
    modal.classList.add('active');
}

/* Photo gallery */
class PhotoGallery { constructor(){ this.init(); } init(){ const items = document.querySelectorAll('.gallery-item'); const modal = document.querySelector('.modal'); if(!items.length||!modal) return; items.forEach(it=> it.addEventListener('click', ()=>{ const img=it.querySelector('img'); if(!img) return; let content=modal.querySelector('.modal-content'); if(!content){ modal.innerHTML='<div class="modal-content"><button class="close-modal">&times;</button><img src="" alt=""/></div>'; content=modal.querySelector('.modal-content'); } content.querySelector('img').src=img.src; modal.classList.add('active'); modal.querySelector('.close-modal').addEventListener('click', ()=> modal.classList.remove('active')); })); }}

/* Announcements */
const announcements=[{title:'Sunday Service',date:'Every Sunday at 10:00 AM',description:'Join us for worship'},{title:'Bible Study',date:'Wednesdays 7:00 PM',description:'Midweek study'}];
function populateAnnouncements(){ const list=document.getElementById('announcementList'); if(!list) return; announcements.forEach(a=>{ const d=document.createElement('div'); d.className='announcement'; d.innerHTML=`<h3>${a.title}</h3><p class="date">${a.date}</p><p>${a.description}</p>`; list.appendChild(d); }); }

/* Hero slider */
function initHeroSlider(){ const slider=document.querySelector('.hero-slider'); if(!slider) return; const slides=Array.from(slider.querySelectorAll('.slide')); const prev=slider.querySelector('.slider-control.prev'); const next=slider.querySelector('.slider-control.next'); let current=0, iv=null; const delay=5000; const dotsContainer = slider.querySelector('.slider-dots') || (function(){ const d=document.createElement('div'); d.className='slider-dots'; slider.appendChild(d); return d; })(); slides.forEach((s,i)=>{ const b=document.createElement('button'); b.type='button'; b.setAttribute('aria-label',`Go to slide ${i+1}`); b.addEventListener('click',()=>goTo(i)); dotsContainer.appendChild(b); }); const dots=Array.from(dotsContainer.querySelectorAll('button')); function update(){ slides.forEach((s,i)=>{ const active=i===current; s.classList.toggle('active',active); s.setAttribute('aria-hidden', String(!active)); if(dots[i]) dots[i].classList.toggle('active',active); }); } function goTo(i){ current=(i+slides.length)%slides.length; update(); reset(); } function nextSlide(){ goTo(current+1);} function prevSlide(){ goTo(current-1);} function start(){ if(iv) return; iv=setInterval(nextSlide,delay);} function stop(){ if(!iv) return; clearInterval(iv); iv=null;} function reset(){ stop(); start(); } if(next) next.addEventListener('click', nextSlide); if(prev) prev.addEventListener('click', prevSlide); slider.addEventListener('mouseenter', stop); slider.addEventListener('mouseleave', start); slider.addEventListener('focusin', stop); slider.addEventListener('focusout', start); document.addEventListener('keydown', e=>{ if(e.key==='ArrowLeft') prevSlide(); if(e.key==='ArrowRight') nextSlide(); }); update(); start(); }

if(document.readyState!=='loading') initHeroSlider(); else document.addEventListener('DOMContentLoaded', initHeroSlider);

/* Giving helpers */
(function(){ const MERCHANT=''; const amounts=document.querySelectorAll('.amount-btn'); const custom=document.getElementById('customAmount'); const form=document.getElementById('donationForm'); const confirm=document.getElementById('donationConfirmation'); const payBtn=document.getElementById('payWithCard'); let selected=null; if(amounts&&custom){ amounts.forEach(b=>b.addEventListener('click', ()=>{ amounts.forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); selected=b.dataset.amount; custom.value=''; })); custom.addEventListener('input', ()=>{ amounts.forEach(x=>x.classList.remove('selected')); selected=custom.value; }); } if(form) form.addEventListener('submit', e=>{ e.preventDefault(); const name=document.getElementById('donorName')?.value.trim(); const email=document.getElementById('donorEmail')?.value.trim(); const purpose=document.getElementById('donationPurpose')?.value||''; const frequency=form.querySelector('input[name="frequency"]:checked')?.value||'one-time'; const cover=document.getElementById('coverFees')?.checked||false; const amount=parseFloat(selected); if(!amount||amount<=0){ alert('Please enter a valid donation amount.'); return; } if(MERCHANT){ const returnUrl=encodeURIComponent(window.location.href); const meta=encodeURIComponent(JSON.stringify({name,email,purpose,cover})); const url=`https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT)}&amount=${encodeURIComponent(amount.toFixed(2))}&currency=${encodeURIComponent('NGN')}&frequency=${encodeURIComponent(frequency)}&metadata=${meta}&returnUrl=${returnUrl}`; window.location.href=url; return; } if(confirm){ confirm.hidden=false; form.hidden=true; } }); if(window.QRious && document.getElementById('qrCode')) new QRious({ element: document.getElementById('qrCode'), value: MERCHANT?`https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT)}`:window.location.href, size:160 }); const calc=document.getElementById('calculateTithe'); const income=document.getElementById('incomeAmount'); const titheResult=document.getElementById('titheResult'); if(calc) calc.addEventListener('click', ()=>{ const inc=parseFloat(income?.value); if(inc&&inc>0){ const t=inc*0.1; titheResult.textContent=`Your tithe amount: ₦${t.toFixed(2)}`; selected=t.toFixed(2); amounts.forEach(b=>b.classList.remove('selected')); if(custom) custom.value=t.toFixed(2); } else titheResult.textContent='Please enter a valid income amount.'; }); if(!MERCHANT && payBtn) payBtn?.setAttribute('title','Payments will show instructions until a provider is configured.'); })();

/* Init */
document.addEventListener('DOMContentLoaded', ()=>{ populateAnnouncements(); new PhotoGallery(); document.querySelectorAll('.donate-btn').forEach(b=>b.addEventListener('click', e=>{ e.preventDefault(); showDonationModal(); })); });
