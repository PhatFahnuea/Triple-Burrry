// addcart.js
const CART_KEY = 'cart';
const $ = s => document.querySelector(s);

const params = new URLSearchParams(location.search);
const sku = params.get('id'); // มาจาก Shop: addcart.html?id=<sku>

const product = (window.PRODUCTS || []).find(p => p.sku === sku) || window.PRODUCTS?.[0];
if (!product) {
  document.body.innerHTML = '<p style="padding:24px">ไม่พบสินค้า</p>';
  throw new Error('No product');
}

// ใส่ข้อมูลลงหน้าจอ
const detail = document.querySelector('.detail');
detail.dataset.sku = product.sku;
detail.dataset.price = product.price;

const imgEl = document.querySelector('.frame img');
imgEl.src = product.img; imgEl.alt = product.name;

document.querySelector('.info h1').textContent = product.name;
document.querySelector('.price').textContent = `฿ ${product.price.toLocaleString('th-TH')}`;
const descEl = document.querySelector('.desc');
if (descEl) descEl.textContent = product.desc || '';

const MIN=1, MAX=99;
let qty = MIN;
const minus = document.querySelector('.minus');
const plus  = document.querySelector('.plus');
const val   = document.querySelector('.val');
const add   = document.querySelector('.add');

function update(){ val.textContent = qty; minus.disabled = qty<=MIN; plus.disabled = qty>=MAX; }
minus.onclick = ()=>{ if(qty>MIN){ qty--; update(); } };
plus .onclick = ()=>{ if(qty<MAX){ qty++; update(); } };

add.onclick = ()=>{
  const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  const i = cart.findIndex(it => it.sku === product.sku);
  if (i >= 0) {
    cart[i].qty = Math.min(MAX, (cart[i].qty || 0) + qty);
    cart[i].name = product.name; cart[i].price = product.price; cart[i].img = product.img;
  } else {
    cart.push({ sku: product.sku, name: product.name, price: product.price, img: product.img, qty });
  }
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

  add.textContent = 'Added ✓';
  add.setAttribute('aria-disabled','true');
  setTimeout(()=>{ add.textContent='Add to cart'; add.removeAttribute('aria-disabled'); /* location.href='../My Cart.html'; */ }, 900);
};

update();
