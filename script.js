// SCRIPT.JS - Logika Utama Game

const STORAGE_KEY = 'PETERNAKAN';

let gameState = {
  player: {
    nickname: 'Petani Handal',
    koin: 1500
  },
  aksesorisAktif: {
    topi: null,
    baju: null,
    sepatu: null
  },
  lahan: [
    { id: 1, tanaman: null, umur: 0, siapPanen: false },
    { id: 2, tanaman: null, umur: 0, siapPanen: false }
  ],
  kandang: {
    ayam: { kapasitas: 3, isi: [] },
    sapi: { kapasitas: 1, isi: [] },
    domba: { kapasitas: 1, isi: [] }
  },
  inventory: {
    bibit: {},
    pupuk: {},
    hasil: {},
    pakan: {},
    aksesoris: []
  }
};

document.addEventListener('DOMContentLoaded', () => {
  muatGame();
  renderAll();
});

// FUNGSI RESET GAME
function eksekusiResetGame() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function bukaModalReset() {
  document.getElementById('modal-reset').style.display = 'flex';
}

function tutupModalReset() {
  document.getElementById('modal-reset').style.display = 'none';
}

// NAVIGASI TAB UTAMA & OTOMATIS BUKA SUB-TAB PERTAMA
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.sub-nav').forEach(el => el.classList.remove('active-sub'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.currentTarget.classList.add('active');

  const currentTabSection = document.getElementById(`tab-${tabName}`);
  const targetSubNav = currentTabSection.querySelector('.sub-nav');
  
  if (targetSubNav) {
    targetSubNav.classList.add('active-sub');
    const firstSubBtn = targetSubNav.querySelector('.sub-tab-btn');
    if (firstSubBtn) {
      firstSubBtn.click();
    }
  }
}

function switchSubTab(parentTab, subName) {
  const parent = document.getElementById(`tab-${parentTab}`);
  parent.querySelectorAll('.sub-content').forEach(el => el.classList.remove('active'));
  parent.querySelectorAll('.sub-nav .sub-tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`subtab-${subName}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

// SIMPAN & MUAT GAME
function simpanGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  alert('Game berhasil disimpan!');
}

function muatGame() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try { gameState = JSON.parse(savedData); } catch (e) { console.error(e); }
  }
}

// RENDER UTAMA
function renderAll() {
  document.getElementById('player-nickname').innerText = `👨‍🌾 ${gameState.player.nickname} ✏️`;
  document.getElementById('player-koin').innerText = `Rp ${gameState.player.koin.toLocaleString('id-ID')}`;

  renderPertanian();
  renderPeternakan();
  renderAksesoris();
  renderPasar();
  renderInventory();
}

// 1. RENDER PERTANIAN
function renderPertanian() {
  const container = document.getElementById('lahan-container');
  container.innerHTML = '';

  gameState.lahan.forEach((l, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>Lahan ${index + 1}</h4>
      <p>${l.tanaman ? `${l.tanaman}<br>${l.siapPanen ? '🌾 Siap Panen!' : '⏳ Tumbuh'}` : 'Tanah Kosong'}</p>
      <button class="btn-primary" onclick="aksiLahan(${index})">
        ${l.tanaman ? (l.siapPanen ? 'Panen' : 'Siram') : 'Tanam'}
      </button>
    `;
    container.appendChild(card);
  });

  document.getElementById('pupuk-container').innerHTML = `
    <div class="card">
      <h4>🧪 Racik Pupuk Organik</h4>
      <p>Stok: ${gameState.inventory.pupuk['Pupuk Organik'] || 0}</p>
      <button class="btn-primary" onclick="racikPupuk()">Racik</button>
    </div>
  `;
}

function aksiLahan(index) {
  const lahan = gameState.lahan[index];
  if (!lahan.tanaman) {
    const bibitTersedia = Object.keys(gameState.inventory.bibit).find(b => gameState.inventory.bibit[b] > 0);
    if (bibitTersedia) {
      gameState.inventory.bibit[bibitTersedia]--;
      lahan.tanaman = bibitTersedia;
      lahan.siapPanen = true; 
      renderAll();
    } else {
      alert('Tidak ada bibit di inventory! Beli di Pasar.');
    }
  } else if (lahan.siapPanen) {
    const namaHasil = lahan.tanaman.replace('Bibit ', '');
    gameState.inventory.hasil[namaHasil] = (gameState.inventory.hasil[namaHasil] || 0) + 1;
    lahan.tanaman = null;
    lahan.siapPanen = false;
    renderAll();
  }
}

function racikPupuk() {
  gameState.inventory.pupuk['Pupuk Organik'] = (gameState.inventory.pupuk['Pupuk Organik'] || 0) + 1;
  renderAll();
}

// 2. RENDER PETERNAKAN
function renderPeternakan() {
  ['ayam', 'sapi', 'domba'].forEach(j => {
    const dataKandang = gameState.kandang[j];
    const infoHewan = DIREKTORI_HEWAN[j];
    
    document.getElementById(`info-kandang-${j}`).innerText = 
      `Kapasitas: ${dataKandang.isi.length} / ${dataKandang.kapasitas} Ekor | Pakan (${infoHewan.pakan}): ${gameState.inventory.pakan[infoHewan.pakan] || 0}`;

    const container = document.getElementById(`kandang-${j}-container`);
    container.innerHTML = '';

    if (dataKandang.isi.length === 0) {
      container.innerHTML = `<p style="font-size:12px; color:#64748b;">Kandang masih kosong. Beli hewan di Pasar!</p>`;
      return;
    }

    dataKandang.isi.forEach((h, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>${infoHewan.nama} #${index + 1}</h4>
        <p>Hasilkan: ${infoHewan.hasilTernak}</p>
        <button class="btn-primary" onclick="panenTernak('${j}', ${index})">🧺 Ambil Hasil</button>
      `;
      container.appendChild(card);
    });
  });
}

function panenTernak(jenis, index) {
  const infoHewan = DIREKTORI_HEWAN[jenis];
  const pakanDibutuhkan = infoHewan.pakan;

  if ((gameState.inventory.pakan[pakanDibutuhkan] || 0) > 0) {
    gameState.inventory.pakan[pakanDibutuhkan]--;
    gameState.inventory.hasil[infoHewan.hasilTernak] = (gameState.inventory.hasil[infoHewan.hasilTernak] || 0) + 1;
    renderAll();
  } else {
    alert(`Pakan ${pakanDibutuhkan} habis! Beli pakan di Pasar.`);
  }
}

// 3. RENDER AKSESORIS
function renderAksesoris() {
  document.getElementById('slot-topi').innerText = gameState.aksesorisAktif.topi || 'Kosong';
  document.getElementById('slot-baju').innerText = gameState.aksesorisAktif.baju || 'Kosong';
  document.getElementById('slot-sepatu').innerText = gameState.aksesorisAktif.sepatu || 'Kosong';

  const bonusJual = typeof hitungBonusAksesoris === 'function' ? hitungBonusAksesoris('jual') : 0;
  document.getElementById('total-bonus').innerText = `+${bonusJual}%`;

  const container = document.getElementById('koleksi-aksesoris-container');
  container.innerHTML = '';
  
  if (gameState.inventory.aksesoris.length === 0) {
    container.innerHTML = `<p style="font-size:12px; color:#64748b;">Belum ada koleksi aksesoris. Beli di Pasar!</p>`;
    return;
  }

  gameState.inventory.aksesoris.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h4>${item}</h4><button class="btn-primary" onclick="pakaiAksesoris('${item}')">Pakai</button>`;
    container.appendChild(card);
  });
}

// 4. RENDER PASAR
function renderPasar() {
  const pasarBibit = document.getElementById('pasar-bibit-container');
  pasarBibit.innerHTML = '';
  Object.values(DIREKTORI_TUMBUHAN).forEach(t => {
    pasarBibit.innerHTML += `
      <div class="card">
        <h4>🌱 ${t.nama}</h4>
        <p>Beli: Rp ${t.hargaBeli} | Jual: Rp ${t.hargaJual}<br>Waktu: ${t.waktuTumbuh}s</p>
        <button class="btn-primary" onclick="beliBibit('${t.nama}', ${t.hargaBeli})">Beli</button>
      </div>
    `;
  });

  const pasarHewan = document.getElementById('pasar-hewan-container');
  pasarHewan.innerHTML = '';
  Object.values(DIREKTORI_HEWAN).forEach(h => {
    pasarHewan.innerHTML += `
      <div class="card">
        <h4>🐾 ${h.nama}</h4>
        <p>Beli Hewan: Rp ${h.hargaBeli}<br>Pakan (${h.pakan}): Rp ${h.hargaPakan}</p>
        <button class="btn-primary" onclick="beliHewan('${h.jenis}', ${h.hargaBeli})">Beli Hewan</button>
        <button class="btn-secondary" style="margin-top:4px;" onclick="beliPakan('${h.pakan}', ${h.hargaPakan})">Beli Pakan</button>
      </div>
    `;
  });

  document.getElementById('pasar-aksesoris-container').innerHTML = `
    <div class="card">
      <h4>🎩 Topi Caping</h4>
      <p>Harga: Rp 150</p>
      <button class="btn-primary" onclick="beliAksesoris('Topi Caping', 150)">Beli</button>
    </div>
    <div class="card">
      <h4>👟 Sepatu Bot</h4>
      <p>Harga: Rp 200</p>
      <button class="btn-primary" onclick="beliAksesoris('Sepatu Bot', 200)">Beli</button>
    </div>
  `;

  document.getElementById('pasar-ekspansi-container').innerHTML = `
    <div class="card">
      <h4>➕ Lahan Baru</h4>
      <p>Harga: Rp 500</p>
      <button class="btn-primary" onclick="beliLahan()">Tambah</button>
    </div>
    <div class="card">
      <h4>🏗️ Perbesar Kandang Ayam</h4>
      <p>Harga: Rp 300</p>
      <button class="btn-primary" onclick="perbesarKandang('ayam', 300)">Perbesar</button>
    </div>
  `;
}

// 5. RENDER INVENTORY
function renderInventory() {
  const containerHasil = document.getElementById('inv-hasil-container');
  containerHasil.innerHTML = '';
  
  let daftarHargaJual = {};
  Object.values(DIREKTORI_TUMBUHAN).forEach(t => daftarHargaJual[t.nama.replace('Bibit ', '')] = t.hargaJual);
  Object.values(DIREKTORI_HEWAN).forEach(h => daftarHargaJual[h.hasilTernak] = h.hargaJualHasil);

  const totalHasil = Object.values(gameState.inventory.hasil).reduce((a, b) => a + b, 0);
  if (totalHasil === 0) {
    containerHasil.innerHTML = `<p style="font-size:12px; color:#64748b;">Belum ada hasil panen atau ternak di inventory.</p>`;
  } else {
    Object.entries(gameState.inventory.hasil).forEach(([nama, jumlah]) => {
      if (jumlah > 0) {
        const hargaJual = daftarHargaJual[nama] || 100;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h4>${nama}</h4>
          <p>Jumlah: ${jumlah}</p>
          <button class="btn-primary" onclick="jualHasil('${nama}', ${hargaJual})">Jual</button>
        `;
        containerHasil.appendChild(card);
      }
    });
  }

  const containerBibit = document.getElementById('inv-bibit-container');
  containerBibit.innerHTML = '';
  
  let adaStokBibitPakan = false;
  Object.entries(gameState.inventory.bibit).forEach(([nama, jumlah]) => {
    if (jumlah > 0) {
      adaStokBibitPakan = true;
      containerBibit.innerHTML += `<div class="card"><h4>${nama}</h4><p>Stok: ${jumlah}</p></div>`;
    }
  });
  Object.entries(gameState.inventory.pakan).forEach(([nama, jumlah]) => {
    if (jumlah > 0) {
      adaStokBibitPakan = true;
      containerBibit.innerHTML += `<div class="card"><h4>Pakan: ${nama}</h4><p>Stok: ${jumlah}</p></div>`;
    }
  });

  if (!adaStokBibitPakan) {
    containerBibit.innerHTML = `<p style="font-size:12px; color:#64748b;">Stok bibit dan pakan kosong.</p>`;
  }
}

// MODAL NICKNAME
function bukaModalNickname() {
  document.getElementById('input-nickname').value = gameState.player.nickname;
  document.getElementById('modal-nickname').style.display = 'flex';
}

function tutupModalNickname() {
  document.getElementById('modal-nickname').style.display = 'none';
}

function simpanNickname() {
  const val = document.getElementById('input-nickname').value;
  if (val.trim() !== '') {
    gameState.player.nickname = val.trim();
    renderAll();
    tutupModalNickname();
  }
}
