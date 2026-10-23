// ==========================================
// MODULE BALAP KUDA (balap_kuda.js) - STAMINA CONSUMPTION & TOP 3 FINISH LOGIC
// ==========================================

let balapKudaState = {
    kelasAktif: "D",
    kandangKuda: [], // Array menampung maksimal 5 kuda pemain
    indexKudaAktif: 0, // Index kuda yang sedang dipilih/digunakan
    daftarPasarKuda: [],
    musimBalapHari: -1,
    // State sementara untuk fitur Breeding
    indukJantanIdx: null,
    indukBetinaIdx: null,
    pemulihanInterval: null,
    balapanInterval: null,
    isBalapanBerjalan: false
};

const MAX_KAPASITAS_KUDA = 5;
const COOLDOWN_BREEDING_HARI = 10; 
const MIN_USIA_BREEDING_HARI = 25; 

// Konfigurasi Kelas, Syarat OVR, Biaya, dan Hadiah Juara 1, 2, 3
const KONFIG_KELAS = {
    "D": { 
        nama: "Kelas D (Pemula)",   
        ovrMin: 70, ovrMax: 230, 
        biayaDaftar: 3000,
        hadiah: { j1: 20000, j2: 10000, j3: 5000 }
    },
    "C": { 
        nama: "Kelas C (Amatir)",   
        ovrMin: 231, ovrMax: 390, 
        biayaDaftar: 10000,
        hadiah: { j1: 50000, j2: 30000, j3: 15000 }
    },
    "B": { 
        nama: "Kelas B (Pro)",      
        ovrMin: 391, ovrMax: 550, 
        biayaDaftar: 27000,
        hadiah: { j1: 150000, j2: 75000, j3: 35000 }
    },
    "A": { 
        nama: "Kelas A (Elite)",    
        ovrMin: 551, ovrMax: 710, 
        biayaDaftar: 70000,
        hadiah: { j1: 350000, j2: 175000, j3: 85000 }
    },
    "S": { 
        nama: "Kelas S (Master)",   
        ovrMin: 711, ovrMax: 980, 
        biayaDaftar: 150000,
        hadiah: { j1: 800000, j2: 400000, j3: 200000 }
    },
    "SS": { 
        nama: "Kelas SS (Legend)",  
        ovrMin: 981, ovrMax: 1500,
        biayaDaftar: 450000,
        hadiah: { j1: 2500000, j2: 1250000, j3: 600000 }
    }
};

const NAMA_KUDA_NPC = [
    "Baron", "Zeus", "Natto", "Basal", "Bergie", "Molam", "Shadow", 
    "Pegasus", "Bintang", "Thunder", "Blaze", "Tornado", "Valkyrie", 
    "Titan", "Phantom", "Eclipse", "Byakko", "Dandan", "Kelp", 
    "Ares", "Apollo", "Hermes", "Comet", "Draco", "Orion", "Saber",
    "Gatot", "Subroto", "Kevin", "Persa", "Dragon", "Windy", "Rainy",
    "Black", "White", "Kosah", "Pedro", "Pikti", "Ogas", "Mola", "Storm"
];

// --- FUNGSI HELPER SYSTEM POPUP CUSTOM MODERN ---
function bukaModalCustom(judul, HTMLKonten, tanpaTombolTutup = false) {
    let modalExisting = document.getElementById("custom-game-modal");
    if (modalExisting) modalExisting.remove();

    let tombolTutupHTML = tanpaTombolTutup 
        ? `<span style="font-size:0.8rem; color:#f87171; font-weight:bold;">🔒 Balapan Bertanding...</span>`
        : `<button onclick="tutupModalCustom()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✖</button>`;

    let modalHTML = `
        <div id="custom-game-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:15px; animation:fadeIn 0.2s ease;">
            <div style="background:#0f172a; border:1px solid #3b82f6; border-radius:12px; width:100%; max-width:580px; box-shadow:0 10px 25px rgba(0,0,0,0.8); overflow:hidden; color:#f8fafc;">
                <div style="padding:15px; background:#1e293b; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:1.1rem; color:#38bdf8;">${judul}</h3>
                    ${tombolTutupHTML}
                </div>
                <div style="padding:20px; max-height:85vh; overflow-y:auto;">
                    ${HTMLKonten}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function tutupModalCustom() {
    if (balapKudaState.isBalapanBerjalan) {
        return; // Tidak bisa ditutup manual saat pertandingan berjalan
    }

    if (balapKudaState.balapanInterval) {
        clearInterval(balapKudaState.balapanInterval);
        balapKudaState.balapanInterval = null;
    }
    let modal = document.getElementById("custom-game-modal");
    if (modal) modal.remove();
}

function dialogKonfirmasiCustom(judul, pesan, callbackYa) {
    let konten = `
        <p style="margin-bottom:20px; font-size:0.95rem; line-height:1.4; color:#cbd5e1;">${pesan}</p>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button onclick="tutupModalCustom()" style="background:#475569; border:none; padding:8px 16px; border-radius:6px; color:#fff; cursor:pointer;">Batal</button>
            <button id="btn-modal-ya" style="background:#2563eb; border:none; padding:8px 16px; border-radius:6px; color:#fff; cursor:pointer; font-weight:bold;">Ya, Lanjutkan</button>
        </div>
    `;
    bukaModalCustom(judul, konten);
    document.getElementById("btn-modal-ya").onclick = () => {
        tutupModalCustom();
        callbackYa();
    };
}

// --- HELPER PROSES PEMULIHAN STAMINA PASIF (+5 per 45 Menit In-Game) ---
function prosesPemulihanStaminaPasif(kuda) {
    if (!kuda) return;

    let hariSekarang = Number(gameState.waktuHari) || 0;
    let jamSekarang = parseInt(gameState.jam, 10) || 0;
    let menitSekarang = Number(gameState.menit) || 0;

    let totalMenitSekarang = (hariSekarang * 24 * 60) + (jamSekarang * 60) + menitSekarang;

    if (kuda.terakhirUpdateMenit === undefined || kuda.terakhirUpdateMenit === null) {
        kuda.terakhirUpdateMenit = totalMenitSekarang;
        return;
    }

    let selisihMenit = totalMenitSekarang - kuda.terakhirUpdateMenit;

    if (selisihMenit >= 45) {
        let jumlahSiklus = Math.floor(selisihMenit / 45);
        let penambahanStamina = jumlahSiklus * 5;
        let penguranganStres = jumlahSiklus * 5;

        if (kuda.stamina < kuda.staminaMax) {
            kuda.stamina = Math.min(kuda.staminaMax, kuda.stamina + penambahanStamina);
        }

        if (kuda.stres > 0) {
            kuda.stres = Math.max(0, kuda.stres - penguranganStres);
        }

        kuda.terakhirUpdateMenit += (jumlahSiklus * 45);
    }
}

// --- HELPER HARGA JUAL KUDA ---
function hitungHargaJualKuda(k) {
    let ovrAsli = hitungOverallKuda(k.stats);
    let hargaBase = 75000 + (ovrAsli * 150);
    if (k.isJuaraSS) {
        hargaBase = Math.round(hargaBase * 1.18); 
    }
    return Math.round(hargaBase);
}

// --- FUNGSI UTAMA / RENDER TAB ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    let detailsOpenState = {};
    document.querySelectorAll('#area-balap-kuda details').forEach(el => {
        let kelasId = el.getAttribute('data-kelas');
        if (kelasId) {
            detailsOpenState[kelasId] = el.open;
        }
    });

    if (balapKudaState.pemulihanInterval) {
        clearInterval(balapKudaState.pemulihanInterval);
        balapKudaState.pemulihanInterval = null;
    }

    if (!balapKudaState.kandangKuda) balapKudaState.kandangKuda = [];
    if (balapKudaState.kudaPemain && balapKudaState.kandangKuda.length === 0) {
        let kAwal = balapKudaState.kudaPemain;
        if (kAwal.lahirHari === undefined) kAwal.lahirHari = 0;
        balapKudaState.kandangKuda.push(kAwal);
    }

    balapKudaState.kandangKuda.forEach(k => prosesPemulihanStaminaPasif(k));

    if (!balapKudaState.daftarPasarKuda || balapKudaState.daftarPasarKuda.length === 0 || balapKudaState.musimBalapHari !== gameState.waktuHari) {
        balapKudaState.musimBalapHari = gameState.waktuHari;
        generasiPasarKuda();
        generasiLawanPerKelas();
    }

    let html = `<div class="card" style="grid-column: 1/-1; padding: 20px; text-align: center;">
        <h2>🏇 Arena Balap Kuda Desa</h2>
        <p style="color: var(--text-muted);">Latih kudamu, kelola stamina & stres, kawinkan kuda unggulan, dan jadilah juara!</p>
        <p style="font-size:0.9rem; margin-top:5px;">🕒 Status Arena: <b style="color:#34d399">BUKA 24 JAM</b> | Pemulihan Stamina: <b>+5 / 45 Menit in-game</b></p>
    </div>`;

    // 1. TAMPILAN KANDANG & KUDA PEMAIN
    let jumlahKuda = balapKudaState.kandangKuda.length;
    let kudaAktif = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif] || null;

    html += `<div class="card" style="grid-column: 1/-1; border: 1px solid #60a5fa;">`;
    html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">
        <h3 style="margin:0;">🏚️ Kandang Kuda (${jumlahKuda}/${MAX_KAPASITAS_KUDA})</h3>
        <span style="font-size:0.85rem; color:var(--text-muted);">Maksimal 5 Kuda di Kandang</span>
    </div>`;

    if (jumlahKuda === 0) {
        html += `
            <div style="text-align:center; padding:20px;">
                <h3>🐎 <span style="color:#f87171;">Belum Memiliki Kuda</span></h3>
                <p style="color: var(--text-muted);">Beli kuda di Pasar Kuda di bawah untuk mulai bertani & bertanding!</p>
            </div>
        `;
    } else {
        html += `<div style="margin-bottom:15px; background:#1e293b; padding:10px; border-radius:8px;">
            <label style="font-size:0.85rem; color:#94a3b8; display:block; margin-bottom:5px;">🐴 Pilih Kuda yang Ingin Dilihat / Dikelola:</label>
            <select onchange="pilihKudaAktif(this.value)" style="width:100%; padding:10px; border-radius:6px; background:#0f172a; color:#fff; border:1px solid #3b82f6; font-size:0.95rem;">
                ${balapKudaState.kandangKuda.map((k, idx) => `
                    <option value="${idx}" ${idx === balapKudaState.indexKudaAktif ? 'selected' : ''}>
                        ${k.gender === "Jantan" ? "🩵" : "🩷"} ${k.nama} [OVR: ${hitungOverallKuda(k.stats)}] ${k.isJuaraSS ? '🏆 Juara SS' : ''}
                    </option>
                `).join('')}
            </select>
        </div>`;

        let k = kudaAktif;
        let ovrAsli = hitungOverallKuda(k.stats);
        let statE = hitungStatEfektif(k, k.stamina);
        let ovrEfektif = hitungOverallKuda(statE);

        let statusPenaltiTeks = statE.penaltiPersen > 0 
            ? `<span style="color:#f87171; font-size:0.85rem;">(📉 Penurunan Performa -${statE.penaltiPersen}% karena lelah/stres)</span>` 
            : `<span style="color:#34d399; font-size:0.85rem;">(✨ Performa Optimal 100%)</span>`;

        let hargaJualEst = hitungHargaJualKuda(k);
        let iconGenderText = k.gender === "Jantan" ? "🩵 Jantan" : "🩷 Betina";
        let usiaHari = (gameState.waktuHari || 0) - (k.lahirHari || 0);

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3>
                        🐎 ${k.nama} <small style="font-size:0.85rem; color:#94a3b8;">(${iconGenderText})</small>
                        <button onclick="bukaModalGantiNama()" style="background:none; border:none; cursor:pointer; font-size:0.9rem;" title="Ganti Nama">✏️</button>
                        <span style="color:#fbbf24; font-size:0.9rem;">[Kelas: ${k.kelasMaks}]</span>
                        ${k.isJuaraSS ? '<span style="background:#eab308; color:#000; font-size:0.75rem; padding:2px 6px; border-radius:4px; font-weight:bold; margin-left:5px;">🏆 Legend SS</span>' : ''}
                    </h3>
                    <p>Usia: <b>${usiaHari} Hari in-game</b> | OVR Asli: <b>${ovrAsli} Pts</b> | OVR Efektif: <b style="color:${statE.penaltiPersen > 0 ? '#f87171' : '#34d399'}; font-size:1.2rem;">${ovrEfektif} Pts</b> ${statusPenaltiTeks}</p>
                    <p>⚡ Stamina: <b id="display-stamina-kuda">${k.stamina} / ${k.staminaMax}</b> | 🪨 Stres: <b style="color:${k.stres >= 80 ? '#f87171' : '#34d399'}">${k.stres} / 100</b></p>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    <button onclick="latihKuda('kecepatan')" style="background:#2563eb; margin:2px;">🏃 Kecepatan</button>
                    <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; margin:2px;">🛡️ Daya Tahan</button>
                    <button onclick="latihKuda('akselerasi')" style="background:#2563eb; margin:2px;">🚀 Akselerasi</button>
                    <button onclick="latihKuda('kelincahan')" style="background:#2563eb; margin:2px;">🌀 Kelincahan</button>
                    <button onclick="konfirmasiJualKuda(${balapKudaState.indexKudaAktif})" style="background:#dc2626; margin:2px;">💰 Jual (Rp.${hargaJualEst.toLocaleString('id-ID')})</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:15px; background:#101622; padding:10px; border-radius:8px; font-size:0.85rem;">
                <div>🏎️ Kecepatan: <b>${statE.kecepatan}</b> <small style="color:var(--text-muted);">(${k.stats.kecepatan})</small></div>
                <div>🛡️ Daya Tahan: <b>${statE.dayaTahan}</b> <small style="color:var(--text-muted);">(${k.stats.dayaTahan})</small></div>
                <div>🚀 Akselerasi: <b>${statE.akselerasi}</b> <small style="color:var(--text-muted);">(${k.stats.akselerasi})</small></div>
                <div>🧠 Mental: <b>${statE.mental}</b> <small style="color:var(--text-muted);">(${k.stats.mental})</small></div>
                <div>🌀 Kelincahan: <b>${statE.kelincahan}</b> <small style="color:var(--text-muted);">(${k.stats.kelincahan})</small></div>
            </div>
        `;
    }
    html += `</div>`;

    // 2. PANEL KAWIN KUDA (BREEDING MODERN)
    html += `<div class="card" style="grid-column: 1/-1; border: 1px solid #ec4899; background: #0f172a; text-align:center;">
        <h3 style="color:#f472b6; margin-top:0;">💕 Peternakan & Kawin Kuda (Breeding)</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Kawinkan 1 Kuda Jantan & 1 Kuda Betina (Syarat: Usia minimal 25 hari & Cooldown 10 hari). Bonus <b>+10% Stat OVR</b>!</p>
        
        <div style="margin-top:15px;">
            <button onclick="bukaModalBreedingModern()" style="background:linear-gradient(135deg, #ec4899, #be185d); color:#fff; border:none; padding:12px 24px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 4px 12px rgba(236, 72, 153, 0.3);">
                🧬 Pilih Indukan & Mulai Breeding (Rp 95.000)
            </button>
        </div>
    </div>`;

    // 3. TAMPILAN PERLOMBAAN KELAS
    html += `<h3 style="grid-column: 1/-1; color: #fbbf24; margin-top: 15px;">🏆 Arena Pertandingan Kelas (8 Peserta: 1 Pemain + 7 Lawan NPC)</h3>`;
    
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    urutanKelas.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let adaKudaBisaIkut = balapKudaState.kandangKuda.some(k => dapatAksesKelasKuda(k, kls));
        let daftarLawan = balapKudaState.lawanPerKelas ? balapKudaState.lawanPerKelas[kls] || [] : [];
        let isOpen = detailsOpenState[kls] ? "open" : "";
        
        html += `
            <div class="card" style="border: 1px solid ${adaKudaBisaIkut ? '#10b981' : 'var(--border-color)'}; opacity: ${adaKudaBisaIkut ? '1' : '0.6'}">
                <h3>🏆 Kelas ${kls}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted);">${cfg.nama}</p>
                <p style="font-size:0.85rem;">Rata-rata OVR: <b>${cfg.ovrMin} - ${cfg.ovrMax}</b></p>
                <p style="font-size:0.8rem; color:#fbbf24; margin-top:5px;">
                    🥇 J1: Rp. ${cfg.hadiah.j1.toLocaleString('id-ID')}<br>
                    🥈 J2: Rp. ${cfg.hadiah.j2.toLocaleString('id-ID')}<br>
                    🥉 J3: Rp. ${cfg.hadiah.j3.toLocaleString('id-ID')}
                </p>
                
                <details data-kelas="${kls}" ${isOpen} style="margin-top:10px; font-size:0.8rem; background:#0f172a; padding:6px; border-radius:5px;">
                    <summary style="cursor:pointer; color:#60a5fa;"><b>📋 Daftar 7 Lawan NPC</b></summary>
                    <ul style="padding-left:15px; margin-top:5px; text-align:left;">
                        ${daftarLawan.map((npc, i) => `<li><b>${i+1}. ${npc.nama}</b> (${npc.gender === "Jantan" ? "🩵" : "🩷"}) - OVR: <span style="color:#fbbf24">${hitungOverallKuda(npc.stats)} Pts</span></li>`).join('')}
                    </ul>
                </details>

                <button onclick="pilihKudaSebelumBalapan('${kls}')" style="background:${adaKudaBisaIkut ? '#059669' : '#334155'}; width:100%; margin-top:10px;" ${!adaKudaBisaIkut ? 'disabled' : ''}>
                    ${!adaKudaBisaIkut ? 'Tidak ada Kuda Layak' : 'Ikut Tanding'}
                </button>
            </div>
        `;
    });

    // 4. PASAR KUDA
    html += `<h3 style="grid-column: 1/-1; color: #60a5fa; margin-top: 20px;">🛒 Pasar Kuda Hari Ini</h3>`;
    if (balapKudaState.daftarPasarKuda.length === 0) {
        html += `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Stok kuda hari ini habis. Kembali lagi besok!</p>`;
    } else {
        balapKudaState.daftarPasarKuda.forEach((kudaPasar, idx) => {
            let ovr = hitungOverallKuda(kudaPasar.stats);
            let iconGender = kudaPasar.gender === "Jantan" ? "🩵 Jantan" : "🩷 Betina";
            html += `
                <div class="card">
                    <div style="font-size: 2.5rem;">🐎</div>
                    <h3>${kudaPasar.nama}</h3>
                    <p style="font-size:0.85rem; color:#94a3b8;">Jenis Kelamin: <b>${iconGender}</b></p>
                    <p>Est. OVR: <b style="color:#fbbf24;">${ovr} Pts</b></p>
                    <p>Harga: <b>Rp. ${kudaPasar.harga.toLocaleString('id-ID')}</b></p>
                    <button onclick="beliKudaPasar(${idx})" style="background:#2563eb; width:100%; margin-top:5px;">Beli Kuda</button>
                </div>
            `;
        });
    }

    container.innerHTML = html;

    // PERBAIKAN: Hanya update teks angka stamina secara presisi tanpa re-render HTML penuh
    balapKudaState.pemulihanInterval = setInterval(() => {
        if (!balapKudaState.kandangKuda || balapKudaState.kandangKuda.length === 0) return;
        
        // 1. Jalankan proses pemulihan pasif
        balapKudaState.kandangKuda.forEach(k => prosesPemulihanStaminaPasif(k));
        
        // 2. Cukup perbarui angka stamina elemen aktif jika ada, TANPA renderBalapKuda()
        let kAktif = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
        if (kAktif) {
            let elStamina = document.getElementById("display-stamina-kuda");
            if (elStamina) {
                elStamina.innerText = `${kAktif.stamina} / ${kAktif.staminaMax}`;
            }
        }
    }, 2000);

// --- FUNGSI MANAJEMEN KANDANG & KUDA ---
function pilihKudaAktif(index) {
    let idx = parseInt(index, 10);
    if (balapKudaState.kandangKuda[idx]) {
        balapKudaState.indexKudaAktif = idx;
        renderBalapKuda();
    }
}

function konfirmasiJualKuda(index) {
    let k = balapKudaState.kandangKuda[index];
    if (!k) return;

    let hargaJual = hitungHargaJualKuda(k);
    dialogKonfirmasiCustom(
        "💰 Jual Kuda",
        `Apakah kamu yakin ingin menjual <b>${k.nama}</b> ${k.isJuaraSS ? '(Bonus Juara SS +18%)' : ''} seharga <b>Rp. ${hargaJual.toLocaleString('id-ID')}</b>?`,
        () => {
            gameState.uang += hargaJual;
            balapKudaState.kandangKuda.splice(index, 1);
            if (balapKudaState.indexKudaAktif >= balapKudaState.kandangKuda.length) {
                balapKudaState.indexKudaAktif = Math.max(0, balapKudaState.kandangKuda.length - 1);
            }
            if (typeof updateHeaderUI === "function") updateHeaderUI();
            bukaModalCustom("🎉 Kuda Terjual!", `<p>Kamu telah menjual <b>${k.nama}</b> seharga <b>Rp. ${hargaJual.toLocaleString('id-ID')}</b>!</p>`);
            renderBalapKuda();
        }
    );
}

// --- LOGIKA HITUNG STAT & OVERALL DENGAN PENURUNAN STAMINA & STRES ---
function hitungOverallKuda(stats) {
    if (!stats) return 0;
    return Math.round((stats.kecepatan || 0) + (stats.dayaTahan || 0) + (stats.akselerasi || 0) + (stats.mental || 0) + (stats.kelincahan || 0));
}

function hitungStatEfektif(kuda, staminaAktif) {
    let s = kuda.stats;
    if (!s) return { kecepatan: 0, dayaTahan: 0, akselerasi: 0, mental: 0, kelincahan: 0, penaltiPersen: 0 };

    let curStamina = staminaAktif !== undefined ? staminaAktif : (kuda.stamina || 100);
    let maxStamina = kuda.staminaMax || 100;

    let rasioStaminaKosong = 1 - (curStamina / maxStamina);
    let rasioStres = (kuda.stres || 0) / 100;

    // Daya tahan mengurangi tingkat keparahan penalti performa
    let reduksiPenaltiDayaTahan = Math.min(0.25, (s.dayaTahan || 10) / 400); 
    let faktorPenalti = Math.max(0, ((rasioStaminaKosong * 0.45) + (rasioStres * 0.35)) - reduksiPenaltiDayaTahan);
    let pengaliPerforma = Math.max(0.12, 1 - faktorPenalti);

    return {
        kecepatan: Math.round(s.kecepatan * pengaliPerforma),
        dayaTahan: Math.round(s.dayaTahan * pengaliPerforma),
        akselerasi: Math.round(s.akselerasi * pengaliPerforma),
        mental: Math.round(s.mental * pengaliPerforma),
        kelincahan: Math.round(s.kelincahan * pengaliPerforma),
        penaltiPersen: Math.round(faktorPenalti * 100)
    };
}

function buatStatRandom(ovrMin, ovrMax) {
    let targetOvr = Math.floor(Math.random() * (ovrMax - ovrMin + 1)) + ovrMin;
    let bagian = targetOvr / 5;
    return {
        kecepatan: Math.max(10, Math.round(bagian + (Math.random() * 10 - 5))),
        dayaTahan: Math.max(10, Math.round(bagian + (Math.random() * 10 - 5))),
        akselerasi: Math.max(10, Math.round(bagian + (Math.random() * 10 - 5))),
        mental: Math.max(10, Math.round(bagian + (Math.random() * 10 - 5))),
        kelincahan: Math.max(10, Math.round(bagian + (Math.random() * 10 - 5)))
    };
}

// --- GENERASI LAWAN PER KELAS ---
function generasiLawanPerKelas() {
    balapKudaState.lawanPerKelas = {};
    let kelasList = ["D", "C", "B", "A", "S", "SS"];
    let namaAcak = [...NAMA_KUDA_NPC].sort(() => Math.random() - 0.5);

    kelasList.forEach((kls, idx) => {
        let cfg = KONFIG_KELAS[kls];
        balapKudaState.lawanPerKelas[kls] = [];
        
        for (let i = 0; i < 7; i++) {
            let indexNama = (idx * 3 + i) % namaAcak.length;
            let nama = namaAcak[indexNama] + ` [NPC]`;
            let stats = buatStatRandom(cfg.ovrMin, cfg.ovrMax);
            let gender = Math.random() < 0.5 ? "Jantan" : "Betina";
            let staminaMax = 80 + Math.floor(Math.random() * 40); 
            
            balapKudaState.lawanPerKelas[kls].push({
                nama: nama,
                stats: stats,
                gender: gender,
                stamina: staminaMax,
                staminaMax: staminaMax,
                stres: Math.floor(Math.random() * 20),
                isPemain: false
            });
        }
    });
}

// --- PASAR KUDA ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    let namaAcak = [...NAMA_KUDA_NPC].sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
        let nama = "Kuda " + namaAcak[i];
        let stats = buatStatRandom(80, 120);
        let harga = 75000 + Math.round(hitungOverallKuda(stats) * 150);
        let gender = Math.random() < 0.5 ? "Jantan" : "Betina";
        balapKudaState.daftarPasarKuda.push({ nama, stats, harga, gender });
    }
}

function beliKudaPasar(index) {
    if (balapKudaState.kandangKuda.length >= MAX_KAPASITAS_KUDA) {
        bukaModalCustom("⚠️ Kandang Penuh", "<p>Kandangmu sudah penuh (Maksimal 5 Kuda)! Jual salah satu kudamu terlebih dahulu.</p>");
        return;
    }

    let item = balapKudaState.daftarPasarKuda[index];
    if (gameState.uang < item.harga) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", `<p>Kamu butuh Rp. ${item.harga.toLocaleString('id-ID')} untuk membeli kuda ini!</p>`);
        return;
    }

    dialogKonfirmasiCustom(
        "🛒 Beli Kuda",
        `Beli <b>${item.nama}</b> (${item.gender === "Jantan" ? "🩵 Jantan" : "🩷 Betina"}) seharga <b>Rp. ${item.harga.toLocaleString('id-ID')}</b>?`,
        () => {
            gameState.uang -= item.harga;
            let hariSekarang = gameState.waktuHari || 0;
            let jamSekarang = parseInt(gameState.jam, 10) || 0;
            let menitSekarang = Number(gameState.menit) || 0;

            let kudaBaru = {
                nama: item.nama,
                stats: item.stats,
                gender: item.gender,
                stamina: 100,
                staminaMax: 100,
                stres: 0,
                terakhirUpdateMenit: (hariSekarang * 24 * 60) + (jamSekarang * 60) + menitSekarang,
                terakhirBreedingHari: null,
                lahirHari: hariSekarang,
                kelasMaks: "D",
                isPemain: true,
                isJuaraSS: false
            };

            balapKudaState.kandangKuda.push(kudaBaru);
            balapKudaState.indexKudaAktif = balapKudaState.kandangKuda.length - 1;
            balapKudaState.daftarPasarKuda.splice(index, 1);
            
            if (typeof updateHeaderUI === "function") updateHeaderUI();
            bukaModalCustom("🎉 Sukses Membeli Kuda", `<p>Selamat! <b>${item.nama}</b> telah masuk ke kandang kudamu!</p>`);
            renderBalapKuda();
        }
    );
}

// --- MODAL BREEDING MODERN ---
function bukaModalBreedingModern() {
    balapKudaState.indukJantanIdx = null;
    balapKudaState.indukBetinaIdx = null;

    let hariSekarang = gameState.waktuHari || 0;
    let listJantan = [];
    let listBetina = [];

    balapKudaState.kandangKuda.forEach((k, idx) => {
        let usiaHari = hariSekarang - (k.lahirHari || 0);
        let sisaCdBreeding = k.terakhirBreedingHari !== undefined && k.terakhirBreedingHari !== null 
            ? COOLDOWN_BREEDING_HARI - (hariSekarang - k.terakhirBreedingHari) 
            : 0;

        let layakBreeding = usiaHari >= MIN_USIA_BREEDING_HARI && sisaCdBreeding <= 0;
        let infoKet = "";
        if (usiaHari < MIN_USIA_BREEDING_HARI) infoKet = `⏳ Belum Cukup Usia (${usiaHari}/${MIN_USIA_BREEDING_HARI} Hari)`;
        else if (sisaCdBreeding > 0) infoKet = `⏳ CD Breeding (${sisaCdBreeding} Hari)`;

        let itemData = { ...k, originalIdx: idx, layak: layakBreeding, ket: infoKet };

        if (k.gender === "Jantan") listJantan.push(itemData);
        if (k.gender === "Betina") listBetina.push(itemData);
    });

    let konten = `
        <div style="text-align:center; margin-bottom:15px;">
            <p style="font-size:0.85rem; color:#cbd5e1;">Pilih 1 Induk Jantan dan 1 Induk Betina untuk dikawinkan.<br><small style="color:#fbbf24;">(Syarat: Usia min. 25 hari & Cooldown 10 hari)</small></p>
        </div>

        <h4 style="color:#93c5fd; margin-bottom:8px;">🩵 Induk Jantan:</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-bottom:15px;">
            ${listJantan.length === 0 ? '<p style="color:#94a3b8; font-size:0.8rem;">Tidak ada kuda jantan di kandang.</p>' : 
                listJantan.map(k => `
                    <div id="card-jantan-${k.originalIdx}" onclick="${k.layak ? `pilihIndukBreeding('jantan', ${k.originalIdx})` : ''}" style="background:#1e293b; border:2px solid ${k.layak ? '#334155' : '#7f1d1d'}; opacity:${k.layak ? '1' : '0.6'}; padding:8px; border-radius:8px; cursor:${k.layak ? 'pointer' : 'not-allowed'}; text-align:center;">
                        <b style="font-size:0.85rem;">${k.nama}</b>
                        <div style="font-size:0.75rem; color:#fbbf24;">OVR: ${hitungOverallKuda(k.stats)}</div>
                        ${!k.layak ? `<div style="font-size:0.7rem; color:#f87171; margin-top:2px;">${k.ket}</div>` : ''}
                    </div>
                `).join('')
            }
        </div>

        <h4 style="color:#f472b6; margin-bottom:8px;">🩷 Induk Betina:</h4>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:8px; margin-bottom:20px;">
            ${listBetina.length === 0 ? '<p style="color:#94a3b8; font-size:0.8rem;">Tidak ada kuda betina di kandang.</p>' : 
                listBetina.map(k => `
                    <div id="card-betina-${k.originalIdx}" onclick="${k.layak ? `pilihIndukBreeding('betina', ${k.originalIdx})` : ''}" style="background:#1e293b; border:2px solid ${k.layak ? '#334155' : '#7f1d1d'}; opacity:${k.layak ? '1' : '0.6'}; padding:8px; border-radius:8px; cursor:${k.layak ? 'pointer' : 'not-allowed'}; text-align:center;">
                        <b style="font-size:0.85rem;">${k.nama}</b>
                        <div style="font-size:0.75rem; color:#fbbf24;">OVR: ${hitungOverallKuda(k.stats)}</div>
                        ${!k.layak ? `<div style="font-size:0.7rem; color:#f87171; margin-top:2px;">${k.ket}</div>` : ''}
                    </div>
                `).join('')
            }
        </div>

        <button id="btn-eksekusi-breeding" onclick="eksekusiBreeding()" style="background:#db2777; color:#fff; width:100%; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer; opacity:0.5;" disabled>
            💖 Kawinkan (Rp. 95.000)
        </button>
    `;

    bukaModalCustom("💕 Fitur Breeding Modern", konten);
}

function pilihIndukBreeding(jenis, idx) {
    if (jenis === 'jantan') {
        balapKudaState.indukJantanIdx = idx;
        document.querySelectorAll('[id^="card-jantan-"]').forEach(el => {
            if (!el.style.cursor.includes('not-allowed')) el.style.borderColor = '#334155';
        });
        let sel = document.getElementById(`card-jantan-${idx}`);
        if (sel) sel.style.borderColor = '#3b82f6';
    } else {
        balapKudaState.indukBetinaIdx = idx;
        document.querySelectorAll('[id^="card-betina-"]').forEach(el => {
            if (!el.style.cursor.includes('not-allowed')) el.style.borderColor = '#334155';
        });
        let sel = document.getElementById(`card-betina-${idx}`);
        if (sel) sel.style.borderColor = '#ec4899';
    }

    let btn = document.getElementById("btn-eksekusi-breeding");
    if (btn && balapKudaState.indukJantanIdx !== null && balapKudaState.indukBetinaIdx !== null) {
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

function eksekusiBreeding() {
    if (balapKudaState.kandangKuda.length >= MAX_KAPASITAS_KUDA) {
        tutupModalCustom();
        bukaModalCustom("⚠️ Kandang Penuh", "<p>Kandangmu penuh (Maksimal 5 Kuda)! Jual salah satu kudamu terlebih dahulu.</p>");
        return;
    }

    let idxJ = balapKudaState.indukJantanIdx;
    let idxB = balapKudaState.indukBetinaIdx;

    if (idxJ === null || idxB === null) return;

    let jantan = balapKudaState.kandangKuda[idxJ];
    let betina = balapKudaState.kandangKuda[idxB];

    let biayaKawin = 95000;
    if (gameState.uang < biayaKawin) {
        tutupModalCustom();
        bukaModalCustom("⚠️ Uang Tidak Cukup", `<p>Biaya perawatan & kawin kuda membutuhkan Rp. ${biayaKawin.toLocaleString('id-ID')}!</p>`);
        return;
    }

    tutupModalCustom();
    dialogKonfirmasiCustom(
        "💖 Kawin Kuda",
        `Kawinkan <b>${jantan.nama}</b> 🩵 & <b>${betina.nama}</b> 🩷 seharga <b>Rp. ${biayaKawin.toLocaleString('id-ID')}</b>?`,
        () => {
            gameState.uang -= biayaKawin;
            let hariSekarang = gameState.waktuHari || 0;
            let jamSekarang = parseInt(gameState.jam, 10) || 0;
            let menitSekarang = Number(gameState.menit) || 0;

            jantan.terakhirBreedingHari = hariSekarang;
            betina.terakhirBreedingHari = hariSekarang;

            let calcStat = (s1, s2) => Math.round(((s1 + s2) / 2) * 1.10);

            let statsAnak = {
                kecepatan: calcStat(jantan.stats.kecepatan, betina.stats.kecepatan),
                dayaTahan: calcStat(jantan.stats.dayaTahan, betina.stats.dayaTahan),
                akselerasi: calcStat(jantan.stats.akselerasi, betina.stats.akselerasi),
                mental: calcStat(jantan.stats.mental, betina.stats.mental),
                kelincahan: calcStat(jantan.stats.kelincahan, betina.stats.kelincahan)
            };

            let genderAnak = Math.random() < 0.5 ? "Jantan" : "Betina";
            let namaAnak = "Junior " + NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)];

            let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
            let idxJantanKls = urutanKelas.indexOf(jantan.kelasMaks);
            let idxBetinaKls = urutanKelas.indexOf(betina.kelasMaks);
            let kelasMaksAnak = urutanKelas[Math.max(idxJantanKls, idxBetinaKls)];

            let anakKuda = {
                nama: namaAnak,
                stats: statsAnak,
                gender: genderAnak,
                stamina: 100,
                staminaMax: 100,
                stres: 0,
                terakhirUpdateMenit: (hariSekarang * 24 * 60) + (jamSekarang * 60) + menitSekarang,
                terakhirBreedingHari: null,
                lahirHari: hariSekarang,
                kelasMaks: kelasMaksAnak,
                isPemain: true,
                isJuaraSS: false
            };

            balapKudaState.kandangKuda.push(anakKuda);
            balapKudaState.indexKudaAktif = balapKudaState.kandangKuda.length - 1;

            let ovrAnak = hitungOverallKuda(statsAnak);
            if (typeof updateHeaderUI === "function") updateHeaderUI();

            bukaModalCustom(
                "🍼 Selamat! Keturunan Baru Lahir!",
                `<div style="text-align:center;">
                    <p style="font-size:2.5rem; margin:10px 0;">🐎</p>
                    <p>Lahir seekor anak kuda: <b>${namaAnak}</b> (${genderAnak === "Jantan" ? "🩵 Jantan" : "🩷 Betina"})</p>
                    <p style="color:#fbbf24; font-size:1.1rem;">OVR Awal: <b>${ovrAnak} Pts</b> (+10% Bonus Stat Induk)</p>
                    <p style="font-size:0.8rem; color:#94a3b8;">*Anakan baru bisa dikawinkan setelah berusia 25 hari in-game.</p>
                </div>`
            );

            renderBalapKuda();
        }
    );
}

// --- FUNGSI GANTI NAMA MODAL ---
function bukaModalGantiNama() {
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!k) return;

    let konten = `
        <div style="margin-bottom:15px;">
            <label style="font-size:0.85rem; color:#94a3b8; display:block; margin-bottom:5px;">Nama Kuda Baru:</label>
            <input type="text" id="input-nama-kuda" value="${k.nama}" maxlength="20" style="width:100%; padding:8px; border-radius:6px; background:#1e293b; color:#fff; border:1px solid #334155; box-sizing:border-box;">
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button onclick="tutupModalCustom()" style="background:#475569; border:none; padding:8px 16px; border-radius:6px; color:#fff; cursor:pointer;">Batal</button>
            <button onclick="simpanNamaKudaBaru()" style="background:#059669; border:none; padding:8px 16px; border-radius:6px; color:#fff; cursor:pointer; font-weight:bold;">Simpan</button>
        </div>
    `;
    bukaModalCustom("✏️ Ganti Nama Kuda", konten);
}

function simpanNamaKudaBaru() {
    let input = document.getElementById("input-nama-kuda");
    if (!input) return;

    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    let namaBaru = input.value.trim();

    if (namaBaru === "") {
        alert("⚠️ Nama kuda tidak boleh kosong!");
        return;
    }

    k.nama = namaBaru;
    tutupModalCustom();
    renderBalapKuda();
}

// --- MEKANIK LATIHAN & STRES (20 STAMINA) ---
function latihKuda(statKey) {
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!k) return;

    if (k.stamina < 20) {
        bukaModalCustom("⚠️ Kuda Kelelahan", "<p>Stamina kuda kurang dari 20! Tunggu stamina pulih secara pasif (+5 / 45m in-game).</p>");
        return;
    }

    if (k.stres >= 100) {
        bukaModalCustom("⚠️ Stres Maksimal", "<p>Kuda mencapai batas maksimal stres (100)! Biarkan kudamu tenang terlebih dahulu.</p>");
        return;
    }

    k.stamina -= 20;
    let penambahanStres = 20; 
    k.stres = Math.min(100, k.stres + penambahanStres);

    let penambahanStat = Math.floor(Math.random() * 2) + 1; 
    k.stats[statKey] += penambahanStat;

    if (statKey === 'dayaTahan' && penambahanStat > 0) {
        k.staminaMax += 1;
    }

    let namaStat = {
        kecepatan: "Kecepatan",
        dayaTahan: "Daya Tahan",
        akselerasi: "Akselerasi",
        kelincahan: "Kelincahan"
    }[statKey] || statKey;

    bukaModalCustom("🏃 Latihan Selesai", `<p><b>${k.nama}</b> berhasil melatih ${namaStat}: <b>+${penambahanStat} Pts</b>! (Stamina -20, Stres +${penambahanStres})</p>`);

    renderBalapKuda();
}

// --- MEKANIK SIMULASI BALAPAN & ANIMASI LINTASAN 500M ---
function dapatAksesKelasKuda(kuda, kelas) {
    if (!kuda) return false;
    let urutan = ["D", "C", "B", "A", "S", "SS"];
    return urutan.indexOf(kelas) <= urutan.indexOf(kuda.kelasMaks);
}

function pilihKudaSebelumBalapan(kelas) {
    let cfg = KONFIG_KELAS[kelas];

    let listKudaBisa = [];
    balapKudaState.kandangKuda.forEach((k, idx) => {
        if (dapatAksesKelasKuda(k, kelas)) {
            listKudaBisa.push({ ...k, originalIdx: idx });
        }
    });

    if (listKudaBisa.length === 0) {
        bukaModalCustom("⚠️ Tidak Ada Kuda Layak", `<p>Tidak ada kuda di kandangmu yang berhak bertanding di Kelas ${kelas}!</p>`);
        return;
    }

    let konten = `
        <div style="margin-bottom:15px;">
            <p style="font-size:0.85rem; color:#cbd5e1;">Pilih kuda yang akan kamu turunkan untuk berpacu di <b>Kelas ${kelas}</b>:</p>
            <p style="font-size:0.8rem; color:#fbbf24;">Biaya Pendaftaran: <b>Rp. ${cfg.biayaDaftar.toLocaleString('id-ID')}</b></p>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
            ${listKudaBisa.map(k => {
                let statE = hitungStatEfektif(k, k.stamina);
                let ovrE = hitungOverallKuda(statE);
                let cukupStamina = k.stamina >= 30;
                return `
                    <div style="background:#1e293b; border:1px solid ${cukupStamina ? '#334155' : '#7f1d1d'}; padding:10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <b>${k.nama}</b> (${k.gender === 'Jantan' ? '🩵' : '🩷'})
                            <div style="font-size:0.8rem; color:#94a3b8;">OVR Efektif: <b style="color:#34d399;">${ovrE} Pts</b> | Stamina: ${k.stamina}/${k.staminaMax}</div>
                            ${!cukupStamina ? '<small style="color:#f87171;">Stamina kurang (Min. 30)</small>' : ''}
                        </div>
                        <button onclick="mulaiBalapanKelas('${kelas}', ${k.originalIdx})" style="background:${cukupStamina ? '#059669' : '#334155'}; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:${cukupStamina ? 'pointer' : 'not-allowed'}; font-weight:bold;" ${!cukupStamina ? 'disabled' : ''}>
                            Pilih Kuda
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
    `;

    bukaModalCustom(`🏇 Pilih Kuda - Kelas ${kelas}`, konten);
}

function mulaiBalapanKelas(kelas, idxKuda) {
    tutupModalCustom();

    let k = balapKudaState.kandangKuda[idxKuda];
    let cfg = KONFIG_KELAS[kelas];

    if (k.stamina < 30) {
        bukaModalCustom("⚠️ Stamina Kurang", "<p>Stamina kuda kurang untuk mengikuti balapan (Minimal 30)!</p>");
        return;
    }

    if (gameState.uang < cfg.biayaDaftar) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", `<p>Biaya pendaftaran Kelas ${kelas} adalah Rp. ${cfg.biayaDaftar.toLocaleString('id-ID')}!</p>`);
        return;
    }

    gameState.uang -= cfg.biayaDaftar;
    k.stres = Math.min(100, k.stres + 15);
    if (typeof updateHeaderUI === "function") updateHeaderUI();

    let lawanNpcList = balapKudaState.lawanPerKelas[kelas] || [];
    let peserta = lawanNpcList.map(npc => ({
        nama: npc.nama,
        stats: npc.stats,
        gender: npc.gender,
        staminaAwal: npc.staminaMax,
        staminaCurrent: npc.staminaMax,
        staminaMax: npc.staminaMax,
        stres: npc.stres,
        isPemain: false,
        refObject: npc
    }));

    peserta.push({
        nama: k.nama + " (Kuda Kamu)",
        stats: k.stats,
        gender: k.gender,
        staminaAwal: k.stamina,
        staminaCurrent: k.stamina,
        staminaMax: k.staminaMax,
        stres: k.stres,
        isPemain: true,
        refObject: k
    }));

    // Inisialisasi Kinerja Peserta
    peserta.forEach(p => {
        p.jarakTempuhMeter = 0;
        p.kecepatanInstan = 0;
        p.sudahFinis = false;
        p.urutanFinis = null;
        p.skorKinerjaAkumulatif = 0;
    });

    balapKudaState.isBalapanBerjalan = true;
    jalankanAnimasiBalapan500m(kelas, peserta, k);
}

// --- ENGINE ANIMASI REAL-TIME LINTASAN 500M (BERHENTI KETIKA 3 JUARA FINIS) ---
function jalankanAnimasiBalapan500m(kelas, pesertaList, kudaPemainRef) {
    let modalHTML = `
        <div style="text-align:center;">
            <div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; padding:10px 15px; border-radius:8px; margin-bottom:10px;">
                <div>🏁 Lintasan: <b style="color:#38bdf8;">500 Meter</b></div>
                <div>🏆 Status: <b id="status-juara-finis" style="color:#fbbf24;">Mencari 3 Juara Finis</b></div>
                <div>🚩 Jarak: <b id="jarak-pemain" style="color:#34d399;">0m / 500m</b></div>
            </div>

            <!-- UI Lintasan Balap Kuda -->
            <div id="arena-lintasan-container" style="background:#022c22; border:2px solid #059669; border-radius:8px; padding:10px; position:relative; overflow-x:auto;">
                <div style="position:absolute; right:15px; top:0; bottom:0; width:4px; background:repeating-linear-gradient(0deg, #fff, #fff 10px, #000 10px, #000 20px); z-index:5; box-shadow:0 0 10px #fff;"></div>
                
                <div id="wrapper-jalur-kuda" style="display:flex; flex-direction:column; gap:6px; min-width:480px;">
                    ${pesertaList.map((p, idx) => `
                        <div style="display:flex; align-items:center; background:#064e3b; padding:4px 8px; border-radius:6px; position:relative; border:1px solid ${p.isPemain ? '#38bdf8' : '#047857'};">
                            <span style="font-size:0.75rem; width:85px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; text-align:left; color:${p.isPemain ? '#38bdf8' : '#cbd5e1'}; font-weight:${p.isPemain ? 'bold' : 'normal'};">
                                ${p.isPemain ? '⭐ ' : ''}${p.nama.split(' ')[0]}
                            </span>
                            <div style="flex:1; position:relative; height:24px; background:rgba(0,0,0,0.3); border-radius:12px; margin-left:5px; overflow:hidden;">
                                <div id="kuda-runner-${idx}" style="position:absolute; left:0%; top:50%; transform:translateY(-50%); font-size:1.1rem; transition:left 0.2s linear; display:flex; align-items:center;">
                                    🏇
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Live Leaderboard Real-Time & Status OVR -->
            <div style="margin-top:12px; background:#0f172a; padding:10px; border-radius:8px; border:1px solid #334155; text-align:left;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:0.85rem; font-weight:bold; color:#fbbf24;">📊 Live Leaderboard & Stat Realtime:</span>
                    <span style="font-size:0.75rem; color:#94a3b8;">📉 Konsumsi Stamina Dynamic</span>
                </div>
                <div id="live-leaderboard" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:6px; font-size:0.75rem;">
                    <!-- Terisi otomatis via JS -->
                </div>
            </div>
        </div>
    `;

    // Modal dibuka TANPA TOMBOL TUTUP agar tidak bisa di-close saat berjalan
    bukaModalCustom(`🏁 Pertandingan Balap Kuda - Kelas ${kelas}`, modalHTML, true);

    let daftarFinis = [];

    balapKudaState.balapanInterval = setInterval(() => {
        pesertaList.forEach((p, idx) => {
            if (!p.sudahFinis) {
                // 1. Hitung Stat Efektif & OVR
                let statE = hitungStatEfektif({ stats: p.stats, stres: p.stres, staminaMax: p.staminaMax }, p.staminaCurrent);

                // 2. Akselerasi dan Kecepatan Lari Instan Berdasarkan Stat Efektif & Mental
                let targetKecepatan = (statE.kecepatan * 0.40) + (statE.akselerasi * 0.35) + (statE.kelincahan * 0.25);
                let mentalBoost = (Math.random() * (statE.mental / 35));

                p.kecepatanInstan = Math.min(targetKecepatan + mentalBoost, targetKecepatan * 1.15);

                // Pertambahan Jarak Tempuh Meter per Frame
                let pertambahanJarak = Math.max(0.15, p.kecepatanInstan / 25);
                p.jarakTempuhMeter = Math.min(500, p.jarakTempuhMeter + pertambahanJarak);
                p.skorKinerjaAkumulatif += p.kecepatanInstan;

                // 3. PENGURANGAN STAMINA DYNAMIC SESUAI KECEPATAN & RESISTANSI DAYA TAHAN
                // Kecepatan tinggi memakan stamina lebih banyak, Daya tahan tinggi menghemat stamina
                let pengaliKecepatan = p.kecepatanInstan / 30; 
                let efisiensiDayaTahan = Math.max(0.35, 1 - (statE.dayaTahan / 300)); 
                let staminaTerkuras = (0.28 * pengaliKecepatan) * efisiensiDayaTahan;

                p.staminaCurrent = Math.max(0, p.staminaCurrent - staminaTerkuras);

                // Simpan pengurangan stamina permanen jika milik pemain
                if (p.isPemain && p.refObject) {
                    p.refObject.stamina = Math.round(p.staminaCurrent);
                }

                // 4. CEK CONDITION JUARA FINIS
                if (p.jarakTempuhMeter >= 500) {
                    p.sudahFinis = true;
                    daftarFinis.push(p);
                    p.urutanFinis = daftarFinis.length;
                }
            }
        });

        // Update Posisi Kuda di UI Lintasan
        pesertaList.forEach((p, idx) => {
            let elRunner = document.getElementById(`kuda-runner-${idx}`);
            if (elRunner) {
                let persenJarak = (p.jarakTempuhMeter / 500) * 100;
                elRunner.style.left = `calc(${persenJarak}% - 20px)`;
            }
        });

        // Update Meter Kuda Pemain & Status Juara Finis
        let elStatusJuara = document.getElementById("status-juara-finis");
        if (elStatusJuara) elStatusJuara.innerText = `Juara Finis: ${daftarFinis.length}/3`;

        let indexPemain = pesertaList.findIndex(p => p.isPemain);
        if (indexPemain !== -1) {
            let elMeter = document.getElementById("jarak-pemain");
            if (elMeter) elMeter.innerText = `${Math.round(pesertaList[indexPemain].jarakTempuhMeter)}m / 500m`;
        }

        // Live Leaderboard Realtime Update dengan Info OVR & Stamina
        let rankingList = pesertaList.map((p) => {
            let sEfektif = hitungStatEfektif({ stats: p.stats, stres: p.stres, staminaMax: p.staminaMax }, p.staminaCurrent);
            return {
                nama: p.nama,
                jarak: p.jarakTempuhMeter,
                stamina: Math.round(p.staminaCurrent),
                ovrNow: hitungOverallKuda(sEfektif),
                isPemain: p.isPemain,
                sudahFinis: p.sudahFinis,
                posFinis: p.urutanFinis
            };
        }).sort((a, b) => {
            if (a.sudahFinis && b.sudahFinis) return a.posFinis - b.posFinis;
            if (a.sudahFinis) return -1;
            if (b.sudahFinis) return 1;
            return b.jarak - a.jarak;
        });

        let elBoard = document.getElementById("live-leaderboard");
        if (elBoard) {
            elBoard.innerHTML = rankingList.map((r, i) => `
                <div style="background:#1e293b; padding:4px 6px; border-radius:4px; border:1px solid ${r.isPemain ? '#38bdf8' : '#334155'}; text-align:left;">
                    <div style="color:${r.isPemain ? '#38bdf8' : '#f8fafc'}; font-weight:${r.isPemain ? 'bold' : 'normal'}; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">
                        ${r.sudahFinis ? `🏆 #${r.posFinis} ` : `${i+1}. `}${r.nama.split(' ')[0]}
                    </div>
                    <div style="font-size:0.7rem; color:#94a3b8; display:flex; justify-content:space-between; margin-top:2px;">
                        <span>📍 ${Math.round(r.jarak)}m</span>
                        <span style="color:#fbbf24;">⚡ ${r.stamina}</span>
                    </div>
                    <div style="font-size:0.65rem; color:#34d399; margin-top:1px;">
                        OVR: <b>${r.ovrNow}</b> Pts
                    </div>
                </div>
            `).join('');
        }

        // BERHENTI KETIKA SUDAH ADA 3 JUARA FINIS
        if (daftarFinis.length >= 3) {
            clearInterval(balapKudaState.balapanInterval);
            balapKudaState.balapanInterval = null;
            balapKudaState.isBalapanBerjalan = false;

            setTimeout(() => {
                selesaikanHasilBalapan(kelas, pesertaList, kudaPemainRef);
            }, 600);
        }

    }, 200); 
}

function selesaikanHasilBalapan(kelas, pesertaList, kudaPemainRef) {
    let cfg = KONFIG_KELAS[kelas];

    // Penentuan Urutan Hasil Akhir: Kuda Finis Lebih Dulu Ditampilkan di Atas
    pesertaList.sort((a, b) => {
        if (a.sudahFinis && b.sudahFinis) {
            return a.urutanFinis - b.urutanFinis;
        }
        if (a.sudahFinis) return -1;
        if (b.sudahFinis) return 1;
        return b.jarakTempuhMeter - a.jarakTempuhMeter;
    });

    let posisiPemain = pesertaList.findIndex(p => p.isPemain) + 1;
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    let idxSekarang = urutanKelas.indexOf(kelas);

    if (posisiPemain === 1) {
        gameState.uang += cfg.hadiah.j1;
        if (kelas === "SS") {
            kudaPemainRef.isJuaraSS = true; 
        }
        if (idxSekarang < urutanKelas.length - 1 && urutanKelas.indexOf(kudaPemainRef.kelasMaks) === idxSekarang) {
            kudaPemainRef.kelasMaks = urutanKelas[idxSekarang + 1];
        }
    } else if (posisiPemain === 2) {
        gameState.uang += cfg.hadiah.j2;
    } else if (posisiPemain === 3) {
        gameState.uang += cfg.hadiah.j3;
    }

    if (typeof updateHeaderUI === "function") updateHeaderUI();

    tampilkanHasilBalapanModal(kelas, pesertaList, posisiPemain);
    renderBalapKuda();
}

function tampilkanHasilBalapanModal(kelas, pesertaSorted, posisiPemain) {
    let modalTeks = `<div style="max-height:350px; overflow-y:auto; text-align:left;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8;">
                    <th style="padding:6px; text-align:center;">Pos</th>
                    <th style="padding:6px; text-align:left;">Nama Kuda</th>
                    <th style="padding:6px; text-align:center;">Sisa Stamina</th>
                    <th style="padding:6px; text-align:center;">Jarak</th>
                </tr>
            </thead>
            <tbody>`;

    pesertaSorted.forEach((p, idx) => {
        let pos = idx + 1;
        let isPlayer = p.isPemain;
        let bgStyle = isPlayer ? "background:rgba(59,130,246,0.2); font-weight:bold;" : "";
        let piala = pos === 1 ? '🥇 ' : (pos === 2 ? '🥈 ' : (pos === 3 ? '🥉 ' : `${pos}. `));
        
        modalTeks += `<tr style="${bgStyle} border-bottom:1px solid #1e293b;">
            <td style="padding:6px; text-align:center;">${piala}</td>
            <td style="padding:6px; color:${isPlayer ? '#60a5fa' : '#f8fafc'};">${p.nama} (${p.gender === "Jantan" ? "🩵" : "🩷"})</td>
            <td style="padding:6px; text-align:center; color:#fbbf24;">⚡ ${Math.round(p.staminaCurrent)}</td>
            <td style="padding:6px; text-align:center; color:#34d399;">${Math.round(p.jarakTempuhMeter)}m</td>
        </tr>`;
    });

    modalTeks += `</tbody></table></div>`;

    let judul = `🏆 Hasil Balapan Kelas ${kelas} (Posisi Ke-${posisiPemain})`;
    bukaModalCustom(judul, modalTeks, false); // Setelah balapan selesai, modal baru bisa ditutup biasa
}
