// MARKET.JS - Logika Pasar & Harga Fluktuatif

// Penyimpanan harga aktif pasar saat ini
let hargaPasarAktif = {
  bibit: {},
  hewan: {},
  hasil: {},
  pakan: 15 // Harga dasar pakan rumput kering
};

// Inisialisasi & Interval Fluktuasi Harga Pasar (Setiap 30 Detik)
function initMarketFluctuation() {
  hitungHargaPasarBaru();
  setInterval(() => {
    hitungHargaPasarBaru();
    renderPasar();
    console.log('🔄 Harga pasar telah diperbarui secara fluktuatif!');
  }, 30000); // 30.000 ms = 30 detik
}

function hitungHargaPasarBaru() {
  // Acak fluktuasi antara -20% sampai +20%
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

function beliBibit(nama, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.bibit[nama] = (gameState.inventory.bibit[nama] || 0) + 1;
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function beliHewan(jenis, harga) {
  const k = gameState.kandang[jenis];
  if (k.isi.length >= 5) { // Batasan maksimal 5 hewan per jenis
    alert('Kandang sudah mencapai batas maksimal 5 ekor!');
    return;
  }
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.isi.push({ id: Date.now(), siapPanen: true });
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function beliPakan(harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.pakan['Rumput Kering'] = (gameState.inventory.pakan['Rumput Kering'] || 0) + 1;
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function beliAksesoris(nama, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.aksesoris.push(nama);
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function beliLahan() {
  const hargaLahan = 500;
  if (gameState.player.koin >= hargaLahan) {
    gameState.player.koin -= hargaLahan;
    gameState.lahan.push({ id: gameState.lahan.length + 1, tanaman: null, umur: 0, siapPanen: false });
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function perbesarKandang(jenis) {
  const k = gameState.kandang[jenis];
  if (k.kapasitas >= 5) {
    alert('Kandang sudah mencapai kapasitas maksimal mutlak (5 Ekor)!');
    return;
  }
  const harga = 300;
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.kapasitas = Math.min(5, k.kapasitas + 1); // Tambah 1 per upgrade hingga batas 5
    renderAll();
  } else { alert('Koin tidak cukup!'); }
}

function jualHasil(nama, hargaJualDasar) {
  if ((gameState.inventory.hasil[nama] || 0) > 0) {
    gameState.inventory.hasil[nama]--;
    const bonusPersen = typeof hitungBonusAksesoris === 'function' ? hitungBonusAksesoris('jual') : 0;
    const hargaAkhir = Math.round(hargaJualDasar * (1 + bonusPersen / 100));
    gameState.player.koin += hargaAkhir;
    renderAll();
  }
}
