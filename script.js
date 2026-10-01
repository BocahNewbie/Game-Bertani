// ==========================================
// DATA LOKAL TANAMAN & AKSESORI BERDASARKAN SLOT
// ==========================================
let libraryTanaman = [
  { nama: 'Semangka', namaBibit: 'Bibit Semangka', iconBibit: '🌱', iconBuah: '🍉', BasehargaBeli: 60, BasehargaJual: 68, waktuTumbuh:  28800000 },
  { nama: 'Melon', namaBibit: 'Bibit Melon', iconBibit: '🌱', iconBuah: '🍈', BasehargaBeli: 40, BasehargaJual: 52, waktuTumbuh: 18000000 },
  { nama: 'Jagung', namaBibit: 'Bibit Jagung', iconBibit: '🌱', iconBuah: '🌽', BasehargaBeli: 90, BasehargaJual: 111, waktuTumbuh: 54000000 },
  { nama: 'Apel', namaBibit: 'Bibit Apel', iconBibit: '🌱', iconBuah: '🍎', BasehargaBeli: 130, BasehargaJual: 180, waktuTumbuh: 86400000 }
];

// ==========================================
// DATA LOKAL PETERNAKAN & PAKAN
// ==========================================
let libraryTernak = [
  { nama: 'Ayam', hargaBeli: 175800, hargaJual: 95670, icon: '🐔' },
  { nama: 'Sapi', hargaBeli: 9875740, hargaJual: 6987000, icon: '🐮' },
  { nama: 'Domba', hargaBeli: 1890050, hargaJual: 1435000, icon: '🐑' }
];

let itemPakanTernak = {
  id: 'pakan_ternak',
  nama: 'Pakan Ternak',
  hargaBeli: 37850,
  icon: '🌾'
};

let kandangTernak = [];
let stokPakanTernak = 0;

let listPupuk = [
  { id: 'pupuk_organik', nama: 'Pupuk Organik', icon: '🍃', hargaBeli: 185, efekWaktu: 18000000 },
  { id: 'biofertilizer', nama: 'Biofertilizer', icon: '🧪', hargaBeli: 350, efekWaktu: 25200000 },
  { id: 'pupuk_urea', nama: 'Pupuk Urea', icon: '💎', hargaBeli: 580, efekWaktu: 36000000 }
];

let stokPupuk = {
  pupuk_organik: 0,
  biofertilizer: 0,
  pupuk_urea: 0
};

let listAksesori = [
  { id: 'sendal', nama: 'Sendal Jepit', icon: '🩴', slot: 'telapak', harga: 15000, bonusPersen: 3, deskripsi: 'Menambah +3% hasil panen dasar.' },
  { id: 'boots', nama: 'Sepatu Boots', icon: '🥾', slot: 'telapak', harga: 45000, bonusPersen: 2, tangkalAngin: 35, deskripsi: 'Menambah +2% bonus dasar & menghilangkan 35% efek pengurangan hasil dari cuaca Angin Kencang.' },
  { id: 'caping', nama: 'Caping Petani', icon: '👒', slot: 'kepala', harga: 50000, bonusPersen: 8, deskripsi: 'Menambah +8% hasil panen dasar.' },
  { id: 'helmet', nama: 'Helm Full Face', icon: '🪖', slot: 'kepala', harga: 250000, bonusPersen: 0, bonusBadaiPetir: 150, deskripsi: 'Memberikan tambahan bonus besar +150% hasil panen khusus saat terjadi cuaca Badai Petir Berat.' },
  { id: 'boxer', nama: 'Celana Boxer', icon: '🩳', slot: 'kaki', harga: 150000, bonusPersen: 12, deskripsi: 'Menambah +12% hasil panen dasar.' },
  { id: 'joger', nama: 'Celana Joger', icon: '👖', slot: 'kaki', harga: 300000, bonusPersen: 5, sinergiJas: 100, deskripsi: 'Menambah +5% bonus dasar. Memberikan tambahan +100% hasil panen jika dipadukan dengan Jas Anti Badai.' },
  { id: 'baju', nama: 'Baju Partai', icon: '👕', slot: 'badan', harga: 1200000, bonusPersen: 19, deskripsi: 'Menambah +19% hasil panen dasar.' },
  { id: 'jas', nama: 'Jas Anti Badai', icon: '🧥', slot: 'badan', harga: 500000, bonusPersen: 4, tangkalBadai: 50, deskripsi: 'Menambah +4% bonus dasar & menghilangkan 50% efek pengurangan dari cuaca Storm / Badai.' }
];

// ==========================================
// PENGATURAN JADWAL CUACA HARIAN
// ==========================================
let cuacaAktif = { nama: 'Cerah', ikon: '☀️', efekPersen: 0 };
const daftarMasterCuaca = [
  { nama: 'Cerah', ikon: '☀', efekPersen: 0 },
  { nama: 'Panas', ikon: '🔥', efekPersen: -3 },
  { nama: 'Mendung', ikon: '☁️', efekPersen: 7 },
  { nama: 'Gerimis', ikon: '🌦️', efekPersen: 30 },
  { nama: 'Hujan', ikon: '🌧️', efekPersen: 120 },
  { nama: 'Angin Kencang', ikon: '🌬️', efekPersen: -50 },
  { nama: 'Storm / Badai', ikon: '⚡', efekPersen: -70 },
  { nama: 'Badai Petir Berat', ikon: '🌪️', efekPersen: -90 }
];

let jadwalCuacaHariIni = ['Storm / Badai', 'Cerah', 'Gerimis', 'Hujan', 'Storm / Badai', 'Gerimis', 'Panas'];
let indeksCuacaAktif = 0;
let timerCuacaInterval = null;

function hitungDanTerapkanJadwalCuaca() {
  if (!jadwalCuacaHariIni || jadwalCuacaHariIni.length === 0) {
    jadwalCuacaHariIni = ['Cerah'];
  }
  let namaCuacaTarget = jadwalCuacaHariIni[indeksCuacaAktif % jadwalCuacaHariIni.length];
  let found = daftarMasterCuaca.find(c => c.nama === namaCuacaTarget);
  if (found) {
    cuacaAktif = found;
  } else {
    cuacaAktif = daftarMasterCuaca[0];
  }
  indeksCuacaAktif++;
  renderInfoCuacaDiUI();
  renderPasar();
  renderTokoAksesori();
  renderPeternakan();
  let statusTutup = cuacaAktif.nama.includes('Badai') ? " (⚠️ Pasar & Toko Tutup!)" : "";
  showToast(`Pergantian Cuaca: ${cuacaAktif.ikon} ${cuacaAktif.nama}${statusTutup}`, 'info');
  
  let totalDurasiSiklusMs = 720000;
  let durasiPerCuacaMs = totalDurasiSiklusMs / jadwalCuacaHariIni.length;
  if (timerCuacaInterval) clearTimeout(timerCuacaInterval);
  timerCuacaInterval = setTimeout(hitungDanTerapkanJadwalCuaca, durasiPerCuacaMs);
}

function renderInfoCuacaDiUI() {
  let panelCuaca = document.getElementById('info-cuaca-display');
  if (panelCuaca) {
    let tanda = cuacaAktif.efekPersen > 0 ? '+' : '';
    let statusTutupTxt = cuacaAktif.nama.includes('Badai') ? ' 🛑 [Tutup]' : '';
    panelCuaca.innerText = `${cuacaAktif.ikon} ${cuacaAktif.nama} (${tanda}${cuacaAktif.efekPersen}%)${statusTutupTxt}`;
  }
}

let uang = 1500;
let inventory = [];
let aksesoriDimiliki = [];
let slotAktif = { kepala: null, badan: null, kaki: null, telapak: null };
let lahan = [
  { id: 1, status: 'kosong', tanaman: null, jumlahBibit: 0, waktuSelesai: 0, timerInterval: null }
];
let lahanTambahanDibeli = 0;
const limitLahanTambahan = 7;
let hargaTambahLahan = 5000;
let currentTransactionType = 'beli';
let currentTransactionItem = '';
let currentTransactionPrice = 0;
let currentQty = 1;
let maxQtyAllowed = 99;
let selectedLahanIndex = null;
let selectedBibitNama = '';
let currentSubInventory = 'bibit';
let hargaBeliAktif = {};
let hargaJualAktif = {};
let playerName = "Petani Desa Baru";

function updateFluktuasiHarga() {
  libraryTanaman.forEach(tanaman => {
    let baseBeli = Number(tanaman.BasehargaBeli) || 0;
    let baseJual = Number(tanaman.BasehargaJual) || 0;
    let variasiBeli = (Math.random() * 0.16) - 0.06;
    let hargaBeliBaru = baseBeli * (1 + variasiBeli);
    hargaBeliAktif[tanaman.namaBibit] = Math.round(hargaBeliBaru);
    let variasiJual = (Math.random() * 1.03) - 0.35;
    let hargaJualBaru = baseJual * (1 + variasiJual);
    hargaJualAktif[tanaman.nama] = Math.round(hargaJualBaru);
  });
  renderPasar();
}

function formatRupiah(angka) {
  return angka.toLocaleString('id-ID');
}

function updateUangDisplay() {
  document.getElementById('player-koin').innerText = `Rp ${formatRupiah(uang)}`;
}

function hitungTotalBonusPersen() {
  let totalPersen = 0;
  for (let slot in slotAktif) {
    let accId = slotAktif[slot];
    if (accId) {
      let acc = listAksesori.find(a => a.id === accId);
      if (acc) totalPersen += acc.bonusPersen;
    }
  }
  return totalPersen;
}

// ==========================================
// RENDER PETERNAKAN & PAKAN
// ==========================================
function renderPeternakan() {
  const container = document.getElementById('peternakan-container');
  if (!container) return;

  let sedangBadai = cuacaAktif.nama.includes('Badai');
  if (sedangBadai) {
    container.innerHTML = `
      <div style="text-align: center; padding: 30px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;">
        <div style="font-size: 32px; margin-bottom: 8px;">🌪️</div>
        <strong>Pasar Peternakan Tutup Sementara!</strong><br>
        <small style="color: #7f1d1d;">Toko peternakan tutup akibat cuaca buruk (${cuacaAktif.nama}).</small>
      </div>
    `;
    return;
  }

  let html = `<h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">🐄 Jual Beli Hewan Ternak</h4>`;
  
  libraryTernak.forEach(hewan => {
    html += `
      <div class="card-item" style="margin-bottom: 10px;">
        <div>
          <strong>${hewan.icon} ${hewan.nama}</strong><br>
          <small style="color: #64748b;">Beli: Rp ${formatRupiah(hewan.hargaBeli)} | Jual: Rp ${formatRupiah(hewan.hargaJual)}</small>
        </div>
        <div style="display: flex; gap: 5px;">
          <button class="btn-buy" onclick="bukaModalTransaksi('beli_ternak', '${hewan.nama}', ${hewan.hargaBeli})">Beli</button>
          <button class="btn-buy" style="background-color: #ef4444;" onclick="bukaModalTransaksi('jual_ternak', '${hewan.nama}', ${hewan.hargaJual})">Jual</button>
        </div>
      </div>
    `;
  });

  html += `<h4 style="margin: 15px 0 8px 0; color: #1e293b; font-size: 14px;">🌾 Toko Pakan Ternak</h4>`;
  html += `
    <div class="card-item">
      <div>
        <strong>${itemPakanTernak.icon} ${itemPakanTernak.nama}</strong><br>
        <small style="color: #64748b;">Harga: Rp ${formatRupiah(itemPakanTernak.hargaBeli)} / pcs (Stokmu: ${stokPakanTernak})</small>
      </div>
      <button class="btn-buy" style="background-color: #475569;" onclick="bukaModalTransaksi('beli_pakan', '${itemPakanTernak.id}', ${itemPakanTernak.hargaBeli})">Beli Pakan</button>
    </div>
  `;

  container.innerHTML = html;
}

function renderTabTernak() {
  const container = document.getElementById('kandang-container');
  if (!container) return;

  let infoPakan = document.getElementById('info-stok-pakan');
  if (infoPakan) {
    infoPakan.innerText = `Stok Pakan Ternak: ${stokPakanTernak} pcs`;
  }

  if (kandangTernak.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #64748b; font-size: 13px;">
        Kandang masih kosong. Beli hewan ternak di Tab Pasar/Peternakan!
      </div>
    `;
    return;
  }

  let html = '';
  kandangTernak.forEach((item, index) => {
    let hewan = libraryTernak.find(h => h.nama === item.nama);
    let statusKenyang = item.kenyang ? 'Kenyang 🟢' : 'Lapar 🔴';
    
    html += `
      <div class="card-item" style="margin-bottom: 8px;">
        <div>
          <strong>${hewan ? hewan.icon : '🐾'} ${item.nama}</strong><br>
          <small style="color: #64748b;">Status: ${statusKenyang}</small>
        </div>
        <div>
          ${!item.kenyang 
            ? `<button class="btn-submit" style="background-color: #10b981; padding: 5px 10px; font-size: 11px;" onclick="beriPakanTernak(${index})">Beri Pakan</button>`
            : `<button class="btn-submit" style="background-color: #94a3b8; padding: 5px 10px; font-size: 11px;" disabled>Sudah Kenyang</button>`
          }
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function beriPakanTernak(index) {
  if (stokPakanTernak <= 0) {
    showToast("Pakan ternak habis! Beli di Tab Pasar Peternakan.", "error");
    return;
  }

  if (kandangTernak[index]) {
    stokPakanTernak--;
    kandangTernak[index].kenyang = true;
    showToast(`Berhasil memberi pakan ${kandangTernak[index].nama}!`, "success");
    renderTabTernak();
    if (typeof simpanGame === 'function') simpanGame();
  }
}

function updatePanelAksesoriInfo() {
  let kepalaEl = document.getElementById('slot-kepala-display');
  let badanEl = document.getElementById('slot-badan-display');
  let kakiEl = document.getElementById('slot-kaki-display');
  let telapakEl = document.getElementById('slot-telapak-display');
  let totalBonusEl = document.getElementById('total-bonus-display');
  if (!kepalaEl) return;
  let getInfoAcc = (id) => {
    let a = listAksesori.find(item => item.id === id);
    return a ? `${a.icon} ${a.nama} (+${a.bonusPersen}%)` : 'Kosong';
  };
  kepalaEl.innerText = slotAktif.kepala ? getInfoAcc(slotAktif.kepala) : 'Kosong';
  badanEl.innerText = slotAktif.badan ? getInfoAcc(slotAktif.badan) : 'Kosong';
  kakiEl.innerText = slotAktif.kaki ? getInfoAcc(slotAktif.kaki) : 'Kosong';
  telapakEl.innerText = slotAktif.telapak ? getInfoAcc(slotAktif.telapak) : 'Kosong';
  let total = hitungTotalBonusPersen();
  totalBonusEl.innerText = `+${total}%`;
}

let toastTimeout = null;
function showToast(message, type = 'success') {
  const overlay = document.getElementById('toast-overlay');
  const card = document.getElementById('toast-card');
  const icon = document.getElementById('toast-icon');
  const msg = document.getElementById('toast-message');
  if (!overlay || !card) return;
  card.className = `toast-card ${type}`;
  icon.innerHTML = type === 'success' ? '✓' : '✕';
  msg.innerText = message;
  overlay.style.display = 'flex';
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    overlay.style.display = 'none';
  }, 400);
}

function openGameTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const targetTab = document.getElementById('tab-' + tabName);
  if (targetTab) targetTab.classList.add('active');

  const navButtons = document.querySelectorAll('.nav-tabs .tab-btn');
  navButtons.forEach(btn => {
    if (btn.getAttribute('onclick')?.includes(`'${tabName}'`)) {
      btn.classList.add('active');
    }
  });

  if (tabName === 'pertanian') renderLahan();
  if (tabName === 'inventory') renderInventory();
  if (tabName === 'profil') renderTabProfil();
  if (tabName === 'pasar') renderPasar();
  if (tabName === 'toko_aksesori') renderTokoAksesori();
  if (tabName === 'ternak') renderTabTernak();
  if (tabName === 'peternakan') renderPeternakan();
}

function simpanGame() {
  let dataGame = {
    uang,
    inventory,
    aksesoriDimiliki,
    slotAktif,
    lahan,
    lahanTambahanDibeli,
    stokPupuk,
    kandangTernak,
    stokPakanTernak,
    playerName
  };
  localStorage.setItem('gameBertaniData', JSON.stringify(dataGame));
  showToast("Progres berhasil disimpan!", "success");
}

function muatGame() {
  let savedData = localStorage.getItem('gameBertaniData');
  if (savedData) {
    try {
      let data = JSON.parse(savedData);
      uang = data.uang ?? uang;
      inventory = data.inventory ?? inventory;
      aksesoriDimiliki = data.aksesoriDimiliki ?? aksesoriDimiliki;
      slotAktif = data.slotAktif ?? slotAktif;
      lahan = data.lahan ?? lahan;
      lahanTambahanDibeli = data.lahanTambahanDibeli ?? lahanTambahanDibeli;
      stokPupuk = data.stokPupuk ?? stokPupuk;
      kandangTernak = data.kandangTernak ?? kandangTernak;
      stokPakanTernak = data.stokPakanTernak ?? stokPakanTernak;
      playerName = data.playerName ?? playerName;
    } catch (e) {
      console.error("Gagal memuat data game", e);
    }
  }
}
