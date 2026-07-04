const db = firebase.database();

let barangDB = {};

db.ref("barang").on("value", (snapshot) => {
  barangDB = snapshot.val() || {};
  renderTable();
});

// 🔥 CEK LOGIN
if (localStorage.getItem("isLogin") !== "true") {
  alert("Harus login dulu!");
  window.location.href = "login.html";
}

// LOAD DATA
function loadData() {
  let data = localStorage.getItem("barangDB");

  if (data) {
    barangDB = JSON.parse(data);
  }
}

// SIMPAN DATA
function saveData() {
  localStorage.setItem("barangDB", JSON.stringify(barangDB));
}

// RENDER TABLE
function renderTable() {
  let tbody = document.getElementById("table");
  let keyword = document.getElementById("search").value.toLowerCase();

  tbody.innerHTML = "";

  Object.keys(barangDB).forEach(kode => {
    let item = barangDB[kode];

    if (!item.nama.toLowerCase().includes(keyword)) return;

    tbody.innerHTML += `
      <tr>
        <td>${kode}</td>
        <td>${item.nama}</td>
        <td>${item.harga}</td>
        <td>
          <input type="number" value="${item.stok}" onchange="updateStok('${kode}', this.value)">
        </td>
        <td>
          <button onclick="hapusBarang('${kode}')">❌</button>
        </td>
      </tr>
    `;
  });
}

// UPDATE STOK
function updateStok(kode, value) {
  db.ref("barang/" + kode).update({
    stok: parseInt(value)
  });
}

// HAPUS
function hapusBarang(kode) {
  db.ref("barang/" + kode).remove();
}

// TAMBAH BARANG
function tambahBarangBaru() {
  let kode = document.getElementById("kode").value;
  let nama = document.getElementById("nama").value;
  let harga = parseInt(document.getElementById("harga").value);
  let stok = parseInt(document.getElementById("stok").value);

  db.ref("barang/" + kode).set({
    nama,
    harga,
    stok
  });
}

  barangDB[kode] = { nama, harga, stok };

  saveData();
  renderTable();

  // reset input
  document.getElementById("kode").value = "";
  document.getElementById("nama").value = "";
  document.getElementById("harga").value = "";
  document.getElementById("stok").value = "";


function logout() {
  localStorage.removeItem("isLogin");
  window.location.href = "login.html";
}

// INIT
loadData();
renderTable();