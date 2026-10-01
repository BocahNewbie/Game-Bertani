// MARKET.JS - Logika Transaksi Pasar

function beliBibit(nama, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.bibit[nama] = (gameState.inventory.bibit[nama] || 0) + 1;
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function beliHewan(jenis, harga) {
  const k = gameState.kandang[jenis];
  if (k.isi.length >= k.kapasitas) {
    alert('Kandang penuh! Perbesar kandang terlebih dahulu.');
    return;
  }
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    k.isi.push({ id: Date.now(), siapPanen: true });
    renderAll();
  } else {
    alert('Koin tidak cukup!');
  }
}

function beliPakan(namaPakan, harga) {
  if (gameState.player.koin >= harga) {
    gameState.player.koin -= harga;
    gameState.inventory.pakan[namaPakan] = (gameState.inventory.pakan[namaPakan] || 0) + 1;
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
  const hargaLahan = 500;
  if (gameState.player.koin >= hargaLahan) {
    gameState.player.koin -= hargaLahan;
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

function jualHasil(nama, hargaJualDasar) {
  if ((gameState.inventory.hasil[nama] || 0) > 0) {
    gameState.inventory.hasil[nama]--;
    
    // Terapkan efek bonus aksesoris ke harga jual jika ada
    const bonusPersen = hitungBonusAksesoris('jual');
    const hargaAkhir = Math.round(hargaJualDasar * (1 + bonusPersen / 100));

    gameState.player.koin += hargaAkhir;
    renderAll();
  }
}
