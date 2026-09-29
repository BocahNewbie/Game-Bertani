let koin = 100;
let bibitDipilih = null;

function openGameTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');
}

function beliBibit(nama, harga) {
  if (koin >= harga) {
    koin -= harga;
    document.getElementById('player-koin').innerText = koin;
    bibitDipilih = nama;
    alert(`Berhasil membeli bibit ${nama}! Pergi ke tab Menanam untuk menanamnya.`);
    
    document.getElementById('status-lahan').innerText = `Siap menanam ${nama}`;
    document.getElementById('btn-tanam').style.display = 'inline-block';
  } else {
    alert('Koin kamu tidak cukup!');
  }
}

function tanamTanaman() {
  if (!bibitDipilih) return;
  
  document.getElementById('status-lahan').innerText = `🌱 ${bibitDipilih} sedang tumbuh...`;
  document.getElementById('btn-tanam').style.display = 'none';
  bibitDipilih = null;
}
