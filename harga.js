// HARGA.JS - Sistem Fluktuasi Harga Pasar Global
const MarketEconomy = {
    multiplier: 1.0,
    
    acakFluktuasi() {
        // Harga berfluktuasi antara 80% (0.8) hingga 120% (1.2) dari harga dasar
        const randomPercent = Math.random() * (1.2 - 0.8) + 0.8;
        this.multiplier = parseFloat(randomPercent.toFixed(2));
        console.log(`[Ekonomi] Fluktuasi pasar diperbarui! Multiplier: ${this.multiplier}x`);
    },

    getHargaJual(baseHarga) {
        return Math.floor(baseHarga * this.multiplier);
    }
};
