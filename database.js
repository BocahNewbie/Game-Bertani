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
    ikan_lele: { nama: "Ikan Lele", icon: "🐟", hargaJual: 175, tingkatKesan: "Mudah" },
    ikan_gurame: { nama: "Ikan Gurame", icon: "🐠", hargaJual: 520, tingkatKesan: "Sedang" },
    ikan_mas: { nama: "Ikan Mas Emas", icon: "🐡", hargaJual: 900, tingkatKesan: "Sangat Sulit" }
};
