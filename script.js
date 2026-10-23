// ==========================================
// CONFIG & INTEGRASI GOOGLE APPS SCRIPT
// ==========================================
const URL_SCRIPT_DATABASE = "https://script.google.com/macros/s/AKfycbxmq440FWj9HXk5kckzjln-BSQ9rFVKvEmMzftJLeGKPF-u5Y83VE25PdoZaU1Qn7V9gQ/exec";

// Mengambil ID yang tersimpan di browser
function getIdPemainLocal() {
    return localStorage.getItem("game_player_id");
}

let gameState = {
    namaPemain: "Pak Tani",
    uang: 1500,
    waktuHari: 1, 
    waktuJam: 8, 
    waktuMenit: 0,
    jumlahLahanAktif: 1, 
    jumlahKandangAktif: 1,
    tas: {},    
    lahan: {},   
    kandang: {},
    durasiPisau: 300,
    durasiKompor: 300,
    durasiPancingan: 750,
    misiPapan: [],
    misiAktif: [],
    mancingHari: 1,
    mancingCount: 0,
    prosesMasak: []
};

let transaksiAktif = { idItem: "", namaItem: "", hargaSatuan: 0, stokMaks: 0, tipe: "" };
let targetKonfirmasi = { jenis: "", nomor: 0, biayaKayu: 0, biayaUang: 0 };
let lahanTargetAktif = null;
let kandangTargetAktif = null;
let fluktuasiCache = {}; 
let lastMenitFluktuasi = -1; 

// Variable Mancing
let intervalMancing = null;
let posisiBar = 0;
let arahBar = 1;
let zonaHijau = { min: 20, max: 45 };

const DAFTAR_NAMA_NPC = ["Pak RT", "Chef Jaka", "Ibu Ros", "Paman Sam", "Mbak Maya", "Pak Dokter"];

function getNamaMusim(hari) {
    let siklusHari = ((hari - 1) % 128) + 1;
    if (siklusHari <= 32) return { nama: "Spring (Musim Semi)", icon: "🌸" };
    if (siklusHari <= 64) return { nama: "Summer (Musim Panas)", icon: "☀️" };
    if (siklusHari <= 96) return { nama: "Autumn (Musim Gugur)", icon: "🍁" };
    return { nama: "Winter (Musim Dingin)", icon: "❄️" };
}

function getFluktuasiItem(idItem, baseHarga) {
    if (!baseHarga) baseHarga = 100;
    let kunciWaktu = `${gameState.waktuHari}-${gameState.waktuJam}-${Math.floor(gameState.waktuMenit / 10)}`;
    if (!fluktuasiCache[idItem] || fluktuasiCache[idItem].waktu !== kunciWaktu) {
        let persen = Math.floor(Math.random() * 51) - 20; 
        fluktuasiCache[idItem] = { persen: persen, waktu: kunciWaktu };
    }
    let persenVal = fluktuasiCache[idItem].persen;
    let hargaAktif = Math.round(baseHarga * (1 + persenVal / 100));
    if (hargaAktif < 1) hargaAktif = 1;
    return { harga: hargaAktif, persen: persenVal };
}

function getInfoGrafikHarga(hargaAktif, hargaBase) {
    if (!hargaBase) return `<span style="color: var(--text-muted);">➖ Stabil</span>`;
    if (hargaAktif > hargaBase) {
        return `<span style="color: #34d399;">📈 Naik (+${hargaAktif - hargaBase})</span>`;
    } else if (hargaAktif < hargaBase) {
        return `<span style="color: #f87171;">📉 Turun (${hargaAktif - hargaBase})</span>`;
    } else {
        return `<span style="color: var(--text-muted);">➖ Stabil</span>`;
    }
}

function gantiTab(evt, tabId) {
    let contents = document.querySelectorAll(".tab-content");
    contents.forEach(c => c.classList.remove("active"));
    let buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(b => b.classList.remove("active"));

    let targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add("active");
    }
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
    refreshTabAktif(tabId);
}

function refreshTabAktif(tabId) {
    if (tabId === 'tab-tas') renderTas();
    if (tabId === 'tab-supermarket') renderSupermarket();
    if (tabId === 'tab-pasar') renderPasar();
    if (tabId === 'tab-jagal') renderJagal();
    if (tabId === 'tab-lahan') renderLahan();
    if (tabId === 'tab-kandang') renderKandang();
    if (tabId === 'tab-pengepul') renderPengepul();
    if (tabId === 'tab-tukang-kayu') renderTukangKayu();
    if (tabId === 'tab-wikipedia') renderWikipedia();
    if (tabId === 'tab-mancing') renderSungai();
    if (tabId === 'tab-misi') renderPapanMisi();
    if (tabId === 'tab-toko-bumbu') renderTokoBumbu();
    if (tabId === 'tab-dapur') renderDapur();
    if (tabId === 'tab-balap-kuda') renderBalapKuda();
}

function ubahNama() {
    let container = document.querySelector(".player-info");
    container.innerHTML = `
        <input type="text" id="input-nama-baru" value="${gameState.namaPemain}" style="background: #101622; border: 1px solid var(--border-color); color: var(--text-main); padding: 4px 8px; border-radius: 4px; font-size: 1rem;">
        <button onclick="acceptUbahNama()" style="background: #059669; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">✔</button>
        <button onclick="batalUbahNama()" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">✖</button>
    `;
    document.getElementById("input-nama-baru").focus();
}

function acceptUbahNama() {
    let inputBaru = document.getElementById("input-nama-baru");
    let namaBaru = inputBaru.value.trim();
    if (namaBaru !== "") {
        gameState.namaPemain = namaBaru;
        simpanGame();
    }
    resetHeaderNamaUI();
}

function batalUbahNama() { resetHeaderNamaUI(); }

function resetHeaderNamaUI() {
    let container = document.querySelector(".player-info");
    if (!container) return;
    let playerId = getIdPemainLocal() || "Registrasi...";
    let tombolSaveHTML = `<button onclick="simpanGame()" title="Simpan Ke Cloud" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; margin-left: 5px;">💾</button>`;
    
    // HANYA NAMA YANG BISA DIUBAH (TIDAK ADA TOMBOL / OPSIONAL GANTI ID)
    container.innerHTML = `
        <span id="label-nama">${gameState.namaPemain}</span> 
        <small style="color: #fbbf24; font-weight:bold; font-size:0.8rem; margin-left:3px;">[${playerId}]</small>
        <button id="btn-edit-nama" onclick="ubahNama()" title="Ubah Nama Tampilan" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">✏️</button>
        ${tombolSaveHTML}
    `;
}

// ==========================================
// FUNGSI REGISTRASI, SIMPAN & MUAT DARI SERVER
// ==========================================

function daftarkanPemainBaru() {
    tampilkanPopupNotifikasi("⏳ Menghubungkan Server...", "Membuat ID Pemain...", "neon-blue");

    let payload = {
        action: "register",
        playerName: gameState.namaPemain,
        gameState: gameState,
        horseState: (typeof balapKudaState !== 'undefined') ? balapKudaState : {}
    };

    fetch(URL_SCRIPT_DATABASE, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            localStorage.setItem("game_player_id", data.playerId);
            gameState = data.gameState;
            if (typeof balapKudaState !== 'undefined' && data.horseState) {
                balapKudaState = data.horseState;
            }
            updateHeaderUI();
            resetHeaderNamaUI();
            renderSemuaTabUtama();
            tampilkanPopupNotifikasi(
                "🎉 Akun Dibuat!", 
                `ID Resmi Kamu: ${data.playerId}`, 
                "neon-green"
            );
        }
    })
    .catch(err => console.error("Error register:", err));
}

function simpanGame() {
    let playerId = getIdPemainLocal();
    if (!playerId) {
        daftarkanPemainBaru();
        return;
    }

    tampilkanPopupNotifikasi("⏳ Menyimpan...", "Sedang mengunggah data...", "neon-blue");

    let payload = {
        action: "save",
        playerId: playerId,
        playerName: gameState.namaPemain,
        gameState: gameState,
        horseState: (typeof balapKudaState !== 'undefined') ? balapKudaState : {}
    };

    fetch(URL_SCRIPT_DATABASE, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            tampilkanPopupNotifikasi(
                "☁️ Tersimpan!", 
                `Data milik kamu berhasil diperbarui!`, 
                "neon-green"
            );
        } else {
            alert("⚠️ Gagal menyimpan data. ID tidak ditemukan.");
        }
    })
    .catch(err => {
        console.error("Error save:", err);
        alert("⚠️ Kesalahan koneksi saat menyimpan data.");
    });
}

function muatGame() {
    let playerId = getIdPemainLocal();
    
    // Jika belum memiliki ID di lokal browser, buatkan ID urut baru via server
    if (!playerId) {
        daftarkanPemainBaru();
        return;
    }

    let payload = {
        action: "load",
        playerId: playerId
    };

    fetch(URL_SCRIPT_DATABASE, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            gameState = data.gameState;
            if (typeof balapKudaState !== 'undefined' && data.horseState) {
                balapKudaState = data.horseState;
            }
            updateHeaderUI();
            resetHeaderNamaUI();
            renderSemuaTabUtama();
            tampilkanPopupNotifikasi(
                "✨ Data Dimuat!", 
                `Selamat datang kembali, ${gameState.namaPemain}!`, 
                "neon-green"
            );
        } else {
            // Jika ID tidak valid di spreadsheet, daftarkan akun baru
            daftarkanPemainBaru();
        }
    })
    .catch(err => console.error("Error load:", err));
}

function renderSemuaTabUtama() {
    renderLahan();
    renderKandang();
    renderSupermarket();
    renderPasar();
    renderTokoBumbu();
    renderJagal();
    renderTukangKayu();
    renderPengepul();
    renderTas();
    renderWikipedia();
    renderSungai();
    renderDapur();
    renderPapanMisi();
    if (typeof renderBalapKuda === 'function') renderBalapKuda();
}

function updateHeaderUI() {
    let elUang = document.getElementById("stat-uang");
    if (elUang) elUang.innerText = `💰 Rp. ${gameState.uang.toLocaleString('id-ID')}`;
    let jamFormatted = String(gameState.waktuJam).padStart(2, '0');
    let menitFormatted = String(gameState.waktuMenit).padStart(2, '0');
    let musimInfo = getNamaMusim(gameState.waktuHari);
    let elWaktu = document.getElementById("stat-waktu");
    if (elWaktu) elWaktu.innerText = `${musimInfo.icon} Hari ${gameState.waktuHari} (${musimInfo.nama}) ⏰ ${jamFormatted}:${menitFormatted}`;
}

function getTotalMenitInGame(hari, jam, menit) {
    return ((hari - 1) * 1440) + (jam * 60) + menit;
}

function formatDurasiBersih(totalMenit) {
    if (totalMenit <= 0) return "Siap Panen / Selesai! ✨";
    let hari = Math.floor(totalMenit / 1440);
    let jam = Math.floor((totalMenit % 1440) / 60);
    let menit = totalMenit % 60;
    let res = "";
    if (hari > 0) res += `${hari} Hari `;
    if (jam > 0) res += `${jam} Jam `;
    if (menit > 0 || res === "") res += `${menit} Menit`;
    return res;
}

// --- TAB LAHAN ---
function renderLahan() {
    const container = document.getElementById("grid-lahan");
    if (!container) return;
    container.innerHTML = "";
    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

    for (let i = 1; i <= 20; i++) {
        let dataLahan = gameState.lahan[i];

        if (i <= gameState.jumlahLahanAktif) {
            if (!dataLahan) {
                container.innerHTML += `
                    <div class="card lahan-card">
                        <h3>Lahan #${i}</h3>
                        <p style="color: var(--text-muted);">🌿 Kosong</p>
                        <button onclick="bukaModalTanam(${i})">Tanam Bibit</button>
                    </div>
                `;
            } else {
                let bibitInfo = (GAME_DATABASE.bibit && GAME_DATABASE.bibit[dataLahan.idBibit]) || {};
                let hasilInfo = (GAME_DATABASE.hasilPanen && GAME_DATABASE.hasilPanen[bibitInfo.hasilId]) || { nama: "Tanaman", icon: "🌱" };
                let sisaWaktu = Math.max(0, dataLahan.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaWaktu);
                let tombolAksi = sisaWaktu === 0 
                    ? `<button onclick="panenHasil(${i})" style="background: #d97706; color:white;">Panen (${dataLahan.jumlah})</button>`
                    : `<button disabled style="background: #334155; cursor: not-allowed;">Tumbuh... (${teksWaktu})</button>`;

                container.innerHTML += `
                    <div class="card lahan-card" style="border: 1px solid rgba(16, 185, 129, 0.4);">
                        <h3>Lahan #${i}</h3>
                        <div style="font-size: 2.5rem; margin: 5px 0;">${hasilInfo.icon}</div>
                        <p><b>${hasilInfo.nama}</b></p>
                        <p>Jumlah: <b>${dataLahan.jumlah} Pcs</b></p>
                        <p style="font-size: 0.85rem; color: #34d399;">⏱️ ${teksWaktu}</p>
                        ${tombolAksi}
                    </div>
                `;
            }
        } 
        else if (dataLahan && dataLahan.status === 'dibangun') {
            let sisaKonstruksi = Math.max(0, dataLahan.targetMenitSelesai - totalMenitSekarang);
            let teksKonstruksi = formatDurasiBersih(sisaKonstruksi);
            let tombolProses = sisaKonstruksi === 0
                ? `<button onclick="selesaikanPembangunanLahan(${i})" style="background: #10b981; color:white;">Ambil Selesai</button>`
                : `<button disabled style="background: #334155; cursor: not-allowed; opacity: 0.7;">⏳ Sedang Dibuka... (${teksKonstruksi})</button>`;

            container.innerHTML += `
                <div class="card lahan-card" style="border: 1px solid #3b82f6;">
                    <h3>Lahan #${i} 🏗️</h3>
                    <p style="color: #60a5fa;">Masa Pembangunan</p>
                    <p style="font-size: 0.85rem;">Sisa: <b>${teksKonstruksi}</b></p>
                    ${tombolProses}
                </div>
            `;
        } 
        else if (i === gameState.jumlahLahanAktif + 1) {
            let biaya = hitungBiayaUpgradeLahan(i);
            container.innerHTML += `
                <div class="card lahan-card" style="opacity: 0.9; border: 1px dashed var(--border-color);">
                    <h3>Lahan #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #fbbf24;">🪵 ${biaya.kayu} Kayu<br>💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 2 Hari</p>
                    <button onclick="konfirmasiBukaLahan(${i})" style="background: #2563eb;">Buka Lahan</button>
                </div>
            `;
        } 
        else {
            container.innerHTML += `
                <div class="card lahan-card" style="opacity: 0.5; border: 1px dashed var(--border-color);">
                    <h3>Lahan #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #888;">Urutan Lahan Belum Buka</p>
                    <button disabled style="background: #334155; cursor: not-allowed;">Terkunci</button>
                </div>
            `;
        }
    }
}

function hitungBiayaUpgradeLahan(targetLahan) {
    let kayu = 25, uang = 500;
    for (let l = 3; l <= targetLahan; l++) {
        kayu = Math.round(kayu * 2.37);
        uang = Math.round(uang * 2.37);
    }
    return { kayu, uang };
}

function konfirmasiBukaLahan(nomorLahan) {
    if (nomorLahan !== gameState.jumlahLahanAktif + 1) return;
    let biaya = hitungBiayaUpgradeLahan(nomorLahan);
    targetKonfirmasi = { jenis: 'lahan', nomor: nomorLahan, biayaKayu: biaya.kayu, biayaUang: biaya.uang };

    let modal = document.getElementById("modal-konfirmasi-bangun");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-konfirmasi-bangun";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-blue">
                <h3>Konfirmasi Pembangunan</h3>
                <p id="konf-teks" style="color: var(--text-muted); margin: 15px 0;"></p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalKonfirmasi()">Kembali</button>
                    <button class="btn-confirm" onclick="eksekusiBukaBangunan()">Bangun</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("konf-teks").innerHTML = `Ingin membuka <b>Lahan #${nomorLahan}</b>?<br>Biaya: 🪵 ${biaya.kayu} Kayu & 💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 2 Hari In-Game`;
    modal.style.display = "flex";
}

function tutupModalKonfirmasi() { 
    let modal = document.getElementById("modal-konfirmasi-bangun");
    if (modal) modal.style.display = "none"; 
}

function eksekusiBukaBangunan() {
    tutupModalKonfirmasi();
    let { jenis, nomor, biayaKayu, biayaUang } = targetKonfirmasi;
    let stokKayu = gameState.tas['kayu'] || 0;

    if (stokKayu >= biayaKayu && gameState.uang >= biayaUang) {
        gameState.tas['kayu'] -= biayaKayu;
        if (gameState.tas['kayu'] <= 0) delete gameState.tas['kayu'];
        gameState.uang -= biayaUang;

        let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
        let durasiHari = jenis === 'lahan' ? 2 : 5;

        if (jenis === 'lahan') {
            gameState.lahan[nomor] = { status: 'dibangun', targetMenitSelesai: totalMenitSekarang + (durasiHari * 1440) };
            renderLahan();
        } else {
            gameState.kandang[nomor] = { status: 'dibangun', targetMenitSelesai: totalMenitSekarang + (durasiHari * 1440) };
            renderKandang();
        }
        updateHeaderUI();
        tampilkanPopupNotifikasi("🏗️ Konstruksi Dimulai!", `Pembangunan sedang dikerjakan (${durasiHari} Hari).`, "neon-blue");
        renderTas();
    } else {
        alert("⚠️ Sumber daya tidak cukup!");
    }
}

function selesaikanPembangunanLahan(nomorLahan) {
    gameState.jumlahLahanAktif = nomorLahan;
    delete gameState.lahan[nomorLahan];
    tampilkanPopupNotifikasi("✨ Selesai!", `Lahan #${nomorLahan} siap digunakan.`, "neon-green");
    renderLahan();
}

function bukaModalTanam(nomorLahan) {
    lahanTargetAktif = nomorLahan;
    let modal = document.getElementById("modal-tanam");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-tanam";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-green">
                <h3>Pilih Bibit</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Maks 35 per lahan</p>
                <div id="list-bibit-tas" style="max-height: 220px; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;"></div>
                <button class="btn-cancel" onclick="tutupModalTanam()" style="width:100%; padding: 8px;">Kembali</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    let container = document.getElementById("list-bibit-tas");
    container.innerHTML = "";
    let ada = false;
    for (let id in GAME_DATABASE.bibit) {
        let stok = gameState.tas[id] || 0;
        if (stok > 0) {
            ada = true;
            let info = GAME_DATABASE.bibit[id];
            container.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #121824; padding: 10px; border-radius: 8px;">
                    <span>${info.icon} ${info.nama} (Stok: ${stok})</span>
                    <button onclick="eksekusiTanamBibit('${id}', ${stok})" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Tanam Max</button>
                </div>
            `;
        }
    }
    if (!ada) container.innerHTML = `<p style="color: #f87171;">Tas kosong dari bibit!</p>`;
    modal.style.display = "flex";
}

function tutupModalTanam() { 
    let modal = document.getElementById("modal-tanam");
    if (modal) modal.style.display = "none"; 
}

function eksekusiTanamBibit(idBibit, stokTas) {
    let jumlahTanam = Math.min(stokTas, 35);
    gameState.tas[idBibit] -= jumlahTanam;
    if (gameState.tas[idBibit] <= 0) delete gameState.tas[idBibit];

    let durasiMenit = Math.ceil((GAME_DATABASE.bibit[idBibit].durasi || 300) / 60);
    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

    gameState.lahan[lahanTargetAktif] = {
        idBibit: idBibit,
        jumlah: jumlahTanam,
        targetMenitInGame: totalMenitSekarang + durasiMenit
    };
    tutupModalTanam();
    renderLahan();
    renderTas();
}

function panenHasil(nomorLahan) {
    let dataLahan = gameState.lahan[nomorLahan];
    let idHasil = GAME_DATABASE.bibit[dataLahan.idBibit].hasilId;
    gameState.tas[idHasil] = (gameState.tas[idHasil] || 0) + dataLahan.jumlah;
    delete gameState.lahan[nomorLahan];
    renderLahan();
    renderTas();
}

// --- TAB KANDANG ---
function renderKandang() {
    const container = document.getElementById("grid-kandang");
    if (!container) return;
    container.innerHTML = "";
    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

    for (let i = 1; i <= 35; i++) {
        let dataKandang = gameState.kandang[i];
        if (i <= gameState.jumlahKandangAktif) {
            if (!dataKandang) {
                container.innerHTML += `
                    <div class="card">
                        <h3>Kandang #${i}</h3>
                        <p style="color: var(--text-muted);">🏡 Kosong</p>
                    </div>
                `;
            } else if (!dataKandang.idTernak) {
                let ternakInfo = (GAME_DATABASE.ternak && GAME_DATABASE.ternak[dataKandang.jenisHewan]) || { nama: "Hewan", icon: "🐮" };
                container.innerHTML += `
                    <div class="card" style="border: 1px solid #f59e0b;">
                        <h3>Kandang #${i}</h3>
                        <div style="font-size: 2.5rem;">${ternakInfo.icon}</div>
                        <p><b>${ternakInfo.nama}</b></p>
                        <p style="font-size: 0.85rem; color: #f87171;">Butuh Pakan!</p>
                        <button onclick="beriPakanKandang(${i})" style="background: #d97706; color:white;">Beri Pakan</button>
                        <button onclick="simpanKeJagal(${i})" style="background: #dc2626; color:white; font-size:0.8rem; padding:4px; margin-top:5px;">Simpan ke Jagal</button>
                    </div>
                `;
            } else {
                let ternakInfo = (GAME_DATABASE.ternak && GAME_DATABASE.ternak[dataKandang.idTernak]) || { nama: "Hewan", icon: "🐮" };
                let hasilInfo = (GAME_DATABASE.ternakHasil && GAME_DATABASE.ternakHasil[ternakInfo.hasilId]) || { nama: "Hasil" };
                let sisaWaktu = Math.max(0, dataKandang.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaWaktu);
                let tombolAksi = sisaWaktu === 0 
                    ? `<button onclick="panenTernak(${i})" style="background: #d97706; color:white;">Panen Hasil</button>`
                    : `<button disabled style="background: #334155; cursor: not-allowed;">Berproses... (${teksWaktu})</button>`;

                container.innerHTML += `
                    <div class="card" style="border: 1px solid #10b981;">
                        <h3>Kandang #${i}</h3>
                        <div style="font-size: 2.5rem;">${ternakInfo.icon}</div>
                        <p><b>${ternakInfo.nama}</b></p>
                        <p style="font-size: 0.85rem; color: #fbbf24;">Hasil: ${hasilInfo.nama}</p>
                        <p style="font-size: 0.85rem; color: #34d399;">⏱️ ${teksWaktu}</p>
                        ${tombolAksi}
                        <button onclick="simpanKeJagal(${i})" style="background: #dc2626; color:white; font-size:0.8rem; padding:4px; margin-top:5px;">Simpan ke Jagal</button>
                    </div>
                `;
            }
        } else if (dataKandang && dataKandang.status === 'dibangun') {
            let sisaKonstruksi = Math.max(0, dataKandang.targetMenitSelesai - totalMenitSekarang);
            let teksKonstruksi = formatDurasiBersih(sisaKonstruksi);
            let tombolProses = sisaKonstruksi === 0
                ? `<button onclick="selesaikanPembangunanKandang(${i})" style="background: #10b981; color:white;">Ambil Selesai</button>`
                : `<button disabled style="background: #334155; cursor: not-allowed; opacity: 0.7;">⏳ Sedang Dibuka... (${teksKonstruksi})</button>`;

            container.innerHTML += `
                <div class="card" style="border: 1px solid #3b82f6;">
                    <h3>Kandang #${i} 🏗️</h3>
                    <p style="color: #60a5fa;">Masa Pembangunan</p>
                    <p style="font-size: 0.85rem;">Sisa: <b>${teksKonstruksi}</b></p>
                    ${tombolProses}
                </div>
            `;
        } else if (i === gameState.jumlahKandangAktif + 1) {
            let biaya = hitungBiayaUpgradeKandang(i);
            container.innerHTML += `
                <div class="card" style="opacity: 0.9; border: 1px dashed var(--border-color);">
                    <h3>Kandang #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #fbbf24;">🪵 ${biaya.kayu} Kayu<br>💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 5 Hari</p>
                    <button onclick="konfirmasiBukaKandang(${i})" style="background: #2563eb;">Buka Kandang</button>
                </div>
            `;
        } else {
            container.innerHTML += `
                <div class="card" style="opacity: 0.5; border: 1px dashed var(--border-color);">
                    <h3>Kandang #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #888;">Urutan Kandang Belum Buka</p>
                    <button disabled style="background: #334155; cursor: not-allowed;">Terkunci</button>
                </div>
            `;
        }
    }
}

function hitungBiayaUpgradeKandang(targetKandang) {
    let kayu = 100, uang = 2500;
    for (let k = 3; k <= targetKandang; k++) {
        kayu = Math.round(kayu * 2.37);
        uang = Math.round(uang * 2.37);
    }
    return { kayu, uang };
}

function konfirmasiBukaKandang(nomorKandang) {
    if (nomorKandang !== gameState.jumlahKandangAktif + 1) return;
    let biaya = hitungBiayaUpgradeKandang(nomorKandang);
    targetKonfirmasi = { jenis: 'kandang', nomor: nomorKandang, biayaKayu: biaya.kayu, biayaUang: biaya.uang };

    let modal = document.getElementById("modal-konfirmasi-bangun");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-konfirmasi-bangun";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-blue">
                <h3>Konfirmasi Pembangunan</h3>
                <p id="konf-teks" style="color: var(--text-muted); margin: 15px 0;"></p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalKonfirmasi()">Kembali</button>
                    <button class="btn-confirm" onclick="eksekusiBukaBangunan()">Bangun</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("konf-teks").innerHTML = `Ingin membangun <b>Kandang #${nomorKandang}</b>?<br>Biaya: 🪵 ${biaya.kayu} Kayu & 💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 5 Hari In-Game`;
    modal.style.display = "flex";
}

function selesaikanPembangunanKandang(nomorKandang) {
    gameState.jumlahKandangAktif = nomorKandang;
    delete gameState.kandang[nomorKandang];
    tampilkanPopupNotifikasi("✨ Selesai!", `Kandang #${nomorKandang} siap digunakan.`, "neon-green");
    renderKandang();
}

function beriPakanKandang(nomorKandang) {
    let dataKandang = gameState.kandang[nomorKandang];
    let idHewan = dataKandang.jenisHewan;
    let idPakan = "";
    for (let p in GAME_DATABASE.pakan) {
        if (GAME_DATABASE.pakan[p].targetTernak === idHewan) { idPakan = p; break; }
    }

    let stokPakan = gameState.tas[idPakan] || 0;
    if (stokPakan > 0) {
        gameState.tas[idPakan] -= 1;
        if (gameState.tas[idPakan] <= 0) delete gameState.tas[idPakan];
        dataKandang.idTernak = idHewan;

        let hariIniMenit = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
        let sisaMenitHariIni = 1440 - ((gameState.waktuJam * 60) + gameState.waktuMenit);
        let menitMenujuBesokJam9 = sisaMenitHariIni + 1440 + (9 * 60);

        dataKandang.targetMenitInGame = hariIniMenit + menitMenujuBesokJam9;
        tampilkanPopupNotifikasi("🌾 Diberi Pakan!", "Panen akan siap besok pukul 09.00 pagi.", "neon-green");
        renderKandang();
        renderTas();
    } else {
        alert("⚠️ Pakan tidak cukup! Beli pakan di Pasar.");
    }
}

function panenTernak(nomorKandang) {
    let dataKandang = gameState.kandang[nomorKandang];
    let idHasil = GAME_DATABASE.ternak[dataKandang.idTernak].hasilId;
    gameState.tas[idHasil] = (gameState.tas[idHasil] || 0) + 1;
    dataKandang.idTernak = null;
    dataKandang.targetMenitInGame = 0;
    renderKandang();
    renderTas();
}

function simpanKeJagal(nomorKandang) {
    let dataKandang = gameState.kandang[nomorKandang];
    let jenisHewan = dataKandang.jenisHewan;
    if (!gameState.penyimpananJagal) gameState.penyimpananJagal = [];
    gameState.penyimpananJagal.push(jenisHewan);
    delete gameState.kandang[nomorKandang];
    tampilkanPopupNotifikasi("🔪 Disimpan ke Jagal", "Hewan telah dikirim ke fasilitas jagal.", "neon-blue");
    renderKandang();
    renderJagal();
}

// --- TAB JAGAL & DURABILITY PISAU ---
function renderJagal() {
    const container = document.getElementById("grid-jagal");
    if (!container) return;
    container.innerHTML = "";

    let punyaPisau = gameState.tas['pisau'] || 0;
    let durability = gameState.durasiPisau;

    let infoDurabilityHTML = `<div style="grid-column: 1/-1; background: var(--bg-card); padding: 15px; border-radius: 10px; margin-bottom: 15px; border:1px solid var(--border-color);">
        <h3>🔪 Status Pisau Potong</h3>
        <p>Durability: <b style="color: ${durability > 50 ? '#34d399' : '#f87171'}">${durability} / 300 x pakai</b></p>
        ${durability <= 0 ? '<p style="color:#f87171; font-weight:bold;">Pisau tumpul! Asah di Tukang Kayu.</p>' : ''}
    </div>`;

    if (punyaPisau <= 0) {
        container.innerHTML = infoDurabilityHTML + `<div style="grid-column: 1/-1; text-align: center; color: #f87171;"><h3>Membutuhkan Pisau Potong</h3><p>Beli Pisau terlebih dahulu di Pasar.</p></div>`;
        return;
    }

    let daftarHewanJagal = gameState.penyimpananJagal || [];
    if (daftarHewanJagal.length === 0) {
        container.innerHTML = infoDurabilityHTML + `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Belum ada hewan di tempat jagal.</p>`;
        return;
    }

    let htmlHewan = "";
    daftarHewanJagal.forEach((jenis, idx) => {
        let info = GAME_DATABASE.ternak[jenis] || { nama: "Hewan", icon: "🥩" };
        let bisaJagal = durability > 0;
        htmlHewan += `
            <div class="card">
                <div style="font-size: 2.5rem;">${info.icon}</div>
                <h3>${info.nama}</h3>
                <p style="color: var(--text-muted);">Siap Dipotong</p>
                <button onclick="prosesJagal(${idx}, '${jenis}')" style="background: #dc2626; color: white;" ${!bisaJagal ? 'disabled style="background:#334155; cursor:not-allowed;"' : ''}>${bisaJagal ? 'Jagal Hewan' : 'Pisau Tumpul'}</button>
            </div>
        `;
    });
    container.innerHTML = infoDurabilityHTML + htmlHewan;
}

function prosesJagal(index, jenis) {
    if (gameState.durasiPisau <= 0) {
        alert("⚠️ Pisau kamu sudah tumpul (durability 0)! Silakan asah di Tukang Kayu.");
        return;
    }

    gameState.durasiPisau -= 1;
    gameState.penyimpananJagal.splice(index, 1);
    let mapHasil = { ayam: 'daging_ayam', sapi: 'daging_sapi', kambing: 'daging_kambing', babi: 'daging_babi_mentah' };
    let idHasilJagal = mapHasil[jenis] || 'daging_ayam';
    let hasilData = (GAME_DATABASE.jagalHasil && GAME_DATABASE.jagalHasil[idHasilJagal]) || { jumlah: 1, nama: "Daging" };

    gameState.tas[idHasilJagal] = (gameState.tas[idHasilJagal] || 0) + hasilData.jumlah;
    tampilkanPopupNotifikasi("🍖 Jagal Berhasil", `Mendapatkan ${hasilData.jumlah} ${hasilData.nama}! Durability pisau sisa ${gameState.durasiPisau}/300.`, "neon-green");
    renderJagal();
    renderTas();
}

function asahPisau() {
    if ((gameState.tas['pisau'] || 0) <= 0) {
        alert("⚠️ Kamu belum memiliki Pisau Potong! Beli Pisau terlebih dahulu di Pasar.");
        return;
    }
    if (gameState.durasiPisau >= 300) {
        alert("⚠️ Pisau Anda masih tajam! Belum perlu diasah.");
        return;
    }

    let biaya = (GAME_DATABASE.alat && GAME_DATABASE.alat.pisau && GAME_DATABASE.alat.pisau.biayaAsah) || 17000;
    if (gameState.uang >= biaya) {
        gameState.uang -= biaya;
        gameState.durasiPisau = 300;
        updateHeaderUI();
        tampilkanPopupNotifikasi("✨ Pisau Tajam Kembali!", "Durability pisau berhasil dipulihkan menjadi 300x pakai.", "neon-green");
        renderTukangKayu();
    } else {
        alert("⚠️ Uang tidak cukup untuk mengasah pisau!");
    }
}

// --- TAB PASAR, SUPERMARKET, TOKO BUMBU, TUKANG KAYU, PENGEPUL, WIKIPEDIA ---
function renderPasar() {
    const container = document.getElementById("list-pasar");
    if (!container) return;
    container.innerHTML = "";

    let html = `<h3 style="color: #fbbf24; grid-column:1/-1;">🐮 Hewan Ternak</h3>`;
    for (let id in GAME_DATABASE.ternak) {
        let item = GAME_DATABASE.ternak[id];
        let hBeli = item.hargaBeli || 1000;
        let f = getFluktuasiItem(id, hBeli);
        html += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, hBeli)}<button onclick="bukaModalBeliHewan('${id}', '${item.nama}', ${f.harga})">Beli Hewan</button></div>`;
    }

    html += `<h3 style="color: #34d399; grid-column:1/-1; margin-top:20px;">🌾 Pakan Ternak</h3>`;
    for (let id in GAME_DATABASE.pakan) {
        let item = GAME_DATABASE.pakan[id];
        let hBeli = item.hargaBeli || 100;
        let f = getFluktuasiItem(id, hBeli);
        html += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, hBeli)}<button onclick="bukaModalBeli('${id}', '${item.nama}', ${f.harga}, 'pasar')">Beli Pakan</button></div>`;
    }

    if (GAME_DATABASE.alat) {
        html += `<h3 style="color: #60a5fa; grid-column:1/-1; margin-top:20px;">⚙️ Peralatan Kerja</h3>`;
        for (let idAlat in GAME_DATABASE.alat) {
            let alat = GAME_DATABASE.alat[idAlat];
            let punya = (gameState.tas[idAlat] || 0) > 0;

            let tombolHTML = punya
                ? `<button disabled style="background:#334155; cursor:not-allowed; margin-top:10px;">✅ Sudah Dimiliki</button>`
                : `<button onclick="bukaModalBeli('${alat.id}', '${alat.nama}', ${alat.hargaBeli}, 'pasar')" style="margin-top:10px;">Beli ${alat.nama}</button>`;

            html += `
                <div class="card">
                    <div style="font-size:2.5rem;">${alat.icon}</div>
                    <h3>${alat.nama}</h3>
                    <p>Beli: <b>Rp. ${alat.hargaBeli.toLocaleString('id-ID')}</b></p>
                    <p style="font-size:0.8rem; color:var(--text-muted);">Durability: ${alat.durabilityMax}x Pakai</p>
                    ${tombolHTML}
                </div>
            `;
        }
    }

    container.innerHTML = html;
}

function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    if (!container) return;
    container.innerHTML = "";
    for (let id in GAME_DATABASE.bibit) {
        let item = GAME_DATABASE.bibit[id];
        let hBeli = item.hargaBeli || 50;
        let f = getFluktuasiItem(id, hBeli);
        container.innerHTML += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, hBeli)}<button onclick="bukaModalBeli('${id}', '${item.nama}', ${f.harga}, 'supermarket')">Beli Bibit</button></div>`;
    }
}

function renderTokoBumbu() {
    const container = document.getElementById("list-toko-bumbu");
    if (!container) return;
    container.innerHTML = "";

    let html = `<h3 style="color: #fbbf24; grid-column:1/-1;">🧂 Toko Kelontong & Bumbu Khusus (Non-Tanam)</h3>`;
    for (let id in GAME_DATABASE.bumbu) {
        let item = GAME_DATABASE.bumbu[id];
        let hBeli = item.hargaBeli || 200;
        let f = getFluktuasiItem(id, hBeli);
        
        html += `
            <div class="card">
                <div style="font-size:2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Harga: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>
                ${getInfoGrafikHarga(f.harga, hBeli)}
                <button onclick="bukaModalBeli('${id}', '${item.nama}', ${f.harga}, 'toko_bumbu')" style="background: #059669; margin-top: 10px;">Beli Bumbu</button>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderTukangKayu() {
    const container = document.getElementById("list-tukang-kayu");
    if (!container) return;
    container.innerHTML = "";
    let itemKayu = (GAME_DATABASE.material && GAME_DATABASE.material.kayu) || { id: "kayu", nama: "Kayu", icon: "🪵", hargaBeli: 100 };
    let f = getFluktuasiItem('kayu', itemKayu.hargaBeli);

    let durPisau = gameState.durasiPisau;
    let pisauPenuh = durPisau >= 300;
    let punyaPisau = (gameState.tas['pisau'] || 0) > 0;

    let durKompor = gameState.durasiKompor;
    let komporPenuh = durKompor >= 300;
    let punyaKompor = (gameState.tas['kompor'] || 0) > 0;

    let durPancingan = gameState.durasiPancingan;
    let pancinganPenuh = durPancingan >= 750;
    let punyaPancingan = (gameState.tas['pancingan'] || 0) > 0;

    container.innerHTML = `
        <div class="card">
            <div style="font-size:2.5rem;">${itemKayu.icon}</div>
            <h3>${itemKayu.nama}</h3>
            <p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>
            ${getInfoGrafikHarga(f.harga, itemKayu.hargaBeli)}
            <button onclick="bukaModalBeli('${itemKayu.id}', '${itemKayu.nama}', ${f.harga}, 'tukang_kayu')">Beli Kayu</button>
        </div>

        <div class="card" style="border: 1px solid #60a5fa;">
            <div style="font-size:2.5rem;">🔪</div>
            <h3>Asah Pisau Potong</h3>
            <p>Durability: <b>${durPisau}/300</b></p>
            <p>Biaya: <b>Rp. 17.000</b></p>
            <button onclick="asahPisau()" style="background:${(!punyaPisau || pisauPenuh) ? '#334155' : '#2563eb'}; margin-top: 10px; ${(!punyaPisau || pisauPenuh) ? 'cursor:not-allowed;' : ''}">
                ${!punyaPisau ? 'Belum Punya Pisau' : (pisauPenuh ? 'Pisau Masih Tajam' : 'Asah Pisau')}
            </button>
        </div>

        <div class="card" style="border: 1px solid #f59e0b;">
            <div style="font-size:2.5rem;">🍳</div>
            <h3>Servis Kompor Dapur</h3>
            <p>Durability: <b>${durKompor}/300</b></p>
            <p>Biaya: <b>Rp. 25.000</b></p>
            <button onclick="servisKompor()" style="background:${(!punyaKompor || komporPenuh) ? '#334155' : '#d97706'}; margin-top: 10px; ${(!punyaKompor || komporPenuh) ? 'cursor:not-allowed;' : ''}">
                ${!punyaKompor ? 'Belum Punya Kompor' : (komporPenuh ? 'Kompor Masih Bagus' : 'Servis Kompor')}
            </button>
        </div>

        <div class="card" style="border: 1px solid #10b981;">
            <div style="font-size:2.5rem;">🎣</div>
            <h3>Perbaiki Alat Pancing</h3>
            <p>Durability: <b>${durPancingan}/750</b></p>
            <p>Biaya: <b>Rp. 70.000</b></p>
            <button onclick="servisPancingan()" style="background:${(!punyaPancingan || pancinganPenuh) ? '#334155' : '#059669'}; margin-top: 10px; ${(!punyaPancingan || pancinganPenuh) ? 'cursor:not-allowed;' : ''}">
                ${!punyaPancingan ? 'Belum Punya Pancingan' : (pancinganPenuh ? 'Pancingan Masih Bagus' : 'Perbaiki Pancingan')}
            </button>
        </div>
    `;
}

function servisKompor() {
    if ((gameState.tas['kompor'] || 0) <= 0) {
        alert("⚠️ Kamu belum memiliki Kompor! Beli Kompor terlebih dahulu di Pasar.");
        return;
    }
    if (gameState.durasiKompor >= 300) {
        alert("⚠️ Kompor masih dalam kondisi prima!");
        return;
    }

    let biaya = (GAME_DATABASE.alat && GAME_DATABASE.alat.kompor && GAME_DATABASE.alat.kompor.biayaServis) || 25000;
    if (gameState.uang >= biaya) {
        gameState.uang -= biaya;
        gameState.durasiKompor = 300;
        updateHeaderUI();
        tampilkanPopupNotifikasi("🔥 Kompor Diperbaiki!", "Durability kompor berhasil dipulihkan menjadi 300x pakai.", "neon-green");
        renderTukangKayu();
    } else {
        alert("⚠️ Uang tidak cukup untuk servis kompor!");
    }
}

function servisPancingan() {
    if ((gameState.tas['pancingan'] || 0) <= 0) {
        alert("⚠️ Kamu belum memiliki Alat Pancing! Beli Alat Pancing terlebih dahulu di Pasar.");
        return;
    }
    if (gameState.durasiPancingan >= 750) {
        alert("⚠️ Alat pancing masih dalam kondisi prima!");
        return;
    }

    let biaya = (GAME_DATABASE.alat && GAME_DATABASE.alat.pancingan && GAME_DATABASE.alat.pancingan.biayaServis) || 70000;
    if (gameState.uang >= biaya) {
        gameState.uang -= biaya;
        gameState.durasiPancingan = 750;
        updateHeaderUI();
        tampilkanPopupNotifikasi("🎣 Pancingan Diperbaiki!", "Durability pancingan berhasil dipulihkan menjadi 750x pakai.", "neon-green");
        renderTukangKayu();
    } else {
        alert("⚠️ Uang tidak cukup untuk servis pancingan!");
    }
}

function renderPengepul() {
    const container = document.getElementById("list-pengepul");
    if (!container) return;
    container.innerHTML = "";
    let ada = false, html = "";

    let gabungan = { 
        ...GAME_DATABASE.hasilPanen, 
        ...GAME_DATABASE.ternakHasil, 
        ...GAME_DATABASE.jagalHasil,
        ...(GAME_DATABASE.ikan || {}),
        ...(GAME_DATABASE.masakan || {})
    };

    for (let id in gameState.tas) {
        let stok = gameState.tas[id];
        if (stok > 0 && gabungan[id]) {
            ada = true;
            let item = gabungan[id];
            let hJual = item.hargaJual || 50;
            let f = getFluktuasiItem(id, hJual);
            html += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${item.icon}</div>
                    <h3>${item.nama}</h3>
                    <p>Stok: <b>${stok} Pcs</b></p>
                    <p>Jual: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>
                    ${getInfoGrafikHarga(f.harga, hJual)}
                    <button onclick="bukaModalJual('${id}', '${item.nama}', ${f.harga}, ${stok})" style="background: #2563eb;">Jual</button>
                </div>
            `;
        }
    }
    container.innerHTML = ada ? html : `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Tidak ada barang untuk dijual.</p>`;
}

function renderWikipedia() {
    const container = document.getElementById("content-wikipedia");
    if (!container) return;

    let html = `<div class="neon-credit">Created By Bocah Newbie</div>`;
    html += `<h2>📚 Panduan & Ensiklopedia Harga Game</h2><table style="width:100%; border-collapse:collapse; margin-top:15px; background:var(--bg-card); border-radius:8px; overflow:hidden;">`;
    html += `<tr style="background:#1e293b; text-align:left;"><th style="padding:10px;">Item</th><th style="padding:10px;">Harga Beli (Normal)</th><th style="padding:10px;">Harga Jual (Normal)</th><th style="padding:10px;">Estimasi Min / Max</th></tr>`;

    let allItems = { 
        ...GAME_DATABASE.bibit, 
        ...GAME_DATABASE.hasilPanen, 
        ...GAME_DATABASE.ternak, 
        ...GAME_DATABASE.pakan, 
        ...GAME_DATABASE.ternakHasil, 
        ...GAME_DATABASE.jagalHasil, 
        ...GAME_DATABASE.alat, 
        ...GAME_DATABASE.material,
        ...(GAME_DATABASE.ikan || {}),
        ...(GAME_DATABASE.bumbu || {}),
        ...(GAME_DATABASE.masakan || {})
    };

    for (let id in allItems) {
        let item = allItems[id];
        let beli = item.hargaBeli ? `Rp. ${item.hargaBeli.toLocaleString('id-ID')}` : '-';
        let jual = item.hargaJual ? `Rp. ${item.hargaJual.toLocaleString('id-ID')}` : '-';
        let baseRef = item.hargaBeli || item.hargaJual || 0;
        let minP = Math.round(baseRef * 0.8);
        let maxP = Math.round(baseRef * 1.3);
        let estimasi = baseRef > 0 ? `Rp. ${minP.toLocaleString('id-ID')} - Rp. ${maxP.toLocaleString('id-ID')}` : '-';

        html += `<tr style="border-bottom:1px solid var(--border-color);">
            <td style="padding:10px;">${item.icon || '📦'} ${item.nama}</td>
            <td style="padding:10px;">${beli}</td>
            <td style="padding:10px;">${jual}</td>
            <td style="padding:10px; color:#34d399;">${estimasi}</td>
        </tr>`;
    }
    html += `</table>`;
    container.innerHTML = html;
}

// --- TAB DAPUR OLAHAN & SYSTEM MEMASAK ---
function renderDapur() {
    const container = document.getElementById("area-dapur");
    if (!container) return;
    container.innerHTML = "";

    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    let punyaKompor = (gameState.tas['kompor'] || 0) > 0;
    let durability = gameState.durasiKompor;

    let infoKomporHTML = `
        <div style="grid-column: 1/-1; background: var(--bg-card); padding: 15px; border-radius: 10px; margin-bottom: 15px; border:1px solid var(--border-color);">
            <h3>🍳 Status Peralatan Dapur</h3>
            ${!punyaKompor 
                ? `<p style="color:#f87171; font-weight:bold;">⚠️ Belum Memiliki Kompor! Beli Kompor di Pasar terlebih dahulu untuk memasak.</p>`
                : `<p>Durability Kompor: <b style="color: ${durability > 50 ? '#34d399' : '#f87171'}">${durability} / 300 x pakai</b></p>
                   ${durability <= 0 ? '<p style="color:#f87171; font-weight:bold;">Kompor Rusak! Servis di Tukang Kayu.</p>' : ''}`
            }
        </div>
    `;

    let html = infoKomporHTML + `<h3 style="color: #f59e0b; grid-column:1/-1;">🍳 Kompor Dapur (Proses Memasak)</h3>`;
    if (!gameState.prosesMasak) gameState.prosesMasak = [];

    if (gameState.prosesMasak.length === 0) {
        html += `<p style="grid-column:1/-1; color: var(--text-muted);">Tidak ada masakan yang sedang diolah.</p>`;
    } else {
        gameState.prosesMasak.forEach((masak, idx) => {
            let sisaWaktu = Math.max(0, masak.targetMenitSelesai - totalMenitSekarang);
            let resepInfo = GAME_DATABASE.resep[masak.idResep] || {};

            let tombolAksi = sisaWaktu === 0
                ? `<button onclick="ambilHasilMasakan(${idx})" style="background: #10b981; color:white;">Sajikan / Ambil (${masak.jumlah}x)</button>`
                : `<button disabled style="background: #334155; cursor: not-allowed;">Memasak... (${formatDurasiBersih(sisaWaktu)})</button>`;

            html += `
                <div class="card" style="border: 1px solid #f59e0b;">
                    <div style="font-size:2.5rem;">${resepInfo.icon || '🍲'}</div>
                    <h3>${resepInfo.nama}</h3>
                    <p style="font-size:0.85rem; color:#34d399;">⏱️ ${formatDurasiBersih(sisaWaktu)}</p>
                    ${tombolAksi}
                </div>
            `;
        });
    }

    html += `<h3 style="color: #3b82f6; grid-column:1/-1; margin-top:25px;">📖 Buku Resep Dapur</h3>`;
    
    for (let idResep in GAME_DATABASE.resep) {
        let resep = GAME_DATABASE.resep[idResep];
        let cukupBahan = true;
        let teksBahan = "";

        for (let idBahan in resep.bahan) {
            let butuh = resep.bahan[idBahan];
            let punya = gameState.tas[idBahan] || 0;
            
            let itemData = (GAME_DATABASE.bibit && GAME_DATABASE.bibit[idBahan]) || 
                             (GAME_DATABASE.hasilPanen && GAME_DATABASE.hasilPanen[idBahan]) || 
                             (GAME_DATABASE.ternakHasil && GAME_DATABASE.ternakHasil[idBahan]) || 
                             (GAME_DATABASE.jagalHasil && GAME_DATABASE.jagalHasil[idBahan]) || 
                             (GAME_DATABASE.bumbu && GAME_DATABASE.bumbu[idBahan]) || 
                             (GAME_DATABASE.ikan && GAME_DATABASE.ikan[idBahan]) || { nama: idBahan, icon: '📦' };

            let warnaStatus = punya >= butuh ? "#34d399" : "#f87171";
            if (punya < butuh) cukupBahan = false;

            teksBahan += `<span style="color:${warnaStatus}; font-size:0.8rem;">${itemData.icon} ${itemData.nama}: ${punya}/${butuh}</span><br>`;
        }

        let bisaMasak = punyaKompor && durability > 0 && cukupBahan;
        let teksTombol = !punyaKompor 
            ? 'Butuh Kompor' 
            : (durability <= 0 ? 'Kompor Rusak' : (cukupBahan ? '🍳 Masak Sekarang' : 'Bahan Belum Cukup'));

        html += `
            <div class="card" style="border: 1px solid ${bisaMasak ? '#10b981' : 'var(--border-color)'};">
                <div style="font-size:2.5rem;">${resep.icon}</div>
                <h3>${resep.nama}</h3>
                <p style="font-size:0.85rem; color:#fbbf24; margin-bottom:5px;">Harga Jual: <b>Rp. ${resep.hargaJual.toLocaleString('id-ID')}</b></p>
                <div style="background:#101622; padding:8px; border-radius:6px; text-align:left; margin:8px 0;">
                    <small style="color:var(--text-muted); font-weight:bold;">Bahan Dibutuhkan:</small><br>
                    ${teksBahan}
                </div>
                <button onclick="mulaiMemasak('${idResep}')" style="background:${bisaMasak ? '#059669' : '#334155'}; width:100%;" ${!bisaMasak ? 'disabled' : ''}>
                    ${teksTombol}
                </button>
            </div>
        `;
    }

    container.innerHTML = html;
}

function mulaiMemasak(idResep) {
    if ((gameState.tas['kompor'] || 0) <= 0) {
        alert("⚠️ Kamu belum memiliki Kompor! Beli Kompor di Pasar terlebih dahulu.");
        return;
    }
    if (gameState.durasiKompor <= 0) {
        alert("⚠️ Kompor kamu rusak (durability 0)! Silakan servis di Tukang Kayu.");
        return;
    }

    let resep = GAME_DATABASE.resep[idResep];
    if (!resep) return;

    for (let idBahan in resep.bahan) {
        let butuh = resep.bahan[idBahan];
        gameState.tas[idBahan] -= butuh;
        if (gameState.tas[idBahan] <= 0) delete gameState.tas[idBahan];
    }

    gameState.durasiKompor -= 1;

    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    
    if (!gameState.prosesMasak) gameState.prosesMasak = [];
    gameState.prosesMasak.push({
        idResep: idResep,
        jumlah: 1,
        targetMenitSelesai: totalMenitSekarang + resep.durasiMenit
    });

    tampilkanPopupNotifikasi("🍳 Mulai Memasak!", `${resep.nama} sedang dimasak. Durability kompor sisa ${gameState.durasiKompor}/300.`, "neon-amber");
    renderDapur();
    renderTas();
}

function ambilHasilMasakan(index) {
    let dataMasak = gameState.prosesMasak[index];
    let resepInfo = GAME_DATABASE.resep[dataMasak.idResep];

    gameState.tas[dataMasak.idResep] = (gameState.tas[dataMasak.idResep] || 0) + dataMasak.jumlah;
    gameState.prosesMasak.splice(index, 1);

    tampilkanPopupNotifikasi("🍽️ Masakan Matang!", `Kamu mendapatkan ${dataMasak.jumlah}x ${resepInfo.nama}!`, "neon-green");
    renderDapur();
    renderTas();
}

// --- SYSTEM MISI PAPAN PENGUMUMAN ---
function generasiMisiOtomatis() {
    if (gameState.misiPapan.length < 4) {
        let gabungan = {
            ...GAME_DATABASE.hasilPanen,
            ...GAME_DATABASE.ternakHasil,
            ...GAME_DATABASE.jagalHasil,
            ...(GAME_DATABASE.ikan || {}),
            ...(GAME_DATABASE.masakan || {})
        };
        let keys = Object.keys(gabungan);
        if (keys.length === 0) return;

        let idRandom = keys[Math.floor(Math.random() * keys.length)];
        let itemData = gabungan[idRandom];
        let jumlahTarget = Math.floor(Math.random() * 8) + 3;
        let durasiHari = Math.floor(Math.random() * 4) + 2;

        let baseHarga = itemData.hargaJual || 100;
        let bonusWaktu = (6 - durasiHari) * 0.2;
        let totalHadiah = Math.round((baseHarga * jumlahTarget) * (1.4 + bonusWaktu));

        let npc = DAFTAR_NAMA_NPC[Math.floor(Math.random() * DAFTAR_NAMA_NPC.length)];
        let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

        let misiBaru = {
            idMisi: `misi_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            npc: npc,
            idItem: idRandom,
            namaItem: itemData.nama,
            iconItem: itemData.icon || '📦',
            jumlahTarget: jumlahTarget,
            durasiHari: durasiHari,
            targetMenitSelesai: totalMenitSekarang + (durasiHari * 1440),
            hadiahUang: totalHadiah
        };

        gameState.misiPapan.push(misiBaru);
    }
}

function renderPapanMisi() {
    const container = document.getElementById("list-misi");
    if (!container) return;
    container.innerHTML = "";

    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

    gameState.misiAktif = gameState.misiAktif.filter(m => m.targetMenitSelesai > totalMenitSekarang);
    gameState.misiPapan = gameState.misiPapan.filter(m => m.targetMenitSelesai > totalMenitSekarang);

    let html = `<h3 style="color: #60a5fa; grid-column:1/-1;">📌 Misi Aktif Kamu</h3>`;
    if (gameState.misiAktif.length === 0) {
        html += `<p style="grid-column:1/-1; color: var(--text-muted);">Belum ada misi yang diambil.</p>`;
    } else {
        gameState.misiAktif.forEach((misi, idx) => {
            let sisaWaktu = Math.max(0, misi.targetMenitSelesai - totalMenitSekarang);
            let stokPemain = gameState.tas[misi.idItem] || 0;
            let cukup = stokPemain >= misi.jumlahTarget;

            html += `
                <div class="card" style="border: 1px solid ${cukup ? '#34d399' : '#f59e0b'};">
                    <h3>${misi.npc}</h3>
                    <p>${misi.iconItem} <b>${misi.namaItem}</b></p>
                    <p>Butuh: <b>${stokPemain} / ${misi.jumlahTarget} Pcs</b></p>
                    <p>Hadiah: <b style="color:#34d399;">Rp. ${misi.hadiahUang.toLocaleString('id-ID')}</b></p>
                    <p style="font-size:0.85rem; color:#f87171;">⏱️ Sisa Waktu: ${formatDurasiBersih(sisaWaktu)}</p>
                    <button onclick="serahkanMisi(${idx})" style="background:${cukup ? '#10b981' : '#334155'}; margin-top:5px;" ${!cukup ? 'disabled' : ''}>${cukup ? 'Kirim Pesanan' : 'Stok Belum Cukup'}</button>
                </div>
            `;
        });
    }

    html += `<h3 style="color: #fbbf24; grid-column:1/-1; margin-top:20px;">📜 Papan Pesanan Desa</h3>`;
    if (gameState.misiPapan.length === 0) {
        html += `<p style="grid-column:1/-1; color: var(--text-muted);">Papan pesanan sedang kosong...</p>`;
    } else {
        gameState.misiPapan.forEach((misi) => {
            let sisaWaktu = Math.max(0, misi.targetMenitSelesai - totalMenitSekarang);
            html += `
                <div class="card">
                    <h3>${misi.npc}</h3>
                    <p>${misi.iconItem} <b>${misi.namaItem}</b> (${misi.jumlahTarget} Pcs)</p>
                    <p>Hadiah: <b style="color:#34d399;">Rp. ${misi.hadiahUang.toLocaleString('id-ID')}</b></p>
                    <p style="font-size:0.85rem; color:#3b82f6;">⏱️ Tenggat: ${misi.durasiHari} Hari (${formatDurasiBersih(sisaWaktu)})</p>
                    <button onclick="ambilMisi('${misi.idMisi}')" style="background:#2563eb; margin-top:5px;">Ambil Misi</button>
                </div>
            `;
        });
    }

    container.innerHTML = html;
}

function ambilMisi(idMisi) {
    let index = gameState.misiPapan.findIndex(m => m.idMisi === idMisi);
    if (index !== -1) {
        let misi = gameState.misiPapan.splice(index, 1)[0];
        gameState.misiAktif.push(misi);
        tampilkanPopupNotifikasi("📜 Misi Diambil!", `Pesanan dari ${misi.npc} telah ditambahkan ke Misi Aktif.`, "neon-blue");
        renderPapanMisi();
    }
}

function serahkanMisi(indexMisi) {
    let misi = gameState.misiAktif[indexMisi];
    let stokPemain = gameState.tas[misi.idItem] || 0;

    if (stokPemain >= misi.jumlahTarget) {
        gameState.tas[misi.idItem] -= misi.jumlahTarget;
        if (gameState.tas[misi.idItem] <= 0) delete gameState.tas[misi.idItem];

        gameState.uang += misi.hadiahUang;
        gameState.misiAktif.splice(indexMisi, 1);

        updateHeaderUI();
        renderTas();
        renderPapanMisi();
        tampilkanPopupNotifikasi("🎉 Misi Selesai!", `Pesanan diserahkan! Kamu mendapat Rp. ${misi.hadiahUang.toLocaleString('id-ID')}`, "neon-green");
    } else {
        alert("⚠️ Stok barangmu belum mencukupi!");
    }
}

// --- TAB SUNGAI & MEMANCING ---
function renderSungai() {
    const container = document.getElementById("area-sungai");
    if (!container) return;

    let punyaPancingan = (gameState.tas['pancingan'] || 0) > 0;
    let durPancingan = gameState.durasiPancingan;

    if (gameState.mancingHari !== gameState.waktuHari) {
        gameState.mancingHari = gameState.waktuHari;
        gameState.mancingCount = 0;
    }

    container.innerHTML = `
        <div class="card" style="grid-column: 1/-1; text-align: center; padding: 30px;">
            <div style="font-size: 4rem; margin-bottom: 10px;">🌊</div>
            <h2>Area Memancing Desa</h2>
            <p style="color: var(--text-muted); margin-bottom: 10px;">Lemparkan pancingan untuk mendapatkan berbagai jenis ikan segar!</p>
            ${punyaPancingan 
                ? `<p style="color: #34d399; font-weight: bold; margin-bottom: 10px;">Durability Pancingan: ${durPancingan}/750</p>`
                : `<p style="color: #f87171; font-weight: bold; margin-bottom: 10px;">⚠️ Belum Memiliki Alat Pancing! Beli di Pasar seharga Rp 150.000.</p>`
            }
            ${durPancingan <= 0 ? '<p style="color:#f87171; font-weight:bold; margin-bottom:10px;">Pancingan Rusak! Perbaiki di Tukang Kayu.</p>' : ''}
            <button onclick="mulaiMancing()" style="background: ${(!punyaPancingan || durPancingan <= 0) ? '#334155' : '#2563eb'}; font-size: 1.1rem; padding: 12px 25px; cursor: pointer;" ${(!punyaPancingan || durPancingan <= 0) ? 'disabled' : ''}>🎣 Lempar Pancingan</button>
        </div>
    `;
}

function mulaiMancing() {
    if ((gameState.tas['pancingan'] || 0) <= 0) {
        alert("⚠️ Kamu belum memiliki Alat Pancing! Beli Alat Pancing di Pasar seharga Rp 150.000.");
        return;
    }
    if (gameState.durasiPancingan <= 0) {
        alert("⚠️ Alat pancing kamu rusak (durability 0)! Silakan perbaiki di Tukang Kayu.");
        return;
    }

    if (gameState.mancingHari !== gameState.waktuHari) {
        gameState.mancingHari = gameState.waktuHari;
        gameState.mancingCount = 0;
    }

    let tingkatBerhasil = Math.min(gameState.mancingCount, 30);
    let progresSebab = tingkatBerhasil / 30; 
    let lebarZona = Math.max(2.5, 30 - (27.5 * progresSebab));

    let maxPosisiAwal = Math.max(5, 95 - lebarZona);
    let minPosisi = Math.floor(Math.random() * (maxPosisiAwal - 5 + 1)) + 5;

    zonaHijau = {
        min: minPosisi,
        max: minPosisi + lebarZona
    };

    let modal = document.getElementById("modal-mancing");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-mancing";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-blue" style="text-align: center;">
                <h3>🎣 Memancing...</h3>
                <p id="info-kuota-mancing" style="color: #fbbf24; font-size:0.85rem; margin-bottom:5px;"></p>
                <p style="color: var(--text-muted); font-size:0.85rem; margin-bottom:15px;">Tekan TARIK saat jarum tepat di area HIJAU!</p>
                
                <div style="position: relative; width: 100%; height: 26px; background: #1e293b; border-radius: 13px; overflow: hidden; border: 2px solid var(--border-color); margin: 15px 0;">
                    <div id="zona-sukses" style="position: absolute; height: 100%; background: #10b981; opacity: 0.6; transition: all 0.3s ease;"></div>
                    <div id="jarum-mancing" style="position: absolute; left: 0%; width: 6px; height: 100%; background: #ef4444; border-radius: 3px;"></div>
                </div>

                <button onclick="tarikPancingan()" style="background: #059669; color: white; padding: 10px 20px; font-weight: bold; width: 100%; font-size:1.1rem; cursor:pointer;">🎣 TARIK!</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    let elZona = document.getElementById("zona-sukses");
    if (elZona) {
        elZona.style.left = `${zonaHijau.min}%`;
        elZona.style.width = `${zonaHijau.max - zonaHijau.min}%`;
    }

    let elKuota = document.getElementById("info-kuota-mancing");
    if (elKuota) {
        elKuota.innerHTML = `Durability Pancingan: ${gameState.durasiPancingan}/750<br><small style="color:#f87171;">Berhasil Hari Ini: ${gameState.mancingCount} Kali (Tingkat Kesulitan: ${tingkatBerhasil}/30 🔥)</small>`;
    }

    posisiBar = 0;
    arahBar = 1;
    modal.style.display = "flex";

    clearInterval(intervalMancing);
    intervalMancing = setInterval(() => {
        posisiBar += arahBar * 3.5; 
        if (posisiBar >= 96 || posisiBar <= 0) arahBar *= -1;
        
        let elJarum = document.getElementById("jarum-mancing");
        if (elJarum) elJarum.style.left = `${posisiBar}%`;
    }, 30);
}

function tarikPancingan() {
    clearInterval(intervalMancing);
    let modal = document.getElementById("modal-mancing");
    if (modal) modal.style.display = "none";

    gameState.durasiPancingan -= 1;

    if (posisiBar >= zonaHijau.min && posisiBar <= zonaHijau.max) {
        if (!GAME_DATABASE.ikan) {
            alert("⚠️ Database ikan belum terisi!");
            return;
        }

        gameState.mancingCount += 1;

        let roll = Math.floor(Math.random() * 100) + 1;
        let targetTingkat = "Mudah";

        if (roll <= 62) {
            targetTingkat = "Mudah";
        } else if (roll <= 89) {
            targetTingkat = "Sedang";
        } else if (roll <= 99) {
            targetTingkat = "Sulit";
        } else {
            targetTingkat = "Sangat Sulit";
        }

        let daftarIkanKategori = [];
        for (let key in GAME_DATABASE.ikan) {
            if (GAME_DATABASE.ikan[key].tingkatKesan === targetTingkat) {
                daftarIkanKategori.push(key);
            }
        }

        if (daftarIkanKategori.length === 0) {
            daftarIkanKategori = Object.keys(GAME_DATABASE.ikan);
        }

        let idIkanDapat = daftarIkanKategori[Math.floor(Math.random() * daftarIkanKategori.length)];
        let dataIkan = GAME_DATABASE.ikan[idIkanDapat];

        gameState.tas[idIkanDapat] = (gameState.tas[idIkanDapat] || 0) + 1;
        
        let warnaNotif = "neon-green";
        if (targetTingkat === "Mudah") warnaNotif = "neon-green";
        if (targetTingkat === "Sedang") warnaNotif = "neon-blue";
        if (targetTingkat === "Sulit") warnaNotif = "neon-amber";
        if (targetTingkat === "Sangat Sulit") warnaNotif = "neon-purple";

        tampilkanPopupNotifikasi(
            `🐟 STRIKE! (${dataIkan.tingkatKesan})`, 
            `Selamat! Kamu menangkap 1x ${dataIkan.icon || '🐟'} ${dataIkan.nama} (Durability: ${gameState.durasiPancingan}/750)`, 
            warnaNotif
        );

        renderTas();
    } else {
        tampilkanPopupNotifikasi("❌ Lepas!", `HA~ HA~ HA~, ikannya kabur! Coba lagi. (Durability: ${gameState.durasiPancingan}/750)`, "neon-amber");
    }
    renderSungai();
}

// --- MODAL & PEMBELIAN ---
function bukaModalBeliHewan(id, nama, harga) {
    transaksiAktif = { idItem: id, namaItem: nama, hargaSatuan: harga, tipe: 'hewan' };
    let modal = document.getElementById("modal-beli-hewan");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-beli-hewan";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-amber">
                <h3 id="modal-hewan-title">Beli Hewan Ternak</h3>
                <p id="modal-hewan-info" style="color: var(--text-muted);"></p>
                <p style="font-size: 0.85rem; color: #fbbf24; margin-top: 5px;">⚠️ Hewan akan langsung dimasukkan ke Kandang Kosong.</p>
                <p id="modal-hewan-total" style="font-weight:bold; color:#34d399; margin: 15px 0;"></p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalBeliHewan()">Kembali</button>
                    <button class="btn-confirm" onclick="konfirmasiBeliHewan()">Beli & Masukkan Kandang</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("modal-hewan-title").innerText = `Beli ${nama}`;
    document.getElementById("modal-hewan-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / ekor`;
    document.getElementById("modal-hewan-total").innerText = `Total: Rp. ${harga.toLocaleString('id-ID')}`;
    modal.style.display = "flex";
}

function tutupModalBeliHewan() { 
    let modal = document.getElementById("modal-beli-hewan");
    if (modal) modal.style.display = "none"; 
}

function konfirmasiBeliHewan() {
    let idHewan = transaksiAktif.idItem;
    let harga = transaksiAktif.hargaSatuan;

    let kandangKosongDitemukan = null;
    for (let i = 1; i <= gameState.jumlahKandangAktif; i++) {
        let kData = gameState.kandang[i];
        if (!kData || (kData.status === 'kosong')) {
            kandangKosongDitemukan = i;
            break;
        }
    }

    if (!kandangKosongDitemukan) {
        alert("⚠️ Gagal membeli! Semua kandang hewan ternak sudah penuh.");
        return;
    }

    if (gameState.uang >= harga) {
        gameState.uang -= harga;
        gameState.kandang[kandangKosongDitemukan] = {
            jenisHewan: idHewan,
            idTernak: null,
            targetMenitInGame: 0
        };

        updateHeaderUI();
        tutupModalBeliHewan();
        renderPasar();
        renderKandang();
        tampilkanPopupNotifikasi("🎉 Berhasil Membeli!", `${transaksiAktif.namaItem} telah ditempatkan di Kandang #${kandangKosongDitemukan}.`, "neon-green");
    } else {
        alert("⚠️ Uang tidak cukup!");
    }
}

function bukaModalBeli(id, nama, harga, tipe) {
    transaksiAktif = { idItem: id, namaItem: nama, hargaSatuan: harga, tipe: tipe };
    let modal = document.getElementById("modal-beli");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-beli";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-green">
                <h3 id="modal-title">Beli Item</h3>
                <p id="modal-info" style="color: var(--text-muted);"></p>
                <div class="modal-input-group">
                    <button onclick="ubahQtyBeli(-1)">-</button>
                    <input type="number" id="input-jumlah-beli" value="1" min="1" max="99" oninput="updateTotalBeli()">
                    <button onclick="ubahQtyBeli(1)">+</button>
                    <button class="btn-max-mod" onclick="setBeliMax()">MAX</button>
                </div>
                <p id="modal-total" style="font-weight:bold; color:#34d399;"></p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalBeli()">Kembali</button>
                    <button class="btn-confirm" onclick="konfirmasiBeli()">Beli</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("modal-title").innerText = `Beli ${nama}`;
    document.getElementById("modal-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / pcs`;
    document.getElementById("input-jumlah-beli").value = 1;
    updateTotalBeli();
    modal.style.display = "flex";
}

function tutupModalBeli() { 
    let modal = document.getElementById("modal-beli");
    if (modal) modal.style.display = "none"; 
}

function ubahQtyBeli(delta) {
    let input = document.getElementById("input-jumlah-beli");
    let val = parseInt(input.value || 1) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
    updateTotalBeli();
}

function setBeliMax() {
    let maxBisa = Math.floor(gameState.uang / (transaksiAktif.hargaSatuan || 1));
    if (maxBisa < 1) maxBisa = 1;
    if (maxBisa > 99) maxBisa = 99;
    document.getElementById("input-jumlah-beli").value = maxBisa;
    updateTotalBeli();
}

function updateTotalBeli() {
    let jml = parseInt(document.getElementById("input-jumlah-beli").value) || 1;
    document.getElementById("modal-total").innerText = `Total: Rp. ${(jml * transaksiAktif.hargaSatuan).toLocaleString('id-ID')}`;
}

function konfirmasiBeli() {
    let jml = parseInt(document.getElementById("input-jumlah-beli").value) || 1;
    let total = jml * transaksiAktif.hargaSatuan;

    if (GAME_DATABASE.alat && GAME_DATABASE.alat[transaksiAktif.idItem]) {
        if ((gameState.tas[transaksiAktif.idItem] || 0) > 0) {
            alert(`⚠️ Kamu sudah memiliki ${transaksiAktif.namaItem}!`);
            tutupModalBeli();
            return;
        }
        jml = 1; 
        total = transaksiAktif.hargaSatuan;
    }

    if (gameState.uang >= total) {
        gameState.uang -= total;
        gameState.tas[transaksiAktif.idItem] = (gameState.tas[transaksiAktif.idItem] || 0) + jml;
        updateHeaderUI();
        tutupModalBeli();
        renderTas();
        renderPasar();
    } else {
        alert("⚠️ Uang tidak cukup!");
    }
}

function bukaModalJual(id, nama, harga, stok) {
    transaksiAktif = { idItem: id, namaItem: nama, hargaSatuan: harga, stokMaks: stok };
    let modal = document.getElementById("modal-jual");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-jual";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card neon-blue">
                <h3 id="modal-jual-title">Jual Barang</h3>
                <p id="modal-jual-info" style="color: var(--text-muted);"></p>
                <div class="modal-input-group">
                    <button onclick="ubahQtyJual(-1)">-</button>
                    <input type="number" id="input-jumlah-jual" value="1" min="1" oninput="updateTotalJual()">
                    <button onclick="ubahQtyJual(1)">+</button>
                    <button class="btn-max-mod" onclick="setJualMax()">MAX</button>
                </div>
                <p id="modal-jual-total" style="font-weight:bold; color:#60a5fa;"></p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalJual()">Kembali</button>
                    <button class="btn-confirm" onclick="konfirmasiJual()">Jual</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    document.getElementById("modal-jual-title").innerText = `Jual ${nama}`;
    document.getElementById("modal-jual-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / pcs (Stok: ${stok})`;
    let inputJual = document.getElementById("input-jumlah-jual");
    inputJual.value = 1;
    inputJual.max = stok;
    updateTotalJual();
    modal.style.display = "flex";
}

function tutupModalJual() { 
    let modal = document.getElementById("modal-jual");
    if (modal) modal.style.display = "none"; 
}

function ubahQtyJual(delta) {
    let input = document.getElementById("input-jumlah-jual");
    let val = parseInt(input.value || 1) + delta;
    let maks = transaksiAktif.stokMaks;
    if (val < 1) val = 1;
    if (val > maks) val = maks;
    input.value = val;
    updateTotalJual();
}

function setJualMax() {
    document.getElementById("input-jumlah-jual").value = transaksiAktif.stokMaks;
    updateTotalJual();
}

function updateTotalJual() {
    let jml = parseInt(document.getElementById("input-jumlah-jual").value) || 1;
    let maks = transaksiAktif.stokMaks;
    if (jml > maks) document.getElementById("input-jumlah-jual").value = maks;
    document.getElementById("modal-jual-total").innerText = `Total Pendapatan: Rp. ${(Math.min(jml, maks) * transaksiAktif.hargaSatuan).toLocaleString('id-ID')}`;
}

function konfirmasiJual() {
    let jml = parseInt(document.getElementById("input-jumlah-jual").value) || 1;
    if (gameState.tas[transaksiAktif.idItem] >= jml) {
        gameState.tas[transaksiAktif.idItem] -= jml;
        if (gameState.tas[transaksiAktif.idItem] <= 0) delete gameState.tas[transaksiAktif.idItem];
        gameState.uang += jml * transaksiAktif.hargaSatuan;
        updateHeaderUI();
        tutupModalJual();
        renderPengepul();
        renderTas();
    } else {
        alert("⚠️ Stok tidak cukup!");
    }
}

function tampilkanPopupNotifikasi(judul, pesan, neonClass) {
    let modal = document.getElementById("modal-notifikasi-custom");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-notifikasi-custom";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card ${neonClass || 'neon-green'}">
                <h3 id="notif-judul"></h3>
                <p id="notif-pesan" style="color: var(--text-muted); margin: 15px 0;"></p>
                <button onclick="tutupPopupNotifikasi()" class="btn-confirm" style="width:100%;">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
    } else {
        modal.querySelector('.modal-card').className = `modal-card ${neonClass || 'neon-green'}`;
    }
    document.getElementById("notif-judul").innerText = judul;
    document.getElementById("notif-pesan").innerText = pesan;
    modal.style.display = "flex";
}

function tutupPopupNotifikasi() { 
    let modal = document.getElementById("modal-notifikasi-custom");
    if (modal) modal.style.display = "none"; 
}

function renderTas() {
    const container = document.getElementById("grid-tas");
    if (!container) return;
    container.innerHTML = "";
    let ada = false;
    let all = { 
        ...GAME_DATABASE.bibit, 
        ...GAME_DATABASE.hasilPanen, 
        ...GAME_DATABASE.ternak, 
        ...GAME_DATABASE.pakan, 
        ...GAME_DATABASE.ternakHasil, 
        ...GAME_DATABASE.jagalHasil, 
        ...GAME_DATABASE.alat, 
        ...GAME_DATABASE.material,
        ...(GAME_DATABASE.ikan || {}),
        ...(GAME_DATABASE.bumbu || {}),
        ...(GAME_DATABASE.masakan || {})
    };

    for (let id in gameState.tas) {
        let jml = gameState.tas[id];
        if (jml > 0) {
            ada = true;
            let item = all[id] || { nama: id, icon: "📦" };
            container.innerHTML += `<div class="card"><div style="font-size:2.5rem;">${item.icon || '📦'}</div><h3>${item.nama}</h3><p>Jumlah: <b>${jml} Pcs</b></p></div>`;
        }
    }
    if (!ada) container.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Tas kosong.</p>`;
}

// --- WAKTU IN-GAME ---
setInterval(() => {
    gameState.waktuMenit += 1;
    if (gameState.waktuMenit >= 60) {
        gameState.waktuMenit = 0;
        gameState.waktuJam += 1;
        if (gameState.waktuJam === 1) gameState.waktuJam = 6;
        if (gameState.waktuJam >= 24) {
            gameState.waktuJam = 0;
            gameState.waktuHari += 1;
            generasiMisiOtomatis();
        }
    }
    updateHeaderUI();

    let tabAktif = document.querySelector(".tab-content.active");
    if (tabAktif) {
        let idTab = tabAktif.id;
        if (idTab === 'tab-lahan') renderLahan();
        if (idTab === 'tab-kandang') renderKandang();
        if (idTab === 'tab-misi') renderPapanMisi();
        if (idTab === 'tab-dapur') renderDapur();
    }
}, 1500);

// --- STARTUP LOGIC ---
window.onload = function() {
    muatGame();
    resetHeaderNamaUI();

    if (gameState.misiPapan.length === 0) {
        generasiMisiOtomatis();
        generasiMisiOtomatis();
    }
    
    renderSemuaTabUtama();
};
