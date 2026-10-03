// MARKET.JS - Sistem Fluktuasi Pasar Real-Time (Per 15 Detik & Tersimpan)

const MarketEconomy = {
    // Inisialisasi atau ambil data fluktuasi dari localStorage agar tidak reset saat refresh
    init() {
        if (!localStorage.getItem('market_persen')) {
            this.setPersentaseBaru(this.generateRandomPersen());
        }
        
        // Jalankan interval perubahan harga otomatis setiap 15 detik (15000 ms)
        if (!window.marketIntervalID) {
            window.marketIntervalID = setInterval(() => {
                this.updateFluktuasiOtomatis();
            }, 15000);
        }
    },

    generateRandomPersen() {
        // Menghasilkan angka fluktuasi acak antara -25% sampai +35%
        return Math.floor(Math.random() * 61) - 25;
    },

    setPersentaseBaru(nilaiBaru) {
        localStorage.setItem('market_persen', nilaiBaru);
        localStorage.setItem('market_waktu', Date.now());
    },

    getPersentaseBeli() {
        // Mengambil persentase fluktuasi untuk harga beli barang
        const val = localStorage.getItem('market_persen');
        return val !== null ? parseInt(val) : 0;
    },

    getPersentaseJual() {
        // Fluktuasi harga jual biasanya berbanding terbalik atau disesuaikan dengan pasar
        const val = localStorage.getItem('market_persen');
        return val !== null ? Math.round(parseInt(val) * 0.8) : 0;
    },

    updateFluktuasiOtomatis() {
        // Ubah persentase fluktuasi secara berkala setiap 15 detik
        const persenBaru = this.generateRandomPersen();
        this.setPersentaseBaru(persenBaru);

        // Jika fungsi render toko sedang aktif di layar, update tampilannya secara otomatis
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

// Jalankan otomatis sistem market saat file ini dimuat
MarketEconomy.init();
