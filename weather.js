// WEATHER.JS - Sistem Cuaca & Efek Sampingnya

const DAFTAR_CUACA = {
  cerah: { nama: '☀️ Cerah', efekTumbuh: 1.0, efekPanen: 1.0, pesan: 'Cuaca normal, tanaman tumbuh stabil.' },
  hujan: { nama: '🌧️ Hujan', efekTumbuh: 1.5, efekPanen: 1.2, pesan: 'Tanaman tumbuh lebih cepat karena air hujan!' },
  kemarau: { nama: '🔥 Kemarau', efekTumbuh: 0.7, efekPanen: 0.9, pesan: 'Tanaman agak lambat tumbuh akibat kekeringan.' }
};

// State cuaca saat ini dalam game
let cuacaAktif = 'cerah';

function ubahCuacaAcak() {
  const keys = Object.keys(DAFTAR_CUACA);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  cuacaAktif = randomKey;
  
  // Tampilkan notifikasi perubahan cuaca jika diperlukan
  console.log(`Cuaca Berubah: ${DAFTAR_CUACA[cuacaAktif].nama} - ${DAFTAR_CUACA[cuacaAktif].pesan}`);
}

function getEfekCuaca() {
  return DAFTAR_CUACA[cuacaAktif];
}
