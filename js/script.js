const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8V7EceiTzzSw2Yq9GA1tt7SihDHEXLPAu9KJACD5z-2NlGYSzlvnLYVURGAFPde0GRw/exec';

window.SODESI = {
  products: [], byId: {},
  cart: JSON.parse(localStorage.getItem('sodesi_cart') || '[]'),
  settings: { delivery_charge: 49, free_delivery_threshold: 499, gst_percent: 0 }
};

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const isHome = document.body.dataset.page === 'home';
  if (!isHome && loader) loader.remove();
  else if (isHome && loader) {
    window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 1200));
    setTimeout(() => loader && loader.classList.add('hide'), 4000);
  }

  if (typeof AOS !== 'undefined') AOS.init({ duration: 900, once: true, offset: 80 });
  else document.querySelectorAll('[data-aos]').forEach(el => el.removeAttribute('data-aos'));

  const navRight = document.querySelector('.nav-right');
  if (navRight && !navRight.querySelector('a[href="cart.html"]')) navRight.insertAdjacentHTML('beforeend', '<a href="cart.html" class="nav-cart"><i class="fas fa-shopping-cart"></i><span class="cart-count">0</span></a>');
  const mmMenu = document.getElementById('mobileMenu');
  if (mmMenu && !mmMenu.querySelector('a[href*="cart.html"]')) mmMenu.insertAdjacentHTML('beforeend', '<a href="cart.html">🛒 Cart</a>');

  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  if (isHome && navbar) navbar.classList.add('transparent');
  window.addEventListener('scroll', () => {
    if (navbar) { if (window.scrollY > 80) { navbar.classList.remove('transparent'); navbar.classList.add('scrolled'); } else { navbar.classList.add('transparent'); navbar.classList.remove('scrolled'); } }
    backToTop && (window.scrollY > 400 ? backToTop.classList.add('show') : backToTop.classList.remove('show'));
  });
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => { navToggle.classList.toggle('active'); mobileMenu.classList.toggle('active'); });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { navToggle.classList.remove('active'); mobileMenu.classList.remove('active'); }));
  }
  if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    if (localStorage.getItem('theme') === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; }
    themeToggle.addEventListener('click', () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) { document.documentElement.removeAttribute('data-theme'); themeToggle.innerHTML = '<i class="fas fa-moon"></i>'; localStorage.setItem('theme', 'light'); }
      else { document.documentElement.setAttribute('data-theme', 'dark'); themeToggle.innerHTML = '<i class="fas fa-sun"></i>'; localStorage.setItem('theme', 'dark'); }
    });
  }

  const cd = document.querySelector('.cursor-dot'), cr = document.querySelector('.cursor-ring');
  if (cd && cr) document.addEventListener('mousemove', e => { [cd, cr].forEach(c => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }); });

  const canvas = document.getElementById('particleCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d'); let pts = [];
    const rs = () => { canvas.width = innerWidth; canvas.height = innerHeight; }; rs(); addEventListener('resize', rs);
    class P { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.s = Math.random() * 2 + 1; this.vx = (Math.random() - .5) * .5; this.vy = (Math.random() - .5) * .5; this.a = Math.random() * .5 + .1; }
      u() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvas.width) this.vx *= -1; if (this.y < 0 || this.y > canvas.height) this.vy *= -1; }
      d() { ctx.fillStyle = `rgba(46,125,50,${this.a})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill(); } }
    for (let i = 0; i < 60; i++) pts.push(new P());
    (function loop() { ctx.clearRect(0, 0, canvas.width, canvas.height); pts.forEach(p => { p.u(); p.d(); }); requestAnimationFrame(loop); })();
  }

  const cObs = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target, target = +el.dataset.target; let cur = 0;
    const t = setInterval(() => { cur += target / 100; if (cur >= target) { el.textContent = target.toLocaleString('en-IN'); clearInterval(t); } else el.textContent = Math.floor(cur).toLocaleString('en-IN'); }, 20);
    cObs.unobserve(el);
  }), { threshold: .5 });
  document.querySelectorAll('.counter').forEach(c => cObs.observe(c));

  document.querySelectorAll('.faq-item').forEach(i => i.querySelector('.faq-q')?.addEventListener('click', () => i.classList.toggle('active')));

  const WA = '919658525234';
  const cf = document.getElementById('contactForm');
  if (cf) cf.addEventListener('submit', e => { e.preventDefault(); const g = id => document.getElementById(id).value; window.open(`https://wa.me/${WA}?text=` + encodeURIComponent(`🌿 New Enquiry - Sodesi\nName: ${g('name')}\nPhone: ${g('phone')}\nEmail: ${g('email')}\nSubject: ${g('subject')}\nMessage: ${g('message')}`), '_blank'); });
  const af = document.getElementById('applyForm');
  if (af) af.addEventListener('submit', e => { e.preventDefault(); const inp = af.querySelectorAll('input'), sel = af.querySelector('select'), ta = af.querySelector('textarea'); window.open(`https://wa.me/${WA}?text=` + encodeURIComponent(`💼 Job Application\nName: ${inp[0].value}\nEmail: ${inp[1].value}\nPhone: ${inp[2].value}\nPosition: ${sel.value}\nExperience: ${inp[3].value || 'Fresher'}\nCover: ${ta.value || 'N/A'}`), '_blank'); });
  document.querySelectorAll('.apply-btn').forEach(b => b.addEventListener('click', () => document.querySelector('.apply-section')?.scrollIntoView({ behavior: 'smooth' })));

  /* ================= SHOP ENGINE ================= */
  const S = window.SODESI;
  const inr = n => '₹' + Number(n).toLocaleString('en-IN');
  const HOME_GROUP = { atta: 'flour', besan: 'flour', ragi: 'specialty', dal: 'specialty', mix: 'sattu', channa: 'sattu' };
  let homeFilter = 'all', shopCat = 'all', shopSearch = '';

  function getImageUrl(url) {
    if (!url || url.indexOf('blob:') === 0) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800';
    let id = '';
    if (url.indexOf('id=') !== -1) id = url.split('id=')[1].split('&')[0];
    else if (url.indexOf('/d/') !== -1) id = url.split('/d/')[1].split('/')[0];
    if (id) return 'https://lh3.googleusercontent.com/d/' + id;
    return url;
  }
  const FALLBACK_IMG = 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800';

  const normWeights = p => (Array.isArray(p.weights) && p.weights.length ? p.weights : [{ w: 'Default', price: p.price, mrp: p.mrp }])
    .map(x => typeof x === 'string' ? { w: x, price: Number(p.price), mrp: Number(p.mrp || p.price) } : { w: x.w, price: Number(x.price), mrp: Number(x.mrp || x.price) });

  if (!document.querySelector('.cart-float') && !document.body.classList.contains('admin-body')) {
    const a = document.createElement('a');
    a.href = (location.pathname.includes('/admin/') ? '../' : '') + 'cart.html';
    a.className = 'cart-float'; a.innerHTML = '<i class="fas fa-shopping-cart"></i><span class="cart-count">0</span>';
    document.body.appendChild(a);
  }

  const saveCart = () => { localStorage.setItem('sodesi_cart', JSON.stringify(S.cart)); updateCartCount(); };
  const updateCartCount = () => document.querySelectorAll('.cart-count').forEach(el => el.textContent = S.cart.reduce((n, i) => n + i.qty, 0));
  updateCartCount();

  function toast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:240px;right:30px;background:#1B5E20;color:#fff;padding:12px 22px;border-radius:50px;z-index:3000;box-shadow:0 10px 30px rgba(0,0,0,.3);font-size:14px';
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  }

  window.addToCart = (id, qty = 1, weight = null, price = null) => {
    const p = S.byId[id]; if (!p) return;
    if (p.stock <= 0) return alert('Sorry, this product is out of stock.');
    const ws = normWeights(p);
    const entry = ws.find(x => x.w === weight) || ws[0];
    const unit = price != null ? price : entry.price;
    const key = p.id + '_' + entry.w;
    const ex = S.cart.find(i => i.key === key);
    if (ex) ex.qty = Math.min(ex.qty + qty, p.stock);
    else S.cart.push({ key, id: p.id, name: p.name, weight: entry.w, price: unit, qty, image: p.image_url, stock: p.stock });
    saveCart(); toast('✅ Added: ' + p.name + ' (' + entry.w + ')');
  };

  const priceRowHTML = (price, mrp) => {
    const off = mrp > price ? Math.round((1 - price / mrp) * 100) : 0;
    return `<span class="price">${inr(price)}</span>${mrp > price ? `<s>${inr(mrp)}</s><span class="off">${off}% OFF</span>` : ''}`;
  };

  function cardHTML(p, mode) {
    const ws = normWeights(p); const sel = ws[0];
    const stock = p.stock <= 0 ? '<span class="stock-hint out">Out of Stock</span>' : p.stock <= 5 ? `<span class="stock-hint low">🔥 Only ${p.stock} left</span>` : `<span class="stock-hint" style="color:var(--forest)">✔ In Stock</span>`;
    return `<div class="product-card glass" data-product="${p.id}" data-pcat="${p.category}" data-category="${HOME_GROUP[p.category] || 'specialty'}" data-sel-w="${sel.w}" data-sel-price="${sel.price}">
      ${p.best_seller ? '<div class="badge bestseller">Best Seller</div>' : ''}
      <div class="product-img"><img src="${getImageUrl(p.image_url)}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';" alt="${p.name}"/></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p class="p-desc">${(p.description || '').slice(0, 70)}</p>
        <div class="weight-chips">${ws.map((w, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-w="${w.w}" data-price="${w.price}" data-mrp="${w.mrp}">${w.w}</button>`).join('')}</div>
        <div class="price-row">${priceRowHTML(sel.price, sel.mrp)}</div>
        <div class="product-meta">${stock}</div>
        <div class="product-actions">
          <button class="btn btn-sm btn-gold add-cart" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}><i class="fas fa-cart-plus"></i> Add</button>
          ${mode === 'home' ? `<a href="products.html" class="btn btn-sm btn-primary">Quick View</a>` : `<button class="btn btn-sm btn-primary buy-now" data-buy="${p.id}">Buy Now</button>`}
        </div>
      </div>
    </div>`;
  }

  function renderGrids() {
    const homeGrid = document.querySelector('.products-section .products-grid');
    const shopGrid = document.querySelector('.products-page-section .products-grid');
    if (homeGrid && S.products.length) {
      const list = S.products.filter(p => homeFilter === 'all' || HOME_GROUP[p.category] === homeFilter);
      homeGrid.innerHTML = list.map(p => cardHTML(p, 'home')).join('') || '<p style="grid-column:1/-1;text-align:center">No products found.</p>';
    }
    if (shopGrid && S.products.length) {
      const list = S.products.filter(p => (shopCat === 'all' || p.category === shopCat) && (!shopSearch || p.name.toLowerCase().includes(shopSearch) || (p.description || '').toLowerCase().includes(shopSearch)));
      shopGrid.innerHTML = list.map(p => cardHTML(p, 'shop')).join('') || '<p style="grid-column:1/-1;text-align:center">No products match.</p>';
    }
    attachTilt();
  }

  /* ═══ LOAD SETTINGS (LIVE FROM ADMIN) ═══ */
  async function loadSettings() {
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?path=/api/settings', { method: 'GET', redirect: 'follow' });
      const data = await res.json();
      if (data && typeof data === 'object' && data.delivery_charge !== undefined) {
        S.settings = {
          delivery_charge: Number(data.delivery_charge) || 49,
          free_delivery_threshold: Number(data.free_delivery_threshold) || 499,
          gst_percent: Number(data.gst_percent) || 0
        };
        console.log('✅ SETTINGS LOADED:', S.settings);
        renderCartPage(); renderCheckoutSummary();
      }
    } catch (err) { console.error('❌ Settings load failed:', err); }
  }

  /* ═══ LOAD PRODUCTS (LIVE FROM SHEET) ═══ */
  function loadProducts() {
    fetch(APPS_SCRIPT_URL + '?path=/api/products', { method: 'GET', redirect: 'follow' })
      .then(r => r.json())
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          S.products = list;
          S.byId = Object.fromEntries(S.products.map(p => [p.id, p]));
          console.log('✅ PRODUCTS LOADED FROM SHEET:', S.products.length);
        } else { console.warn('⚠️ No active products in sheet'); }
        renderGrids();
      })
      .catch(err => { console.error('❌ Products load failed:', err); renderGrids(); });
  }
  loadSettings();
  loadProducts();

  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); homeFilter = b.dataset.filter; renderGrids();
  }));
  document.querySelectorAll('.category-menu li').forEach(li => li.addEventListener('click', () => {
    document.querySelectorAll('.category-menu li').forEach(x => x.classList.remove('active'));
    li.classList.add('active'); shopCat = li.dataset.cat; renderGrids();
  }));
  const si = document.getElementById('productSearch');
  if (si) si.addEventListener('input', e => { shopSearch = e.target.value.toLowerCase(); renderGrids(); });

  document.addEventListener('click', e => {
    const chip = e.target.closest('.weight-chips button');
    if (chip) {
      const host = chip.closest('.product-card') || chip.closest('.modal-box');
      host.querySelectorAll('.weight-chips button').forEach(b => b.classList.remove('active'));
      chip.classList.add('active');
      host.querySelector('.price-row').innerHTML = priceRowHTML(+chip.dataset.price, +chip.dataset.mrp);
      host.dataset.selW = chip.dataset.w; host.dataset.selPrice = chip.dataset.price;
      return;
    }
    const add = e.target.closest('.add-cart');
    if (add) { const host = add.closest('.product-card') || add.closest('.modal-box'); addToCart(add.dataset.id, 1, host?.dataset.selW, host?.dataset.selPrice != null ? +host.dataset.selPrice : null); return; }
    const buy = e.target.closest('.buy-now');
    if (buy) { const host = buy.closest('.product-card'); addToCart(buy.dataset.buy, 1, host?.dataset.selW, host?.dataset.selPrice != null ? +host.dataset.selPrice : null); location.href = 'checkout.html'; }
  });

  /* ---------- MODAL ---------- */
  document.getElementById('productModal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal-overlay'; modal.id = 'productModal';
  modal.innerHTML = `<div class="modal-box"><button class="modal-close" id="modalClose"><i class="fas fa-times"></i></button><div class="modal-grid"><div class="modal-img"><img id="mImg" src="" alt=""/></div><div class="modal-details"><span class="modal-badge" id="mBadge" style="display:none"></span><h3 id="mTitle"></h3><p class="m-desc" id="mDesc"></p><div class="weight-chips" id="mWeights"></div><div class="price-row" id="mPrice"></div><table class="nutrition-table" id="mNutrition"></table><div class="modal-actions"><button class="btn btn-gold add-cart" id="mAdd" data-id=""><i class="fas fa-cart-plus"></i> Add to Cart</button><button class="btn btn-primary" id="mBuy">Buy Now</button><a class="btn btn-outline-dark" href="contact.html">Enquiry</a></div></div></div></div>`;
  document.body.appendChild(modal);
  let modalId = null;
  document.addEventListener('click', e => {
    const opener = e.target.closest('.product-card .product-img, .product-card h3');
    if (!opener) return;
    const id = opener.closest('.product-card').dataset.product;
    const p = S.byId[id]; if (!p) return;
    modalId = id;
    const ws = normWeights(p); const sel = ws[0];
    const box = modal.querySelector('.modal-box');
    box.dataset.selW = sel.w; box.dataset.selPrice = sel.price;
    document.getElementById('mImg').src = getImageUrl(p.image_url);
    document.getElementById('mTitle').textContent = p.name;
    document.getElementById('mDesc').textContent = p.description || '';
    document.getElementById('mWeights').innerHTML = ws.map((w, i) => `<button type="button" class="${i === 0 ? 'active' : ''}" data-w="${w.w}" data-price="${w.price}" data-mrp="${w.mrp}">${w.w}</button>`).join('');
    document.getElementById('mPrice').innerHTML = priceRowHTML(sel.price, sel.mrp);
    document.getElementById('mAdd').dataset.id = p.id;
    const b = document.getElementById('mBadge');
    if (p.best_seller) { b.style.display = 'inline-block'; b.textContent = 'Best Seller'; } else b.style.display = 'none';
    document.getElementById('mNutrition').innerHTML = (p.nutrition || []).length
      ? '<thead><tr><th colspan="2">Nutritional Value / 100gm</th></tr></thead><tbody>' + p.nutrition.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('') + '</tbody>' : '';
    modal.classList.add('open'); document.body.style.overflow = 'hidden';
  });
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.getElementById('mBuy').addEventListener('click', () => { const box = modal.querySelector('.modal-box'); addToCart(modalId, 1, box.dataset.selW, +box.dataset.selPrice); location.href = 'checkout.html'; });

  /* ═══ CART PAGE ═══ */
  function renderCartPage() {
    const cartItemsEl = document.getElementById('cartItems');
    if (!cartItemsEl) return;
    if (!S.cart.length) {
      cartItemsEl.innerHTML = `<div class="empty-state glass"><i class="fas fa-shopping-cart"></i><h3>Your cart is empty</h3><p style="margin:10px 0 24px;color:var(--muted)">Add some pure goodness!</p><a href="products.html" class="btn btn-primary">Shop Now</a></div>`;
      const cs = document.getElementById('cartSummary'); if (cs) cs.style.display = 'none';
      return;
    }
    const cs = document.getElementById('cartSummary'); if (cs) cs.style.display = 'block';
    cartItemsEl.innerHTML = S.cart.map(i => `<div class="cart-item glass"><img src="${getImageUrl(i.image)}" onerror="this.onerror=null;this.src='${FALLBACK_IMG}';"/><div class="ci-info"><h4>${i.name}</h4><span class="ci-weight">${i.weight || ''}</span><div class="price" style="font-size:1rem">${inr(i.price)}</div></div><div class="qty-box"><button data-dec="${i.key}">−</button><strong>${i.qty}</strong><button data-inc="${i.key}">+</button></div><strong>${inr(i.price * i.qty)}</strong><button class="ci-remove" data-del="${i.key}"><i class="fas fa-trash"></i></button></div>`).join('');
    updateTotals();
  }

  function calcTotals() {
    const sub = S.cart.reduce((n, i) => n + i.price * i.qty, 0);
    const del = sub >= S.settings.free_delivery_threshold ? 0 : S.settings.delivery_charge;
    const gst = (sub * S.settings.gst_percent) / 100;
    return { sub, del, gst, total: sub + del + gst };
  }

  function updateTotals() {
    const t = calcTotals();
    const subEl = document.getElementById('sumSub'); if (!subEl) return;
    subEl.textContent = inr(t.sub);
    document.getElementById('sumDel').textContent = t.del ? inr(t.del) : 'FREE';
    const gstRow = document.getElementById('gstRow'), gstEl = document.getElementById('sumGst');
    if (t.gst > 0) { if (gstRow) gstRow.style.display = 'flex'; if (gstEl) gstEl.textContent = inr(t.gst); }
    else if (gstRow) gstRow.style.display = 'none';
    document.getElementById('sumTotal').textContent = inr(t.total);
    const hint = document.getElementById('deliveryHint');
    if (hint) hint.innerHTML = t.sub >= S.settings.free_delivery_threshold
      ? '🎉 You unlocked <strong style="color:var(--forest)">FREE Delivery!</strong>'
      : `🛒 Add <strong>${inr(S.settings.free_delivery_threshold - t.sub)}</strong> more for FREE delivery (above ${inr(S.settings.free_delivery_threshold)})!`;
  }

  const cartItemsEl = document.getElementById('cartItems');
  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', e => {
      const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]'), del = e.target.closest('[data-del]');
      if (inc) { const it = S.cart.find(i => i.key === inc.dataset.inc); it.qty = Math.min(it.qty + 1, it.stock || 99); saveCart(); renderCartPage(); }
      if (dec) { const it = S.cart.find(i => i.key === dec.dataset.dec); it.qty > 1 ? it.qty-- : S.cart = S.cart.filter(i => i.key !== dec.dataset.dec); saveCart(); renderCartPage(); }
      if (del) { S.cart = S.cart.filter(i => i.key !== del.dataset.del); saveCart(); renderCartPage(); }
    });
    renderCartPage();
  }

  /* ═══ CHECKOUT PAGE ═══ */
  function renderCheckoutSummary() {
    const el = document.getElementById('coItems'); if (!el) return;
    if (!S.cart.length) { el.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>'; return; }
    const t = calcTotals();
    el.innerHTML = S.cart.map(i => `<div class="sum-row"><span>${i.name} (${i.weight}) × ${i.qty}</span><span>${inr(i.price * i.qty)}</span></div>`).join('');
    el.innerHTML += `<div class="sum-row"><span>Subtotal</span><span>${inr(t.sub)}</span></div>`;
    el.innerHTML += `<div class="sum-row"><span>Delivery Charge</span><span>${t.del ? inr(t.del) : '<strong style="color:var(--forest)">FREE</strong>'}</span></div>`;
    if (t.gst > 0) el.innerHTML += `<div class="sum-row"><span>GST (${S.settings.gst_percent}%)</span><span>${inr(t.gst)}</span></div>`;
    el.innerHTML += `<div class="sum-row total"><span>Total</span><span>${inr(t.total)}</span></div>`;
    el.innerHTML += t.sub >= S.settings.free_delivery_threshold
      ? `<p style="font-size:12px;margin-top:14px;background:#E8F5E9;color:#1B5E20;padding:10px 14px;border-radius:8px">🎉 Congratulations! You unlocked <strong>FREE Delivery</strong></p>`
      : `<p style="font-size:12px;margin-top:14px;background:#FFF8E1;color:#795548;padding:10px 14px;border-radius:8px">🛒 Add <strong style="color:#E65100">${inr(S.settings.free_delivery_threshold - t.sub)}</strong> more to get <strong style="color:#2E7D32">FREE delivery</strong> (free above ${inr(S.settings.free_delivery_threshold)})</p>`;
  }

  const coForm = document.getElementById('checkoutForm');
  if (coForm) {
    renderCheckoutSummary();
    coForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!S.cart.length) return alert('Your cart is empty!');
      const btn = document.getElementById('placeOrderBtn');
      btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
      const customer = {
        name: document.getElementById('coName').value, phone: document.getElementById('coPhone').value,
        email: document.getElementById('coEmail').value, address: document.getElementById('coAddress').value,
        city: document.getElementById('coCity').value, pincode: document.getElementById('coPin').value
      };
      const method = document.querySelector('input[name="payment"]:checked').value;
      try {
        const res = await fetch(APPS_SCRIPT_URL + '?path=/api/orders', {
          method: 'POST', redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            customer,
            items: S.cart.map(i => ({ id: i.id, qty: i.qty, weight: i.weight, name: i.name, price: i.price })),
            payment_method: method
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Order failed');
        S.cart = []; saveCart();
        document.querySelector('.checkout-grid').innerHTML = `<div class="success-card glass" style="grid-column:1/-1"><i class="fas fa-check-circle"></i><h2>Order Placed Successfully!</h2><div class="order-uid">${data.order.order_uid}</div><p style="color:var(--muted);margin-bottom:26px">A detailed receipt has been emailed to you.</p><a href="index.html" class="btn btn-outline-dark">Continue Shopping</a></div>`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        alert('Order failed: ' + err.message);
        btn.disabled = false; btn.innerHTML = '<i class="fas fa-lock"></i> Place Order';
      }
    });
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.hero h1, .page-hero h1').forEach(el => gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
  }

  function attachTilt() {
    document.querySelectorAll('.product-card').forEach(card => {
      if (card.dataset.tilt) return; card.dataset.tilt = '1';
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -4;
        const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 4;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }
});

  /* ═══ ORDER TRACKING (UPDATED FOR EMAIL OR PHONE) ═══ */
  const trackBtn = document.getElementById('trackBtn');
  if (trackBtn) {
    trackBtn.addEventListener('click', async () => {
      const uid = document.getElementById('trackOrderId').value.trim();
      const contact = document.getElementById('trackContact').value.trim(); // 👈 Changed to trackContact
      const resultEl = document.getElementById('trackResult');
      
      if (!uid || !contact) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = '<div class="track-error"><i class="fas fa-exclamation-circle"></i> Please enter both Order ID and Email/Mobile</div>';
        return;
      }
      
      trackBtn.disabled = true;
      trackBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tracking...';
      resultEl.style.display = 'block';
      resultEl.innerHTML = '';
      
      try {
        const res = await fetch(APPS_SCRIPT_URL + '?path=/api/track-order', {
          method: 'POST', redirect: 'follow',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          // 👇 Send as 'contact' so the backend decides if it's email or phone
          body: JSON.stringify({ order_uid: uid, contact: contact }) 
        });
        const data = await res.json();
        
        if (!data.success) {
          resultEl.innerHTML = `<div class="track-error"><i class="fas fa-exclamation-circle"></i> ${data.error || 'Order not found'}</div>`;
          trackBtn.disabled = false; trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Order';
          return;
        }
        
        // ... (Keep the rest of the timeline rendering logic exactly the same as before) ...
        const o = data.order;
        const statuses = ['placed', 'confirmed', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(o.status);
        const isCancelled = o.status === 'cancelled';
        
        const statusLabels = {
          placed: { icon: '🛒', title: 'Order Placed', desc: 'Your order has been received' },
          confirmed: { icon: '✅', title: 'Order Confirmed', desc: 'Being packed with love' },
          shipped: { icon: '🚚', title: 'Order Shipped', desc: 'On the way to you' },
          delivered: { icon: '🎉', title: 'Order Delivered', desc: 'Enjoy your pure nutrition!' },
          cancelled: { icon: '❌', title: 'Order Cancelled', desc: 'This order was cancelled' }
        };
        
        let timelineHTML = '';
        if (isCancelled) {
          timelineHTML = `<div class="track-step cancelled"><h4>❌ ${statusLabels.cancelled.title}</h4><p>${statusLabels.cancelled.desc}</p></div>`;
        } else {
          statuses.forEach((s, idx) => {
            const info = statusLabels[s];
            const state = idx < currentIndex ? 'done' : idx === currentIndex ? 'active' : '';
            timelineHTML += `<div class="track-step ${state}"><h4>${info.icon} ${info.title}</h4><p>${info.desc}</p></div>`;
          });
        }
        
        const itemsHTML = o.items.map(i => `<tr><td><strong>${i.name}</strong><br><small>${i.weight || ''}</small></td><td style="text-align:center">${i.qty}</td><td style="text-align:right">₹${i.price}</td><td style="text-align:right"><strong>₹${i.total}</strong></td></tr>`).join('');
        
        const date = new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
        const paymentLabel = o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment';
        
        resultEl.innerHTML = `
          <div class="track-order-header">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
              <div>
                <div style="font-size:12px;opacity:0.9">Order ID</div>
                <div class="uid">${o.order_uid}</div>
              </div>
              <div style="text-align:right">
                <div style="font-size:12px;opacity:0.9">Total Amount</div>
                <div style="font-size:22px;font-weight:bold">₹${o.total}</div>
              </div>
            </div>
            <span class="status-pill">${o.status.toUpperCase()}</span>
          </div>
          
          <div class="track-timeline">${timelineHTML}</div>
          
          <div class="track-info-grid">
            <div><strong>Customer Name</strong><div class="val">${o.customer_name}</div></div>
            <div><strong>Phone</strong><div class="val">📱 ${o.phone}</div></div>
            <div><strong>Delivery Address</strong><div class="val">${o.address}</div></div>
            <div><strong>City & Pincode</strong><div class="val">${o.city} - ${o.pincode}</div></div>
            <div><strong>Payment Method</strong><div class="val">${paymentLabel}</div></div>
            <div><strong>Order Date</strong><div class="val">${date}</div></div>
          </div>
          
          <h4 style="color:var(--forest);margin:20px 0 10px"><i class="fas fa-box"></i> Items Ordered</h4>
          <table class="track-items-table">
            <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
            <tbody>${itemsHTML}</tbody>
          </table>
        `;
      } catch (err) {
        resultEl.innerHTML = `<div class="track-error"><i class="fas fa-exclamation-circle"></i> Error tracking order. Please try again.</div>`;
      }
      
      trackBtn.disabled = false;
      trackBtn.innerHTML = '<i class="fas fa-search"></i> Track Order';
    });
  }