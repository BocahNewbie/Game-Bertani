// HARGA.JS - Sistem Fluktuasi Harga Pasar Global
const MarketEconomy = {
    multiplier: 1.0,
    
    acakFluktuasi() {
        // Harga bisa naik/turun antara 80% hingga 120% dari harga normal
        const randomPercent = Math.random() * (1.2 - 0.8) + 0.8;
        this.multiplier = parseFloat(randomPercent.toFixed(2));
        console.log(`Fluktuasi pasar diperbarui! Multiplier: ${this.multiplier}x`);
    },

    getHargaJual(baseHarga) {
        return Math.floor(baseHarga * this.multiplier);
    }
};
