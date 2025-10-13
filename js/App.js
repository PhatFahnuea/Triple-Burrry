// ========== Utils ==========
const formatTHB = (n) => new Intl.NumberFormat("th-TH",{style:"currency",currency:"THB"}).format(n);
const daysBetween = (d1,d2)=>Math.floor(Math.abs(new Date(d2)-new Date(d1))/(1000*60*60*24));
const todayISO = new Date().toISOString().slice(0,10);

// ========== MOCK LISTINGS (one-of-a-kind) ==========
const LISTINGS = [
  // status: 'listed' | 'reserved' | 'sold'
  { sku:'TB-L-001', name:'Vintage Denim Jacket (M)',  price: 890, listed_at:'2025-09-20', sold_at:'2025-10-08', status:'sold' },
  { sku:'TB-L-002', name:'Handmade Linen Tote',       price:1290, listed_at:'2025-10-05', sold_at:null,         status:'listed' },
  { sku:'TB-L-003', name:'Crochet Beanie',            price: 320, listed_at:'2025-09-25', sold_at:null,         status:'listed' },
  { sku:'TB-L-004', name:'Reworked Graphic Tee (L)',  price: 450, listed_at:'2025-10-07', sold_at:'2025-10-08', status:'sold' },
  { sku:'TB-L-005', name:'Upcycled Patchwork Skirt',  price: 720, listed_at:'2025-09-12', sold_at:null,         status:'listed' },
  { sku:'TB-L-006', name:'Canvas Sneakers (2nd)',     price: 540, listed_at:'2025-09-27', sold_at:null,         status:'reserved' },
  { sku:'TB-L-007', name:'Macramé Plant Hanger',      price: 260, listed_at:'2025-10-02', sold_at:null,         status:'listed' },
];

// ========== KPIs ==========
function getKPIs(listings){
  const live = listings.filter(x=>x.status==='listed').length;
  const reserved = listings.filter(x=>x.status==='reserved').length;
  const sold7d = listings.filter(x=>x.status==='sold' && daysBetween(x.sold_at,todayISO)<=7).length;

  const soldDays = listings
    .filter(x=>x.status==='sold' && x.sold_at)
    .map(x=>daysBetween(x.listed_at,x.sold_at));
  const avgDaysToSell = soldDays.length ? Math.round(soldDays.reduce((a,b)=>a+b,0)/soldDays.length) : 0;

  return { live, reserved, sold7d, avgDaysToSell };
}

// ========== Render KPI cards (One-of-a-kind focus) ==========
(function renderKpiCards(){
  const root = document.getElementById('cards-root');
  if(!root) return;

  const cards = [
     { title: 'Orders Today', value: 26,   diff: '+8%'  , icon: '🧾' },
    { title: 'Total Orders', value: 1284, diff: '+2%'  , icon: '📦' },
    { title: 'Completed',    value: 1190, diff: '+1.5%', icon: '✅' },
    { title: 'New Users',    value: 12,   diff: '+3%'  , icon: '👤' },
  ];
  const trendClass = d => (typeof d==='string' && d.trim().startsWith('-')) ? 'down' : 'up';

  root.innerHTML = cards.map(c=>`
    <article class="card">
      <header class="card-head">
        <h3>${c.title}</h3>
        <button class="more" aria-label="More">⋮</button>
      </header>
      <div class="stat">
        <div class="stat-icon" aria-hidden="true">${c.icon}</div>
        <div class="stat-main">
          <div class="stat-value">${Number(c.value).toLocaleString('en-US')}</div>
          <div class="stat-diff ${trendClass(c.diff)}">${c.diff}</div>
        </div>
      </div>
    </article>
  `).join('');
})();

// ========== Aged Items (>14d) ==========
function renderAgedItems(listings, thresholdDays=14, limit=5){
  const el = document.getElementById('aged-list'); if(!el) return;

  const aged = listings
    .filter(x=>x.status==='listed' || x.status==='reserved')
    .map(x=>({...x, age:daysBetween(x.listed_at,todayISO)}))
    .filter(x=>x.age>=thresholdDays)
    .sort((a,b)=>b.age-a.age)
    .slice(0,limit);

  el.innerHTML = aged.map(i=>`
    <li class="best-item">
      <div class="thumb" aria-hidden="true"></div>
      <div class="meta">
        <strong>${i.name}</strong>
        <small>${i.age} days listed • ${i.status}</small>
      </div>
      <div class="pricecol"><span class="price">${formatTHB(i.price)}</span></div>
    </li>
  `).join('') || `<li class="muted">No aged items 🎉</li>`;
}

// ========== Newly Listed (<=7d) ==========
function renderNewlyListed(listings, windowDays=7, limit=5){
  const el = document.getElementById('newly-list'); if(!el) return;

  const recent = listings
    .filter(x=>x.status==='listed' && daysBetween(x.listed_at,todayISO)<=windowDays)
    .sort((a,b)=>new Date(b.listed_at)-new Date(a.listed_at))
    .slice(0,limit);

  el.innerHTML = recent.map(i=>`
    <li class="best-item">
      <div class="thumb" aria-hidden="true"></div>
      <div class="meta">
        <strong>${i.name}</strong>
        <small>listed ${i.listed_at}</small>
      </div>
      <div class="pricecol"><span class="price">${formatTHB(i.price)}</span></div>
    </li>
  `).join('') || `<li class="muted">No new listings</li>`;
}

// ========== Boot ==========
renderAgedItems(LISTINGS);
renderNewlyListed(LISTINGS);
