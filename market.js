// MARKET.JS - Logika Pasar, Harga Fluktuatif, Ekspansi, & Toast Modern

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
  const getFaktorAcak = () => (Math.random() * 0.4) + 0.8;
  Object.keys(DIREKTORI_TUMBUHAN).forEach(key => {
    const item = DIREKTORI_TUMBUHAN[key];
    hargaPasarAktif.bibit[key] = {
      beli: Math.round(item.hargaBeliBase * getFaktorAcak()),
      jual: Math.round(item.hargaJualBase * getFaktorAcak())
    };
  });
  Object.keys(DIREKTORI_HEWAN).forEach(key => {
    const item = DIREKTORI_HEWAN[key];
    hargaPasarAktif.hewan[key] = {
      beli: Math.round(item.hargaBeliBase * getFaktorAcak()),
      jualHewan: Math.round(item.hargaJualHewanBase * getFaktorAcak()),
      jualHasil: Math.round(item.hargaJualHasilBase * getFaktorAcak())
    };
  });
  hargaPasarAktif.pakan = Math.round(15 * getFaktorAcak());
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

// Beli Item/Bibit (Maksimal 99)
function beliItemMassal(kategori, nama, hargaSatuan) {
  let jumlahStr = prompt(`Beli ${nama} (Harga @Rp ${hargaSatuan}):\nMasukkan jumlah (Maksimal 99):`, "1");
  if (jumlahStr === null) return;
  
  let jumlah = parseInt(jumlahStr);
  if (isNaN(jumlah) || jumlah <= 0) {
    tampilkanToast('Masukkan jumlah yang valid!', 'error');
    return;
  }
  if (jumlah > 99) {
    tampilkanToast('Batas pembelian maksimal adalah 99 item sekaligus!', 'error');
    jumlah = 99;
  }

  let totalHarga = hargaSatuan * jumlah;
  if (gameState.player.koin >= totalHarga) {
    gameState.player.koin -= totalHarga;
    gameState.inventory[kategori][nama] = (gameState.inventory[kategori][nama] || 0) + jumlah;
    renderAll();
    tampilkanToast(`Berhasil membeli ${jumlah}x ${nama} seharga Rp ${totalHarga.toLocaleString('id-ID')}!`);
  } else {
    tampilkanToast('Koin Anda tidak cukup untuk transaksi ini!', 'error');
  }
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
    renderAll();
    tampilkanToast(`Berhasil membeli 1 ekor ${jenis} seharga Rp ${harga.toLocaleString('id-ID')}!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

// Beli Pakan Massal (Maksimal 99)
function beliPakanMassal(hargaSatuan) {
  let jumlahStr = prompt(`Beli Pakan Rumput Kering (Harga @Rp ${hargaSatuan}):\nMasukkan jumlah (Maksimal 99):`, "1");
  if (jumlahStr === null) return;

  let jumlah = parseInt(jumlahStr);
  if (isNaN(jumlah) || jumlah <= 0) {
    tampilkanToast('Masukkan jumlah yang valid!', 'error');
    return;
  }
  if (jumlah > 99) {
    tampilkanToast('Batas pembelian maksimal adalah 99 item sekaligus!', 'error');
    jumlah = 99;
  }

  let totalHarga = hargaSatuan * jumlah;
  if (gameState.player.koin >= totalHarga) {
    gameState.player.koin -= totalHarga;
    gameState.inventory.pakan['Rumput Kering'] = (gameState.inventory.pakan['Rumput Kering'] || 0) + jumlah;
    renderAll();
    tampilkanToast(`Berhasil membeli ${jumlah}x Rumput Kering!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

// Beli Aksesoris (Maksimal 1 buah)
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
    renderAll();
    tampilkanToast(`Berhasil membeli aksesoris ${nama}!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

function beliLahan() {
  const hargaLahan = 500;
  if (gameState.player.koin >= hargaLahan) {
    gameState.player.koin -= hargaLahan;
    gameState.lahan.push({ id: gameState.lahan.length + 1, tanaman: null, umur: 0, siapPanen: false });
    renderAll();
    tampilkanToast('Berhasil membuka lahan tani baru!');
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}

// Fungsi Upgrade Kandang Berdasarkan Level (Max Lv 10, Kapasitas Max 15)
function hitungHargaUpgradeKandang(levelSaatIni) {
  // Level 1 ke Level 2 mulai dari 50.000, naik 350% (dikalikan 3.5 dari harga sebelumnya)
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
    
    // Pemetaan kapasitas tiap level dari Lv 1 (2 ekor) hingga Lv 10 (15 ekor)
    const kapasitasTabel = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10, 6: 11, 7: 12, 8: 13, 9: 14, 10: 15 };
    k.kapasitas = kapasitasTabel[k.level] || 15;

    renderAll();
    tampilkanToast(`Berhasil mengupgrade Kandang ${jenis} ke Level ${k.level} (Kapasitas: ${k.kapasitas} Ekor)!`);
  } else {
    tampilkanToast(`Koin tidak cukup! Biaya upgrade Rp ${hargaUpgrade.toLocaleString('id-ID')}`, 'error');
  }
}
