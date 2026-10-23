// ==========================================
// MODULE BALAP KUDA (balap_kuda.js)
// ==========================================

let balapKudaState = {
    kelasAktif: "D", // D, C, B, A, S, SS
    kudaPemain: null, // Data kuda milik pemain yang dibeli
    daftarPasarKuda: [],
    musimBalapHari: -1,
    pesertaNPC: {}
};

// Konfigurasi Kelas & Syarat Minimal Overall Point (OVR)
const KONFIG_KELAS = {
    "D":  { nama: "Kelas D (Pemula)",   ovrMin: 100, ovrMax: 200, hadiah: 20000,   biayaDaftar: 3000,  biayaBeli: 9000 },
    "C":  { nama: "Kelas C (Amatir)",   ovrMin: 201, ovrMax: 350, hadiah: 50000,  biayaDaftar: 15000, biayaBeli: 7500 },
    "B":  { nama: "Kelas B (Pro)",      ovrMin: 351, ovrMax: 500, hadiah: 800000,  biayaDaftar: 35000, biayaBeli: 18000 },
    "A":  { nama: "Kelas A (Elite)",    ovrMin: 501, ovrMax: 700, hadiah: 125000,  biayaDaftar: 70000, biayaBeli: 40000 },
    "S":  { nama: "Kelas S (Master)",   ovrMin: 701, ovrMax: 900, hadiah: 500000, biayaDaftar: 150000, biayaBeli: 100000 },
    "SS": { nama: "Kelas SS (Legend)",  ovrMin: 901, ovrMax: 1200,hadiah: 1500000, biayaDaftar: 650000, biayaBeli: 950000 }
};

const NAMA_KUDA_NPC = ["Baron", "Zeus", "Shadow", "Pegasus", "Bintang", "Thunder", "Blaze", "Tornado", "Valkyrie", "Titan", "Phantom", "Eclipse"];

// --- FUNGSI UTAMA / RENDER TAB ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    // Generasi pasar kuda jika hari berganti
    if (balapKudaState.musimBalapHari !== gameState.waktuHari) {
        balapKudaState.musimBalapHari = gameState.waktuHari;
        generasiPasarKuda();
    }

    let html = `<div class="card" style="grid-column: 1/-1; padding: 20px; text-align: center;">
        <h2>🏇 Arena Balap Kuda Desa</h2>
        <p style="color: var(--text-muted);">Latih kudamu, atur stamina & stres, lalu jadilah juara di setiap kelas!</p>
    </div>`;

    // 1. TAMPILAN KUDA PEMAIN
    html += `<div class="card" style="grid-column: 1/-1; border: 1px solid #60a5fa;">`;
    if (!balapKudaState.kudaPemain) {
        html += `
            <h3>🐎 Kuda Milikmu: <span style="color:#f87171;">Belum Memiliki Kuda</span></h3>
            <p style="color: var(--text-muted);">Beli kuda di Pasar Kuda di bawah untuk mulai berlatih dan bertanding!</p>
        `;
    } else {
        let k = balapKudaState.kudaPemain;
        let ovr = hitungOverallKuda(k.stats);
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3>🐎 ${k.nama} <span style="color:#fbbf24;">[Kelas Tertinggi Ditembus: ${k.kelasMaks}]</span></h3>
                    <p>Overall Rating (OVR): <b style="color:#34d399; font-size:1.2rem;">${ovr} Pts</b></p>
                    <p>⚡ Stamina: <b>${k.stamina} / ${k.staminaMax}</b> | 🪨 Stres: <b style="color:${k.stres > 50 ? '#f87171' : '#34d399'}">${k.stres} / 100</b></p>
                </div>
                <div>
                    <button onclick="latihKuda('kecepatan')" style="background:#2563eb; margin:2px;">🏃 Latih Kecepatan (+Stat)</button>
                    <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; margin:2px;">🛡️ Latih Daya Tahan</button>
                    <button onclick="latihKuda('akselerasi')" style="background:#2563eb; margin:2px;">🚀 Latih Akselerasi</button>
                    <button onclick="latihKuda('kelincahan')" style="background:#2563eb; margin:2px;">🌀 Latih Kelincahan</button>
                    <button onclick="istirahatKuda()" style="background:#059669; margin:2px;">💤 Istirahatkan Kuda (-Stres)</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:10px; margin-top:15px; background:#101622; padding:10px; border-radius:8px; font-size:0.85rem;">
                <div>🏎️ Kecepatan: <b>${k.stats.kecepatan}</b></div>
                <div>🛡️ Daya Tahan: <b>${k.stats.dayaTahan}</b></div>
                <div>🚀 Akselerasi: <b>${k.stats.akselerasi}</b></div>
                <div>🧠 Mental: <b>${k.stats.mental}</b></div>
                <div>🌀 Kelincahan: <b>${k.stats.kelincahan}</b></div>
            </div>
        `;
    }
    html += `</div>`;

    // 2. TAMPILAN PERLOMBAAN KELAS
    html += `<h3 style="grid-column: 1/-1; color: #fbbf24; margin-top: 15px;">🏆 Arena Pertandingan Kelas</h3>`;
    
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    urutanKelas.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let bisaIkut = balapKudaState.kudaPemain && dapatAksesKelas(kls);
        
        html += `
            <div class="card" style="border: 1px solid ${bisaIkut ? '#10b981' : 'var(--border-color)'}; opacity: ${bisaIkut ? '1' : '0.6'}">
                <h3>🏆 Kelas ${kls}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted);">${cfg.nama}</p>
                <p style="font-size:0.85rem;">Rata-rata OVR: <b>${cfg.ovrMin} - ${cfg.ovrMax}</b></p>
                <p style="font-size:0.85rem; color:#34d399;">Hadiah Juara 1: 💰 Rp. ${cfg.hadiah.toLocaleString('id-ID')}</p>
                <button onclick="mulaiBalapanKelas('${kls}')" style="background:${bisaIkut ? '#059669' : '#334155'}; width:100%; margin-top:10px;" ${!bisaIkut ? 'disabled' : ''}>
                    ${!balapKudaState.kudaPemain ? 'Butuh Kuda' : (!dapatAksesKelas(kls) ? 'Terkunci (Juarai Kelas Sebelum)' : 'Ikut Tanding')}
                </button>
            </div>
        `;
    });

    // 3. PASAR KUDA
    html += `<h3 style="grid-column: 1/-1; color: #60a5fa; margin-top: 20px;">🛒 Pasar Kuda Hari Ini</h3>`;
    balapKudaState.daftarPasarKuda.forEach((kudaPasar, idx) => {
        let ovr = hitungOverallKuda(kudaPasar.stats);
        html += `
            <div class="card">
                <div style="font-size: 2.5rem;">🐎</div>
                <h3>${kudaPasar.nama}</h3>
                <p>Est. OVR: <b style="color:#fbbf24;">${ovr} Pts</b></p>
                <p>Harga: <b>Rp. ${kudaPasar.harga.toLocaleString('id-ID')}</b></p>
                <button onclick="beliKudaPasar(${idx})" style="background:#2563eb; width:100%; margin-top:5px;">Beli Kuda</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

// --- LOGIKA HITUNG STAT & OVERALL ---
function hitungOverallKuda(stats) {
    return Math.round(stats.kecepatan + stats.dayaTahan + stats.akselerasi + stats.mental + stats.kelincahan);
}

function buatStatRandom(ovrMin, ovrMax) {
    let targetOvr = Math.floor(Math.random() * (ovrMax - ovrMin + 1)) + ovrMin;
    let bagian = targetOvr / 5;
    return {
        kecepatan: Math.round(bagian + (Math.random() * 10 - 5)),
        dayaTahan: Math.round(bagian + (Math.random() * 10 - 5)),
        akselerasi: Math.round(bagian + (Math.random() * 10 - 5)),
        mental: Math.round(bagian + (Math.random() * 10 - 5)),
        kelincahan: Math.round(bagian + (Math.random() * 10 - 5))
    };
}

// --- MEKANIK PASAR KUDA ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    for (let i = 0; i < 3; i++) {
        let nama = "Kuda " + NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)];
        let stats = buatStatRandom(80, 180);
        let harga = 25000 + Math.round(hitungOverallKuda(stats) * 150);
        balapKudaState.daftarPasarKuda.push({ nama, stats, harga });
    }
}

function beliKudaPasar(index) {
    let item = balapKudaState.daftarPasarKuda[index];
    if (gameState.uang < item.harga) {
        alert("⚠️ Uang tidak cukup untuk membeli kuda ini!");
        return;
    }

    if (balapKudaState.kudaPemain) {
        if (!confirm("⚠️ Kamu sudah punya kuda. Membeli kuda baru akan menggantikan kudamu yang lama! Lanjutkan?")) return;
    }

    gameState.uang -= item.harga;
    balapKudaState.kudaPemain = {
        nama: item.nama,
        stats: item.stats,
        stamina: 100,
        staminaMax: 100,
        stres: 0,
        kelasMaks: "D"
    };

    balapKudaState.daftarPasarKuda.splice(index, 1);
    updateHeaderUI();
    tampilkanPopupNotifikasi("🎉 Kuda Baru!", `Kamu berhasil membeli ${item.nama}!`, "neon-green");
    renderBalapKuda();
}

// --- MEKANIK LATIHAN & STRES ---
function latihKuda(statKey) {
    let k = balapKudaState.kudaPemain;
    if (!k) return;

    if (k.stamina < 20) {
        alert("⚠️ Kuda terlalu lelah (Stamina < 20)! Istirahatkan kudamu terlebih dahulu.");
        return;
    }

    k.stamina -= 20;
    k.stres += Math.floor(Math.random() * 12) + 8; // Tambah stres 8-20

    let penambahan = Math.floor(Math.random() * 4) + 2; // +2 - 5 stat
    if (k.stres > 70) {
        penambahan = 1; // Efek latihan memburuk jika stres tinggi
        tampilkanPopupNotifikasi("⚠️ Kuda Stres Tinggi!", "Latihan tidak efektif karena kuda sangat stres!", "neon-amber");
    }

    k.stats[statKey] += penambahan;
    if (statKey === 'dayaTahan') k.staminaMax += 2;

    renderBalapKuda();
}

function istirahatKuda() {
    let k = balapKudaState.kudaPemain;
    if (!k) return;

    k.stamina = k.staminaMax;
    k.stres = Math.max(0, k.stres - 40);
    tampilkanPopupNotifikasi("💤 Kuda Beristirahat", "Stamina pulih penuh dan stres berkurang!", "neon-green");
    renderBalapKuda();
}

// --- MEKANIK SIMULASI BALAPAN ---
function dapatAksesKelas(kelas) {
    let urutan = ["D", "C", "B", "A", "S", "SS"];
    let k = balapKudaState.kudaPemain;
    if (!k) return false;
    return urutan.indexOf(kelas) <= urutan.indexOf(k.kelasMaks);
}

function mulaiBalapanKelas(kelas) {
    let k = balapKudaState.kudaPemain;
    let cfg = KONFIG_KELAS[kelas];

    if (k.stamina < 30) {
        alert("⚠️ Stamina kuda kurang untuk mengikuti balapan (Min. 30)!");
        return;
    }

    if (gameState.uang < cfg.biayaDaftar) {
        alert(`⚠️ Biaya pendaftaran Kelas ${kelas} tidak cukup (Rp. ${cfg.biayaDaftar.toLocaleString('id-ID')})!`);
        return;
    }

    gameState.uang -= cfg.biayaDaftar;
    k.stamina -= 30;
    k.stres += 15;
    updateHeaderUI();

    // Generate 6 Peserta NPC
    let peserta = [];
    for (let i = 0; i < 6; i++) {
        let statsNpc = buatStatRandom(cfg.ovrMin, cfg.ovrMax);
        peserta.push({
            nama: NAMA_KUDA_NPC[i % NAMA_KUDA_NPC.length] + ` [NPC]`,
            stats: statsNpc,
            isPemain: false
        });
    }

    // Tambah Kuda Pemain sebagai peserta ke-7
    peserta.push({
        nama: k.nama + " (Kuda Kamu)",
        stats: k.stats,
        isPemain: true
    });

    // Kalkulasi Skor Performa Balap
    peserta.forEach(p => {
        let s = p.stats;
        let penaltiStres = p.isPemain ? (k.stres * 0.5) : 0;
        let poinKecepatan = (s.kecepatan * 1.2) + (s.akselerasi * 0.8);
        let dayaTahanFactor = (s.dayaTahan * 0.9) + (s.kelincahan * 0.6);
        let keberuntungan = (Math.random() * s.mental) - penaltiStres;

        p.skorAkhir = poinKecepatan + dayaTahanFactor + keberuntungan;
    });

    // Urutkan Pemenang
    peserta.sort((a, b) => b.skorAkhir - a.skorAkhir);

    let posisiPemain = peserta.findIndex(p => p.isPemain) + 1;
    let juara1 = peserta[0];

    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    let idxSekarang = urutanKelas.indexOf(kelas);

    if (posisiPemain === 1) {
        gameState.uang += cfg.hadiah;
        updateHeaderUI();

        // Naik Kelas jika menjuarai kelas tertinggi saat ini
        if (idxSekarang < urutanKelas.length - 1 && urutanKelas.indexOf(k.kelasMaks) === idxSekarang) {
            k.kelasMaks = urutanKelas[idxSekarang + 1];
        }

        tampilkanPopupNotifikasi(
            "🥇 JUARA 1 BALAPAN!", 
            `Selamat! Kudamu meraih Juara 1 di Kelas ${kelas}! Hadiah: Rp. ${cfg.hadiah.toLocaleString('id-ID')}`, 
            "neon-green"
        );
    } else {
        tampilkanPopupNotifikasi(
            `Hasil Balapan Kelas ${kelas}`, 
            `Kudamu finish di posisi ke-${posisiPemain}. Juara 1 diraih oleh ${juara1.nama}!`, 
            "neon-amber"
        );
    }

    renderBalapKuda();
}
