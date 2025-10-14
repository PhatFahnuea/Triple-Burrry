const DRAFTS_KEY = 'admin_product_drafts';

const qs = new URLSearchParams(location.search);
const qSku = (qs.get('sku') || '').trim();

const $ = (sel) => document.querySelector(sel);
const form   = $('#product-form');
const btnDel = $('#btn-delete');
const imgPrev= $('#img-preview');

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

function loadDrafts() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}
function saveDrafts(list) {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(list || []));
}

function findBaseBySku(sku) {
  const base = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  return base.find(x => String(x.sku) === String(sku));
}

const PLACEHOLDER = '../img/placeholder.png'; // ตรวจว่าไฟล์นี้มีจริง ใช้ตัวพิมพ์เล็ก/ใหญ่ให้ตรง

function updatePreview() {
  const raw = String($('#f-img').value || '').trim();
  const path = raw.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
  imgPrev.onerror = () => {            // กัน loop error
    imgPrev.onerror = null;
    imgPrev.src = PLACEHOLDER;
  };
  imgPrev.src = path ? `../${path}` : PLACEHOLDER;
}

updatePreview();

document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'f-img') updatePreview();
});


function prefillIfEdit() {
  if (!qSku) {
    $('#form-title').textContent = 'New Product';
    btnDel.style.display = 'none';
    return;
  }
  $('#form-title').textContent = 'Edit Product';

  const drafts = loadDrafts();
  let data = drafts.find(x => String(x.sku) === qSku) || findBaseBySku(qSku);

  if (!data) { location.replace('../admin/Product.html'); return; }

  $('#f-sku').value    = data.sku || qSku;
  $('#f-name').value   = data.name || '';
  $('#f-price').value  = Number(data.price || 0);
  $('#f-status').value = data.status || 'Active';
  $('#f-tags').value   = Array.isArray(data.tags) ? data.tags.join(', ') : '';
  $('#f-img').value    = (data.img || '').replace(/^(\.\/|\.\.\/)+/,'').replace(/^\/+/, '');
  $('#f-desc').value   = data.desc || '';

  btnDel.style.display = 'inline-block';
  updatePreview();
}

document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'f-img') updatePreview();
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = String($('#f-name').value || '').trim();
  if (!name) return;

  const sku     = String($('#f-sku').value || qSku || slugify(name));
  const price   = Number($('#f-price').value || 0);
  const status  = String($('#f-status').value || 'Active');
  const tagsRaw = String($('#f-tags').value || '');
  let   tags    = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);

  if (!tags.map(t => t.toLowerCase()).includes('new')) {
    tags.unshift('new');
  }

  const img  = String($('#f-img').value || '')
    .trim().replace(/^(\.\/|\.\.\/)+/,'').replace(/^\/+/, '');
  const desc = String($('#f-desc').value || '').trim();

  const drafts = loadDrafts();
  const i = drafts.findIndex(x => String(x.sku) === sku);

  const row = {
    sku, name, price, status, tags, img, desc,
    updatedAt: Date.now(),
  };

  if (i >= 0) drafts[i] = row; else drafts.push(row);
  saveDrafts(drafts);

  // กลับไปหน้ารายการ
  location.replace('../admin/Product.html');
});

btnDel?.addEventListener('click', () => {
  if (!confirm('Delete this draft?')) return;
  const sku = String($('#f-sku').value || qSku || '').trim();
  if (!sku) { location.replace('../admin/Product.html'); return; }
  const drafts = loadDrafts().filter(x => String(x.sku) !== sku);
  saveDrafts(drafts);
  location.replace('../admin/Product.html');
});

prefillIfEdit();
