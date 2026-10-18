// State Utama Game
let gameState = {
    namaPemain: "Pak Tani",
    uang: 500000, // Ditingkatkan sedikit untuk modal tes kandang/lahan
    waktuHari: 1, 
    waktuJam: 8, 
    waktuMenit: 0,
    jumlahLahanAktif: 1, 
    jumlahKandangAktif: 1,
    tas: {},    
    lahan: {},   
    kandang: {}   
};

let transaksiAktif = {
    idItem: "",
    namaItem: "",
    hargaSatuan: 0,
    tipe: "" 
};

let targetKonfirmasi = { jenis: "", nomor: 0, biayaKayu: 0, biayaUang: 0 };
let lahanTargetAktif = null;
let kandangTargetAktif = null;
let fluktuasiCache = {}; 
let lastMenitFluktuasi = -1; 

function getFluktuasiItem(idItem) {
    let kunciWaktu = `${gameState.waktuHari}-${gameState.waktuJam}-${Math.floor(gameState.waktuMenit / 10)}`;
    if (!fluktuasiCache[idItem] || fluktuasiCache[idItem].waktu !== kunciWaktu) {
        let persen = Math.floor(Math.random() * 51) - 20; 
        fluktuasiCache[idItem] = { persen: persen, waktu: kunciWaktu };
    }
    return fluktuasiCache[idItem].persen;
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
    if (tabId === 'tab-lahan') renderLahan();
    if (tabId === 'tab-kandang') renderKandang();
    if (tabId === 'tab-pengepul') renderPengepul();
    if (tabId === 'tab-tukang-kayu') renderTukangKayu();
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

function batalUbahNama() {
    resetHeaderNamaUI();
}

function resetHeaderNamaUI() {
    let container = document.querySelector(".player-info");
    container.innerHTML = `
        <span id="label-nama">${gameState.namaPemain}</span> 
        <button id="btn-edit-nama" onclick="ubahNama()" style="background: transparent; border: none; cursor: pointer; font-size: 1rem;">✏️</button>
    `;
}

function updateHeaderUI() {
    document.getElementById("stat-uang").innerText = `💰 Rp. ${gameState.uang.toLocaleString('id-ID')}`;
    let jamFormatted = String(gameState.waktuJam).padStart(2, '0');
    let menitFormatted = String(gameState.waktuMenit).padStart(2, '0');
    let elWaktu = document.getElementById("stat-waktu");
    if (elWaktu) elWaktu.innerText = `📅 Hari ${gameState.waktuHari} ⏰ ${jamFormatted}:${menitFormatted}`;
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


// --- TAB LAHAN (MAKSIMAL 35 BIBIT, COOLDOWN 2 HARI) ---

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
                let sisaMenitKonstruksi = Math.max(0, dataLahan.targetMenitSelesai - totalMenitSekarang);
                let teksKonstruksi = formatDurasiBersih(sisaMenitKonstruksi);
                let tombolProses = sisaMenitKonstruksi === 0
                    ? `<button onclick="selesaikanPembangunanLahan(${i})" style="background: #10b981; color:white;">Ambil Lahan Selesai</button>`
                    : `<button disabled style="background: #334155; color: var(--text-muted);">Pembangunan... (${teksKonstruksi})</button>`;

                container.innerHTML += `
                    <div class="card lahan-card" style="border: 1px solid #3b82f6; background: #151f2c;">
                        <h3>Lahan #${i} 🏗️</h3>
                        <p style="color: #60a5fa; font-size: 0.9rem;">Sedang Dibangun</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Sisa: <b>${teksWaktu}</b></p>
                        ${tombolProses}
                    </div>
                `;
            } else {
                let bibitInfo = GAME_DATABASE.bibit[dataLahan.idBibit] || {};
                let hasilInfo = GAME_DATABASE.hasilPanen[bibitInfo.hasilId] || { nama: "Tanaman", icon: "🌱" };
                let sisaMenitInGame = Math.max(0, dataLahan.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaMenitInGame);

                let tombolAksi = sisaMenitInGame === 0 
                    ? `<button onclick="panenHasil(${i})" style="background: #d97706; color:white;">Panen (${dataLahan.jumlah})</button>`
                    : `<button disabled style="background: #334155; color: var(--text-muted); cursor: not-allowed;">Tumbuh... (${teksWaktu})</button>`;

                container.innerHTML += `
                    <div class="card lahan-card" style="border: 1px solid rgba(16, 185, 129, 0.4); background: #151f2c;">
                        <h3>Lahan #${i}</h3>
                        <div style="font-size: 2.5rem; margin: 5px 0;">${hasilInfo.icon}</div>
                        <p><b>${hasilInfo.nama}</b></p>
                        <p>Jumlah: <b>${dataLahan.jumlah} Pcs</b></p>
                        <p style="font-size: 0.85rem; color: #34d399; font-weight: bold;">⏱️ ${teksWaktu}</p>
                        ${tombolAksi}
                    </div>
                `;
            }
        } else {
            let biayaUpgrade = hitungBiayaUpgradeLahan(i);
            container.innerHTML += `
                <div class="card lahan-card" style="opacity: 0.7; background: #0f141d; border: 1px dashed var(--border-color);">
                    <h3>Lahan #${i} 🔒</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 10px 0;">Terkunci</p>
                    <p style="font-size: 0.8rem; color: #fbbf24;">Syarat:<br>🪵 ${biayaUpgrade.kayu} Kayu<br>💰 Rp. ${biayaUpgrade.uang.toLocaleString('id-ID')}<br>⏱️ 2 Hari</p>
                    <button onclick="konfirmasiBukaLahan(${i})" style="background: #2563eb; margin-top:10px;">Buka Lahan</button>
                </div>
            `;
        }
    }
}

function hitungBiayaUpgradeLahan(targetLahan) {
    let kayu = 25;
    let uang = 500;
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

    let modalKonf = document.getElementById("modal-konfirmasi-bangun");
    if (!modalKonf) {
        modalKonf = document.createElement("div");
        modalKonf.id = "modal-konfirmasi-bangun";
        modalKonf.className = "modal-overlay";
        modalKonf.innerHTML = `
            <div class="modal-card">
                <h3 id="konf- judul">Konfirmasi Pembangunan</h3>
                <p id="konf-teks" style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;"></p>
                <div class="modal-actions" style="margin-top: 25px;">
                    <button class="btn-cancel" onclick="tutupModalKonfirmasi()">Batal</button>
                    <button class="btn-confirm" onclick="eksekusiBukaBangunan()">Bangun Sekarang</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalKonf);
    }

    document.getElementById("konf-teks").innerHTML = `Ingin membuka <b>Lahan #${nomorLahan}</b>?<br>Biaya: 🪵 ${biaya.kayu} Kayu & 💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>Waktu Pembangunan: ⏱️ 2 Hari In-Game.`;
    modalKonf.style.display = "flex";
}

function tutupModalKonfirmasi() {
    let modal = document.getElementById("modal-konfirmasi-bangun");
    if (modal) modal.style.display = "none";
}

function eksekusiBukaBangunan() {
    tutupModalKonfirmasi();
    if (targetKonfirmasi.jenis === 'lahan') {
        let nomorLahan = targetKonfirmasi.nomor;
        let biayaKayu = targetKonfirmasi.biayaKayu;
        let biayaUang = targetKonfirmasi.biayaUang;
        let stokKayuTas = gameState.tas['kayu'] || 0;

        if (stokKayuTas >= biayaKayu && gameState.uang >= biayaUang) {
            gameState.tas['kayu'] -= biayaKayu;
            if (gameState.tas['kayu'] <= 0) delete gameState.tas['kayu'];
            gameState.uang -= biayaUang;

            let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
            let targetMenitSelesai = totalMenitSekarang + (2 * 1440); // 2 Hari = 2880 menit

            gameState.lahan[nomorLahan] = {
                status: 'dibangun',
                targetMenitSelesai: targetMenitSelesai
            };

            updateHeaderUI();
            tampilkanPopupNotifikasi(`🏗️ Konstruksi Dimulai!`, `Pembangunan Lahan #${nomorLahan} sedang berlangsung (2 Hari In-Game).`);
            renderLahan();
            renderTas();
        } else {
            alert("⚠️ Sumber daya tidak cukup untuk membangun lahan ini!");
        }
    } else if (targetKonfirmasi.jenis === 'kandang') {
        let nomorKandang = targetKonfirmasi.nomor;
        let biayaKayu = targetKonfirmasi.biayaKayu;
        let biayaUang = targetKonfirmasi.biayaUang;
        let stokKayuTas = gameState.tas['kayu'] || 0;

        if (stokKayuTas >= biayaKayu && gameState.uang >= biayaUang) {
            gameState.tas['kayu'] -= biayaKayu;
            if (gameState.tas['kayu'] <= 0) delete gameState.tas['kayu'];
            gameState.uang -= biayaUang;

            let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
            let targetMenitSelesai = totalMenitSekarang + (5 * 1440); // 5 Hari = 7200 menit

            gameState.kandang[nomorKandang] = {
                status: 'dibangun',
                targetMenitSelesai: targetMenitSelesai
            };

            updateHeaderUI();
            tampilkanPopupNotifikasi(`🏗️ Konstruksi Kandang Dimulai!`, `Pembangunan Kandang #${nomorKandang} sedang berlangsung (5 Hari In-Game).`);
            renderKandang();
            renderTas();
        } else {
            alert("⚠️ Sumber daya tidak cukup untuk membangun kandang ini!");
        }
    }
}

function selesaikanPembangunanLahan(nomorLahan) {
    gameState.jumlahLahanAktif = nomorLahan;
    delete gameState.lahan[nomorLahan];
    tampilkanPopupNotifikasi(`✨ Lahan Siap Digunakan!`, `Lahan #${nomorLahan} telah selesai dibangun.`);
    renderLahan();
}

function bukaModalTanam(nomorLahan) {
    lahanTargetAktif = nomorLahan;
    let modalTanam = document.getElementById("modal-tanam");
    if (!modalTanam) {
        modalTanam = document.createElement("div");
        modalTanam.id = "modal-tanam";
        modalTanam.className = "modal-overlay";
        modalTanam.innerHTML = `
            <div class="modal-card">
                <h3>Pilih Bibit untuk Lahan</h3>
                <p id="info-modal-tanam" style="color: var(--text-muted); font-size: 0.9rem;">Pilih bibit dan tentukan jumlah (Maks 35 per lahan)</p>
                <div id="list-bibit-tas" style="max-height: 220px; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;"></div>
                <button class="btn-cancel" onclick="tutupModalTanam()" style="width:100%; padding: 8px;">Batal</button>
            </div>
        `;
        document.body.appendChild(modalTanam);
    } else {
        document.getElementById("info-modal-tanam").innerText = `Pilih bibit untuk ditanam di Lahan #${nomorLahan}`;
    }

    const containerBibit = document.getElementById("list-bibit-tas");
    containerBibit.innerHTML = "";

    let adaBibit = false;
    const daftarBibit = GAME_DATABASE.bibit;

    for (let idBibit in daftarBibit) {
        let jumlahDiTas = gameState.tas[idBibit] || 0;
        if (jumlahDiTas > 0) {
            adaBibit = true;
            let infoBibit = daftarBibit[idBibit];
            containerBibit.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #121824; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="text-align: left;">
                        <b>${infoBibit.icon} ${infoBibit.nama}</b><br>
                        <small style="color:var(--text-muted);">Stok Tas: ${jumlahDiTas}</small>
                    </div>
                    <button onclick="bukaSubModalJumlahTanam('${idBibit}', ${jumlahDiTas})" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; width: auto; margin-top:0;">Pilih</button>
                </div>
            `;
        }
    }

    if (!adaBibit) {
        containerBibit.innerHTML = `<p style="color: #f87171; font-style: italic;">Tas kamu kosong dari bibit! Beli dulu di Supermarket.</p>`;
    }
    modalTanam.style.display = "flex";
}

function tutupModalTanam() {
    let modalTanam = document.getElementById("modal-tanam");
    if (modalTanam) modalTanam.style.display = "none";
}

function bukaSubModalJumlahTanam(idBibit, stokTas) {
    let maksBisaTanam = Math.min(stokTas, 35); // Maksimal 35 bibit per lahan
    let infoBibit = GAME_DATABASE.bibit[idBibit];

    let containerBibit = document.getElementById("list-bibit-tas");
    containerBibit.innerHTML = `
        <div style="text-align: center;">
            <h4>Tanam ${infoBibit.nama}</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Stok di Tas: <b>${stokTas}</b> (Maks 35)</p>
            <div class="modal-input-group" style="justify-content: center;">
                <button onclick="ubahJumlahInputTanam(-1)">-</button>
                <input type="number" id="input-jml-tanam" value="1" min="1" max="${maksBisaTanam}">
                <button onclick="ubahJumlahInputTanam(1)">+</button>
                <button class="btn-max" onclick="document.getElementById('input-jml-tanam').value=${maksBisaTanam}">MAX</button>
            </div>
            <div class="modal-actions" style="margin-top: 20px;">
                <button onclick="bukaModalTanam(${lahanTargetAktif})" class="btn-cancel">Kembali</button>
                <button onclick="eksekusiTanamBibit('${idBibit}', ${stokTas})" class="btn-confirm">Tanam</button>
            </div>
        </div>
    `;
}

function ubahJumlahInputTanam(delta) {
    let input = document.getElementById("input-jml-tanam");
    let val = parseInt(input.value || 1) + delta;
    let maks = parseInt(input.max) || 35;
    if (val < 1) val = 1;
    if (val > maks) val = maks;
    input.value = val;
}

function eksekusiTanamBibit(idBibit, stokTas) {
    let jumlahTanam = parseInt(document.getElementById("input-jml-tanam").value) || 1;
    if (jumlahTanam > stokTas) {
        alert("Jumlah melebihi stok di tas!");
        return;
    }

    gameState.tas[idBibit] -= jumlahTanam;
    if (gameState.tas[idBibit] <= 0) delete gameState.tas[idBibit];

    let durasiDetikDatabase = GAME_DATABASE.bibit[idBibit].durasi;
    let durasiMenitInGame = Math.ceil(durasiDetikDatabase / 60);

    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    let targetMenitInGame = totalMenitSekarang + durasiMenitInGame;

    gameState.lahan[lahanTargetAktif] = {
        idBibit: idBibit,
        jumlah: jumlahTanam,
        targetMenitInGame: targetMenitInGame
    };

    tutupModalTanam();
    tampilkanPopupNotifikasi(`🌱 Berhasil Menanam!`, `Berhasil menanam ${jumlahTanam} ${GAME_DATABASE.bibit[idBibit].nama} di Lahan #${lahanTargetAktif}.`);
    renderLahan();
    renderTas();
}

function panenHasil(nomorLahan) {
    let dataLahan = gameState.lahan[nomorLahan];
    if (!dataLahan) return;

    let bibitInfo = GAME_DATABASE.bibit[dataLahan.idBibit];
    let idHasilPanen = bibitInfo.hasilId;
    let jumlahPanen = dataLahan.jumlah;

    if (!gameState.tas[idHasilPanen]) gameState.tas[idHasilPanen] = 0;
    gameState.tas[idHasilPanen] += jumlahPanen;

    delete gameState.lahan[nomorLahan];

    let hasilInfo = GAME_DATABASE.hasilPanen[idHasilPanen];
    tampilkanPopupNotifikasi(`🌾 Panen Sukses!`, `Kamu berhasil memanen ${jumlahPanen} ${hasilInfo.nama} dan menyimpannya ke Tas.`);
    renderLahan();
    renderTas();
}


// --- TAB KANDANG & PASAR TERNAK (MAKSIMAL 35 KANDANG) ---

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
                        <p style="color: var(--text-muted);">🏡 Kosong (Belum ada hewan)</p>
                        <button onclick="bukaModalIsiKandang(${i})" style="background: #2563eb;">Isi Hewan</button>
                    </div>
                `;
            } else if (dataKandang.status === 'dibangun') {
                let sisaMenitKonstruksi = Math.max(0, dataKandang.targetMenitSelesai - totalMenitSekarang);
                let teksKonstruksi = formatDurasiBersih(sisaMenitKonstruksi);
                let tombolProses = sisaMenitKonstruksi === 0
                    ? `<button onclick="selesaikanPembangunanKandang(${i})" style="background: #10b981; color:white;">Ambil Kandang Selesai</button>`
                    : `<button disabled style="background: #334155; color: var(--text-muted);">Pembangunan... (${teksKonstruksi})</button>`;

                container.innerHTML += `
                    <div class="card" style="border: 1px solid #3b82f6; background: #151f2c;">
                        <h3>Kandang #${i} 🏗️</h3>
                        <p style="color: #60a5fa; font-size: 0.9rem;">Sedang Dibangun</p>
                        <p style="font-size: 0.85rem; color: var(--text-muted);">Sisa: <b>${teksWaktu}</b></p>
                        ${tombolProses}
                    </div>
                `;
            } else {
                let ternakInfo = GAME_DATABASE.ternak[dataKandang.idTernak] || {};
                let hasilInfo = GAME_DATABASE.ternakHasil[ternakInfo.hasilId] || {};
                let sisaMenitInGame = Math.max(0, dataKandang.targetMenitInGame - totalMenitSekarang);
                let teksWaktu = formatDurasiBersih(sisaMenitInGame);

                let tombolAksi = sisaMenitInGame === 0 
                    ? `<button onclick="panenTernak(${i})" style="background: #d97706; color:white;">Panen Hasil</button>`
                    : `<button disabled style="background: #334155; color: var(--text-muted); cursor: not-allowed;">Berproses... (${teksWaktu})</button>`;

                container.innerHTML += `
                    <div class="card" style="border: 1px solid rgba(245, 158, 11, 0.4); background: #151f2c;">
                        <h3>Kandang #${i}</h3>
                        <div style="font-size: 2.5rem; margin: 5px 0;">${ternakInfo.icon}</div>
                        <p><b>${ternakInfo.nama}</b></p>
                        <p style="font-size: 0.85rem; color: #fbbf24;">Hasil: ${hasilInfo.nama}</p>
                        <p style="font-size: 0.85rem; color: #34d399; font-weight: bold;">⏱️ ${teksWaktu}</p>
                        ${tombolAksi}
                    </div>
                `;
            }
        } else {
            let biayaKandang = hitungBiayaUpgradeKandang(i);
            container.innerHTML += `
                <div class="card" style="opacity: 0.7; background: #0f141d; border: 1px dashed var(--border-color);">
                    <h3>Kandang #${i} 🔒</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin: 10px 0;">Terkunci</p>
                    <p style="font-size: 0.8rem; color: #fbbf24;">Syarat:<br>🪵 ${biayaKandang.kayu} Kayu<br>💰 Rp. ${biayaKandang.uang.toLocaleString('id-ID')}<br>⏱️ 5 Hari</p>
                    <button onclick="konfirmasiBukaKandang(${i})" style="background: #2563eb; margin-top:10px;">Buka Kandang</button>
                </div>
            `;
        }
    }
}

function hitungBiayaUpgradeKandang(targetKandang) {
    let kayu = 100;
    let uang = 2500;
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

    let modalKonf = document.getElementById("modal-konfirmasi-bangun");
    if (!modalKonf) {
        modalKonf = document.createElement("div");
        modalKonf.id = "modal-konfirmasi-bangun";
        modalKonf.className = "modal-overlay";
        modalKonf.innerHTML = `
            <div class="modal-card">
                <h3>Konfirmasi Pembangunan</h3>
                <p id="konf-teks" style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.5;"></p>
                <div class="modal-actions" style="margin-top: 25px;">
                    <button class="btn-cancel" onclick="tutupModalKonfirmasi()">Batal</button>
                    <button class="btn-confirm" onclick="eksekusiBukaBangunan()">Bangun Sekarang</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalKonf);
    }

    document.getElementById("konf-teks").innerHTML = `Ingin membangun <b>Kandang #${nomorKandang}</b>?<br>Biaya: 🪵 ${biaya.kayu} Kayu & 💰 Rp. ${biaya.uang.toLocaleString('id-ID')}<br>Waktu Pembangunan: ⏱️ 5 Hari In-Game.`;
    modalKonf.style.display = "flex";
}

function selesaikanPembangunanKandang(nomorKandang) {
    gameState.jumlahKandangAktif = nomorKandang;
    delete gameState.kandang[nomorKandang];
    tampilkanPopupNotifikasi(`✨ Kandang Siap Digunakan!`, `Kandang #${nomorKandang} telah selesai dibangun.`);
    renderKandang();
}

function bukaModalIsiKandang(nomorKandang) {
    kandangTargetAktif = nomorKandang;
    let modal = document.getElementById("modal-isi-kandang");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modal-isi-kandang";
        modal.className = "modal-overlay";
        modal.innerHTML = `
            <div class="modal-card">
                <h3>Pilih Hewan Ternak</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Pilih hewan dari Tas untuk dimasukkan ke Kandang #${nomorKandang}</p>
                <div id="list-hewan-tas" style="max-height: 220px; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 10px;"></div>
                <button class="btn-cancel" onclick="tutupModalIsiKandang()" style="width:100%; padding: 8px;">Batal</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const container = document.getElementById("list-hewan-tas");
    container.innerHTML = "";
    let adaHewan = false;

    for (let idTernak in GAME_DATABASE.ternak) {
        let stok = gameState.tas[idTernak] || 0;
        if (stok > 0) {
            adaHewan = true;
            let info = GAME_DATABASE.ternak[idTernak];
            container.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #121824; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <div style="text-align: left;">
                        <b>${info.icon} ${info.nama}</b><br>
                        <small style="color:var(--text-muted);">Stok Tas: ${stok}</small>
                    </div>
                    <button onclick="tempatkanHewan('${idTernak}')" style="background: #059669; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; width: auto; margin-top:0;">Tempatkan</button>
                </div>
            `;
        }
    }

    if (!adaHewan) {
        container.innerHTML = `<p style="color: #f87171; font-style: italic;">Tas kamu kosong dari hewan ternak! Beli dulu di Pasar.</p>`;
    }
    modal.style.display = "flex";
}

function tutupModalIsiKandang() {
    let modal = document.getElementById("modal-isi-kandang");
    if (modal) modal.style.display = "none";
}

function tempatkanHewan(idTernak) {
    gameState.tas[idTernak] -= 1;
    if (gameState.tas[idTernak] <= 0) delete gameState.tas[idTernak];

    let ternakInfo = GAME_DATABASE.ternak[idTernak];
    let durasiMenit = Math.ceil(ternakInfo.durasi / 60);
    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);

    gameState.kandang[kandangTargetAktif] = {
        idTernak: idTernak,
        targetMenitInGame: totalMenitSekarang + durasiMenit
    };

    tutupModalIsiKandang();
    tampilkanPopupNotifikasi(`🐮 Hewan Masuk Kandang!`, `Berhasil menempatkan ${ternakInfo.nama} di Kandang #${kandangTargetAktif}.`);
    renderKandang();
    renderTas();
}

function panenTernak(nomorKandang) {
    let dataKandang = gameState.kandang[nomorKandang];
    if (!dataKandang) return;

    let ternakInfo = GAME_DATABASE.ternak[dataKandang.idTernak];
    let idHasil = ternakInfo.hasilId;

    if (!gameState.tas[idHasil]) gameState.tas[idHasil] = 0;
    gameState.tas[idHasil] += 1;

    // Reset timer proses ternak berikutnya
    let durasiMenit = Math.ceil(ternakInfo.durasi / 60);
    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuHari, gameState.waktuJam, gameState.waktuMenit);
    dataKandang.targetMenitInGame = totalMenitSekarang + durasiMenit;

    let hasilInfo = GAME_DATABASE.ternakHasil[idHasil];
    tampilkanPopupNotifikasi(`🥛 Panen Ternak!`, `Kamu mendapatkan 1 ${hasilInfo.nama} dari kandang.`);
    renderKandang();
    renderTas();
}


// --- TAB PASAR (JUAL HEWAN TERNAK & PAKAN SPESIFIK) ---

function renderPasar() {
    const container = document.getElementById("list-pasar");
    if (!container) return;
    container.innerHTML = "";

    let htmlTernakHeader = `<div style="grid-column: 1 / -1;"><h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: #fbbf24;">🐮 Hewan Ternak</h3></div>`;
    let cardTernak = "";
    for (let id in GAME_DATABASE.ternak) {
        let item = GAME_DATABASE.ternak[id];
        let persen = getFluktuasiItem(id);
        let hargaAktif = Math.round(item.hargaBeli * (1 + persen / 100));
        let grafik = getInfoGrafikHarga(hargaAktif, item.hargaBeli);

        cardTernak += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b style="color: #34d399;">Rp. ${hargaAktif.toLocaleString('id-ID')}</b></p>
                <p style="font-size: 0.85rem; margin: 4px 0;">${grafik} <small style="color:var(--text-muted);">(Base: ${item.hargaBeli.toLocaleString('id-ID')})</small></p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaAktif}, 'pasar_ternak')" style="background: #059669;">Beli Hewan</button>
            </div>
        `;
    }

    let htmlPakanHeader = `<div style="grid-column: 1 / -1; margin-top: 20px;"><h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: #34d399;">🌾 Pakan Ternak</h3></div>`;
    let cardPakan = "";
    for (let id in GAME_DATABASE.pakan) {
        let item = GAME_DATABASE.pakan[id];
        let persen = getFluktuasiItem(id);
        let hargaAktif = Math.round(item.hargaBeli * (1 + persen / 100));
        let grafik = getInfoGrafikHarga(hargaAktif, item.hargaBeli);

        cardPakan += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b style="color: #34d399;">Rp. ${hargaAktif.toLocaleString('id-ID')}</b></p>
                <p style="font-size: 0.85rem; margin: 4px 0;">${grafik} <small style="color:var(--text-muted);">(Base: ${item.hargaBeli})</small></p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaAktif}, 'pasar_pakan')" style="background: #059669;">Beli Pakan</button>
            </div>
        `;
    }

    container.innerHTML = htmlTernakHeader + cardTernak + htmlPakanHeader + cardPakan;
}


// --- TAB SUPERMARKET ---

function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    if (!container) return;
    container.innerHTML = "";

    const daftarBibit = GAME_DATABASE.bibit;
    for (let key in daftarBibit) {
        let item = daftarBibit[key];
        let hasilInfo = GAME_DATABASE.hasilPanen[item.hasilId] || {};
        let persen = getFluktuasiItem(key);
        let hargaBeliAktif = Math.round(item.hargaBeli * (1 + persen / 100));
        if (hargaBeliAktif < 1) hargaBeliAktif = 1;

        let grafikBeli = getInfoGrafikHarga(hargaBeliAktif, item.hargaBeli);
        let durasiMenit = Math.ceil(item.durasi / 60);

        container.innerHTML += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b style="color: #34d399;">Rp. ${hargaBeliAktif}</b></p>
                <p style="font-size: 0.85rem; margin: 4px 0;">${grafikBeli}</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Hasil: ${hasilInfo.nama || 'Buah'}</p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaBeliAktif}, 'supermarket')">Beli Bibit</button>
            </div>
        `;
    }
}

function bukaModalBeli(idItem, namaItem, harga, tipe) {
    transaksiAktif = { idItem, namaItem, hargaSatuan: harga, tipe: tipe };
    
    let modalBeli = document.getElementById("modal-beli");
    if (!modalBeli) {
        modalBeli = document.createElement("div");
        modalBeli.id = "modal-beli";
        modalBeli.className = "modal-overlay";
        modalBeli.innerHTML = `
            <div class="modal-card">
                <h3 id="modal-title">Pembelian</h3>
                <p id="modal-info" style="color: var(--text-muted); font-size: 0.9rem;">Harga: Rp. 0</p>
                <div class="modal-input-group">
                    <button onclick="ubahJumlahBeli(-1)">-</button>
                    <input type="number" id="input-jumlah-beli" value="1" min="1" max="99" oninput="validasiInputBeli()">
                    <button onclick="ubahJumlahBeli(1)">+</button>
                    <button class="btn-max" onclick="beliMaksimal()">MAX</button>
                </div>
                <p id="modal-total" style="margin: 15px 0; font-weight: bold; color: #34d399;">Total: Rp. 0</p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalBeli()">Batal</button>
                    <button class="btn-confirm" onclick="konfirmasiBeli()">Beli</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalBeli);
    }

    document.getElementById("modal-title").innerText = `Beli ${namaItem}`;
    document.getElementById("modal-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / pcs`;
    document.getElementById("input-jumlah-beli").value = 1;
    
    updateTotalHargaModal();
    modalBeli.style.display = "flex";
}

function tutupModalBeli() {
    let modalBeli = document.getElementById("modal-beli");
    if (modalBeli) modalBeli.style.display = "none";
}

function ubahJumlahBeli(delta) {
    let input = document.getElementById("input-jumlah-beli");
    let nilaiBaru = parseInt(input.value || 1) + delta;
    if (nilaiBaru < 1) nilaiBaru = 1;
    if (nilaiBaru > 99) nilaiBaru = 99;
    input.value = nilaiBaru;
    updateTotalHargaModal();
}

function validasiInputBeli() {
    let input = document.getElementById("input-jumlah-beli");
    let val = parseInt(input.value);
    if (val > 99) input.value = 99;
    if (val < 1 && input.value !== "") input.value = 1;
    updateTotalHargaModal();
}

function beliMaksimal() {
    if (transaksiAktif.hargaSatuan <= 0) return;
    let maxBerdasarkanUang = Math.floor(gameState.uang / transaksiAktif.hargaSatuan);
    let jumlahMaks = Math.min(maxBerdasarkanUang, 99);
    if (jumlahMaks < 1) jumlahMaks = 1; 
    document.getElementById("input-jumlah-beli").value = jumlahMaks;
    updateTotalHargaModal();
}

function updateTotalHargaModal() {
    let jumlah = parseInt(document.getElementById("input-jumlah-beli").value) || 0;
    let totalHarga = jumlah * transaksiAktif.hargaSatuan;
    document.getElementById("modal-total").innerText = `Total: Rp. ${totalHarga.toLocaleString('id-ID')}`;
}

function konfirmasiBeli() {
    let jumlah = parseInt(document.getElementById("input-jumlah-beli").value) || 0;
    let totalHarga = jumlah * transaksiAktif.hargaSatuan;
    
    if (gameState.uang >= totalHarga) {
        gameState.uang -= totalHarga;
        if (!gameState.tas[transaksiAktif.idItem]) gameState.tas[transaksiAktif.idItem] = 0;
        gameState.tas[transaksiAktif.idItem] += jumlah;

        updateHeaderUI();
        tutupModalBeli();
        tampilkanPopupNotifikasi(`🎉 Pembelian Berhasil!`, `Kamu membeli ${jumlah} ${transaksiAktif.namaItem} seharga Rp. ${totalHarga.toLocaleString('id-ID')}.`);
        renderTas();
    } else {
        alert("⚠️ Uang kamu tidak cukup untuk melakukan pembelian ini!");
    }
}


// --- TAB TUKANG KAYU ---

function renderTukangKayu() {
    const container = document.getElementById("list-tukang-kayu");
    if (!container) return;
    container.innerHTML = "";

    let itemKayu = GAME_DATABASE.material.kayu;
    let persen = getFluktuasiItem('kayu');
    let hargaBeliKayuAktif = Math.round(itemKayu.hargaBeli * (1 + persen / 100));
    if (hargaBeliKayuAktif < 1) hargaBeliKayuAktif = 1;

    let grafikKayu = getInfoGrafikHarga(hargaBeliKayuAktif, itemKayu.hargaBeli);

    container.innerHTML = `
        <div class="card">
            <div style="font-size: 2.5rem;">${itemKayu.icon}</div>
            <h3>${itemKayu.nama}</h3>
            <p>Beli: <b style="color: #34d399;">Rp. ${hargaBeliKayuAktif}</b></p>
            <p style="font-size: 0.85rem; margin: 4px 0;">${grafikKayu}</p>
            <button onclick="bukaModalBeli('${itemKayu.id}', '${item.nama}', ${hargaBeliKayuAktif}, 'tukang_kayu')" style="background: #d97706;">Beli Kayu</button>
        </div>
    `;
}


// --- TAB PENGEPUL (MENERIMA HASIL PANEN & TERNAK) ---

function renderPengepul() {
    const container = document.getElementById("list-pengepul");
    if (!container) return;
    container.innerHTML = "";

    let htmlContent = "";
    let adaBarangJual = false;

    // Kategori Hasil Tanaman
    let cardTanaman = "";
    for (let idItem in gameState.tas) {
        let jumlahStok = gameState.tas[idItem];
        if (jumlahStok > 0 && GAME_DATABASE.hasilPanen[idItem]) {
            adaBarangJual = true;
            let item = GAME_DATABASE.hasilPanen[idItem];
            let persen = getFluktuasiItem(idItem);
            let hargaAktif = Math.round(item.hargaJual * (1 + persen / 100));
            if (hargaAktif < 1) hargaAktif = 1;

            cardTanaman += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${item.icon}</div>
                    <h3>${item.nama}</h3>
                    <p style="color: var(--text-muted);">Stok: <b>${jumlahStok} Pcs</b></p>
                    <p>Harga Jual: <b style="color: #60a5fa;">Rp. ${hargaAktif}</b></p>
                    <button onclick="bukaModalJual('${idItem}', '${item.nama}', ${hargaAktif}, ${jumlahStok})" style="background: #2563eb;">Jual</button>
                </div>
            `;
        }
    }

    // Kategori Hasil Ternak
    let cardTernakHasil = "";
    for (let idItem in gameState.tas) {
        let jumlahStok = gameState.tas[idItem];
        if (jumlahStok > 0 && GAME_DATABASE.ternakHasil[idItem]) {
            adaBarangJual = true;
            let item = GAME_DATABASE.ternakHasil[idItem];
            let persen = getFluktuasiItem(idItem);
            let hargaAktif = Math.round(item.hargaJual * (1 + persen / 100));
            if (hargaAktif < 1) hargaAktif = 1;

            cardTernakHasil += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${item.icon}</div>
                    <h3>${item.nama}</h3>
                    <p style="color: var(--text-muted);">Stok: <b>${jumlahStok} Pcs</b></p>
                    <p>Harga Jual: <b style="color: #60a5fa;">Rp. ${hargaAktif}</b></p>
                    <button onclick="bukaModalJual('${idItem}', '${item.nama}', ${hargaAktif}, ${jumlahStok})" style="background: #2563eb;">Jual</button>
                </div>
            `;
        }
    }

    if (cardTanaman) htmlContent += `<div style="grid-column: 1 / -1;"><h3 style="color: #34d399; border-bottom:1px solid var(--border-color); padding-bottom:5px;">🌾 Hasil Tanaman</h3></div>` + cardTanaman;
    if (cardTernakHasil) htmlContent += `<div style="grid-column: 1 / -1; margin-top:15px;"><h3 style="color: #fbbf24; border-bottom:1px solid var(--border-color); padding-bottom:5px;">🐮 Hasil Ternak</h3></div>` + cardTernakHasil;

    if (!adaBarangJual) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Tidak ada hasil panen atau hasil ternak di Tas.</p>`;
    } else {
        container.innerHTML = htmlContent;
    }
}

function bukaModalJual(idItem, namaItem, hargaJualSatuan, stokMaksimal) {
    transaksiAktif = { idItem, namaItem, hargaSatuan: hargaJualSatuan, tipe: 'jual', stokMaksimal };

    let modalJual = document.getElementById("modal-jual");
    if (!modalJual) {
        modalJual = document.createElement("div");
        modalJual.id = "modal-jual";
        modalJual.className = "modal-overlay";
        modalJual.innerHTML = `
            <div class="modal-card">
                <h3 id="modal-jual-title">Jual Barang</h3>
                <p id="modal-jual-info" style="color: var(--text-muted); font-size: 0.9rem;">Harga: Rp. 0 / pcs</p>
                <div class="modal-input-group">
                    <button onclick="ubahJumlahJual(-1)">-</button>
                    <input type="number" id="input-jumlah-jual" value="1" min="1" oninput="validasiInputJual()">
                    <button onclick="ubahJumlahJual(1)">+</button>
                    <button class="btn-max" onclick="jualMaksimal()">MAX</button>
                </div>
                <p id="modal-jual-total" style="margin: 15px 0; font-weight: bold; color: #60a5fa;">Total Pendapatan: Rp. 0</p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalJual()">Batal</button>
                    <button class="btn-confirm" onclick="konfirmasiJual()" style="background: #2563eb; color: #60a5fa;">Jual</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalJual);
    }

    document.getElementById("modal-jual-title").innerText = `Jual ${namaItem}`;
    document.getElementById("modal-jual-info").innerText = `Harga Jual: Rp. ${hargaJualSatuan.toLocaleString('id-ID')} / pcs (Stok: ${stokMaksimal})`;
    
    let inputJual = document.getElementById("input-jumlah-jual");
    inputJual.value = 1;
    inputJual.max = stokMaksimal;

    updateTotalHargaModalJual();
    modalJual.style.display = "flex";
}

function tutupModalJual() {
    let modalJual = document.getElementById("modal-jual");
    if (modalJual) modalJual.style.display = "none";
}

function ubahJumlahJual(delta) {
    let input = document.getElementById("input-jumlah-jual");
    let nilaiBaru = parseInt(input.value || 1) + delta;
    let maks = transaksiAktif.stokMaksimal || 1;
    if (nilaiBaru < 1) nilaiBaru = 1;
    if (nilaiBaru > maks) nilaiBaru = maks;
    input.value = nilaiBaru;
    updateTotalHargaModalJual();
}

function validasiInputJual() {
    let input = document.getElementById("input-jumlah-jual");
    let val = parseInt(input.value);
    let maks = transaksiAktif.stokMaksimal || 1;
    if (val > maks) input.value = maks;
    if (val < 1 && input.value !== "") input.value = 1;
    updateTotalHargaModalJual();
}

function jualMaksimal() {
    document.getElementById("input-jumlah-jual").value = transaksiAktif.stokMaksimal;
    updateTotalHargaModalJual();
}

function updateTotalHargaModalJual() {
    let jumlah = parseInt(document.getElementById("input-jumlah-jual").value) || 0;
    let totalPendapatan = jumlah * transaksiAktif.hargaSatuan;
    document.getElementById("modal-jual-total").innerText = `Total Pendapatan: Rp. ${totalPendapatan.toLocaleString('id-ID')}`;
}

function konfirmasiJual() {
    let jumlah = parseInt(document.getElementById("input-jumlah-jual").value) || 0;
    let totalPendapatan = jumlah * transaksiAktif.hargaSatuan;

    if (jumlah > 0 && gameState.tas[transaksiAktif.idItem] >= jumlah) {
        gameState.tas[transaksiAktif.idItem] -= jumlah;
        if (gameState.tas[transaksiAktif.idItem] <= 0) delete gameState.tas[transaksiAktif.idItem];
        gameState.uang += totalPendapatan;

        updateHeaderUI();
        tutupModalJual();
        tampilkanPopupNotifikasi(`💰 Penjualan Berhasil!`, `Kamu menjual ${jumlah} ${transaksiAktif.namaItem} dan mendapatkan Rp. ${totalPendapatan.toLocaleString('id-ID')}.`);
        renderPengepul();
        renderTas();
    } else {
        alert("⚠️ Stok di tas tidak mencukupi!");
    }
}


// --- POPUP NOTIFIKASI MODERN ---

function tampilkanPopupNotifikasi(judul, pesan) {
    let modalNotif = document.getElementById("modal-notifikasi-custom");
    if (!modalNotif) {
        modalNotif = document.createElement("div");
        modalNotif.id = "modal-notifikasi-custom";
        modalNotif.className = "modal-overlay";
        modalNotif.innerHTML = `
            <div class="modal-card" style="text-align: center;">
                <h3 id="notif-judul" style="color: #34d399; margin-bottom: 10px;"></h3>
                <p id="notif-pesan" style="margin-bottom: 20px; color: var(--text-muted); line-height: 1.5; font-size: 0.95rem;"></p>
                <button onclick="tutupPopupNotifikasi()" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 8px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; width: 100%;">OK</button>
            </div>
        `;
        document.body.appendChild(modalNotif);
    }
    document.getElementById("notif-judul").innerText = judul;
    document.getElementById("notif-pesan").innerText = pesan;
    modalNotif.style.display = "flex";
}

function tutupPopupNotifikasi() {
    let modalNotif = document.getElementById("modal-notifikasi-custom");
    if (modalNotif) modalNotif.style.display = "none";
}


// --- TAB TAS ---

function renderTas() {
    const container = document.getElementById("grid-tas");
    if (!container) return;
    container.innerHTML = "";

    let adaIsi = false;
    for (let idItem in gameState.tas) {
        let jumlah = gameState.tas[idItem];
        if (jumlah > 0) {
            adaIsi = true;
            let dataItem = GAME_DATABASE.bibit[idItem] || GAME_DATABASE.hasilPanen[idItem] || GAME_DATABASE.ternak[idItem] || GAME_DATABASE.pakan[idItem] || GAME_DATABASE.ternakHasil[idItem] || GAME_DATABASE.material[idItem] || { nama: idItem, icon: "📦" };

            container.innerHTML += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${dataItem.icon}</div>
                    <h3>${dataItem.nama}</h3>
                    <p style="color: var(--text-muted);">Jumlah: <b>${jumlah} Pcs</b></p>
                </div>
            `;
        }
    }

    if (!adaIsi) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">Tas kamu masih kosong.</p>`;
    }
}


// --- SISTEM WAKTU IN-GAME ---
setInterval(() => {
    gameState.waktuMenit += 1;
    if (gameState.waktuMenit >= 60) {
        gameState.waktuMenit = 0;
        gameState.waktuJam += 1;
        if (gameState.waktuJam >= 24) {
            gameState.waktuJam = 0; 
            gameState.waktuHari += 1; // Hari bertambah otomatis setiap 24 jam in-game
        }
    }
    updateHeaderUI();

    let blokMenitSekarang = Math.floor(gameState.waktuMenit / 10);
    if (lastMenitFluktuasi !== blokMenitSekarang) {
        lastMenitFluktuasi = blokMenitSekarang;
        
        if (document.getElementById("tab-supermarket").classList.contains("active")) renderSupermarket();
        if (document.getElementById("tab-pasar").classList.contains("active")) renderPasar();
        if (document.getElementById("tab-pengepul").classList.contains("active")) renderPengepul();
        if (document.getElementById("tab-tukang-kayu").classList.contains("active")) renderTukangKayu();
    }

    if (document.getElementById("tab-lahan").classList.contains("active")) renderLahan();
    if (document.getElementById("tab-kandang").classList.contains("active")) renderKandang();
}, 1500);


// Inisialisasi Game
window.onload = function() {
    lastMenitFluktuasi = Math.floor(gameState.waktuMenit / 10);
    updateHeaderUI();
    renderLahan();
    renderKandang();
    renderSupermarket();
    renderPasar();
    renderTukangKayu();
    renderPengepul();
    renderTas();
};
