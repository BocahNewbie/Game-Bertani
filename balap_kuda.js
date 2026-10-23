// ==========================================
// MODULE BALAP KUDA (balap_kuda.js)
// ==========================================

let balapKudaState = {
    kelasAktif: "D",
    kandangKuda: [], // Array menampung maksimal 5 kuda pemain
    indexKudaAktif: 0, // Index kuda yang sedang dipilih/digunakan
    daftarPasarKuda: [],
    musimBalapHari: -1,
    // State sementara untuk fitur Breeding
    indukJantanIdx: null,
    indukBetinaIdx: null
};

const MAX_KAPASITAS_KUDA = 5;

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

const NAMA_KUDA_NPC = ["Baron", "Zeus", "Natto", "Basal", "Bergie", "Molam", "Shadow", "Pegasus", "Bintang", "Thunder", "Blaze", "Tornado", "Valkyrie", "Titan", "Phantom", "Eclipse", "Byakko", "Dandan", "Kelp"];

// --- FUNGSI HELPER SYSTEM POPUP CUSTOM MODERN ---
function bukaModalCustom(judul, HTMLKonten) {
    let modalExisting = document.getElementById("custom-game-modal");
    if (modalExisting) modalExisting.remove();

    let modalHTML = `
        <div id="custom-game-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:15px; animation:fadeIn 0.2s ease;">
            <div style="background:#0f172a; border:1px solid #3b82f6; border-radius:12px; width:100%; max-width:480px; box-shadow:0 10px 25px rgba(0,0,0,0.8); overflow:hidden; color:#f8fafc;">
                <div style="padding:15px; background:#1e293b; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; font-size:1.1rem; color:#38bdf8;">${judul}</h3>
                    <button onclick="tutupModalCustom()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✖</button>
                </div>
                <div style="padding:20px;">
                    ${HTMLKonten}
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function tutupModalCustom() {
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

// --- FUNGSI CEK JAM ARENA BUKA ---
function isArenaBuka() {
    let jamSekarang = Number(gameState.jam) || 0;
    return jamSekarang >= 10 && jamSekarang <= 19;
}

// --- FUNGSI UTAMA / RENDER TAB ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    // Inisialisasi struktur kandang jika belum ada
    if (!balapKudaState.kandangKuda) balapKudaState.kandangKuda = [];
    if (balapKudaState.kudaPemain && balapKudaState.kandangKuda.length === 0) {
        balapKudaState.kandangKuda.push(balapKudaState.kudaPemain);
    }

    // Paksa buat pasar kuda & lawan NPC baru jika belum ada data sama sekali atau hari berganti
    if (!balapKudaState.daftarPasarKuda || balapKudaState.daftarPasarKuda.length === 0 || balapKudaState.musimBalapHari !== gameState.waktuHari) {
        balapKudaState.musimBalapHari = gameState.waktuHari;
        generasiPasarKuda();
        generasiLawanPerKelas();
    }

    let jamSekarang = Number(gameState.jam) || 0;
    let hariSekarang = gameState.waktuHari || 0;
    let arenaBuka = isArenaBuka();

    let html = `<div class="card" style="grid-column: 1/-1; padding: 20px; text-align: center;">
        <h2>🏇 Arena Balap Kuda Desa</h2>
        <p style="color: var(--text-muted);">Latih kudamu, atur stamina & stres, kawinkan kuda unggulan, dan jadilah juara!</p>
        <p style="font-size:0.9rem; margin-top:5px;">🕒 Jam Operasional Balap: <b>10.00 - 19.00</b> | Status Saat Ini: <b style="color:${arenaBuka ? '#34d399' : '#f87171'}">${arenaBuka ? 'BUKA' : 'TUTUP'}</b></p>
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
        // Tab Pemilihan Kuda di Kandang
        html += `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px;">`;
        balapKudaState.kandangKuda.forEach((k, idx) => {
            let isSelected = idx === balapKudaState.indexKudaAktif;
            let iconGender = k.gender === "Jantan" ? "🩵" : "🩷";
            html += `
                <button onclick="pilihKudaAktif(${idx})" style="background:${isSelected ? '#2563eb' : '#1e293b'}; border:1px solid ${isSelected ? '#60a5fa' : '#334155'}; color:#fff; padding:8px 12px; border-radius:6px; cursor:pointer; white-space:nowrap; font-size:0.85rem;">
                    ${iconGender} ${k.nama} [OVR: ${hitungOverallKuda(k.stats)}]
                </button>
            `;
        });
        html += `</div>`;

        // Tampilan Kuda Aktif
        let k = kudaAktif;
        let ovrAsli = hitungOverallKuda(k.stats);
        let statE = hitungStatEfektif(k);
        let ovrEfektif = hitungOverallKuda(statE);

        // Cek Selisih Waktu Istirahat untuk Cooldown
        let totalJamSekarang = (hariSekarang * 24) + jamSekarang;
        let totalJamTerakhir = ((k.terakhirIstirahatHari || 0) * 24) + (k.terakhirIstirahatJam || 0);
        let selisihJam = totalJamSekarang - totalJamTerakhir;
        
        let sedangCooldown = k.terakhirIstirahatHari !== undefined && selisihJam < 5;
        let sisaCooldown = sedangCooldown ? Math.ceil(5 - selisihJam) : 0;

        let butuhIstirahat = k.stamina < k.staminaMax || k.stres > 0;
        let bisaIstirahat = !sedangCooldown && butuhIstirahat;

        let teksTombolIstirahat = "💤 Istirahat";
        if (sedangCooldown) {
            teksTombolIstirahat = `⏳ CD (${sisaCooldown} Jam)`;
        } else if (!butuhIstirahat) {
            teksTombolIstirahat = `✨ Prima (100%)`;
        }

        let statusPenaltiTeks = statE.penaltiPersen > 0 
            ? `<span style="color:#f87171; font-size:0.85rem;">(📉 Penurunan Performa -${statE.penaltiPersen}% karena lelah/stres)</span>` 
            : `<span style="color:#34d399; font-size:0.85rem;">(✨ Performa Optimal 100%)</span>`;

        let hargaJualEst = Math.round(ovrAsli * 75);
        let iconGenderText = k.gender === "Jantan" ? "🩵 Jantan" : "🩷 Betina";

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3>
                        🐎 ${k.nama} <small style="font-size:0.85rem; color:#94a3b8;">(${iconGenderText})</small>
                        <button onclick="bukaModalGantiNama()" style="background:none; border:none; cursor:pointer; font-size:0.9rem;" title="Ganti Nama">✏️</button>
                        <span style="color:#fbbf24; font-size:0.9rem;">[Kelas: ${k.kelasMaks}]</span>
                    </h3>
                    <p>OVR Asli: <b>${ovrAsli} Pts</b> | OVR Efektif: <b style="color:${statE.penaltiPersen > 0 ? '#f87171' : '#34d399'}; font-size:1.2rem;">${ovrEfektif} Pts</b> ${statusPenaltiTeks}</p>
                    <p>⚡ Stamina: <b>${k.stamina} / ${k.staminaMax}</b> | 🪨 Stres: <b style="color:${k.stres >= 80 ? '#f87171' : '#34d399'}">${k.stres} / 100</b></p>
                </div>
                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    <button onclick="latihKuda('kecepatan')" style="background:#2563eb; margin:2px;">🏃 Kecepatan</button>
                    <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; margin:2px;">🛡️ Daya Tahan</button>
                    <button onclick="latihKuda('akselerasi')" style="background:#2563eb; margin:2px;">🚀 Akselerasi</button>
                    <button onclick="latihKuda('kelincahan')" style="background:#2563eb; margin:2px;">🌀 Kelincahan</button>
                    <button onclick="istirahatKuda()" style="background:${bisaIstirahat ? '#059669' : '#334155'}; margin:2px;" ${!bisaIstirahat ? 'disabled' : ''}>${teksTombolIstirahat}</button>
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

    // 2. PANEL KAWIN KUDA (BREEDING)
    html += `<div class="card" style="grid-column: 1/-1; border: 1px solid #ec4899; background: #0f172a;">
        <h3 style="color:#f472b6; margin-top:0;">💕 Peternakan & Kawin Kuda (Breeding)</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Kawinkan 1 Kuda Jantan & 1 Kuda Betina milikmu untuk melahirkan keturunan baru dengan bonus <b>+10% Stat OVR</b>!</p>
        
        <div style="display:flex; flex-wrap:wrap; gap:15px; align-items:center; margin-top:15px;">
            <div style="flex:1; min-width:200px;">
                <label style="font-size:0.8rem; color:#93c5fd;"> Pilih Induk Jantan (🩵):</label>
                <select id="select-jantan" style="width:100%; padding:8px; border-radius:6px; background:#1e293b; color:#fff; border:1px solid #334155; margin-top:4px;">
                    <option value="">-- Pilih Kuda Jantan --</option>
                    ${balapKudaState.kandangKuda.map((k, i) => k.gender === "Jantan" ? `<option value="${i}">${k.nama} (OVR: ${hitungOverallKuda(k.stats)})</option>` : '').join('')}
                </select>
            </div>
            <div style="font-size:1.5rem;">➕</div>
            <div style="flex:1; min-width:200px;">
                <label style="font-size:0.8rem; color:#f472b6;"> Pilih Induk Betina (🩷):</label>
                <select id="select-betina" style="width:100%; padding:8px; border-radius:6px; background:#1e293b; color:#fff; border:1px solid #334155; margin-top:4px;">
                    <option value="">-- Pilih Kuda Betina --</option>
                    ${balapKudaState.kandangKuda.map((k, i) => k.gender === "Betina" ? `<option value="${i}">${k.nama} (OVR: ${hitungOverallKuda(k.stats)})</option>` : '').join('')}
                </select>
            </div>
            <div style="min-width:180px;">
                <button onclick="prosesKawinKuda()" style="background:#db2777; width:100%; padding:10px; font-weight:bold; margin-top:18px;">💖 Kawinkan (Rp. 15.000)</button>
            </div>
        </div>
    </div>`;

    // 3. TAMPILAN PERLOMBAAN KELAS
    html += `<h3 style="grid-column: 1/-1; color: #fbbf24; margin-top: 15px;">🏆 Arena Pertandingan Kelas (8 Peserta)</h3>`;
    
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    urutanKelas.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let kudaAktif = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
        let bisaIkut = kudaAktif && dapatAksesKelas(kls) && arenaBuka;
        let daftarLawan = balapKudaState.lawanPerKelas ? balapKudaState.lawanPerKelas[kls] || [] : [];
        
        html += `
            <div class="card" style="border: 1px solid ${bisaIkut ? '#10b981' : 'var(--border-color)'}; opacity: ${kudaAktif && dapatAksesKelas(kls) ? '1' : '0.6'}">
                <h3>🏆 Kelas ${kls}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted);">${cfg.nama}</p>
                <p style="font-size:0.85rem;">Rata-rata OVR: <b>${cfg.ovrMin} - ${cfg.ovrMax}</b></p>
                <p style="font-size:0.8rem; color:#fbbf24; margin-top:5px;">
                    🥇 J1: Rp. ${cfg.hadiah.j1.toLocaleString('id-ID')}<br>
                    🥈 J2: Rp. ${cfg.hadiah.j2.toLocaleString('id-ID')}<br>
                    🥉 J3: Rp. ${cfg.hadiah.j3.toLocaleString('id-ID')}
                </p>
                
                <details style="margin-top:10px; font-size:0.8rem; background:#0f172a; padding:6px; border-radius:5px;">
                    <summary style="cursor:pointer; color:#60a5fa;"><b>📋 Daftar 7 Lawan NPC</b></summary>
                    <ul style="padding-left:15px; margin-top:5px; text-align:left;">
                        ${daftarLawan.map(npc => `<li><b>${npc.nama}</b> (${npc.gender === "Jantan" ? "🩵" : "🩷"}) - OVR: <span style="color:#fbbf24">${hitungOverallKuda(npc.stats)} Pts</span></li>`).join('')}
                    </ul>
                </details>

                <button onclick="mulaiBalapanKelas('${kls}')" style="background:${bisaIkut ? '#059669' : '#334155'}; width:100%; margin-top:10px;" ${!bisaIkut ? 'disabled' : ''}>
                    ${!kudaAktif ? 'Butuh Kuda' : (!dapatAksesKelas(kls) ? 'Terkunci' : (!arenaBuka ? 'Tutup (10.00-19.00)' : 'Ikut Tanding'))}
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
}

// --- FUNGSI MANAJEMEN KANDANG & KUDA ---
function pilihKudaAktif(index) {
    if (balapKudaState.kandangKuda[index]) {
        balapKudaState.indexKudaAktif = index;
        renderBalapKuda();
    }
}

function konfirmasiJualKuda(index) {
    let k = balapKudaState.kandangKuda[index];
    if (!k) return;

    let hargaJual = Math.round(hitungOverallKuda(k.stats) * 75);
    dialogKonfirmasiCustom(
        "💰 Jual Kuda",
        `Apakah kamu yakin ingin menjual <b>${k.nama}</b> seharga <b>Rp. ${hargaJual.toLocaleString('id-ID')}</b>?`,
        () => {
            gameState.uang += hargaJual;
            balapKudaState.kandangKuda.splice(index, 1);
            if (balapKudaState.indexKudaAktif >= balapKudaState.kandangKuda.length) {
                balapKudaState.indexKudaAktif = Math.max(0, balapKudaState.kandangKuda.length - 1);
            }
            updateHeaderUI();
            bukaModalCustom("🎉 Kuda Terjual!", `<p>Kamu telah menjual <b>${k.nama}</b> seharga <b>Rp. ${hargaJual.toLocaleString('id-ID')}</b>!</p>`);
            renderBalapKuda();
        }
    );
}

// --- LOGIKA HITUNG STAT & OVERALL ---
function hitungOverallKuda(stats) {
    if (!stats) return 0;
    return Math.round((stats.kecepatan || 0) + (stats.dayaTahan || 0) + (stats.akselerasi || 0) + (stats.mental || 0) + (stats.kelincahan || 0));
}

function hitungStatEfektif(kuda) {
    let s = kuda.stats;
    if (!s) return { kecepatan: 0, dayaTahan: 0, akselerasi: 0, mental: 0, kelincahan: 0, penaltiPersen: 0 };
    
    if (!kuda.isPemain && kuda.isPemain !== undefined) {
        return { ...s, penaltiPersen: 0 };
    }

    let rasioStaminaKosong = 1 - ((kuda.stamina || 0) / (kuda.staminaMax || 100));
    let rasioStres = (kuda.stres || 0) / 100;

    let faktorPenalti = (rasioStaminaKosong * 0.35) + (rasioStres * 0.45);
    let pengaliPerforma = Math.max(0.2, 1 - faktorPenalti);

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
    
    kelasList.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        balapKudaState.lawanPerKelas[kls] = [];
        
        for (let i = 0; i < 7; i++) {
            let nama = NAMA_KUDA_NPC[(i + kls.charCodeAt(0)) % NAMA_KUDA_NPC.length] + ` [NPC]`;
            let stats = buatStatRandom(cfg.ovrMin, cfg.ovrMax);
            let gender = Math.random() < 0.5 ? "Jantan" : "Betina";
            balapKudaState.lawanPerKelas[kls].push({
                nama: nama,
                stats: stats,
                gender: gender,
                isPemain: false
            });
        }
    });
}

// --- PASAR KUDA ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    for (let i = 0; i < 3; i++) {
        let nama = "Kuda " + NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)];
        let stats = buatStatRandom(80, 120);
        let harga = 20000 + Math.round(hitungOverallKuda(stats) * 80);
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
            let kudaBaru = {
                nama: item.nama,
                stats: item.stats,
                gender: item.gender,
                stamina: 100,
                staminaMax: 100,
                stres: 0,
                terakhirIstirahatJam: -99,
                terakhirIstirahatHari: -1,
                kelasMaks: "D",
                isPemain: true
            };

            balapKudaState.kandangKuda.push(kudaBaru);
            balapKudaState.indexKudaAktif = balapKudaState.kandangKuda.length - 1;
            balapKudaState.daftarPasarKuda.splice(index, 1);
            
            updateHeaderUI();
            bukaModalCustom("🎉 Sukses Membeli Kuda", `<p>Selamat! <b>${item.nama}</b> telah masuk ke kandang kudamu!</p>`);
            renderBalapKuda();
        }
    );
}

// --- LOGIKA KAWIN KUDA (BREEDING) ---
function prosesKawinKuda() {
    if (balapKudaState.kandangKuda.length >= MAX_KAPASITAS_KUDA) {
        bukaModalCustom("⚠️ Kandang Penuh", "<p>Kandangmu penuh (Maksimal 5 Kuda)! Jual salah satu kudamu terlebih dahulu sebelum mengkawinkan.</p>");
        return;
    }

    let selectJantan = document.getElementById("select-jantan");
    let selectBetina = document.getElementById("select-betina");

    if (!selectJantan || !selectBetina || selectJantan.value === "" || selectBetina.value === "") {
        bukaModalCustom("⚠️ Pilih Induk Kuda", "<p>Silakan pilih 1 Kuda Jantan dan 1 Kuda Betina untuk dikawinkan!</p>");
        return;
    }

    let idxJ = parseInt(selectJantan.value);
    let idxB = parseInt(selectBetina.value);

    let jantan = balapKudaState.kandangKuda[idxJ];
    let betina = balapKudaState.kandangKuda[idxB];

    let biayaKawin = 15000;
    if (gameState.uang < biayaKawin) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", `<p>Biaya perawatan & kawin kuda membutuhkan Rp. ${biayaKawin.toLocaleString('id-ID')}!</p>`);
        return;
    }

    dialogKonfirmasiCustom(
        "💖 Kawin Kuda",
        `Kawinkan <b>${jantan.nama}</b> 🩵 & <b>${betina.nama}</b> 🩷 seharga <b>Rp. ${biayaKawin.toLocaleString('id-ID')}</b>?`,
        () => {
            gameState.uang -= biayaKawin;

            // Hitung rata-rata + 10% bonus stat
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

            // Tentukan kelas tertinggi dari induk
            let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
            let idxJ = urutanKelas.indexOf(jantan.kelasMaks);
            let idxB = urutanKelas.indexOf(betina.kelasMaks);
            let kelasMaksAnak = urutanKelas[Math.max(idxJ, idxB)];

            let anakKuda = {
                nama: namaAnak,
                stats: statsAnak,
                gender: genderAnak,
                stamina: 100,
                staminaMax: 100,
                stres: 0,
                terakhirIstirahatJam: -99,
                terakhirIstirahatHari: -1,
                kelasMaks: kelasMaksAnak,
                isPemain: true
            };

            balapKudaState.kandangKuda.push(anakKuda);
            balapKudaState.indexKudaAktif = balapKudaState.kandangKuda.length - 1;

            let ovrAnak = hitungOverallKuda(statsAnak);
            updateHeaderUI();

            bukaModalCustom(
                "🍼 Selamat! Keturunan Baru Lahir!",
                `<div style="text-align:center;">
                    <p style="font-size:2.5rem; margin:10px 0;">🐎</p>
                    <p>Lahir seekor anak kuda: <b>${namaAnak}</b> (${genderAnak === "Jantan" ? "🩵 Jantan" : "🩷 Betina"})</p>
                    <p style="color:#fbbf24; font-size:1.1rem;">OVR Awal: <b>${ovrAnak} Pts</b> (+10% Bonus Stat Induk)</p>
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

// --- MEKANIK LATIHAN & STRES ---
function latihKuda(statKey) {
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!k) return;

    if (k.stamina < 30) {
        bukaModalCustom("⚠️ Kuda Kelelahan", "<p>Stamina kuda kurang dari 30! Istirahatkan kudamu terlebih dahulu.</p>");
        return;
    }

    if (k.stres >= 100) {
        bukaModalCustom("⚠️ Stres Maksimal", "<p>Kuda mencapai batas maksimal stres (100)! Segera istirahatkan kudamu.</p>");
        return;
    }

    k.stamina -= 30;
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

    bukaModalCustom("🏃 Latihan Selesai", `<p><b>${k.nama}</b> berhasil melatih ${namaStat}: <b>+${penambahanStat} Pts</b>! (Stamina -30, Stres +${penambahanStres})</p>`);

    renderBalapKuda();
}

function istirahatKuda() {
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!k) return;

    let hariSekarang = gameState.waktuHari || 0;
    let jamSekarang = Number(gameState.jam) || 0;

    let totalJamSekarang = (hariSekarang * 24) + jamSekarang;
    let totalJamTerakhir = ((k.terakhirIstirahatHari || 0) * 24) + (k.terakhirIstirahatJam || 0);

    let selisihJam = totalJamSekarang - totalJamTerakhir;

    if (k.terakhirIstirahatHari !== undefined && selisihJam < 5) {
        let sisa = Math.ceil(5 - selisihJam);
        bukaModalCustom("⏳ Masih Cooldown", `<p>Kuda belum bisa istirahat! Masih dalam cooldown (${sisa} jam in-game lagi).</p>`);
        return;
    }

    k.stamina = k.staminaMax;
    k.stres = 0;
    k.terakhirIstirahatHari = hariSekarang;
    k.terakhirIstirahatJam = jamSekarang;

    bukaModalCustom("💤 Kuda Beristirahat", `<p>Stamina <b>${k.nama}</b> pulih penuh dan tingkat stres kembali ke 0!</p>`);
    renderBalapKuda();
}

// --- MEKANIK SIMULASI BALAPAN ---
function dapatAksesKelas(kelas) {
    let urutan = ["D", "C", "B", "A", "S", "SS"];
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!k) return false;
    return urutan.indexOf(kelas) <= urutan.indexOf(k.kelasMaks);
}

function mulaiBalapanKelas(kelas) {
    let k = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    let cfg = KONFIG_KELAS[kelas];

    if (!isArenaBuka()) {
        bukaModalCustom("🕒 Arena Tutup", "<p>Arena Balap Kuda hanya buka dari jam 10.00 hingga 19.00!</p>");
        return;
    }

    if (k.stamina < 30) {
        bukaModalCustom("⚠️ Stamina Kurang", "<p>Stamina kuda kurang untuk mengikuti balapan (Minimal 30)!</p>");
        return;
    }

    if (gameState.uang < cfg.biayaDaftar) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", `<p>Biaya pendaftaran Kelas ${kelas} adalah Rp. ${cfg.biayaDaftar.toLocaleString('id-ID')}!</p>`);
        return;
    }

    gameState.uang -= cfg.biayaDaftar;
    k.stamina = Math.max(0, k.stamina - 30);
    k.stres = Math.min(100, k.stres + 15);
    updateHeaderUI();

    let lawanNpcList = balapKudaState.lawanPerKelas[kelas] || [];
    let peserta = lawanNpcList.map(npc => ({
        nama: npc.nama,
        stats: npc.stats,
        gender: npc.gender,
        isPemain: false
    }));

    peserta.push({
        nama: k.nama + " (Kuda Kamu)",
        stats: k.stats,
        gender: k.gender,
        stamina: k.stamina,
        staminaMax: k.staminaMax,
        stres: k.stres,
        isPemain: true
    });

    peserta.forEach(p => {
        let statEfektif = hitungStatEfektif(p);
        
        let poinKecepatan = (statEfektif.kecepatan * 1.2) + (statEfektif.akselerasi * 0.8);
        let dayaTahanFactor = (statEfektif.dayaTahan * 0.9) + (statEfektif.kelincahan * 0.6);
        let keberuntungan = (Math.random() * statEfektif.mental);

        p.skorAkhir = Math.round(poinKecepatan + dayaTahanFactor + keberuntungan);
        p.penaltiPersen = statEfektif.penaltiPersen || 0;
        p.ovrDisplay = hitungOverallKuda(p.stats);
    });

    peserta.sort((a, b) => b.skorAkhir - a.skorAkhir);

    let posisiPemain = peserta.findIndex(p => p.isPemain) + 1;
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    let idxSekarang = urutanKelas.indexOf(kelas);

    if (posisiPemain === 1) {
        gameState.uang += cfg.hadiah.j1;
        if (idxSekarang < urutanKelas.length - 1 && urutanKelas.indexOf(k.kelasMaks) === idxSekarang) {
            k.kelasMaks = urutanKelas[idxSekarang + 1];
        }
    } else if (posisiPemain === 2) {
        gameState.uang += cfg.hadiah.j2;
    } else if (posisiPemain === 3) {
        gameState.uang += cfg.hadiah.j3;
    }
    updateHeaderUI();

    tampilkanHasilBalapanModal(kelas, peserta, posisiPemain);
    renderBalapKuda();
}

function tampilkanHasilBalapanModal(kelas, pesertaSorted, posisiPemain) {
    let modalTeks = `<div style="max-height:350px; overflow-y:auto; text-align:left;">
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
                <tr style="border-bottom:1px solid #334155; color:#94a3b8;">
                    <th style="padding:6px; text-align:center;">Pos</th>
                    <th style="padding:6px; text-align:left;">Nama Kuda</th>
                    <th style="padding:6px; text-align:center;">OVR</th>
                    <th style="padding:6px; text-align:center;">Skor</th>
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
            <td style="padding:6px; text-align:center; color:#fbbf24;">${p.ovrDisplay}</td>
            <td style="padding:6px; text-align:center;">${p.skorAkhir}</td>
        </tr>`;
    });

    modalTeks += `</tbody></table></div>`;

    let judul = `🏆 Hasil Balapan Kelas ${kelas} (Posisi Ke-${posisiPemain})`;
    bukaModalCustom(judul, modalTeks);
}
