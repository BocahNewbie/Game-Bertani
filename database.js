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
        padi: { id: "padi", nama: "Padi", hargaBeli: 10, hargaJual: 20, durasi: 60, xp: 15, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaBeli: 17, hargaJual: 33, durasi: 120, xp: 30, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaBeli: 25, hargaJual: 59, durasi: 300, xp: 60, icon: "🌶️" },
        tomat: { id: "tomat", nama: "Tomat", hargaBeli: 26, hargaJual: 50, durasi: 270, xp: 20, icon: "🍅" },
        apel: { id: "apel", nama: "Apel", hargaBeli: 60, hargaJual: 150, durasi: 259200, xp: 90, icon: "🍎" },
        bawang_merah: { id: "bawang_merah", nama: "Bawang Merah", hargaBeli: 25, hargaJual: 42, durasi: 43200, xp: 25, icon: "🧅" },
        wortel: { id: "wortel", nama: "Wortel", hargaBeli: 18, hargaJual: 45, durasi: 86400, xp: 18, icon: "🥕" },
        kacang: { id: "kacang", nama: "Kacang", hargaBeli: 12, hargaJual: 34, durasi: 43200, xp: 16, icon: "🥜" },
        kol: { id: "kol", nama: "Kol", hargaBeli: 10, hargaJual: 25, durasi: 30, xp: 1800, icon: "🥬" }
    },
    pupuk: {
        biasa: { id: "biasa", nama: "Pupuk Urea", hargaBeli: 370, efekPengurangDurasi: 10800, cooldownDetik: 1800, icon: "🧪", deskripsi: "Kurangi durasi 3 Jam (Cooldown 30 menit)" },
        super: { id: "super", nama: "Pupuk Super", hargaBeli: 750, efekPengurangDurasi: 21600, cooldownDetik: 3600, icon: "✨", deskripsi: "Kurangi durasi 6 Jam (Cooldown 1 Jam)" }
    },
    pakan: {
        jagung_pakan: { id: "jagung_pakan", nama: "Pakan Jagung", hargaBeli: 500, icon: "🌽", deskripsi: "Pakan khusus ayam" },
        rumput: { id: "rumput", nama: "Rumput Segar", hargaBeli: 850, icon: "🌿", deskripsi: "Pakan khusus sapi & domba" }
    },
    obat: {
        obat_hamil: { id: "obat_hamil", nama: "Obat Kesuburan Ternak", hargaBeli: 500000, icon: "💊", deskripsi: "Merangsang kehamilan sapi (20 hari) dan domba (15 hari) hingga melahirkan anak." }
    },
    ternak: {
        ayam: { id: "ayam", nama: "Ayam", subKandang: "ayam", hargaBeli: 81000, hargaJual: 58000, hasilPanen: "1-2 Telur", durasiProduksi: 1440, icon: "🐔" },
        sapi: { id: "sapi", nama: "Sapi", subKandang: "sapi", hargaBeli: 10000000, hargaJual: 3950000, hasilPanen: "2-7 Susu", durasiProduksi: 1440, icon: "🐮" },
        domba: { id: "domba", nama: "Domba", subKandang: "domba", hargaBeli: 3545000, hargaJual: 650000, hasilPanen: "1 Wol", durasiProduksi: 1440, icon: "🐑" }
    },
    ekspansi: {
        lahan: { id: "lahan", nama: "Lahan Pertanian", hargaBeli: 650000, maxLimit: 10, icon: "🚜" },
        kandang_ayam: { id: "kandang_ayam", nama: "Kandang Ayam", hargaBeli: 250000, maxLimit: 10, icon: "🐔" },
        kandang_sapi: { id: "kandang_sapi", nama: "Kandang Sapi", hargaBeli: 750000, maxLimit: 10, icon: "🐮" },
        kandang_domba: { id: "kandang_domba", nama: "Kandang Domba", hargaBeli: 450000, maxLimit: 10, icon: "🐑" },
        inkubasi: { id: "inkubasi", nama: "Mesin Inkubasi", hargaBeli: 75000, maxLimit: 8, icon: "🥚" }
    },
    accessories: {
        // 1. Kepala
        topi_biasa: { id: "topi_biasa", nama: "Topi Biasa", kategori: "kepala", hargaBeli: 150000, bonusPanen: 0.05, bonusTernak: 1, icon: "🧢" },
        topi_pantai: { id: "topi_pantai", nama: "Topi Pantai", kategori: "kepala", hargaBeli: 250000, bonusPanenAbsolut: 2, bonusTernak: 1, icon: "👒" },
        topi_jerami: { id: "topi_jerami", nama: "Topi Jerami", kategori: "kepala", hargaBeli: 350000, bonusPanen: 0.25, bonusTernak: 2, icon: "🌾" },
        helm: { id: "helm", nama: "Helm", kategori: "kepala", hargaBeli: 400000, bonusPanen: 0, bonusTernak: 0, icon: "🪖" },
        helm_fullface: { id: "helm_fullface", nama: "Helm Fullface", kategori: "kepala", hargaBeli: 600000, bonusPanen: 0.09, syaratCuaca: "berkabut", icon: "🏍️" },
        topi_emas: { id: "topi_emas", nama: "Topi Emas", kategori: "kepala", hargaBeli: 1500000, bonusPanen: 0.40, bonusTernak: 0.52, icon: "👑" },
        penutup_kepala: { id: "penutup_kepala", nama: "Penutup Kepala", kategori: "kepala", hargaBeli: 2000000, syaratBaju: "baju_hazmat", efekKhusus: "tahan_badai_petir", icon: "🛡️" },

        // 2. Tangan
        sarung_balap: { id: "sarung_balap", nama: "Sarung Tangan Balap", kategori: "tangan", hargaBeli: 180000, bonusPanen: 0.01, icon: "🏎️" },
        sarung_kulit: { id: "sarung_kulit", nama: "Sarung Tangan Kulit", kategori: "tangan", hargaBeli: 280000, bonusTernak: 2, icon: "🥊" },
        sarung_biasa: { id: "sarung_biasa", nama: "Sarung Tangan Biasa", kategori: "tangan", hargaBeli: 350000, bonusPanen: 0.05, bonusTernak: 2, icon: "🧤" },
        sarung_plastik: { id: "sarung_plastik", nama: "Sarung Tangan Plastik", kategori: "tangan", hargaBeli: 450000, bonusPanen: 0.08, bonusHargaJualTernak: 0.10, icon: "🛍️" },
        sarung_latex: { id: "sarung_latex", nama: "Sarung Tangan Latex", kategori: "tangan", hargaBeli: 850000, bonusPanen: 0.19, bonusTernak: 0.50, icon: "🧪" },
        sarung_berkebun: { id: "sarung_berkebun", nama: "Sarung Tangan Berkebun", kategori: "tangan", hargaBeli: 1200000, bonusPanen: 0.40, bonusTernak: 0.12, syaratTopi: "topi_jerami", icon: "🌱" },
        sarung_ajaib: { id: "sarung_ajaib", nama: "Sarung Tangan Ajaib", kategori: "tangan", hargaBeli: 2500000, bonusPanen: 0.40, bonusHargaJualSusu: 0.30, icon: "✨" },

        // 3. Badan
        kaos: { id: "kaos", nama: "Kaos", kategori: "badan", hargaBeli: 200000, bonusTernak: 0.05, icon: "👕" },
        kaos_hitam: { id: "kaos_hitam", nama: "Kaos Hitam", kategori: "badan", hargaBeli: 350000, bonusTernak: 1, bonusHargaJualPanen: 0.10, icon: "🖤" },
        kaos_partai: { id: "kaos_partai", nama: "Kaos Partai", kategori: "badan", hargaBeli: 400000, bonusPanen: 0.02, bonusHargaJualPanen: 0.20, icon: "🚩" },
        baju_petani: { id: "baju_petani", nama: "Baju Petani", kategori: "badan", hargaBeli: 600000, bonusPanen: 0.18, bonusHargaJualTernak: 0.05, icon: "🧑‍🌾" },
        hoodie_petani: { id: "hoodie_petani", nama: "Hoodie Petani", kategori: "badan", hargaBeli: 950000, bonusPanenAbsolut: 17, bonusTernak: 0.50, syaratTangan: "sarung_biasa", icon: "🧥" },
        baju_partai: { id: "baju_partai", nama: "Baju Partai", kategori: "badan", hargaBeli: 1300000, bonusPanen: 0.10, bonusHargaJualSemua: 0.23, icon: "⭐" },
        baju_kerajaan: { id: "baju_kerajaan", nama: "Baju Kerajaan", kategori: "badan", hargaBeli: 3000000, bonusPanen: 0.40, bonusHargaJualKol: 0.50, icon: "👑" },

        // 4. Kaki (Celana)
        cangcut: { id: "cangcut", nama: "Cangcut", kategori: "kaki", hargaBeli: 100000, bonusTernak: 0.01, icon: "🩲" },
        kolor: { id: "kolor", nama: "Kolor", kategori: "kaki", hargaBeli: 200000, bonusTernak: 2, bonusHargaJualTernak: 0.06, icon: "🩳" },
        kolor_sepakbola: { id: "kolor_sepakbola", nama: "Kolor Sepakbola", kategori: "kaki", hargaBeli: 320000, bonusPanen: 0.02, bonusHargaJualPanen: 0.05, icon: "⚽" },
        celana_levis: { id: "celana_levis", nama: "Celana Levis", kategori: "kaki", hargaBeli: 450000, bonusPanen: 0.01, bonusHargaJualTernak: 0.10, icon: "👖" },
        celana_jogger: { id: "celana_jogger", nama: "Celana Jogger", kategori: "kaki", hargaBeli: 800000, bonusPanen: 0.15, bonusTernak: 0.79, syaratBadan: "kaos_partai", icon: "👟" },
        celana_pangsi: { id: "celana_pangsi", nama: "Celana Pangsi", kategori: "kaki", hargaBeli: 1400000, bonusPanen: 0.30, bonusHargaJualHewan: 0.46, icon: "🥋" },
        celana_cargo: { id: "celana_cargo", nama: "Celana Cargo", kategori: "kaki", hargaBeli: 2800000, bonusPanen: 0.40, bonusHargaJualCabai: 0.50, icon: "🧳" },

        // 5. Telapak Kaki
        sendal_nyolong: { id: "sendal_nyolong", nama: "Sendal Nyolong", kategori: "telapak", hargaBeli: 120000, bonusPanen: 0.01, bonusTernak: -0.10, icon: "🩴" },
        sendal_plastik: { id: "sendal_plastik", nama: "Sendal Plastik", kategori: "telapak", hargaBeli: 220000, bonusTernak: 1, bonusHargaJualTelur: 0.06, icon: "🛍️" },
        swallow: { id: "swallow", nama: "Swallow", kategori: "telapak", hargaBeli: 350000, bonusPanen: 0.05, bonusHargaJualKacang: 0.05, icon: "🟢" },
        sendal_kulit: { id: "sendal_kulit", nama: "Sendal Kulit", kategori: "telapak", hargaBeli: 500000, bonusPanen: -0.11, bonusHargaJualPanen: 0.15, icon: "🥿" },
        sneakers: { id: "sneakers", nama: "Sneakers", kategori: "telapak", hargaBeli: 900000, bonusHargaJualPanen: 0.35, bonusTernak: -0.79, icon: "👟" },
        boots: { id: "boots", nama: "Boots", kategori: "telapak", hargaBeli: 1500000, bonusPanen: 0.30, bonusHargaJualWool: 0.46, icon: "🥾" },
        sepatu_petani_handal: { id: "sepatu_petani_handal", nama: "Sepatu Petani Handal", kategori: "telapak", hargaBeli: 3000000, bonusPanen: 0.40, bonusHargaJualPanen: 0.80, icon: "👞" }
    }
};
