// STATE UTAMA GAME
const STORAGE_KEY = 'PETERNAKAN';

let gameState = {
  player: {
    nickname: 'Petani Handal',
    koin: 1000
  },
  aksesorisAktif: {
    topi: null,
    baju: null,
    sepatu: null
  },
  lahan: [
    { id: 1, tanaman: 'Padi', umur: 100, siapPanen: true },
    { id: 2, tanaman: null, umur: 0, siapPanen: false }
  ],
  kandang: {
    ayam: { kapasitas: 3, isi: [{ id: 1, umur: 100, siapPanen: true }] },
    sapi: { kapasitas: 1, isi: [] },
    domba: { kapasitas: 1, isi: [] }
  },
  inventory: {
    bibit: { 'Bibit Padi': 2, 'Bibit Jagung': 1 },
    pupuk: { 'Pupuk Organik': 3 },
    hasil: { 'Padi': 5 },
    aksesoris: ['Topi Caping']
  }
};

// INISIALISASI GAME
document.addEventListener('DOMContentLoaded', () => {
  muatGame();
  renderAll();
});

// FUNGSIONALITAS RESET GAME DENGAN HAPUS LOCALSTORAGE BERSIH
function eksekusiResetGame() {
  // 1. Hapus key data dari localStorage secara spesifik
  localStorage.removeItem(STORAGE_KEY);
  
  // 2. Opsi alternatif jika ingin membersihkan seluruh storage
  // localStorage.clear();

  // 3. Muat ulang halaman untuk mengembalikan state memori ke default
  location.reload();
}

function bukaModalReset() {
  document.getElementById('modal-reset').style.display = 'flex';
}

function tutupModalReset() {
  document.getElementById('modal-reset').style.display = 'none';
}

// BUKA TABS UTAMA & SUB TABS
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-tabs .tab-btn').forEach(el => el.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  event.currentTarget.classList.add('active');
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
    try {
      gameState = JSON.parse(savedData);
    } catch (e) {
      console.error('Gagal memuat save data, menggunakan data default');
    }
  }
}

// RENDER TAMPILAN GAMBAR/UI
function renderAll() {
  // Render Player Info
  document.getElementById('player-nickname').innerText = `👨‍🌾 ${gameState.player.nickname} ✏️`;
  document.getElementById('player-koin').innerText = `Rp ${gameState.player.koin.toLocaleString('id-ID')}`;

  renderPertanian();
  renderPeternakan();
  renderAksesoris();
  renderPasar();
  renderInventory();
}

// 1. RENDER TAB PERTANIAM
function renderPertanian() {
  const container = document.getElementById('lahan-container');
  container.innerHTML = '';

  gameState.lahan.forEach((l, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>Lahan ${index + 1}</h4>
      <p>${l.tanaman ? `${l.tanaman}${l.siapPanen ? '(Siap Panen!)' : '(Tumbuh)'}` : 'Kosong'}</p>
      <button class="btn-primary" onclick="aksiLahan(${index})">
        ${l.tanaman ? (l.siapPanen ? '🌾 Panen' : '⏳ Siram') : '🌱 Tanam'}
      </button>
    `;
    container.appendChild(card);
  });

  // Render Pupuk
  const pupukContainer = document.getElementById('pupuk-container');
  pupukContainer.innerHTML = `
    <div class="card">
      <h4>🧪 Racik Pupuk Organik</h4>
      <p>Bahan: 2 Hasil Panen | Stok Saat Ini: ${gameState.inventory.pupuk['Pupuk Organik'] || 0}</p>
      <button class="btn-primary" onclick="racikPupuk()">Racik Pupuk</button>
    </div>
  `;
}

function aksiLahan(index) {
  const lahan = gameState.lahan[index];
  if (!lahan.tanaman) {
    if ((gameState.inventory.bibit['Bibit Padi'] || 0) > 0) {
      gameState.inventory.bibit['Bibit Padi']--;
      lahan.tanaman = 'Padi';
      lahan.siapPanen = true; // disederhanakan
      renderAll();
    } else {
      alert('Kamu tidak punya Bibit Padi! Beli dulu di Pasar.');
    }
  } else if (lahan.siapPanen) {
    gameState.inventory.hasil[lahan.tanaman] = (gameState.inventory.hasil[lahan.tanaman] || 0) + 1;
    lahan.tanaman = null;
    lahan.siapPanen = false;
    renderAll();
  }
}

function racikPupuk() {
  gameState.inventory.pupuk['Pupuk Organik'] = (gameState.inventory.pupuk['Pupuk Organik'] || 0) + 1;
  renderAll();
}

// 2. RENDER TAB PETERNAKAN
function renderPeternakan() {
  const jenis = ['ayam', 'sapi', 'domba'];
  jenis.forEach(j => {
    const dataKandang = gameState.kandang[j];
    document.getElementById(`info-kandang-${j}`).innerText = 
      `Kapasitas Kandang: ${dataKandang.isi.length} / ${dataKandang.kapasitas} Ekor`;

    const container = document.getElementById(`kandang-${j}-container`);
    container.innerHTML = '';

    dataKandang.isi.forEach((h, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h4>${j.toUpperCase()} #${index + 1}</h4>
        <p>${h.siapPanen ? 'Siap Diambil Hasilnya!' : 'Sedang Bertumbuh'}</p>
        <button class="btn-primary" onclick="panenTernak('${j}', ${index})">🧺 Ambil Hasil</button>
      `;
      container.appendChild(card);
    });
  });
}

function panenTernak(jenis, index) {
  const itemMap = { ayam: 'Telur Ayam', sapi: 'Susu Sapi', domba: 'Wol Domba' };
  const hasil = itemMap[jenis];
  gameState.inventory.hasil[hasil] = (gameState.inventory.hasil[hasil] || 0) + 1;
  renderAll();
}

// 3. RENDER TAB AKSESORIS
function renderAksesoris() {
  document.getElementById('slot-topi').innerText = gameState.aksesorisAktif.topi || 'Kosong';
  document.getElementById('slot-baju').innerText = gameState.aksesorisAktif.baju || 'Kosong';
  document.getElementById('slot-sepatu').innerText = gameState.aksesorisAktif.sepatu || 'Kosong';

  const container = document.getElementById('koleksi-aksesoris-container');
  container.innerHTML = '';
  gameState.inventory.aksesoris.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${item}</h4>
      <button class="btn-primary" onclick="pakaiAksesoris('${item}')">Pakai</button>
    `;
    container.appendChild(card);
  });
}

function pakaiAksesoris(nama) {
  if (nama.includes('Topi')) gameState.aksesorisAktif.topi = nama;
  renderAll();
}

// 4. RENDER TAB PASAR
function renderPasar() {
  // Pasar Bibit
  document.getElementById('pasar-bibit-container').innerHTML = `
    <div class="card">
      <h4>🌱 Bibit Padi</h4>
      <p>Harga: Rp 50</p>
      <button class="btn-primary" onclick="beliItem('bibit', 'Bibit Padi', 50)">Beli</button>
    </div>
  `;

  // Pasar Hewan
  document.getElementById('pasar-hewan-container').innerHTML = `
    <div class="card">
      <h4>🐔 Anak Ayam</h4>
      <p>Harga: Rp 200</p>
      <button class="btn-primary" onclick="beliHewan('ayam', 200)">Beli Ayam</button>
    </div>
  `;

  // Pasar Aksesoris
  document.getElementById('pasar-aksesoris-container').innerHTML = `
    <div class="card">
      <h4>🎩 Topi Caping</h4>
      <p>Harga: Rp 150</p>
      <button class="btn-primary" onclick="beliAksesoris('Topi Caping', 150)">Beli</button>
    </div>
  `;

  // Pasar Ekspansi Lahan & Kandang
  document.getElementById('pasar-ekspansi-container').innerHTML = `
    <div class="card">
      <h4>➕ Beli Lahan Tani Baru</h4>
      <p>Harga: Rp 500</p>
      <button class="btn-primary" onclick="beliLahan()">Tambah Lahan</button>
    </div>
    <div class="card">
      <h4>🏗️ Perbesar Kandang Ayam (+2 Slot)</h4>
      <p>Harga: Rp 300</p>
      <button class="btn-primary" onclick="perbesarKandang('ayam', 300)">Perbesar Ayam</button>
    </div>
  `;
}

function beliItem(kategori, nama, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory[kategori][nama] = (gameState.inventory[kategori][nama] || 0) + 1;
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function beliHewan(jenis, harga) {
  const k = gameState.kandang[jenis];
  if (k.isi.length >= k.kapasitas) {
    alert('Kandang penuh! Perbesar kandang terlebih dahulu di tab Pasar Ekspansi.');
    return;
  }
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.isi.push({ id: Date.now(), umur: 100, siapPanen: true });
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function beliAksesoris(nama, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.aksesoris.push(nama);
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function beliLahan() {
  if (gameState.player.koin >= 500) {
    gameState.player.koin -= 500;
    gameState.lahan.push({ id: gameState.lahan.length + 1, tanaman: null, umur: 0, siapPanen: false });
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function perbesarKandang(jenis, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.kandang[jenis].kapasitas += 2;
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

// 5. RENDER TAB INVENTORY
function renderInventory() {
  const containerHasil = document.getElementById('inv-hasil-container');
  containerHasil.innerHTML = '';
  Object.entries(gameState.inventory.hasil).forEach(([nama, jumlah]) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${nama}</h4>
      <p>Jumlah: ${jumlah}</p>
      <button class="btn-primary" onclick="jualHasil('${nama}')">Jual (Rp 100)</button>
    `;
    containerHasil.appendChild(card);
  });

  const containerBibit = document.getElementById('inv-bibit-container');
  containerBibit.innerHTML = '';
  Object.entries(gameState.inventory.bibit).forEach(([nama, jumlah]) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h4>${nama}</h4>
      <p>Jumlah: ${jumlah}</p>
    `;
    containerBibit.appendChild(card);
  });
}

function jualHasil(nama) {
  if (gameState.inventory.hasil[nama] > 0) {
    gameState.inventory.hasil[nama]--;
    gameState.player.koin += 100;
    renderAll();
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
