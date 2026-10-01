// DIRECTORY DATABASE GAME

// 1. Direktori Tumbuhan
const DIREKTORI_TUMBUHAN = {
  'Bibit Padi': {
    nama: 'Bibit Padi',
    hargaBeli: 50,
    hargaJual: 100,
    waktuTumbuh: 10, // dalam detik (atau satuan waktu game)
    keterangan: 'Tanaman pokok penghasil padi.'
  },
  'Bibit Jagung': {
    nama: 'Bibit Jagung',
    hargaBeli: 90,
    hargaJual: 180,
    waktuTumbuh: 20,
    keterangan: 'Jagung manis bernilai jual tinggi.'
  }
};

// 2. Direktori Hewan Ternak
const DIREKTORI_HEWAN = {
  ayam: {
    jenis: 'ayam',
    nama: 'Ayam',
    hargaBeli: 200,
    hargaJualHewan: 100,
    hasilTernak: 'Telur Ayam',
    hargaJualHasil: 40,
    pakan: 'Biji-bijian',
    hargaPakan: 10
  },
  sapi: {
    jenis: 'sapi',
    nama: 'Sapi',
    hargaBeli: 1000,
    hargaJualHewan: 500,
    hasilTernak: 'Susu Sapi',
    hargaJualHasil: 250,
    pakan: 'Rumput Segar',
    hargaPakan: 50
  },
  domba: {
    jenis: 'domba',
    nama: 'Domba',
    hargaBeli: 750,
    hargaJualHewan: 350,
    hasilTernak: 'Wol Domba',
    hargaJualHasil: 180,
    pakan: 'Rumput Kering',
    hargaPakan: 40
  }
};
