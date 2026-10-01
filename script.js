let libraryTanaman = [
    { nama: 'Semangka', namaBibit: 'Bibit Semangka', iconBibit: '🌱', iconBuah: '🍉', BasehargaBeli: 60, BasehargaJual: 68, waktuTumbuh: 28800000 },
    { nama: 'Cabai', namaBibit: 'Bibit Cabai', iconBibit: '🌱', iconBuah: '🌶️', BasehargaBeli: 65, BasehargaJual: 105, waktuTumbuh: 36000000 },
    { nama: 'Brokoli', namaBibit: 'Bibit Brokoli', iconBibit: '🌱', iconBuah: '🥦', BasehargaBeli: 75, BasehargaJual: 100, waktuTumbuh: 43242000 },
    { nama: 'Bawang Merah', namaBibit: 'Bibit Bawang Merah', iconBibit: '🌱', iconBuah: '🧅', BasehargaBeli: 27, BasehargaJual: 70, waktuTumbuh: 31600000 },
    { nama: 'Melon', namaBibit: 'Bibit Melon', iconBibit: '🌱', iconBuah: '🍈', BasehargaBeli: 40, BasehargaJual: 52, waktuTumbuh: 18000000 },
    { nama: 'Jagung', namaBibit: 'Bibit Jagung', iconBibit: '🌱', iconBuah: '🌽', BasehargaBeli: 90, BasehargaJual: 111, waktuTumbuh: 54000000 },
    { nama: 'Apel', namaBibit: 'Bibit Apel', iconBibit: '🌱', iconBuah: '🍎', BasehargaBeli: 130, BasehargaJual: 180, waktuTumbuh: 86400000 }
];

let libraryTernak = [
    { id: 'ayam', nama: 'Ayam Bertelur', icon: '🐔', iconHasil: '🥚', namaHasil: 'Telur Ayam', hargaBeli: 250, hargaHasilJual: 45, waktuProduksi: 21600000 },
    { id: 'sapi', nama: 'Sapi Perah', icon: '🐄', iconHasil: '🥛', namaHasil: 'Susu Sapi', hargaBeli: 1200, hargaHasilJual: 180, waktuProduksi: 43200000 }
];

let daftarTernakPemain = [];
let listPupuk = [
    { id: 'pupuk_organik', nama: 'Pupuk Organik', icon: '🍃', hargaBeli: 185, efekWaktu: 18000000 },
    { id: 'biofertilizer', nama: 'Biofertilizer', icon: '🧪', hargaBeli: 350, efekWaktu: 25200000 },
    { id: 'pupuk_urea', nama: 'Pupuk Urea', icon: '💎', hargaBeli: 580, efekWaktu: 36000000 }
];

let stokPupuk = { pupuk_organik: 0, biofertilizer: 0, pupuk_urea: 0 };
let listAksesori = [
    { id: 'sendal', nama: 'Sendal Jepit', icon: '🩴', slot: 'telapak', harga: 15000, bonusPersen: 3, deskripsi: 'Menambah +3% hasil panen dasar.' },
    { id: 'boots', nama: 'Sepatu Boots', icon: '🥾', slot: 'telapak', harga: 45000, bonusPersen: 2, tangkalAngin: 35, deskripsi: 'Menambah +2% bonus dasar & menghilangkan 35% efek pengurangan hasil dari cuaca Angin Kencang.' },
    { id: 'caping', nama: 'Caping Petani', icon: '👒', slot: 'kepala', harga: 50000, bonusPersen: 8, deskripsi: 'Menambah +8% hasil panen dasar.' },
    { id: 'helmet', nama: 'Helm Full Face', icon: '🪖', slot: 'kepala', harga: 250000, bonusPersen: 0, bonusBadaiPetir: 150, deskripsi: 'Memberikan tambahan bonus besar +150% hasil panen khusus saat terjadi cuaca Badai Petir Berat.' },
    { id: 'boxer', nama: 'Celana Boxer', icon: '🩳', slot: 'kaki', harga: 150000, bonusPersen: 12, deskripsi: 'Menambah +12% hasil panen dasar.' },
    { id: 'joger', nama: 'Celana Joger', icon: '👖', slot: 'kaki', harga: 300000, bonusPersen: 5, sinergiJas: 100, deskripsi: 'Menambah +5% bonus dasar. Memberikan tambahan +100% hasil panen jika dipadukan dengan Jas Anti Badai.' },
    { id: 'baju', nama: 'Baju Partai', icon: '👕', slot: 'badan', harga: 1200000, bonusPersen: 19, deskripsi: 'Menambah +19% hasil panen dasar.' },
    { id: 'jas', nama: 'Jas Anti Badai', icon: '🧥', slot: 'badan', harga: 500000, bonusPersen: 4, tangkalBadai: 50, deskripsi: 'Menambah +4% bonus dasar & menghilangkan 50% efek pengurangan dari cuaca Storm / Badai.' }
];

let uang = 750; 
let inventory = []; 
let aksesoriDimiliki = []; 
let slotAktif = { kepala: null, badan: null, kaki: null, telapak: null };
let lahan = [{ id: 1, status: 'kosong', tanaman: null, jumlahBibit: 0, waktuSelesai: 0, timerInterval: null }]; 
let lahanTambahanDibeli = 0; 
const limitLahanTambahan = 7; 
let hargaTambahLahan = 5000; 

let currentTransactionType = 'beli'; 
let currentTransactionItem = ''; 
let currentTransactionPrice = 0; 
let currentQty = 1; 
let maxQtyAllowed = 99; 

let selectedLahanIndex = null;
let selectedBibitNama = '';
let currentSubInventory = 'bibit';
let hargaBeliAktif = {}; 
let hargaJualAktif = {}; 
let playerName = "Petani Pintar";

let cuacaAktif = { nama: 'Cerah', ikon: '☀️', efekPersen: 0 };
const daftarMasterCuaca = [
    { nama: 'Cerah', ikon: '☀️', efekPersen: 0 },
    { nama: 'Panas', ikon: '🔥', efekPersen: -3 },
    { nama: 'Mendung', ikon: '☁️', efekPersen: 7 },
    { nama: 'Gerimis', ikon: '🌦️', efekPersen: 30 },
    { nama: 'Hujan', ikon: '🌧️', efekPersen: 120 },
    { nama: 'Angin Kencang', ikon: '🌬️', efekPersen: -50 },
    { nama: 'Storm / Badai', ikon: '⚡', efekPersen: -70 },
    { nama: 'Badai Petir Berat', ikon: '🌪️', efekPersen: -90 }
];
let jadwalCuacaHariIni = ['Cerah', 'Panas', 'Hujan', 'Gerimis', 'Angin Kencang']; 
let indeksCuacaAktif = 0;
let timerCuacaInterval = null;
let ternakInterval = null;

function hitungDanTerapkanJadwalCuaca() {
    if (!jadwalCuacaHariIni || jadwalCuacaHariIni.length === 0) jadwalCuacaHariIni = ['Cerah'];
    let namaCuacaTarget = jadwalCuacaHariIni[indeksCuacaAktif % jadwalCuacaHariIni.length];
    let found = daftarMasterCuaca.find(c => c.nama === namaCuacaTarget);
    cuacaAktif = found ? found : daftarMasterCuaca[0];
    indeksCuacaAktif++;
    renderInfoCuacaDiUI();
    renderPasar();
    renderTokoAksesori();

    let totalDurasiSiklusMs = 720000; 
    let durasiPerCuacaMs = totalDurasiSiklusMs / jadwalCuacaHariIni.length;
    if (timerCuacaInterval) clearTimeout(timerCuacaInterval);
    timerCuacaInterval = setTimeout(hitungDanTerapkanJadwalCuaca, durasiPerCuacaMs);
}

function renderInfoCuacaDiUI() {
    let panelCuaca = document.getElementById('info-cuaca-display');
    if (panelCuaca) {
        let tanda = cuacaAktif.efekPersen > 0 ? '+' : '';
        let statusTutupTxt = cuacaAktif.nama.includes('Badai') ? ' 🛑 [Tutup]' : '';
        panelCuaca.innerText = `Cuaca: ${cuacaAktif.ikon} ${cuacaAktif.nama} (${tanda}${cuacaAktif.efekPersen}%)${statusTutupTxt}`;
    }
}

function updateFluktuasiHarga() {
    libraryTanaman.forEach(tanaman => {
        let baseBeli = tanaman.BasehargaBeli; 
        let baseJual = tanaman.BasehargaJual; 
        hargaBeliAktif[tanaman.namaBibit] = Math.round(baseBeli * (1 + (Math.random() * 0.16 - 0.06))); 
        hargaJualAktif[tanaman.nama] = Math.round(baseJual * (1 + (Math.random() * 1.03 - 0.35))); 
    }); 
    libraryTernak.forEach(t => {
        hargaJualAktif[t.namaHasil] = t.hargaHasilJual;
    });
    renderPasar(); 
} 

function formatRupiah(angka) { return angka.toLocaleString('id-ID'); } 
function updateUangDisplay() { document.getElementById('player-koin').innerText = `Rp ${formatRupiah(uang)}`; } 

function openGameTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active')); 
    document.querySelectorAll('.nav-tabs .tab-btn').forEach(btn => btn.classList.remove('active')); 
    document.getElementById('tab-' + tabName).classList.add('active');
    
    const event = window.event;
    if(event && event.target) event.target.classList.add('active');
    
    if (tabName === 'pertanian') renderLahan();
    if (tabName === 'inventory') renderInventory(); 
    if (tabName === 'profil') renderTabProfil(); 
    if (tabName === 'pasar') renderPasar(); 
    if (tabName === 'toko_aksesori') renderTokoAksesori(); 
} 

function switchSubInventory(sub) {
    currentSubInventory = sub;
    ['bibit', 'panen', 'ternak'].forEach(type => {
        let btn = document.getElementById(`subtab-${type}-btn`);
        if(btn) {
            btn.style.background = sub === type ? '#1e293b' : '#e2e8f0';
            btn.style.color = sub === type ? 'white' : '#334155';
        }
    });
    renderInventory();
}

function beliTernak(idTernak) {
    let ternak = libraryTernak.find(t => t.id === idTernak);
    if (!ternak) return;
    if (uang < ternak.hargaBeli) {
        showToast('Uang tidak cukup untuk membeli hewan ternak ini!', 'error');
        return;
    }
    uang -= ternak.hargaBeli;
    updateUangDisplay();

    daftarTernakPemain.push({
        instanceId: Date.now() + Math.random(),
        id: ternak.id,
        nama: ternak.nama,
        icon: ternak.icon,
        waktuSiapPanen: Date.now() + ternak.waktuProduksi,
        status: 'menghasilkan'
    });

    showToast(`Berhasil membeli ${ternak.nama}! Cek tab Kandang Ternak.`, 'success');
    simpanGame();
    renderPasar();
}

function renderTernakInventory() {
    const container = document.getElementById('inventory-container');
    const subContainer = document.getElementById('subtab-content-container');
    if (subContainer) subContainer.innerHTML = '';
    if (!container) return;

    if (daftarTernakPemain.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #64748b; padding: 20px; font-size:12px;">
                Belum ada hewan ternak di kandang. Beli hewan ternak di Tab Pasar!
            </div>`;
        return;
    }

    let html = '';
    const sekarang = Date.now();

    daftarTernakPemain.forEach((item, index) => {
        let ternakInfo = libraryTernak.find(t => t.id === item.id);
        let sisaWaktu = Math.max(0, Math.ceil((item.waktuSiapPanen - sekarang) / 1000));
        let siapPanen = sisaWaktu === 0;

        html += `
            <div class="card-item" style="margin-bottom: 8px;">
                <div>
                    <strong>${item.icon} ${item.nama}</strong><br>
                    <small style="color: #64748b;">
                        Status: ${siapPanen ? '✅ Siap Ambil ' + ternakInfo.iconHasil : '⏳ Produksi (' + sisaWaktu + 's)'}
                    </small>
                </div>
                ${siapPanen 
                    ? `<button class="btn-submit" style="background-color: #10b981;" onclick="panenHasilTernak(${index})">Ambil ${ternakInfo.iconHasil}</button>`
                    : `<button class="btn-submit" style="background-color: #94a3b8; cursor:not-allowed;" disabled>Tunggu</button>`
                }
            </div>
        `;
    });
    container.innerHTML = html;
}

function panenHasilTernak(index) {
    let item = daftarTernakPemain[index];
    if (!item) return;
    let ternakInfo = libraryTernak.find(t => t.id === item.id);
    
    tambahKeInventory(ternakInfo.namaHasil, 1);
    item.waktuSiapPanen = Date.now() + ternakInfo.waktuProduksi;

    showToast(`Berhasil memanen ${ternakInfo.namaHasil}!`, 'success');
    simpanGame();
    renderTernakInventory();
}

function renderInventory() {
    const container = document.getElementById('subtab-content-container'); 
    const containerTernak = document.getElementById('inventory-container');
    if (!container || !containerTernak) return;
    
    container.innerHTML = '';
    containerTernak.innerHTML = '';

    if (currentSubInventory === 'ternak') {
        renderTernakInventory();
        return;
    }

    let filteredItems = inventory.filter(item => {
        if (currentSubInventory === 'bibit') return item.nama.includes('Bibit');
        if (currentSubInventory === 'panen') return !item.nama.includes('Bibit');
        return false;
    });

    if (filteredItems.length === 0) {
        let pesanKosong = currentSubInventory === 'bibit' ? 'Belum ada bibit. Beli di Tab Pasar!' : 'Belum ada hasil panen/ternak.';
        container.innerHTML = `<p style="color: #64748b; font-style: italic; text-align: center; padding: 20px; font-size: 12px;">${pesanKosong}</p>`; 
        return; 
    } 
    
    let html = ''; 
    filteredItems.forEach((item) => {
        let icon = '📦'; 
        let actionButton = ''; 
        let dataTanaman = libraryTanaman.find(t => t.namaBibit === item.nama || t.nama === item.nama); 
        let dataTernakHasil = libraryTernak.find(t => t.namaHasil === item.nama);
        
        if (item.nama.includes('Bibit')) {
            icon = dataTanaman ? dataTanaman.iconBibit : '🌱'; 
            actionButton = `<button class="btn-submit" style="padding: 5px 8px; font-size: 11px;" onclick="openGameTab('pertanian')">Tanam</button>`; 
        } else {
            icon = dataTanaman ? dataTanaman.iconBuah : (dataTernakHasil ? dataTernakHasil.iconHasil : '📦'); 
            let hargaJualSatuan = hargaJualAktif[item.nama] || 0; 
            actionButton = ` 
                <div style="text-align: right;"> 
                    <small style="display: block; color: #64748b; font-size: 9px;">Harga: Rp ${formatRupiah(hargaJualSatuan)}</small> 
                    <button class="btn-sell" style="padding: 4px 8px; font-size: 11px; margin-top: 2px;" onclick="bukaModalTransaksi('jual', '${item.nama}', ${hargaJualSatuan}, ${item.jumlah})">Jual</button> 
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

function renderPasar() {
    const container = document.getElementById('pasar-container'); 
    if (!container) return;
    
    if (cuacaAktif.nama.includes('Badai')) {
        container.innerHTML = `<div style="text-align: center; padding: 20px; color: #991b1b;">⛈️ Pasar Ditutup Sementara karena Badai!</div>`;
        return;
    }

    let html = ''; 
    html += `<h4 style="margin: 10px 0 5px 0; font-size: 13px; color:#1e293b;">🌱 Toko Bibit Tanaman</h4>`;
    libraryTanaman.forEach(tanaman => {
        let hargaToko = hargaBeliAktif[tanaman.namaBibit] || tanaman.BasehargaBeli; 
        html += ` 
            <div class="card-item"> 
                <div><strong>${tanaman.iconBibit} ${tanaman.namaBibit}</strong><br><small>Rp ${formatRupiah(hargaToko)}</small></div> 
                <button class="btn-buy" onclick="bukaModalTransaksi('beli', '${tanaman.namaBibit}', ${hargaToko})">Beli</button> 
            </div> `; 
    }); 

    html += `<h4 style="margin: 15px 0 5px 0; font-size: 13px; color:#1e293b;">🐔 Pasar Hewan Ternak</h4>`;
    libraryTernak.forEach(ternak => {
        html += `
            <div class="card-item">
                <div><strong>${ternak.icon} ${ternak.nama}</strong><br><small>Harga: Rp ${formatRupiah(ternak.hargaBeli)} | Produk: ${ternak.iconHasil}</small></div>
                <button class="btn-buy" style="background-color: #2563eb;" onclick="beliTernak('${ternak.id}')">Beli</button>
            </div>`;
    });
    
    html += `<h4 style="margin: 15px 0 5px 0; font-size: 13px; color:#1e293b;">🧪 Toko Pupuk</h4>`;
    listPupuk.forEach(p => {
        html += `
            <div class="card-item">
                <div><strong>${p.icon} ${p.nama}</strong><br><small>Rp ${formatRupiah(p.hargaBeli)}</small></div>
                <button class="btn-buy" style="background-color: #475569;" onclick="bukaModalTransaksi('beli_pupuk', '${p.id}', ${p.hargaBeli})">Beli</button>
            </div>`;
    });
    container.innerHTML = html; 
}

function renderLahan() {
    const container = document.getElementById('lahan-container'); 
    if (!container) return;
    let html = ''; 
    
    lahan.forEach((l, index) => {
        let dataTanaman = libraryTanaman.find(t => t.nama === l.tanaman); 
        let iconTampil = dataTanaman ? dataTanaman.iconBuah : '🌱'; 
        let statusTeks = l.status === 'kosong' ? 'Lahan Kosong' : (l.status === 'ditanam' ? `🌱 ${l.tanaman}` : `✨ ${iconTampil} Siap Panen`);

        html += ` 
            <div class="farm-land"> 
                <p style="font-size: 12px; font-weight: bold; margin:0;">${statusTeks}</p> 
                <small id="waktu-lahan-${index}" style="font-size: 11px; color: #3b82f6;"></small> 
                ${l.status === 'kosong' ? `<button class="btn-submit" style="padding:4px;" onclick="bukaModalPilihBibit(${index})">Tanam</button>` : ''} 
                ${l.status === 'siap_panen' ? `<button class="btn-submit" style="padding:4px; background-color:#d97706;" onclick="panenTanaman(${index})">Panen</button>` : ''} 
            </div> `; 
    }); 

    let headerHtml = `
        <div style="grid-column: span 2; background: #e2e8f0; padding: 8px; border-radius: 8px; display:flex; gap:4px; margin-bottom:5px;">
            <button class="btn-submit" style="font-size:10px; flex:1; background:#16a34a;" onclick="gunakanPupuk('pupuk_organik')">🍃 Organik (${stokPupuk.pupuk_organik})</button>
            <button class="btn-submit" style="font-size:10px; flex:1; background:#2563eb;" onclick="gunakanPupuk('biofertilizer')">🧪 Bio (${stokPupuk.biofertilizer})</button>
            <button class="btn-submit" style="font-size:10px; flex:1; background:#0f172a;" onclick="gunakanPupuk('pupuk_urea')">💎 Urea (${stokPupuk.pupuk_urea})</button>
        </div>`;
    container.innerHTML = headerHtml + html; 
} 

function bukaModalPilihBibit(indexLahan) {
    let bibitDiInv = inventory.filter(i => i.nama.includes('Bibit') && i.jumlah > 0);
    if (bibitDiInv.length === 0) {
        showToast('Anda tidak memiliki bibit tanaman! Beli di Pasar.', 'error');
        return;
    }
    selectedLahanIndex = indexLahan;
    let optionsHtml = bibitDiInv.map(b => `<option value="${b.nama}">${b.nama} (Stok: ${b.jumlah})</option>`).join('');

    document.getElementById('modal-title').innerText = `Tanam Lahan #${indexLahan + 1}`;
    document.getElementById('modal-price').innerHTML = `
        <select id="select-bibit-lahan" onchange="gantiPilihanBibit(this.value)" style="width:100%; padding:6px; border-radius:6px;">
            ${optionsHtml}
        </select>`;
    gantiPilihanBibit(bibitDiInv[0].nama);
    document.getElementById('btn-confirm-transaction').innerText = 'Tanam';
    document.getElementById('btn-confirm-transaction').setAttribute('onclick', 'konfirmasiTanamBibit()');
    document.getElementById('transaction-modal').style.display = 'flex';
}

function gantiPilihanBibit(namaBibit) {
    selectedBibitNama = namaBibit;
    let itemInv = inventory.find(i => i.nama === selectedBibitNama);
    maxQtyAllowed = itemInv ? Math.min(99, itemInv.jumlah) : 1;
    currentQty = 1;
    document.getElementById('modal-qty-display').innerText = currentQty;
    document.getElementById('modal-total-price').innerText = '-';
}

function konfirmasiTanamBibit() {
    let item = inventory.find(i => i.nama === selectedBibitNama);
    if (!item || item.jumlah < currentQty) return;

    item.jumlah -= currentQty;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== selectedBibitNama);

    let dataBibit = libraryTanaman.find(t => t.namaBibit === selectedBibitNama);
    let targetLahan = lahan[selectedLahanIndex];
    targetLahan.status = 'ditanam';
    targetLahan.tanaman = dataBibit.nama;
    targetLahan.jumlahBibit = currentQty;
    targetLahan.waktuSelesai = Date.now() + dataBibit.waktuTumbuh;

    tutupModalTransaksi();
    simpanGame();
    renderLahan();
    mulaiTimerLahan(selectedLahanIndex);
    showToast(`Berhasil menanam ${targetLahan.tanaman}!`, 'success');
}

function mulaiTimerLahan(index) {
    let l = lahan[index]; 
    if (l.timerInterval) clearInterval(l.timerInterval); 
    l.timerInterval = setInterval(() => {
        let sisa = l.waktuSelesai - Date.now(); 
        let el = document.getElementById(`waktu-lahan-${index}`); 
        if (sisa <= 0) {
            clearInterval(l.timerInterval); 
            l.status = 'siap_panen'; 
            renderLahan(); 
        } else if (el) {
            el.innerText = `⏳ ${Math.ceil(sisa/1000)}s`;
        } 
    }, 1000); 
}

function panenTanaman(index) {
    let l = lahan[index];
    let totalPanen = l.jumlahBibit + Math.floor(l.jumlahBibit * (hitungTotalBonusPersen() / 100));
    tambahKeInventory(l.tanaman, totalPanen);
    showToast(`Panen ${totalPanen} ${l.tanaman}!`, 'success');
    l.status = 'kosong'; l.tanaman = null;
    simpanGame();
    renderLahan();
}

function gunakanPupuk(idPupuk) {
    if (stokPupuk[idPupuk] <= 0) { showToast('Pupuk habis!', 'error'); return; }
    stokPupuk[idPupuk]--;
    lahan.forEach(l => { if (l.status === 'ditanam') l.waktuSelesai -= listPupuk.find(p=>p.id===idPupuk).efekWaktu; });
    simpanGame(); renderLahan(); showToast('Semua tanaman dipercepat!', 'success');
}

function beliLahan() {
    if(uang < hargaTambahLahan) { showToast('Koin tidak cukup!', 'error'); return; }
    uang -= hargaTambahLahan;
    lahan.push({ id: lahan.length + 1, status: 'kosong', tanaman: null, jumlahBibit: 0, waktuSelesai: 0, timerInterval: null });
    hargaTambahLahan = Math.round(hargaTambahLahan * 2.5);
    simpanGame(); updateUangDisplay(); renderPasar(); renderLahan();
}

function bukaModalTransaksi(tipe, namaBarang, harga, stok = 0) {
    currentTransactionType = tipe; currentTransactionItem = namaBarang; currentTransactionPrice = harga;
    maxQtyAllowed = tipe === 'jual' ? stok : Math.min(99, Math.floor(uang / harga));
    currentQty = maxQtyAllowed > 0 ? 1 : 0;
    
    document.getElementById('modal-title').innerText = tipe === 'jual' ? `Jual ${namaBarang}` : `Beli ${namaBarang}`;
    document.getElementById('modal-price').innerText = `Harga: Rp ${formatRupiah(harga)}`;
    document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi';
    document.getElementById('btn-confirm-transaction').setAttribute('onclick', 'konfirmasiTransaksi()');
    updateModalDisplay();
    document.getElementById('transaction-modal').style.display = 'flex';
}

function ubahQty(amt) {
    currentQty = Math.max(1, Math.min(maxQtyAllowed, currentQty + amt));
    updateModalDisplay();
}
function setQtyMaks() { currentQty = maxQtyAllowed; updateModalDisplay(); }
function updateModalDisplay() {
    document.getElementById('modal-qty-display').innerText = currentQty;
    document.getElementById('modal-total-price').innerText = `Rp ${formatRupiah(currentQty * currentTransactionPrice)}`;
}
function tutupModalTransaksi() { document.getElementById('transaction-modal').style.display = 'none'; }

function konfirmasiTransaksi() {
    let total = currentQty * currentTransactionPrice;
    if (currentTransactionType === 'beli') {
        if(uang < total) return; uang -= total; tambahKeInventory(currentTransactionItem, currentQty);
    } else if (currentTransactionType === 'beli_pupuk') {
        if(uang < total) return; uang -= total; stokPupuk[currentTransactionItem] += currentQty;
    } else if (currentTransactionType === 'jual') {
        let item = inventory.find(i => i.nama === currentTransactionItem);
        if(!item || item.jumlah < currentQty) return;
        item.jumlah -= currentQty; uang += total;
        if(item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== currentTransactionItem);
    }
    tutupModalTransaksi(); simpanGame(); updateUangDisplay(); renderInventory(); renderPasar();
}

function tambahKeInventory(nama, qty) {
    let item = inventory.find(i => i.nama === nama);
    if(item) item.jumlah += qty; else inventory.push({ nama: nama, jumlah: qty });
}

function hitungTotalBonusPersen() {
    let t = 0; for(let s in slotAktif) { let a = listAksesori.find(x=>x.id===slotAktif[s]); if(a) t += a.bonusPersen; } return t;
}
function renderTabProfil() {
    let getAccInfo = (id) => { let a = listAksesori.find(x=>x.id===id); return a ? `${a.icon} ${a.nama} (+${a.bonusPersen}%)` : 'Kosong'; };
    document.getElementById('slot-kepala-display').innerText = getAccInfo(slotAktif.kepala);
    document.getElementById('slot-badan-display').innerText = getAccInfo(slotAktif.badan);
    document.getElementById('slot-kaki-display').innerText = getAccInfo(slotAktif.kaki);
    document.getElementById('slot-telapak-display').innerText = getAccInfo(slotAktif.telapak);
    document.getElementById('total-bonus-display').innerText = `+${hitungTotalBonusPersen()}%`;
    
    let container = document.getElementById('profil-aksesori-container');
    if(!container) return;
    if(aksesoriDimiliki.length === 0) { container.innerHTML = '<p style="font-size:11px; text-align:center;">Belum memiliki aksesori.</p>'; return; }
    
    let html = '';
    aksesoriDimiliki.forEach(id => {
        let acc = listAksesori.find(a => a.id === id);
        let pakai = slotAktif[acc.slot] === id;
        html += `
            <div class="inventory-item">
                <span>${acc.icon} <strong>${acc.nama}</strong></span>
                <button class="btn-submit" style="background:${pakai?'#10b981':'#3b82f6'}" ${pakai?'disabled':''} onclick="pakaiAksesori('${acc.id}')">${pakai?'Dipakai':'Pakai'}</button>
            </div>`;
    });
    container.innerHTML = html;
}

function pakaiAksesori(id) {
    let acc = listAksesori.find(a=>a.id===id);
    slotAktif[acc.slot] = id; simpanGame(); renderTabProfil(); showToast('Aksesori dipasang!');
}

function renderTokoAksesori() {
    let container = document.getElementById('toko-aksesori-container'); if(!container) return;
    let html = '';
    listAksesori.forEach(a => {
        let punya = aksesoriDimiliki.includes(a.id);
        html += `
            <div class="card-item">
                <div><strong>${a.icon} ${a.nama}</strong><br><small>Rp ${formatRupiah(a.harga)}</small></div>
                <button class="btn-buy" ${punya?'disabled style="background:#64748b;"':''} onclick="beliAksesori('${a.id}',${a.harga})">${punya?'Miliki':'Beli'}</button>
            </div>`;
    });
    container.innerHTML = html;
}

function beliAksesori(id, harga) {
    if(uang < harga) { showToast('Koin tidak cukup!', 'error'); return; }
    uang -= harga; aksesoriDimiliki.push(id); slotAktif[listAksesori.find(x=>x.id===id).slot] = id;
    simpanGame(); updateUangDisplay(); renderTokoAksesori(); showToast('Aksesori dibeli & dipakai!');
}

let toastTimeout = null;
function showToast(msg, type='success') {
    let o = document.getElementById('toast-overlay'); let c = document.getElementById('toast-card');
    c.className = `toast-card ${type}`; document.getElementById('toast-message').innerText = msg;
    o.style.display = 'flex'; if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => o.style.display='none', 2000);
}

function simpanGame() {
    let dataGame = {
        playerName: playerName,
        uang: uang,
        inventory: inventory,
        stokPupuk: stokPupuk,
        aksesoriDimiliki: aksesoriDimiliki,
        slotAktif: slotAktif,
        cuacaAktif: cuacaAktif,
        indeksCuacaAktif: indeksCuacaAktif,
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
}

function muatGame() {
    let savedData = localStorage.getItem('saveGameBertani');
    if (savedData) {
        try {
            let data = JSON.parse(savedData);
            playerName = data.playerName || "Petani Pintar";
            uang = data.uang !== undefined ? data.uang : 3500;
            inventory = data.inventory || [];
            if (data.stokPupuk) stokPupuk = data.stokPupuk;
            aksesoriDimiliki = data.aksesoriDimiliki || [];
            slotAktif = data.slotAktif || { kepala: null, badan: null, kaki: null, telapak: null };
            if (data.cuacaAktif) cuacaAktif = data.cuacaAktif;
            if (data.indeksCuacaAktif !== undefined) indeksCuacaAktif = data.indeksCuacaAktif;
            
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

function resetGame() { document.getElementById('reset-modal').style.display = 'flex'; }
function tutupModalReset() { document.getElementById('reset-modal').style.display = 'none'; }
function eksekusiResetGame() { localStorage.removeItem('saveGameBertaniNew'); location.reload(); }

function initGame() {
    muatGame(); updateFluktuasiHarga(); hitungDanTerapkanJadwalCuaca(); updateUangDisplay(); renderLahan();
    
    if(ternakInterval) clearInterval(ternakInterval);
    ternakInterval = setInterval(() => {
        if(currentSubInventory === 'ternak' && document.getElementById('tab-inventory').classList.contains('active')) {
            renderTernakInventory();
        }
    }, 1000);
}
initGame();
