// ==========================================
// DATA LOKAL TANAMAN & AKSESORI BERDASARKAN SLOT
// ==========================================
let libraryTanaman = [
    {
        nama: 'Semangka',
        namaBibit: 'Bibit Semangka',
        iconBibit: '🌱',
        iconBuah: '🍉',
        BasehargaBeli: 60,
        BasehargaJual: 68,
        waktuTumbuh: 30000 
    },
    {
        nama: 'Melon',
        namaBibit: 'Bibit Melon',
        iconBibit: '🌱',
        iconBuah: '🍈',
        BasehargaBeli: 40,
        BasehargaJual: 52,
        waktuTumbuh: 15000
    },
    {
        nama: 'Jagung',
        namaBibit: 'Bibit Jagung',
        iconBibit: '🌱',
        iconBuah: '🌽',
        BasehargaBeli: 90,
        BasehargaJual: 111,
        waktuTumbuh: 45000
    },
    {
        nama: 'Apel',
        namaBibit: 'Bibit Apel',
        iconBibit: '🌱',
        iconBuah: '🍎',
        BasehargaBeli: 130,
        BasehargaJual: 180,
        waktuTumbuh: 90000
    }
];

let listPupuk = [
    { id: 'pupuk_organik', nama: 'Pupuk Organik', icon: '🍃', hargaBeli: 185, efekWaktu: 15000 },
    { id: 'biofertilizer', nama: 'Biofertilizer', icon: '🧪', hargaBeli: 350, efekWaktu: 25000 },
    { id: 'pupuk_urea', nama: 'Pupuk Urea', icon: '💎', hargaBeli: 580, efekWaktu: 50000 }
];

let stokPupuk = {
    pupuk_organik: 0,
    biofertilizer: 0,
    pupuk_urea: 0
};

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

// ==========================================
// PENGATURAN JADWAL CUACA HARIAN OLEH DEVELOPER
// ==========================================
let cuacaAktif = {
    nama: 'Cerah',
    ikon: '☀️',
    efekPersen: 0
};

const daftarMasterCuaca = [
    { nama: 'Cerah', ikon: '☀️️', efekPersen: 0 },
    { nama: 'Panas', ikon: '🔥', efekPersen: -3 },
    { nama: 'Mendung', ikon: '☁️', efekPersen: 7 },
    { nama: 'Gerimis', ikon: '🌦️', efekPersen: 30 },
    { nama: 'Hujan', ikon: '🌧️', efekPersen: 120 },
    { nama: 'Angin Kencang', ikon: '🌬️', efekPersen: -50 },
    { nama: 'Storm / Badai', ikon: '⚡', efekPersen: -70 },
    { nama: 'Badai Petir Berat', ikon: '🌪️', efekPersen: -90 }
];

// 🛠️ ATUR DI SINI: Masukkan nama-nama cuaca untuk hari ini
let jadwalCuacaHariIni = ['Cerah', 'Gerimis', 'Hujan', 'Storm / Badai', 'Cerah', 'Gerimis']; 

let indeksCuacaAktif = 0;
let timerCuacaInterval = null;

function hitungDanTerapkanJadwalCuaca() {
    if (!jadwalCuacaHariIni || jadwalCuacaHariIni.length === 0) {
        jadwalCuacaHariIni = ['Cerah'];
    }

    let namaCuacaTarget = jadwalCuacaHariIni[indeksCuacaAktif % jadwalCuacaHariIni.length];
    let found = daftarMasterCuaca.find(c => c.nama === namaCuacaTarget);
    if (found) {
        cuacaAktif = found;
    } else {
        cuacaAktif = daftarMasterCuaca[0];
    }

    indeksCuacaAktif++;
    renderInfoCuacaDiUI();
    renderPasar();
    renderTokoAksesori();

    let statusTutup = cuacaAktif.nama.includes('Badai') ? " (⚠️ Pasar & Toko Tutup!)" : "";
    showToast(`Pergantian Cuaca: ${cuacaAktif.ikon} ${cuacaAktif.nama}${statusTutup}`, 'info');

    let totalDurasiSiklusMs = 720000; // 12 Menit total untuk 1 hari penuh game
    let durasiPerCuacaMs = totalDurasiSiklusMs / jadwalCuacaHariIni.length;

    if (timerCuacaInterval) clearTimeout(timerCuacaInterval);
    timerCuacaInterval = setTimeout(hitungDanTerapkanJadwalCuaca, durasiPerCuacaMs);
}

function renderInfoCuacaDiUI() {
    let panelCuaca = document.getElementById('info-cuaca-display');
    if (panelCuaca) {
        let tanda = cuacaAktif.efekPersen > 0 ? '+' : '';
        let statusTutupTxt = cuacaAktif.nama.includes('Badai') ? ' 🛑 [Tutup]' : '';
        panelCuaca.innerText = `${cuacaAktif.ikon} ${cuacaAktif.nama} (${tanda}${cuacaAktif.efekPersen}%)${statusTutupTxt}`;
    }
}

let uang = 3500; 
let inventory = []; 
let aksesoriDimiliki = []; 

let slotAktif = {
    kepala: null,
    badan: null,
    kaki: null,
    telapak: null
};

let lahan = [
    { id: 1, status: 'kosong', tanaman: null, jumlahBibit: 0, waktuSelesai: 0, timerInterval: null } 
]; 
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

    renderPasar(); 
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

    if (!kepalaEl) return;

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
    
    const navButtons = document.querySelectorAll('.nav-tabs .tab-btn');
    if (tabName === 'pertanian' && navButtons[0]) navButtons[0].classList.add('active');
    if (tabName === 'inventory' && navButtons[1]) navButtons[1].classList.add('active');
    if (tabName === 'profil' && navButtons[2]) navButtons[2].classList.add('active');
    if (tabName === 'pasar' && navButtons[3]) navButtons[3].classList.add('active');
    if (tabName === 'toko_aksesori' && navButtons[4]) navButtons[4].classList.add('active');
    
    if (tabName === 'pertanian') renderLahan();
    if (tabName === 'inventory') renderInventory(); 
    if (tabName === 'profil') renderTabProfil(); 
    if (tabName === 'pasar') renderPasar(); 
    if (tabName === 'toko_aksesori') renderTokoAksesori(); 
} 

function openGameTabeksplisit(tabName) {
    openGameTab(tabName);
} 

function switchSubInventory(sub) {
    currentSubInventory = sub;
    document.getElementById('subtab-bibit-btn').style.background = sub === 'bibit' ? '#1e293b' : '#e2e8f0';
    document.getElementById('subtab-bibit-btn').style.color = sub === 'bibit' ? 'white' : '#334155';

    document.getElementById('subtab-panen-btn').style.background = sub === 'panen' ? '#1e293b' : '#e2e8f0';
    document.getElementById('subtab-panen-btn').style.color = sub === 'panen' ? 'white' : '#334155';

    document.getElementById('subtab-ternak-btn').style.background = sub === 'ternak' ? '#1e293b' : '#e2e8f0';
    document.getElementById('subtab-ternak-btn').style.color = sub === 'ternak' ? 'white' : '#334155';

    renderInventory();
}

function renderTabProfil() {
    updatePanelAksesoriInfo();
    const container = document.getElementById('profil-aksesori-container');
    if (!container) return;

    if (aksesoriDimiliki.length === 0) {
        container.innerHTML = '<p style="color: #64748b; font-style: italic; text-align: center; padding: 15px; font-size: 12px;">Kamu belum memiliki aksesori. Beli perlengkapan di Tab Toko Aksesori!</p>';
        return;
    }

    let html = '';
    aksesoriDimiliki.forEach(id => {
        let acc = listAksesori.find(a => a.id === id);
        if (!acc) return;

        let sedangDipakai = slotAktif[acc.slot] === acc.id;
        let actionBtn = '';

        if (sedangDipakai) {
            actionBtn = `<button class="btn-submit" style="background-color: #10b981; padding: 5px 10px; font-size: 11px;" disabled>Dipakai</button>`;
        } else {
            actionBtn = `<button class="btn-submit" style="background-color: #3b82f6; padding: 5px 10px; font-size: 11px;" onclick="pakaiAksesori('${acc.id}')">Kenakan</button>`;
        }

        html += `
            <div class="inventory-item" style="flex-direction: column; align-items: flex-start; gap: 6px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <span style="font-size: 14px;">${acc.icon} <strong style="color: #1e293b;">${acc.nama}</strong> <span style="font-size: 10px; background: #e2e8f0; padding: 2px 5px; border-radius: 4px; color: #475569; margin-left: 5px;">[${acc.slot.toUpperCase()}]</span></span>
                    ${actionBtn}
                </div>
                <div style="font-size: 11px; color: #475569; background: #f1f5f9; padding: 6px 8px; border-radius: 6px; width: 100%; box-sizing: border-box;">
                    <strong>Efek:</strong> ${acc.deskripsi}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderPasar() {
    const container = document.getElementById('pasar-container'); 
    if (!container) return;
    
    let sedangBadai = cuacaAktif.nama.includes('Badai');
    if (sedangBadai) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;">
                <div style="font-size: 32px; margin-bottom: 8px;">⛈️</div>
                <strong>Pasar Ditutup Sementara!</strong><br>
                <small style="color: #7f1d1d;">Cuaca terlalu berbahaya (${cuacaAktif.nama}). Pedagang menyelamatkan diri. Silakan kembali saat cuaca membaik.</small>
            </div>
        `;
        let btnTambah = document.getElementById('btn-tambah-lahan');
        if (btnTambah) btnTambah.style.display = 'none';
        return;
    }

    let html = ''; 
    html += `<h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">🌱 Toko Bibit Tanaman</h4>`;
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
    
    html += `<h4 style="margin: 15px 0 8px 0; color: #1e293b; font-size: 14px;">🧪 Toko Pupuk</h4>`;
    listPupuk.forEach(p => {
        let stok = stokPupuk[p.id] || 0;
        html += `
            <div class="card-item">
                <div>
                    <strong>${p.icon} ${p.nama}</strong><br>
                    <small style="color: #64748b;">Harga: Rp ${formatRupiah(p.hargaBeli)} | Cepat ${p.efekWaktu / 1000} Detik (Stok: ${stok})</small>
                </div>
                <button class="btn-buy" style="background-color: #475569;" onclick="bukaModalTransaksi('beli_pupuk', '${p.id}', ${p.hargaBeli})">Beli</button>
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

function renderTokoAksesori() {
    const container = document.getElementById('toko-aksesori-container');
    if (!container) return;

    let sedangBadai = cuacaAktif.nama.includes('Badai');
    if (sedangBadai) {
        container.innerHTML = `
            <div style="text-align: center; padding: 30px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;">
                <div style="font-size: 32px; margin-bottom: 8px;">🌪️</div>
                <strong>Toko Aksesori Tutup Sementara!</strong><br>
                <small style="color: #7f1d1d;">Pintu toko dikunci rapat akibat cuaca buruk (${cuacaAktif.nama}). Toko buka kembali setelah badai reda.</small>
            </div>
        `;
        return;
    }

    let html = '';
    listAksesori.forEach(acc => {
        let sudahDimiliki = aksesoriDimiliki.includes(acc.id);
        let actionBtn = '';
        
        if (sudahDimiliki) {
            actionBtn = `<button class="btn-submit" style="background-color: #64748b; padding: 6px 12px; cursor: default;" disabled>Sudah Punya</button>`;
        } else {
            actionBtn = `<button class="btn-buy" onclick="beliAksesori('${acc.id}', ${acc.harga})">Beli</button>`;
        }

        html += `
            <div class="card-item" style="flex-direction: column; align-items: flex-start; gap: 6px;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <strong>${acc.icon} ${acc.nama}</strong>
                    ${actionBtn}
                </div>
                <small style="color: #64748b; line-height: 1.3;">Slot: [${acc.slot.toUpperCase()}] | Harga: Rp ${formatRupiah(acc.harga)}<br><strong>Efek:</strong> ${acc.deskripsi}</small>
            </div>
        `;
    });

    container.innerHTML = html;
}

function beliAksesori(id, harga) {
    if (cuacaAktif.nama.includes('Badai')) {
        showToast("Toko sedang tutup karena badai!", "error");
        return;
    }
    if (uang < harga) {
        showToast("Uang tidak cukup untuk membeli aksesori ini!", "error");
        return;
    }
    uang -= harga;
    aksesoriDimiliki.push(id);
    
    let acc = listAksesori.find(a => a.id === id);
    if (acc) {
        if (acc.id === 'joger' && slotAktif.badan !== 'jas') {
            showToast("Berhasil dibeli! (Celana Joger belum bisa dipakai karena Jas Anti Badai tidak aktif di badan)", "success");
        } else {
            slotAktif[acc.slot] = id;
            showToast("Berhasil membeli dan mengenakan aksesori!", "success");
        }
    }

    updateUangDisplay();
    updatePanelAksesoriInfo();
    simpanGame();
    renderTokoAksesori();
}

function pakaiAksesori(id) {
    let acc = listAksesori.find(a => a.id === id);
    if (!acc) return;

    if (acc.id === 'joger' && slotAktif.badan !== 'jas') {
        showToast("Celana Joger tidak bisa dipakai! Kamu harus mengenakan Jas Anti Badai terlebih dahulu di slot Badan.", "error");
        return;
    }

    slotAktif[acc.slot] = id;
    updatePanelAksesoriInfo();
    simpanGame();
    renderTabProfil();
    showToast(`Aksesori ${acc.nama} dipasang ke slot ${acc.slot}!`, "success");
}

function renderLahan() {
    const container = document.getElementById('lahan-container'); 
    if (!container) return;
    let html = ''; 
    
    lahan.forEach((l, index) => {
        let dataTanaman = libraryTanaman.find(t => t.nama === l.tanaman); 
        let iconTampil = dataTanaman ? dataTanaman.iconBuah : '🌱'; 
        
        let statusTeks = 'Lahan Kosong';
        if (l.status === 'ditanam') {
            statusTeks = `🌱 ${l.tanaman} (${l.jumlahBibit} Bibit)`;
        } else if (l.status === 'siap_panen') {
            statusTeks = `✨ ${iconTampil}${l.tanaman} (${l.jumlahBibit} Siap Panen)`;
        }

        html += ` 
            <div class="farm-land"> 
                <p id="status-lahan-${index}" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #1e293b;"> 
                    ${statusTeks} 
                </p> 
                <small id="waktu-lahan-${index}" style="display: ${l.status === 'ditanam' ? 'block' : 'none'}; font-size: 11px; margin-bottom: 8px; color: #3b82f6; font-weight: bold;"></small> 
                ${l.status === 'kosong' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px;" onclick="bukaModalPilihBibit(${index})">Tanam Bibit</button>` : ''} 
                ${l.status === 'siap_panen' ? `<button class="btn-submit" style="padding: 6px; font-size: 11px; background-color: #d97706;" onclick="panenTanaman(${index})">Panen</button>` : ''} 
            </div> 
        `; 
    }); 

    let headerHtml = `
        <div style="grid-column: span 2; background: #e2e8f0; padding: 10px; border-radius: 8px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 5px;">
            <div style="font-size: 12px; font-weight: bold; color: #1e293b;">🧪 Panel Pupuk Massal:</div>
            <div style="display: flex; gap: 5px; justify-content: space-between;">
                <button class="btn-submit" style="background-color: #16a34a; padding: 5px 6px; font-size: 10px; flex: 1;" onclick="gunakanPupuk('pupuk_organik')">🍃 Organik (${stokPupuk.pupuk_organik})</button>
                <button class="btn-submit" style="background-color: #2563eb; padding: 5px 6px; font-size: 10px; flex: 1;" onclick="gunakanPupuk('biofertilizer')">🧪 Biofert (${stokPupuk.biofertilizer})</button>
                <button class="btn-submit" style="background-color: #0f172a; padding: 5px 6px; font-size: 10px; flex: 1;" onclick="gunakanPupuk('pupuk_urea')">💎 Urea (${stokPupuk.pupuk_urea})</button>
            </div>
        </div>
    `;
    
    container.innerHTML = headerHtml + html; 
} 

function bukaModalPilihBibit(indexLahan) {
    let bibitDiInv = inventory.filter(i => i.nama.includes('Bibit'));
    if (bibitDiInv.length === 0) {
        showToast('Kamu tidak punya bibit di inventory! Beli dulu di Pasar.', 'error');
        openGameTabeksplisit('pasar');
        return;
    }

    selectedLahanIndex = indexLahan;
    selectedBibitNama = bibitDiInv[0].nama;

    let itemInv = inventory.find(i => i.nama === selectedBibitNama);
    let stokMaks = itemInv ? itemInv.jumlah : 0;
    
    maxQtyAllowed = Math.min(99, stokMaks);
    currentQty = 1;

    document.getElementById('modal-title').innerText = `Tanam ${selectedBibitNama}`;
    document.getElementById('modal-price').innerText = `Stok di Inventory: ${stokMaks} | Maksimal 99 per lahan`;
    
    document.getElementById('modal-total-price').parentElement.style.display = 'none';
    document.getElementById('btn-confirm-transaction').innerText = 'Tanam Sekarang';
    document.getElementById('btn-confirm-transaction').setAttribute('onclick', 'konfirmasiTanamBibit()');

    updateModalDisplayCustom();
    document.getElementById('transaction-modal').style.display = 'flex';
}

function updateModalDisplayCustom() {
    document.getElementById('modal-qty-display').innerText = currentQty;
}

function konfirmasiTanamBibit() {
    if (currentQty <= 0) {
        showToast('Jumlah tidak valid!', 'error');
        return;
    }

    let item = inventory.find(i => i.nama === selectedBibitNama);
    if (!item || item.jumlah < currentQty) {
        showToast('Stok bibit tidak cukup!', 'error');
        return;
    }

    item.jumlah -= currentQty;
    if (item.jumlah <= 0) inventory = inventory.filter(i => i.nama !== selectedBibitNama);

    let dataBibit = libraryTanaman.find(t => t.namaBibit === selectedBibitNama);
    let bibitNamaBersih = dataBibit ? dataBibit.nama : selectedBibitNama.replace('Bibit ', '');
    let durasiMs = dataBibit ? dataBibit.waktuTumbuh : 15000;

    let targetLahan = lahan[selectedLahanIndex];
    targetLahan.status = 'ditanam';
    targetLahan.tanaman = bibitNamaBersih;
    targetLahan.jumlahBibit = currentQty;
    targetLahan.waktuSelesai = new Date().getTime() + durasiMs;

    tutupModalTransaksi();
    
    document.getElementById('modal-total-price').parentElement.style.display = 'block';
    document.getElementById('btn-confirm-transaction').setAttribute('onclick', 'konfirmasiTransaksi()');

    simpanGame();
    openGameTabeksplisit('pertanian');
    renderLahan();
    mulaiTimerLahan(selectedLahanIndex);
    showToast(`Berhasil menanam ${currentQty} ${bibitNamaBersih}!`, 'success');
}

function beliLahan() {
    if (cuacaAktif.nama.includes('Badai')) {
        showToast("Tidak bisa memperluas lahan saat badai melanda!", "error");
        return;
    }
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
    openGameTabeksplisit('pertanian'); 
    renderLahan(); 
} 

function pilihBibitUntukDitanam(namaBibit) {
    let emptyIndex = lahan.findIndex(l => l.status === 'kosong'); 
    if (emptyIndex === -1) {
        showToast('Semua lahan sedang terisi!', 'error'); 
        return; 
    } 
    bukaModalPilihBibit(emptyIndex);
} 

// --- FORMAT WAKTU DINAMIS (JAM/MENIT ATAU HARI) ---
function formatWaktuDinamis(sisaMs) {
    let totalDetik = Math.floor(sisaMs / 1000);
    let totalJam = Math.floor(totalDetik / 3600);

    // Jika waktu tersisa mencapai 24 jam (86400 detik) atau lebih
    if (totalJam >= 24) {
        let hari = Math.floor(totalJam / 24);
        let sisaJam = totalJam % 24;
        return `${hari} Hari ${sisaJam} Jam`;
    } else {
        // Jika di bawah 24 jam, tampilkan format Jam:Menit:Detik
        let jam = Math.floor(totalDetik / 3600);
        let menit = Math.floor((totalDetik % 3600) / 60);
        let detik = totalDetik % 60;
        return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}:${String(detik).padStart(2, '0')}`;
    }
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
            let formatWaktu = formatWaktuDinamis(sisaWaktu);
            if(waktuEl) waktuEl.innerText = `⏱️ ${formatWaktu}`; 
        } 
    }, 1000); 
} 

function gunakanPupuk(idPupuk) {
    let pupukObj = listPupuk.find(p => p.id === idPupuk);
    if (!pupukObj) return;

    if (stokPupuk[idPupuk] <= 0) {
        showToast(`${pupukObj.nama} habis! Silakan beli di Pasar.`, 'error');
        return;
    }

    let adaLahanDitanam = lahan.some(l => l.status === 'ditanam');
    if (!adaLahanDitanam) {
        showToast('Tidak ada lahan yang sedang ditanami saat ini!', 'error');
        return;
    }

    stokPupuk[idPupuk] -= 1;
    let waktuSekarang = new Date().getTime();

    lahan.forEach(l => {
        if (l.status === 'ditanam') {
            l.waktuSelesai -= pupukObj.efekWaktu;
            if (l.waktuSelesai <= waktuSekarang) {
                l.waktuSelesai = waktuSekarang;
            }
        }
    });

    simpanGame();
    renderLahan();
    showToast(`${pupukObj.nama} digunakan! Semua lahan dipercepat ${pupukObj.efekWaktu / 1000} Detik!`, 'success');
} 

function panenTanaman(index) {
    let l = lahan[index]; 
    if (l.status !== 'siap_panen') return; 
    
    if (slotAktif.kaki === 'joger' && slotAktif.badan !== 'jas') {
        slotAktif.kaki = null;
        updatePanelAksesoriInfo();
        showToast("Celana Joger dilepas otomatis karena Jas Anti Badai tidak aktif!", "error");
    }

    let totalBonusPersenAcc = hitungTotalBonusPersen(); 
    let jumlahDasarDanAcc = l.jumlahBibit + Math.floor(l.jumlahBibit * (totalBonusPersenAcc / 100));

    let efekCuacaEfektif = cuacaAktif.efekPersen;

    if (cuacaAktif.nama.includes('Badai') && slotAktif.badan === 'jas') {
        let jasObj = listAksesori.find(a => a.id === 'jas');
        if (jasObj && jasObj.tangkalBadai) {
            efekCuacaEfektif += jasObj.tangkalBadai;
            if (efekCuacaEfektif > 0) efekCuacaEfektif = 0;
        }
    }

    if (cuacaAktif.nama === 'Angin Kencang' && slotAktif.telapak === 'boots') {
        let bootsObj = listAksesori.find(a => a.id === 'boots');
        if (bootsObj && bootsObj.tangkalAngin) {
            efekCuacaEfektif += bootsObj.tangkalAngin;
            if (efekCuacaEfektif > 0) efekCuacaEfektif = 0;
        }
    }

    let penyesuaianCuaca = Math.round(jumlahDasarDanAcc * (efekCuacaEfektif / 100));
    let jumlahPanenTotal = jumlahDasarDanAcc + penyesuaianCuaca;

    if (cuacaAktif.nama.includes('Badai') && slotAktif.badan === 'jas' && slotAktif.kaki === 'joger') {
        let jogerObj = listAksesori.find(a => a.id === 'joger');
        if (jogerObj && jogerObj.sinergiJas) {
            let bonusSinergi = Math.floor(l.jumlahBibit * (jogerObj.sinergiJas / 100));
            jumlahPanenTotal += bonusSinergi;
        }
    }

    if (cuacaAktif.nama === 'Badai Petir Berat' && slotAktif.kepala === 'helmet') {
        let helmetObj = listAksesori.find(a => a.id === 'helmet');
        if (helmetObj && helmetObj.bonusBadaiPetir) {
            let bonusHelm = Math.floor(l.jumlahBibit * (helmetObj.bonusBadaiPetir / 100));
            jumlahPanenTotal += bonusHelm;
        }
    }

    if (jumlahPanenTotal < 1) jumlahPanenTotal = 1; 

    tambahKeInventory(l.tanaman, jumlahPanenTotal); 
    showToast(`Panen ${jumlahPanenTotal} ${l.tanaman} (${cuacaAktif.ikon} ${cuacaAktif.nama})!`, 'success'); 
    
    l.status = 'kosong'; 
    l.tanaman = null; 
    l.jumlahBibit = 0;
    l.waktuSelesai = 0; 
    
    if (l.timerInterval) clearInterval(l.timerInterval); 
    simpanGame();
    renderLahan(); 
} 

function bukaModalTransaksi(tipe, namaBarang, harga, stokMaksimal = 0) {
    if (cuacaAktif.nama.includes('Badai')) {
        showToast("Pasar sedang tutup karena cuaca badai!", "error");
        return;
    }

    currentTransactionType = tipe; 
    currentTransactionItem = namaBarang; 
    currentTransactionPrice = harga; 
    
    document.getElementById('modal-qty-container').style.display = 'flex';
    document.getElementById('modal-total-price').parentElement.style.display = 'block';
    document.getElementById('btn-confirm-transaction').setAttribute('onclick', 'konfirmasiTransaksi()');

    if (tipe === 'beli') {
        document.getElementById('modal-title').innerText = `Beli ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Beli'; 
        let maxMampuBeli = Math.floor(uang / harga); 
        maxQtyAllowed = Math.min(99, maxMampuBeli); 
        if (maxQtyAllowed < 1) maxQtyAllowed = 1; 
    } else if (tipe === 'beli_pupuk') {
        let pObj = listPupuk.find(p => p.id === namaBarang);
        let namaP = pObj ? pObj.nama : namaBarang;
        currentTransactionItem = pObj ? pObj.id : namaBarang;
        document.getElementById('modal-title').innerText = `Beli ${namaP}`;
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Beli';
        let maxMampuBeli = Math.floor(uang / harga);
        maxQtyAllowed = Math.min(99, maxMampuBeli);
        if (maxQtyAllowed < 1) maxQtyAllowed = 1;
    } else if (tipe === 'jual') {
        document.getElementById('modal-title').innerText = `Jual ${namaBarang}`; 
        document.getElementById('btn-confirm-transaction').innerText = 'Konfirmasi Jual'; 
        maxQtyAllowed = Math.min(999, stokMaksimal); 
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
    
    let btnText = document.getElementById('btn-confirm-transaction').innerText;
    if (btnText === 'Tanam Sekarang') {
        updateModalDisplayCustom();
    } else {
        updateModalDisplay(); 
    }
} 

function setQtyMaks() {
    currentQty = maxQtyAllowed; 
    if (currentQty === 0 && currentTransactionType === 'beli') currentQty = 1; 
    
    let btnText = document.getElementById('btn-confirm-transaction').innerText;
    if (btnText === 'Tanam Sekarang') {
        updateModalDisplayCustom();
    } else {
        updateModalDisplay(); 
    }
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
            tambahKeInventory(currentTransactionItem, currentQty); 
            tutupModalTransaksi(); 
            simpanGame();
            showToast(`Membeli ${currentQty} ${currentTransactionItem}!`, 'success'); 
        } else {
            showToast('Uang tidak cukup!', 'error'); 
        } 
    } else if (currentTransactionType === 'beli_pupuk') {
        if (uang >= totalHarga) {
            uang -= totalHarga;
            updateUangDisplay();
            stokPupuk[currentTransactionItem] += currentQty;
            tutupModalTransaksi();
            simpanGame();
            renderPasar();
            renderLahan();
            showToast(`Membeli ${currentQty} pupuk!`, 'success');
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
    const container = document.getElementById('subtab-content-container'); 
    if (!container) return;

    let filteredItems = inventory.filter(item => {
        if (currentSubInventory === 'bibit') {
            return item.nama.includes('Bibit');
        } else if (currentSubInventory === 'panen') {
            return !item.nama.includes('Bibit');
        } else if (currentSubInventory === 'ternak') {
            return item.kategori === 'ternak';
        }
        return false;
    });

    if (filteredItems.length === 0) {
        let pesanKosong = 'Belum ada item di kategori ini.';
        if (currentSubInventory === 'bibit') pesanKosong = 'Belum ada bibit. Beli di Tab Pasar!';
        if (currentSubInventory === 'panen') pesanKosong = 'Belum ada hasil panen. Silakan bertani dulu!';
        if (currentSubInventory === 'ternak') pesanKosong = 'Belum ada hasil hewan ternak.';
        
        container.innerHTML = `<p style="color: #64748b; font-style: italic; text-align: center; padding: 20px; font-size: 12px;">${pesanKosong}</p>`; 
        return; 
    } 
    
    let html = ''; 
    filteredItems.forEach((item) => {
        let icon = '📦'; 
        let actionButton = ''; 
        let dataTanaman = libraryTanaman.find(t => t.namaBibit === item.nama || t.nama === item.nama); 
        
        if (item.nama.includes('Bibit')) {
            icon = dataTanaman ? dataTanaman.iconBibit : '🌱'; 
            actionButton = `<button class="btn-submit" style="padding: 5px 8px; font-size: 11px;" onclick="pilihBibitUntukDitanam('${item.nama}')">Tanam</button>`; 
        } else {
            icon = dataTanaman ? dataTanaman.iconBuah : '📦'; 
            let hargaJualSatuan = hargaJualAktif[item.nama] || 0; 
            actionButton = ` 
                <div style="text-align: right;"> 
                    <small style="display: block; color: #64748b; font-size: 9px;">Jual: Rp ${formatRupiah(hargaJualSatuan)}</small> 
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
    
    hitungDanTerapkanJadwalCuaca();
    
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
