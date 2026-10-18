// State Utama Game
let gameState = {
    namaPemain: "Pak Tani",
    uang: 500,
    waktuJam: 8, 
    waktuMenit: 0,
    jumlahLahanAktif: 1, 
    tas: {},    
    lahan: {}   
};

let transaksiAktif = {
    idItem: "",
    namaItem: "",
    hargaSatuan: 0,
    tipe: "" 
};

let lahanTargetAktif = null;
let fluktuasiCache = {}; 
let lastMenitFluktuasi = -1; 

function getFluktuasiItem(idItem) {
    let kunciWaktu = `${gameState.waktuJam}-${Math.floor(gameState.waktuMenit / 10)}`;
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
    if (tabId === 'tab-lahan') renderLahan();
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
    if (namaBaru !== "") {
        gameState.namaPemain = namaBaru;
    }
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
    
    // Sembunyikan atau hapus elemen cuaca jika ada di HTML
    let elCuaca = document.getElementById("stat-cuaca");
    if (elCuaca) elCuaca.style.display = "none";
    
    let jamFormatted = String(gameState.waktuJam).padStart(2, '0');
    let menitFormatted = String(gameState.waktuMenit).padStart(2, '0');
    let elWaktu = document.getElementById("stat-waktu");
    if (elWaktu) elWaktu.innerText = `⏰ ${jamFormatted}:${menitFormatted}`;
}

function getTotalMenitInGame(jam, menit) {
    return (jam * 60) + menit;
}

function formatDurasiBersih(totalMenit) {
    if (totalMenit <= 0) return "Siap Panen! ✨";
    let jam = Math.floor(totalMenit / 60);
    let menit = totalMenit % 60;
    
    if (jam > 0 && menit > 0) {
        return `${jam} Jam ${menit} Menit`;
    } else if (jam > 0) {
        return `${jam} Jam`;
    } else {
        return `${menit} Menit`;
    }
}


// --- TAB LAHAN ---

function renderLahan() {
    const container = document.getElementById("grid-lahan");
    if (!container) return;
    container.innerHTML = "";

    const totalMenitSekarang = getTotalMenitInGame(gameState.waktuJam, gameState.waktuMenit);

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
                    <p style="font-size: 0.8rem; color: #fbbf24;">Syarat:<br>🪵 ${biayaUpgrade.kayu} Kayu<br>💰 Rp. ${biayaUpgrade.uang.toLocaleString('id-ID')}</p>
                    <button onclick="bukaLahanBaru(${i})" style="background: #2563eb; margin-top:10px;">Buka Lahan</button>
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

function bukaLahanBaru(nomorLahan) {
    if (nomorLahan !== gameState.jumlahLahanAktif + 1) return;

    let biaya = hitungBiayaUpgradeLahan(nomorLahan);
    let stokKayuTas = gameState.tas['kayu'] || 0;

    if (stokKayuTas >= biaya.kayu && gameState.uang >= biaya.uang) {
        gameState.tas['kayu'] -= biaya.kayu;
        if (gameState.tas['kayu'] <= 0) delete gameState.tas['kayu'];
        gameState.uang -= biaya.uang;

        gameState.jumlahLahanAktif = nomorLahan;
        updateHeaderUI();
        tampilkanPopupNotifikasi(`🪵 Lahan Terbuka!`, `Selamat! Lahan #${nomorLahan} berhasil dibuka.`);
        renderLahan();
        renderTas();
    } else {
        alert(`⚠️ Sumber daya tidak cukup!\nButuh: ${biaya.kayu} Kayu dan Rp. ${biaya.uang.toLocaleString('id-ID')}`);
    }
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
                <p id="info-modal-tanam" style="color: var(--text-muted); font-size: 0.9rem;">Pilih bibit dan tentukan jumlah (Maks 10 per lahan)</p>
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
    let maksBisaTanam = Math.min(stokTas, 10); 
    let infoBibit = GAME_DATABASE.bibit[idBibit];

    let containerBibit = document.getElementById("list-bibit-tas");
    containerBibit.innerHTML = `
        <div style="text-align: center;">
            <h4>Tanam ${infoBibit.nama}</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Stok di Tas: <b>${stokTas}</b> (Maks 10)</p>
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
    let maks = parseInt(input.max) || 10;
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

    let totalMenitSekarang = getTotalMenitInGame(gameState.waktuJam, gameState.waktuMenit);
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
    let idHasilPanen = bibitInfo.hasilId; // Menjadi hasil panen buahnya
    let jumlahPanen = dataLahan.jumlah;

    if (!gameState.tas[idHasilPanen]) gameState.tas[idHasilPanen] = 0;
    gameState.tas[idHasilPanen] += jumlahPanen;

    delete gameState.lahan[nomorLahan];

    let hasilInfo = GAME_DATABASE.hasilPanen[idHasilPanen];
    tampilkanPopupNotifikasi(`🌾 Panen Sukses!`, `Kamu berhasil memanen ${jumlahPanen} ${hasilInfo.nama} dan menyimpannya ke Tas.`);
    renderLahan();
    renderTas();
}


// --- TAB SUPERMARKET (MENJUAL BIBIT) ---

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
        let teksDurasiBersih = formatDurasiBersih(durasiMenit);

        container.innerHTML += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b style="color: #34d399;">Rp. ${hargaBeliAktif}</b></p>
                <p style="font-size: 0.85rem; margin: 4px 0;">${grafikBeli} <small style="color:var(--text-muted);">(Base: ${item.hargaBeli})</small></p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Hasil: ${hasilInfo.nama || 'Buah'}</p>
                <p style="font-size: 0.85rem; color: #60a5fa;">⏱️ ${teksDurasiBersih}</p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaBeliAktif})">Beli Bibit</button>
            </div>
        `;
    }
}

function bukaModalBeli(idItem, namaItem, harga) {
    transaksiAktif = { idItem, namaItem, hargaSatuan: harga, tipe: 'beli' };
    
    let modalBeli = document.getElementById("modal-beli");
    if (!modalBeli) {
        modalBeli = document.createElement("div");
        modalBeli.id = "modal-beli";
        modalBeli.className = "modal-overlay";
        modalBeli.innerHTML = `
            <div class="modal-card">
                <h3 id="modal-title">Beli Bibit</h3>
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
    document.getElementById("modal-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / biji`;
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
            <p style="font-size: 0.85rem; margin: 4px 0;">${grafikKayu} <small style="color:var(--text-muted);">(Base: ${itemKayu.hargaBeli})</small></p>
            <button onclick="bukaModalBeliKayu('${itemKayu.id}', '${itemKayu.nama}', ${hargaBeliKayuAktif})" style="background: #d97706;">Beli Kayu</button>
        </div>
    `;
}

function bukaModalBeliKayu(idItem, namaItem, harga) {
    transaksiAktif = { idItem, namaItem, hargaSatuan: harga, tipe: 'beli_kayu' };
    
    let modalBeli = document.getElementById("modal-beli");
    if (!modalBeli) {
        modalBeli = document.createElement("div");
        modalBeli.id = "modal-beli";
        modalBeli.className = "modal-overlay";
        modalBeli.innerHTML = `
            <div class="modal-card">
                <h3 id="modal-title">Beli Kayu</h3>
                <p id="modal-info" style="color: var(--text-muted); font-size: 0.9rem;">Harga: Rp. 0</p>
                <div class="modal-input-group">
                    <button onclick="ubahJumlahBeliKayu(-1)">-</button>
                    <input type="number" id="input-jumlah-beli" value="1" min="1" max="99" oninput="validasiInputBeliKayu()">
                    <button onclick="ubahJumlahBeliKayu(1)">+</button>
                    <button class="btn-max" onclick="beliMaksimalKayu()">MAX</button>
                </div>
                <p id="modal-total" style="margin: 15px 0; font-weight: bold; color: #34d399;">Total: Rp. 0</p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="tutupModalBeli()">Batal</button>
                    <button class="btn-confirm" onclick="konfirmasiBeliKayu()">Beli</button>
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

function ubahJumlahBeliKayu(delta) {
    let input = document.getElementById("input-jumlah-beli");
    let nilaiBaru = parseInt(input.value || 1) + delta;
    if (nilaiBaru < 1) nilaiBaru = 1;
    if (nilaiBaru > 99) nilaiBaru = 99;
    input.value = nilaiBaru;
    updateTotalHargaModal();
}

function validasiInputBeliKayu() {
    let input = document.getElementById("input-jumlah-beli");
    let val = parseInt(input.value);
    if (val > 99) input.value = 99;
    if (val < 1 && input.value !== "") input.value = 1;
    updateTotalHargaModal();
}

function beliMaksimalKayu() {
    if (transaksiAktif.hargaSatuan <= 0) return;
    let maxBerdasarkanUang = Math.floor(gameState.uang / transaksiAktif.hargaSatuan);
    let jumlahMaks = Math.min(maxBerdasarkanUang, 99);
    if (jumlahMaks < 1) jumlahMaks = 1; 
    document.getElementById("input-jumlah-beli").value = jumlahMaks;
    updateTotalHargaModal();
}

function konfirmasiBeliKayu() {
    let jumlah = parseInt(document.getElementById("input-jumlah-beli").value) || 0;
    let totalHarga = jumlah * transaksiAktif.hargaSatuan;
    
    if (gameState.uang >= totalHarga) {
        gameState.uang -= totalHarga;
        if (!gameState.tas['kayu']) gameState.tas['kayu'] = 0;
        gameState.tas['kayu'] += jumlah;

        updateHeaderUI();
        tutupModalBeli();
        tampilkanPopupNotifikasi(`🪵 Pembelian Kayu Sukses!`, `Kamu membeli ${jumlah} Kayu seharga Rp. ${totalHarga.toLocaleString('id-ID')}.`);
        renderTas();
    } else {
        alert("⚠️ Uang kamu tidak cukup!");
    }
}


// --- TAB PENGEPUL (MENERIMA HASIL PANEN) ---

function renderPengepul() {
    const container = document.getElementById("list-pengepul");
    if (!container) return;
    container.innerHTML = "";

    let htmlTanaman = `<div style="grid-column: 1 / -1; margin-top: 5px;"><h3 style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: #34d399;">🌾 Hasil Panen Tanaman</h3></div>`;
    let adaTanamanJual = false;
    let cardTanamanHTML = "";

    const daftarHasilPanen = GAME_DATABASE.hasilPanen || {};
    for (let idItem in gameState.tas) {
        let jumlahStok = gameState.tas[idItem];
        if (jumlahStok > 0 && daftarHasilPanen[idItem]) {
            adaTanamanJual = true;
            let item = daftarHasilPanen[idItem];
            
            let persen = getFluktuasiItem(idItem);
            let hargaJualAktif = Math.round(item.hargaJual * (1 + persen / 100));
            if (hargaJualAktif < 1) hargaJualAktif = 1;

            let grafikJual = getInfoGrafikHarga(hargaJualAktif, item.hargaJual);

            cardTanamanHTML += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${item.icon}</div>
                    <h3>${item.nama}</h3>
                    <p style="color: var(--text-muted);">Stok: <b>${jumlahStok} Pcs</b></p>
                    <p>Harga Jual: <b style="color: #60a5fa;">Rp. ${hargaJualAktif}</b></p>
                    <p style="font-size: 0.85rem; margin: 4px 0;">${grafikJual} <small style="color:var(--text-muted);">(Base: ${item.hargaJual})</small></p>
                    <button onclick="bukaModalJual('${idItem}', '${item.nama}', ${hargaJualAktif}, ${jumlahStok})" style="background: #2563eb;">Jual ke Pengepul</button>
                </div>
            `;
        }
    }

    if (!adaTanamanJual) {
        cardTanamanHTML = `<p style="grid-column: 1 / -1; color: var(--text-muted); font-style: italic;">Belum ada hasil panen di Tas untuk dijual.</p>`;
    }

    container.innerHTML = htmlTanaman + cardTanamanHTML;
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
    const daftarBibit = GAME_DATABASE.bibit || {};
    const daftarHasilPanen = GAME_DATABASE.hasilPanen || {};
    const daftarMaterial = GAME_DATABASE.material || {};

    for (let idItem in gameState.tas) {
        let jumlah = gameState.tas[idItem];
        if (jumlah > 0) {
            adaIsi = true;
            let dataItem = daftarBibit[idItem] || daftarHasilPanen[idItem] || daftarMaterial[idItem] || { nama: idItem, icon: "📦" };

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
        }
    }
    updateHeaderUI();

    let blokMenitSekarang = Math.floor(gameState.waktuMenit / 10);
    if (lastMenitFluktuasi !== blokMenitSekarang) {
        lastMenitFluktuasi = blokMenitSekarang;
        
        if (document.getElementById("tab-supermarket").classList.contains("active")) renderSupermarket();
        if (document.getElementById("tab-pengepul").classList.contains("active")) renderPengepul();
        if (document.getElementById("tab-tukang-kayu").classList.contains("active")) renderTukangKayu();
    }

    let adaTanamanAktif = Object.keys(gameState.lahan).length > 0;
    if (adaTanamanAktif && document.getElementById("tab-lahan").classList.contains("active")) {
        renderLahan();
    }
}, 1500);


// Inisialisasi Game
window.onload = function() {
    lastMenitFluktuasi = Math.floor(gameState.waktuMenit / 10);
    updateHeaderUI();
    renderLahan();
    renderSupermarket();
    renderTukangKayu();
    renderPengepul();
    renderTas();
};
