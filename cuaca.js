// WEATHER.JS - Sistem Cuaca & Efek Sampingnya

const DAFTAR_CUACA = {
  cerah: { nama: '☀️ Cerah', efekTumbuh: 1.0, efekPanen: 1.0, pesan: 'Cuaca normal, tanaman tumbuh stabil.' },
  hujan: { nama: '🌧️ Hujan', efekTumbuh: 1.5, efekPanen: 1.2, pesan: 'Tanaman tumbuh lebih cepat karena air hujan!' },
  kemarau: { nama: '🔥 Kemarau', efekTumbuh: 0.7, efekPanen: 0.9, pesan: 'Tanaman agak lambat tumbuh akibat kekeringan.' }
};

// CUACA.JS - Sistem Cuaca
const WeatherSystem = {
    cuacaAktif: "Cerah",
    
    gantiCuaca() {
        const daftarCuaca = ["Cerah", "Hujan", "Berawan"];
        this.cuacaAktif = daftarCuaca[Math.floor(Math.random() * daftarCuaca.length)];
        
        const infoCuacaEl = document.getElementById("info-cuaca");
        if (infoCuacaEl) {
            infoCuacaEl.innerText = `Cuaca Saat Ini: ${this.cuacaAktif}`;
        }
    }
};
