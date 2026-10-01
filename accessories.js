// ACCESSORIES.JS - Logika Efek & Pemakaian Aksesoris

function pakaiAksesoris(namaItem) {
  const info = DIREKTORI_AKSESORIS[namaItem];
  if (!info) {
    if (typeof tampilkanToast === 'function') tampilkanToast('Data aksesoris tidak ditemukan!', 'error');
    return;
  }

  // Memasukkan item ke slot yang sesuai (topi / baju / sepatu)
  if (info.tipe === 'topi') gameState.aksesorisAktif.topi = namaItem;
  if (info.tipe === 'baju') gameState.aksesorisAktif.baju = namaItem;
  if (info.tipe === 'sepatu') gameState.aksesorisAktif.sepatu = namaItem;

  if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil memakai ${namaItem}!`);
  renderAll();
}

function lepasAksesoris(tipeSlot) {
  if (gameState.aksesorisAktif[tipeSlot]) {
    if (typeof tampilkanToast === 'function') tampilkanToast(`Berhasil melepas aksesoris!`);
    gameState.aksesorisAktif[tipeSlot] = null;
    renderAll();
  }
}

function hitungBonusAksesoris(tipeBonus) {
  let totalBonus = 0;
  
  // Hitung persentase bonus dari semua aksesoris yang sedang dipakai
  Object.values(gameState.aksesorisAktif).forEach(itemAktif => {
    if (itemAktif && DIREKTORI_AKSESORIS[itemAktif]) {
      const item = DIREKTORI_AKSESORIS[itemAktif];
      if (item.bonusType === tipeBonus) {
        totalBonus += item.nilai;
      }
    }
  });
  
  return totalBonus;
}
