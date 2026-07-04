// 🔥 USER DEFAULT
const adminUser = "admin";
const adminPass = "12345";

function login() {
  let user = document.getElementById("user").value;
  let pass = document.getElementById("pass").value;

  if (user === adminUser && pass === adminPass) {
    // simpan status login
    localStorage.setItem("isLogin", "true");

    // pindah ke admin
    window.location.href = "admin.html";
  } else {
    document.getElementById("error").innerText = "Login gagal!";
  }
}