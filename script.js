let uang = 2500;
let inventory = [];
let bibitDipilih = null;
let statusLahanGame = 'kosong'; 
let jenisTanamanAktif = null;

// Harga dasar bibit referensi
const hargaDasarBibit = {
  'Semangka': 800,
  'Melon': 500
};

// Menyimpan harga jual fluktuatif saat ini per jam
let hargaJualAktif = {
  'Semangka': 0,
  'Melon': 0
};

// Fungsi menghitung harga jual = Harga Bibit + (20% - 90% kenaikan dari harga bibit)
function updateFluktuasiHarga() {
  for (let buah in hargaDasarBibit) {
    let base = hargaDasarBibit[buah];
    let persentaseKenaikan = (Math.floor(Math.random() * 71) + 20) / 100; // Random 0.20 sampai 0.90 (20% - 90%)
    let tambahanHarga = base * persentaseKenaikan;
    
    // Harga jual adalah modal bibit ditambah persentase kenaikannya
    hargaJualAktif[buah] = Math.round(base + tambahanHarga);
  }
}

// Inisialisasi awal dan perbarui setiap 1 jam (3600000 ms)
updateFluktuasiHarga();
setInterval(updateFluktuasiHarga, 3600000);

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
    let icon = '📦';
    let actionButton = '';

    if (item.nama.includes('Bibit')) {
      icon = '🌱';
      if (statusLahanGame === 'kosong') {
        actionButton = `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>`;
      }
    } else {
      if (item.nama.includes('Semangka')) icon = '🍉';
      if (item.nama.includes('Melon')) icon = '🍈';

      let hargaJualSatuan = hargaJualAktif[item.nama] || 0;
      actionButton = `
        <div style="text-align: right;">
          <small style="display: block; color: #555; font-size: 10px;">Harga Jual: Rp ${formatRupiah(hargaJualSatuan)}</small>
          <button class="btn-sell" onclick="jualHasilPanen('${item.nama}')">Jual</button>
        </div>
      `;
    }

    html += `
      <div class="inventory-item">
        <div>
          <span>${icon} <strong>${item.nama}</strong></span><br>
          <small style="color: #666;">Jumlah: <strong>${item.jumlah}</strong></small>
        </div>
        ${actionButton}
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
  jenisTanamanAktif = bibitDipilih;
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

  let hasilPanen = jenisTanamanAktif || 'Semangka';
  tambahKeInventory(hasilPanen, 1);

  alert(`Panen berhasil! Mendapatkan 1 ${hasilPanen} yang masuk ke Inventory.`);

  statusLahanGame = 'kosong';
  bibitDipilih = null;
  jenisTanamanAktif = null;
  document.getElementById('status-lahan').innerText = 'Lahan Kosong';
  document.getElementById('btn-panen').style.display = 'none';
}

function jualHasilPanen(namaBuah) {
  let item = inventory.find(i => i.nama === namaBuah);
  if (!item || item.jumlah <= 0) return;

  let hargaSatuan = hargaJualAktif[namaBuah] || 0;
  let totalPendapatan = hargaSatuan;

  item.jumlah -= 1;
  if (item.jumlah <= 0) {
    inventory = inventory.filter(i => i.nama !== namaBuah);
  }

  uang += totalPendapatan;
  updateUangDisplay();

  alert(`Berhasil menjual 1 ${namaBuah} seharga Rp ${formatRupiah(totalPendapatan)}!`);
  renderInventory();
}
