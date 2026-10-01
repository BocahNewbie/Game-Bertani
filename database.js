// DATABASE.JS - Data Master Game-Bertani
const GAME_DATABASE = {
    // 1. KATEGORI PERTANIAN & PUPUK
    tanaman: {
        padi: { id: "padi", nama: "Padi", hargaBeli: 100, hargaJual: 250, durasi: 30, xp: 15, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaBeli: 200, hargaJual: 500, durasi: 60, xp: 30, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaBeli: 350, hargaJual: 900, durasi: 120, xp: 60, icon: "🌶️" }
    },
    pupuk: {
        biasa: { id: "biasa", nama: "Pupuk Urea", hargaBeli: 50, efekPengurangDurasi: 10, icon: "🧪" },
        super: { id: "super", nama: "Pupuk Super", hargaBeli: 150, efekPengurangDurasi: 30, icon: "✨" }
    },
    pakan: {
        jagung_pakan: { id: "jagung_pakan", nama: "Pakan Jagung", hargaBeli: 30, icon: "🌽" },
        rumput: { id: "rumput", nama: "Rumput Segar", hargaBeli: 50, icon: "🌿" }
    },

    // 2. KATEGORI PETERNAKAN (Ayam, Sapi, Domba)
    ternak: {
        ayam: { id: "ayam", nama: "Ayam", subKandang: "ayam", hargaBeli: 1000, hargaJual: 1800, hasilPanen: "Telur", durasiProduksi: 40, icon: "🐔" },
        sapi: { id: "sapi", nama: "Sapi", subKandang: "sapi", hargaBeli: 5000, hargaJual: 9500, hasilPanen: "Susu", durasiProduksi: 90, icon: "🐮" },
        domba: { id: "domba", nama: "Domba", subKandang: "domba", hargaBeli: 3500, hargaJual: 6500, hasilPanen: "Wol", durasiProduksi: 70, icon: "🐑" }
    },

    // 3. KATEGORI PASAR & EKSPANSI (Maksimal 10 Lahan Pertanian, dll)
    ekspansi: {
        lahan: { nama: "Perluas Lahan Pertanian", hargaBeli: 1000, maxLimit: 10 },
        kandang_ayam: { nama: "Perbesar Kandang Ayam", hargaBeli: 2500, maxLimit: 5 },
        kandang_sapi: { nama: "Perbesar Kandang Sapi", hargaBeli: 7500, maxLimit: 3 },
        kandang_domba: { nama: "Perbesar Kandang Domba", hargaBeli: 5000, maxLimit: 3 }
    },

    // 4. KATEGORI AKSESORIS (Kepala, Tangan, Baju, Kaki, Telapak)
    aksesorisMaster: {
        kepala: [
            { id: "topi_jerami", nama: "Topi Jerami", harga: 200, bonus: 5, icon: "👒" }
        ],
        tangan: [
            { id: "sarung_tangan", nama: "Sarung Tangan Kain", harga: 150, bonus: 3, icon: "🧤" }
        ],
        baju: [
            { id: "kaos_tani", nama: "Kaos Petani", harga: 300, bonus: 10, icon: "👕" }
        ],
        kaki: [
            { id: "celana_tani", nama: "Celana Panjang", harga: 250, bonus: 5, icon: "👖" }
        ],
        telapak: [
            { id: "sepatu_boot", nama: "Sepatu Boot", harga: 400, bonus: 15, icon: "🥾" }
        ]
    }
};
