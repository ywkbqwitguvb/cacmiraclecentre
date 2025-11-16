// Main JS for CAC Miracle Centres site
// Consolidated: navigation, forms, donation modal (Naria), gallery, announcements, hero slider

/* ===================== Navigation Toggle ===================== */
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

// Direct binding and delegated fallback for nav toggling
document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.nav-toggle');
    if (btn) {
        e.preventDefault();
        toggleNav();
        return;
    }
    if (e.target.matches && e.target.matches('#navLinks a')) {
        toggleNav(false);
    }
});

/* ===================== Simple Form Handlers ===================== */
function handleSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}
function handlePrayerRequest(event) {
    event.preventDefault();
    alert('Thank you for sharing your prayer request. Our prayer team will be praying for you.');
    event.target.reset();
}
function handleNewsletterSignup(event) {
    event.preventDefault();
    alert('Thank you for subscribing to our newsletter!');
    event.target.reset();
}

/* ===================== Donation Modal (Hosted Checkout placeholder) ===================== */
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
                    <button class="donation-amount" role="button" tabindex="0" aria-pressed="false" data-amount="10">$10</button>
                    <button class="donation-amount" role="button" tabindex="0" aria-pressed="false" data-amount="25">$25</button>
                    <button class="donation-amount" role="button" tabindex="0" aria-pressed="false" data-amount="50">$50</button>
                    <button class="donation-amount" role="button" tabindex="0" aria-pressed="false" data-amount="100">$100</button>
                    <button class="donation-amount custom" role="button" tabindex="0" aria-pressed="false" data-amount="custom">Custom Amount</button>
                </div>
                <div class="custom-amount-input" style="display: none;">
                    <label for="customAmount">Custom Amount (USD)</label>
                    <input type="number" id="customAmount" placeholder="Enter amount" min="1" step="1" inputmode="numeric" aria-label="Custom donation amount">
                </div>
                <fieldset class="donation-frequency" aria-label="Donation frequency">
                    <legend>Donation Frequency</legend>
                    <label><input type="radio" name="frequency" value="one-time" checked> One-time</label>
                    <label><input type="radio" name="frequency" value="monthly"> Monthly</label>
                </fieldset>
                <div class="donation-actions">
                    <button id="proceedToNaria" class="submit-btn">Proceed to Checkout</button>
                </div>
                <div class="donation-confirm-overlay" style="display:none;" aria-live="polite"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // event wiring
        modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));

        const donationAmounts = modal.querySelectorAll('.donation-amount');
        const customWrapper = modal.querySelector('.custom-amount-input');
        const customInput = modal.querySelector('#customAmount');

        function selectAmount(btn) {
            donationAmounts.forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('selected'); btn.setAttribute('aria-pressed', 'true');
            if (btn.dataset.amount === 'custom') { customWrapper.style.display = 'block'; customInput.focus(); }
            else { customWrapper.style.display = 'none'; }
        }

        donationAmounts.forEach(btn => {
            btn.addEventListener('click', () => selectAmount(btn));
            btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectAmount(btn); } });
        });

        const proceed = modal.querySelector('#proceedToNaria');
        const confirmOverlay = modal.querySelector('.donation-confirm-overlay');

        proceed.addEventListener('click', () => {
            const selected = modal.querySelector('.donation-amount.selected');
            if (!selected) { alert('Please select or enter a donation amount.'); return; }
            let amount = selected.dataset.amount === 'custom' ? customInput.value : selected.dataset.amount;
            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0) { alert('Please enter a valid donation amount greater than $0.'); customInput.focus(); return; }
            const frequency = modal.querySelector('input[name="frequency"]:checked').value;

            confirmOverlay.innerHTML = `
                <div class="confirm-panel" role="alertdialog" aria-labelledby="confirmTitle" aria-describedby="confirmDesc">
                    <h3 id="confirmTitle">Confirm Donation</h3>
                    <p id="confirmDesc">You are about to be redirected to a secure hosted checkout to complete a ${frequency === 'monthly' ? 'monthly' : 'one-time'} donation of <strong>$${amount.toFixed(2)}</strong>.</p>
                    <div class="confirm-actions">
                        <button id="confirmProceed" class="submit-btn">Continue to Checkout</button>
                        <button id="confirmCancel" class="secondary-btn">Cancel</button>
                    </div>
                </div>
            `;
            confirmOverlay.style.display = 'block';
            const confirmProceed = modal.querySelector('#confirmProceed');
            const confirmCancel = modal.querySelector('#confirmCancel');
            confirmProceed.focus();
            confirmCancel.addEventListener('click', () => confirmOverlay.style.display = 'none');

            confirmProceed.addEventListener('click', () => {
                const NARIA_MERCHANT_ID = ''; // TODO: set merchant id
                if (!NARIA_MERCHANT_ID) { alert('Donation checkout is not configured. Please contact the site administrator.'); return; }
                const merchant = encodeURIComponent(NARIA_MERCHANT_ID);
                const returnUrl = encodeURIComponent(window.location.href);
                const checkoutUrl = `https://checkout.naria.org/checkout?merchant=${merchant}&amount=${amount.toFixed(2)}&currency=USD&frequency=${encodeURIComponent(frequency)}&returnUrl=${returnUrl}`;
                window.location.href = checkoutUrl;
            });
        });
    }
    modal.classList.add('active');
}

/* ===================== Photo Gallery Class ===================== */
class PhotoGallery {
    constructor() { this.initializeGallery(); }
    initializeGallery() {
        const items = document.querySelectorAll('.gallery-item');
        const modal = document.querySelector('.modal');
        if (!items.length || !modal) return;
        items.forEach(i => i.addEventListener('click', () => {
            const img = i.querySelector('img');
            if (!img) return;
            let content = modal.querySelector('.modal-content');
            if (!content) { modal.innerHTML = '<div class="modal-content"><button class="close-modal">&times;</button><img src="" alt=""/></div>'; content = modal.querySelector('.modal-content'); }
            content.querySelector('img').src = img.src;
            modal.classList.add('active');
            modal.querySelector('.close-modal').addEventListener('click', () => modal.classList.remove('active'));
        }));
    }
}

/* ===================== Announcements ===================== */
const announcements = [
    { title: 'Sunday Service', date: 'Every Sunday at 10:00 AM', description: 'Join us for worship and fellowship' },
    { title: 'Bible Study', date: 'Every Wednesday at 7:00 PM', description: 'Deep dive into Scripture' }
];
function populateAnnouncements() {
    const list = document.getElementById('announcementList');
    if (!list) return;
    announcements.forEach(a => {
        const d = document.createElement('div'); d.className = 'announcement';
        d.innerHTML = `<h3>${a.title}</h3><p class="date">${a.date}</p><p>${a.description}</p>`;
        list.appendChild(d);
    });
}

/* ===================== Hero Slider ===================== */
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.slide'));
    const prevBtn = slider.querySelector('.slider-control.prev');
    const nextBtn = slider.querySelector('.slider-control.next');
    const dotsContainer = slider.querySelector('.slider-dots');
    let current = 0, interval = null;
    const delay = 5000;

    // create dots container if missing
    if (!dotsContainer) {
        const dc = document.createElement('div'); dc.className = 'slider-dots'; slider.appendChild(dc);
    }

    slides.forEach((s, i) => {
        const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('aria-label', `Go to slide ${i+1}`);
        btn.addEventListener('click', () => goTo(i)); slider.querySelector('.slider-dots').appendChild(btn);
    });
    const dots = Array.from(slider.querySelectorAll('.slider-dots button'));

    function update() {
        slides.forEach((s, i) => { const active = i === current; s.classList.toggle('active', active); s.setAttribute('aria-hidden', active ? 'false' : 'true'); if (dots[i]) dots[i].classList.toggle('active', active); });
    }
    function goTo(i) { current = (i + slides.length) % slides.length; update(); reset(); }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function start() { if (interval) return; interval = setInterval(next, delay); }
    function stop() { if (!interval) return; clearInterval(interval); interval = null; }
    function reset() { stop(); start(); }

    if (nextBtn) nextBtn.addEventListener('click', next); if (prevBtn) prevBtn.addEventListener('click', prev);
    slider.addEventListener('mouseenter', stop); slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop); slider.addEventListener('focusout', start);
    document.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); });

    update(); start();
}

// Init hero slider when DOM is ready. If script is loaded after DOM is ready, start immediately.
if (document.readyState !== 'loading') {
    initHeroSlider();
} else {
    document.addEventListener('DOMContentLoaded', initHeroSlider);
}

/* ===================== Giving Page Helpers (QR, Tithe) ===================== */
(function(){
    const MERCHANT_ID = '';
    const CURRENCY = 'NGN';
    const amounts = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('customAmount');
    const donationForm = document.getElementById('donationForm');
    const confirmation = document.getElementById('donationConfirmation');
    const payBtn = document.getElementById('payWithCard');
    let selectedAmount = null;
    if (amounts && customAmount) {
        amounts.forEach(btn => btn.addEventListener('click', () => { amounts.forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selectedAmount = btn.dataset.amount; customAmount.value = ''; }));
        customAmount.addEventListener('input', () => { amounts.forEach(b => b.classList.remove('selected')); selectedAmount = customAmount.value; });
    }
    if (donationForm) donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('donorName')?.value.trim();
        const email = document.getElementById('donorEmail')?.value.trim();
        const purpose = document.getElementById('donationPurpose')?.value || '';
        const frequency = donationForm.querySelector('input[name="frequency"]:checked')?.value || 'one-time';
        const coverFees = document.getElementById('coverFees')?.checked || false;
        const amount = parseFloat(selectedAmount);
        if (!amount || amount <= 0) { alert('Please enter a valid donation amount.'); return; }
        if (MERCHANT_ID) {
            const returnUrl = encodeURIComponent(window.location.href);
            const meta = encodeURIComponent(JSON.stringify({ name, email, purpose, coverFees }));
            const nariaUrl = `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}&amount=${encodeURIComponent(amount.toFixed(2))}&currency=${encodeURIComponent(CURRENCY)}&frequency=${encodeURIComponent(frequency)}&metadata=${meta}&returnUrl=${returnUrl}`;
            window.location.href = nariaUrl; return;
        }
        if (confirmation) { confirmation.hidden = false; donationForm.hidden = true; }
    });
    const qrTarget = MERCHANT_ID ? `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}` : window.location.href;
    if (window.QRious && document.getElementById('qrCode')) new QRious({ element: document.getElementById('qrCode'), value: qrTarget, size: 160 });
    const calculateTitheBtn = document.getElementById('calculateTithe');
    const incomeAmount = document.getElementById('incomeAmount');
    const titheResult = document.getElementById('titheResult');
    if (calculateTitheBtn) calculateTitheBtn.addEventListener('click', () => {
        const income = parseFloat(incomeAmount?.value);
        if (income && income > 0) { const tithe = income * 0.1; titheResult.textContent = `Your tithe amount: ₦${tithe.toFixed(2)}`; selectedAmount = tithe.toFixed(2); amounts.forEach(b => b.classList.remove('selected')); if (customAmount) customAmount.value = tithe.toFixed(2); }
        else { titheResult.textContent = 'Please enter a valid income amount.'; }
    });
    if (!MERCHANT_ID && payBtn) payBtn?.setAttribute('title', 'Online payments will show instructions until a provider is configured.');
})();

/* ===================== Init on DOM ready ===================== */
document.addEventListener('DOMContentLoaded', () => {
    populateAnnouncements();
    new PhotoGallery();
    // wire donate button if present
    document.querySelectorAll('.donate-btn').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); showDonationModal(); }));
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

    const MERCHANT_ID = '';

    // Hero slider initialization
    function initHeroSlider() {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;
        const slides = Array.from(slider.querySelectorAll('.slide'));
        const prevBtn = slider.querySelector('.slider-control.prev');
        const nextBtn = slider.querySelector('.slider-control.next');
        const dotsContainer = slider.querySelector('.slider-dots');
        let current = 0;
        let interval = null;
        const delay = 5000; // 5s

        // create dots
        slides.forEach((s, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.setAttribute('aria-label', `Go to slide ${i+1}`);
            btn.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(btn);
        });

        const dots = Array.from(dotsContainer.querySelectorAll('button'));

        function update() {
            slides.forEach((s, i) => {
                const active = i === current;
                s.classList.toggle('active', active);
                s.setAttribute('aria-hidden', active ? 'false' : 'true');
                if (dots[i]) dots[i].classList.toggle('active', active);
            });
        }

        function goTo(i) {
            current = (i + slides.length) % slides.length;
            update();
            resetInterval();
        }

        function next() { goTo(current + 1); }
        function prev() { goTo(current - 1); }

        function startInterval() {
            if (interval) return;
            interval = setInterval(next, delay);
        }

        function stopInterval() {
            if (!interval) return;
            clearInterval(interval);
            interval = null;
        }

        function resetInterval() {
            stopInterval();
            startInterval();
        }

        // attach controls
        if (nextBtn) nextBtn.addEventListener('click', next);
        if (prevBtn) prevBtn.addEventListener('click', prev);

        // pause on hover / focus
        slider.addEventListener('mouseenter', stopInterval);
        slider.addEventListener('mouseleave', startInterval);
        slider.addEventListener('focusin', stopInterval);
        slider.addEventListener('focusout', startInterval);

        // keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });

        // init
        update();
        startInterval();
    }

    // Init hero slider when DOM is ready. If script is loaded after DOM is ready, start immediately.
    if (document.readyState !== 'loading') {
        initHeroSlider();
    } else {
        document.addEventListener('DOMContentLoaded', initHeroSlider);
    }

    /* ===================== Giving Page Helpers (QR, Tithe) ===================== */
    (function(){
        const MERCHANT_ID = '';
        const CURRENCY = 'NGN';
        const amounts = document.querySelectorAll('.amount-btn');
        const customAmount = document.getElementById('customAmount');
        const donationForm = document.getElementById('donationForm');
        const confirmation = document.getElementById('donationConfirmation');
        const payBtn = document.getElementById('payWithCard');
        let selectedAmount = null;
        if (amounts && customAmount) {
            amounts.forEach(btn => btn.addEventListener('click', () => { amounts.forEach(b => b.classList.remove('selected')); btn.classList.add('selected'); selectedAmount = btn.dataset.amount; customAmount.value = ''; }));
            customAmount.addEventListener('input', () => { amounts.forEach(b => b.classList.remove('selected')); selectedAmount = customAmount.value; });
        }
        if (donationForm) donationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('donorName')?.value.trim();
            const email = document.getElementById('donorEmail')?.value.trim();
            const purpose = document.getElementById('donationPurpose')?.value || '';
            const frequency = donationForm.querySelector('input[name="frequency"]:checked')?.value || 'one-time';
            const coverFees = document.getElementById('coverFees')?.checked || false;
            const amount = parseFloat(selectedAmount);
            if (!amount || amount <= 0) { alert('Please enter a valid donation amount.'); return; }
            if (MERCHANT_ID) {
                const returnUrl = encodeURIComponent(window.location.href);
                const meta = encodeURIComponent(JSON.stringify({ name, email, purpose, coverFees }));
                const nariaUrl = `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}&amount=${encodeURIComponent(amount.toFixed(2))}&currency=${encodeURIComponent(CURRENCY)}&frequency=${encodeURIComponent(frequency)}&metadata=${meta}&returnUrl=${returnUrl}`;
                window.location.href = nariaUrl; return;
            }
            if (confirmation) { confirmation.hidden = false; donationForm.hidden = true; }
        });
        const qrTarget = MERCHANT_ID ? `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}` : window.location.href;
        if (window.QRious && document.getElementById('qrCode')) new QRious({ element: document.getElementById('qrCode'), value: qrTarget, size: 160 });
        const calculateTitheBtn = document.getElementById('calculateTithe');
        const incomeAmount = document.getElementById('incomeAmount');
        const titheResult = document.getElementById('titheResult');
        if (calculateTitheBtn) calculateTitheBtn.addEventListener('click', () => {
            const income = parseFloat(incomeAmount?.value);
            if (income && income > 0) { const tithe = income * 0.1; titheResult.textContent = `Your tithe amount: ₦${tithe.toFixed(2)}`; selectedAmount = tithe.toFixed(2); amounts.forEach(b => b.classList.remove('selected')); if (customAmount) customAmount.value = tithe.toFixed(2); }
            else { titheResult.textContent = 'Please enter a valid income amount.'; }
        });
        if (!MERCHANT_ID && payBtn) payBtn?.setAttribute('title', 'Online payments will show instructions until a provider is configured.');
    })();

    /* ===================== Init on DOM ready ===================== */
    document.addEventListener('DOMContentLoaded', () => {
        populateAnnouncements();
        new PhotoGallery();
        // wire donate button if present
        document.querySelectorAll('.donate-btn').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); showDonationModal(); }));
    });
            btn.addEventListener('click', () => selectAmount(btn));
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectAmount(btn);
                }
            });
        });

        // Naria merchant ID (set this to your actual Naria merchant identifier)
        const NARIA_MERCHANT_ID = ''; // TODO: fill with real merchant id

        const nariaBtn = modal.querySelector('#proceedToNaria');
        const confirmOverlay = modal.querySelector('.donation-confirm-overlay');

        nariaBtn.addEventListener('click', () => {
            const selected = modal.querySelector('.donation-amount.selected');
            if (!selected) {
                alert('Please select or enter a donation amount.');
                return;
            }
            let amount = selected.dataset.amount;
            if (amount === 'custom') {
                amount = customAmountInput.value;
            }
            amount = parseFloat(amount);
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid donation amount greater than $0.');
                customAmountInput.focus();
                return;
            }

            const frequency = modal.querySelector('input[name="frequency"]:checked').value;

            // Show a confirmation overlay inside the modal before redirecting
            confirmOverlay.innerHTML = `
                <div class="confirm-panel" role="alertdialog" aria-labelledby="confirmTitle" aria-describedby="confirmDesc">
                    <h3 id="confirmTitle">Confirm Donation</h3>
                    <p id="confirmDesc">You are about to be redirected to a secure hosted checkout to complete a ${frequency === 'monthly' ? 'monthly' : 'one-time'} donation of <strong>$${amount.toFixed(2)}</strong>.</p>
                    <div class="confirm-actions">
                        <button id="confirmProceed" class="submit-btn">Continue to Checkout</button>
                        <button id="confirmCancel" class="secondary-btn">Cancel</button>
                    </div>
                </div>
            `;
            confirmOverlay.style.display = 'block';

            // Focus trap for confirmation
            const confirmProceed = modal.querySelector('#confirmProceed');
            const confirmCancel = modal.querySelector('#confirmCancel');
            confirmProceed.focus();

            confirmCancel.addEventListener('click', () => {
                confirmOverlay.style.display = 'none';
            });

            confirmProceed.addEventListener('click', () => {
                // Naria hosted checkout redirect (placeholder format)
                // Real integration may require server-side signing or token generation. Consult Naria docs.
                if (!NARIA_MERCHANT_ID) {
                    alert('Donation checkout is not configured. Please contact the site administrator.');
                    return;
                }
                const merchant = encodeURIComponent(NARIA_MERCHANT_ID);
                const returnUrl = encodeURIComponent(window.location.href);
                const checkoutUrl = `https://checkout.naria.org/checkout?merchant=${merchant}&amount=${amount.toFixed(2)}&currency=USD&frequency=${encodeURIComponent(frequency)}&returnUrl=${returnUrl}`;
                window.location.href = checkoutUrl;
            });
        });
    

    // Show the modal and move focus inside it
    modal.classList.add('active');
    setTimeout(() => {
        const firstFocusable = modal.querySelector('.donation-amount, #proceedToPayPal, .close-modal');
        if (firstFocusable) firstFocusable.focus();
    }, 50);

    function closeDonationModal() {
        const modalEl = document.getElementById('donationModal');
        if (modalEl) {
            modalEl.classList.remove('active');
            // return focus to main donate button if present
            const donateBtnMain = document.querySelector('.donate-btn');
            if (donateBtnMain) donateBtnMain.focus();
        }
    

// Photo Gallery
class PhotoGallery {
    constructor() {
        this.initializeGallery();
    }

    initializeGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const modal = document.querySelector('.modal');
        const modalImg = document.querySelector('.modal-content img');
        const closeModal = document.querySelector('.close-modal');

        if (galleryItems && modal && modalImg && closeModal) {
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const imgSrc = item.querySelector('img').src;
                    modalImg.src = imgSrc;
                    modal.classList.add('active');
                });
            });

            closeModal.addEventListener('click', () => {
                modal.classList.remove('active');
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }
}

// Announcement List Population (Example)
const announcements = [
    {
        title: 'Sunday Service',
        date: 'Every Sunday at 10:00 AM',
        description: 'Join us for worship and fellowship'
    },
    {
        title: 'Bible Study',
        date: 'Every Wednesday at 7:00 PM',
        description: 'Deep dive into Scripture'
    },
    // Add more announcements as needed
];

function populateAnnouncements() {
    const announcementList = document.getElementById('announcementList');
    if (announcementList) {
        announcements.forEach(announcement => {
            const announcementDiv = document.createElement('div');
            announcementDiv.classList.add('announcement');
            announcementDiv.innerHTML = `
                <h3>${announcement.title}</h3>
                <p class="date">${announcement.date}</p>
                <p>${announcement.description}</p>
            `;
            announcementList.appendChild(announcementDiv);
        });
    }
}

// Prayer Resource Functions
function downloadPrayerGuide(event) {
    event.preventDefault();
    const prayerGuide = {
        title: "Daily Prayer Guide",
        sections: [
            {
                title: "Morning Prayer Points",
                scriptures: ["Psalm 5:3", "Mark 1:35"],
                points: [
                    "Thanksgiving and Praise",
                    "Personal Sanctification",
                    "Family Blessing",
                    "Daily Direction"
                ]
            },
            {
                title: "Evening Prayer Points",
                scriptures: ["Psalm 141:2"],
                points: [
                    "Review of God's Faithfulness",
                    "Repentance and Forgiveness",
                    "Rest and Protection",
                    "Tomorrow's Preparation"
                ]
            }
        ]
    };
    
    // Create and download PDF (in real implementation, you would have a pre-made PDF)
    alert("Prayer guide download starting...");
    // Implement actual download functionality
}

function joinPrayerTeam(event) {
    event.preventDefault();
    showModal('prayerTeam', `
        <h2>Join Our Prayer Warriors Team</h2>
        <p>Thank you for your interest in joining our prayer ministry. Prayer warriors commit to:</p>
        <ul>
            <li>Pray daily for church needs</li>
            <li>Attend weekly prayer meetings</li>
            <li>Maintain confidentiality of prayer requests</li>
            <li>Participate in prayer training sessions</li>
        </ul>
        <form id="prayerTeamForm" onsubmit="handlePrayerTeamJoin(event)">
            <div class="form-group">
                <label for="prayerTeamName">Full Name</label>
                <input type="text" id="prayerTeamName" required>
            </div>
            <div class="form-group">
                <label for="prayerTeamEmail">Email</label>
                <input type="email" id="prayerTeamEmail" required>
            </div>
            <div class="form-group">
                <label for="prayerTeamPhone">Phone</label>
                <input type="tel" id="prayerTeamPhone" required>
            </div>
            <button type="submit" class="submit-btn">Submit Application</button>
        </form>
    `);
}

function openScriptureGuide(event) {
    event.preventDefault();
    showModal('scripture', `
        <h2>Scripture Prayer Guide</h2>
        <div class="scripture-categories">
            <h3>Personal Growth</h3>
            <ul>
                <li>Wisdom: James 1:5</li>
                <li>Strength: Philippians 4:13</li>
                <li>Peace: John 14:27</li>
            </ul>
            <h3>Family</h3>
            <ul>
                <li>Unity: Psalm 133:1</li>
                <li>Children: Proverbs 22:6</li>
                <li>Marriage: Ephesians 5:25-33</li>
            </ul>
            <h3>Church</h3>
            <ul>
                <li>Unity: Ephesians 4:3</li>
                <li>Growth: Acts 2:47</li>
                <li>Leadership: 1 Timothy 3:2-7</li>
            </ul>
        </div>
    `);
}

function openPrayerCalendar(event) {
    event.preventDefault();
    showModal('calendar', `
        <h2>Prayer Focus Calendar</h2>
        <div class="prayer-calendar">
            <div class="calendar-item">
                <h3>Sunday</h3>
                <p>Church Services & Ministry Teams</p>
            </div>
            <div class="calendar-item">
                <h3>Monday</h3>
                <p>Families & Relationships</p>
            </div>
            <div class="calendar-item">
                <h3>Tuesday</h3>
                <p>Community & Missions</p>
            </div>
            <div class="calendar-item">
                <h3>Wednesday</h3>
                <p>Youth & Education</p>
            </div>
            <div class="calendar-item">
                <h3>Thursday</h3>
                <p>Health & Healing</p>
            </div>
            <div class="calendar-item">
                <h3>Friday</h3>
                <p>Salvation & Spiritual Growth</p>
            </div>
            <div class="calendar-item">
                <h3>Saturday</h3>
                <p>Leadership & Vision</p>
            </div>
        </div>
    `);
}

function openTestimonies(event) {
    event.preventDefault();
    showModal('testimonies', `
        <h2>Prayer Testimonies</h2>
        <div class="testimonies-list">
            <div class="testimony">
                <h3>Healing Received</h3>
                <p>"After three months of prayer, my mother was completely healed..."</p>
                <span class="testimony-author">- Sarah J.</span>
            </div>
            <div class="testimony">
                <h3>Family Restoration</h3>
                <p>"Our family was restored through the power of prayer..."</p>
                <span class="testimony-author">- Michael R.</span>
            </div>
            <div class="testimony">
                <h3>Financial Breakthrough</h3>
                <p>"God provided unexpectedly after months of faithful prayer..."</p>
                <span class="testimony-author">- David L.</span>
            </div>
        </div>
        <button onclick="sharePrayerTestimony()" class="cta-button">Share Your Testimony</button>
    `);
}

function showModal(type, content) {
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function handlePrayerTeamJoin(event) {
    event.preventDefault();
    const name = document.getElementById('prayerTeamName').value;
    const email = document.getElementById('prayerTeamEmail').value;
    const phone = document.getElementById('prayerTeamPhone').value;
    
    // Here you would typically send this data to your server
    alert(`Thank you for your interest in joining the Prayer Warriors Team! We will contact you soon at ${email} to discuss the next steps.`);
    closeModal();
}

function sharePrayerTestimony() {
    showModal('shareTestimony', `
        <h2>Share Your Prayer Testimony</h2>
        <form id="testimonyForm" onsubmit="handleTestimonySubmit(event)">
            <div class="form-group">
                <label for="testimonyTitle">Title</label>
                <input type="text" id="testimonyTitle" required>
            </div>
            <div class="form-group">
                <label for="testimonyText">Your Testimony</label>
                <textarea id="testimonyText" rows="5" required></textarea>
            </div>
            <div class="form-group">
                <label for="testimonyName">Your Name</label>
                <input type="text" id="testimonyName" required>
            </div>
            <button type="submit" class="submit-btn">Submit Testimony</button>
        </form>
    `);
}

function handleTestimonySubmit(event) {
    event.preventDefault();
    const title = document.getElementById('testimonyTitle').value;
    const text = document.getElementById('testimonyText').value;
    const name = document.getElementById('testimonyName').value;
    
    // Here you would typically send this data to your server
    alert('Thank you for sharing your testimony! It will be reviewed and added to our testimonies page.');
    closeModal();
}

// Giving page JS — unified, lightweight MVP with safe fallbacks
(function(){
    // TODO: set your payment provider merchant ID to enable hosted checkout
    // Example for Naria: 'org_ABCDE12345'
    const MERCHANT_ID = '';
    const CURRENCY = 'NGN';

    const amounts = document.querySelectorAll('.amount-btn');
    const customAmount = document.getElementById('customAmount');
    const donationForm = document.getElementById('donationForm');
    const confirmation = document.getElementById('donationConfirmation');
    const payBtn = document.getElementById('payWithCard');

    let selectedAmount = null;

    // Amount selection
    amounts.forEach(btn => btn.addEventListener('click', () => {
        amounts.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAmount = btn.dataset.amount;
        customAmount.value = '';
    }));

    customAmount.addEventListener('input', () => {
        amounts.forEach(b => b.classList.remove('selected'));
        selectedAmount = customAmount.value;
    });

    // Submit handler
    donationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('donorName').value.trim();
        const email = document.getElementById('donorEmail').value.trim();
        const purpose = document.getElementById('donationPurpose').value;
        const frequency = donationForm.querySelector('input[name="frequency"]:checked').value;
        const coverFees = document.getElementById('coverFees').checked;
        const amount = parseFloat(selectedAmount);

        if (!amount || amount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }

        // If a merchant is configured, redirect to hosted checkout (example URL format)
        if (MERCHANT_ID) {
            const returnUrl = encodeURIComponent(window.location.href);
            const meta = encodeURIComponent(JSON.stringify({ name, email, purpose, coverFees }));
            const nariaUrl = `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}&amount=${encodeURIComponent(amount.toFixed(2))}&currency=${encodeURIComponent(CURRENCY)}&frequency=${encodeURIComponent(frequency)}&metadata=${meta}&returnUrl=${returnUrl}`;
            window.location.href = nariaUrl;
            return;
        }

        // Fallback when online payments are not configured
        // Display a confirmation and provide instructions to use Bank Transfer
        confirmation.hidden = false;
        donationForm.hidden = true;

        // Optionally open a prefilled email to finance/admin for manual processing
        const mail = 'info@cacmiraclecentres.org';
        const subject = encodeURIComponent('Donation Intention');
        const body = encodeURIComponent(
            `Hello,\n\nI would like to give ${CURRENCY} ${amount.toFixed(2)} (${frequency}).\nPurpose: ${purpose}\nName: ${name || '-'}\nEmail: ${email || '-'}\nCover fees: ${coverFees ? 'Yes' : 'No'}\n\nThank you.`
        );
        // Uncomment the next line if you want to automatically open the mail client
        // window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
    });

    // QR code generation — direct to hosted checkout if configured; otherwise this page
    const qrTarget = MERCHANT_ID ? `https://checkout.naria.org/checkout?merchant=${encodeURIComponent(MERCHANT_ID)}` : window.location.href;
    new QRious({ element: document.getElementById('qrCode'), value: qrTarget, size: 160 });

    // Tithe calculator
    const calculateTitheBtn = document.getElementById('calculateTithe');
    const incomeAmount = document.getElementById('incomeAmount');
    const titheResult = document.getElementById('titheResult');

    calculateTitheBtn.addEventListener('click', () => {
        const income = parseFloat(incomeAmount.value);
        if (income && income > 0) {
            const tithe = income * 0.1;
            titheResult.textContent = `Your tithe amount: ₦${tithe.toFixed(2)}`;
            // Set the selected amount to the calculated tithe
            selectedAmount = tithe.toFixed(2);
            amounts.forEach(b => b.classList.remove('selected'));
            customAmount.value = tithe.toFixed(2);
        } else {
            titheResult.textContent = 'Please enter a valid income amount.';
        }
    });

    // If no merchant configured, visually indicate the button still works with fallback
    if (!MERCHANT_ID) {
        payBtn.setAttribute('title', 'Online payments will show instructions until a provider is configured.');
    }
})();

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    populateAnnouncements();
    new PhotoGallery();
});
