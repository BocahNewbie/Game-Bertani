// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';

// UI Tab Navigation
function openAuthTab(tabName) {
  document.querySelectorAll('#auth-section .tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('#auth-section .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');
  showAlert('', '');
}

function openGameTab(tabName) {
  document.querySelectorAll('#game-section .tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('#game-section .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');
}

function showAlert(message, type) {
  const alertBox = document.getElementById('auth-alert');
  if (!message) {
    alertBox.style.display = 'none';
    return;
  }
  alertBox.className = 'alert alert-' + type;
  alertBox.innerText = message;
  alertBox.style.display = 'block';
}

// Auth Handlers
async function handleRegister(e) {
  e.preventDefault();
  const nickname = document.getElementById('reg-nickname').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert('Konfirmasi password tidak cocok! Silakan ulangi.', 'error');
    return;
  }

  showAlert('Mendaftarkan akun...', 'success');

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'register', nickname, password })
    });
    const result = await response.json();

    if (result.status === 'success') {
      showAlert('Pendaftaran berhasil! Silakan login.', 'success');
      document.getElementById('form-daftar').reset();
      openAuthTab('login');
    } else {
      showAlert(result.message || 'Pendaftaran gagal.', 'error');
    }
  } catch (err) {
    showAlert('Terjadi kesalahan koneksi ke database.', 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const nickname = document.getElementById('login-nickname').value.trim();
  const password = document.getElementById('login-password').value;

  showAlert('Memeriksa akun...', 'success');

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'login', nickname, password })
    });
    const result = await response.json();

    if (result.status === 'success') {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('game-section').style.display = 'block';
      document.getElementById('player-name').innerText = nickname;
    } else {
      showAlert(result.message || 'Nickname atau password salah!', 'error');
    }
  } catch (err) {
    showAlert('Terjadi kesalahan koneksi ke database.', 'error');
  }
}

// Game Logic Simple
let koin = 100;

function beliBibit(nama, harga) {
  if (koin >= harga) {
    koin -= harga;
    document.getElementById('player-koin').innerText = koin;
    alert(`Berhasil membeli bibit ${nama}! Pergi ke tab Menanam untuk menanamnya.`);
    document.getElementById('status-lahan').innerText = `Siap menanam ${nama}`;
    document.getElementById('btn-tanam').style.display = 'inline-block';
  } else {
    alert('Koin kamu tidak cukup!');
  }
}

function tanamTanaman() {
  document.getElementById('status-lahan').innerText = '🌱 Tanaman sedang tumbuh...';
  document.getElementById('btn-tanam').style.display = 'none';
}
