
const DRAFTS_KEY = 'admin_product_drafts';

const money = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n || 0);

const slugify = s =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const toRowModel = (p, source) => ({
  sku:   p.sku || slugify(p.name || ''),
  name:  p.name || '-',
  price: Number(p.price || 0),
  img:   (p.img || 'img/placeholder.png').replace(/^(\.\/|\.\.\/)+/,'').replace(/^\/+/, ''),
  desc:  p.desc || '',
  status: p.status || 'Active',
  tags:  Array.isArray(p.tags) ? p.tags : [],
  __src: source, // 'base' | 'draft'
});

function loadDrafts() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    return Array.isArray(d) ? d : [];
  } catch { return []; }
}

function mergedList() {
  const base = (Array.isArray(window.PRODUCTS) ? window.PRODUCTS : []).map(p => toRowModel(p, 'base'));
  const drafts = loadDrafts().map(p => toRowModel(p, 'draft'));

  const map = new Map(base.map(p => [p.sku, p])); 
  for (const d of drafts) map.set(d.sku, d);      
  return Array.from(map.values());
}

function renderTable() {
  const tbody = document.querySelector('#products-table tbody');
  if (!tbody) return;

  const list = mergedList();

  const statusDot = (s) => {
    const key = String(s||'').toLowerCase();
    return `<span class="${key==='active'?'dot dot-blue':'dot'}"></span> ${s||'Inactive'}`;
  };

  tbody.innerHTML = list.map(p => `
    <tr>
      <td>
        <div class="row-flex">
          <img src="../${p.img}" alt="${p.name}" onerror="this.src='../img/placeholder.png'" style="width:80px;height:80px;object-fit:cover;border-radius:10px;border:1px solid #eee">
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.desc || '-'}</td>
      <td class="num">${money(p.price)}</td>
      <td>${statusDot(p.status)}</td>
      <td>
        <a class="link-edit" href="../admin/Newprod.html?sku=${encodeURIComponent(p.sku)}">Edit</a>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', renderTable);
