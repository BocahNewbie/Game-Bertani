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
  if (typeof initMarketFluctuation === 'function') {
    initMarketFluctuation();
  }
  renderAll();
});

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
    if (firstSubBtn) { firstSubBtn.click(); }
  }
}

function switchSubTab(parentTab, subName) {
  const parent = document.getElementById(`tab-${parentTab}`);
  parent.querySelectorAll('.sub-content').forEach(el => el.classList.remove('active'));
  parent.querySelectorAll('.sub-nav .sub-tab-btn').forEach(el => el.classList.remove('active'));
  
  document.getElementById(`subtab-${subName}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

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
    } else { alert('Tidak ada bibit di inventory! Beli di Pasar.'); }
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
    const stokPakan = gameState.inventory.pakan['Rumput Kering'] || 0;
    
    document.getElementById(`info-kandang-${j}`).innerText = 
      `Kapasitas: ${dataKandang.isi.length} / ${dataKandang.kapasitas} Ekor (Max 5) | Pakan (Rumput Kering): ${stokPakan}`;

    const container = document.getElementById(`kandang-${j}-container`);
    container.innerHTML = '';

    if (dataKandang.isi.length === 0) {
      container.innerHTML = `<p style="font-size:12px; color:#64748b;">Kandang kosong. Beli hewan di Pasar!</p>`;
      return;
    }

    dataKandang.isi.forEach((h, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>${infoHewan.nama} #${index + 1}</h4>
        <p>Hasilkan: ${infoHewan.hasilTernak}</p>
        <button class="btn-primary" onclick="panenTernak('${j}', ${index})">🧺 Beri Pakan & Ambil</button>
      `;
      container.appendChild(card);
    });
  });
}

function panenTernak(jenis, index) {
  const infoHewan = DIREKTORI_HEWAN[jenis];
  if ((gameState.inventory.pakan['Rumput Kering'] || 0) > 0) {
    gameState.inventory.pakan['Rumput Kering']--;
    gameState.inventory.hasil[infoHewan.hasilTernak] = (gameState.inventory.hasil[infoHewan.hasilTernak] || 0) + 1;
    renderAll();
  } else { alert('Pakan Rumput Kering habis! Beli di Pasar.'); }
}

// 3. RENDER AKSESORIS (Menampilkan deskripsi efek aksesoris)
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
    const infoDetail = DIREKTORI_AKSESORIS[item];
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${item}</h4>
      <p style="font-size:10px; color:#0284c7; margin-bottom:6px;">${infoDetail ? infoDetail.efek : ''}</p>
      <button class="btn-primary" onclick="pakaiAksesoris('${item}')">Pakai</button>
    `;
    container.appendChild(card);
  });
}

// 4. RENDER PASAR (Menampilkan harga fluktuatif & deskripsi efek aksesoris)
function renderPasar() {
  const pasarBibit = document.getElementById('pasar-bibit-container');
  pasarBibit.innerHTML = '';
  Object.keys(DIREKTORI_TUMBUHAN).forEach(key => {
    const t = DIREKTORI_TUMBUHAN[key];
    const hPasar = hargaPasarAktif.bibit[key] || { beli: t.hargaBeliBase, jual: t.hargaJualBase };
    pasarBibit.innerHTML += `
      <div class="card">
        <h4>🌱 ${t.nama}</h4>
        <p>Beli: Rp ${hPasar.beli} | Jual: Rp ${hPasar.jual}<br>Waktu: ${t.waktuTumbuh}s</p>
        <button class="btn-primary" onclick="beliBibit('${t.nama}', ${hPasar.beli})">Beli</button>
      </div>
    `;
  });

  const pasarHewan = document.getElementById('pasar-hewan-container');
  pasarHewan.innerHTML = '';
  Object.keys(DIREKTORI_HEWAN).forEach(key => {
    const h = DIREKTORI_HEWAN[key];
    const hPasar = hargaPasarAktif.hewan[key] || { beli: h.hargaBeliBase, jualHewan: h.hargaJualHewanBase };
    const hPakan = hargaPasarAktif.pakan || 15;
    pasarHewan.innerHTML += `
      <div class="card">
        <h4>🐾 ${h.nama}</h4>
        <p>Beli Hewan: Rp ${hPasar.beli}<br>Pakan (Rumput Kering): Rp ${hPakan}</p>
        <button class="btn-primary" onclick="beliHewan('${h.jenis}', ${hPasar.beli})">Beli Hewan</button>
        <button class="btn-secondary" style="margin-top:4px;" onclick="beliPakan(${hPakan})">Beli Pakan</button>
      </div>
    `;
  });

  const pasarAksesoris = document.getElementById('pasar-aksesoris-container');
  pasarAksesoris.innerHTML = '';
  Object.keys(DIREKTORI_AKSESORIS).forEach(nama => {
    const item = DIREKTORI_AKSESORIS[nama];
    pasarAksesoris.innerHTML += `
      <div class="card">
        <h4>${nama}</h4>
        <p>Harga: Rp ${item.harga}</p>
        <p style="font-size:10px; color:#0284c7; margin-bottom:6px;">${item.efek}</p>
        <button class="btn-primary" onclick="beliAksesoris('${nama}', ${item.harga})">Beli</button>
      </div>
    `;
  });

  document.getElementById('pasar-ekspansi-container').innerHTML = `
    <div class="card">
      <h4>➕ Lahan Baru</h4>
      <p>Harga: Rp 500</p>
      <button class="btn-primary" onclick="beliLahan()">Tambah</button>
    </div>
    <div class="card">
      <h4>🏗️ Upgrade Kandang Ayam (Max 5)</h4>
      <p>Harga: Rp 300</p>
      <button class="btn-primary" onclick="perbesarKandang('ayam')">Upgrade Ayam</button>
    </div>
    <div class="card">
      <h4>🏗️ Upgrade Kandang Sapi (Max 5)</h4>
      <p>Harga: Rp 300</p>
      <button class="btn-primary" onclick="perbesarKandang('sapi')">Upgrade Sapi</button>
    </div>
    <div class="card">
      <h4>🏗️ Upgrade Kandang Domba (Max 5)</h4>
      <p>Harga: Rp 300</p>
      <button class="btn-primary" onclick="perbesarKandang('domba')">Upgrade Domba</button>
    </div>
  `;
}

// 5. RENDER INVENTORY
function renderInventory() {
  const containerHasil = document.getElementById('inv-hasil-container');
  containerHasil.innerHTML = '';
  // Bagian di dalam renderInventory() saat membuat card hasil panen:
card.innerHTML = `
  <h4>${nama}</h4>
  <p>Jumlah: ${jumlah}</p>
  <button class="btn-primary" onclick="bukaModalJual('${nama}', ${hargaJual})">Jual</button>
`;
  
  let daftarHargaJual = {};
  Object.keys(DIREKTORI_TUMBUHAN).forEach(key => {
    const t = DIREKTORI_TUMBUHAN[key];
    const namaBersih = t.nama.replace('Bibit ', '');
    daftarHargaJual[namaBersih] = hargaPasarAktif.bibit[key] ? hargaPasarAktif.bibit[key].jual : t.hargaJualBase;
  });
  Object.keys(DIREKTORI_HEWAN).forEach(key => {
    const h = DIREKTORI_HEWAN[key];
    daftarHargaJual[h.hasilTernak] = hargaPasarAktif.hewan[key] ? hargaPasarAktif.hewan[key].jualHasil : h.hargaJualHasilBase;
  });

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
          <button class="btn-primary" onclick="jualHasil('${nama}', ${hargaJual})">Jual (Rp ${hargaJual})</button>
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
// VARIABEL KONTROL MODAL JUAL
let itemJualAktif = {
  nama: '',
  hargaSatuanDasar: 0,
  stokMaks: 0
};

function bukaModalJual(namaItem, hargaDasar) {
  const stok = gameState.inventory.hasil[namaItem] || 0;
  if (stok <= 0) {
    tampilkanToast('Stok barang kosong di inventory!', 'error');
    return;
  }

  itemJualAktif = {
    nama: namaItem,
    hargaSatuanDasar: hargaDasar,
    stokMaks: stok
  };

  const bonusPersen = typeof hitungBonusAksesoris === 'function' ? hitungBonusAksesoris('jual') : 0;
  const hargaAkhirSatuan = Math.round(hargaDasar * (1 + bonusPersen / 100));

  document.getElementById('modal-jual-title').innerText = `Jual ${namaItem}`;
  document.getElementById('modal-jual-info').innerText = `Stok Tersedia: ${stok} | Harga @Rp ${hargaAkhirSatuan}`;
  document.getElementById('input-jumlah-jual').value = 1;
  document.getElementById('input-jumlah-jual').max = stok;
  document.getElementById('modal-jual').style.display = 'flex';
}

function tutupModalJual() {
  document.getElementById('modal-jual').style.display = 'none';
}

function ubahJumlahJual(delta) {
  const input = document.getElementById('input-jumlah-jual');
  let val = parseInt(input.value) || 1;
  val += delta;
  
  if (val < 1) val = 1;
  if (val > itemJualAktif.stokMaks) val = itemJualAktif.stokMaks;
  
  input.value = val;
}

function setJumlahJualMaks() {
  document.getElementById('input-jumlah-jual').value = itemJualAktif.stokMaks;
}

function validasiInputJual() {
  const input = document.getElementById('input-jumlah-jual');
  let val = parseInt(input.value) || 1;
  if (val < 1) input.value = 1;
  if (val > itemJualAktif.stokMaks) input.value = itemJualAktif.stokMaks;
}

function eksekusiJualItem() {
  const jumlahJual = parseInt(document.getElementById('input-jumlah-jual').value) || 0;
  if (jumlahJual <= 0 || jumlahJual > gameState.inventory.hasil[itemJualAktif.nama]) {
    tampilkanToast('Jumlah jual tidak valid!', 'error');
    return;
  }

  // Kurangi inventory
  gameState.inventory.hasil[itemJualAktif.nama] -= jumlahJual;
  if (gameState.inventory.hasil[itemJualAktif.nama] <= 0) {
    delete gameState.inventory.hasil[itemJualAktif.nama];
  }

  // Hitung total koin dengan bonus aksesoris
  const bonusPersen = typeof hitungBonusAksesoris === 'function' ? hitungBonusAksesoris('jual') : 0;
  const hargaAkhirSatuan = Math.round(itemJualAktif.hargaSatuanDasar * (1 + bonusPersen / 100));
  const totalPendapatan = hargaAkhirSatuan * jumlahJual;

  gameState.player.koin += totalPendapatan;
  
  tutupModalJual();
  renderAll();
  tampilkanToast(`Berhasil menjual ${jumlahJual}x ${itemJualAktif.nama} seharga Rp ${totalPendapatan.toLocaleString('id-ID')}!`);
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
