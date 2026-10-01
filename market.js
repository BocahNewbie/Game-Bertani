// MARKET.JS - Logika Pasar, Harga Fluktuatif, Pembelian, & Toast Modern

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
  if (k.isi.length >= 5) {
    tampilkanToast('Kandang sudah mencapai batas maksimal 5 ekor!', 'error');
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

// Beli Aksesoris (Maksimal 1 buah, jika sudah punya tombol ter-blok)
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

function perbesarKandang(jenis) {
  const k = gameState.kandang[jenis];
  if (k.kapasitas >= 5) {
    tampilkanToast('Kandang sudah mencapai kapasitas maksimal mutlak (5 Ekor)!', 'error');
    return;
  }
  const harga = 300;
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.kapasitas = Math.min(5, k.kapasitas + 1);
    renderAll();
    tampilkanToast(`Kandang ${jenis} berhasil diperbesar!`);
  } else {
    tampilkanToast('Koin tidak cukup!', 'error');
  }
}
