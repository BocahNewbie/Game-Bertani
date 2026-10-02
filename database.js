// DATABASE.JS - Data Master Game-Bertani

const KATEGORI_AKSESORIS = [
    { id: 'kepala', nama: 'Kepala', icon: '🧢' },
    { id: 'tangan', nama: 'Tangan', icon: '🧤' },
    { id: 'badan', nama: 'Badan', icon: '👕' },
    { id: 'kaki', nama: 'Kaki', icon: '👖' },
    { id: 'telapak', nama: 'Telapak Kaki', icon: '🥾' }
];

const GAME_DATABASE = {
    tanaman: {
        padi: { id: "padi", nama: "Padi", hargaBeli: 100, hargaJual: 250, durasi: 30, xp: 15, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaBeli: 200, hargaJual: 500, durasi: 60, xp: 30, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaBeli: 350, hargaJual: 90000, durasi: 120, xp: 60, icon: "🌶️" }
    },
    pupuk: {
        biasa: { id: "biasa", nama: "Pupuk Urea", hargaBeli: 50, efekPengurangDurasi: 10, cooldownDetik: 600, icon: "🧪", deskripsi: "Kurangi durasi 10 detik (Cooldown 10 menit)" },
        super: { id: "super", nama: "Pupuk Super", hargaBeli: 150, efekPengurangDurasi: 30, cooldownDetik: 1200, icon: "✨", deskripsi: "Kurangi durasi 30 detik (Cooldown 20 menit)" }
    },
    pakan: {
        jagung_pakan: { id: "jagung_pakan", nama: "Pakan Jagung", hargaBeli: 30, icon: "🌽", deskripsi: "Pakan khusus ayam (panen 1-2 telur)" },
        rumput: { id: "rumput", nama: "Rumput Segar", hargaBeli: 50, icon: "🌿", deskripsi: "Pakan khusus sapi & domba" }
    },
    obat: {
        obat_hamil: { id: "obat_hamil", nama: "Obat Kesuburan Ternak", hargaBeli: 2000, icon: "💊", deskripsi: "Merangsang kehamilan sapi (20 hari) dan domba (15 hari) hingga melahirkan anak." }
    },
    ternak: {
        ayam: { id: "ayam", nama: "Ayam", subKandang: "ayam", hargaBeli: 1000, hargaJual: 1800, hasilPanen: "1-2 Telur", durasiProduksi: 40, icon: "🐔" },
        sapi: { id: "sapi", nama: "Sapi", subKandang: "sapi", hargaBeli: 5000, hargaJual: 9500, hasilPanen: "2-7 Susu", durasiProduksi: 90, icon: "🐮" },
        domba: { id: "domba", nama: "Domba", subKandang: "domba", hargaBeli: 3500, hargaJual: 6500, hasilPanen: "1 Wol", durasiProduksi: 70, icon: "🐑" }
    },
    ekspansi: {
        lahan: { id: "lahan", nama: "Perluas Lahan Pertanian", hargaBeli: 1000, maxLimit: 10, icon: "🚜" },
        kandang_ayam: { id: "kandang_ayam", nama: "Perbesar Kandang Ayam", hargaBeli: 2500, maxLimit: 10, icon: "🐔" },
        kandang_sapi: { id: "kandang_sapi", nama: "Perbesar Kandang Sapi", hargaBeli: 7500, maxLimit: 10, icon: "🐮" },
        kandang_domba: { id: "kandang_domba", nama: "Perbesar Kandang Domba", hargaBeli: 5000, maxLimit: 10, icon: "🐑" },
        inkubasi: { id: "inkubasi", nama: "Tambah Slot Mesin Inkubasi", hargaBeli: 1500, maxLimit: 8, icon: "🥚" }
    },
    inkubasi: {
        durasiDetik: 60, // 60 detik inkubasi telur untuk menetas jadi ayam
        kapasitasAwal: 1,
        maxLimit: 8
    },
    accessories: {
        // 1. Kepala
        topi_jerami: { id: "topi_jerami", nama: "Topi Jerami", kategori: "kepala", hargaBeli: 200, bonus: 5, icon: "👒" },
        caping_bambu: { id: "caping_bambu", nama: "Caping Bambu", kategori: "kepala", hargaBeli: 350, bonus: 8, icon: "🎋" },
        helm_kebun: { id: "helm_kebun", nama: "Helm Pelindung Kebun", kategori: "kepala", hargaBeli: 550, bonus: 14, icon: "⛑️" },

        // 2. Tangan
        sarung_kain: { id: "sarung_kain", nama: "Sarung Tangan Kain", kategori: "tangan", hargaBeli: 150, bonus: 3, icon: "🧤" },
        sarung_kulit: { id: "sarung_kulit", nama: "Sarung Tangan Kulit", kategori: "tangan", hargaBeli: 320, bonus: 7, icon: "🥊" },
        gelang_hoki: { id: "gelang_hoki", nama: "Gelang Hoki Petani", kategori: "tangan", hargaBeli: 600, bonus: 15, icon: "📿" },

        // 3. Badan
        kaos_tani: { id: "kaos_tani", nama: "Kaos Petani Sejuk", kategori: "badan", hargaBeli: 300, bonus: 10, icon: "👕" },
        rompi_kerja: { id: "rompi_kerja", nama: "Rompi Mandor", kategori: "badan", hargaBeli: 480, bonus: 15, icon: "🦺" },
        jaket_tahan_air: { id: "jaket_tahan_air", nama: "Jaket Anti-Hujan", kategori: "badan", hargaBeli: 750, bonus: 22, icon: "🧥" },

        // 4. Kaki
        celana_pendek: { id: "celana_pendek", nama: "Celana Pendek Santai", kategori: "kaki", hargaBeli: 220, bonus: 4, icon: "🩳" },
        celana_denim: { id: "celana_denim", nama: "Celana Panjang Denim", kategori: "kaki", hargaBeli: 380, bonus: 9, icon: "👖" },
        celana_lumpur: { id: "celana_lumpur", nama: "Celana Anti-Lumpur", kategori: "kaki", hargaBeli: 620, bonus: 16, icon: "🥋" },

        // 5. Telapak Kaki
        sandal_jepit: { id: "sandal_jepit", nama: "Sandal Jepit Karet", kategori: "telapak", hargaBeli: 120, bonus: 3, icon: "🩴" },
        sepatu_boot: { id: "sepatu_boot", nama: "Sepatu Boot Tani", kategori: "telapak", hargaBeli: 400, bonus: 15, icon: "🥾" },
        sepatu_emas: { id: "sepatu_emas", nama: "Sepatu Emas Juragan", kategori: "telapak", hargaBeli: 1200, bonus: 30, icon: "👞" }
    }
};
