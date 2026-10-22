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
        padi: { id: "padi", nama: "Padi", hargaJual: 15, icon: "🌾" },
        jagung: { id: "jagung", nama: "Jagung", hargaJual: 28, icon: "🌽" },
        cabai: { id: "cabai", nama: "Cabai", hargaJual: 36, icon: "🌶️" },
        tomat: { id: "tomat", nama: "Tomat", hargaJual: 39, icon: "🍅" },
        kol: { id: "kol", nama: "Kol", hargaJual: 27, icon: "🥬" },
        kacang: { id: "kacang", nama: "Kacang", hargaJual: 43, icon: "🥜" },
        bawang_merah: { id: "bawang_merah", nama: "Bawang Merah", hargaJual: 55, icon: "🧅" },
        wortel: { id: "wortel", nama: "Wortel", hargaJual: 57, icon: "🥕" },
        apel: { id: "apel", nama: "Apel", hargaJual: 81, icon: "🍎" }
    },
    ternak: {
        ayam: { id: "ayam", nama: "Ayam", hargaBeli: 37000, hasilId: "telur_ayam", icon: "🐔" },
        sapi: { id: "sapi", nama: "Sapi", hargaBeli: 157000, hasilId: "susu_sapi", icon: "🐮" },
        kambing: { id: "kambing", nama: "Kambing", hargaBeli: 77000, hasilId: "susu_kambing", icon: "🐐" },
        babi: { id: "babi", nama: "Babi", hargaBeli: 97000, hasilId: "daging_babi", icon: "🐖" }
    },
    pakan: {
        pakan_ayam: { id: "pakan_ayam", targetTernak: "ayam", nama: "Pakan Ayam", hargaBeli: 500, icon: "🌾" },
        pakan_sapi: { id: "pakan_sapi", targetTernak: "sapi", nama: "Pakan Sapi", hargaBeli: 2000, icon: "🌿" },
        pakan_kambing: { id: "pakan_kambing", targetTernak: "kambing", nama: "Pakan Kambing", hargaBeli: 1200, icon: "🍃" },
        pakan_babi: { id: "pakan_babi", targetTernak: "babi", nama: "Pakan Babi", hargaBeli: 1500, icon: "🌽" }
    },
    ternakHasil: {
        telur_ayam: { id: "telur_ayam", nama: "Telur Ayam", hargaJual: 2000, icon: "🥚" },
        susu_sapi: { id: "susu_sapi", nama: "Susu Sapi", hargaJual: 25000, icon: "🥛" },
        susu_kambing: { id: "susu_kambing", nama: "Susu Kambing", hargaJual: 14000, icon: "🍼" },
        daging_babi: { id: "daging_babi", nama: "Daging Babi", hargaJual: 50000, icon: "🥩" }
    },
    jagalHasil: {
        daging_ayam: { id: "daging_ayam", nama: "Daging Ayam", jumlah: 8, hargaJual: 7000, icon: "🍗" },
        daging_sapi: { id: "daging_sapi", nama: "Daging Sapi", jumlah: 18, hargaJual: 15000, icon: "🥩" },
        daging_kambing: { id: "daging_kambing", nama: "Daging Kambing", jumlah: 10, hargaJual: 10000, icon: "🍖" },
        daging_babi_mentah: { id: "daging_babi_olahan", nama: "Daging Babi Olahan", jumlah: 15, hargaJual: 12000, icon: "🥓" }
    },
    alat: {
        pisau: { id: "pisau", nama: "Pisau Potong", hargaBeli: 35000, durabilityMax: 300, biayaAsah: 17000, icon: "🔪" }
    },
    material: {
        kayu: { id: "kayu", nama: "Kayu", hargaBeli: 24, icon: "🪵" }
    },
    ikan: {
        // --- Mudah (62%) ---
        ikan_lele: { id: "ikan_lele", nama: "Ikan Lele", icon: "🐟", hargaJual: 175, tingkatKesan: "Mudah" },
        ikan_nila: { id: "ikan_nila", nama: "Ikan Nila", icon: "🐟", hargaJual: 195, tingkatKesan: "Mudah" },
        ikan_mujaer: { id: "ikan_mujaer", nama: "Ikan Mujaer", icon: "🐟", hargaJual: 180, tingkatKesan: "Mudah" },
        ikan_sepat: { id: "ikan_sepat", nama: "Ikan Sepat", icon: "🐟", hargaJual: 150, tingkatKesan: "Mudah" },
        ikan_cetul: { id: "ikan_cetul", nama: "Ikan Cetul", icon: "🐟", hargaJual: 110, tingkatKesan: "Mudah" },

        // --- Sedang (27%) ---
        ikan_gurame: { id: "ikan_gurame", nama: "Ikan Gurame", icon: "🐠", hargaJual: 480, tingkatKesan: "Sedang" },
        ikan_patin: { id: "ikan_patin", nama: "Ikan Patin", icon: "🐠", hargaJual: 360, tingkatKesan: "Sedang" },
        ikan_bawal: { id: "ikan_bawal", nama: "Ikan Bawal", icon: "🐠", hargaJual: 520, tingkatKesan: "Sedang" },
        ikan_tawes: { id: "ikan_tawes", nama: "Ikan Tawes", icon: "🐠", hargaJual: 320, tingkatKesan: "Sedang" },
        ikan_wader: { id: "ikan_wader", nama: "Ikan Wader Super", icon: "🐠", hargaJual: 280, tingkatKesan: "Sedang" },

        // --- Sulit (10%) ---
        ikan_gabus: { id: "ikan_gabus", nama: "Ikan Gabus", icon: "🦈", hargaJual: 700, tingkatKesan: "Sulit" },
        ikan_sidat: { id: "ikan_sidat", nama: "Ikan Sidat (Unagi)", icon: "🐍", hargaJual: 900, tingkatKesan: "Sulit" },
        ikan_toman: { id: "ikan_toman", nama: "Ikan Toman", icon: "🐊", hargaJual: 1200, tingkatKesan: "Sulit" },
        ikan_belida: { id: "ikan_belida", nama: "Ikan Belida", icon: "🐬", hargaJual: 1800, tingkatKesan: "Sulit" },

        // --- Sangat Sulit (1%) ---
        ikan_mas: { id: "ikan_mas", nama: "Ikan Mas Emas", icon: "🐡", hargaJual: 4500, tingkatKesan: "Sangat Sulit" },
        ikan_arwana: { id: "ikan_arwana", nama: "Ikan Arwana Merah", icon: "🐉", hargaJual: 6500, tingkatKesan: "Sangat Sulit" },
        ikan_pirarucu: { id: "ikan_pirarucu", nama: "Ikan Arapaima", icon: "🐳", hargaJual: 8000, tingkatKesan: "Sangat Sulit" }
    },
    bumbu: {
        garam: { id: "garam", nama: "Garam Dapur", icon: "🧂", hargaBeli: 200 },
        gula: { id: "gula", nama: "Gula Pasir", icon: "🍬", hargaBeli: 300 },
        bawang_merah: { id: "bawang_merah", nama: "Bawang Merah", icon: "🧅", hargaBeli: 500 },
        bawang_putih: { id: "bawang_putih", nama: "Bawang Putih", icon: "🧄", hargaBeli: 500 },
        cabai: { id: "cabai", nama: "Cabai Rawit", icon: "🌶️", hargaBeli: 600 },
        minyak_goreng: { id: "minyak_goreng", nama: "Minyak Goreng", icon: "🍾", hargaBeli: 1200 },
        kecap: { id: "kecap", nama: "Kecap Manis", icon: "🍶", hargaBeli: 800 }
    },
    resep: {
        sup_sayur: {
            id: "sup_sayur",
            nama: "Sup Sayur Segar",
            icon: "🥣",
            durasiMenit: 30,
            bahan: { wortel: 2, kol: 2, garam: 1, bawang_putih: 1 },
            hargaJual: 4500
        },
        ayam_goreng_bumbu: {
            id: "ayam_goreng_bumbu",
            nama: "Ayam Goreng Lengkap",
            icon: "🍗",
            durasiMenit: 60,
            bahan: { daging_ayam: 1, minyak_goreng: 1, garam: 1, bawang_putih: 1 },
            hargaJual: 12000
        },
        sambal_goreng_kambing: {
            id: "sambal_goreng_kambing",
            nama: "Sambal Goreng Kambing",
            icon: "🥘",
            durasiMenit: 90,
            bahan: { daging_kambing: 1, cabai: 2, bawang_merah: 1, kecap: 1, minyak_goreng: 1 },
            hargaJual: 22000
        },
        ikan_bakar_ricarica: {
            id: "ikan_bakar_ricarica",
            nama: "Ikan Bakar Rica-Rica",
            icon: "🐟",
            durasiMenit: 45,
            bahan: { ikan_gurame: 1, cabai: 3, garam: 1, kecap: 1 },
            hargaJual: 18000
        }
    },
    masakan: {
        sup_sayur: { id: "sup_sayur", nama: "Sup Sayur Segar", icon: "🥣", hargaJual: 4500 },
        ayam_goreng_bumbu: { id: "ayam_goreng_bumbu", nama: "Ayam Goreng Lengkap", icon: "🍗", hargaJual: 12000 },
        sambal_goreng_kambing: { id: "sambal_goreng_kambing", nama: "Sambal Goreng Kambing", icon: "🥘", hargaJual: 22000 },
        ikan_bakar_ricarica: { id: "ikan_bakar_ricarica", nama: "Ikan Bakar Rica-Rica", icon: "🐟", hargaJual: 18000 }
    }
};
