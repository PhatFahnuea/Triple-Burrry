// myCart.js
/* ===== Utilities ===== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const CART_KEY = 'cart';
const moneyTHB = n => `฿${Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0 })}`;

/* ===== Load / Save ===== */
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  catch { return []; }
}
function saveCart(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); }

/* ===== Fix image path (วิธี 2) ===== */
const normImg = (s) => {
  const x = (s || '').trim();
  if (!x) return 'img/placeholder-square.png';
  const withoutDomain = x.replace(/^https?:\/\/[^/]+\/wdt68\/group\/cs\/sec2\/CS07\//, '');
  const noDotPrefix   = withoutDomain.replace(/^(\.\/|\.\.\/)+/, '');
  const clean         = noDotPrefix.replace(/^\/+/, '');
  return clean || 'img/placeholder-square.png';
};

/* ===== Render ===== */
const listEl = $('#cart-items');
const subEl  = $('#sum-subtotal');
const totEl  = $('#sum-total');

function render() {
  const cart = loadCart();
  listEl.innerHTML = '';

  if (cart.length === 0) {
    listEl.innerHTML = `<div class="empty">ตะกร้ายังว่างอยู่ — <a href="./Shop/ShopMain.html">กลับไปเลือกสินค้า</a></div>`;
    subEl.textContent = moneyTHB(0);
    totEl.textContent = moneyTHB(0);
    return;
  }

  let subtotal = 0;

  cart.forEach((p, i) => {
    const qty   = Math.max(1, Number(p.qty || 1));
    const price = Number(p.price || 0);
    subtotal += price * qty;

    const row = document.createElement('article');
    row.className = 'cart-item';
    row.dataset.index = i;

    row.innerHTML = `
      <div class="cart-thumb">
        <div class="cart-thumb-frame">
          <img src="${normImg(p.img)}"
               alt="${p.name || ''}"
               onerror="this.src='img/placeholder-square.png'">
        </div>
      </div>
      <div class="cart-info">
        <h3 class="cart-item-name">${p.name || ''}</h3>
        <div class="cart-item-price">${moneyTHB(price)}</div>

        <div class="cart-controls">
          <div class="qty">
            <button class="minus" aria-label="decrease">−</button>
            <div class="val" aria-live="polite">${qty}</div>
            <button class="plus" aria-label="increase">+</button>
          </div>
          <button class="remove" title="ลบสินค้า">Remove</button>
        </div>
      </div>
    `;
    // ✅ สำคัญ: เพิ่ม row เข้า DOM
    listEl.appendChild(row);
  }); // ✅ ปิด forEach ให้เรียบร้อย

  // ✅ อัปเดตราคารวมหลังวนครบ
  subEl.textContent = moneyTHB(subtotal);
  totEl.textContent = moneyTHB(subtotal);
}

/* ===== Events: + / − / Remove ===== */
listEl.addEventListener('click', (e) => {
  const row = e.target.closest('.cart-item');
  if (!row) return;

  const i = Number(row.dataset.index);
  const cart = loadCart();
  const MIN = 1, MAX = 99;

  if (e.target.classList.contains('minus') || e.target.classList.contains('plus')) {
    const valEl = row.querySelector('.qty .val');
    let q = Number(valEl.textContent) || 1;
    if (e.target.classList.contains('minus')) q = Math.max(MIN, q - 1);
    if (e.target.classList.contains('plus'))  q = Math.min(MAX, q + 1);
    cart[i].qty = q;
    saveCart(cart);
    valEl.textContent = q;

    const subtotal = cart.reduce((s, p) => s + Number(p.price || 0) * Math.max(1, Number(p.qty || 1)), 0);
    subEl.textContent = moneyTHB(subtotal);
    totEl.textContent = moneyTHB(subtotal);
  }

  if (e.target.classList.contains('remove')) {
    cart.splice(i, 1);
    saveCart(cart);
    render();
  }
});

/* ===== Checkout navigation (เลือกเริ่มที่ Delivery) ===== */
$('#btn-checkout')?.addEventListener('click', () => {
  const cart = loadCart();
  if (!cart.length) return alert('ตะกร้าว่างอยู่');
  location.href = './Shop/Checkout.html?step=delivery';
  // หรือเริ่มที่ Payment:
  // location.href = './Shop/Checkout.html?step=payment';
});

/* ===== First paint ===== */
render();
