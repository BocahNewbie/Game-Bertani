let uang = 2500;
let inventory = [];
let jumlahPupuk = 0;

// Sistem Multi Lahan
let lahan = [
  { id: 1, status: 'kosong', tanaman: null, waktuSelesai: 0, timerInterval: null }
];
let lahanTambahanDibeli = 0;
const limitLahanTambahan = 6; 
let hargaTambahLahan = 5000;

// Variabel Kontrol Modal Transaksi
let currentTransactionType = 'beli'; // 'beli' atau 'jual'
let currentTransactionItem = '';
let currentTransactionPrice = 0;
let currentQty = 1;
let maxQtyAllowed = 99;

const hargaDasarBibit = { 'Semangka': 800, 'Melon': 500 };
const waktuTumbuhBibit = { 'Semangka': 30 * 1000, 'Melon': 15 * 1000 };
let hargaJualAktif = { 'Semangka': 0, 'Melon': 0 };

function updateFluktuasiHarga() {
  for (let buah in hargaDasarBibit) {
    let base = hargaDasarBibit[buah];
    let persentaseKenaikan = (Math.floor(Math.random() * 71) + 20) / 100;
    hargaJualAktif[buah] = Math.round(base + (base * persentaseKenaikan));
  }
}

updateFluktuasiHarga();
setInterval(updateFluktuasiHarga, 60000); 

function formatRupiah(angka) {
  return angka.toLocaleString('id-ID');
}

function updateUangDisplay() {
  document.getElementById('player-koin').innerText = formatRupiah(uang);
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
  toastTimeout = setTimeout(() => { overlay.style.display = 'none'; }, 400); 
}

function openGameTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  event.currentTarget.classList.add('active');

  if (tabName === 'inventory') renderInventory();
  if (tabName === 'menanam') renderLahan();
}

function openGameTabeksplisit(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelectorAll('.nav-tabs .tab-btn')[0].classList.add('active');
}

// ================= FUNGSI LAHAN =================
function renderLahan() {
  const container = document.getElementById('lahan-container');
  let html = '';

  lahan.forEach((l, index) => {
    html += `
      <div class="farm-land">
        <p id="status-lahan-${index}" style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">
          ${l.status === 'kosong' ? 'Lahan Kosong' : l.status === 'siap_panen' ? `✨ ${l.tanaman}` : `🌱 ${l.tanaman}`}
        </p>
        
        <small id="waktu-lahan-${index}" style="display: ${l.status === 'ditanam' ? 'block' : 'none'}; font-size: 11px; margin-bottom: 8px; color: #fff8e1;"></small>

        ${l.status === 'kosong' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px;" onclick="openGameTabeksplisit('inventory'); renderInventory();">Tanam Bibit</button>` : ''}
        
        ${l.status === 'ditanam' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #795548;" onclick="gunakanPupuk(${index})">Pupuk (${jumlahPupuk})</button>` : ''}
        
        ${l.status === 'siap_panen' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #f57f17;" onclick="panenTanaman(${index})">Panen</button>` : ''}
      </div>
    `;
  });
  container.innerHTML = html;

  let btnTambah = document.getElementById('btn-tambah-lahan');
  if (lahanTambahanDibeli >= limitLahanTambahan) {
    btnTambah.style.display = 'none';
  } else {
    btnTambah.innerText = `➕ Lahan (Rp ${formatRupiah(hargaTambahLahan)})`;
  }
}

function beliLahan() {
  if (lahanTambahanDibeli >= limitLahanTambahan) {
    showToast('Batas maksimal lahan tercapai!', 'error');
    return;
  }
  if (uang < hargaTambahLahan) {
    showToast(`Uang kurang! Butuh Rp ${formatRupiah(hargaTambahLahan)}`, 'error');
    return;
  }

  uang -= hargaTambahLahan;
  updateUangDisplay();

  lahan.push({
    id: lahan.length + 1,
    status: 'kosong', tanaman: null, waktuSelesai: 0, timerInterval: null
  });

  lahanTambahanDibeli++;
  showToast('Berhasil menambah lahan!', 'success');

  hargaTambahLahan = Math.round(hargaTambahLahan * 2.5);
  renderLahan();
}

function pilihBibitUntukDitanam(namaBibit) {
  let emptyIndex = lahan.findIndex(l => l.status === 'kosong');
  if (emptyIndex === -1) {
    showToast('Semua lahan sedang terisi!', 'error');
    return;
  }

  let item = inventory.find(i => i.nama === namaBibit);
  if (item) {
    item.jumlah -= 1;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== namaBibit);
  }

  let bibitDipilih = namaBibit.replace('Bibit ', '');
  let targetLahan = lahan[emptyIndex];

  targetLahan.status = 'ditanam';
  targetLahan.tanaman = bibitDipilih;
  
  let durasiMs = waktuTumbuhBibit[bibitDipilih] || 15000;
  targetLahan.waktuSelesai = new Date().getTime() + durasiMs;

  openGameTabeksplisit('menanam');
  renderLahan();
  mulaiTimerLahan(emptyIndex);
}

function mulaiTimerLahan(index) {
  let l = lahan[index];
  if (l.timerInterval) clearInterval(l.timerInterval);

  l.timerInterval = setInterval(() => {
    let sisaWaktu = l.waktuSelesai - new Date().getTime();
    let waktuEl = document.getElementById(`waktu-lahan-${index}`);
    
    if (sisaWaktu <= 0) {
      clearInterval(l.timerInterval);
      l.status = 'siap_panen';
      renderLahan(); 
    } else {
      let jam = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let menit = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60));
      let detik = Math.floor((sisaWaktu % (1000 * 60)) / 1000);
      
      let formatWaktu = `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
      if(waktuEl) waktuEl.innerText = `⏱️ ${formatWaktu}`;
    }
  }, 1000);
}

function gunakanPupuk(index) {
  let l = lahan[index];
  if (l.status !== 'ditanam') return;
  if (jumlahPupuk <= 0) {
    showToast('Pupuk Kompos habis!', 'error');
    return;
  }

  jumlahPupuk -= 1;
  l.waktuSelesai -= 7000;
  if (l.waktuSelesai <= new Date().getTime()) {
    l.waktuSelesai = new Date().getTime();
  }
  
  renderLahan();
  showToast('Dipercepat 7 Detik!', 'success');
}

function panenTanaman(index) {
  let l = lahan[index];
  if (l.status !== 'siap_panen') return;

  tambahKeInventory(l.tanaman, 1);
  showToast(`Panen 1 ${l.tanaman}!`, 'success');

  l.status = 'kosong';
  l.tanaman = null;
  l.waktuSelesai = 0;
  if (l.timerInterval) clearInterval(l.timerInterval);
  
  renderLahan();
}

// ================= MODAL TRANSAKSI (BELI/JUAL) =================
function bukaModalTransaksi(tipe, namaBarang, harga, stokMaksimal = 0) {
  currentTransactionType = tipe;
  currentTransactionItem = namaBarang;
  currentTransactionPrice = harga;
  
  if (tipe === 'beli') {
    document.getElementById('modal-title').innerText = `Beli ${namaBarang}`;
    document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Beli';
    
    // Kalkulasi maksimal yang bisa dibeli berdasarkan uang
    let maxMampuBeli = Math.floor(uang / harga);
    maxQtyAllowed = Math.min(99, maxMampuBeli); // Limit beli maksimal 99 sekaligus
    if (maxQtyAllowed < 1) maxQtyAllowed = 1; // Supaya tetap bisa melihat harga meski uang tak cukup
  } else if (tipe === 'jual') {
    document.getElementById('modal-title').innerText = `Jual ${namaBarang}`;
    document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Jual';
    maxQtyAllowed = stokMaksimal; // Sesuai total item yang dimiliki di inventory
  }

  currentQty = (maxQtyAllowed > 0) ? 1 : 0;
  document.getElementById('modal-price').innerText = `Harga Satuan: Rp ${formatRupiah(harga)}`;
  
  updateModalDisplay();
  document.getElementById('transaction-modal').style.display = 'flex';
}

function tutupModalTransaksi() {
  document.getElementById('transaction-modal').style.display = 'none';
}

function ubahQty(amount) {
  currentQty += amount;
  
  if (currentQty > maxQtyAllowed) currentQty = maxQtyAllowed;
  if (currentQty < 1 && maxQtyAllowed > 0) currentQty = 1;
  if (maxQtyAllowed === 0) currentQty = 0;
  
  updateModalDisplay();
}

function setQtyMaks() {
  currentQty = maxQtyAllowed;
  if (currentQty === 0 && currentTransactionType === 'beli') currentQty = 1; 
  updateModalDisplay();
}

function updateModalDisplay() {
  document.getElementById('modal-qty-display').innerText = currentQty;
  let total = currentQty * currentTransactionPrice;
  document.getElementById('modal-total-price').innerText = `Rp ${formatRupiah(total)}`;
}

function konfirmasiTransaksi() {
  if (currentQty <= 0) {
    showToast('Jumlah tidak valid!', 'error');
    return;
  }

  let totalHarga = currentQty * currentTransactionPrice;

  if (currentTransactionType === 'beli') {
    if (uang >= totalHarga) {
      uang -= totalHarga;
      updateUangDisplay();

      if (currentTransactionItem === 'Pupuk Kompos') {
        jumlahPupuk += currentQty;
        renderLahan(); 
      } else {
        tambahKeInventory(currentTransactionItem, currentQty);
      }
      
      tutupModalTransaksi();
      showToast(`Membeli ${currentQty} ${currentTransactionItem}!`, 'success');
    } else {
      showToast('Uang tidak cukup!', 'error');
    }
  } else if (currentTransactionType === 'jual') {
    let item = inventory.find(i => i.nama === currentTransactionItem);
    if (!item || item.jumlah < currentQty) {
      showToast('Item tidak cukup untuk dijual!', 'error');
      return;
    }

    item.jumlah -= currentQty;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== currentTransactionItem);

    uang += totalHarga;
    updateUangDisplay();

    tutupModalTransaksi();
    showToast(`Terjual ${currentQty} item seharga Rp ${formatRupiah(totalHarga)}!`, 'success');
    renderInventory();
  }
}

// ================= INVENTORY & DATA =================
function tambahKeInventory(namaItem, jumlah) {
  let existing = inventory.find(item => item.nama === namaItem);
  if (existing) existing.jumlah += jumlah;
  else inventory.push({ nama: namaItem, jumlah: jumlah });
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
      let hasEmptyLand = lahan.some(l => l.status === 'kosong');
      if (hasEmptyLand) {
        actionButton = `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>`;
      } else {
        actionButton = `<small style="color:red; font-size: 10px;">Lahan Penuh</small>`;
      }
    } else {
      if (item.nama.includes('Semangka')) icon = '🍉';
      if (item.nama.includes('Melon')) icon = '🍈';

      let hargaJualSatuan = hargaJualAktif[item.nama] || 0;
      // Memanggil modal bukaModalTransaksi tipe 'jual'
      actionButton = `
        <div style="text-align: right;">
          <small style="display: block; color: #555; font-size: 10px;">Jual: Rp ${formatRupiah(hargaJualSatuan)}</small>
          <button class="btn-sell" onclick="bukaModalTransaksi('jual', '${item.nama}', ${hargaJualSatuan}, ${item.jumlah})">Jual</button>
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

renderLahan();
