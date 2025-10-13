const CART_KEY = 'cart';
const moneyTHB = n => `฿${Number(n).toLocaleString('th-TH')}`;
const grid = document.querySelector('.product-grid');

// ฟังก์ชันทำความสะอาดพาธรูปให้ใช้จากตำแหน่ง /shop/
const normImg = (s) => {
  const x = (s || '').trim();
  if (!x) return '../img/placeholder-square.png';
  // ถ้าพิมพ์มาเป็น /img/... หรือ img/... ให้แปลงเป็น ../img/...
  const clean = x.replace(/^(\.\/|\.\.\/)+/, '').replace(/^\/+/, '');
  return `../${clean}`;
};

// วาดการ์ดสินค้า
grid.innerHTML = (window.PRODUCTS || []).map(p => `
  <article class="product-card">
    <a href="./AddCart.html?id=${encodeURIComponent(p.sku)}" style="text-decoration:none;color:inherit">
      <img src="${normImg(p.img)}" alt="${p.name}" onerror="this.src='../img/placeholder-square.png'">
      <h3>${p.name}</h3>
      <p class="brand">Triple Burry</p>
      <p class="price">${moneyTHB(p.price)}</p>
    </a>
    <button class="btn-quick" data-sku="${p.sku}" style="margin-top:8px;padding:10px;border:0;border-radius:10px;background:#8c9871;color:#fff;cursor:pointer;">Add to cart</button>
  </article>
`).join('');

// Quick add ลง localStorage
grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-quick');
  if (!btn) return;

  e.preventDefault();

  const sku = btn.dataset.sku;
  const p = (window.PRODUCTS || []).find(x => x.sku === sku);
  if (!p) return;

  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const i = cart.findIndex(x => x.sku === sku);

  if (i >= 0) cart[i].qty = Math.min(99, (cart[i].qty || 0) + 1);
  else cart.push({ sku: p.sku, name: p.name, price: p.price, img: normImg(p.img), qty: 1 });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  btn.textContent = 'Added ✓';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = 'Add to cart'; btn.disabled = false; }, 800);
});
