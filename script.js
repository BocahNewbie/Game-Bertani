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
    durasiPisau: 300
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

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
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
    if (namaBaru !== "") gameState.namaPemain = namaBaru;
    resetHeaderNamaUI();
}

function batalUbahNama() { resetHeaderNamaUI(); }

function resetHeaderNamaUI() {
    let container = document.querySelector(".player-info");
    let tombolSaveHTML = `<button onclick="simpanGame()" title="Simpan Progres" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; margin-left: 5px;">💾</button>`;
    container.innerHTML = `
        <span id="label-nama">${gameState.namaPemain}</span> 
        <button id="btn-edit-nama" onclick="ubahNama()" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">✏️</button>
        ${tombolSaveHTML}
    `;
}

function simpanGame() {
    localStorage.setItem("game_bertani_save_v2", JSON.stringify(gameState));
    tampilkanPopupNotifikasi("💾 Progres Disimpan!", "Data permainan baru berhasil disimpan (Save V2).", "neon-green");
}

function muatGame() {
    let savedData = localStorage.getItem("game_bertani_save_v2");
    if (savedData) {
        gameState = JSON.parse(savedData);
        if (gameState.durasiPisau === undefined) gameState.durasiPisau = 300;
        updateHeaderUI();
        refreshTabAktif('tab-lahan');
    }
}

function updateHeaderUI() {
    document.getElementById("stat-uang").innerText = `💰 Rp. ${gameState.uang.toLocaleString('id-ID')}`;
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
                    : `<button disabled style="background: #334155;">Dikerjakan... (${teksKonstruksi})</button>`;

                container.innerHTML += `
                    <div class="card lahan-card" style="border: 1px solid #3b82f6;">
                        <h3>Lahan #${i} ❌</h3>
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

function tutupModalKonfirmasi() { document.getElementById("modal-konfirmasi-bangun").style.display = "none"; }

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

function tutupModalTanam() { document.getElementById("modal-tanam").style.display = "none"; }

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
                        <h3>Kandang #${i} ❌</h3>
                        <p style="color: #60a5fa;">Sedang Dikerjakan</p>
                        <p style="font-size: 0.85rem;">Sisa: <b>${teksKonstruksi}</b></p>
                        ${tombolProses}
                    </div>
                `;
            } else if (!dataKandang.idTernak) {
                let ternakInfo = GAME_DATABASE.ternak[dataKandang.jenisHewan];
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
                let ternakInfo = GAME_DATABASE.ternak[dataKandang.idTernak];
                let hasilInfo = GAME_DATABASE.ternakHasil[ternakInfo.hasilId];
                let sisaWaktu = Math.max(0, dataKandang.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaWaktu);
                let tombolAksi = sisaWaktu === 0 
                    ? `<button onclick="panenTernak(${i})" style="background: #d97706; color:white;">Panen Hasil</button>`
                    : `<button disabled style="background: #334155;">Berproses... (${teksWaktu})</button>`;

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
        } else {
            let biaya = hitungBiayaUpgradeKandang(i);
            container.innerHTML += `
                <div class="card" style="opacity: 0.7; border: 1px dashed var(--border-color);">
                    <h3>Kandang #${i} 🔒</h3>
                    <p style="font-size: 0.8rem; color: #fbbf24;">🪵 ${biaya.kayu} Kayu<br>💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>⏱️ 5 Hari</p>
                    <button onclick="konfirmasiBukaKandang(${i})" style="background: #2563eb;">Buka Kandang</button>
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
        let info = GAME_DATABASE.ternak[jenis];
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
    let idHasilJagal = mapHasil[jenis];
    let hasilData = GAME_DATABASE.jagalHasil[idHasilJagal];

    gameState.tas[idHasilJagal] = (gameState.tas[idHasilJagal] || 0) + hasilData.jumlah;
    tampilkanPopupNotifikasi("🍖 Jagal Berhasil", `Mendapatkan ${hasilData.jumlah} ${hasilData.nama}! Durability pisau sisa ${gameState.durasiPisau}/300.`, "neon-green");
    renderJagal();
    renderTas();
}

function asahPisau() {
    let biaya = GAME_DATABASE.alat.pisau.biayaAsah;
    if (gameState.uang >= biaya) {
        gameState.uang -= biaya;
        gameState.durasiPisau = 300;
        updateHeaderUI();
        tampilkanPopupNotifikasi("✨ Pisau Tajam Kembali!", "Durability pisau berhasil dipulihkan menjadi 300x pakai.", "neon-green");
        renderTukangKayu();
    } else {
        alert("⚠️ Uang tidak cukup untuk mengasah pisau (Butuh Rp. 12.000)!");
    }
}


// --- TAB PASAR & TUKANG KAYU & WIKIPEDIA ---
function renderPasar() {
    const container = document.getElementById("list-pasar");
    if (!container) return;
    container.innerHTML = "";

    let html = `<h3 style="color: #fbbf24; grid-column:1/-1;">🐮 Hewan Ternak</h3>`;
    for (let id in GAME_DATABASE.ternak) {
        let item = GAME_DATABASE.ternak[id];
        let f = getFluktuasiItem(id, item.hargaBeli);
        // Menggunakan fungsi khusus beliHewanLangsung ke kandang
        html += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, item.hargaBeli)}<button onclick="bukaModalBeliHewan('${id}', '${item.nama}', ${f.harga})">Beli Hewan</button></div>`;
    }

    html += `<h3 style="color: #34d399; grid-column:1/-1; margin-top:20px;">🌾 Pakan Ternak</h3>`;
    for (let id in GAME_DATABASE.pakan) {
        let item = GAME_DATABASE.pakan[id];
        let f = getFluktuasiItem(id, item.hargaBeli);
        html += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, item.hargaBeli)}<button onclick="bukaModalBeli('${id}', '${item.nama}', ${f.harga}, 'pasar')">Beli Pakan</button></div>`;
    }

    let pisau = GAME_DATABASE.alat.pisau;
    html += `<h3 style="color: #60a5fa; grid-column:1/-1; margin-top:20px;">🔪 Peralatan</h3>`;
    html += `<div class="card"><div style="font-size:2.5rem;">${pisau.icon}</div><h3>${pisau.nama}</h3><p>Beli: <b>Rp. ${pisau.hargaBeli.toLocaleString('id-ID')}</b></p><button onclick="bukaModalBeli('${pisau.id}', '${pisau.nama}', ${pisau.hargaBeli}, 'pasar')">Beli Pisau</button></div>`;

    container.innerHTML = html;
}

function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    if (!container) return;
    container.innerHTML = "";
    for (let id in GAME_DATABASE.bibit) {
        let item = GAME_DATABASE.bibit[id];
        let f = getFluktuasiItem(id, item.hargaBeli);
        container.innerHTML += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Beli: <b>Rp. ${f.harga.toLocaleString('id-ID')}</b></p>${getInfoGrafikHarga(f.harga, item.hargaBeli)}<button onclick="bukaModalBeli('${id}', '${item.nama}', ${f.harga}, 'supermarket')">Beli Bibit</button></div>`;
    }
}

function renderTukangKayu() {
    const container = document.getElementById("list-tukang-kayu");
    if (!container) return;
    container.innerHTML = "";
    let itemKayu = GAME_DATABASE.material.kayu;
    let f = getFluktuasiItem('kayu', itemKayu.hargaBeli);

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
            <p>Biaya: <b>Rp. 12.000</b></p>
            <p style="font-size:0.85rem; color:var(--text-muted);">Memulihkan durasi pisau menjadi 300x pakai</p>
            <button onclick="asahPisau()" style="background:#2563eb;">Asah Pisau</button>
        </div>
    `;
}

function renderPengepul() {
    const container = document.getElementById("list-pengepul");
    if (!container) return;
    container.innerHTML = "";
    let ada = false, html = "";

    let gabungan = { ...GAME_DATABASE.hasilPanen, ...GAME_DATABASE.ternakHasil, ...GAME_DATABASE.jagalHasil };
    for (let id in gameState.tas) {
        let stok = gameState.tas[id];
        if (stok > 0 && gabungan[id]) {
            ada = true;
            let item = gabungan[id];
            let f = getFluktuasiItem(id, item.hargaJual);
            html += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${item.icon}</div>
                    <h3>${item.nama}</h3>
                    <p>Stok: <b>${stok} Pcs</b></p>
                    <p>Jual: <b>Rp. ${f.harga}</b></p>
                    ${getInfoGrafikHarga(f.harga, item.hargaJual)}
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

    let allItems = { ...GAME_DATABASE.bibit, ...GAME_DATABASE.hasilPanen, ...GAME_DATABASE.ternak, ...GAME_DATABASE.pakan, ...GAME_DATABASE.ternakHasil, ...GAME_DATABASE.jagalHasil, ...GAME_DATABASE.alat, ...GAME_DATABASE.material };
    for (let id in allItems) {
        let item = allItems[id];
        let beli = item.hargaBeli ? `Rp. ${item.hargaBeli.toLocaleString('id-ID')}` : '-';
        let jual = item.hargaJual ? `Rp. ${item.hargaJual.toLocaleString('id-ID')}` : '-';
        let baseRef = item.hargaBeli || item.hargaJual || 0;
        let minP = Math.round(baseRef * 0.8);
        let maxP = Math.round(baseRef * 1.3);
        let estimasi = baseRef > 0 ? `Rp. ${minP.toLocaleString('id-ID')} - Rp. ${maxP.toLocaleString('id-ID')}` : '-';

        html += `<tr style="border-bottom:1px solid var(--border-color);">
            <td style="padding:10px;">${item.icon} ${item.nama}</td>
            <td style="padding:10px;">${beli}</td>
            <td style="padding:10px;">${jual}</td>
            <td style="padding:10px; color:#34d399;">${estimasi}</td>
        </tr>`;
    }
    html += `</table>`;
    container.innerHTML = html;
}


// --- MODAL KHUSUS PEMBELIAN HEWAN LANGSUNG KE KANDANG ---
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

function tutupModalBeliHewan() { document.getElementById("modal-beli-hewan").style.display = "none"; }

function konfirmasiBeliHewan() {
    let idHewan = transaksiAktif.idItem;
    let harga = transaksiAktif.hargaSatuan;

    // Validasi Kandang Kosong
    let kandangKosongDitemukan = null;
    for (let i = 1; i <= gameState.jumlahKandangAktif; i++) {
        let kData = gameState.kandang[i];
        if (!kData || (kData.status === 'kosong')) {
            kandangKosongDitemukan = i;
            break;
        }
    }

    if (!kandangKosongDitemukan) {
        alert("⚠️ Gagal membeli! Semua kandang hewan ternak sudah penuh. Silakan buka kandang baru terlebih dahulu.");
        return;
    }

    if (gameState.uang >= harga) {
        gameState.uang -= harga;

        // Masukkan langsung ke kandang kosong (status butuh pakan)
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


// --- MODAL PEMBELIAN & PENJUALAN MODERN INTERAKTIF ---
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

function tutupModalBeli() { document.getElementById("modal-beli").style.display = "none"; }

function ubahQtyBeli(delta) {
    let input = document.getElementById("input-jumlah-beli");
    let val = parseInt(input.value || 1) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
    updateTotalBeli();
}

function setBeliMax() {
    let maxBisa = Math.floor(gameState.uang / transaksiAktif.hargaSatuan);
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
    if (gameState.uang >= total) {
        gameState.uang -= total;
        gameState.tas[transaksiAktif.idItem] = (gameState.tas[transaksiAktif.idItem] || 0) + jml;
        updateHeaderUI();
        tutupModalBeli();
        renderTas();
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

function tutupModalJual() { document.getElementById("modal-jual").style.display = "none"; }

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

function tutupPopupNotifikasi() { document.getElementById("modal-notifikasi-custom").style.display = "none"; }

function renderTas() {
    const container = document.getElementById("grid-tas");
    if (!container) return;
    container.innerHTML = "";
    let ada = false;
    let all = { ...GAME_DATABASE.bibit, ...GAME_DATABASE.hasilPanen, ...GAME_DATABASE.ternak, ...GAME_DATABASE.pakan, ...GAME_DATABASE.ternakHasil, ...GAME_DATABASE.jagalHasil, ...GAME_DATABASE.alat, ...GAME_DATABASE.material };

    for (let id in gameState.tas) {
        let jml = gameState.tas[id];
        if (jml > 0) {
            ada = true;
            let item = all[id] || { nama: id, icon: "📦" };
            container.innerHTML += `<div class="card"><div style="font-size:2.5rem;">${item.icon}</div><h3>${item.nama}</h3><p>Jumlah: <b>${jml} Pcs</b></p></div>`;
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
        }
    }
    updateHeaderUI();

    let blokMenit = Math.floor(gameState.waktuMenit / 10);
    if (lastMenitFluktuasi !== blokMenit) {
        lastMenitFluktuasi = blokMenit;
        if (document.getElementById("tab-supermarket").classList.contains("active")) renderSupermarket();
        if (document.getElementById("tab-pasar").classList.contains("active")) renderPasar();
        if (document.getElementById("tab-pengepul").classList.contains("active")) renderPengepul();
        if (document.getElementById("tab-tukang-kayu").classList.contains("active")) renderTukangKayu();
    }

    if (document.getElementById("tab-lahan").classList.contains("active")) renderLahan();
    if (document.getElementById("tab-kandang").classList.contains("active")) renderKandang();
}, 1500);

window.onload = function() {
    resetHeaderNamaUI();
    muatGame();
    refreshTabAktif('tab-lahan');
};
