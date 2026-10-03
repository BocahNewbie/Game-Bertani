// MARKET.JS - Sistem Fluktuasi Pasar Real-Time (Persisten & Otomatis)

const MarketEconomy = {
    init() {
        // Cek apakah data fluktuasi sudah ada di localStorage, jika belum buat baru
        if (localStorage.getItem('market_persen') === null) {
            this.setPersentaseBaru(this.generateRandomPersen());
        }

        // Jalankan interval real-time setiap 15 detik di latar belakang
        if (!window.marketIntervalID) {
            window.marketIntervalID = setInterval(() => {
                this.updateFluktuasiOtomatis();
            }, 15000);
        }
    },

    generateRandomPersen() {
        // Fluktuasi acak antara -25% sampai +35%
        return Math.floor(Math.random() * 61) - 25;
    },

    setPersentaseBaru(nilaiBaru) {
        localStorage.setItem('market_persen', nilaiBaru);
        localStorage.setItem('market_waktu', Date.now());
    },

    getPersentaseBeli() {
        const val = localStorage.getItem('market_persen');
        return val !== null ? parseInt(val) : 0;
    },

    getPersentaseJual() {
        const val = localStorage.getItem('market_persen');
        return val !== null ? Math.round(parseInt(val) * 0.8) : 0;
    },

    updateFluktuasiOtomatis() {
        const persenBaru = this.generateRandomPersen();
        this.setPersentaseBaru(persenBaru);

        // Update tampilan secara otomatis jika tab toko atau pasar sedang dibuka
        if (typeof renderTokoAccessories === 'function' && document.getElementById("tab-toko-aksesoris")) {
            renderTokoAccessories();
        }
        if (typeof renderPasar === 'function' && document.getElementById("tab-pasar")) {
            renderPasar();
        }
    },

    getHargaBeli(hargaAsli) {
        const fluktuasi = this.getPersentaseBeli();
        let hargaFinal = Math.round(hargaAsli * (1 + fluktuasi / 100));
        return hargaFinal > 0 ? hargaFinal : 1;
    },

    getHargaJual(hargaAsli) {
        const fluktuasi = this.getPersentaseJual();
        let hargaFinal = Math.round(hargaAsli * (1 + fluktuasi / 100));
        return hargaFinal > 0 ? hargaFinal : 1;
    }
};

// Jalankan otomatis sistem market saat file dimuat
MarketEconomy.init();
