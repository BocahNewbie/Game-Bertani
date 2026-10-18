// CUACA.JS - Sistem Waktu In-Game & Siklus Cuaca Dinamis

// Inisialisasi state waktu & cuaca jika belum ada di gameState
function initGameTime() {
    if (typeof gameState === 'undefined') return;
    
    // Default mulai jam 06:00 pagi hari pertama
    if (gameState.jamInGame === undefined) gameState.jamInGame = 6;
    if (gameState.menitInGame === undefined) gameState.menitInGame = 0;
    if (gameState.hariInGame === undefined) gameState.hariInGame = 1;
    
    // Daftar kemungkinan cuaca
    if (!gameState.cuacaHariIni) {
        generateJadwalCuacaHarian();
    }
}

// Daftar opsi cuaca yang tersedia
const DAFTAR_CUACA = [
    { nama: "Cerah", icon: "☀️", efek: "Normal" },
    { nama: "Berawan", icon: "⛅", efek: "Normal" },
    { nama: "Hujan", icon: "🌧️", efek: "Bonus Panen / Siram Otomatis" },
    { nama: "Badai", icon: "⛈️", efek: "Waspada Tanaman Rusak" },
    { nama: "Panas Terik", icon: "🔥", efek: "Tanaman Cepat Haus" }
];

// Menghasilkan 3 sampai 4 perubahan cuaca secara acak dalam sehari
function generateJadwalCuacaHarian() {
    // Tentukan apakah hari ini ada 3 atau 4 kali perubahan cuaca
    const jumlahPerubahan = Math.random() < 0.5 ? 3 : 4;
    
    // Bagi 24 jam ke dalam beberapa slot waktu secara merata
    const intervalJam = Math.floor(24 / jumlahPerubahan);
    let jadwalBaru = [];
    
    let cuacaTerakhir = null;
    for (let i = 0; i < jumlahPerubahan; i++) {
        let jamMulai = i * intervalJam;
        
        // Pilih cuaca secara acak (pastikan tidak sama dengan sebelumnya jika memungkinkan)
        let pilihanCuaca;
        do {
            pilihanCuaca = DAFTAR_CUACA[Math.floor(Math.random() * DAFTAR_CUACA.length)];
        } while (pilihanCuaca.nama === cuacaTerakhir && DAFTAR_CUACA.length > 1);
        
        cuacaTerakhir = pilihanCuaca.nama;
        jadwalBaru.push({
            jamMulai: jamMulai,
            cuaca: pilihanCuaca
        });
    }
    
    gameState.jadwalCuacaHarian = jadwalBaru;
    updateCuacaAktif();
}

// Menentukan cuaca yang sedang aktif berdasarkan jam saat ini
function updateCuacaAktif() {
    if (!gameState.jadwalCuacaHarian || gameState.jadwalCuacaHarian.length === 0) return;
    
    let cuacaSekarang = gameState.jadwalCuacaHarian[0].cuaca;
    for (let i = 0; i < gameState.jadwalCuacaHarian.length; i++) {
        if (gameState.jamInGame >= gameState.jadwalCuacaHarian[i].jamMulai) {
            cuacaSekarang = gameState.jadwalCuacaHarian[i].cuaca;
        }
    }
    
    gameState.cuaca = cuacaSekarang.nama;
    gameState.cuacaIcon = cuacaSekarang.icon;
}

// Loop Waktu Utama (1 detik dunia nyata = 1 menit in-game)
function jalankanJamGame() {
    initGameTime();
    
    setInterval(() => {
        if (typeof gameState === 'undefined') return;
        
        // Tambah 1 menit in-game setiap 1 detik realtime
        gameState.menitInGame += 1;
        
        if (gameState.menitInGame >= 60) {
            gameState.menitInGame = 0;
            gameState.jamInGame += 1;
            
            // Perbarui cuaca setiap jam berjalan
            updateCuacaAktif();
            
            // Jika sudah berganti hari (lewat 24:00)
            if (gameState.jamInGame >= 24) {
                gameState.jamInGame = 0;
                gameState.hariInGame += 1;
                // Buat jadwal cuaca baru untuk hari yang baru
                generateJadwalCuacaHarian();
                
                if (typeof tampilkanToast === 'function') {
                    tampilkanToast(`🌅 Hari ke-${gameState.hariInGame} telah dimulai!`);
                }
            }
        }
        
        // Perbarui tampilan UI Jam & Cuaca jika fungsinya ada
        if (typeof updateHeaderStats === 'function') {
            updateHeaderStats();
        }
        
    }, 1000); // Berjalan setiap 1000ms (1 detik)
}

// Format waktu 24 jam (Contoh: 08:05)
function getFormatWaktu() {
    if (typeof gameState === 'undefined' || gameState.jamInGame === undefined) return "06:00";
    const jamStr = String(gameState.jamInGame).padStart(2, '0');
    const menitStr = String(gameState.menitInGame).padStart(2, '0');
    return `${jamStr}:${menitStr}`;
}
