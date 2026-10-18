// database.js - Pusat Data Game
const GAME_DATABASE = {
    bibit: {
        bibit_padi: { id: "bibit_padi", hasilId: "padi", nama: "Bibit Padi", hargaBeli: 9, durasi: 600, icon: "🌾" },
        bibit_jagung: { id: "bibit_jagung", hasilId: "jagung", nama: "Bibit Jagung", hargaBeli: 17, durasi: 1200, icon: "🌽" },
        bibit_cabai: { id: "bibit_cabai", hasilId: "cabai", nama: "Bibit Cabai", hargaBeli: 25, durasi: 1800, icon: "🌶️" },
        bibit_tomat: { id: "bibit_tomat", hasilId: "tomat", nama: "Bibit Tomat", hargaBeli: 26, durasi: 2700, icon: "🍅" },
        bibit_kol: { id: "bibit_kol", hasilId: "kol", nama: "Bibit Kol", hargaBeli: 10, durasi: 3600, icon: "🥬" },
        bibit_kacang: { id: "bibit_kacang", hasilId: "kacang", nama: "Bibit Kacang", hargaBeli: 12, durasi: 43200, icon: "🥜" },
        bibit_bawang_merah: { id: "bibit_bawang_merah", hasilId: "bawang_merah", nama: "Bibit Bawang Merah", hargaBeli: 25, durasi: 43200, icon: "🧅" },
        bibit_wortel: { id: "bibit_wortel", hasilId: "wortel", nama: "Bibit Wortel", hargaBeli: 18, durasi: 86400, icon: "🥕" },
        bibit_apel: { id: "bibit_apel", hasilId: "apel", nama: "Bibit Apel", hargaBeli: 54, durasi: 259200, icon: "🍎" }
    },
    hasilPanen: {
        padi: { id: "padi", nama: "Padi", hargaJual: 13, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaJual: 23, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaJual: 32, icon: "🌶️" },
        tomat: { id: "tomat", nama: "Tomat", hargaJual: 34, icon: "🍅" },
        kol: { id: "kol", nama: "Kol", hargaJual: 25, icon: "🥬" },
        kacang: { id: "kacang", nama: "Kacang", hargaJual: 34, icon: "🥜" },
        bawang_merah: { id: "bawang_merah", nama: "Bawang Merah", hargaJual: 42, icon: "🧅" },
        wortel: { id: "wortel", nama: "Wortel", hargaJual: 45, icon: "🥕" },
        apel: { id: "apel", nama: "Apel", hargaJual: 71, icon: "🍎" }
    },
    material: {
        kayu: { id: "kayu", nama: "Kayu", hargaBeli: 17, icon: "🪵" }
    }
};
