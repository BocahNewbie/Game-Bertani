// CUACA.JS - Sistem Cuaca, Efek, & Penjadwalan Dinamis (24 Jam / Rotasi 3 Jam)

const DAFTAR_CUACA = {
    cerah: { 
        nama: '☀️ Cerah', 
        efekTumbuh: 1.0, 
        efekPanen: 1.0, 
        efekTernak: 1.0, 
        pesan: 'Cuaca normal, tidak ada efek khusus.' 
    },
    gerimis: { 
        nama: '🌦️ Gerimis', 
        efekTumbuh: 1.02, 
        efekPanen: 1.02, // +2% hasil panen
        efekTernak: 1.0, 
        pesan: 'Gerimis ringan, hasil panen sedikit meningkat (+2%).' 
    },
    berawan: { 
        nama: '⛅ Berawan', 
        efekTumbuh: 1.0, 
        efekPanen: 3.0,  // +3 (atau 300% / penambahan nilai dasar sesuai preferensi)
        efekTernak: 2.0,  // +2 hasil ternak
        pesan: 'Cuaca berawan sejuk, mendukung bonus hasil panen dan ternak.' 
    },
    hujan: { 
        nama: '🌧️ Hujan', 
        efekTumbuh: 2.4, 
        efekPanen: 2.4,  // +140% hasil panen (total multiplier 2.4x)
        efekTernak: 1.0, 
        pesan: 'Hujan menyiram tanah, hasil panen meroket (+140%)!' 
    },
    berkabut: { 
        nama: '🌫️ Berkabut', 
        efekTumbuh: 0.95, 
        efekPanen: 0.95, // -5% hasil panen
        efekTernak: 11.0, // +10 hasil ternak (total 11x atau penambahan absolut)
        pesan: 'Kabut tebal menyelimuti desa, hasil panen turun -5%, hasil ternak naik +10.' 
    },
    'hujan-deras': { 
        nama: '🌧️💦 Hujan Deras', 
        efekTumbuh: 0.90, 
        efekPanen: 0.90, // -10% hasil panen
        efekTernak: 1.50, // +50% hasil ternak
        pesan: 'Hujan deras turun, hasil panen sedikit terganggu (-10%), hasil ternak naik +50%.' 
    },
    'hujan-badai': { 
        nama: '⛈️ Hujan Badai', 
        efekTumbuh: 0.60, 
        efekPanen: 0.60, // -40% hasil panen
        efekTernak: 0.50, // -50% hasil ternak
        pesan: 'Badai melanda! Hasil panen turun -40% dan hasil ternak turun -50%.' 
    },
    'badai-petir': { 
        nama: '⚡🌪️ Badai Petir Ekstrem', 
        efekTumbuh: 0.10, 
        efekPanen: 0.10, // -90% hasil panen
        efekTernak: 1.90, // +90% hasil ternak
        pasarTutup: true,  // Pasar & Toko Aksesoris Tutup
        diskonJual: 0.20,  // Harga jual turun jadi 80% (sisa 20%) untuk tanaman, hewan, & hasil ternak
        pesan: 'BAHAYA! Badai petir ekstrem! Pasar & Toko Aksesoris tutup, harga jual anjlok 80%!' 
    }
};

const WeatherSystem = {
    cuacaAktif: "☀️ Cerah",
    jamAktif: 0, // 0 - 24 Jam
    jadwalHariIni: [], // Menyimpan urutan cuaca per 3 jam (total 8 slot dalam 24 jam)

    // ==========================================
    // FITUR DEVELOPER: SETTING JADWAL HARIAN (24 JAM)
    // ==========================================
    /*
        Cara pakai untuk Developer:
        Masukkan array berisi daftar cuaca yang diinginkan untuk 1 hari penuh (maksimal 8 slot karena dibagi per 3 jam).
        Contoh: 
        WeatherSystem.setJadwalDeveloper(['cerah', 'gerimis', 'berawan', 'hujan', 'berkabut', 'hujan-deras', 'hujan-badai', 'badai-petir']);
    */
    setJadwalDeveloper(['cerah', 'gerimis', 'berawan', 'hujan']) {
        if (!Array.isArray(arrayJenisCuaca) || arrayJenisCuaca.length === 0) {
            console.warn("Format jadwal salah!");
            return;
        }

        // 24 jam dibagi rata dengan jumlah slot cuaca yang diinput developer
        const jumlahSlot = arrayJenisCuaca.length;
        const durasiPerSlotJam = 24 / jumlahSlot; // Durasi jam per slot
        const durasiPerSlotMenit = durasiPerSlotJam * 60; // Dikonversi ke total menit

        this.jadwalHariIni = arrayJenisCuaca.map((keyCuaca, index) => {
            const dataCuaca = DAFTAR_CUACA[keyCuaca] || DAFTAR_CUACA['cerah'];
            return {
                slotKe: index + 1,
                kode: keyCuaca,
                nama: dataCuaca.nama,
                durasiJam: durasiPerSlotJam,
                durasiMenit: durasiPerSlotMenit,
                efek: dataCuaca
            };
        });

        console.log(`✅ Jadwal cuaca 24 jam berhasil diset! Setiap slot berdurasi ${durasiPerSlotMenit} menit.`);
        // Jalankan cuaca pertama dari jadwal
        this.terapkanCuacaSlot(0);
    },

    terapkanCuacaSlot(indexSlot) {
        if (this.jadwalHariIni.length === 0) return;
        const slot = this.jadwalHariIni[indexSlot % this.jadwalHariIni.length];
        this.cuacaAktif = slot.nama;
        
        const infoCuacaEl = document.getElementById("info-cuaca");
        if (infoCuacaEl) {
            infoCuacaEl.innerText = `Cuaca: ${this.cuacaAktif} (${slot.durasiMenit} Menit)`;
        }
        
        // Tampilkan pesan efek cuaca jika ada sistem toast/notifikasi game
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`📢 Perubahan Cuaca: ${slot.nama}`);
        }
    },

    // Fungsi bawaan rotasi otomatis (Per 3 Jam / Sesuai slot yang berjalan)
    gantiCuaca() {
        if (this.jadwalHariIni.length > 0) {
            // Jika jadwal developer aktif, rotasikan berdasarkan urutan slot harian
            this.jamAktif = (this.jamAktif + 3) % 24;
            const indexSlotAktif = Math.floor(this.jamAktif / (24 / this.jadwalHariIni.length));
            this.terapkanCuacaSlot(indexSlotAktif);
            return;
        }

        // Fallback default random jika developer belum setting jadwal harian
        const daftarKey = Object.keys(DAFTAR_CUACA);
        const randomKey = daftarKey[Math.floor(Math.random() * daftarKey.length)];
        const dataCuaca = DAFTAR_CUACA[randomKey];
        
        this.cuacaAktif = dataCuaca.nama;
        const infoCuacaEl = document.getElementById("info-cuaca");
        if (infoCuacaEl) {
            infoCuacaEl.innerText = `Cuaca: ${this.cuacaAktif}`;
        }
    },

    // Getter untuk mengecek apakah pasar tutup akibat Badai Petir
    isPasarTutup() {
        const activeObj = Object.values(DAFTAR_CUACA).find(c => c.nama === this.cuacaAktif);
        return activeObj ? (activeObj.pasarTutup || false) : false;
    },

    // Getter untuk mendapatkan pengali harga jual saat cuaca buruk/badai petir
    getDiskonJual() {
        const activeObj = Object.values(DAFTAR_CUACA).find(c => c.nama === this.cuacaAktif);
        return activeObj && activeObj.diskonJual ? activeObj.diskonJual : 1.0;
    }
};
