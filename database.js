// DATABASE.JS - Data Master Ekonomi Game
const GAME_DATABASE = {
    tanaman: {
        padi: { id: "padi", nama: "Padi", hargaBeli: 100, hargaJual: 250, durasi: 30, xp: 15, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaBeli: 200, hargaJual: 500, durasi: 60, xp: 30, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaBeli: 350, hargaJual: 900, durasi: 120, xp: 60, icon: "🌶️" }
    },
    ternak: {
        ayam: { id: "ayam", nama: "Ayam", hargaBeli: 1000, hargaJual: 1800, hasilPanen: "Telur", durasiProduksi: 40, icon: "🐔" },
        sapi: { id: "sapi", nama: "Sapi", hargaBeli: 5000, hargaJual: 9500, hasilPanen: "Susu", durasiProduksi: 90, icon: "🐮" },
        domba: { id: "domba", nama: "Domba", hargaBeli: 3500, hargaJual: 6500, hasilPanen: "Wol", durasiProduksi: 70, icon: "🐑" }
    },
    pupuk: {
        biasa: { id: "biasa", nama: "Pupuk Urea", hargaBeli: 50, efekPengurangDurasi: 10, icon: "🧪" },
        super: { id: "super", nama: "Pupuk Super", hargaBeli: 150, efekPengurangDurasi: 30, icon: "✨" }
    },
    pakan: {
        jagung_pakan: { id: "jagung_pakan", nama: "Pakan Jagung", hargaBeli: 30, icon: "🌽" },
        rumput: { id: "rumput", nama: "Rumput Segar", hargaBeli: 50, icon: "🌿" }
    }
};
