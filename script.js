// 💾 SIMPAN KE LOCAL STORAGE
function simpanStok() {
  localStorage.setItem("barangDB", JSON.stringify(barangDB));
}

// 📥 LOAD DARI LOCAL STORAGE
function loadStok() {
  let data = localStorage.getItem("barangDB");

  if (data) {
    barangDB = JSON.parse(data);
    console.log("Stok dari LocalStorage");
  }
}

// 🔥 INIT FIREBASE
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔥 AMBIL DATA BARANG REALTIME
let barangDB = {};

db.ref("barang").on("value", (snapshot) => {
  barangDB = snapshot.val() || {};
});

let cart = [];
let total = 0;

// EVENT ENTER
document.addEventListener("DOMContentLoaded", function() {
  const input = document.getElementById("barcode");

  input.focus();

  input.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      tambahBarang(input.value);
      input.value = "";
    }
  });
});

// TAMBAH BARANG
function tambahBarang(kode) {
  kode = kode.trim();

  let item = barangDB[kode];

  if (!item) {
    alert("Barang tidak ditemukan!");
    return;
  }

  if (item.stok <= 0) {
    alert("Stok habis!");
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

  item.stok--; // kurangi stok
  simpanStok();
  renderCart();
}

// RENDER KERANJANG
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
        <td>${item.harga}</td>
        <td>${item.qty}</td>
        <td>${item.total}</td>
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

// TAMBAH QTY
function tambahQty(index) {
  let itemCart = cart[index];
  let itemDB = barangDB[itemCart.kode];

  if (itemDB.stok <= 0) {
    alert("Stok habis!");
    return;
  }

  itemCart.qty++;
  itemCart.total = itemCart.qty * itemCart.harga;
  itemDB.stok--;
  simpanStok();
  
  renderCart();
}

// KURANGI QTY
function kurangiQty(index) {
  let itemCart = cart[index];
  let itemDB = barangDB[itemCart.kode];

  itemDB.stok++; // balikin stok
  simpanStok();

  itemCart.qty--;

  if (itemCart.qty <= 0) {
    cart.splice(index, 1);
  } else {
    itemCart.total = itemCart.qty * itemCart.harga;
  }

  renderCart();
}

// BAYAR
function bayar() {
  let uang = parseInt(document.getElementById("bayar").value);

  if (uang < total) {
    alert("Uang kurang!");
    return;
  }

  let kembali = uang - total;
  document.getElementById("kembalian").innerText = "Kembalian: Rp " + kembali;

  // 🔥 KURANGI STOK DI FIREBASE
  cart.forEach(item => {
    let ref = db.ref("barang/" + item.kode);

    ref.once("value").then(snapshot => {
      let data = snapshot.val();

      let stokBaru = data.stok - item.qty;

      ref.update({
        stok: stokBaru
      });
    });
  });

  // 🧹 RESET KERANJANG
  cart = [];
  renderCart();
  total = 0;
  document.getElementById("total").innerText = 0;
}

// SIMPAN
function simpanTransaksi() {
  let data = {
    waktu: new Date(),
    total: total,
    items: cart
  };

  console.log("Transaksi:", data);
}

// PRINT
function printStruk() {
  let win = window.open("", "", "width=300,height=400");

  let struk = `<h3>Struk Belanja</h3><hr>`;

  cart.forEach(item => {
    struk += `${item.nama} x${item.qty} = ${item.total}<br>`;
  });

  struk += `<hr>Total: ${total}`;

  win.document.write(struk);
  win.print();
}

function startScan() {
  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" }, // kamera belakang
    {
      fps: 10,
      qrbox: 250
    },
    (decodedText) => {
      // 🔥 MASUKKAN KE INPUT
      document.getElementById("barcode").value = decodedText;

      // 🔥 TRIGGER TAMBAH KE KERANJANG
      tambahBarang(decodedText);

      // 🔥 STOP CAMERA SETELAH SCAN
      html5QrCode.stop();
      document.getElementById("reader").innerHTML = "";
    },
    (errorMessage) => {
      // optional error
    }
  ).catch(err => {
    alert("Kamera tidak bisa diakses!");
    console.log(err);
  });
}