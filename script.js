// State Utama Game & Inventaris Tas
let gameState = {
    namaPemain: "Pak Tani",
    uang: 500,
    cuaca: "Cerah ☀️",
    waktuJam: 8, 
    waktuMenit: 0,
    jumlahLahanAktif: 3,
    // Tas menyimpan item dengan format: { idItem: jumlah }
    tas: {
        padi: 2, // Modal awal tes 2 biji padi agar langsung bisa dicoba tanam
        jagung: 1
    }
};

// Variabel Transaksi Popup
let transaksiAktif = {
    idItem: "",
    namaItem: "",
    hargaSatuan: 0,
    tipe: "" // "beli" atau "jual"
};

// Variabel Target Lahan yang Sedang Dipilih untuk Menanam
let lahanTargetAktif = null;

// Fungsi Ganti Tab Menu
function gantiTab(evt, tabId) {
    let contents = document.querySelectorAll(".tab-content");
    contents.forEach(c => c.classList.remove("active"));

    let buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(b => b.classList.remove("active"));

    document.getElementById(tabId).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    // Refresh render saat tab dibuka
    if (tabId === 'tab-tas') renderTas();
    if (tabId === 'tab-supermarket') renderSupermarket();
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

// Format Durasi Waktu
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

// --- TAB LAHAN & POPUP TANAM DARI TAS ---

function renderLahan() {
    const container = document.getElementById("grid-lahan");
    if (!container) return;
    container.innerHTML = "";

    for (let i = 1; i <= gameState.jumlahLahanAktif; i++) {
        container.innerHTML += `
            <div class="card lahan-card">
                <h3>Lahan #${i}</h3>
                <p>🌿 Kosong</p>
                <button onclick="bukaModalTanam(${i})">Tanam Bibit</button>
            </div>
        `;
    }
}

// Buka Popup Pilihan Bibit dari Tas saat Klik Tanam
function bukaModalTanam(nomorLahan) {
    lahanTargetAktif = nomorLahan;
    
    // Buat atau pastikan elemen modal tanam ada di halaman
    let modalTanam = document.getElementById("modal-tanam");
    if (!modalTanam) {
        modalTanam = document.createElement("div");
        modalTanam.id = "modal-tanam";
        modalTanam.className = "modal-overlay";
        modalTanam.innerHTML = `
            <div class="modal-card">
                <h3>Pilih Bibit dari Tas</h3>
                <p>Pilih bibit yang tersedia di inventaris untuk ditanam di Lahan #${nomorLahan}</p>
                <div id="list-bibit-tas" style="max-height: 200px; overflow-y: auto; margin: 15px 0; display: flex; flex-direction: column; gap: 8px;"></div>
                <button class="btn-cancel" onclick="tutupModalTanam()" style="width:100%; padding: 8px;">Batal</button>
            </div>
        `;
        document.body.appendChild(modalTanam);
    } else {
        modalTanam.querySelector("h3").innerText = `Pilih Bibit untuk Lahan #${nomorLahan}`;
    }

    // Render daftar bibit yang ada di tas (milik kategori tanaman)
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
                <div style="display: flex; justify-content: space-between; align-items: center; background: #f9f9f9; padding: 8px; border-radius: 6px;">
                    <span>${infoBibit.icon} ${infoBibit.nama} (Stok: ${jumlahDiTas})</span>
                    <button onclick="konfirmasiTanam('${idBibit}')" style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Tanam</button>
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

function konfirmasiTanam(idBibit) {
    if (gameState.tas[idBibit] && gameState.tas[idBibit] > 0) {
        gameState.tas[idBibit] -= 1;
        if (gameState.tas[idBibit] <= 0) delete gameState.tas[idBibit];

        alert(`Berhasil menanam bibit di Lahan #${lahanTargetAktif}!`);
        tutupModalTanam();
        renderTas();
    } else {
        alert("Bibit di tas tidak mencukupi!");
    }
}


// --- TAB SUPERMARKET & POPUP PEMBELIAN MODERN ---

function renderSupermarket() {
    const container = document.getElementById("list-supermarket");
    if (!container) return;
    container.innerHTML = "";

    const daftarTanaman = GAME_DATABASE.tanaman;

    for (let key in daftarTanaman) {
        let item = daftarTanaman[key];
        let hargaDinamis = MarketEconomy ? MarketEconomy.getHargaBeli(item.hargaBeli) : item.hargaBeli;
        let durasiTumbuh = formatDurasi(item.durasi);

        container.innerHTML += `
            <div class="card">
                <div style="font-size: 2.5rem;">${item.icon}</div>
                <h3>${item.nama}</h3>
                <p>Beli: <b>Rp. ${hargaDinamis}</b></p>
                <p>Jual: Rp. ${item.hargaJual}</p>
                <p>⏱️ ${durasiTumbuh}</p>
                <p>✨ XP: ${item.xp}</p>
                <button onclick="bukaModalBeli('${item.id}', '${item.nama}', ${hargaDinamis})">Beli Bibit</button>
            </div>
        `;
    }
}

// Buka Modal Beli Modern
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
    
    if (jumlahMaks < 1) {
        jumlahMaks = 1; 
    }
    
    document.getElementById("input-jumlah-beli").value = jumlahMaks;
    updateTotalHargaModal();
}

function updateTotalHargaModal() {
    let jumlah = parseInt(document.getElementById("input-jumlah-beli").value) || 0;
    let totalHarga = jumlah * transaksiAktif.hargaSatuan;
    
    document.getElementById("modal-total").innerText = `Total: Rp. ${totalHarga.toLocaleString('id-ID')}`;
}

// Konfirmasi Transaksi Sukses dengan Popup Interaktif
function konfirmasiBeli() {
    let jumlah = parseInt(document.getElementById("input-jumlah-beli").value) || 0;
    let totalHarga = jumlah * transaksiAktif.hargaSatuan;
    
    if (gameState.uang >= totalHarga) {
        gameState.uang -= totalHarga;
        
        // Masukkan barang ke dalam Tas / Inventaris
        if (!gameState.tas[transaksiAktif.idItem]) {
            gameState.tas[transaksiAktif.idItem] = 0;
        }
        gameState.tas[transaksiAktif.idItem] += jumlah;

        updateHeaderUI();
        alert(`🎉 Pembelian Berhasil!\nKamu membeli ${jumlah} ${transaksiAktif.namaItem} seharga Rp. ${totalHarga.toLocaleString('id-ID')}. Barang telah dimasukkan ke Tas!`);
        tutupModalBeli();
        renderTas();
    } else {
        alert("⚠️ Uang kamu tidak cukup untuk melakukan pembelian ini!");
    }
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
            // Cek detail item dari database tanaman (atau nanti database lain)
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


// Inisialisasi Game
window.onload = function() {
    updateHeaderUI();
    renderLahan();
    renderSupermarket();
    renderTas();
};
