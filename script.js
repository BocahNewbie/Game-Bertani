let uang = 2500;
let inventory = []; // Menyimpan daftar item
let bibitDipilih = null;
let statusLahanGame = 'kosong'; // 'kosong', 'ditanam', 'siap_panen'
let jenisTanamanAktif = null;

function formatRupiah(angka) {
  return angka.toLocaleString('id-ID');
}

function updateUangDisplay() {
  document.getElementById('player-koin').innerText = formatRupiah(uang);
}

function openGameTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');

  if (tabName === 'inventory') {
    renderInventory();
  }
}

function beliBibit(namaBibit, harga) {
  if (uang >= harga) {
    uang -= harga;
    updateUangDisplay();

    // Masukkan bibit ke inventory
    tambahKeInventory(namaBibit, 1);
    alert(`Berhasil membeli ${namaBibit}! Item telah dimasukkan ke Inventory.`);
  } else {
    alert('Uang kamu tidak cukup!');
  }
}

function tambahKeInventory(namaItem, jumlah) {
  let existing = inventory.find(item => item.nama === namaItem);
  if (existing) {
    existing.jumlah += jumlah;
  } else {
    inventory.push({ nama: namaItem, jumlah: jumlah });
  }
}

function renderInventory() {
  const container = document.getElementById('inventory-list');
  if (inventory.length === 0) {
    container.innerHTML = '<p style="color: #777; font-style: italic;">Inventory masih kosong.</p>';
    return;
  }

  let html = '';
  inventory.forEach((item, index) => {
    html += `
      <div class="inventory-item">
        <span>📦 <strong>${item.nama}</strong></span>
        <span>Jumlah: <strong>${item.jumlah}</strong></span>
        ${item.nama.includes('Bibit') && statusLahanGame === 'kosong' ? `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>` : ''}
      </div>
    `;
  });
  container.innerHTML = html;
}

function pilihBibitUntukDitanam(namaBibit) {
  // Kurangi jumlah dari inventory
  let item = inventory.find(i => i.nama === namaBibit);
  if (item) {
    item.jumlah -= 1;
    if (item.jumlah <= 0) {
      inventory = inventory.filter(i => i.nama !== namaBibit);
    }
  }

  bibitDipilih = namaBibit.replace('Bibit ', '');
  statusLahanGame = 'ditanam';

  // Pindah otomatis ke tab Menanam
  openGameTabeksplisit('menanam');
  
  document.getElementById('status-lahan').innerText = `🌱 ${bibitDipilih} sedang tumbuh... (Klik untuk simulasi panen)`;
  document.getElementById('btn-tanam').style.display = 'none';

  // Simulasi instan siap panen (bisa disesuaikan timer aslinya nanti)
  setTimeout(() => {
    statusLahanGame = 'siap_panen';
    document.getElementById('status-lahan').innerText = `✨ ${bibitDipilih} sudah siap dipanen!`;
    document.getElementById('btn-panen').style.display = 'inline-block';
  }, 3000); // Simulasi 3 detik untuk uji coba
}

function openGameTabeksplisit(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  // Highlight tab button menanam
  document.querySelectorAll('.nav-tabs .tab-btn')[0].classList.add('active');
}

function panenTanaman() {
  if (statusLahanGame !== 'siap_panen') return;

  let hasilPanen = jenisTanamanAktif || bibitDipilih || 'Buah';
  tambahKeInventory(hasilPanen, 1);

  alert(`Panen berhasil! Mendapatkan 1 ${hasilPanen} yang masuk ke Inventory.`);

  // Reset lahan
  statusLahanGame = 'kosong';
  bibitDipilih = null;
  document.getElementById('status-lahan').innerText = 'Lahan Kosong';
  document.getElementById('btn-panen').style.display = 'none';
}
