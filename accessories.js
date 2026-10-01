// ACCESSORIES.JS - Logika Slot & Efek Aksesoris

// Daftar database efek aksesoris
const DIREKTORI_AKSESORIS = {
  'Topi Caping': { tipe: 'topi', bonusType: 'jual', nilai: 10 }, // +10% harga jual hasil
  'Sepatu Bot': { tipe: 'sepatu', bonusType: 'tumbuh', nilai: 15 } // +15% kecepatan tumbuh
};

// ACCESSORIES.JS - Logika Efek Aksesoris

function pakaiAksesoris(namaItem) {
  const info = DIREKTORI_AKSESORIS[namaItem];
  if (!info) return;

  if (info.tipe === 'topi') gameState.aksesorisAktif.topi = namaItem;
  if (info.tipe === 'baju') gameState.aksesorisAktif.baju = namaItem;
  if (info.tipe === 'sepatu') gameState.aksesorisAktif.sepatu = namaItem;

  renderAll();
}

function hitungBonusAksesoris(tipeBonus) {
  let totalBonus = 0;
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
