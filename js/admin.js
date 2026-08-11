const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8V7EceiTzzSw2Yq9GA1tt7SihDHEXLPAu9KJACD5z-2NlGYSzlvnLYVURGAFPde0GRw/exec';
const TOKEN = sessionStorage.getItem('sodesi_admin_token') || '';
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
let uploadedImageUrl = '';
let ALL_ORDERS = [];
let filteredOrders = [];
let currentPage = 1;
const PAGE_SIZE = 20;

if (!TOKEN) window.location.href = 'login.html';

document.getElementById('logoutBtn').onclick = () => { sessionStorage.clear(); location.href = 'login.html'; };

async function apiRequest(endpoint, options = {}) {
  const tokenParam = TOKEN ? '&token=' + encodeURIComponent(TOKEN) : '';
  const url = APPS_SCRIPT_URL + '?path=' + endpoint + tokenParam;
  const fetchOptions = { method: 'GET', redirect: 'follow' };
  if (options.method && options.body) {
    fetchOptions.method = options.method;
    fetchOptions.headers = { 'Content-Type': 'text/plain;charset=utf-8' };
    fetchOptions.body = options.body;
  }
  try {
    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    if (text.indexOf('<!DOCTYPE html>') !== -1 || text.indexOf('<html') !== -1 || text.indexOf('Sorry') !== -1) {
      console.error("GAS ERROR:", text);
      alert("⚠️ Server Error! Deploy a 'New Version' in Apps Script.");
      return null;
    }
    let data;
    try { data = JSON.parse(text); } catch (e) { alert("Invalid JSON:\n" + text.substring(0, 200)); return null; }
    if (data && data.error === 'Unauthorized - Please login') {
      sessionStorage.removeItem('sodesi_admin_token');
      window.location.href = 'login.html';
      return null;
    }
    return data;
  } catch (err) { alert("Network error: " + err.message); return null; }
}

function toastMsg(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:30px;right:30px;background:${isError ? '#c62828' : '#1B5E20'};color:#fff;padding:12px 22px;border-radius:50px;z-index:99999;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.2)`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

/* ═══ TABS ═══ */
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.style.display = 'none');
  b.classList.add('active');
  document.getElementById('tab-' + b.dataset.tab).style.display = '';
  if (b.dataset.tab === 'orders') loadOrders();
  if (b.dataset.tab === 'products') { loadProducts(); loadStats(); }
  if (b.dataset.tab === 'settings') loadSettings();
});

/* ═══ STATS ══ */
async function loadStats() {
  const s = await apiRequest('/api/admin/stats');
  if (!s) return;
  document.getElementById('stProducts').textContent = s.products;
  document.getElementById('stOrders').textContent = s.orders;
  document.getElementById('stRevenue').textContent = inr(s.revenue);
  document.getElementById('stLow').textContent = s.lowStock;
}
loadStats();

/* ═══ PRODUCTS ══ */
async function loadProducts() {
  const list = await apiRequest('/api/admin/products');
  if (!list || !Array.isArray(list)) return;
  const tbody = document.getElementById('productsTbody');
  if (!list.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999">No products yet.</td></tr>'; return; }
  tbody.innerHTML = list.map(p => `<tr>
    <td><img src="${p.image_url}" onerror="this.src='https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=100'" style="width:50px;height:50px;object-fit:cover;border-radius:8px"></td>
    <td><strong>${p.name}</strong></td><td>${p.category}</td>
    <td>${inr(p.weights && p.weights.length ? p.weights[0].price : 0)}</td>
    <td><input class="stock-input" type="number" value="${p.stock}" data-stock="${p.id}" style="width:60px;padding:5px;border:1px solid #ddd;border-radius:4px"></td>
    <td>${p.is_active ? '✅ Active' : '🚫 Hidden'}${p.best_seller ? ' · ⭐' : ''}</td>
    <td><button class="icon-btn" data-edit="${p.id}"><i class="fas fa-pen"></i></button> <button class="icon-btn danger" data-del="${p.id}"><i class="fas fa-trash"></i></button></td>
  </tr>`).join('');
}
loadProducts();

document.getElementById('productsTbody')?.addEventListener('change', async e => {
  if (!e.target.dataset.stock) return;
  const r = await apiRequest('/api/admin/products', { method: 'POST', body: JSON.stringify({ action: 'update', id: e.target.dataset.stock, stock: e.target.value }) });
  if (r && r.success) toastMsg('✅ Stock updated');
});
document.getElementById('productsTbody')?.addEventListener('click', async e => {
  if (e.target.closest('[data-del]')) {
    if (confirm('Delete?')) { await apiRequest('/api/admin/products', { method: 'POST', body: JSON.stringify({ action: 'delete', id: e.target.closest('[data-del]').dataset.del }) }); loadProducts(); }
  } else if (e.target.closest('[data-edit]')) editProduct(e.target.closest('[data-edit]').dataset.edit);
});

/* ═══ PRODUCT FORM ═══ */
function nutRow(l = '', v = '') { const d = document.createElement('div'); d.className = 'nut-row'; d.innerHTML = `<input placeholder="Label" value="${l}"><input placeholder="Value" value="${v}"><button type="button" class="icon-btn danger" onclick="this.parentNode.remove()"><i class="fas fa-times"></i></button>`; document.getElementById('nutritionRows').appendChild(d); }
document.getElementById('addNutRow').onclick = () => nutRow(); nutRow('Energy (kcal)', ''); nutRow('Protein (g)', '');

function weightRow(w = '', p = '', m = '') { const d = document.createElement('div'); d.className = 'nut-row'; d.innerHTML = `<input placeholder="Weight" value="${w}"><input type="number" placeholder="Price" value="${p}"><input type="number" placeholder="MRP" value="${m}"><button type="button" class="icon-btn danger" onclick="this.parentNode.remove()"><i class="fas fa-times"></i></button>`; document.getElementById('weightRows').appendChild(d); }
document.getElementById('addWeightRow').onclick = () => weightRow(); weightRow('1kg', '', '');

document.getElementById('pImage').onchange = function () {
  const f = this.files[0]; if (!f) return;
  document.getElementById('imgPreview').src = URL.createObjectURL(f); document.getElementById('imgPreview').style.display = 'block';
  const r = new FileReader(); r.onload = async e => {
    toastMsg('⏫ Uploading...');
    const res = await apiRequest('/api/admin/upload', { method: 'POST', body: JSON.stringify({ image: e.target.result.split(',')[1], mimeType: f.type, filename: f.name }) });
    if (res && res.success) { uploadedImageUrl = res.url; toastMsg('✅ Uploaded'); } else toastMsg('❌ Failed', true);
  }; r.readAsDataURL(f);
};

document.getElementById('productForm').onsubmit = async e => {
  e.preventDefault(); const g = id => document.getElementById(id);
  const fileInput = g('pImage');
  if (fileInput.files.length > 0 && !uploadedImageUrl) { toastMsg('⏳ Wait! Image still uploading...', true); return; }
  const weights = [...g('weightRows').children].map(r => ({ w: r.children[0].value.trim(), price: +r.children[1].value || 0, mrp: +r.children[2].value || 0 })).filter(x => x.w);
  const nutrition = [...g('nutritionRows').children].map(r => [r.children[0].value, r.children[1].value]).filter(r => r[0]);
  const id = g('pId').value;
  const res = await apiRequest('/api/admin/products', { method: 'POST', body: JSON.stringify({ action: id ? 'update' : 'add', id, name: g('pName').value, category: g('pCategory').value, stock: +g('pStock').value, weights, description: g('pDesc').value, nutrition, best_seller: g('pBest').checked, is_active: g('pActive').checked, image_url: uploadedImageUrl || (g('imgPreview').src && g('imgPreview').src.indexOf('blob:') !== 0 ? g('imgPreview').src : '') }) });
  if (res && res.success) { toastMsg('✅ Saved'); resetForm(); loadProducts(); document.querySelector('[data-tab="products"]').click(); }
};

function resetForm() { document.getElementById('productForm').reset(); document.getElementById('pId').value = ''; document.getElementById('nutritionRows').innerHTML = ''; nutRow(); document.getElementById('weightRows').innerHTML = ''; weightRow(); document.getElementById('imgPreview').style.display = 'none'; uploadedImageUrl = ''; }

async function editProduct(id) {
  const list = await apiRequest('/api/admin/products'); const p = list.find(x => x.id == id); if (!p) return;
  const g = i => document.getElementById(i);
  g('pId').value = p.id; g('pName').value = p.name; g('pCategory').value = p.category; g('pPrice').value = p.weights?.[0]?.price || ''; g('pMrp').value = p.weights?.[0]?.mrp || ''; g('pStock').value = p.stock; g('pDesc').value = p.description || ''; g('pBest').checked = !!p.best_seller; g('pActive').checked = !!p.is_active;
  g('nutritionRows').innerHTML = ''; (p.nutrition || []).forEach(r => nutRow(r[0], r[1]));
  g('weightRows').innerHTML = ''; (p.weights || []).forEach(w => weightRow(w.w, w.price, w.mrp));
  if (p.image_url) { document.getElementById('imgPreview').src = p.image_url; document.getElementById('imgPreview').style.display = 'block'; }
  document.querySelector('[data-tab="add"]').click();
}

/* ═══════════════════════════════════════════════════════════
   ORDERS — SEARCH + DATE + NEWEST FIRST + 20/PAGE + PRINT
   ═══════════════════════════════════════════════════════════ */
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function loadOrders() {
  const list = await apiRequest('/api/admin/orders');
  if (!list || !Array.isArray(list)) return;
  ALL_ORDERS = list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  if (!document.getElementById('ordersPagination')) {
    const table = document.querySelector('#tab-orders table');
    if (table) table.insertAdjacentHTML('afterend', '<div class="orders-pagination" id="ordersPagination"></div>');
  }
  currentPage = 1;
  applyOrderFilters();
}

function applyOrderFilters() {
  const q = String(document.getElementById('orderSearch')?.value || '').toLowerCase().replace(/\s+/g, '').trim();
  const from = document.getElementById('orderDateFrom')?.value || '';
  const to = document.getElementById('orderDateTo')?.value || '';
  let list = [...ALL_ORDERS];

  if (q) {
    list = list.filter(o =>
      String(o.order_uid || '').toLowerCase().replace(/\s+/g, '').includes(q) ||
      String(o.customer_name || '').toLowerCase().includes(q) ||
      String(o.phone || '').replace(/\s+/g, '').includes(q) ||
      String(o.email || '').toLowerCase().includes(q) ||
      String(o.city || '').toLowerCase().includes(q) ||
      String(o.address || '').toLowerCase().includes(q));
  }
  if (from) list = list.filter(o => String(o.created_at || '').slice(0, 10) >= from);
  if (to) list = list.filter(o => String(o.created_at || '').slice(0, 10) <= to);

  filteredOrders = list;
  currentPage = 1;
  renderOrders();
}

function clearOrderFilters() {
  const s = document.getElementById('orderSearch'); if (s) s.value = '';
  const f = document.getElementById('orderDateFrom'); if (f) f.value = '';
  const t = document.getElementById('orderDateTo'); if (t) t.value = '';
  applyOrderFilters();
}

function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  if (!tbody) return;
  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageList = filteredOrders.slice(start, start + PAGE_SIZE);

  if (!pageList.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999">No orders match your search.</td></tr>';
  } else {
    tbody.innerHTML = pageList.map(o => {
      const canPrint = ['confirmed', 'shipped', 'delivered'].includes(o.status);
      return `<tr>
        <td><strong>${o.order_uid}</strong><br><small style="color:#888">📅 ${fmtDate(o.created_at)}</small></td>
        <td><strong>${o.customer_name}</strong><br><small>📱 ${o.phone}</small><br><small>✉️ ${o.email || '—'}</small><br><small style="color:#888">📍 ${o.address}, ${o.city} - ${o.pincode}</small></td>
        <td>${(o.items || []).map(i => `${i.name} (${i.weight || ''}) ×${i.qty}`).join('<br>')}</td>
        <td><strong>${inr(o.total)}</strong></td>
        <td>${o.payment_method === 'cod' ? '💵 COD' : '💳 Online'}<br><small>${o.payment_status}</small></td>
        <td><select class="status-select" data-order="${o.id}">
          ${['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => `<option ${o.status === s ? 'selected' : ''}>${s}</option>`).join('')}
        </select></td>
        <td>${canPrint ? `<button class="icon-btn" data-print="${o.id}" title="Print courier label"><i class="fas fa-print"></i></button>` : '<small style="color:#bbb">—</small>'}</td>
      </tr>`;
    }).join('');
  }
  renderPagination(totalPages, total);
}

function renderPagination(totalPages, total) {
  const bar = document.getElementById('ordersPagination');
  if (!bar) return;
  if (totalPages <= 1) { bar.innerHTML = `<span>Showing ${total} order(s)</span>`; return; }
  let html = `<span>Page ${currentPage} of ${totalPages} (${total} orders)</span>`;
  html += `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹ Prev</button>`;
  for (let p = 1; p <= totalPages; p++) {
    if (totalPages > 9 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) { html += '<span>…</span>'; continue; }
    html += `<button class="${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }
  html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Next ›</button>`;
  bar.innerHTML = html;
}

/* Pagination + Print + Status (event delegation) */
document.addEventListener('click', e => {
  const pg = e.target.closest('[data-page]');
  if (pg && !pg.disabled) { currentPage = parseInt(pg.dataset.page, 10); renderOrders(); return; }
  const btn = e.target.closest('[data-print]');
  if (btn) { const o = ALL_ORDERS.find(x => x.id == btn.dataset.print); if (o) printCourierLabel(o); }
});

document.addEventListener('change', async e => {
  const sel = e.target.closest('[data-order]');
  if (!sel) return;
  const id = sel.dataset.order;
  const status = sel.value;
  let extra = {};
  if (status === 'cancelled') {
    const reason = prompt('❌ Enter cancellation reason (will be emailed to customer):');
    if (reason === null) { loadOrders(); return; }
    extra.reason = reason || 'Not specified';
  }
  if (status === 'shipped') {
    const vendor = prompt('🚚 Shipped through which courier? (DTDC, BlueDart, India Post...):');
    if (vendor === null) { loadOrders(); return; }
    const tracking = prompt('🔍 Tracking / AWB number (optional):');
    extra.vendor = vendor || 'Our logistics partner';
    extra.tracking = tracking || '';
  }
  await apiRequest('/api/admin/orders', { method: 'POST', body: JSON.stringify({ action: 'update_status', id: id, status: status, extra: extra }) });
  toastMsg('✅ Status updated & customer emailed');
  loadOrders();
});

function printCourierLabel(o) {
  const rows = (o.items || []).map(i => `<tr><td>${i.name} (${i.weight || ''})</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">₹${i.price}</td><td style="text-align:right">₹${i.price * i.qty}</td></tr>`).join('');
  const html = `<!DOCTYPE html><html><head><title>Label ${o.order_uid}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#111}
    .label{border:2px solid #111;max-width:820px;margin:0 auto;padding:18px}
    .top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #111;padding-bottom:14px}
    .company h1{margin:0;font-size:24px;color:#2E7D32}
    .company p{margin:2px 0;font-size:12px}
    .dest{max-width:46%}
    .dest h2{margin:0 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#555}
    .dest .name{font-size:17px;font-weight:bold}
    .dest p{margin:2px 0;font-size:13px}
    .meta{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px;padding:10px 0;border-bottom:1px dashed #777}
    table{width:100%;border-collapse:collapse;margin-top:12px;font-size:13px}
    th,td{border:1px solid #111;padding:6px 8px;text-align:left}
    .tot{text-align:right;font-size:16px;font-weight:bold;margin-top:12px}
    .cod{margin-top:6px;text-align:right;font-size:13px}
    .note{font-size:11px;color:#444;margin-top:14px}
    @media print{body{margin:0}}
  </style></head><body>
  <div class="label">
    <div class="top">
      <div class="company">
        <h1>🌿 SODESI FOODS</h1>
        <p>Plot No-158, Balipatana,</p>
        <p>Bhubaneswar, Odisha - 751003</p>
        <p>📞 +91 9658525234</p>
        <p>✉️ info@sodesifoods.com</p>
      </div>
      <div class="dest">
        <h2>Deliver To</h2>
        <div class="name">${o.customer_name}</div>
        <p>📞 ${o.phone}</p>
        <p>${o.address}</p>
        <p>${o.city} - ${o.pincode}</p>
      </div>
    </div>
    <div class="meta">
      <span><strong>Order:</strong> ${o.order_uid}</span>
      <span><strong>Date:</strong> ${fmtDate(o.created_at)}</span>
      <span><strong>Payment:</strong> ${o.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
    </div>
    <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <div class="tot">Grand Total: ₹${o.total}</div>
    ${o.payment_method === 'cod' ? `<div class="cod">💵 Collect ₹${o.total} from customer on delivery</div>` : ''}
    <p class="note">Thank you for shopping with Sodesi — Pure Nutrition From Nature 🌿</p>
  </div>
  <script>window.onload = function(){ window.print(); }<\/script>
  </body></html>`;
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.write(html);
  w.document.close();
}

/* ═══ SETTINGS ═══ */
async function loadSettings() {
  const s = await apiRequest('/api/admin/settings');
  if (!s) return;
  document.getElementById('sDelivery').value = s.delivery_charge;
  document.getElementById('sThreshold').value = s.free_delivery_threshold;
  document.getElementById('sGST').value = s.gst_percent;
  document.getElementById('sEmail').value = s.admin_email;
  document.getElementById('sWhatsApp').value = s.whatsapp_number;
}
document.getElementById('settingsForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const res = await apiRequest('/api/admin/settings', { method: 'POST', body: JSON.stringify({ action: 'update', settings: { delivery_charge: document.getElementById('sDelivery').value, free_delivery_threshold: document.getElementById('sThreshold').value, gst_percent: document.getElementById('sGST').value, admin_email: document.getElementById('sEmail').value, whatsapp_number: document.getElementById('sWhatsApp').value } }) });
  if (res && res.success) toastMsg('✅ Settings saved');
});
