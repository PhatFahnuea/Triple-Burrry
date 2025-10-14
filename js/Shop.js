const CART_KEY   = 'cart';
const DRAFTS_KEY = 'admin_product_drafts';
const moneyTHB   = n => `฿${Number(n || 0).toLocaleString('th-TH')}`;

const grid    = document.querySelector('.product-grid');
const titleEl = document.querySelector('.shop-header h2');
const countEl = document.querySelector('.shop-header p');
if (!grid || !titleEl || !countEl) {
  console.warn('[Shop.js] Missing required DOM. Abort rendering.');
}

const parts = location.pathname.replace(/\/+$/, '').split('/');
const depthToRoot = Math.max(0, parts.length - 2);
const ROOT_PREFIX = '../'.repeat(depthToRoot);
const inShopSubfolder = /\/shop\/[^/]+\/[^/]+$/i.test(location.pathname);
const SHOP_PREFIX = inShopSubfolder ? '../' : './';

const normImg = (s) => {
  const x = (s || '').trim();
  if (!x) return '../img/placeholder-square.png';
  // ถ้าพิมพ์มาเป็น /img/... หรือ img/... ให้แปลงเป็น ../img/...
  const clean = x.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
  return `../${clean}`;
};

const params      = new URLSearchParams(location.search);
const collection  = (window.FORCE_COLLECTION || '').trim() || params.get('collection');
const gender      = (window.FORCE_GENDER || '').trim()     || params.get('gender');
const category    = (window.FORCE_CATEGORY || '').trim()   || params.get('category');
const type        = (window.FORCE_TYPE || '').trim()       || params.get('type');

const splitVals = v => (v ? String(v).split(',').map(s => s.trim()).filter(Boolean) : []);
const wants = {
  collection: splitVals(collection),
  gender:     splitVals(gender),
  category:   splitVals(category),
  type:       splitVals(type),
};

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const toModel = (p, isDraft = false) => ({
  sku:   p.sku || slugify(p.name || ''),
  name:  p.name || 'Untitled',
  price: Number(p.price || 0),
  img:   (p.img || 'img/placeholder-square.png').replace(/^(\.\/|\.\.\/)+/,'').replace(/^\/+/, ''),
  desc:  p.desc || '',
  tags:  Array.isArray(p.tags) ? p.tags : [],
  updatedAt: Number(p.updatedAt || 0), // ถ้ามี (จาก draft)
  __draft: !!isDraft,
});

const BASE = (Array.isArray(window.PRODUCTS) ? window.PRODUCTS : []).map(p => toModel(p, false));

function loadDrafts() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    if (!Array.isArray(d)) return [];
    return d.map(p => toModel(p, true));
  } catch { return []; }
}

function mergedForDisplay() {
  const map = new Map(BASE.map(p => [p.sku || slugify(p.name), p]));
  for (const d of loadDrafts()) {
    const key = d.sku || slugify(d.name);
    map.set(key, d);
  }
  const list = Array.from(map.values());

  const hasNewTag = (p) => Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase() === 'new');
  list.sort((a, b) => {
    if (a.__draft !== b.__draft) return a.__draft ? -1 : 1;
    if (a.updatedAt !== b.updatedAt) return (b.updatedAt || 0) - (a.updatedAt || 0);
    if (hasNewTag(a) !== hasNewTag(b)) return hasNewTag(b) - hasNewTag(a);
    return 0;
  });

  return list;
}

const hasAny = (tags, needArr) => {
  if (!needArr.length) return true;
  const tlc = Array.isArray(tags) ? tags.map(t => String(t).toLowerCase()) : [];
  return needArr.some(v => tlc.includes(String(v).toLowerCase()));
};

function applyFilter(list) {
  return list.filter(p =>
    hasAny(p.tags, wants.collection) &&
    hasAny(p.tags, wants.gender) &&
    hasAny(p.tags, wants.category) &&
    hasAny(p.tags, wants.type)
  );
}

(function ensureBadgeCss(){
  if (document.getElementById('shop-badges-css')) return;
  const css = `
  .badge-new{position:absolute;top:10px;left:10px;background:#111;color:#fff;padding:4px 8px;border-radius:999px;font-size:12px}
  .product-card{position:relative}
  .btn-disabled{opacity:.55;cursor:not-allowed;background:#a0a79a !important}
  `;
  const tag = document.createElement('style');
  tag.id = 'shop-badges-css';
  tag.textContent = css;
  document.head.appendChild(tag);
})();


function renderAll() {
  const all  = mergedForDisplay();
  const list = applyFilter(all);

  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
  const crumbs = [];
  if (gender)   crumbs.push(cap(gender));
  if (category) crumbs.push(cap(category));
  if (type)     crumbs.push(cap(type));
  if (collection && !crumbs.length) crumbs.push('New Collection');
  titleEl.textContent = crumbs.length ? crumbs.join(' / ') : 'All';
  countEl.textContent = `${list.length} ${list.length === 1 ? 'Product' : 'Products'}`;

  const hasNewTag = (p) => Array.isArray(p.tags) && p.tags.some(t => String(t).toLowerCase() === 'new');

  const cardBase = (p) => `
    <article class="product-card">
      ${hasNewTag(p) ? '<span class="badge-new">NEW</span>' : ''}
      <a href="${SHOP_PREFIX}AddCart.html?id=${encodeURIComponent(p.sku || '')}" style="text-decoration:none;color:inherit">
        <img src="${normImg(p.img)}" alt="${p.name || ''}" onerror="this.src='${normImg('img/placeholder-square.png')}'">
        <h3>${p.name || 'Untitled'}</h3>
        <p class="brand">Triple Burry</p>
        <p class="price">${moneyTHB(p.price)}</p>
      </a>
      <button class="btn-quick" data-sku="${p.sku || ''}" style="margin-top:8px;padding:10px;border:0;border-radius:10px;background:#8c9871;color:#fff;cursor:pointer;">Add to cart</button>
    </article>
  `;

  const cardDraft = (p) => `
  <article class="product-card" style="opacity:.98;">
    <a href="javascript:void(0)" style="text-decoration:none;color:inherit;pointer-events:none;">
      <img src="${normImg(p.img)}" alt="${p.name || ''}" onerror="this.src='${normImg('img/placeholder-square.png')}'">
      <h3>${p.name || 'Untitled'}</h3>
      <p class="brand">Triple Burry</p>
      <p class="price">${moneyTHB(p.price)}</p>
    </a>
    <button class="btn-quick" aria-disabled="true" title="Preview only">Add to cart</button>
  </article>
`;


  grid.innerHTML = list.length
    ? list.map(p => p.__draft ? cardDraft(p) : cardBase(p)).join('')
    : `<p style="grid-column:1/-1;text-align:center;opacity:.7">ยังไม่มีสินค้าสำหรับหมวดนี้</p>`;

  // ให้ Quick Add กดได้เฉพาะของจริง
  window.__SHOP_BASE_INDEX__ = BASE.reduce((m, p) => { m[String(p.sku)] = p; return m; }, {});
}
renderAll();

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-quick');
  if (!btn) return;
  e.preventDefault();
  if (btn.dataset.draft === '1' || btn.disabled) return;



  const sku = btn.dataset.sku;
  const baseIndex = window.__SHOP_BASE_INDEX__ || {};
  const p = baseIndex[String(sku)];
  if (!p) return; // draft → เงียบ ๆ

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const i = cart.findIndex(x => String(x.sku) === String(sku));

  if (i >= 0) cart[i].qty = Math.min(99, (cart[i].qty || 0) + 1);
  else cart.push({ sku: p.sku, name: p.name, price: p.price, img: normImg(p.img), qty: 1 });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  btn.textContent = 'Added ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = 'Add to cart'; btn.disabled = false; }, 800);
});

window.addEventListener('storage', (e) => { if (e.key === DRAFTS_KEY) renderAll(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') renderAll(); });
