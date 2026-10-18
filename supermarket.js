// supermarket.js - Sistem Fluktuasi & Ekonomi Pasar
const MarketEconomy = {
    init() {
        if (localStorage.getItem('market_persen') === null) {
            this.setPersentaseBaru(this.generateRandomPersen());
        }
        if (!window.marketIntervalID) {
            window.marketIntervalID = setInterval(() => {
                this.updateFluktuasiOtomatis();
            }, 30000); // Update fluktuasi setiap 30 detik
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
        // Refresh UI jika fungsi render tersedia
        if (typeof renderSupermarket === 'function') renderSupermarket();
        if (typeof renderPasar === 'function') renderPasar();
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

MarketEconomy.init();
