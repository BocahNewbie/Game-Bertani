// HARGA.JS - Sistem Fluktuasi Harga Pasar Global (Beli: -2% s.d +50%, Jual: -70% s.d +21%)

const MarketEconomy = {
    multiplier: 1.0,      // Multiplier harga jual (-70% s.d +21%, yaitu 0.30 s.d 1.21)
    buyMultiplier: 1.0,   // Multiplier harga beli (-2% s.d +50%, yaitu 0.98 s.d 1.50)
    
    acakFluktuasi() {
        // Harga jual berfluktuasi antara penurunan 70% (0.30) hingga kenaikan 21% (1.21)
        const randomSell = Math.random() * (1.21 - 0.30) + 0.30;
        this.multiplier = parseFloat(randomSell.toFixed(2));

        // Harga beli di pasar: penurunan sekitar 2% (0.98) hingga kenaikan sekitar 50% (1.50)
        const randomBuy = Math.random() * (1.50 - 0.98) + 0.98;
        this.buyMultiplier = parseFloat(randomBuy.toFixed(2));
        
        console.log(`[Ekonomi] Fluktuasi diperbarui -> Jual: ${this.multiplier}x (${this.getPersentaseJual()}) | Beli: ${this.buyMultiplier}x (${this.getPersentaseBeli()})`);
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
