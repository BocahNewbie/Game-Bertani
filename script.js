// ==========================================
// DATA LOKAL TANAMAN & AKSESORI BERDASARKAN SLOT
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
    },
    {
        nama: 'Apel',
        namaBibit: 'Bibit Apel',
        iconBibit: '🌱',
        iconBuah: '🍎',
        BasehargaBeli: 1300,
        BasehargaJual: 2150,
        waktuTumbuh: 90000
    }
];

const itemSpesial = { 
    nama: 'Pupuk Kompos', 
    icon: '💩', 
    hargaBeli: 100, 
    efekWaktu: 9000 
}; 

// Daftar Aksesori dengan Slot Spesifik & Bonus Persentase (%)
let listAksesori = [
    { id: 'sendal', nama: 'Sendal Jepit', icon: '🩴', slot: 'telapak', harga: 15000, bonusPersen: 3 },
    { id: 'caping', nama: 'Caping Petani', icon: '👒', slot: 'kepala', harga: 50000, bonusPersen: 8 },
    { id: 'boxer', nama: 'Celana Boxer', icon: '🩳', slot: 'kaki', harga: 150000, bonusPersen: 12 },
    { id: 'baju', nama: 'Baju Partai', icon: '👕', slot: 'badan', harga: 1200000, bonusPersen: 19 }
];

let uang = 3500; 
let inventory = []; 
let jumlahPupuk = 0; 
let aksesoriDimiliki = []; // ID aksesori yang dibeli

// Slot Aksesori Aktif (Kepala, Badan, Kaki, Telapak)
let slotAktif = {
    kepala: null,
    badan: null,
    kaki: null,
    telapak: null
};

// Struktur Lahan: Mendukung kapasitas hingga 99 bibit per lahan
let lahan = [
    { id: 1, status: 'kosong', tanaman: null, jumlahBibit: 0, waktuSelesai: 0, timerInterval: null } 
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

function hitungTotalBonusPersen() {
    let totalPersen = 0;
    for (let slot in slotAktif) {
        let accId = slotAktif[slot];
        if (accId) {
            let acc = listAksesori.find(a => a.id === accId);
            if (acc) totalPersen += acc.bonusPersen;
        }
    }
    return totalPersen;
}

function updatePanelAksesoriInfo() {
    let kepalaEl = document.getElementById('slot-kepala-display');
    let badanEl = document.getElementById('slot-badan-display');
    let kakiEl = document.getElementById('slot-kaki-display');
    let telapakEl = document.getElementById('slot-telapak-display');
    let totalBonusEl = document.getElementById('total-bonus-display');

    let getInfoAcc = (id) => {
        let a = listAksesori.find(item => item.id === id);
        return a ? `${a.icon} ${a.nama} (+${a.bonusPersen}%)` : 'Kosong';
    };

    kepalaEl.innerText = slotAktif.kepala ? getInfoAcc(slotAktif.kepala) : 'Kosong';
    badanEl.innerText = slotAktif.badan ? getInfoAcc(slotAktif.badan) : 'Kosong';
    kakiEl.innerText = slotAktif.kaki ? getInfoAcc(slotAktif.kaki) : 'Kosong';
    telapakEl.innerText = slotAktif.telapak ? getInfoAcc(slotAktif.telapak) : 'Kosong';

    let total = hitungTotalBonusPersen();
    totalBonusEl.innerText = `+${total}%`;
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
                    <small style="color: #64748b;">Harga: Rp ${formatRupiah(hargaToko)} | Waktu: ${tanaman.waktuTumbuh / 1000} Detik</small> 
                </div> 
                <button class="btn-buy" onclick="bukaModalTransaksi('beli', '${tanaman.namaBibit}', ${hargaToko})">Beli</button> 
            </div> 
        `; 
    }); 
    
    html += ` 
        <div class="card-item"> 
            <div> 
                <strong>${itemSpesial.icon} ${itemSpesial.nama}</strong><br> 
                <small style="color: #64748b;">Harga: Rp ${formatRupiah(itemSpesial.hargaBeli)} | Efek: Cepat ${itemSpesial.efekWaktu / 1000} Detik</small> 
            </div> 
            <button class="btn-buy" style="background-color: #475569;" onclick="bukaModalTransaksi('beli', '${itemSpesial.nama}', ${itemSpesial.hargaBeli})">Beli</button> 
        </div> 
    `; 

    // Render Toko Aksesori Berdasarkan Slot
    html += `<h4 style="margin: 15px 0 8px 0; color: #1e293b; font-size: 14px;">🎩 Toko Aksesori Petani</h4>`;
    listAksesori.forEach(acc => {
        let sudahDimiliki = aksesoriDimiliki.includes(acc.id);
        let sedangDipakai = slotAktif[acc.slot] === acc.id;
        
        let actionBtn = '';
        if (sedangDipakai) {
            actionBtn = `<button class="btn-submit" style="background-color: #10b981;" disabled>Dipakai</button>`;
        } else if (sudahDimiliki) {
            actionBtn = `<button class="btn-submit" style="background-color: #3b82f6;" onclick="pakaiAksesori('${acc.id}')">Pakai</button>`;
        } else {
            actionBtn = `<button class="btn-buy" onclick="beliAksesori('${acc.id}', ${acc.harga})">Beli</button>`;
        }

        html += `
            <div class="card-item">
                <div>
                    <strong>${acc.icon} ${acc.nama}</strong><br>
                    <small style="color: #64748b;">Slot: [${acc.slot.toUpperCase()}] | Bonus: +${acc.bonusPersen}% | Harga: Rp ${formatRupiah(acc.harga)}</small>
                </div>
                ${actionBtn}
            </div>
        `;
    });
    
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

function beliAksesori(id, harga) {
    if (uang < harga) {
        showToast("Uang tidak cukup untuk membeli aksesori ini!", "error");
        return;
    }
    uang -= harga;
    aksesoriDimiliki.push(id);
    
    let acc = listAksesori.find(a => a.id === id);
    if (acc) slotAktif[acc.slot] = id; // Otomatis pasang ke slotnya

    updateUangDisplay();
    updatePanelAksesoriInfo();
    simpanGame();
    renderPasar();
    showToast("Berhasil membeli dan mengenakan aksesori!", "success");
}

function pakaiAksesori(id) {
    let acc = listAksesori.find(a => a.id === id);
    if (acc) {
        slotAktif[acc.slot] = id;
        updatePanelAksesoriInfo();
        simpanGame();
        renderPasar();
        showToast(`Aksesori ${acc.nama} dipasang ke slot ${acc.slot}!`, "success");
    }
}

function renderLahan() {
    const container = document.getElementById('lahan-container'); 
    let html = ''; 
    
    lahan.forEach((l, index) => {
        let dataTanaman = libraryTanaman.find(t => t.nama === l.tanaman); 
        let iconTampil = dataTanaman ? dataTanaman.iconBuah : '🌱'; 
        
        let statusTeks = 'Lahan Kosong';
        if (l.status === 'ditanam') {
            statusTeks = `🌱 ${l.tanaman} (${l.jumlahBibit}/99)`;
        } else if (l.status === 'siap_panen') {
            statusTeks = `✨ ${iconTampil}${l.tanaman} (${l.jumlahBibit} Siap Panen)`;
        }

        html += ` 
            <div class="farm-land"> 
                <p id="status-lahan-${index}" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1e293b;"> 
                    ${statusTeks} 
                </p> 
                <small id="waktu-lahan-${index}" style="display: ${l.status === 'ditanam' ? 'block' : 'none'}; font-size: 11px; margin-bottom: 8px; color: #3b82f6; font-weight: bold;"></small> 
                ${l.status === 'kosong' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px;" onclick="bukaModalTanam(${index})">Tanam Bibit</button>` : ''} 
                ${l.status === 'ditanam' ? `<div style="display:flex; gap:4px;"><button class="btn-submit" style="padding: 6px; font-size: 10px; flex:1;" onclick="bukaModalTambahBibit(${index})">+ Bibit</button><button class="btn-submit" style="padding: 6px; font-size: 10px; flex:1; background-color: #475569;" onclick="gunakanPupuk(${index})">Pupuk</button></div>` : ''} 
                ${l.status === 'siap_panen' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #d97706;" onclick="panenTanaman(${index})">Panen</button>` : ''} 
            </div> 
        `; 
    }); 
    
    container.innerHTML = html; 
} 

// Fungsi khusus untuk memilih dan menanam bibit hingga maksimal 99 dalam 1 lahan
function bukaModalTanam(indexLahan) {
    // Cari bibit apa saja yang ada di inventory
    let bibitDiInv = inventory.filter(i => i.nama.includes('Bibit'));
    if (bibitDiInv.length === 0) {
        showToast('Kamu tidak punya bibit di inventory!', 'error');
        openGameTabeksplisit('pasar');
        return;
    }
    
    // Untuk sederhana, ambil bibit pertama yang tersedia atau buat pilihan
    let bibitDipilih = bibitDiInv[0].nama;
    tanamBibitKeLahan(indexLahan, bibitDipilih, 1);
}

function tanamBibitKeLahan(indexLahan, namaBibit, jumlahAwal) {
    let item = inventory.find(i => i.nama === namaBibit);
    if (!item || item.jumlah < jumlahAwal) {
        showToast('Jumlah bibit tidak cukup!', 'error');
        return;
    }

    item.jumlah -= jumlahAwal;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== namaBibit);

    let dataBibit = libraryTanaman.find(t => t.namaBibit === namaBibit);
    let bibitNamaBersih = dataBibit ? dataBibit.nama : namaBibit.replace('Bibit ', '');
    let durasiMs = dataBibit ? dataBibit.waktuTumbuh : 15000;

    let targetLahan = lahan[indexLahan];
    targetLahan.status = 'ditanam';
    targetLahan.tanaman = bibitNamaBersih;
    targetLahan.jumlahBibit = jumlahAwal;
    targetLahan.waktuSelesai = new Date().getTime() + durasiMs;

    simpanGame();
    openGameTabeksplisit('menanam');
    renderLahan();
    mulaiTimerLahan(indexLahan);
    showToast(`Berhasil menanam ${jumlahAwal} ${bibitNamaBersih}!`, 'success');
}

function bukaModalTambahBibit(indexLahan) {
    let l = lahan[indexLahan];
    if (l.status !== 'ditanam') return;

    let sisaKapasitas = 99 - l.jumlahBibit;
    if (sisaKapasitas <= 0) {
        showToast('Lahan sudah penuh (maksimal 99 bibit)!', 'error');
        return;
    }

    let namaBibitLengkap = `Bibit ${l.tanaman}`;
    let item = inventory.find(i => i.nama === namaBibitLengkap);
    if (!item || item.jumlah <= 0) {
        showToast(`Kamu tidak punya stok ${namaBibitLengkap} di inventory!`, 'error');
        return;
    }

    let jumlahTambah = Math.min(sisaKapasitas, item.jumlah, 10); // Tambah sekaligus maksimal 10 atau sisa kapasitas
    item.jumlah -= jumlahTambah;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== namaBibitLengkap);

    l.jumlahBibit += jumlahTambah;
    simpanGame();
    renderLahan();
    showToast(`Menambahkan ${jumlahTambah} bibit ke lahan ini!`, 'success');
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
        jumlahBibit: 0,
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
        showToast('Semua lahan sedang terisi! Gunakan tombol + Bibit pada lahan aktif.', 'error'); 
        return; 
    } 
    tanamBibitKeLahan(emptyIndex, namaBibit, 1);
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

// --- PERHITUNGAN PANEN DENGAN BONUS PERSENTASE AKSESORI ---
function panenTanaman(index) {
    let l = lahan[index]; 
    if (l.status !== 'siap_panen') return; 
    
    // Perhitungan: Jumlah bibit awal dikali dengan total bonus persentase aksesori
    let totalBonusPersen = hitungTotalBonusPersen(); // Contoh: 19 + 8 = 27%
    let bonusTambahan = Math.floor(l.jumlahBibit * (totalBonusPersen / 100));
    let jumlahPanenTotal = l.jumlahBibit + bonusTambahan;

    tambahKeInventory(l.tanaman, jumlahPanenTotal); 
    showToast(`Panen ${jumlahPanenUrl || jumlahPanenTotal} ${l.tanaman} (+${bonusBonusTeks = bonusTambahan} bonus)!`, 'success'); 
    
    l.status = 'kosong'; 
    l.tanaman = null; 
    l.jumlahBibit = 0;
    l.waktuSelesai = 0; 
    
    if (l.timerInterval) clearInterval(l.timerInterval); 
    simpanGame();
    renderLahan(); 
} 

function bukaModalTransaksi(tipe, namaBarang, harga, stokMaksimal = 0) {
    currentTransactionType = tipe; 
    currentTransactionItem = namaBarang; 
    currentTransactionPrice = harga; 
    
    document.getElementById('modal-qty-container').style.display = 'flex';

    if (tipe === 'beli') {
        document.getElementById('modal-title').innerText = `Beli ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Beli'; 
        let maxMampuBeli = Math.floor(uang / harga); 
        maxQtyAllowed = Math.min(99, maxMampuBeli); 
        if (maxQtyAllowed < 1) maxQtyAllowed = 1; 
    } else if (tipe === 'jual') {
        document.getElementById('modal-title').innerText = `Jual ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Jual'; 
        maxQtyAllowed = Math.min(99, stokMaksimal); 
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
        container.innerHTML = '<p style="color: #64748b; font-style: italic;">Inventory masih kosong.</p>'; 
        return; 
    } 
    
    let html = ''; 
    inventory.forEach((item) => {
        let icon = '📦'; 
        let actionButton = ''; 
        let dataTanaman = libraryTanaman.find(t => t.namaBibit === item.nama || t.nama === item.nama); 
        
        if (item.nama.includes('Bibit')) {
            icon = dataTanaman ? dataTanaman.iconBibit : '🌱'; 
            actionButton = `<button class="btn-submit" style="padding: 6px 10px; font-size: 12px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>`; 
        } else {
            icon = dataTanaman ? dataTanaman.iconBuah : '📦'; 
            let hargaJualSatuan = hargaJualAktif[item.nama] || 0; 
            actionButton = ` 
                <div style="text-align: right;"> 
                    <small style="display: block; color: #64748b; font-size: 10px;">Jual: Rp ${formatRupiah(hargaJualSatuan)}</small> 
                    <button class="btn-sell" onclick="bukaModalTransaksi('jual', '${item.nama}', ${hargaJualSatuan}, ${item.jumlah})">Jual</button> 
                </div> 
            `; 
        } 
        
        html += ` 
            <div class="inventory-item"> 
                <div> 
                    <span>${icon} <strong style="color: #1e293b;">${item.nama}</strong></span><br> 
                    <small style="color: #64748b;">Jumlah: <strong>${item.jumlah}</strong></small> 
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
function bukaModalNickname() {
    let inputEl = document.getElementById('input-new-nickname');
    if (inputEl) inputEl.value = playerName;
    document.getElementById('nickname-modal').style.display = 'flex';
}

function tutupModalNickname() {
    document.getElementById('nickname-modal').style.display = 'none';
}

function simpanNicknameBaru() {
    let inputEl = document.getElementById('input-new-nickname');
    let namaBaru = inputEl ? inputEl.value.trim() : "";
    
    if (namaBaru !== "") {
        playerName = namaBaru;
        let elNick = document.getElementById('player-nickname');
        if (elNick) elNick.innerText = `👨‍🌾 ${playerName} ✏️`;
        simpanGame();
        showToast("Nama petani berhasil diperbarui!", "success");
        tutupModalNickname();
    } else {
        showToast("Nama tidak boleh kosong!", "error");
    }
}

function simpanGame() {
    let dataGame = {
        playerName: playerName,
        uang: uang,
        inventory: inventory,
        jumlahPupuk: jumlahPupuk,
        aksesoriDimiliki: aksesoriDimiliki,
        slotAktif: slotAktif,
        lahan: lahan.map(l => ({
            id: l.id,
            status: l.status,
            tanaman: l.tanaman,
            jumlahBibit: l.jumlahBibit || 1,
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
            aksesoriDimiliki = data.aksesoriDimiliki || [];
            slotAktif = data.slotAktif || { kepala: null, badan: null, kaki: null, telapak: null };
            lahanTambahanDibeli = data.lahanTambahanDibeli || 0;
            hargaTambahLahan = data.hargaTambahLahan || 5000;
            
            if (data.lahan && data.lahan.length > 0) {
                lahan = data.lahan.map(l => ({
                    id: l.id,
                    status: l.status,
                    tanaman: l.tanaman,
                    jumlahBibit: l.jumlahBibit || 1,
                    waktuSelesai: l.waktuSelesai,
                    timerInterval: null
                }));
            }
        } catch (e) {
            console.error("Gagal memuat save data", e);
        }
    }
}

function resetGame() {
    document.getElementById('reset-modal').style.display = 'flex';
}

function tutupModalReset() {
    document.getElementById('reset-modal').style.display = 'none';
}

function eksekusiResetGame() {
    localStorage.removeItem('saveGameBertani');
    showToast("Progres berhasil direset!", "error");
    setTimeout(() => {
        location.reload();
    }, 500);
}

// ==========================================
// INISIALISASI GAME
// ==========================================
function initGame() {
    muatGame(); 
    updateFluktuasiHarga(); 
    setInterval(updateFluktuasiHarga, 60000); 
    
    renderPasar(); 
    renderLahan(); 
    updateUangDisplay();
    updatePanelAksesoriInfo();
    
    let elNick = document.getElementById('player-nickname');
    if(elNick) elNick.innerText = `👨‍🌾 ${playerName} ✏️`;

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

initGame();
