// ==========================================
// DATA LOKAL TANAMAN (SILAHKAN ATUR DI SINI)
// ==========================================
let libraryTanaman = [
    {
        nama: 'Semangka',
        namaBibit: 'Bibit Semangka',
        iconBibit: '🌱',
        iconBuah: '🍉',
        BasehargaBeli: 600,
        BasehargaJual: 750,
        waktuTumbuh: 30000 
    },
    {
        nama: 'Melon',
        namaBibit: 'Bibit Melon',
        iconBibit: '🌱',
        iconBuah: '🍈',
        BasehargaBeli: 400,
        BasehargaJual: 600,
        waktuTumbuh: 15000
    },
    {
        nama: 'Jagung',
        namaBibit: 'Bibit Jagung',
        iconBibit: '🌱',
        iconBuah: '🌽',
        BasehargaBeli: 1000,
        BasehargaJual: 1600,
        waktuTumbuh: 45000
    }
];

const itemSpesial = { 
    nama: 'Pupuk Kompos', 
    icon: '💩', 
    hargaBeli: 100, 
    efekWaktu: 9000 
}; 

let uang = 3500; 
let inventory = []; 
let jumlahPupuk = 0; 
let lahan = [
    { id: 1, status: 'kosong', tanaman: null, waktuSelesai: 0, timerInterval: null } 
]; 
let lahanTambahanDibeli = 0; 
const limitLahanTambahan = 6; 
let hargaTambahLahan = 5000; 

let currentTransactionType = 'beli'; 
let currentTransactionItem = ''; 
let currentTransactionPrice = 0; 
let currentQty = 1; 
let maxQtyAllowed = 99; 

let hargaBeliAktif = {}; 
let hargaJualAktif = {}; 
let playerName = "Petani Pintar";

// Sistem Fluktuasi Harga Pasar (Per 1 Menit)
function updateFluktuasiHarga() {
    libraryTanaman.forEach(tanaman => {
        let baseBeli = Number(tanaman.BasehargaBeli) || 0; 
        let baseJual = Number(tanaman.BasehargaJual) || 0; 

        let variasiBeli = (Math.random() * 0.16) - 0.06; 
        let hargaBeliBaru = baseBeli * (1 + variasiBeli);
        hargaBeliAktif[tanaman.namaBibit] = Math.round(hargaBeliBaru); 

        let variasiJual = (Math.random() * 1.03) - 0.35; 
        let hargaJualBaru = baseJual * (1 + variasiJual);
        hargaJualAktif[tanaman.nama] = Math.round(hargaJualBaru); 
    }); 

    if (document.getElementById('tab-pasar').classList.contains('active')) {
        renderPasar(); 
    } 
} 

function formatRupiah(angka) {
    return angka.toLocaleString('id-ID'); 
} 

function updateUangDisplay() {
    document.getElementById('player-koin').innerText = `Rp ${formatRupiah(uang)}`; 
} 

let toastTimeout = null; 
function showToast(message, type = 'success') {
    const overlay = document.getElementById('toast-overlay'); 
    const card = document.getElementById('toast-card'); 
    const icon = document.getElementById('toast-icon'); 
    const msg = document.getElementById('toast-message'); 
    
    card.className = `toast-card ${type}`; 
    icon.innerHTML = type === 'success' ? '✓' : '✕'; 
    msg.innerText = message; 
    overlay.style.display = 'flex'; 
    
    if (toastTimeout) clearTimeout(toastTimeout); 
    toastTimeout = setTimeout(() => { 
        overlay.style.display = 'none'; 
    }, 400); 
} 

function openGameTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); 
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active')); 
    
    document.getElementById('tab-' + tabName).classList.add('active'); 
    event.currentTarget.classList.add('active'); 
    
    if (tabName === 'inventory') renderInventory(); 
    if (tabName === 'menanam') renderLahan(); 
    if (tabName === 'pasar') renderPasar(); 
} 

function openGameTabeksplisit(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); 
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active')); 
    
    document.getElementById('tab-' + tabName).classList.add('active'); 
    
    const navButtons = document.querySelectorAll('.nav-tabs .tab-btn');
    if (tabName === 'menanam' && navButtons[0]) navButtons[0].classList.add('active');
    if (tabName === 'inventory' && navButtons[1]) navButtons[1].classList.add('active');
    if (tabName === 'pasar' && navButtons[2]) navButtons[2].classList.add('active');
} 

function renderPasar() {
    const container = document.getElementById('pasar-container'); 
    let html = ''; 
    
    libraryTanaman.forEach(tanaman => {
        let hargaToko = hargaBeliAktif[tanaman.namaBibit] || tanaman.BasehargaBeli; 
        html += ` 
            <div class="card-item"> 
                <div> 
                    <strong>${tanaman.iconBibit} ${tanaman.namaBibit}</strong><br> 
                    <small>Harga: Rp ${formatRupiah(hargaToko)} | Waktu: ${tanaman.waktuTumbuh / 1000} Detik</small> 
                </div> 
                <button class="btn-buy" onclick="bukaModalTransaksi('beli', '${tanaman.namaBibit}', ${hargaToko})">Beli</button> 
            </div> 
        `; 
    }); 
    
    html += ` 
        <div class="card-item"> 
            <div> 
                <strong>${itemSpesial.icon} ${itemSpesial.nama}</strong><br> 
                <small>Harga: Rp ${formatRupiah(itemSpesial.hargaBeli)} | Efek: Cepat ${itemSpesial.efekWaktu / 1000} Detik</small> 
            </div> 
            <button class="btn-buy" style="background-color: #795548;" onclick="bukaModalTransaksi('beli', '${itemSpesial.nama}', ${itemSpesial.hargaBeli})">Beli</button> 
        </div> 
    `; 
    
    container.innerHTML = html; 

    let btnTambah = document.getElementById('btn-tambah-lahan'); 
    if (btnTambah) {
        if (lahanTambahanDibeli >= limitLahanTambahan) {
            btnTambah.style.display = 'none'; 
        } else {
            btnTambah.style.display = 'block'; 
            btnTambah.innerText = `➕ Beli Lahan Baru (Rp ${formatRupiah(hargaTambahLahan)})`; 
        } 
    } 
} 

function renderLahan() {
    const container = document.getElementById('lahan-container'); 
    let html = ''; 
    
    lahan.forEach((l, index) => {
        let dataTanaman = libraryTanaman.find(t => t.nama === l.tanaman); 
        let iconTampil = dataTanaman ? dataTanaman.iconBuah : '🌱'; 
        
        html += ` 
            <div class="farm-land"> 
                <p id="status-lahan-${index}" style="font-size: 13px; font-weight: bold; margin-bottom: 8px;"> 
                    ${l.status === 'kosong' ? 'Lahan Kosong' : l.status === 'siap_panen' ? `✨ ${iconTampil}${l.tanaman}` : `🌱 ${l.tanaman}`} 
                </p> 
                <small id="waktu-lahan-${index}" style="display: ${l.status === 'ditanam' ? 'block' : 'none'}; font-size: 11px; margin-bottom: 8px; color: #fff8e1;"></small> 
                ${l.status === 'kosong' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px;" onclick="openGameTabeksplisit('inventory'); renderInventory();">Tanam Bibit</button>` : ''} 
                ${l.status === 'ditanam' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #795548;" onclick="gunakanPupuk(${index})">Pupuk (${jumlahPupuk})</button>` : ''} 
                ${l.status === 'siap_panen' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #f57f17;" onclick="panenTanaman(${index})">Panen</button>` : ''} 
            </div> 
        `; 
    }); 
    
    container.innerHTML = html; 
} 

function beliLahan() {
    if (lahanTambahanDibeli >= limitLahanTambahan) {
        showToast('Batas maksimal lahan tercapai!', 'error'); 
        return; 
    } 
    if (uang < hargaTambahLahan) {
        showToast(`Uang kurang! Butuh Rp ${formatRupiah(hargaTambahLahan)}`, 'error'); 
        return; 
    } 
    
    uang -= hargaTambahLahan; 
    updateUangDisplay(); 
    
    lahan.push({
        id: lahan.length + 1, 
        status: 'kosong', 
        tanaman: null, 
        waktuSelesai: 0, 
        timerInterval: null 
    }); 
    
    lahanTambahanDibeli++; 
    showToast('Berhasil menambah lahan!', 'success'); 
    hargaTambahLahan = Math.round(hargaTambahLahan * 2.5); 
    
    simpanGame();
    renderPasar(); 
    openGameTabeksplisit('menanam'); 
    renderLahan(); 
} 

function pilihBibitUntukDitanam(namaBibit) {
    let emptyIndex = lahan.findIndex(l => l.status === 'kosong'); 
    if (emptyIndex === -1) {
        showToast('Semua lahan sedang terisi!', 'error'); 
        return; 
    } 
    
    let item = inventory.find(i => i.nama === namaBibit); 
    if (item) {
        item.jumlah -= 1; 
        if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== namaBibit); 
    } 
    
    let dataBibit = libraryTanaman.find(t => t.namaBibit === namaBibit); 
    let bibitDipilih = dataBibit ? dataBibit.nama : namaBibit.replace('Bibit ', ''); 
    let durasiMs = dataBibit ? dataBibit.waktuTumbuh : 15000; 
    
    let targetLahan = lahan[emptyIndex]; 
    targetLahan.status = 'ditanam'; 
    targetLahan.tanaman = bibitDipilih; 
    targetLahan.waktuSelesai = new Date().getTime() + durasiMs; 
    
    simpanGame();
    openGameTabeksplisit('menanam'); 
    renderLahan(); 
    mulaiTimerLahan(emptyIndex); 
} 

function mulaiTimerLahan(index) {
    let l = lahan[index]; 
    if (l.timerInterval) clearInterval(l.timerInterval); 
    
    l.timerInterval = setInterval(() => {
        let sisaWaktu = l.waktuSelesai - new Date().getTime(); 
        let waktuEl = document.getElementById(`waktu-lahan-${index}`); 
        
        if (sisaWaktu <= 0) {
            clearInterval(l.timerInterval); 
            l.status = 'siap_panen'; 
            renderLahan(); 
        } else {
            let jam = Math.floor((sisaWaktu % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
            let menit = Math.floor((sisaWaktu % (1000 * 60 * 60)) / (1000 * 60)); 
            let detik = Math.floor((sisaWaktu % (1000 * 60)) / 1000); 
            let formatWaktu = `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`; 
            
            if(waktuEl) waktuEl.innerText = `⏱️ ${formatWaktu}`; 
        } 
    }, 1000); 
} 

function gunakanPupuk(index) {
    let l = lahan[index]; 
    if (l.status !== 'ditanam') return; 
    
    if (jumlahPupuk <= 0) {
        showToast('Pupuk Kompos habis!', 'error'); 
        return; 
    } 
    
    jumlahPupuk -= 1; 
    l.waktuSelesai -= itemSpesial.efekWaktu; 
    
    if (l.waktuSelesai <= new Date().getTime()) {
        l.waktuSelesai = new Date().getTime(); 
    } 
    
    simpanGame();
    renderLahan(); 
    showToast(`Dipercepat ${itemSpesial.efekWaktu / 1000} Detik!`, 'success'); 
} 

function panenTanaman(index) {
    let l = lahan[index]; 
    if (l.status !== 'siap_panen') return; 
    
    tambahKeInventory(l.tanaman, 1); 
    showToast(`Panen 1 ${l.tanaman}!`, 'success'); 
    
    l.status = 'kosong'; 
    l.tanaman = null; 
    l.waktuSelesai = 0; 
    
    if (l.timerInterval) clearInterval(l.timerInterval); 
    simpanGame();
    renderLahan(); 
} 

function bukaModalTransaksi(tipe, namaBarang, harga, stokMaksimal = 0) {
    currentTransactionType = tipe; 
    currentTransactionItem = namaBarang; 
    currentTransactionPrice = harga; 
    
    if (tipe === 'beli') {
        document.getElementById('modal-title').innerText = `Beli ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Beli'; 
        let maxMampuBeli = Math.floor(uang / harga); 
        maxQtyAllowed = Math.min(99, maxMampuBeli); 
        if (maxQtyAllowed < 1) maxQtyAllowed = 1; 
    } else if (tipe === 'jual') {
        document.getElementById('modal-title').innerText = `Jual ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Jual'; 
        maxQtyAllowed = stokMaksimal; 
    } 
    
    currentQty = (maxQtyAllowed > 0) ? 1 : 0; 
    document.getElementById('modal-price').innerText = `Harga Satuan: Rp ${formatRupiah(harga)}`; 
    updateModalDisplay(); 
    
    document.getElementById('transaction-modal').style.display = 'flex'; 
} 

function tutupModalTransaksi() {
    document.getElementById('transaction-modal').style.display = 'none'; 
} 

function ubahQty(amount) {
    currentQty += amount; 
    if (currentQty > maxQtyAllowed) currentQty = maxQtyAllowed; 
    if (currentQty < 1 && maxQtyAllowed > 0) currentQty = 1; 
    if (maxQtyAllowed === 0) currentQty = 0; 
    updateModalDisplay(); 
} 

function setQtyMaks() {
    currentQty = maxQtyAllowed; 
    if (currentQty === 0 && currentTransactionType === 'beli') currentQty = 1; 
    updateModalDisplay(); 
} 

function updateModalDisplay() {
    document.getElementById('modal-qty-display').innerText = currentQty; 
    let total = currentQty * currentTransactionPrice; 
    document.getElementById('modal-total-price').innerText = `Rp ${formatRupiah(total)}`; 
} 

function konfirmasiTransaksi() {
    if (currentQty <= 0) {
        showToast('Jumlah tidak valid!', 'error'); 
        return; 
    } 
    
    let totalHarga = currentQty * currentTransactionPrice; 
    
    if (currentTransactionType === 'beli') {
        if (uang >= totalHarga) {
            uang -= totalHarga; 
            updateUangDisplay(); 
            
            if (currentTransactionItem === itemSpesial.nama) {
                jumlahPupuk += currentQty; 
                renderLahan(); 
            } else {
                tambahKeInventory(currentTransactionItem, currentQty); 
            } 
            
            tutupModalTransaksi(); 
            simpanGame();
            showToast(`Membeli ${currentQty} ${currentTransactionItem}!`, 'success'); 
        } else {
            showToast('Uang tidak cukup!', 'error'); 
        } 
    } else if (currentTransactionType === 'jual') {
        let item = inventory.find(i => i.nama === currentTransactionItem); 
        if (!item || item.jumlah < currentQty) {
            showToast('Item tidak cukup untuk dijual!', 'error'); 
            return; 
        } 
        
        item.jumlah -= currentQty; 
        if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== currentTransactionItem); 
        
        uang += totalHarga; 
        updateUangDisplay(); 
        tutupModalTransaksi(); 
        simpanGame();
        showToast(`Terjual ${currentQty} item seharga Rp ${formatRupiah(totalHarga)}!`, 'success'); 
        renderInventory(); 
    } 
} 

function tambahKeInventory(namaItem, jumlah) {
    let existing = inventory.find(item => item.nama === namaItem); 
    if (existing) existing.jumlah += jumlah; 
    else inventory.push({ nama: namaItem, jumlah: jumlah }); 
} 

function renderInventory() {
    const container = document.getElementById('inventory-list'); 
    if (inventory.length === 0) {
        container.innerHTML = '<p style="color: #777; font-style: italic;">Inventory masih kosong.</p>'; 
        return; 
    } 
    
    let html = ''; 
    inventory.forEach((item) => {
        let icon = '📦'; 
        let actionButton = ''; 
        let dataTanaman = libraryTanaman.find(t => t.namaBibit === item.nama || t.nama === item.nama); 
        
        if (item.nama.includes('Bibit')) {
            icon = dataTanaman ? dataTanaman.iconBibit : '🌱'; 
            let hasEmptyLand = lahan.some(l => l.status === 'kosong'); 
            if (hasEmptyLand) {
                actionButton = `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>`; 
            } else {
                actionButton = `<small style="color:red; font-size: 10px;">Lahan Penuh</small>`; 
            } 
        } else {
            icon = dataTanaman ? dataTanaman.iconBuah : '📦'; 
            let hargaJualSatuan = hargaJualAktif[item.nama] || 0; 
            actionButton = ` 
                <div style="text-align: right;"> 
                    <small style="display: block; color: #555; font-size: 10px;">Jual: Rp ${formatRupiah(hargaJualSatuan)}</small> 
                    <button class="btn-sell" onclick="bukaModalTransaksi('jual', '${item.nama}', ${hargaJualSatuan}, ${item.jumlah})">Jual</button> 
                </div> 
            `; 
        } 
        
        html += ` 
            <div class="inventory-item"> 
                <div> 
                    <span>${icon} <strong>${item.nama}</strong></span><br> 
                    <small style="color: #666;">Jumlah: <strong>${item.jumlah}</strong></small> 
                </div> 
                ${actionButton} 
            </div> 
        `; 
    }); 
    
    container.innerHTML = html; 
} 

// ==========================================
// FITUR SIMPAN, MUAT, & NICKNAME (LOCALSTORAGE)
// ==========================================
function ubahNickname() {
    let namaBaru = prompt("Masukkan Nickname / Nama Petani baru:", playerName);
    if (namaBaru && namaBaru.trim() !== "") {
        playerName = namaBaru.trim();
        document.getElementById('player-nickname').innerText = `${playerName} ✏️`;
        simpanGame();
        showToast("Nickname berhasil diubah!", "success");
    }
}

function simpanGame() {
    let dataGame = {
        playerName: playerName,
        uang: uang,
        inventory: inventory,
        jumlahPupuk: jumlahPupuk,
        lahan: lahan.map(l => ({
            id: l.id,
            status: l.status,
            tanaman: l.tanaman,
            waktuSelesai: l.waktuSelesai
        })),
        lahanTambahanDibeli: lahanTambahanDibeli,
        hargaTambahLahan: hargaTambahLahan
    };
    localStorage.setItem('saveGameBertani', JSON.stringify(dataGame));
    showToast("Progres berhasil disimpan!", "success");
}

function muatGame() {
    let savedData = localStorage.getItem('saveGameBertani');
    if (savedData) {
        try {
            let data = JSON.parse(savedData);
            playerName = data.playerName || "Petani Pintar";
            uang = data.uang !== undefined ? data.uang : 3500;
            inventory = data.inventory || [];
            jumlahPupuk = data.jumlahPupuk || 0;
            lahanTambahanDibeli = data.lahanTambahanDibeli || 0;
            hargaTambahLahan = data.hargaTambahLahan || 5000;
            
            if (data.lahan && data.lahan.length > 0) {
                lahan = data.lahan.map(l => {
                    let timer = null;
                    // Jika saat disimpan statusnya sedang ditanam, aktifkan kembali timernya
                    return {
                        id: l.id,
                        status: l.status,
                        tanaman: l.tanaman,
                        waktuSelesai: l.waktuSelesai,
                        timerInterval: timer
                    };
                });
            }
        } catch (e) {
            console.error("Gagal memuat save data", e);
        }
    }
}

function resetGame() {
    if (confirm("Yakin ingin mereset semua progres permainan dari awal?")) {
        localStorage.removeItem('saveGameBertani');
        location.reload();
    }
}

// ==========================================
// INISIALISASI GAME
// ==========================================
function initGame() {
    muatGame(); // Muat data tersimpan dari memori browser
    updateFluktuasiHarga(); 
    setInterval(updateFluktuasiHarga, 60000); 
    
    renderPasar(); 
    renderLahan(); 
    updateUangDisplay();
    
    let elNick = document.getElementById('player-nickname');
if(elNick) elNick.innerText = `👨‍🌾 ${playerName} ✏️`;

    // Jalankan ulang timer untuk lahan yang sedang berjalan
    lahan.forEach((l, index) => {
        if (l.status === 'ditanam') {
            if (l.waktuSelesai <= new Date().getTime()) {
                l.status = 'siap_panen';
            } else {
                mulaiTimerLahan(index);
            }
        }
    });
} 

// Jalankan game saat dimuat
initGame();
