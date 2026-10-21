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
    misiAktif: {},
    misiPapan: []
};

let transaksiAktif = { idItem: "", namaItem: "", hargaSatuan: 0, stokMaks: 0, tipe: "" };
let targetKonfirmasi = { jenis: "", nomor: 0, biayaKayu: 0, biayaUang: 0 };
let lahanTargetAktif = null;
let kandangTargetAktif = null;
let fluktuasiCache = {};
let lastMenitFluktuasi = -1;

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
    
    let targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add("active");
    if (evt && evt.currentTarget) evt.currentTarget.classList.add("active");
    
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
    if (tabId === 'tab-memancing') renderMemancing();
    if (tabId === 'tab-misi') renderPapanMisi();
}

function ubahNama() {
    let container = document.querySelector(".player-info");
    if (!container) return;
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
    if (namaBaru !== "") gameState.namaPemain = namaBaru;
    resetHeaderNamaUI();
}

function batalUbahNama() { resetHeaderNamaUI(); }

function resetHeaderNamaUI() {
    let container = document.querySelector(".player-info");
    if (!container) return;
    let tombolSaveHTML = `<button onclick="simpanGame()" title="Simpan Progres" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; margin-left: 5px;">💾</button>`;
    container.innerHTML = `
        <span id="label-nama">${gameState.namaPemain}</span>
        <button id="btn-edit-nama" onclick="ubahNama()" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">✏️</button>
        ${tombolSaveHTML}
    `;
}

function simpanGame() {
    localStorage.setItem("game_bertani_save_v2", JSON.stringify(gameState));
    tampilkanPopupNotifikasi("💾 Progres Disimpan!", "Data permainan berhasil disimpan.", "neon-green");
}

function muatGame() {
    let savedData = localStorage.getItem("game_bertani_save_v2");
    if (savedData) {
        gameState = JSON.parse(savedData);
        if (gameState.durasiPisau === undefined) gameState.durasiPisau = 300;
        if (!gameState.misiAktif) gameState.misiAktif = {};
        if (!gameState.misiPapan) gameState.misiPapan = [];
        updateHeaderUI();
        refreshTabAktif('tab-lahan');
    }
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
    if (totalMenit <= 0) return "Siap Panen! ✨";
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
        if (i <= gameState.jumlahLahanAktif) {
            let dataLahan = gameState.lahan[i];
            if (!dataLahan) {
                container.innerHTML += `
                    <div class="card lahan-card">
                        <h3>Lahan #${i}</h3>
                        <p style="color: var(--text-muted);">🌿 Kosong</p>
                        <button onclick="bukaModalTanam(${i})">Tanam Bibit</button>
                    </div>
                `;
            } else if (dataLahan.status === 'dibangun') {
                let sisaKonstruksi = Math.max(0, dataLahan.targetMenitSelesai - totalMenitSekarang);
                let teksKonstruksi = formatDurasiBersih(sisaKonstruksi);
                let tombolProses = sisaKonstruksi === 0 
                    ? `<button onclick="selesaikanPembangunanLahan(${i})" style="background: #10b981; color:white;">Ambil Selesai</button>` 
                    : `<button disabled style="background: #334155; cursor: not-allowed; opacity: 0.7;">⏳ Sedang Dibuka... (${teksKonstruksi})</button>`;
                
                container.innerHTML += `
                    <div class="card lahan-card" style="border: 1px solid #3b82f6;">
                        <h3>Lahan #${i} ⏳</h3>
                        <p style="color: #60a5fa;">Sedang Dikerjakan</p>
                        <p style="font-size: 0.85rem;">Sisa: <b>${teksKonstruksi}</b></p>
                        ${tombolProses}
                    </div>
                `;
            } else {
                let bibitInfo = GAME_DATABASE.bibit[dataLahan.idBibit] || {};
                let hasilInfo = GAME_DATABASE.hasilPanen[bibitInfo.hasilId] || { nama: "Tanaman", icon: "🌱" };
                let sisaWaktu = Math.max(0, dataLahan.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaWaktu);
                let tombolAksi = sisaWaktu === 0 
                    ? `<button onclick="panenHasil(${i})" style="background: #d97706; color:white;">Panen (${dataLahan.jumlah})</button>` 
                    : `<button disabled style="background: #334155;">Tumbuh... (${teksWaktu})</button>`;
                
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
        } else {
            let biaya = hitungBiayaUpgradeLahan(i);
            container.innerHTML += `
                <div class="card lahan-card" style="opacity: 0.7; border: 1px dashed var(--border-color);">
                    <h3>Lahan #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #fbbf24;">🪵 ${biaya.kayu} Kayu<br>💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 2 Hari</p>
                    <button onclick="konfirmasiBukaLahan(${i})" style="background: #2563eb;">Buka Lahan</button>
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
            if (nomor > gameState.jumlahLahanAktif) {
                gameState.jumlahLahanAktif = nomor;
            }
            gameState.lahan[nomor] = { 
                status: 'dibangun', 
                targetMenitSelesai: totalMenitSekarang + (durasiHari * 1440) 
            };
            renderLahan();
        } else {
            if (nomor > gameState.jumlahKandangAktif) {
                gameState.jumlahKandangAktif = nomor;
            }
            gameState.kandang[nomor] = { 
                status: 'dibangun', 
                targetMenitSelesai: totalMenitSekarang + (durasiHari * 1440) 
            };
            renderKandang();
        }
        updateHeaderUI();
        tampilkanPopupNotifikasi("🏗️ Konstruksi Dimulai!", `Pembangunan sedang dikerjakan (${durasiHari} Hari).`, "neon-blue");
        if (typeof renderTas === 'function') renderTas();
    } else {
        alert("⚠️ Sumber daya tidak cukup!");
    }
}

function selesaikanPembangunanLahan(nomorLahan) {
    if (gameState.lahan[nomorLahan]) {
        delete gameState.lahan[nomorLahan].status;
        delete gameState.lahan[nomorLahan].targetMenitSelesai;
    }
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
    let durasiMenit = Math.ceil(GAME_DATABASE.bibit[idBibit].durasi / 60);
    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    gameState.lahan[lahanTargetAktif] = {
        idBibit: idBibit,
        jumlah: jumlahTanam,
        targetMenitInGame: totalMenitSekarang + durasiMenit
    };
    tutupModalTanam();
    renderLahan();
    if (typeof renderTas === 'function') renderTas();
}

function panenHasil(nomorLahan) {
    let dataLahan = gameState.lahan[nomorLahan];
    let idHasil = GAME_DATABASE.bibit[dataLahan.idBibit].hasilId;
    gameState.tas[idHasil] = (gameState.tas[idHasil] || 0) + dataLahan.jumlah;
    delete gameState.lahan[nomorLahan];
    renderLahan();
    if (typeof renderTas === 'function') renderTas();
}

// --- TAB KANDANG --- 
function renderKandang() {
    const container = document.getElementById("grid-kandang");
    if (!container) return;
    container.innerHTML = "";
    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    for (let i = 1; i <= 35; i++) {
        if (i <= gameState.jumlahKandangAktif) {
            let dataKandang = gameState.kandang[i];
            if (!dataKandang) {
                container.innerHTML += `
                    <div class="card">
                        <h3>Kandang #${i}</h3>
                        <p style="color: var(--text-muted);">🏡 Kosong</p>
                    </div>
                `;
            } else if (dataKandang.status === 'dibangun') {
                let sisaKonstruksi = Math.max(0, dataKandang.targetMenitSelesai - totalMenitSekarang);
                let teksKonstruksi = formatDurasiBersih(sisaKonstruksi);
                let tombolProses = sisaKonstruksi === 0 
                    ? `<button onclick="selesaikanPembangunanKandang(${i})" style="background: #10b981; color:white;">Ambil Selesai</button>` 
                    : `<button disabled style="background: #334155;">Dikerjakan... (${teksKonstruksi})</button>`;
                
                container.innerHTML += `
                    <div class="card" style="border: 1px solid #3b82f6;">
                        <h3>Kandang #${i} ⏳</h3>
                        <p style="color: #60a5fa;">Sedang Dikerjakan</p>
                        <p style="font-size: 0.85rem;">Sisa: <b>${teksKonstruksi}</b></p>
                        ${tombolProses}
                    </div>
                `;
            }
        }
    }
}

function selesaikanPembangunanKandang(nomorKandang) {
    if (gameState.kandang[nomorKandang]) {
        delete gameState.kandang[nomorKandang].status;
        delete gameState.kandang[nomorKandang].targetMenitSelesai;
    }
    tampilkanPopupNotifikasi("✨ Selesai!", `Kandang #${nomorKandang} siap digunakan.`, "neon-green");
    renderKandang();
}

// --- TAB MEMANCING ---
function renderMemancing() {
    let container = document.getElementById("tab-memancing");
    if (!container) return;
    container.innerHTML = `
        <div class="card" style="text-align: center; max-width: 400px; margin: 20px auto; border: 1px solid #3b82f6;">
            <h3>🎣 Kolam Pancing Desa</h3>
            <p style="color: var(--text-muted);">Uji kesabaranmu untuk mendapatkan ikan segar!</p>
            <div id="area-pancing" style="font-size: 4rem; margin: 20px 0;">🌊</div>
            <button onclick="mulaiMemancing()" id="btn-lempar-pancing" style="background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; border:none; cursor:pointer;">Lempar Pancing</button>
        </div>
    `;
}

function mulaiMemancing() {
    let area = document.getElementById("area-pancing");
    let btn = document.getElementById("btn-lempar-pancing");
    if (!area || !btn) return;
    
    area.innerHTML = "🎣 Menunggu ikan menyambar...";
    btn.disabled = true;
    btn.style.opacity = "0.5";

    let waktuTunggu = Math.floor(Math.random() * 2000) + 2000;
    setTimeout(() => {
        area.innerHTML = "❗ Ada Ikan Menyambar! CEPAT KLIK!";
        btn.innerText = "TARIK SEKARANG!";
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.background = "#dc2626";
        btn.onclick = () => suksesTarikIkan();

        window.timeoutGagalPancing = setTimeout(() => {
            area.innerHTML = "💨 Ikan lepas dan kabur!";
            btn.innerText = "Lempar Pancing";
            btn.style.background = "#2563eb";
            btn.onclick = () => mulaiMemancing();
        }, 3000);
    }, waktuTunggu);
}

function suksesTarikIkan() {
    clearTimeout(window.timeoutGagalPancing);
    let listIkan = GAME_DATABASE.hasilPanen ? Object.keys(GAME_DATABASE.hasilPanen) : ['kayu'];
    let hasilId = listIkan[Math.floor(Math.random() * listIkan.length)];
    let itemInfo = GAME_DATABASE.hasilPanen[hasilId] || { nama: "Tangkapan", icon: "🐟" };

    gameState.tas[hasilId] = (gameState.tas[hasilId] || 0) + 1;

    let area = document.getElementById("area-pancing");
    let btn = document.getElementById("btn-lempar-pancing");
    if (area && btn) {
        area.innerHTML = `🎉 Berhasil Dapat ${itemInfo.icon || '🐟'} <b>${itemInfo.nama || 'Item'}</b>!`;
        btn.innerText = "Lempar Pancing";
        btn.style.background = "#2563eb";
        btn.onclick = () => mulaiMemancing();
    }
    if (typeof renderTas === 'function') renderTas();
    tampilkanPopupNotifikasi("🎣 Tangkapan Baru!", `Mendapatkan ${itemInfo.nama}`, "neon-green");
}

// --- SISTEM PAPAN MISI (RANDOM & BERBATAS WAKTU) ---
function generateMisiRandom() {
    if (gameState.misiPapan.length > 0) return; // Misi sudah ada
    
    let daftarItemKey = GAME_DATABASE.hasilPanen ? Object.keys(GAME_DATABASE.hasilPanen) : [];
    if (daftarItemKey.length === 0) return;

    for (let i = 1; i <= 3; i++) {
        let randomKey = daftarItemKey[Math.floor(Math.random() * daftarItemKey.length)];
        let infoItem = GAME_DATABASE.hasilPanen[randomKey];
        let jumlahTarget = Math.floor(Math.random() * 5) + 3; // Target 3 - 7 pcs
        let hadiahUang = jumlahTarget * 250;

        gameState.misiPapan.push({
            id: `misi_auto_${i}_${gameState.waktuHari}`,
            judul: `Permintaan ${infoItem.nama}`,
            deskripsi: `Kirimkan ${jumlahTarget} ${infoItem.icon} ${infoItem.nama} sebelum batas waktu habis!`,
            syarat: { item: randomKey, jumlah: jumlahTarget },
            hadiah: { uang: hadiahUang },
            targetHariSelesai: gameState.waktuHari + 2 // Batas 2 hari in-game
        });
    }
}

function renderPapanMisi() {
    let container = document.getElementById("container-misi") || document.getElementById("tab-misi");
    if (!container) return;

    generateMisiRandom();
    container.innerHTML = "<h3>📜 Papan Misi Desa</h3><p style='color:var(--text-muted); font-size:0.9rem;'>Selesaikan pesanan warga sebelum waktunya habis!</p>";

    if (gameState.misiPapan.length === 0) {
        container.innerHTML += "<p>Tidak ada misi saat ini.</p>";
        return;
    }

    gameState.misiPapan.forEach((misi, index) => {
        let statusAktif = gameState.misiAktif[misi.id];
        let tombolAksi = "";
        let infoWaktu = `<p style="color: #fbbf24; font-size:0.85rem;">⏳ Tenggat: ${misi.targetHariSelesai - gameState.waktuHari} Hari lagi</p>`;

        if (!statusAktif) {
            tombolAksi = `<button onclick="ambilMisiPapan('${misi.id}')" style="background: #2563eb; color:white; padding:6px 12px; border-radius:6px; border:none; cursor:pointer;">Ambil Misi</button>`;
        } else if (statusAktif.status === 'berjalan') {
            let punyaItem = gameState.tas[misi.syarat.item] || 0;
            if (punyaItem >= misi.syarat.jumlah) {
                tombolAksi = `<button onclick="klaimHadiahMisiPapan('${misi.id}')" style="background: #10b981; color:white; padding:6px 12px; border-radius:6px; border:none; cursor:pointer;">Klaim Hadiah 🎁</button>`;
            } else {
                tombolAksi = `<p style="font-size:0.85rem;">Progres: ${punyaItem}/${misi.syarat.jumlah}</p><button disabled style="background: #334155; padding:6px 12px; border-radius:6px; border:none;">Belum Cukup</button>`;
            }
        }

        container.innerHTML += `
            <div class="card" style="margin-bottom: 10px; border: 1px solid var(--border-color); padding: 12px; border-radius: 8px;">
                <h4>${misi.judul}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted);">${misi.deskripsi}</p>
                <p style="font-size: 0.85rem; color: #34d399;">Hadiah: Rp ${misi.hadiah.uang.toLocaleString('id-ID')}</p>
                ${infoWaktu}
                <div style="margin-top: 8px;">${tombolAksi}</div>
            </div>
        `;
    });
}

function ambilMisiPapan(idMisi) {
    let misi = gameState.misiPapan.find(m => m.id === idMisi);
    if (!misi) return;

    gameState.misiAktif[idMisi] = { status: 'berjalan' };
    tampilkanPopupNotifikasi("📜 Misi Diterima!", misi.judul, "neon-blue");
    renderPapanMisi();
}

function klaimHadiahMisiPapan(idMisi) {
    let misi = gameState.misiPapan.find(m => m.id === idMisi);
    if (!misi) return;

    let stokPunya = gameState.tas[misi.syarat.item] || 0;
    if (stokPunya >= misi.syarat.jumlah) {
        gameState.tas[misi.syarat.item] -= misi.syarat.jumlah;
        if (gameState.tas[misi.syarat.item] <= 0) delete gameState.tas[misi.syarat.item];

        gameState.uang += misi.hadiah.uang;
        
        // Hapus dari papan dan misi aktif
        gameState.misiPapan = gameState.misiPapan.filter(m => m.id !== idMisi);
        delete gameState.misiAktif[idMisi];

        tampilkanPopupNotifikasi("🎁 Misi Selesai!", `Hadiah Rp ${misi.hadiah.uang.toLocaleString('id-ID')} diterima!`, "neon-green");
        updateHeaderUI();
        renderPapanMisi();
        if (typeof renderTas === 'function') renderTas();
    }
}

function tampilkanPopupNotifikasi(judul, pesan, warna) {
    let popup = document.createElement("div");
    popup.className = `popup-notif ${warna}`;
    popup.innerHTML = `<strong>${judul}</strong><p>${pesan}</p>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}
