// ---- Mock products (มือสอง ส่วนใหญ่มี 1 ชิ้น) ----
const PRODUCTS = [
  { name: "Kavin",   desc: "Lorem Ipsum", price: 350, img: "", status: "Active" },
  { name: "Komael",  desc: "Lorem Ipsum", price: 290, img: "", status: "Active" },
  { name: "Nikhil",  desc: "Lorem Ipsum", price: 450, img: "", status: "Active" },
  { name: "Shivam",  desc: "Lorem Ipsum", price: 200, img: "", status: "Active" },
  { name: "Shivam",  desc: "Lorem Ipsum", price: 540, img: "", status: "Active" },
];

const formatTHB = (n) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(n);

const statusDot = (s) => {
  const cls = s === "Active" ? "dot dot-blue" : "dot";
  return `<span class="${cls}"></span> ${s}`;
};

(function renderProducts(){
  const tbody = document.querySelector("#products-table tbody");
  if (!tbody) return;

  tbody.innerHTML = PRODUCTS.map(p => `
    <tr>
      <td>
        <div class="row-flex">
          <img src="../img/etc/cutie.png" alt="Profile" 
               onerror="this.src='../img/placeholder.png'">
          <span>${p.name}</span>
        </div>
      </td>
      <td>${p.desc}</td>
      <td class="num">${formatTHB(p.price)}</td>
      <td>${statusDot(p.status)}</td>
      <td><a href="#" class="link-edit">Edit</a></td>
    </tr>
  `).join("");
})();


