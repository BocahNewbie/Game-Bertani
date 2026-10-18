// State Utama Game
let gameState = {
    namaPemain: "Pak Tani",
    uang: 500,
    cuaca: "Cerah ☀️",
    waktuJam: 8, // Format 24 Jam (0 - 23)
    waktuMenit: 0,
    jumlahLahanAktif: 3 // Jumlah kotak lahan awal yang bisa ditanami
};

// Fungsi Ganti Tab Menu
function gantiTab(evt, tabId) {
    let contents = document.querySelectorAll(".tab-content");
    contents.forEach(c => c.classList.remove("active"));

    let buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
}

// Fungsi Ubah Nama Petani
function ubahNama() {
    const labelNama = document.getElementById("label-nama");
    labelNama.focus();
}

// Update Tampilan Header
function updateHeaderUI() {
    document.getElementById("stat-uang").innerText = `💰 Rp. ${gameState.uang.toLocaleString('id-ID')}`;
    document.getElementById("stat-cuaca").innerText = `☀️ ${gameState.cuaca}`;
    
    let jamFormatted = String(gameState.waktuJam).padStart(2, '0');
    let menitFormatted = String(gameState.waktuMenit).padStart(2, '0');
    document.getElementById("stat-waktu").innerText = `⏰ ${jamFormatted}:${menitFormatted}`;
}

// Konversi Detik ke Format Waktu (Contoh: 600 detik = 10 Menit)
function formatDurasi(detik) {
    if (detik < 60) return `${detik} Detik`;
    let menit = Math.floor(detik / 60);
    if (menit < 60) return `${menit} Menit`;
    let jam = Math.floor(menit / 60);
    let sisaMenit = menit % 60;
    if (jam < 24) return sisaMenit > 0 ? `${jam} Jam ${sisaMenit} Mnt` : `${jam} Jam`;
    let hari = Math.floor(jam / 24);
    return `${hari} Hari`;
}

// Render Tab Lahan Pertanian
function renderLahan() {
    const container = document.getElementById("grid-lahan");
    container.innerHTML = "";

    for (let i = 1; i <= gameState.jumlahLahanAktif; i++) {
        container.innerHTML += `
            <div class="card lahan-card">
                <h3>Lahan #${i}</h3>
                <p>🌿 Kosong</p>
                <button onclick="tanamBibit(${i})">Tanam Bibit</button>
            </div>
        `;
    }
}

// Render Tab Supermarket (Tempat Beli Bibit Berdasarkan database.js)
function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    container.innerHTML = "";

    // Mengambil data tanaman dari GAME_DATABASE.tanaman
    const daftarTanaman = GAME_DATABASE.tanaman;

    for (let key in daftarTanaman) {
        let item = daftarTanaman[key];
        let durasiTumbuh = formatDurasi(item.durasi);

        container.innerHTML += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b>Rp. ${item.hargaBeli}</b></p>
                <p>Jual: Rp. ${item.hargaJual}</p>
                <p>⏱️ ${durasiTumbuh}</p>
                <p>✨ XP: ${item.xp}</p>
                <button onclick="beliBibit('${item.id}', ${item.hargaBeli})">Beli Bibit</button>
            </div>
        `;
    }
}

// Fungsi Beli Bibit
function beliBibit(idBibit, harga) {
    if (gameState.uang >= harga) {
        gameState.uang -= harga;
        updateHeaderUI();
        alert(`Berhasil membeli bibit ${idBibit}! Cek di menu Tas.`);
    } else {
        alert("Uang kamu tidak cukup untuk membeli bibit ini!");
    }
}

// Simulasi Aksi Tanam
function tanamBibit(nomorLahan) {
    alert(`Memilih menanam di Lahan #${nomorLahan}. Pilih bibit dari tas/supermarket.`);
}

// Inisialisasi Awal Saat Halaman Dimuat
window.onload = function() {
    updateHeaderUI();
    renderLahan();
    renderSupermarket();
};
