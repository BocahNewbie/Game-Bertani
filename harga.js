// HARGA.JS - Sistem Fluktuasi Harga Pasar yang Lebih Stabil & Adil
const MarketEconomy = {
    multiplier: 1.0,     // Multiplier harga jual
    buyMultiplier: 1.0,  // Multiplier harga beli

    init() {
        const savedMultiplier = localStorage.getItem('market_multiplier');
        const savedBuyMultiplier = localStorage.getItem('market_buyMultiplier');
        const savedTimestamp = localStorage.getItem('market_timestamp');
        const now = new Date().getTime();

        // Interval diperpanjang jadi 5 menit (300000 ms) agar pemain tidak gabut/spam refresh
        const intervalDuration = 5 * 60 * 1000; 

        if (savedMultiplier !== null && savedBuyMultiplier !== null && savedTimestamp !== null) {
            this.multiplier = parseFloat(savedMultiplier);
            this.buyMultiplier = parseFloat(savedBuyMultiplier);

            // Cek apakah sudah waktunya update harga berdasarkan waktu asli (opsional)
            if (now - parseInt(savedTimestamp) > intervalDuration) {
                this.acakFluktuasi();
            }
        } else {
            this.acakFluktuasi();
        }

        // Jalankan interval otomatis setiap 5 menit di latar belakang
        if (!window.marketIntervalID) {
            window.marketIntervalID = setInterval(() => {
                this.acakFluktuasi();
                if (typeof renderPasar === 'function' && document.getElementById("tab-pasar")) {
                    renderPasar();
                }
                if (typeof renderTokoAccessories === 'function' && document.getElementById("tab-toko-aksesoris")) {
                    renderTokoAccessories();
                }
            }, intervalDuration);
        }
    },

    acakFluktuasi() {
        // Rentang harga jual diperhalus (antara turun 25% hingga naik 15%) agar tidak terlalu jomplang
        const randomSell = Math.random() * (1.15 - 0.75) + 0.75;
        this.multiplier = parseFloat(randomSell.toFixed(2));

        // Rentang harga beli juga dibuat stabil (antara 0.90 hingga 1.20)
        const randomBuy = Math.random() * (1.40 - 0.90) + 0.90;
        this.buyMultiplier = parseFloat(randomBuy.toFixed(2));

        // Simpan ke localStorage beserta timestamp-nya
        localStorage.setItem('market_multiplier', this.multiplier);
        localStorage.setItem('market_buyMultiplier', this.buyMultiplier);
        localStorage.setItem('market_timestamp', new Date().getTime());

        console.log(`[Ekonomi] Pasar Stabil -> Jual: ${this.multiplier}x | Beli: ${this.buyMultiplier}x`);
    },

    getHargaJual(baseHarga) {
        return Math.max(1, Math.floor(baseHarga * (this.multiplier || 1.0)));
    },

    getHargaBeli(baseHarga) {
        return Math.max(1, Math.round(baseHarga * (this.buyMultiplier || 1.0)));
    },

    getPersentaseBeli() {
        const persen = Math.round(((this.buyMultiplier || 1.0) - 1.0) * 100);
        return persen >= 0 ? `+${persen}%` : `${persen}%`;
    },

    getPersentaseJual() {
        const persen = Math.round(((this.multiplier || 1.0) - 1.0) * 100);
        return persen >= 0 ? `+${persen}%` : `${persen}%`;
    }
};

// Jalankan otomatis sistem market saat file dimuat
MarketEconomy.init();
