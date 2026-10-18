// State Utama Game & Inventaris Tas (Mulai dari Nol/Kosong)
let gameState = {
    namaPemain: "Pak Tani",
    uang: 500,
    cuaca: "Cerah ☀️",
    waktuJam: 8, 
    waktuMenit: 0,
    jumlahLahanAktif: 3,
    tas: {},    // Kosong tanpa item awal
    lahan: {}   // Kosong tanpa tanaman awal
};

let transaksiAktif = {
    idItem: "",
    namaItem: "",
    hargaSatuan: 0,
    tipe: "" 
};

let lahanTargetAktif = null;

// Fungsi Ganti Tab Menu
function gantiTab(evt, tabId) {
    let contents = document.querySelectorAll(".tab-content");
    contents.forEach(c => c.classList.remove("active"));

    let buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    if (tabId === 'tab-tas') renderTas();
    if (tabId === 'tab-supermarket') renderSupermarket();
    if (tabId === 'tab-lahan') renderLahan();
}

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

// Format Durasi Waktu Detik ke Teks
function formatDurasiWaktu(detikSisa) {
    if (detikSisa <= 0) return "Siap Panen! ✨";
    let jam = Math.floor(detikSisa / 3600);
    let menit = Math.floor((detikSisa % 3600) / 60);
    let detik = detikSisa % 60;
    
    if (jam > 0) {
        return `${jam}j ${menit}m ${detik}d`;
    } else if (menit > 0) {
        return `${menit}m ${detik}d`;
    } else {
        return `${detik} Detik`;
    }
}


// --- TAB LAHAN & VISUAL TANAM ---

function renderLahan() {
    const container = document.getElementById("grid-lahan");
    if (!container) return;
    container.innerHTML = "";

    const waktuSekarang = Date.now();

    for (let i = 1; i <= gameState.jumlahLahanAktif; i++) {
        let dataLahan = gameState.lahan[i];

        if (!dataLahan) {
            container.innerHTML += `
                <div class="card lahan-card">
                    <h3>Lahan #${i}</h3>
                    <p>🌿 Kosong</p>
                    <button onclick="bukaModalTanam(${i})">Tanam Bibit</button>
                </div>
            `;
        } else {
            let infoBibit = GAME_DATABASE.tanaman[dataLahan.idBibit] || { nama: "Tanaman", icon: "🌱" };
            let sisaDetik = Math.max(0, Math.floor((dataLahan.waktuSelesai - waktuSekarang) / 1000));
            let teksWaktu = formatDurasiWaktu(sisaDetik);

            let tombolAksi = sisaDetik === 0 
                ? `<button onclick="panenHasil(${i})" style="background: #e67e22; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">Panen (${dataLahan.jumlah})</button>`
                : `<button disabled style="background: #95a5a6; color:white; border:none; padding:6px 12px; border-radius:4px; cursor: not-allowed;">Tumbuh... (${teksWaktu})</button>`;

            container.innerHTML += `
                <div class="card lahan-card" style="border: 2px solid #27ae60; background: #e8f8f5;">
                    <h3>Lahan #${i}</h3>
                    <div style="font-size: 2.5rem; margin: 5px 0;">${infoBibit.icon}</div>
                    <p><b>${infoBibit.nama}</b></p>
                    <p>Jumlah: <b>${dataLahan.jumlah} Pcs</b></p>
                    <p style="font-size: 0.9rem; color: #c0392b; font-weight: bold;">⏱️ ${teksWaktu}</p>
                    ${tombolAksi}
                </div>
            `;
        }
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
                <p id="info-modal-tanam">Pilih bibit dan tentukan jumlah (Maks 99)</p>
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
    const daftarTanaman = GAME_DATABASE.tanaman;

    for (let idBibit in daftarTanaman) {
        let jumlahDiTas = gameState.tas[idBibit] || 0;
        if (jumlahDiTas > 0) {
            adaBibit = true;
            let infoBibit = daftarTanaman[idBibit];
            containerBibit.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #ddd;">
                    <div style="text-align: left;">
                        <b>${infoBibit.icon} ${infoBibit.nama}</b><br>
                        <small style="color:gray;">Stok Tas: ${jumlahDiTas}</small>
                    </div>
                    <button onclick="bukaSubModalJumlahTanam('${idBibit}', ${jumlahDiTas})" style="background: #27ae60; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Pilih</button>
                </div>
            `;
        }
    }

    if (!adaBibit) {
        containerBibit.innerHTML = `<p style="color: #e74c3c; font-style: italic;">Tas kamu kosong dari bibit! Beli dulu di Supermarket.</p>`;
    }

    modalTanam.style.display = "flex";
}

function tutupModalTanam() {
    let modalTanam = document.getElementById("modal-tanam");
    if (modalTanam) modalTanam.style.display = "none";
}

function bukaSubModalJumlahTanam(idBibit, stokTas) {
    let maksBisaTanam = Math.min(stokTas, 99);
    let infoBibit = GAME_DATABASE.tanaman[idBibit];

    let containerBibit = document.getElementById("list-bibit-tas");
    containerBibit.innerHTML = `
        <div style="text-align: center;">
            <h4>Tanam ${infoBibit.nama}</h4>
            <p>Stok di Tas: <b>${stokTas}</b> (Maks 99 per lahan)</p>
            <div style="display: flex; justify-content: center; gap: 8px; margin: 15px 0;">
                <button onclick="ubahJumlahInputTanam(-1)" style="padding: 5px 10px;">-</button>
                <input type="number" id="input-jml-tanam" value="1" min="1" max="${maksBisaTanam}" style="width: 60px; text-align: center; font-size: 1.1rem;">
                <button onclick="ubahJumlahInputTanam(1)" style="padding: 5px 10px;">+</button>
                <button onclick="document.getElementById('input-jml-tanam').value=${maksBisaTanam}" style="background:#e67e22; color:white; border:none; padding:5px 8px; border-radius:4px;">MAX</button>
            </div>
            <div style="display: flex; gap: 10px;">
                <button onclick="bukaModalTanam(${lahanTargetAktif})" class="btn-cancel" style="flex:1; padding: 8px;">Kembali</button>
                <button onclick="eksekusiTanamBibit('${idBibit}', ${stokTas})" class="btn-confirm" style="flex:1; padding: 8px; background:#27ae60; color:white; border:none; border-radius:4px;">Konfirmasi Tanam</button>
            </div>
        </div>
    `;
}

function ubahJumlahInputTanam(delta) {
    let input = document.getElementById("input-jml-tanam");
    let val = parseInt(input.value || 1) + delta;
    let maks = parseInt(input.max) || 99;
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

    let durasiSatuan = GAME_DATABASE.tanaman[idBibit].durasi;
    let waktuSelesai = Date.now() + (durasiSatuan * 1000);

    gameState.lahan[lahanTargetAktif] = {
        idBibit: idBibit,
        jumlah: jumlahTanam,
        waktuSelesai: waktuSelesai
    };

    tutupModalTanam();
    tampilkanPopupNotifikasi(`🌱 Berhasil Menanam!`, `Berhasil menanam ${jumlahTanam} ${GAME_DATABASE.tanaman[idBibit].nama} di Lahan #${lahanTargetAktif}.`);
    renderLahan();
    renderTas();
}

function panenHasil(nomorLahan) {
    let dataLahan = gameState.lahan[nomorLahan];
    if (!dataLahan) return;

    let idHasil = dataLahan.idBibit;
    let jumlahPanen = dataLahan.jumlah;

    if (!gameState.tas[idHasil]) gameState.tas[idHasil] = 0;
    gameState.tas[idHasil] += jumlahPanen;

    delete gameState.lahan[nomorLahan];

    tampilkanPopupNotifikasi(`🌾 Panen Sukses!`, `Kamu berhasil memanen ${jumlahPanen} item dan menyimpannya ke Tas.`);
    renderLahan();
    renderTas();
}


// --- TAB SUPERMARKET & POPUP MODERN ---

function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    if (!container) return;
    container.innerHTML = "";

    const daftarTanaman = GAME_DATABASE.tanaman;

    for (let key in daftarTanaman) {
        let item = daftarTanaman[key];
        let hargaDinamis = MarketEconomy ? MarketEconomy.getHargaBeli(item.hargaBeli) : item.hargaBeli;
        let durasiTumbuh = formatDurasiWaktu(item.durasi);

        container.innerHTML += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b>Rp. ${hargaDinamis}</b></p>
                <p>Jual: Rp. ${item.hargaJual}</p>
                <p>⏱️ ${durasiTumbuh}</p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaDinamis})">Beli Bibit</button>
            </div>
        `;
    }
}

function bukaModalBeli(idItem, namaItem, harga) {
    transaksiAktif = { idItem, namaItem, hargaSatuan: harga, tipe: 'beli' };
    
    document.getElementById("modal-title").innerText = `Beli ${namaItem}`;
    document.getElementById("modal-info").innerText = `Harga: Rp. ${harga.toLocaleString('id-ID')} / biji`;
    document.getElementById("input-jumlah-beli").value = 1;
    
    updateTotalHargaModal();
    document.getElementById("modal-beli").style.display = "flex";
}

function tutupModalBeli() {
    document.getElementById("modal-beli").style.display = "none";
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
        
        if (!gameState.tas[transaksiAktif.idItem]) {
            gameState.tas[transaksiAktif.idItem] = 0;
        }
        gameState.tas[transaksiAktif.idItem] += jumlah;

        updateHeaderUI();
        tutupModalBeli();
        
        tampilkanPopupNotifikasi(`🎉 Pembelian Berhasil!`, `Kamu membeli ${jumlah} ${transaksiAktif.namaItem} seharga Rp. ${totalHarga.toLocaleString('id-ID')}.`);
        renderTas();
    } else {
        alert("⚠️ Uang kamu tidak cukup untuk melakukan pembelian ini!");
    }
}


// --- POPUP NOTIFIKASI MODERN ESTETIK ---

function tampilkanPopupNotifikasi(judul, pesan) {
    let modalNotif = document.getElementById("modal-notifikasi-custom");
    if (!modalNotif) {
        modalNotif = document.createElement("div");
        modalNotif.id = "modal-notifikasi-custom";
        modalNotif.className = "modal-overlay";
        modalNotif.innerHTML = `
            <div class="modal-card" style="text-align: center;">
                <h3 id="notif-judul" style="color: #27ae60; margin-bottom: 10px;"></h3>
                <p id="notif-pesan" style="margin-bottom: 20px; color: #333; line-height: 1.4;"></p>
                <button onclick="tutupPopupNotifikasi()" style="background: #27ae60; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">OK</button>
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


// --- TAB TAS / INVENTARIS ---

function renderTas() {
    const container = document.getElementById("grid-tas");
    if (!container) return;
    container.innerHTML = "";

    let adaIsi = false;
    const daftarTanaman = GAME_DATABASE.tanaman;

    for (let idItem in gameState.tas) {
        let jumlah = gameState.tas[idItem];
        if (jumlah > 0) {
            adaIsi = true;
            let dataItem = daftarTanaman[idItem] || { nama: idItem, icon: "📦" };

            container.innerHTML += `
                <div class="card">
                    <div style="font-size: 2.5rem;">${dataItem.icon}</div>
                    <h3>${dataItem.nama}</h3>
                    <p>Jumlah: <b>${jumlah} Pcs</b></p>
                </div>
            `;
        }
    }

    if (!adaIsi) {
        container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: gray;">Tas kamu masih kosong. Belanja bibit di Supermarket atau dapatkan hasil panen!</p>`;
    }
}


// --- SISTEM WAKTU IN-GAME ---
// 15 detik real-time = 10 detik in-game (artinya 1.5 detik real = 1 menit in-game)
setInterval(() => {
    // Tambah 1 menit in-game setiap 1.5 detik real-time
    gameState.waktuMenit += 1;
    if (gameState.waktuMenit >= 60) {
        gameState.waktuMenit = 0;
        gameState.waktuJam += 1;
        if (gameState.waktuJam >= 24) {
            gameState.waktuJam = 0; // Reset ke jam 00:00 hari baru
        }
    }
    updateHeaderUI();

    // Render ulang hitung mundur lahan jika tab lahan sedang aktif
    let adaTanamanAktif = Object.keys(gameState.lahan).length > 0;
    if (adaTanamanAktif && document.getElementById("tab-lahan").classList.contains("active")) {
        renderLahan();
    }
}, 1500);


// Inisialisasi Game
window.onload = function() {
    updateHeaderUI();
    renderLahan();
    renderSupermarket();
    renderTas();
};
