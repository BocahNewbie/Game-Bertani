// MARKET.JS - Logika Pasar, Harga Fluktuatif, Pupuk, & Ekspansi

let hargaPasarAktif = {
  bibit: {},
  hewan: {},
  hasil: {},
  pakan: 15
};

function initMarketFluctuation() {
  hitungHargaPasarBaru();
  setInterval(() => {
    hitungHargaPasarBaru();
    renderPasar();
  }, 30000);
}

function hitungHargaPasarBaru() {
  const faktorFluktuasi = 0.90 + Math.random() * (1.35 - 0.90);

  Object.keys(DIREKTORI_TUMBUHAN).forEach(key => {
    const item = DIREKTORI_TUMBUHAN[key];
    hargaPasarAktif.bibit[key] = {
      beli: Math.round(item.hargaBeliBase * faktorFluktuasi),
      jual: Math.round(item.hargaJualBase * faktorFluktuasi)
    };
  });

  Object.keys(DIREKTORI_HEWAN).forEach(key => {
    const item = DIREKTORI_HEWAN[key];
    hargaPasarAktif.hewan[key] = {
      beli: Math.round(item.hargaBeliBase * faktorFluktuasi),
      jualHewan: Math.round(item.hargaJualHewanBase * faktorFluktuasi),
      jualHasil: Math.round(item.hargaJualHasilBase * faktorFluktuasi)
    };
  });

  hargaPasarAktif.pakan = Math.round(15 * faktorFluktuasi);
}

// Sistem Toast Modern
function tampilkanToast(pesan, tipe = 'sukses') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${tipe === 'error' ? 'error' : ''}`;
  toast.innerHTML = `<span>${tipe === 'error' ? '⚠️' : '✅'}</span> <span>${pesan}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

function beliHewan(jenis, harga) {
  const k = gameState.kandang[jenis];
  if (k.isi.length >= k.kapasitas) {
    tampilkanToast(`Kandang ${jenis} sudah penuh (Maksimal ${k.kapasitas} Ekor)!`, 'error');
    return;
  }
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.isi.push({ id: Date.now(), siapPanen: true });
    autoSaveGame();
    renderAll();
    tampilkanToast(`Berhasil membeli 1 ekor ${jenis} seharga Rp ${harga.toLocaleString('id-ID')}!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

function beliAksesoris(nama, harga) {
  const sudahPunyaInventory = gameState.inventory.aksesoris.includes(nama);
  const sedangDipakai = Object.values(gameState.aksesorisAktif).includes(nama);
  
  if (sudahPunyaInventory || sedangDipakai) {
    tampilkanToast(`Anda sudah memiliki ${nama}!`, 'error');
    return;
  }

  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.aksesoris.push(nama);
    autoSaveGame();
    renderAll();
    tampilkanToast(`Berhasil membeli aksesoris ${nama}!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

// --- LOGIKA UPGRADE KANDANG ---
function hitungHargaUpgradeKandang(levelSaatIni) {
  let harga = 50000;
  for (let i = 1; i < levelSaatIni; i++) {
    harga = Math.round(harga * 3.5);
  }
  return harga;
}

function upgradeKandang(jenis) {
  const k = gameState.kandang[jenis];
  if (k.level >= 10) {
    tampilkanToast(`Kandang ${jenis} sudah mencapai Level Maksimal (Level 10)!`, 'error');
    return;
  }
  const hargaUpgrade = hitungHargaUpgradeKandang(k.level);
  if (gameState.player.koin >= hargaUpgrade) {
    gameState.player.koin -= hargaUpgrade;
    k.level += 1;
    const kapasitasTabel = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 11, 7: 12, 8: 13, 9: 14, 10: 15 };
    k.kapasitas = kapasitasTabel[k.level] || 15;
    autoSaveGame();
    renderAll();
    tampilkanToast(`Berhasil mengupgrade Kandang ${jenis} ke Level ${k.level}!`);
  } else {
    tampilkanToast(`Koin tidak cukup! Biaya Rp ${hargaUpgrade.toLocaleString('id-ID')}`, 'error');
  }
}

// --- LOGIKA UPGRADE LAHAN ---
function hitungHargaUpgradeLahan(jumlahLahanSaatIni) {
  let harga = 150000;
  for (let i = 1; i < jumlahLahanSaatIni; i++) {
    harga = Math.round(harga * 7.9);
  }
  return harga;
}

function beliLahan() {
  const jumlahLahan = gameState.lahan.length;
  if (jumlahLahan >= 10) {
    tampilkanToast('Lahan sudah mencapai batas maksimal (10 Lahan)!', 'error');
    return;
  }
  const hargaLahan = hitungHargaUpgradeLahan(jumlahLahan);
  if (gameState.player.koin >= hargaLahan) {
    gameState.player.koin -= hargaLahan;
    gameState.lahan.push({ id: jumlahLahan + 1, tanaman: null, jumlah: 0, waktuTanam: null, durasiDetik: 0, siapPanen: false });
    autoSaveGame();
    renderAll();
    tampilkanToast(`Berhasil membuka Lahan ke-${jumlahLahan + 1}!`);
  } else {
    tampilkanToast(`Koin tidak cukup! Biaya upgrade Rp ${hargaLahan.toLocaleString('id-ID')}`, 'error');
  }
}
