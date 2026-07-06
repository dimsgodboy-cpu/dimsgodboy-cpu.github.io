const db = firebase.database();

let barangDB = {};
let cart = [];
let total = 0;

// 🔥 AMBIL DATA REALTIME
db.ref("barang").on("value", (snapshot) => {
  barangDB = snapshot.val() || {};
});

// =================
// TAMBAH BARANG
// =================
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

  // 🔥 UPDATE STOK KE FIREBASE
  db.ref("barang/" + kode).update({
    stok: item.stok - 1
  });

  renderCart();
}