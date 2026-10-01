// DATABASE.JS - Data Master Tanaman, Ternak, Pupuk, Pakan, & Pasar
const GAME_DATABASE = {
    tanaman: {
        padi: { nama: "Padi", hargaBeli: 100, hargaJual: 250, durasi: 30, xp: 15 },
        jagung: { nama: "Jagung", hargaBeli: 200, hargaJual: 500, durasi: 60, xp: 30 },
        cabai: { nama: "Cabai", hargaBeli: 350, hargaJual: 900, durasi: 120, xp: 60 }
    },
    ternak: {
        ayam: { nama: "Ayam", hargaBeli: 1000, hargaJual: 1800, hasilPanen: "Telur", durasiProduksi: 40 },
        sapi: { nama: "Sapi", hargaBeli: 5000, hargaJual: 9500, hasilPanen: "Susu", durasiProduksi: 90 },
        domba: { nama: "Domba", hargaBeli: 3500, hargaJual: 6500, hasilPanen: "Wol", durasiProduksi: 70 }
    },
    pupuk: {
        biasa: { nama: "Pupuk Urea", hargaBeli: 50, efekPengurangDurasi: 10 },
        super: { nama: "Pupuk Super", hargaBeli: 150, efekPengurangDurasi: 30 }
    },
    pakan: {
        jagung_pakan: { nama: "Pakan Jagung", hargaBeli: 30 },
        rumput: { nama: "Rumput Segar", hargaBeli: 50 }
    }
};
