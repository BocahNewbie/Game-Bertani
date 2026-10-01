// ==========================================
// DATA LOKAL TANAMAN & HEWAN TERNAK DINAMIS
// ==========================================
let libraryTanaman = [
    { nama: 'Semangka', namaBibit: 'Bibit Semangka', iconBibit: '🌱', iconBuah: '🍉', BasehargaBeli: 60, BasehargaJual: 68, waktuTumbuh: 300000 },
    { nama: 'Melon', namaBibit: 'Bibit Melon', iconBibit: '🌱', iconBuah: '🍈', BasehargaBeli: 40, BasehargaJual: 52, waktuTumbuh: 150000 },
    { nama: 'Jagung', namaBibit: 'Bibit Jagung', iconBibit: '🌱', iconBuah: '🌽', BasehargaBeli: 90, BasehargaJual: 111, waktuTumbuh: 450000 },
    { nama: 'Apel', namaBibit: 'Bibit Apel', iconBibit: '🌱', iconBuah: '🍎', BasehargaBeli: 130, BasehargaJual: 180, waktuTumbuh: 900000 }
];

// 🐾 DATA MASTER PETERNAKAN BARU
const libraryHewan = [
    { jenis: 'Ayam', icon: '🐓', BasehargaBeli: 145000, BasehargaJual: 90000 },
    { jenis: 'Domba', icon: '🐑', BasehargaBeli: 1900000, BasehargaJual: 1200000, hargaObatHamil: 1000000, waktuHamilMs: 259200000 }, // 3 Hari = 259.200.000 ms
    { jenis: 'Sapi', icon: '🐄', BasehargaBeli: 10000000, BasehargaJual: 7250000, hargaObatHamil: 4500000, waktuHamilMs: 864000000 } // 10 Hari = 864.000.000 ms
];

let listPupuk = [
    { id: 'pupuk_organik', nama: 'Pupuk Organik', icon: '🍃', hargaBeli: 185, efekWaktu: 75000 },
    { id: 'biofertilizer', nama: 'Biofertilizer', icon: '🧪', hargaBeli: 350, efekWaktu: 175000 },
    { id: 'pupuk_urea', nama: 'Pupuk Urea', icon: '💎', hargaBeli: 580, efekWaktu: 400000 }
];

let stokPupuk = { pupuk_organik: 0, biofertilizer: 0, pupuk_urea: 0 };
let listHewanTernak = []; // 🐾 Array global untuk menyimpan data hewan hidup

let listAksesori = [
    { id: 'sendal', nama: 'Sendal Jepit', icon: '🩴', slot: 'telapak', harga: 15000, bonusPersen: 3, deskripsi: 'Menambah +3% hasil panen dasar.' },
    { id: 'boots', nama: 'Sepatu Boots', icon: '🥾', slot: 'telapak', harga: 45000, bonusPersen: 2, tangkalAngin: 35, deskripsi: 'Menambah +2% bonus dasar & menghilangkan 35% efek pengurangan hasil dari cuaca Angin Kencang.' },
    { id: 'caping', nama: 'Caping Petani', icon: '👒', slot: 'kepala', harga: 50000, bonusPersen: 8, deskripsi: 'Menambah +8% hasil panen dasar.' },
    { id: 'helmet', nama: 'Helm Full Face', icon: '🪖', slot: 'kepala', harga: 250000, bonusPersen: 0, bonusBadaiPetir: 150, deskripsi: 'Memberikan tambahan bonus besar +150% hasil panen khusus saat terjadi cuaca Badai Petir Berat.' },
    { id: 'boxer', nama: 'Celana Boxer', icon: '🩳', slot: 'kaki', harga: 150000, bonusPersen: 12, deskripsi: 'Menambah +12% hasil panen dasar.' },
    { id: 'joger', nama: 'Celana Joger', icon: '👖', slot: 'kaki', harga: 300000, bonusPersen: 5, sinergiJas: 100, deskripsi: 'Menambah +5% bonus dasar. Memberikan tambahan +100% hasil panen jika dipadukan dengan Jas Anti Badai.' },
    { id: 'baju', nama: 'Baju Partai', icon: '👕', slot: 'badan', harga: 1200000, bonusPersen: 19, deskripsi: 'Menambah +19% hasil panen dasar.' },
    { id: 'jas', nama: 'Jas Anti Badai', icon: '🧥', slot: 'badan', harga: 500000, bonusPersen: 4, tangkalBadai: 50, deskripsi: 'Menambah +4% bonus dasar & menghilangkan 50% efek pengurangan dari cuaca Storm / Badai.' }
];
function updateFluktuasiHarga() {
    // Fluktuasi harga tanaman asli kamu
    libraryTanaman.forEach(tanaman => {
        let baseBeli = Number(tanaman.BasehargaBeli) || 0;
        let baseJual = Number(tanaman.BasehargaJual) || 0;
        let variasiBeli = (Math.random() * 0.16) - 0.06;
        hargaBeliAktif[tanaman.namaBibit] = Math.round(baseBeli * (1 + variasiBeli));
        let variasiJual = (Math.random() * 1.03) - 0.35;
        hargaJualAktif[tanaman.nama] = Math.round(baseJual * (1 + variasiJual));
    });

    // 🐾 Fluktuasi harga Hewan Ternak Baru (Beli & Jual dinamis mengikuti logika pasar tanaman)
    libraryHewan.forEach(hewan => {
        let variasiBeli = (Math.random() * 0.16) - 0.06;
        let variasiJual = (Math.random() * 1.03) - 0.35;
        hargaBeliAktif[hewan.jenis] = Math.round(hewan.BasehargaBeli * (1 + variasiBeli));
        hargaJualAktif[hewan.jenis] = Math.round(hewan.BasehargaJual * (1 + variasiJual));
    });

    renderPasar();
    if(typeof renderPeternakan === "function") renderPeternakan();
}

// ⏰ UPDATE LOGIKA FORMAT WAKTU SESUAI PERMINTAAN KAMU
function formatWaktuDinamis(sisaMs) {
    let totalDetik = Math.floor(sisaMs / 1000);
    let totalMenit = Math.floor(totalDetik / 60);
    let totalJam = Math.floor(totalDetik / 3600);

    // 1. Di atas atau sama dengan 24 jam -> Hari & Jam
    if (totalJam >= 24) {
        let hari = Math.floor(totalJam / 24);
        let sisaJam = totalJam % 24;
        return `${hari} Hari ${sisaJam} Jam`;
    } 
    // 2. Antara 1 Jam sampai 23 Jam -> Tampilkan jam saja
    else if (totalJam >= 1) {
        return `${totalJam} Jam`;
    } 
    // 3. Di bawah 1 Jam -> Tampilkan Menit:Detik (Format digital rapi)
    else {
        let sisaMenit = totalMenit % 60;
        let sisaDetik = totalDetik % 60;
        return `${String(sisaMenit).padStart(2, '0')}:${String(sisaDetik).padStart(2, '0')}`;
    }
}
// ==========================================
// LOGIKA UTAMA TAB PETERNAKAN BARU
// ==========================================

// 1. Fungsi Membeli Hewan Baru dari Pasar
function beliHewanTernak(jenis) {
    let dataMaster = libraryHewan.find(h => h.jenis === jenis);
    let hargaSekarang = hargaBeliAktif[jenis] || dataMaster.BasehargaBeli;

    // Hitung jumlah hewan jenis ini saat ini
    let totalSama Jenis = listHewanTernak.filter(h => h.jenis === jenis).length;
    if (totalSamaJenis >= 10) {
        showToast(`Gagal! Maksimal hanya bisa memelihara 10 ${jenis}.`, 'error');
        return;
    }

    if (uang < hargaSekarang) {
        showToast('Uang tidak cukup untuk membeli hewan ini!', 'error');
        return;
    }

    uang -= hargaSekarang;
    
    // Inisialisasi data hewan baru sesuai ketentuan
    let hewanBaru = {
        id: 'hewan_' + new Date().getTime() + Math.floor(Math.random() * 1000),
        jenis: jenis,
        icon: dataMaster.icon,
        darah: 80, // Darah awal 80 poin
        statusHamil: false,
        waktuLahirHamil: 0,
        terakhirDiberiPakan: new Date().getTime(), // Siklus kelaparan 24 jam dimulai
        waktuTelurBerikutnya: jenis === 'Ayam' ? new Date().getTime() + 86400000 : 0 // Ayam siap bertelur 24 jam kedepan
    };

    listHewanTernak.push(hewanBaru);
    updateUangDisplay();
    simpanGame();
    renderPeternakan();
    showToast(`Berhasil membeli seekor ${jenis}!`, 'success');
}

// 2. Fungsi Memberi Pakan Harian (Maksimal 1 kali sehari, menambah 5 darah)
function kasihPakanHewan(id) {
    let hewan = listHewanTernak.find(h => h.id === id);
    if (!hewan) return;

    let sekarang = new Date().getTime();
    
    // Validasi apakah sudah lewat 24 jam sejak makan terakhir
    hewan.darah = Math.min(100, hewan.darah + 5);
    hewan.terakhirDiberiPakan = sekarang;
    
    // Jika itu ayam, atur ulang siklus bertelur 24 jam dari sekarang setelah diberi pakan
    if(hewan.jenis === 'Ayam') {
        hewan.waktuTelurBerikutnya = sekarang + 86400000;
    }

    simpanGame();
    renderPeternakan();
    showToast(`${hewan.icon} ${hewan.jenis} berhasil diberi pakan! (+5 Darah)`, 'success');
}

// 3. Fungsi Membuat Hewan Hamil dengan Obat (Khusus Sapi & Domba)
function beriObatHamil(id) {
    let hewan = listHewanTernak.find(h => h.id === id);
    if (!hewan || hewan.jenis === 'Ayam') return;

    let dataMaster = libraryHewan.find(h => h.jenis === hewan.jenis);
    
    // Validasi limit 10 ekor sebelum memproses kehamilan
    let totalSamaJenis = listHewanTernak.filter(h => h.jenis === hewan.jenis).length;
    if (totalSamaJenis >= 10) {
        showToast(`Gagal! Kandang penuh, tidak bisa menghamilkan ${hewan.jenis} lagi.`, 'error');
        return;
    }

    if (hewan.statusHamil) {
        showToast('Hewan ini sudah dalam keadaan hamil!', 'error');
        return;
    }

    if (uang < dataMaster.hargaObatHamil) {
        showToast(`Uang kurang! Butuh Rp ${dataMaster.hargaObatHamil.toLocaleString('id-ID')} untuk obat.`, 'error');
        return;
    }

    uang -= dataMaster.hargaObatHamil;
    hewan.statusHamil = true;
    hewan.waktuLahirHamil = new Date().getTime() + dataMaster.waktuHamilMs;

    updateUangDisplay();
    simpanGame();
    renderPeternakan();
    showToast(`${hewan.icon} ${hewan.jenis} sekarang hamil!`, 'success');
}

// 4. Siklus Background Checker: Mengecek kelaparan, kematian, melahirkan, & bertelur
function updateSiklusPeternakanOtomatis() {
    let sekarang = new Date().getTime();
    let adaPerubahan = false;

    for (let i = listHewanTernak.length - 1; i >= 0; i--) {
        let hewan = listHewanTernak[i];
        
        // A. Cek Status Kelaparan (Setiap 24 Jam terlambat dikasih makan)
        let selisihWaktu = sekarang - hewan.terakhirDiberiPakan;
        if (selisihWaktu >= 86400000) {
            let kelipatanHariLupa = Math.floor(selisihWaktu / 86400000);
            hewan.darah -= (15 * kelipatanHariLupa); // Lupa kasih pakan berkurang 15 poin
            hewan.terakhirDiberiPakan = sekarang; // Reset jangkar waktu deteksi berikutnya
            adaPerubahan = true;
            
            showToast(`⚠️ ${hewan.icon} ${hewan.jenis} kelaparan karena telat diberi pakan!`, 'error');

            // Jika darah habis <= 0, dinyatakan meninggal dunia
            if (hewan.darah <= 0) {
                listHewanTernak.splice(i, 1);
                showToast(`💀 Sepasang ${hewan.jenis} telah mati karena kelaparan ekstrem!`, 'error');
                continue;
            }
        }

        // B. Cek Status Melahirkan (Bagi Sapi & Domba yang sedang Hamil)
        if (hewan.statusHamil && sekarang >= hewan.waktuLahirHamil) {
            let totalSamaJenis = listHewanTernak.filter(h => h.jenis === hewan.jenis).length;
            
            if (totalSamaJenis < 10) {
                let dataMaster = libraryHewan.find(h => h.jenis === hewan.jenis);
                let bayiHewan = {
                    id: 'hewan_' + new Date().getTime() + Math.floor(Math.random() * 1000),
                    jenis: hewan.jenis,
                    icon: hewan.icon,
                    darah: 30, // Anak baru lahir mendapatkan 30 poin darah dasar
                    statusHamil: false,
                    waktuLahirHamil: 0,
                    terakhirDiberiPakan: sekarang,
                    waktuTelurBerikutnya: 0
                };
                listHewanTernak.push(bayiHewan);
                showToast(`🎉 Selamat! ${hewan.icon} ${hewan.jenis} kamu telah melahirkan bayi baru!`, 'success');
            } else {
                showToast(`⚠️ Kandang penuh (10 ekor), proses kelahiran ${hewan.jenis} digagalkan otomatis.`, 'error');
            }
            hewan.statusHamil = false;
            hewan.waktuLahirHamil = 0;
            adaPerubahan = true;
        }

        // C. Cek Panen Telur Harian Otomatis khusus Ayam
        if (hewan.jenis === 'Ayam' && sekarang >= hewan.waktuTelurBerikutnya) {
            // Menambahkan item telur langsung ke inventory panen pemain
            let existing = inventory.find(item => item.nama === 'Telur Ayam');
            if (existing) existing.jumlah += 1;
            else inventory.push({ nama: 'Telur Ayam', jumlah: 1 });
            
            hewan.waktuTelurBerikutnya = sekarang + 86400000; // Reset siklus 24 jam berikutnya
            adaPerubahan = true;
            showToast(`🥚 Ayam kamu berhasil memproduksi sebutir Telur!`, 'success');
        }
    }

    if (adaPerubahan) {
        simpanGame();
        renderPeternakan();
        if(typeof renderInventory === "function") renderInventory();
    }
}

// Fungsi Render Tampilan UI Alternatif untuk halaman Peternakan
function renderPeternakan() {
    // Fungsi ini akan otomatis memperbarui DOM panel UI peternakan kamu jika dipanggil dari navigasi permainan.
    console.log("Status Peternakan Diperbarui:", listHewanTernak);
}
function simpanGame() {
    let dataGame = {
        playerName: playerName,
        uang: uang,
        inventory: inventory,
        stokPupuk: stokPupuk,
        aksesoriDimiliki: aksesoriDimiliki,
        slotAktif: slotAktif,
        cuacaAktif: cuacaAktif,
        indeksCuacaAktif: indeksCuacaAktif,
        lahan: lahan.map(l => ({
            id: l.id,
            status: l.status,
            tanaman: l.tanaman,
            jumlahBibit: l.jumlahBibit || 1,
            waktuSelesai: l.waktuSelesai
        })),
        lahanTambahanDibeli: lahanTambahanDibeli,
        hargaTambahLahan: hargaTambahLahan,
        
        // 🐾 SIMPAN DATA TERNAK BARU KE LOCALSTORAGE
        listHewanTernak: listHewanTernak
    };
    localStorage.setItem('saveGameBertani', JSON.stringify(dataGame));
}

function muatGame() {
    let savedData = localStorage.getItem('saveGameBertani');
    if (savedData) {
        try {
            let data = JSON.parse(savedData);
            playerName = data.playerName || "Petani Pintar";
            uang = data.uang !== undefined ? data.uang : 3500;
            inventory = data.inventory || [];
            if (data.stokPupuk) stokPupuk = data.stokPupuk;
            aksesoriDimiliki = data.aksesoriDimiliki || [];
            slotAktif = data.slotAktif || { kepala: null, badan: null, kaki: null, telapak: null };
            if (data.cuacaAktif) cuacaAktif = data.cuacaAktif;
            if (data.indeksCuacaAktif !== undefined) indeksCuacaAktif = data.indeksCuacaAktif;
            lahanTambahanDibeli = data.lahanTambahanDibeli || 0;
            hargaTambahLahan = data.hargaTambahLahan || 5000;
            if (data.lahan && data.lahan.length > 0) {
                lahan = data.lahan.map(l => ({
                    id: l.id,
                    status: l.status,
                    tanaman: l.tanaman,
                    jumlahBibit: l.jumlahBibit || 1,
                    waktuSelesai: l.waktuSelesai,
                    timerInterval: null
                }));
            }
            
            // 🐾 AMBIL & LOAD DATA TERNAK BARU SAAT GAME DIBUKA
            if (data.listHewanTernak) {
                listHewanTernak = data.listHewanTernak;
            } else {
                listHewanTernak = [];
            }
            
        } catch (e) {
            console.error("Gagal memuat save data", e);
        }
    }
}

// Tambahkan pemanggilan interval pengecekan otomatis ini di baris paling bawah fungsi initGame() Anda
setInterval(updateSiklusPeternakanOtomatis, 10000); // Mengecek status peternakan setiap 10 detik sekali
