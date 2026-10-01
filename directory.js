// DIRECTORY DATABASE GAME

// Direktori Tumbuhan
const DIREKTORI_TUMBUHAN = {
  'Bibit Padi': {
    nama: 'Bibit Padi',
    hargaBeliBase: 50,
    hargaJualBase: 100,
    waktuTumbuh: 10,
    keterangan: 'Tanaman pokok penghasil padi.'
  },
  'Bibit Jagung': {
    nama: 'Bibit Jagung',
    hargaBeliBase: 90,
    hargaJualBase: 180,
    waktuTumbuh: 20,
    keterangan: 'Jagung manis bernilai jual tinggi.'
  }
};

// Direktori Hewan Ternak (Pakan disatukan menjadi Rumput Kering)
const DIREKTORI_HEWAN = {
  ayam: {
    jenis: 'ayam',
    nama: 'Ayam',
    hargaBeliBase: 200,
    hargaJualHewanBase: 100,
    hasilTernak: 'Telur Ayam',
    hargaJualHasilBase: 40,
    pakan: 'Rumput Kering'
  },
  sapi: {
    jenis: 'sapi',
    nama: 'Sapi',
    hargaBeliBase: 1000,
    hargaJualHewanBase: 500,
    hasilTernak: 'Susu Sapi',
    hargaJualHasilBase: 250,
    pakan: 'Rumput Kering'
  },
  domba: {
    jenis: 'domba',
    nama: 'Domba',
    hargaBeliBase: 750,
    hargaJualHewanBase: 350,
    hasilTernak: 'Wol Domba',
    hargaJualHasilBase: 180,
    pakan: 'Rumput Kering'
  }
};

// Direktori Aksesoris Lengkap dengan Efeknya
const DIREKTORI_AKSESORIS = {
  'Topi Caping': { 
    tipe: 'topi', 
    bonusType: 'jual', 
    nilai: 10, 
    harga: 150,
    efek: 'Meningkatkan harga jual hasil panen & ternak sebesar +10%.' 
  },
  'Sepatu Bot': { 
    tipe: 'sepatu', 
    bonusType: 'tumbuh', 
    nilai: 15, 
    harga: 200,
    efek: 'Mempercepat proses tumbuh tanaman sebesar +15%.' 
  }
};
