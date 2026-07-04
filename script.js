// ===============================
// 📦 DATABASE AWAL (DEFAULT)
// ===============================
let barangDB = {
  "899001": { nama: "Indomie Goreng", harga: 3000, stok: 10 },
  "899002": { nama: "Aqua 600ml", harga: 4000, stok: 15 },
  "899003": { nama: "Teh Botol", harga: 5000, stok: 8 }
};

// ===============================
// 💾 LOAD & SIMPAN LOCAL STORAGE
// ===============================
function loadStok() {
  let data = localStorage.getItem("barangDB");
  if (data) {
    barangDB = JSON.parse(data);
    console.log("✅ Stok diload dari LocalStorage");
  }
}

function simpanStok() {
  localStorage.setItem("barangDB", JSON.stringify(barangDB));
}

// ===============================
// 🛒 STATE
// ===============================
let cart = [];
let total = 0;

// ===============================
// 🚀 INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadStok();

  const input = document.getElementById("barcode");
  input.focus();

  // ENTER dari keyboard / HP
  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      tambahBarang(input.value);
      input.value = "";
    }
  });
});

// ===============================
// ➕ TAMBAH BARANG
// ===============================
function tambahBarang(kode) {
  kode = kode.trim();

  let item = barangDB[kode];

  if (!item) {
    alert("❌ Barang tidak ditemukan!");
    return;
  }

  if (item.stok <= 0) {
    alert("⚠️ Stok habis!");
    return;
  }

  let existing = cart.find(i => i.kode === kode);

  if (existing) {
    existing.qty++;
    existing.total = existing.qty * existing.harga;
  } else {
    cart.push({
      kode,
      nama: item.nama,
      harga: item.harga,
      qty: 1,
      total: item.harga
    });
  }

  // 🔥 Kurangi stok
  item.stok--;

  simpanStok();
  renderCart();
}

// ===============================
// 🖥️ RENDER KERANJANG
// ===============================
function renderCart() {
  let tbody = document.getElementById("cart");
  tbody.innerHTML = "";

  total = 0;

  cart.forEach((item, index) => {
    let stok = barangDB[item.kode].stok;

    total += item.total;

    tbody.innerHTML += `
      <tr>
        <td>${item.nama}</td>
        <td>Rp ${item.harga}</td>
        <td>${item.qty}</td>
        <td>Rp ${item.total}</td>
        <td>
          <button onclick="tambahQty(${index})">➕</button>
          <button onclick="kurangiQty(${index})">➖</button>
        </td>
        <td>Stok: ${stok}</td>
      </tr>
    `;
  });

  document.getElementById("total").innerText = total;
}

// ===============================
// ➕ TAMBAH QTY
// ===============================
function tambahQty(index) {
  let itemCart = cart[index];
  let itemDB = barangDB[itemCart.kode];

  if (itemDB.stok <= 0) {
    alert("⚠️ Stok habis!");
    return;
  }

  itemCart.qty++;
  itemCart.total = itemCart.qty * itemCart.harga;

  itemDB.stok--;

  simpanStok();
  renderCart();
}

// ===============================
// ➖ KURANGI QTY
// ===============================
function kurangiQty(index) {
  let itemCart = cart[index];
  let itemDB = barangDB[itemCart.kode];

  itemCart.qty--;

  // 🔥 Balikin stok
  itemDB.stok++;

  if (itemCart.qty <= 0) {
    cart.splice(index, 1);
  } else {
    itemCart.total = itemCart.qty * itemCart.harga;
  }

  simpanStok();
  renderCart();
}

// ===============================
// 💰 BAYAR
// ===============================
function bayar() {
  let uang = parseInt(document.getElementById("bayar").value);

  if (!uang || uang < total) {
    alert("❌ Uang kurang!");
    return;
  }

  let kembali = uang - total;

  document.getElementById("kembalian").innerText =
    "Kembalian: Rp " + kembali;

  // Reset keranjang
  cart = [];
  total = 0;

  renderCart();
}

// ===============================
// 🧾 PRINT STRUK
// ===============================
function printStruk() {
  let win = window.open("", "", "width=300,height=400");

  let struk = `<h3>🧾 Struk Belanja</h3><hr>`;

  cart.forEach(item => {
    struk += `${item.nama} x${item.qty} = Rp ${item.total}<br>`;
  });

  struk += `<hr>Total: Rp ${total}`;

  win.document.write(struk);
  win.print();
}