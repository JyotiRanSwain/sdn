const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8V7EceiTzzSw2Yq9GA1tt7SihDHEXLPAu9KJACD5z-2NlGYSzlvnLYVURGAFPde0GRw/exec';
const TOKEN = sessionStorage.getItem('sodesi_admin_token') || '';
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
let ORDERS = {};
let uploadedImageUrl = '';

if (!TOKEN) window.location.href = 'login.html';

document.getElementById('logoutBtn').onclick = () => {
  sessionStorage.clear();
  location.href = 'login.html';
};

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

    // 🛑 DEBUG MODE: Do NOT auto-logout. Show the error so we can read it!
    if (text.indexOf('<!DOCTYPE html>') !== -1 || text.indexOf('<html') !== -1 || text.indexOf('Sorry') !== -1) {
       console.error("GAS ERROR:", text);
       alert("⚠️ Server Error!\n\nGoogle returned an error page instead of data. This usually means:\n1. You didn't deploy a 'New Version'\n2. There is a typo in Code.gs\n\nOpen browser Console (F12) to see details.");
       return null; 
    }

    let data;
    try { data = JSON.parse(text); } catch(e) {
       alert("Invalid JSON from server:\n" + text.substring(0, 200));
       return null;
    }

    if (data && data.error === 'Unauthorized - Please login') {
       alert("Token rejected by server.");
       return null;
    }
    return data;
  } catch(err) {
    alert("Network error: " + err.message);
    return null;
  }
}

function toastMsg(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `position:fixed;bottom:30px;right:30px;background:${isError ? '#c62828' : '#1B5E20'};color:#fff;padding:12px 22px;border-radius:50px;z-index:99999;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,0.2)`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}

document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(x => x.style.display = 'none');
  b.classList.add('active');
  document.getElementById('tab-' + b.dataset.tab).style.display = '';
  if (b.dataset.tab === 'orders') loadOrders();
  if (b.dataset.tab === 'products') { loadProducts(); loadStats(); }
  if (b.dataset.tab === 'settings') loadSettings();
});

async function loadStats() {
  const s = await apiRequest('/api/admin/stats');
  if (!s) return;
  document.getElementById('stProducts').textContent = s.products;
  document.getElementById('stOrders').textContent = s.orders;
  document.getElementById('stRevenue').textContent = inr(s.revenue);
  document.getElementById('stLow').textContent = s.lowStock;
}
loadStats();

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

function nutRow(l='',v='') { const d=document.createElement('div'); d.className='nut-row'; d.innerHTML=`<input placeholder="Label" value="${l}"><input placeholder="Value" value="${v}"><button type="button" class="icon-btn danger" onclick="this.parentNode.remove()"><i class="fas fa-times"></i></button>`; document.getElementById('nutritionRows').appendChild(d); }
document.getElementById('addNutRow').onclick = () => nutRow(); nutRow('Energy (kcal)',''); nutRow('Protein (g)','');

function weightRow(w='',p='',m='') { const d=document.createElement('div'); d.className='nut-row'; d.innerHTML=`<input placeholder="Weight" value="${w}"><input type="number" placeholder="Price" value="${p}"><input type="number" placeholder="MRP" value="${m}"><button type="button" class="icon-btn danger" onclick="this.parentNode.remove()"><i class="fas fa-times"></i></button>`; document.getElementById('weightRows').appendChild(d); }
document.getElementById('addWeightRow').onclick = () => weightRow(); weightRow('1kg','','');

document.getElementById('pImage').onchange = async function() {
  const f = this.files[0]; if(!f) return;
  document.getElementById('imgPreview').src = URL.createObjectURL(f); document.getElementById('imgPreview').style.display='block';
  const r = new FileReader(); r.onload = async e => {
    toastMsg('⏫ Uploading...');
    const res = await apiRequest('/api/admin/upload', { method: 'POST', body: JSON.stringify({ image: e.target.result.split(',')[1], mimeType: f.type, filename: f.name }) });
    if(res && res.success) { uploadedImageUrl = res.url; toastMsg('✅ Uploaded'); } else toastMsg('❌ Failed', true);
  }; r.readAsDataURL(f);
};

document.getElementById('productForm').onsubmit = async e => {
  e.preventDefault(); const g=id=>document.getElementById(id);
  const fileInput = g('pImage');
  if (fileInput.files.length > 0 && !uploadedImageUrl) {
     toastMsg('⏳ Please wait! Image is still uploading to Google Drive...', true);
     return; // Stops the form from saving
  }
  const weights=[...g('weightRows').children].map(r=>({w:r.children[0].value.trim(),price:+r.children[1].value||0,mrp:+r.children[2].value||0})).filter(x=>x.w);
  const nutrition=[...g('nutritionRows').children].map(r=>[r.children[0].value,r.children[1].value]).filter(r=>r[0]);
  const id=g('pId').value;
  const res = await apiRequest('/api/admin/products', { method: 'POST', body: JSON.stringify({ action: id?'update':'add', id, name:g('pName').value, category:g('pCategory').value, stock:+g('pStock').value, weights, description:g('pDesc').value, nutrition, best_seller:g('pBest').checked, is_active:g('pActive').checked, image_url: uploadedImageUrl || (g('imgPreview').src && g('imgPreview').src.indexOf('blob:') !== 0 ? g('imgPreview').src : '') }) });
  if(res && res.success) { toastMsg('✅ Saved'); resetForm(); loadProducts(); document.querySelector('[data-tab="products"]').click(); }
};

function resetForm() { document.getElementById('productForm').reset(); document.getElementById('pId').value=''; document.getElementById('nutritionRows').innerHTML=''; nutRow(); document.getElementById('weightRows').innerHTML=''; weightRow(); document.getElementById('imgPreview').style.display='none'; uploadedImageUrl=''; }

async function editProduct(id) {
  const list = await apiRequest('/api/admin/products'); const p = list.find(x=>x.id==id); if(!p) return;
  const g=i=>document.getElementById(i); g('pId').value=p.id; g('pName').value=p.name; g('pCategory').value=p.category; g('pPrice').value=p.weights?.[0]?.price||''; g('pMrp').value=p.weights?.[0]?.mrp||''; g('pStock').value=p.stock; g('pDesc').value=p.description||''; g('pBest').checked=!!p.best_seller; g('pActive').checked=!!p.is_active;
  g('nutritionRows').innerHTML=''; (p.nutrition||[]).forEach(r=>nutRow(r[0],r[1])); g('weightRows').innerHTML=''; (p.weights||[]).forEach(w=>weightRow(w.w,w.price,w.mrp));
  if(p.image_url){document.getElementById('imgPreview').src=p.image_url; document.getElementById('imgPreview').style.display='block';}
  document.querySelector('[data-tab="add"]').click();
}

async function loadOrders() {
  const list = await apiRequest('/api/admin/orders'); if(!list) return; ORDERS = Object.fromEntries(list.map(o=>[o.id,o]));
  document.getElementById('ordersTbody').innerHTML = list.map(o=>`<tr><td><strong>${o.order_uid}</strong></td><td>${o.customer_name}<br>${o.phone}</td><td>${(o.items||[]).map(i=>i.name+' x'+i.qty).join('<br>')}</td><td>${inr(o.total)}</td><td>${o.payment_method}</td><td><select class="status-select" data-order="${o.id}">${['placed','confirmed','shipped','delivered','cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select></td></tr>`).join('');
}
loadOrders();

document.getElementById('ordersTbody')?.addEventListener('change', async e => {
  const sel = e.target.closest('[data-order]'); if(!sel) return;
  await apiRequest('/api/admin/orders', { method: 'POST', body: JSON.stringify({ action: 'update_status', id: sel.dataset.order, status: sel.value }) });
  toastMsg('✅ Status updated');
});

async function loadSettings() {
  const s = await apiRequest('/api/admin/settings'); if(!s) return;
  document.getElementById('sDelivery').value = s.delivery_charge; document.getElementById('sThreshold').value = s.free_delivery_threshold;
  document.getElementById('sGST').value = s.gst_percent; document.getElementById('sEmail').value = s.admin_email; document.getElementById('sWhatsApp').value = s.whatsapp_number;
}
document.getElementById('settingsForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const res = await apiRequest('/api/admin/settings', { method: 'POST', body: JSON.stringify({ action: 'update', settings: { delivery_charge: document.getElementById('sDelivery').value, free_delivery_threshold: document.getElementById('sThreshold').value, gst_percent: document.getElementById('sGST').value, admin_email: document.getElementById('sEmail').value, whatsapp_number: document.getElementById('sWhatsApp').value } }) });
  if(res && res.success) toastMsg('✅ Settings saved');
});
