// DIRECTORY DATABASE GAME

// 1. Direktori Tumbuhan
const DIREKTORI_TUMBUHAN = {
  'Bibit Padi': {
    nama: 'Bibit Padi',
    hargaBeliBase: 35,
    hargaJualBase: 40,
    waktuTumbuh: 100,
    keterangan: 'Tanaman pokok penghasil padi.'
  },
  'Bibit Jagung': {
    nama: 'Bibit Jagung',
    hargaBeliBase: 90,
    hargaJualBase: 140,
    waktuTumbuh: 200,
    keterangan: 'Jagung manis bernilai jual tinggi.'
  }
};

// 2. Direktori Hewan Ternak
const DIREKTORI_HEWAN = {
  ayam: {
    jenis: 'ayam',
    nama: 'Ayam',
    hargaBeliBase: 950,
    hargaJualHewanBase: 350,
    hasilTernak: 'Telur Ayam',
    jumlahHasil: 2,
    hargaJualHasilBase: 21,
    pakan: 'Rumput Kering'
  },
  sapi: {
    jenis: 'sapi',
    nama: 'Sapi',
    hargaBeliBase: 6700,
    hargaJualHewanBase: 3500,
    hasilTernak: 'Susu Sapi',
    jumlahHasil: 6,
    hargaJualHasilBase: 130,
    pakan: 'Rumput Kering'
  },
  domba: {
    jenis: 'domba',
    nama: 'Domba',
    hargaBeliBase: 3750,
    hargaJualHewanBase: 1350,
    hasilTernak: 'Wol Domba',
    jumlahHasil: 1,
    hargaJualHasilBase: 150,
    pakan: 'Rumput Kering'
  }
};

// 3. Direktori Pupuk (Kompos & Urea)
const DIREKTORI_PUPUK = {
  'Pupuk Kompos': {
    nama: 'Pupuk Kompos',
    harga: 4500,
    efekMinJam: 2,
    efekMaxJam: 8,
    keterangan: 'Mempercepat waktu tumbuh tanaman 2 - 8 jam (random).'
  },
  'Pupuk Urea': {
    nama: 'Pupuk Urea',
    harga: 17500,
    efekMinJam: 12,
    efekMaxJam: 24,
    keterangan: 'Mempercepat waktu tumbuh tanaman 12 - 24 jam (random).'
  }
};

// 4. Direktori Aksesoris
const DIREKTORI_AKSESORIS = {
  'Topi Caping': { 
    tipe: 'topi', 
    bonusType: 'jual', 
    nilai: 15, 
    harga: 150000,
    efek: 'Meningkatkan harga jual hasil panen & ternak sebesar +10%.' 
  },
  'Sepatu Bot': { 
    tipe: 'sepatu', 
    bonusType: 'tumbuh', 
    nilai: 10, 
    harga: 200000,
    efek: 'Meningkatkan hasil panen sebesar +10%.' 
  }
};
