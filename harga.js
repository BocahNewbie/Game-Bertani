// HARGA.JS - Sistem Fluktuasi Harga Pasar Real-Time (Persisten & Otomatis)

const MarketEconomy = {
    multiplier: 1.0,     // Multiplier harga jual
    buyMultiplier: 1.0,  // Multiplier harga beli

    init() {
        // Cek apakah data fluktuasi sudah tersimpan di localStorage
        const savedMultiplier = localStorage.getItem('market_multiplier');
        const savedBuyMultiplier = localStorage.getItem('market_buyMultiplier');

        if (savedMultiplier !== null && savedBuyMultiplier !== null) {
            this.multiplier = parseFloat(savedMultiplier);
            this.buyMultiplier = parseFloat(savedBuyMultiplier);
        } else {
            // Jika belum ada, buat fluktuasi baru pertama kali
            this.acakFluktuasi();
        }

        // Jalankan interval otomatis setiap 15 detik di latar belakang
        if (!window.marketIntervalID) {
            window.marketIntervalID = setInterval(() => {
                this.acakFluktuasi();
                // Update tampilan jika fungsi render tersedia di halaman aktif
                if (typeof renderPasar === 'function' && document.getElementById("tab-pasar")) {
                    renderPasar();
                }
                if (typeof renderTokoAccessories === 'function' && document.getElementById("tab-toko-aksesoris")) {
                    renderTokoAccessories();
                }
            }, 15000);
        }
    },

    acakFluktuasi() {
        // Harga jual berfluktuasi antara penurunan 70% (0.40) hingga kenaikan 17% (1.17)
        const randomSell = Math.random() * (1.17 - 0.40) + 0.30;
        this.multiplier = parseFloat(randomSell.toFixed(2));

        // Harga beli di pasar: penurunan sekitar 2% (0.98) hingga kenaikan sekitar 50% (1.50)
        const randomBuy = Math.random() * (1.50 - 0.98) + 0.98;
        this.buyMultiplier = parseFloat(randomBuy.toFixed(2));

        // Simpan ke localStorage agar tidak reset saat halaman di-refresh
        localStorage.setItem('market_multiplier', this.multiplier);
        localStorage.setItem('market_buyMultiplier', this.buyMultiplier);

        console.log(`[Ekonomi] Fluktuasi diperbarui -> Jual: ${this.multiplier} x (${this.getPersentaseJual()}) | Beli: ${this.buyMultiplier} x (${this.getPersentaseBeli()})`);
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
