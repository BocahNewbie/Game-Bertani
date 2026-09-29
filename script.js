let uang = 2500;
let inventory = [];
let bibitDipilih = null;
let statusLahanGame = 'kosong'; 
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
  inventory.forEach((item) => {
    // Tentukan ikon berdasarkan nama item (bibit vs buah hasil panen)
    let icon = '📦';
    if (item.nama.includes('Bibit')) {
      icon = '🌱';
    } else if (item.nama.includes('Semangka')) {
      icon = '🍉';
    } else if (item.nama.includes('Melon')) {
      icon = '🍈';
    }

    html += `
      <div class="inventory-item">
        <span>${icon} <strong>${item.nama}</strong></span>
        <span>Jumlah: <strong>${item.jumlah}</strong></span>
        ${item.nama.includes('Bibit') && statusLahanGame === 'kosong' ? `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>` : ''}
      </div>
    `;
  });
  container.innerHTML = html;
}

function pilihBibitUntukDitanam(namaBibit) {
  let item = inventory.find(i => i.nama === namaBibit);
  if (item) {
    item.jumlah -= 1;
    if (item.jumlah <= 0) {
      inventory = inventory.filter(i => i.nama !== namaBibit);
    }
  }

  bibitDipilih = namaBibit.replace('Bibit ', '');
  statusLahanGame = 'ditanam';

  openGameTabeksplisit('menanam');
  
  document.getElementById('status-lahan').innerText = `🌱 ${bibitDipilih} sedang tumbuh... (Klik untuk simulasi panen)`;
  document.getElementById('btn-tanam').style.display = 'none';

  setTimeout(() => {
    statusLahanGame = 'siap_panen';
    document.getElementById('status-lahan').innerText = `✨ ${bibitDipilih} sudah siap dipanen!`;
    document.getElementById('btn-panen').style.display = 'inline-block';
  }, 3000); 
}

function openGameTabeksplisit(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelectorAll('.nav-tabs .tab-btn')[0].classList.add('active');
}

function panenTanaman() {
  if (statusLahanGame !== 'siap_panen') return;

  // Ubah hasil panen menjadi nama buah langsung (tanpa kata Bibit)
  let hasilPanen = jenisTanamanAktif || bibitDipilih || 'Buah';
  tambahKeInventory(hasilPanen, 1);

  alert(`Panen berhasil! Mendapatkan 1 ${hasilPanen} yang masuk ke Inventory.`);

  statusLahanGame = 'kosong';
  bibitDipilih = null;
  document.getElementById('status-lahan').innerText = 'Lahan Kosong';
  document.getElementById('btn-panen').style.display = 'none';
}
