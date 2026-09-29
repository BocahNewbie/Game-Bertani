let uang = 2500;
let inventory = [];
let jumlahPupuk = 0; // Menyimpan stok pupuk kompos
let bibitDipilih = null;
let statusLahanGame = 'kosong'; 
let jenisTanamanAktif = null;
let waktuSelesaiPanen = 0; 
let timerInterval = null;  

let selectedItemToBuy = {
  nama: '',
  hargaSatuan: 0
};

const hargaDasarBibit = {
  'Semangka': 800,
  'Melon': 500
};

// Durasi waktu tumbuh (Semangka 30 Detik, Melon 15 Detik)
const waktuTumbuhBibit = {
  'Semangka': 30 * 1000, 
  'Melon': 15 * 1000     
};

let hargaJualAktif = {
  'Semangka': 0,
  'Melon': 0
};

function updateFluktuasiHarga() {
  for (let buah in hargaDasarBibit) {
    let base = hargaDasarBibit[buah];
    let persentaseKenaikan = (Math.floor(Math.random() * 71) + 20) / 100; // 20% - 90%
    let tambahanHarga = base * persentaseKenaikan;
    hargaJualAktif[buah] = Math.round(base + tambahanHarga);
  }
}

updateFluktuasiHarga();
setInterval(updateFluktuasiHarga, 3600000);

function formatRupiah(angka) {
  return angka.toLocaleString('id-ID');
}

function updateUangDisplay() {
  document.getElementById('player-koin').innerText = formatRupiah(uang);
}

function updateTombolPupuk() {
  let btnPupuk = document.getElementById('btn-pupuk');
  if (btnPupuk) {
    btnPupuk.innerText = `Gunakan Pupuk (${jumlahPupuk})`;
  }
}

let toastTimeout = null;
function showToast(message, type = 'success') {
  const overlay = document.getElementById('toast-overlay');
  const card = document.getElementById('toast-card');
  const icon = document.getElementById('toast-icon');
  const msg = document.getElementById('toast-message');

  card.className = `toast-card ${type}`;
  icon.innerHTML = type === 'success' ? '✓' : '✕';
  msg.innerText = message;

  overlay.style.display = 'flex';

  if (toastTimeout) clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    overlay.style.display = 'none';
  }, 2000);
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

function bukaModalBeli(namaBarang, harga) {
  selectedItemToBuy = { nama: namaBarang, hargaSatuan: harga };
  
  document.getElementById('modal-title').innerText = `Beli ${namaBarang}`;
  document.getElementById('modal-price').innerText = `Harga Satuan: Rp ${formatRupiah(harga)}`;
  document.getElementById('modal-qty').value = 1;
  document.getElementById('modal-qty').max = 99;
  
  hitungTotalModal();
  document.getElementById('buy-modal').style.display = 'flex';
}

function tutupModalBeli() {
  document.getElementById('buy-modal').style.display = 'none';
}

function hitungTotalModal() {
  let qtyInput = document.getElementById('modal-qty');
  let qty = parseInt(qtyInput.value) || 1;

  if (qty > 99) {
    qty = 99;
    qtyInput.value = 99;
  } else if (qty < 1 && qtyInput.value !== "") {
    qty = 1;
    qtyInput.value = 1;
  }

  let total = qty * selectedItemToBuy.hargaSatuan;
  document.getElementById('modal-total-price').innerText = `Rp ${formatRupiah(total)}`;
}

function konfirmasiBeli() {
  let qty = parseInt(document.getElementById('modal-qty').value) || 1;
  if (qty > 99) qty = 99;
  if (qty < 1) qty = 1;

  let totalHarga = qty * selectedItemToBuy.hargaSatuan;

  if (uang >= totalHarga) {
    uang -= totalHarga;
    updateUangDisplay();

    // Jika yang dibeli adalah Pupuk Kompos, masukkan ke variabel khusus (bukan inventory)
    if (selectedItemToBuy.nama === 'Pupuk Kompos') {
      jumlahPupuk += qty;
      updateTombolPupuk();
    } else {
      tambahKeInventory(selectedItemToBuy.nama, qty);
    }
    
    tutupModalBeli();
    showToast(`Berhasil membeli ${qty} ${selectedItemToBuy.nama}!`, 'success');
  } else {
    tutupModalBeli();
    showToast('Uang kamu tidak cukup untuk pembelian ini!', 'error');
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
  document.getElementById('btn-tanam').style.display = 'none';
  
  // Tampilkan tombol gunakan pupuk
  document.getElementById('btn-pupuk').style.display = 'inline-block';
  updateTombolPupuk();

  let durasiMs = waktuTumbuhBibit[bibitDipilih] || 15000;
  waktuSelesaiPanen = new Date().getTime() + durasiMs;

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    let sekarang = new Date().getTime();
    let sisaWaktu = waktuSelesaiPanen - sekarang;

    if (sisaWaktu <= 0) {
      clearInterval(timerInterval);
      statusLahanGame = 'siap_panen';
      document.getElementById('status-lahan').innerText = `✨ ${bibitDipilih} sudah siap dipanen!`;
      document.getElementById('btn-panen').style.display = 'inline-block';
      document.getElementById('btn-pupuk').style.display = 'none'; // Sembunyikan pupuk
    } else {
      let jam = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let menit = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
      let detik = Math.floor((sisaWaktu % (1000 * 60)) / 1000);

      let formatWaktu = `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
      document.getElementById('status-lahan').innerText = `🌱 ${bibitDipilih} sedang tumbuh...\n⏱️ Sisa Waktu: ${formatWaktu}`;
    }
  }, 1000);
}

function gunakanPupuk() {
  if (statusLahanGame !== 'ditanam') {
    showToast('Tidak ada tanaman yang sedang tumbuh!', 'error');
    return;
  }
  if (jumlahPupuk <= 0) {
    showToast('Kamu tidak memiliki Pupuk Kompos!', 'error');
    return;
  }

  jumlahPupuk -= 1;
  updateTombolPupuk();

  // Memotong waktu panen sebanyak 7 detik (7000 milidetik)
  waktuSelesaiPanen -= 7000;
  
  // Jika karena dipupuk waktunya langsung habis
  if (waktuSelesaiPanen <= new Date().getTime()) {
    waktuSelesaiPanen = new Date().getTime(); // Set minimal 0 agar interval langsung menyelesaikannya
  }
  
  showToast('Berhasil dipupuk! Waktu dipercepat 7 Detik.', 'success');
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

  showToast(`Panen berhasil! Mendapatkan 1 ${hasilPanen}.`, 'success');

  statusLahanGame = 'kosong';
  bibitDipilih = null;
  jenisTanamanAktif = null;
  document.getElementById('status-lahan').innerText = 'Lahan Kosong';
  document.getElementById('btn-panen').style.display = 'none';
  document.getElementById('btn-pupuk').style.display = 'none';
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

  showToast(`Berhasil menjual 1 ${namaBuah} seharga Rp ${formatRupiah(totalPendapatan)}!`, 'success');
  renderInventory();
}
