// ========================================== //
// MODULE BALAP KUDA & BREEDING (balap_kuda.js)
// ========================================== //

let balapKudaState = {
    kelasAktif: "D",
    kandangKuda: [],
    indexKudaAktif: 0,
    daftarPasarKuda: [],
    lawanPerKelas: {},
    musimBalapHari: -1,
    indukJantanIdx: null,
    indukBetinaIdx: null
};

const MAX_KAPASITAS_KUDA = 5;

const KONFIG_KELAS = {
    "D": { nama: "Kelas D (Pemula)", ovrMin: 70, ovrMax: 230, biayaDaftar: 3000, hadiah: { j1: 20000, j2: 10000, j3: 5000 } },
    "C": { nama: "Kelas C (Amatir)", ovrMin: 231, ovrMax: 390, biayaDaftar: 10000, hadiah: { j1: 50000, j2: 30000, j3: 15000 } },
    "B": { nama: "Kelas B (Pro)", ovrMin: 391, ovrMax: 550, biayaDaftar: 27000, hadiah: { j1: 150000, j2: 75000, j3: 35000 } },
    "A": { nama: "Kelas A (Elite)", ovrMin: 551, ovrMax: 710, biayaDaftar: 70000, hadiah: { j1: 350000, j2: 175000, j3: 85000 } },
    "S": { nama: "Kelas S (Master)", ovrMin: 711, ovrMax: 980, biayaDaftar: 150000, hadiah: { j1: 800000, j2: 400000, j3: 200000 } },
    "SS": { nama: "Kelas SS (Legend)", ovrMin: 981, ovrMax: 1500, biayaDaftar: 450000, hadiah: { j1: 2500000, j2: 1250000, j3: 600000 } }
};

const NAMA_KUDA_NPC = ["Baron", "Zeus", "Natto", "Basal", "Bergie", "Molam", "Shadow", "Pegasus", "Bintang", "Thunder", "Blaze", "Tornado", "Valkyrie", "Titan", "Phantom", "Eclipse", "Byakko", "Dandan", "Kelp"];

// --- HELPER POPUP MODERN ---
function bukaModalCustom(judul, HTMLKonten) {
    let modalExisting = document.getElementById("custom-game-modal");
    if (modalExisting) modalExisting.remove();
    let modalHTML = `
    <div id="custom-game-modal" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.8); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:99999; padding:15px; animation:fadeIn 0.2s ease;">
        <div style="background:#0f172a; border:1px solid #3b82f6; border-radius:12px; width:100%; max-width:480px; box-shadow:0 10px 25px rgba(0,0,0,0.8); overflow:hidden; color:#f8fafc;">
            <div style="padding:15px; background:#1e293b; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0; font-size:1.1rem; color:#38bdf8;">${judul}</h3>
                <button onclick="tutupModalCustom()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer;">✖</button>
            </div>
            <div style="padding:20px;">
                ${HTMLKonten}
            </div>
        </div>
    </div>`;
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
    </div>`;
    bukaModalCustom(judul, konten);
    document.getElementById("btn-modal-ya").onclick = () => {
        tutupModalCustom();
        callbackYa();
    };
}

// --- LOGIKA JAM OPERASIONAL ---
function isArenaBuka() {
    let jamSekarang = Number(gameState.jam) || 0;
    return jamSekarang >= 10 && jamSekarang < 19;
}

function hitungOverallKuda(stats) {
    if (!stats) return 0;
    return Math.round((stats.kecepatan + stats.dayaTahan + stats.akselerasi + stats.mental + stats.kelincahan) / 5);
}

function hitungStatEfektif(kuda) {
    if (!kuda) return { kecepatan: 0, dayaTahan: 0, akselerasi: 0, mental: 0, kelincahan: 0, penaltiPersen: 0 };
    let staminaPersen = (kuda.stamina / kuda.staminaMax) * 100;
    let penaltiStamina = staminaPersen < 30 ? (30 - staminaPersen) * 0.5 : 0;
    let penaltiStres = kuda.stres > 50 ? (kuda.stres - 50) * 0.4 : 0;
    let totalPenalti = Math.min(50, Math.round(penaltiStamina + penaltiStres));
    let faktor = (100 - totalPenalti) / 100;

    return {
        kecepatan: Math.round(kuda.stats.kecepatan * faktor),
        dayaTahan: Math.round(kuda.stats.dayaTahan * faktor),
        akselerasi: Math.round(kuda.stats.akselerasi * faktor),
        mental: Math.round(kuda.stats.mental * faktor),
        kelincahan: Math.round(kuda.stats.kelincahan * faktor),
        penaltiPersen: totalPenalti
    };
}

// --- GENERATOR DATA ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    for (let i = 0; i < 3; i++) {
        let gender = Math.random() > 0.5 ? "Jantan" : "Betina";
        let baseStat = Math.floor(Math.random() * 40) + 80;
        let stats = {
            kecepatan: baseStat + Math.floor(Math.random() * 15),
            dayaTahan: baseStat + Math.floor(Math.random() * 15),
            akselerasi: baseStat + Math.floor(Math.random() * 15),
            mental: baseStat + Math.floor(Math.random() * 15),
            kelincahan: baseStat + Math.floor(Math.random() * 15)
        };
        let ovr = hitungOverallKuda(stats);
        balapKudaState.daftarPasarKuda.push({
            nama: NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)],
            gender: gender,
            stats: stats,
            stamina: 100,
            staminaMax: 100,
            stres: 0,
            kelasMaks: "D",
            harga: ovr * 250
        });
    }
}

function generasiLawanPerKelas() {
    balapKudaState.lawanPerKelas = {};
    Object.keys(KONFIG_KELAS).forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let daftar = [];
        for (let i = 0; i < 7; i++) {
            let targetOvr = Math.floor(Math.random() * (cfg.ovrMax - cfg.ovrMin + 1)) + cfg.ovrMin;
            daftar.push({
                nama: NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)],
                gender: Math.random() > 0.5 ? "Jantan" : "Betina",
                stats: {
                    kecepatan: targetOvr,
                    dayaTahan: targetOvr,
                    akselerasi: targetOvr,
                    mental: targetOvr,
                    kelincahan: targetOvr
                }
            });
        }
        balapKudaState.lawanPerKelas[kls] = daftar;
    });
}

function dapatAksesKelas(kelas) {
    let kuda = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!kuda) return false;
    let ovr = hitungOverallKuda(hitungStatEfektif(kuda));
    let cfg = KONFIG_KELAS[kelas];
    return ovr >= cfg.ovrMin;
}

// --- RENDER UTAMA ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    if (!balapKudaState.kandangKuda) balapKudaState.kandangKuda = [];
    if (!balapKudaState.daftarPasarKuda || balapKudaState.musimBalapHari !== gameState.waktuHari) {
        balapKudaState.musimBalapHari = gameState.waktuHari;
        generasiPasarKuda();
        generasiLawanPerKelas();
    }

    let jamSekarang = Number(gameState.jam) || 0;
    let hariSekarang = Number(gameState.waktuHari) || 1;
    let arenaBuka = isArenaBuka();

    let html = `
    <div class="card" style="grid-column: 1/-1; padding: 20px; text-align: center; background:#0f172a; border:1px solid #3b82f6; border-radius:12px;">
        <h2>🏇 Arena Balap Kuda Desa</h2>
        <p style="color: #94a3b8;">Latih kudamu, kelola kesehatan stamina, breed keturunan unggulan, dan kuasai kejuaraan!</p>
        <p style="font-size:0.95rem; margin-top:8px;">🕒 Jam Operasional Arena: <b>10.00 - 19.00</b> | Status: <b style="color:${arenaBuka ? '#34d399' : '#f87171'}">${arenaBuka ? 'BUKA ✅' : 'TUTUP 🔒'}</b></p>
    </div>`;

    // 1. KANDANG KUDA
    let jumlahKuda = balapKudaState.kandangKuda.length;
    let kudaAktif = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif] || null;

    html += `<div class="card" style="grid-column: 1/-1; border: 1px solid #3b82f6; background:#1e293b; padding:15px; border-radius:10px;">`;
    html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #334155; padding-bottom:10px;">
        <h3 style="margin:0; color:#38bdf8;">🏚️ Kandang Kuda (${jumlahKuda}/${MAX_KAPASITAS_KUDA})</h3>
    </div>`;

    if (jumlahKuda === 0) {
        html += `<div style="text-align:center; padding:20px;"><p style="color:#f87171;">Kamu belum memiliki kuda. Beli kuda di Pasar Kuda di bawah!</p></div>`;
    } else {
        html += `<div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:10px; margin-bottom:15px;">`;
        balapKudaState.kandangKuda.forEach((k, idx) => {
            let isSelected = idx === balapKudaState.indexKudaAktif;
            html += `<button onclick="pilihKudaAktif(${idx})" style="background:${isSelected ? '#2563eb' : '#0f172a'}; border:1px solid ${isSelected ? '#60a5fa' : '#334155'}; color:#fff; padding:8px 14px; border-radius:6px; cursor:pointer;">
                ${k.gender === "Jantan" ? "🩵" : "🩷"} ${k.nama} [OVR: ${hitungOverallKuda(k.stats)}]
            </button>`;
        });
        html += `</div>`;

        let k = kudaAktif;
        let statE = hitungStatEfektif(k);
        let ovrEfektif = hitungOverallKuda(statE);

        // Perhitungan CD Istirahat (5 Jam in-game)
        let totalJamSekarang = (hariSekarang * 24) + jamSekarang;
        let totalJamTerakhir = k.terakhirIstirahatTotalJam !== undefined ? k.terakhirIstirahatTotalJam : -99;
        let selisihJam = totalJamSekarang - totalJamTerakhir;
        let sedangCooldown = selisihJam < 5;
        let sisaJamCD = sedangCooldown ? (5 - selisihJam) : 0;

        let teksIstirahat = sedangCooldown ? `⏳ CD (${sisaJamCD} Jam In-Game)` : "💤 Istirahat";
        let hargaJualEst = Math.round(hitungOverallKuda(k.stats) * 75);

        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; background:#0f172a; padding:15px; border-radius:8px;">
            <div>
                <h3 style="margin:0; color:#f8fafc;">🐎 ${k.nama} <small style="color:#94a3b8;">(${k.gender})</small></h3>
                <p style="margin:5px 0;">OVR Efektif: <b style="color:#34d399; font-size:1.2rem;">${ovrEfektif} Pts</b> ${statE.penaltiPersen > 0 ? `<span style="color:#f87171;">(-${statE.penaltiPersen}% akibat lelah)</span>` : ''}</p>
                <p style="margin:0; font-size:0.9rem;">⚡ Stamina: <b>${k.stamina}/${k.staminaMax}</b> | 🪨 Stres: <b>${k.stres}/100</b></p>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
                <button onclick="latihKuda('kecepatan')" style="background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">🏃 Latih Kecepatan</button>
                <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">🛡️ Latih Daya Tahan</button>
                <button onclick="istirahatKuda()" style="background:${sedangCooldown ? '#475569' : '#059669'}; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;" ${sedangCooldown ? 'disabled' : ''}>${teksIstirahat}</button>
                <button onclick="konfirmasiJualKuda(${balapKudaState.indexKudaAktif})" style="background:#dc2626; color:#fff; border:none; padding:8px 12px; border-radius:6px; cursor:pointer;">💰 Jual (Rp ${hargaJualEst.toLocaleString('id-ID')})</button>
            </div>
        </div>`;
    }
    html += `</div>`;

    // 2. MODERN BREEDING PANEL
    html += `
    <div class="card" style="grid-column: 1/-1; border: 1px solid #ec4899; background: #0f172a; padding:15px; border-radius:10px; margin-top:15px;">
        <h3 style="color:#f472b6; margin-top:0;">💕 Peternakan & Breeding Kuda</h3>
        <p style="font-size:0.85rem; color:#94a3b8;">Kawinkan Induk Jantan & Betina untuk melahirkan keturunan dengan bonus OVR!</p>
        <div style="display:flex; flex-wrap:wrap; gap:15px; align-items:center; margin-top:10px;">
            <div style="flex:1; min-width:200px;">
                <label style="font-size:0.85rem; color:#93c5fd;">Induk Jantan (🩵):</label>
                <select id="select-jantan" style="width:100%; padding:10px; border-radius:6px; background:#1e293b; color:#fff; border:1px solid #334155; margin-top:4px;">
                    <option value="">-- Pilih Induk Jantan --</option>
                    ${balapKudaState.kandangKuda.map((k, i) => k.gender === "Jantan" ? `<option value="${i}">${k.nama} (OVR: ${hitungOverallKuda(k.stats)})</option>` : '').join('')}
                </select>
            </div>
            <div style="flex:1; min-width:200px;">
                <label style="font-size:0.85rem; color:#f472b6;">Induk Betina (🩷):</label>
                <select id="select-betina" style="width:100%; padding:10px; border-radius:6px; background:#1e293b; color:#fff; border:1px solid #334155; margin-top:4px;">
                    <option value="">-- Pilih Induk Betina --</option>
                    ${balapKudaState.kandangKuda.map((k, i) => k.gender === "Betina" ? `<option value="${i}">${k.nama} (OVR: ${hitungOverallKuda(k.stats)})</option>` : '').join('')}
                </select>
            </div>
            <button onclick="prosesKawinKuda()" style="background:#db2777; color:#fff; border:none; padding:10px 20px; border-radius:6px; font-weight:bold; cursor:pointer; margin-top:18px;">💖 Proses Breeding (Rp 15.000)</button>
        </div>
    </div>`;

    // 3. MATCHMAKING KELAS
    html += `<h3 style="grid-column: 1/-1; color: #fbbf24; margin-top:20px;">🏆 Arena Kejuaraan Kelas</h3>`;
    Object.keys(KONFIG_KELAS).forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let bisaIkut = kudaAktif && dapatAksesKelas(kls) && arenaBuka;
        html += `
        <div class="card" style="background:#1e293b; border:1px solid ${bisaIkut ? '#10b981' : '#334155'}; padding:15px; border-radius:8px; opacity:${bisaIkut ? '1' : '0.6'}">
            <h4 style="margin:0; color:#38bdf8;">🏆 ${cfg.nama}</h4>
            <p style="font-size:0.85rem; margin:5px 0;">Min OVR: <b>${cfg.ovrMin} Pts</b></p>
            <p style="font-size:0.85rem; color:#fbbf24; margin:5px 0;">🥇 Hadiah Utama: Rp ${cfg.hadiah.j1.toLocaleString('id-ID')}</p>
            <button onclick="mulaiBalapanKelas('${kls}')" style="background:${bisaIkut ? '#059669' : '#334155'}; color:#fff; border:none; width:100%; padding:10px; border-radius:6px; margin-top:10px; cursor:${bisaIkut ? 'pointer' : 'not-allowed'}" ${!bisaIkut ? 'disabled' : ''}>
                ${!arenaBuka ? 'Tutup (10.00 - 19.00)' : (!bisaIkut ? 'Syarat OVR Tidak Cukup' : 'Ikut Bertanding')}
            </button>
        </div>`;
    });

    // 4. PASAR KUDA
    html += `<h3 style="grid-column: 1/-1; color: #60a5fa; margin-top:20px;">🛒 Pasar Kuda Hari Ini</h3>`;
    balapKudaState.daftarPasarKuda.forEach((kudaPasar, idx) => {
        html += `
        <div class="card" style="background:#1e293b; border:1px solid #334155; padding:15px; border-radius:8px;">
            <h4 style="margin:0;">🐎 ${kudaPasar.nama} (${kudaPasar.gender})</h4>
            <p style="margin:5px 0;">OVR: <b>${hitungOverallKuda(kudaPasar.stats)} Pts</b></p>
            <p style="margin:5px 0; color:#38bdf8;">Harga: <b>Rp ${kudaPasar.harga.toLocaleString('id-ID')}</b></p>
            <button onclick="beliKudaPasar(${idx})" style="background:#2563eb; color:#fff; border:none; width:100%; padding:8px; border-radius:6px; cursor:pointer; margin-top:5px;">Beli Kuda</button>
        </div>`;
    });

    container.innerHTML = html;
}

// --- AKSI & MANAJEMEN ---
function pilihKudaAktif(idx) {
    balapKudaState.indexKudaAktif = idx;
    renderBalapKuda();
}

function istirahatKuda() {
    let kuda = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!kuda) return;

    let jamSekarang = Number(gameState.jam) || 0;
    let hariSekarang = Number(gameState.waktuHari) || 1;
    let totalJamSekarang = (hariSekarang * 24) + jamSekarang;

    kuda.stamina = kuda.staminaMax;
    kuda.stres = Math.max(0, kuda.stres - 40);
    kuda.terakhirIstirahatTotalJam = totalJamSekarang;

    bukaModalCustom("💤 Kuda Beristirahat", `<p><b>${kuda.nama}</b> telah beristirahat! Stamina dipulihkan ke 100% dan tingkat stres berkurang pesat.</p>`);
    renderBalapKuda();
}

function latihKuda(tipe) {
    let kuda = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
    if (!kuda) return;

    if (kuda.stamina < 20) {
        bukaModalCustom("⚠️ Kuda Kelelahan", `<p>Stamina <b>${kuda.nama}</b> terlalu rendah (<20). Istirahatkan kuda terlebih dahulu!</p>`);
        return;
    }

    kuda.stamina -= 15;
    kuda.stres = Math.min(100, kuda.stres + 10);
    kuda.stats[tipe] += Math.floor(Math.random() * 3) + 2;

    bukaModalCustom("🏋️ Latihan Selesai", `<p>Latihan <b>${tipe}</b> berhasil! Stat ${tipe} <b>${kuda.nama}</b> bertambah.</p>`);
    renderBalapKuda();
}

function prosesKawinKuda() {
    let idxJantan = document.getElementById("select-jantan").value;
    let idxBetina = document.getElementById("select-betina").value;

    if (idxJantan === "" || idxBetina === "") {
        bukaModalCustom("⚠️ Peringatan", "<p>Pilih kedua indukan (Jantan & Betina) terlebih dahulu!</p>");
        return;
    }

    if (balapKudaState.kandangKuda.length >= MAX_KAPASITAS_KUDA) {
        bukaModalCustom("⚠️ Kandang Penuh", "<p>Kandangmu sudah penuh (Maksimal 5 Kuda)! Jual salah satu kuda terlebih dahulu.</p>");
        return;
    }

    if (gameState.uang < 15000) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", "<p>Biaya breeding adalah Rp 15.000.</p>");
        return;
    }

    let jantan = balapKudaState.kandangKuda[idxJantan];
    let betina = balapKudaState.kandangKuda[idxBetina];

    dialogKonfirmasiCustom("💖 Konfirmasi Breeding", `Kawinkan <b>${jantan.nama}</b> dan <b>${betina.nama}</b> dengan biaya <b>Rp 15.000</b>?`, () => {
        gameState.uang -= 15000;
        let avgKecepatan = Math.round((jantan.stats.kecepatan + betina.stats.kecepatan) / 2 * 1.1);
        let avgDayaTahan = Math.round((jantan.stats.dayaTahan + betina.stats.dayaTahan) / 2 * 1.1);

        let anakKuda = {
            nama: "Anak " + jantan.nama,
            gender: Math.random() > 0.5 ? "Jantan" : "Betina",
            stats: {
                kecepatan: avgKecepatan,
                dayaTahan: avgDayaTahan,
                akselerasi: Math.round((jantan.stats.akselerasi + betina.stats.akselerasi) / 2 * 1.1),
                mental: Math.round((jantan.stats.mental + betina.stats.mental) / 2 * 1.1),
                kelincahan: Math.round((jantan.stats.kelincahan + betina.stats.kelincahan) / 2 * 1.1)
            },
            stamina: 100,
            staminaMax: 100,
            stres: 0
        };

        balapKudaState.kandangKuda.push(anakKuda);
        if (typeof updateHeaderUI === 'function') updateHeaderUI();
        bukaModalCustom("🎉 Selamat!", `<p>Selamat! Keturunan baru <b>${anakKuda.nama}</b> (${anakKuda.gender}) telah lahir dengan bonus stat OVR!</p>`);
        renderBalapKuda();
    });
}

function konfirmasiJualKuda(index) {
    let k = balapKudaState.kandangKuda[index];
    if (!k) return;
    let hargaJual = Math.round(hitungOverallKuda(k.stats) * 75);

    dialogKonfirmasiCustom("💰 Jual Kuda", `Apakah kamu yakin ingin menjual <b>${k.nama}</b> seharga <b>Rp ${hargaJual.toLocaleString('id-ID')}</b>?`, () => {
        gameState.uang += hargaJual;
        balapKudaState.kandangKuda.splice(index, 1);
        balapKudaState.indexKudaAktif = Math.max(0, balapKudaState.kandangKuda.length - 1);
        if (typeof updateHeaderUI === 'function') updateHeaderUI();
        bukaModalCustom("🎉 Kuda Terjual", `<p>Kuda <b>${k.nama}</b> berhasil dijual seharga Rp ${hargaJual.toLocaleString('id-ID')}.</p>`);
        renderBalapKuda();
    });
}

function beliKudaPasar(index) {
    let k = balapKudaState.daftarPasarKuda[index];
    if (!k) return;

    if (balapKudaState.kandangKuda.length >= MAX_KAPASITAS_KUDA) {
        bukaModalCustom("⚠️ Kandang Penuh", "<p>Kandangmu sudah penuh!</p>");
        return;
    }

    if (gameState.uang < k.harga) {
        bukaModalCustom("⚠️ Uang Tidak Cukup", "<p>Uangmu tidak mencukupi untuk membeli kuda ini!</p>");
        return;
    }

    dialogKonfirmasiCustom("🛒 Beli Kuda", `Beli kuda <b>${k.nama}</b> seharga <b>Rp ${k.harga.toLocaleString('id-ID')}</b>?`, () => {
        gameState.uang -= k.harga;
        balapKudaState.kandangKuda.push(k);
        balapKudaState.daftarPasarKuda.splice(index, 1);
        if (typeof updateHeaderUI === 'function') updateHeaderUI();
        bukaModalCustom("🎉 Pembelian Berhasil", `<p><b>${k.nama}</b> sekarang resmi menjadi milikmu!</p>`);
        renderBalapKuda();
    });
}

function mulaiBalapanKelas(kelas) {
    let cfg = KONFIG_KELAS[kelas];
    if (gameState.uang < cfg.biayaDaftar) {
        bukaModalCustom("⚠️ Biaya Kurang", `<p>Biaya pendaftaran Kelas ${kelas} adalah Rp ${cfg.biayaDaftar.toLocaleString('id-ID')}.</p>`);
        return;
    }

    dialogKonfirmasiCustom("🏆 Pendaftaran Balap", `Ikut bertanding di <b>${cfg.nama}</b> dengan biaya pendaftaran <b>Rp ${cfg.biayaDaftar.toLocaleString('id-ID')}</b>?`, () => {
        gameState.uang -= cfg.biayaDaftar;
        
        let kudaPemain = balapKudaState.kandangKuda[balapKudaState.indexKudaAktif];
        let statE = hitungStatEfektif(kudaPemain);
        let skorPemain = hitungOverallKuda(statE) + (Math.random() * 20 - 10);

        let peserta = [{ nama: kudaPemain.nama + " (Milikmu)", skor: skorPemain, isPemain: true }];
        let lawan = balapKudaState.lawanPerKelas[kelas] || [];

        lawan.forEach(l => {
            peserta.push({
                nama: l.nama,
                skor: hitungOverallKuda(l.stats) + (Math.random() * 20 - 10),
                isPemain: false
            });
        });

        peserta.sort((a, b) => b.skor - a.skor);
        let posisiPemain = peserta.findIndex(p => p.isPemain) + 1;
        let hadiah = 0;

        if (posisiPemain === 1) hadiah = cfg.hadiah.j1;
        else if (posisiPemain === 2) hadiah = cfg.hadiah.j2;
        else if (posisiPemain === 3) hadiah = cfg.hadiah.j3;

        gameState.uang += hadiah;
        if (typeof updateHeaderUI === 'function') updateHeaderUI();

        let hasilHTML = `
        <h4 style="text-align:center; color:#fbbf24;">🏁 Hasil Pertandingan ${cfg.nama}</h4>
        <p style="text-align:center;">Kudamu berhasil meraih posisi ke-<b>${posisiPemain}</b>!</p>
        ${hadiah > 0 ? `<p style="text-align:center; color:#34d399; font-weight:bold;">🎉 Hadiah: Rp ${hadiah.toLocaleString('id-ID')}</p>` : ''}
        <div style="background:#1e293b; padding:10px; border-radius:6px; max-height:180px; overflow-y:auto; margin-top:10px;">
            ${peserta.map((p, i) => `<div style="padding:4px 0; border-bottom:1px solid #334155; color:${p.isPemain ? '#38bdf8' : '#f8fafc'}; font-weight:${p.isPemain ? 'bold' : 'normal'};">Juara ${i + 1}: ${p.nama}</div>`).join('')}
        </div>`;

        bukaModalCustom("🏁 Balapan Selesai", hasilHTML);
        renderBalapKuda();
    });
}
