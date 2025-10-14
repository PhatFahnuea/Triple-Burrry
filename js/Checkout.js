const CART_KEY = 'cart';
const $ = s => document.querySelector(s);
const moneyTHB = n => `฿${Number(n).toLocaleString('th-TH')}`;

function loadCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)||'[]'); } catch { return []; } }


function showStep(name){
  $('#sec-delivery').hidden = name !== 'delivery';
  $('#sec-payment').hidden  = name !== 'payment';
  history.replaceState(null, '', `?step=${name}`);
}

const step = new URLSearchParams(location.search).get('step') || 'delivery';
showStep(step);

// ปุ่ม Next -> Payment (ตรวจง่าย ๆ ก่อนข้าม)
$('#go-payment')?.addEventListener('click', ()=>{
  const required = ['country','first','last','address','city','postal'];
  for(const id of required){
    const el = document.getElementById(id);
    if(!el || !el.value.trim()){ el.focus(); el.reportValidity?.(); return; }
  }
  showStep('payment');
});

// ปุ่ม Back (ถ้ามีใน UI)
document.getElementById('back-delivery')?.addEventListener('click', ()=>{
  showStep('delivery');
});

// ----- SUMMARY -----
const list = $('#summary-list');
function renderSummary(){
  const cart = loadCart();
  if(cart.length === 0){
    list.innerHTML = `<div class="row"><span>ตะกร้าว่างอยู่</span><span>${moneyTHB(0)}</span></div>`;
    return;
  }
  const rows = cart.map(p => `
    <div class="row">
      <span>${p.name} × ${p.qty||1}</span>
      <span>${moneyTHB((p.price||0)*(p.qty||1))}</span>
    </div>
  `).join('');
  const subtotal = cart.reduce((s,p)=> s + (p.price||0)*(p.qty||1), 0);
  list.innerHTML =
    `${rows}<hr class="sep">
     <div class="row"><span>Delivery</span><span>Free</span></div>
     <div class="row total"><span>Total</span><span>${moneyTHB(subtotal)}</span></div>`;
}
renderSummary();

$('#card')?.addEventListener('input', e=>{
  let v = e.target.value.replace(/\D/g,'').slice(0,16);
  e.target.value = v.replace(/(\d{4})(?=\d)/g,'$1 ');
});
$('#exp')?.addEventListener('input', e=>{
  let v = e.target.value.replace(/\D/g,'').slice(0,4);
  if(v.length>=3) v = v.slice(0,2) + '/' + v.slice(2);
  e.target.value = v;
});

$('#payment-form')?.addEventListener('submit', e=>{
  e.preventDefault();
  const required = ['method','card','exp','cvc','holder'];
  for(const id of required){
    const el = document.getElementById(id);
    if(!el || !el.value.trim()){ el.focus(); el.reportValidity?.(); return; }
  }
  alert('ชำระเงินสำเร็จ (เดโม่)');
  localStorage.removeItem(CART_KEY);
  location.href = './ShopMain.html';
});
