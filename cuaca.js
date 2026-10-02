// CUACA.JS - Sistem Cuaca & Efek
const DAFTAR_CUACA = {
  cerah: { nama: '☀️ Cerah', efekTumbuh: 1.0, efekPanen: 1.0, pesan: 'Cuaca normal, tanaman tumbuh stabil.' },
  hujan: { nama: '🌧️ Hujan', efekTumbuh: 1.5, efekPanen: 1.2, pesan: 'Tanaman tumbuh lebih cepat karena air hujan!' },
  berawan: { nama: '⛅ Berawan', efekTumbuh: 1.1, efekPanen: 1.0, pesan: 'Cuaca sejuk dan mendukung pertumbuhan.' }
};

const WeatherSystem = {
    cuacaAktif: "☀️ Cerah",
    
    gantiCuaca() {
        const daftarCuaca = ["☀️ Cerah", "🌧️ Hujan", "⛅ Berawan"];
        this.cuacaAktif = daftarCuaca[Math.floor(Math.random() * daftarCuaca.length)];
        
        const infoCuacaEl = document.getElementById("info-cuaca");
        if (infoCuacaEl) {
            infoCuacaEl.innerText = `Cuaca: ${this.cuacaAktif}`;
        }
    }
};
