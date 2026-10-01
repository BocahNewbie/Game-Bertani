// SCRIPT.JS - Logika Utama Game, Waktu Realtime, Modal Pilih Bibit Modern & Auto-Save

const STORAGE_KEY = 'PETERNAKAN';

let gameState = {
  player: {
    nickname: 'Petani Newbie',
    koin: 1500
  },
  aksesorisAktif: {
    topi: null,
    baju: null,
    sepatu: null
  },
  lahan: [
    { id: 1, tanaman: null, jumlah: 0, waktuTanam: null, durasiDetik: 0, siapPanen: false }
  ],
  kandang: {
    ayam: { level: 1, kapasitas: 2, isi: [] },
    sapi: { level: 1, kapasitas: 2, isi: [] },
    domba: { level: 1, kapasitas: 2, isi: [] }
  },
  inventory: {
    bibit: {},
    pupuk: {},
    hasil: {},
    pakan: {},
    aksesoris: []
  }
};

// Timer Loop Realtime setiap 1 detik
document.addEventListener('DOMContentLoaded', () => {
  muatGame();
  if (typeof initMarketFluctuation === 'function') {
    initMarketFluctuation();
  }
  renderAll();

  setInterval(() => {
    cekWaktuTanamanRealtime();
  }, 1000);
});

// SIMPAN OTOMATIS (AUTO-SAVE)
function autoSaveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

window.addEventListener('beforeunload', () => {
  autoSaveGame();
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
  autoSaveGame();
  if (typeof tampilkanToast === 'function') tampilkanToast('Game berhasil disimpan!');
}

function muatGame() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try { 
      const parsed = JSON.parse(savedData);
      gameState = parsed;
      
      ['ayam', 'sapi', 'domba'].forEach(j => {
        if (gameState.kandang[j]) {
          if (!gameState.kandang[j].level) gameState.kandang[j].level = 1;
          if (!gameState.kandang[j].kapasitas) gameState.kandang[j].kapasitas = 2;
        }
      });
      if (gameState.lahan) {
        gameState.lahan.forEach(l => {
          if (l.tanaman && !l.jumlah) l.jumlah = 1;
          if (l.tanaman && !l.waktuTanam) l.waktuTanam = Date.now();
        });
      }
    } catch (e) { console.error(e); }
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

// FORMATTER WAKTU CERDAS
function formatSisaWaktu(detikSisa) {
  if (detikSisa <= 0) return '🌾 Siap Panen!';
  
  const totalMenit = Math.floor(detikSisa / 60);
  const detik = detikSisa % 60;
  
  const hari = Math.floor(totalMenit / 1440);
  const jam = Math.floor((totalMenit % 1440) / 60);
  const menit = totalMenit % 60;

  let hasilStr = [];
  if (hari > 0) hasilStr.push(`${hari} hari`);
  if (jam > 0 || hari > 0) hasilStr.push(`${jam} jam`);
  if (menit > 0 || (jam === 0 && hari === 0)) hasilStr.push(`${menit}m`);
  if (hari === 0 && jam === 0) hasilStr.push(`${detik}s`);

  return `⏳ Sisa: ${hasilStr.join(' ')}`;
}

// 1. RENDER PERTANIAN
function renderPertanian() {
  const container = document.getElementById('lahan-container');
  container.innerHTML = '';

  const sekarang = Date.now();

  gameState.lahan.forEach((l, index) => {
    let statusTeks = 'Tanah Kosong';
    let tombolLabel = '🌱 Tanam';
    let tombolDisabled = false;

    if (l.tanaman) {
      const waktuLewatDetik = Math.floor((sekarang - l.waktuTanam) / 1000);
      const sisaDetik = l.durasiDetik - waktuLewatDetik;

      if (sisaDetik <= 0) {
        l.siapPanen = true;
        statusTeks = `${l.tanaman} (${l.jumlah}x)<br>🌾 <b>Siap Panen!</b>`;
        tombolLabel = '🧺 Panen';
      } else {
        l.siapPanen = false;
        statusTeks = `${l.tanaman} (${l.jumlah}x)<br>${formatSisaWaktu(sisaDetik)}`;
        tombolLabel = '⏳ Tumbuh...';
        tombolDisabled = true;
      }
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>Lahan ${index + 1}</h4>
      <p>${statusTeks}</p>
      <button class="btn-primary" onclick="aksiLahan(${index})" ${tombolDisabled ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : ''}>
        ${tombolLabel}
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

function cekWaktuTanamanRealtime() {
  let adaPerubahan = false;
  const sekarang = Date.now();

  gameState.lahan.forEach(l => {
    if (l.tanaman && !l.siapPanen) {
      const waktuLewatDetik = Math.floor((sekarang - l.waktuTanam) / 1000);
      if (waktuLewatDetik >= l.durasiDetik) {
        l.siapPanen = true;
        adaPerubahan = true;
      }
    }
  });

  if (adaPerubahan) {
    renderPertanian();
  } else {
    gameState.lahan.forEach((l, index) => {
      if (l.tanaman && !l.siapPanen) {
        const waktuLewatDetik = Math.floor((sekarang - l.waktuTanam) / 1000);
        const sisaDetik = l.durasiDetik - waktuLewatDetik;
        const container = document.getElementById('lahan-container');
        if (container && container.children[index]) {
          const pEl = container.children[index].querySelector('p');
          if (pEl) {
            pEl.innerHTML = `${l.tanaman} (${l.jumlah}x)<br>${formatSisaWaktu(sisaDetik)}`;
          }
        }
      }
    });
  }
}

// Logika Klik Tanam dengan Modal Pilihan Bibit Modern
let lahanDipilihIndex = 0;

function aksiLahan(index) {
  const lahan = gameState.lahan[index];
  
  if (!lahan.tanaman) {
    const bibitTersediaList = Object.keys(gameState.inventory.bibit).filter(b => gameState.inventory.bibit[b] > 0);
    
    if (bibitTersediaList.length === 0) {
      if (typeof tampilkanToast === 'function') tampilkanToast('Tidak ada bibit di inventory! Beli di Pasar.', 'error');
      return;
    }

    lahanDipilihIndex = index;

    // Jika hanya ada 1 jenis bibit, langsung lewati pemilihan dan buka modal jumlah
    if (bibitTersediaList.length === 1) {
      bukaModalJumlahTanam(bibitTersediaList[0]);
    } else {
      // Jika lebih dari 1, tampilkan modal pilihan bibit modern
      bukaModalPilihBibit(bibitTersediaList);
    }
    
  } else if (lahan.siapPanen) {
    const namaHasil = lahan.tanaman.replace('Bibit ', '');
    const jumlahPanen = lahan.jumlah || 1;
    
    gameState.inventory.hasil[namaHasil] = (gameState.inventory.hasil[namaHasil] || 0) + jumlahPanen;
    
    lahan.tanaman = null;
    lahan.jumlah = 0;
    lahan.waktuTanam = null;
    lahan.durasiDetik = 0;
    lahan.siapPanen = false;
    
    autoSaveGame();
    renderAll();
    if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil memanen ${jumlahPanen}x ${namaHasil}!`);
  }
}

function racikPupuk() {
  gameState.inventory.pupuk['Pupuk Organik'] = (gameState.inventory.pupuk['Pupuk Organik'] || 0) + 1;
  autoSaveGame();
  renderAll();
  if (typeof tampilkanToast === 'function') tampilkanToast('Berhasil meracik Pupuk Organik!');
}

// 2. RENDER PETERNAKAN
function renderPeternakan() {
  ['ayam', 'sapi', 'domba'].forEach(j => {
    const dataKandang = gameState.kandang[j];
    const infoHewan = DIREKTORI_HEWAN[j];
    const stokPakan = gameState.inventory.pakan['Rumput Kering'] || 0;
    
    document.getElementById(`info-kandang-${j}`).innerText = 
      `Level Kandang: Lv.${dataKandang.level} | Kapasitas: ${dataKandang.isi.length} / ${dataKandang.kapasitas} Ekor | Pakan: ${stokPakan}`;

    const container = document.getElementById(`kandang-${j}-container`);
    container.innerHTML = '';

    if (dataKandang.isi.length === 0) {
      container.innerHTML = `<p style="font-size:12px; color:#64748b;">Kandang kosong. Beli hewan di Pasar!</p>`;
      return;
    }

    dataKandang.isi.forEach((h, index) => {
      const namaHewanTampil = h.namaCustom || `${infoHewan.nama} #${index + 1}`;
      const hJual = hargaPasarAktif.hewan[j] ? hargaPasarAktif.hewan[j].jualHewan : infoHewan.hargaJualHewanBase;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4 style="cursor:pointer;" onclick="bukaModalNamaHewan('${j}', ${index})" title="Klik untuk ubah nama">🏷️ ${namaHewanTampil} ✏️</h4>
        <p>Hasilkan: ${infoHewan.hasilTernak} (${infoHewan.jumlahHasil || 1}x)</p>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: auto;">
          <button class="btn-primary" onclick="panenTernak('${j}', ${index})">🧺 Beri Pakan & Ambil</button>
          <button class="btn-danger" style="font-size: 10px; padding: 4px;" onclick="bukaModalKonfirmasiJualHewan('${j}', ${index}, ${hJual})">Jual (Rp ${hJual})</button>
        </div>
      `;
      container.appendChild(card);
    });
  });
}

function panenTernak(jenis, index) {
  const infoHewan = DIREKTORI_HEWAN[jenis];
  const jumlahDapat = infoHewan.jumlahHasil || 1;

  if ((gameState.inventory.pakan['Rumput Kering'] || 0) > 0) {
    gameState.inventory.pakan['Rumput Kering']--;
    gameState.inventory.hasil[infoHewan.hasilTernak] = (gameState.inventory.hasil[infoHewan.hasilTernak] || 0) + jumlahDapat;
    
    autoSaveGame();
    renderAll();
    if (typeof tampilkanToast === 'function') {
      tampilkanToast(`Berhasil memerah dan mendapatkan ${jumlahDapat}x ${infoHewan.hasilTernak}!`);
    }
  } else { 
    if (typeof tampilkanToast === 'function') tampilkanToast('Pakan Rumput Kering habis! Beli di Pasar.', 'error'); 
  }
}

// Modal Ganti Nama & Jual Hewan
let targetHewanAktif = { jenis: '', index: 0, harga: 0 };

function bukaModalNamaHewan(jenis, index) {
  targetHewanAktif = { jenis, index };
  const hewan = gameState.kandang[jenis].isi[index];
  
  document.getElementById('input-nama-hewan').value = hewan.namaCustom || "";
  document.getElementById('modal-nama-hewan').style.display = 'flex';
}

function tutupModalNamaHewan() {
  document.getElementById('modal-nama-hewan').style.display = 'none';
}

function simpanNamaHewanBaru() {
  const inputVal = document.getElementById('input-nama-hewan').value.trim();
  const hewan = gameState.kandang[targetHewanAktif.jenis].isi[targetHewanAktif.index];
  
  hewan.namaCustom = inputVal !== "" ? inputVal : null;
  tutupModalNamaHewan();
  autoSaveGame();
  renderAll();
  if (typeof tampilkanToast === 'function') tampilkanToast('Nama hewan berhasil diperbarui!');
}

function bukaModalKonfirmasiJualHewan(jenis, index, hargaJual) {
  targetHewanAktif = { jenis, index, harga: hargaJual };
  const hewan = gameState.kandang[jenis].isi[index];
  const namaLabel = hewan.namaCustom || `${jenis} #${index + 1}`;

  document.getElementById('modal-jual-hewan-text').innerText = `Yakin ingin menjual ${namaLabel} seharga Rp ${hargaJual.toLocaleString('id-ID')}?`;
  document.getElementById('modal-jual-hewan').style.display = 'flex';
}

function tutupModalJualHewan() {
  document.getElementById('modal-jual-hewan').style.display = 'none';
}

function eksekusiJualHewanModal() {
  const { jenis, index, harga } = targetHewanAktif;
  const hewan = gameState.kandang[jenis].isi[index];
  const namaLabel = hewan.namaCustom || `${jenis} #${index + 1}`;

  gameState.player.koin += harga;
  gameState.kandang[jenis].isi.splice(index, 1);

  tutupModalJualHewan();
  autoSaveGame();
  renderAll();
  if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil menjual ${namaLabel}!`);
}

function beliHewanCustom(jenis, hargaBeli) {
  const k = gameState.kandang[jenis];
  if (k.isi.length >= k.kapasitas) {
    if (typeof tampilkanToast === 'function') tampilkanToast(`Kandang ${jenis} sudah penuh (Maksimal ${k.kapasitas} Ekor)!`, 'error');
    return;
  }
  if (gameState.player.koin >= hargaBeli) {
    gameState.player.koin -= hargaBeli;
    k.isi.push({ 
      id: Date.now(), 
      namaCustom: null,
      siapPanen: true 
    });

    autoSaveGame();
    renderAll();
    if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil menambahkan ${jenis} baru ke kandang!`);
  } else {
    if (typeof tampilkanToast === 'function') tampilkanToast('Koin tidak cukup!', 'error');
  }
}

// 3. RENDER AKSESORIS
function renderAksesoris() {
  const topName = gameState.aksesorisAktif.topi || 'Kosong';
  const bajuName = gameState.aksesorisAktif.baju || 'Kosong';
  const sepatuName = gameState.aksesorisAktif.sepatu || 'Kosong';

  const btnLepas = (tipe) => `<span style="color:#ef4444; cursor:pointer; font-size:11px; margin-left:8px; font-weight:bold;" onclick="lepasAksesoris('${tipe}')">[Lepas]</span>`;

  document.getElementById('slot-topi').innerHTML = `${topName} ${topName !== 'Kosong' ? btnLepas('topi') : ''}`;
  document.getElementById('slot-baju').innerHTML = `${bajuName} ${bajuName !== 'Kosong' ? btnLepas('baju') : ''}`;
  document.getElementById('slot-sepatu').innerHTML = `${sepatuName} ${sepatuName !== 'Kosong' ? btnLepas('sepatu') : ''}`;

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
    const sedangDipakai = Object.values(gameState.aksesorisAktif).includes(item);

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${item}</h4>
      <p style="font-size:10px; color:#0284c7; margin-bottom:6px;">${infoDetail ? infoDetail.efek : ''}</p>
      <button class="btn-primary" 
        onclick="pakaiAksesoris('${item}')"
        ${sedangDipakai ? 'disabled style="background: #94a3b8; cursor: not-allowed;"' : ''}>
        ${sedangDipakai ? 'Sedang Dipakai' : 'Pakai'}
      </button>
    `;
    container.appendChild(card);
  });
}

// 4. RENDER PASAR
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
        <button class="btn-primary" onclick="bukaModalBeli('bibit', '${t.nama}', ${hPasar.beli})">Beli</button>
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
        <button class="btn-primary" onclick="beliHewanCustom('${h.jenis}', ${hPasar.beli})">Beli Hewan</button>
        <button class="btn-secondary" style="margin-top:4px;" onclick="bukaModalBeli('pakan', 'Rumput Kering', ${hPakan})">Beli Pakan</button>
      </div>
    `;
  });

  const pasarAksesoris = document.getElementById('pasar-aksesoris-container');
  pasarAksesoris.innerHTML = '';
  Object.keys(DIREKTORI_AKSESORIS).forEach(nama => {
    const item = DIREKTORI_AKSESORIS[nama];
    const sudahPunya = gameState.inventory.aksesoris.includes(nama);
    const sedangDipakai = Object.values(gameState.aksesorisAktif).includes(nama);
    const milikSiap = sudahPunya || sedangDipakai;

    pasarAksesoris.innerHTML += `
      <div class="card">
        <h4>${nama}</h4>
        <p>Harga: Rp ${item.harga}</p>
        <p style="font-size:10px; color:#0284c7; margin-bottom:6px;">${item.efek}</p>
        <button class="btn-primary" 
          onclick="beliAksesoris('${nama}', ${item.harga})"
          ${milikSiap ? 'disabled style="background: #94a3b8; cursor: not-allowed;"' : ''}>
          ${milikSiap ? 'Sudah Punya' : 'Beli'}
        </button>
      </div>
    `;
  });

  const expContainer = document.getElementById('pasar-ekspansi-container');
  
  const isMaxLahan = gameState.lahan.length >= 10;
  const hargaLahan = isMaxLahan ? 0 : typeof hitungHargaUpgradeLahan === 'function' ? hitungHargaUpgradeLahan(gameState.lahan.length) : 150000;
  
  expContainer.innerHTML = `
    <div class="card">
      <h4>➕ Lahan Tani Baru</h4>
      <p>Lahan Aktif: ${gameState.lahan.length} / 10<br>${isMaxLahan ? '<b>Maksimal Lahan</b>' : `Harga Upgrade: Rp ${hargaLahan.toLocaleString('id-ID')}`}</p>
      <button class="btn-primary" onclick="beliLahan()" ${isMaxLahan ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : ''}>
        ${isMaxLahan ? 'Max Lahan' : `Beli Lahan ke-${gameState.lahan.length + 1}`}
      </button>
    </div>
  `;

  ['ayam', 'sapi', 'domba'].forEach(jenis => {
    const kandang = gameState.kandang[jenis];
    const nextLevel = kandang.level + 1;
    const isMax = kandang.level >= 10;
    const hargaUpgrade = isMax ? 0 : typeof hitungHargaUpgradeKandang === 'function' ? hitungHargaUpgradeKandang(kandang.level) : 50000;
    const namaHewanCapital = jenis.charAt(0).toUpperCase() + jenis.slice(1);

    expContainer.innerHTML += `
      <div class="card">
        <h4>🏗 Kandang ${namaHewanCapital}</h4>
        <p>Level: ${kandang.level} / 10<br>Kapasitas: ${kandang.kapasitas} Ekor<br>${isMax ? '<b>Maksimal Level</b>' : `Biaya Upgrade: Rp ${hargaUpgrade.toLocaleString('id-ID')}`}</p>
        <button class="btn-primary" onclick="upgradeKandang('${jenis}')" ${isMax ? 'disabled style="background:#94a3b8; cursor:not-allowed;"' : ''}>
          ${isMax ? 'Max Level' : `Upgrade Lv.${nextLevel}`}
        </button>
      </div>
    `;
  });
}

// 5. RENDER INVENTORY
function renderInventory() {
  const containerHasil = document.getElementById('inv-hasil-container');
  containerHasil.innerHTML = '';
  
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
          <button class="btn-primary" onclick="bukaModalJual('${nama}', ${hargaJual})">Jual</button>
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

// ==========================================
// MODAL UNIVERSAL & PILIH BIBIT MODERN
// ==========================================
let itemAktifModal = {
  mode: '', 
  kategori: '',
  nama: '',
  hargaSatuan: 0,
  limitMaks: 0
};

let itemTanamAktif = {
  lahanIndex: 0,
  namaBibit: '',
  stokMaks: 0
};

// Fungsi Membuka Modal Pilihan Bibit (Modern Card Grid)
function bukaModalPilihBibit(bibitList) {
  const containerList = document.getElementById('modal-pilih-bibit-list');
  if (!containerList) {
    // Jika elemen modal belum ada di HTML, fallback ke jumlah langsung jika error
    bukaModalJumlahTanam(bibitList[0]);
    return;
  }

  containerList.innerHTML = '';
  bibitList.forEach(namaBibit => {
    const stok = gameState.inventory.bibit[namaBibit];
    const btn = document.createElement('button');
    btn.className = 'btn-primary';
    btn.style.width = '100%';
    btn.style.padding = '10px';
    btn.style.marginBottom = '6px';
    btn.innerHTML = `🌱 ${namaBibit} <span style="font-size: 11px; opacity: 0.9;">(Stok: ${stok})</span>`;
    btn.onclick = () => {
      tutupModalPilihBibit();
      bukaModalJumlahTanam(namaBibit);
    };
    containerList.appendChild(btn);
  });

  document.getElementById('modal-pilih-bibit').style.display = 'flex';
}

function tutupModalPilihBibit() {
  const el = document.getElementById('modal-pilih-bibit');
  if (el) el.style.display = 'none';
}

function bukaModalJumlahTanam(namaBibit) {
  const stok = gameState.inventory.bibit[namaBibit] || 0;
  itemTanamAktif = {
    lahanIndex: lahanDipilihIndex,
    namaBibit: namaBibit,
    stokMaks: Math.min(stok, 99)
  };

  document.getElementById('modal-tanam-title').innerText = `Tanam ${namaBibit}`;
  document.getElementById('modal-tanam-info').innerText = `Stok di Tas: ${stok} | Maks 99 per lahan`;
  document.getElementById('input-jumlah-tanam').value = 1;
  document.getElementById('input-jumlah-tanam').max = itemTanamAktif.stokMaks;
  document.getElementById('modal-tanam').style.display = 'flex';
}

function bukaModalBeli(kategori, namaItem, hargaSatuan) {
  itemAktifModal = {
    mode: 'beli',
    kategori: kategori,
    nama: namaItem,
    hargaSatuan: hargaSatuan,
    limitMaks: 99
  };

  document.getElementById('modal-jual-title').innerText = `Beli ${namaItem}`;
  document.getElementById('modal-jual-info').innerText = `Harga @Rp ${hargaSatuan} | Maks 99`;
  document.getElementById('input-jumlah-jual').value = 1;
  document.getElementById('input-jumlah-jual').max = 99;
  document.getElementById('modal-jual').style.display = 'flex';
}

function bukaModalJual(namaItem, hargaDasar) {
  const stok = gameState.inventory.hasil[namaItem] || 0;
  if (stok <= 0) {
    if (typeof tampilkanToast === 'function') tampilkanToast('Stok barang kosong di inventory!', 'error');
    return;
  }

  const bonusPersen = typeof hitungBonusAksesoris === 'function' ? hitungBonusAksesoris('jual') : 0;
  const hargaAkhirSatuan = Math.round(hargaDasar * (1 + bonusPersen / 100));

  itemAktifModal = {
    mode: 'jual',
    kategori: 'hasil',
    nama: namaItem,
    hargaSatuan: hargaAkhirSatuan,
    limitMaks: stok
  };

  document.getElementById('modal-jual-title').innerText = `Jual ${namaItem}`;
  document.getElementById('modal-jual-info').innerText = `Stok Tersedia: ${stok} | Harga @Rp ${hargaAkhirSatuan}`;
  document.getElementById('input-jumlah-jual').value = 1;
  document.getElementById('input-jumlah-jual').max = stok;
  document.getElementById('modal-jual').style.display = 'flex';
}

function tutupModalJual() {
  document.getElementById('modal-jual').style.display = 'none';
}

function tutupModalTanam() {
  document.getElementById('modal-tanam').style.display = 'none';
}

function ubahJumlahJual(delta) {
  const input = document.getElementById('input-jumlah-jual');
  let val = parseInt(input.value) || 1;
  val += delta;
  
  let maxVal = itemAktifModal.limitMaks;
  if (itemAktifModal.mode === 'beli') {
    const maxMampuBeli = Math.floor(gameState.player.koin / itemAktifModal.hargaSatuan);
    maxVal = Math.min(itemAktifModal.limitMaks, maxMampuBeli);
  }
  
  if (val < 1) val = 1;
  if (val > maxVal) val = Math.max(1, maxVal);
  
  input.value = val;
}

function setJumlahJualMaks() {
  let maxVal = itemAktifModal.limitMaks;
  if (itemAktifModal.mode === 'beli') {
    const maxMampuBeli = Math.floor(gameState.player.koin / itemAktifModal.hargaSatuan);
    maxVal = Math.min(itemAktifModal.limitMaks, maxMampuBeli);
    if (maxVal < 1) {
      if (typeof tampilkanToast === 'function') tampilkanToast('Koin Anda tidak cukup!', 'error');
      maxVal = 1; 
    }
  }
  document.getElementById('input-jumlah-jual').value = maxVal;
}

function validasiInputJual() {
  const input = document.getElementById('input-jumlah-jual');
  let val = parseInt(input.value) || 1;
  
  let maxVal = itemAktifModal.limitMaks;
  if (itemAktifModal.mode === 'beli') {
    const maxMampuBeli = Math.floor(gameState.player.koin / itemAktifModal.hargaSatuan);
    maxVal = Math.min(itemAktifModal.limitMaks, maxMampuBeli);
  }

  if (val < 1) input.value = 1;
  if (val > maxVal) input.value = Math.max(1, maxVal);
}

function ubahJumlahTanam(delta) {
  const input = document.getElementById('input-jumlah-tanam');
  let val = parseInt(input.value) || 1;
  val += delta;
  
  if (val < 1) val = 1;
  if (val > itemTanamAktif.stokMaks) val = itemTanamAktif.stokMaks;
  
  input.value = val;
}

function setJumlahTanamMaks() {
  document.getElementById('input-jumlah-tanam').value = itemTanamAktif.stokMaks;
}

function validasiInputTanam() {
  const input = document.getElementById('input-jumlah-tanam');
  let val = parseInt(input.value) || 1;
  if (val < 1) input.value = 1;
  if (val > itemTanamAktif.stokMaks) input.value = itemTanamAktif.stokMaks;
}

function eksekusiTanamBibit() {
  const jumlahTanam = parseInt(document.getElementById('input-jumlah-tanam').value) || 0;
  if (jumlahTanam <= 0 || jumlahTanam > itemTanamAktif.stokMaks) {
    if (typeof tampilkanToast === 'function') tampilkanToast('Jumlah tanam tidak valid!', 'error');
    return;
  }

  const lahan = gameState.lahan[itemTanamAktif.lahanIndex];
  const infoBibit = typeof DIREKTORI_TUMBUHAN !== 'undefined' ? DIREKTORI_TUMBUHAN[itemTanamAktif.namaBibit] : null;
  const durasiTumbuhDetik = infoBibit ? (infoBibit.waktuTumbuh || 60) : 60;

  gameState.inventory.bibit[itemTanamAktif.namaBibit] -= jumlahTanam;
  if (gameState.inventory.bibit[itemTanamAktif.namaBibit] <= 0) {
    delete gameState.inventory.bibit[itemTanamAktif.namaBibit];
  }

  lahan.tanaman = itemTanamAktif.namaBibit;
  lahan.jumlah = jumlahTanam;
  lahan.waktuTanam = Date.now();
  lahan.durasiDetik = durasiTumbuhDetik;
  lahan.siapPanen = false;

  tutupModalTanam();
  autoSaveGame();
  renderAll();
  if (typeof tampilkanToast === 'function') {
    tampilkanToast(`Berhasil menanam ${jumlahTanam}x ${itemTanamAktif.namaBibit}!`);
  }
}

function eksekusiJualItem() {
  const jumlah = parseInt(document.getElementById('input-jumlah-jual').value) || 0;
  
  let maxVal = itemAktifModal.limitMaks;
  if (itemAktifModal.mode === 'beli') {
    const maxMampuBeli = Math.floor(gameState.player.koin / itemAktifModal.hargaSatuan);
    maxVal = Math.min(itemAktifModal.limitMaks, maxMampuBeli);
  }

  if (jumlah <= 0 || jumlah > maxVal) {
    if (typeof tampilkanToast === 'function') tampilkanToast('Jumlah tidak valid / Koin tidak cukup!', 'error');
    return;
  }

  if (itemAktifModal.mode === 'jual') {
    gameState.inventory.hasil[itemAktifModal.nama] -= jumlah;
    if (gameState.inventory.hasil[itemAktifModal.nama] <= 0) {
      delete gameState.inventory.hasil[itemAktifModal.nama];
    }
    const totalPendapatan = itemAktifModal.hargaSatuan * jumlah;
    gameState.player.koin += totalPendapatan;
    
    tutupModalJual();
    autoSaveGame();
    renderAll();
    if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil menjual ${jumlah}x ${itemAktifModal.nama} seharga Rp ${totalPendapatan.toLocaleString('id-ID')}!`);

  } else if (itemAktifModal.mode === 'beli') {
    const totalHarga = itemAktifModal.hargaSatuan * jumlah;
    if (gameState.player.koin >= totalHarga) {
      gameState.player.koin -= totalHarga;
      
      if (itemAktifModal.kategori === 'bibit') {
        gameState.inventory.bibit[itemAktifModal.nama] = (gameState.inventory.bibit[itemAktifModal.nama] || 0) + jumlah;
      } else if (itemAktifModal.kategori === 'pakan') {
        gameState.inventory.pakan[itemAktifModal.nama] = (gameState.inventory.pakan[itemAktifModal.nama] || 0) + jumlah;
      }

      tutupModalJual();
      autoSaveGame();
      renderAll();
      if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil membeli ${jumlah}x ${itemAktifModal.nama} seharga Rp ${totalHarga.toLocaleString('id-ID')}!`);
    } else {
      if (typeof tampilkanToast === 'function') tampilkanToast('Koin Anda tidak cukup untuk transaksi ini!', 'error');
    }
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
    autoSaveGame();
    renderAll();
    tutupModalNickname();
  }
}
