// ==========================================
// MODULE BALAP KUDA (balap_kuda.js)
// ==========================================

let balapKudaState = {
    kelasAktif: "D",
    kudaPemain: null,
    daftarPasarKuda: [],
    musimBalapHari: -1
};

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

// --- FUNGSI UTAMA / RENDER TAB ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    // Paksa buat pasar kuda & lawan NPC baru jika belum ada data sama sekali atau hari berganti
    if (!balapKudaState.daftarPasarKuda || balapKudaState.daftarPasarKuda.length === 0 || balapKudaState.musimBalapHari !== gameState.waktuHari) {
        balapKudaState.musimBalapHari = gameState.waktuHari;
        generasiPasarKuda();
        generasiLawanPerKelas();
    }

    let jamSekarang = gameState.jam || 0;
    let arenaBuka = jamSekarang >= 10 && jamSekarang < 19;

    let html = `<div class="card" style="grid-column: 1/-1; padding: 20px; text-align: center;">
        <h2>🏇 Arena Balap Kuda Desa</h2>
        <p style="color: var(--text-muted);">Latih kudamu, atur stamina & stres, lalu jadilah juara di setiap kelas!</p>
        <p style="font-size:0.9rem; margin-top:5px;">🕒 Jam Operasional Balap: <b>10.00 - 19.00</b> | Status Saat Ini: <b style="color:${arenaBuka ? '#34d399' : '#f87171'}">${arenaBuka ? 'BUKA' : 'TUTUP'}</b></p>
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
        let ovrAsli = hitungOverallKuda(k.stats);
        let statE = hitungStatEfektif(k);
        let ovrEfektif = hitungOverallKuda(statE);

        let statusPenaltiTeks = statE.penaltiPersen > 0 
            ? `<span style="color:#f87171; font-size:0.85rem;">(📉 Penurunan Performa -${statE.penaltiPersen}% karena lelah/stres)</span>` 
            : `<span style="color:#34d399; font-size:0.85rem;">(✨ Performa Optimal 100%)</span>`;

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3>
                        🐎 ${k.nama} 
                        <button onclick="gantiNamaKuda()" style="background:none; border:none; cursor:pointer; font-size:0.9rem;" title="Ganti Nama">✏️</button>
                        <span style="color:#fbbf24; font-size:0.9rem;">[Kelas Tertinggi: ${k.kelasMaks}]</span>
                    </h3>
                    <p>OVR Asli: <b>${ovrAsli} Pts</b> | OVR Efektif: <b style="color:${statE.penaltiPersen > 0 ? '#f87171' : '#34d399'}; font-size:1.2rem;">${ovrEfektif} Pts</b> ${statusPenaltiTeks}</p>
                    <p>⚡ Stamina: <b>${k.stamina} / ${k.staminaMax}</b> | 🪨 Stres: <b style="color:${k.stres >= 80 ? '#f87171' : '#34d399'}">${k.stres} / 100</b> (Max 5x Latihan)</p>
                </div>
                <div>
                    <button onclick="latihKuda('kecepatan')" style="background:#2563eb; margin:2px;">🏃 Latih Kecepatan</button>
                    <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; margin:2px;">🛡️ Latih Daya Tahan</button>
                    <button onclick="latihKuda('akselerasi')" style="background:#2563eb; margin:2px;">🚀 Latih Akselerasi</button>
                    <button onclick="latihKuda('kelincahan')" style="background:#2563eb; margin:2px;">🌀 Latih Kelincahan</button>
                    <button onclick="istirahatKuda()" style="background:#059669; margin:2px;">💤 Istirahatkan Kuda (CD 5 Jam)</button>
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

    // 2. TAMPILAN PERLOMBAAN KELAS
    html += `<h3 style="grid-column: 1/-1; color: #fbbf24; margin-top: 15px;">🏆 Arena Pertandingan Kelas (8 Peserta)</h3>`;
    
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    urutanKelas.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        let bisaIkut = balapKudaState.kudaPemain && dapatAksesKelas(kls) && arenaBuka;
        let daftarLawan = balapKudaState.lawanPerKelas ? balapKudaState.lawanPerKelas[kls] || [] : [];
        
        html += `
            <div class="card" style="border: 1px solid ${bisaIkut ? '#10b981' : 'var(--border-color)'}; opacity: ${dapatAksesKelas(kls) ? '1' : '0.6'}">
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
                        ${daftarLawan.map(npc => `<li><b>${npc.nama}</b> - OVR: <span style="color:#fbbf24">${hitungOverallKuda(npc.stats)} Pts</span></li>`).join('')}
                    </ul>
                </details>

                <button onclick="mulaiBalapanKelas('${kls}')" style="background:${bisaIkut ? '#059669' : '#334155'}; width:100%; margin-top:10px;" ${!bisaIkut ? 'disabled' : ''}>
                    ${!balapKudaState.kudaPemain ? 'Butuh Kuda' : (!dapatAksesKelas(kls) ? 'Terkunci' : (!arenaBuka ? 'Tutup (10.00-19.00)' : 'Ikut Tanding'))}
                </button>
            </div>
        `;
    });

    // 3. PASAR KUDA
    html += `<h3 style="grid-column: 1/-1; color: #60a5fa; margin-top: 20px;">🛒 Pasar Kuda Hari Ini</h3>`;
    if (balapKudaState.daftarPasarKuda.length === 0) {
        html += `<p style="grid-column:1/-1; text-align:center; color:var(--text-muted);">Stok kuda hari ini habis. Kembali lagi besok!</p>`;
    } else {
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
    }

    container.innerHTML = html;
}

// --- LOGIKA HITUNG STAT & OVERALL ---
function hitungOverallKuda(stats) {
    if (!stats) return 0;
    return Math.round((stats.kecepatan || 0) + (stats.dayaTahan || 0) + (stats.akselerasi || 0) + (stats.mental || 0) + (stats.kelincahan || 0));
}

// FUNGSI MENGHITUNG STAT EFEKTIF TEMPORER (PENALTI KELELAHAN & STRES)
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

// --- GENERASI LAWAN PER KELAS (7 NPC PER KELAS) ---
function generasiLawanPerKelas() {
    balapKudaState.lawanPerKelas = {};
    let kelasList = ["D", "C", "B", "A", "S", "SS"];
    
    kelasList.forEach(kls => {
        let cfg = KONFIG_KELAS[kls];
        balapKudaState.lawanPerKelas[kls] = [];
        
        // Buat 7 NPC
        for (let i = 0; i < 7; i++) {
            let nama = NAMA_KUDA_NPC[(i + kls.charCodeAt(0)) % NAMA_KUDA_NPC.length] + ` [NPC]`;
            let stats = buatStatRandom(cfg.ovrMin, cfg.ovrMax);
            balapKudaState.lawanPerKelas[kls].push({
                nama: nama,
                stats: stats,
                isPemain: false
            });
        }
    });
}

// --- MEKANIK PASAR KUDA (OVR MAKSIMAL 130) ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    for (let i = 0; i < 3; i++) {
        let nama = "Kuda " + NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)];
        let stats = buatStatRandom(80, 120);
        let harga = 20000 + Math.round(hitungOverallKuda(stats) * 80);
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
        terakhirIstirahatJam: -99,
        terakhirIstirahatHari: -1,
        kelasMaks: "D",
        isPemain: true
    };

    balapKudaState.daftarPasarKuda.splice(index, 1);
    updateHeaderUI();
    tampilkanPopupNotifikasi("🎉 Kuda Baru!", `Kamu berhasil membeli ${item.nama}!`, "neon-green");
    renderBalapKuda();
}

// --- FUNGSI GANTI NAMA KUDA PEMAIN ---
function gantiNamaKuda() {
    let k = balapKudaState.kudaPemain;
    if (!k) return;

    let namaBaru = prompt("Masukkan nama baru untuk kudamu:", k.nama);
    if (namaBaru === null) return;

    namaBaru = namaBaru.trim();
    if (namaBaru === "") {
        alert("⚠️ Nama kuda tidak boleh kosong!");
        return;
    }

    if (namaBaru.length > 20) {
        alert("⚠️ Nama kuda maksimal 20 karakter!");
        return;
    }

    let namaLama = k.nama;
    k.nama = namaBaru;

    tampilkanPopupNotifikasi("✏️ Nama Kuda Diubah", `Nama kuda berhasil diubah dari ${namaLama} menjadi ${namaBaru}!`, "neon-green");
    renderBalapKuda();
}

// --- MEKANIK LATIHAN & STRES YANG SEIMBANG ---
function latihKuda(statKey) {
    let k = balapKudaState.kudaPemain;
    if (!k) return;

    if (k.stamina < 30) {
        alert("⚠️ Kuda terlalu lelah (Stamina < 30)! Istirahatkan kudamu terlebih dahulu.");
        return;
    }

    if (k.stres >= 100) {
        alert("⚠️ Kuda mencapai batas maksimal stres (100)! Kuda sudah berlatih 5x, istirahatkan kuda terlebih dahulu.");
        return;
    }

    k.stamina -= 30;
    let penambahanStres = 20; // Tepat 20 per latihan agar bisa 5x (5 x 20 = 100)
    k.stres = Math.min(100, k.stres + penambahanStres);

    let penambahanStat = Math.floor(Math.random() * 2) + 1; 

    if (k.stres >= 100) {
        tampilkanPopupNotifikasi(
            "⚠️ Kuda Sangat Stres!", 
            "Kuda mencapai batas maksimal latihan! Segera istirahatkan kudamu.", 
            "neon-amber"
        );
    } else {
        let namaStat = {
            kecepatan: "Kecepatan",
            dayaTahan: "Daya Tahan",
            akselerasi: "Akselerasi",
            kelincahan: "Kelincahan"
        }[statKey] || statKey;

        tampilkanPopupNotifikasi(
            "🏃 Latihan Selesai", 
            `${namaStat} bertambah +${penambahanStat} Pts! (Stamina -30, Stres +${penambahanStres})`, 
            "neon-green"
        );
    }

    k.stats[statKey] += penambahanStat;

    if (statKey === 'dayaTahan' && penambahanStat > 0) {
        k.staminaMax += 1;
    }

    renderBalapKuda();
}

function istirahatKuda() {
    let k = balapKudaState.kudaPemain;
    if (!k) return;

    let hariSekarang = gameState.waktuHari || 0;
    let jamSekarang = gameState.jam || 0;

    let totalJamSekarang = (hariSekarang * 24) + jamSekarang;
    let totalJamTerakhir = ((k.terakhirIstirahatHari || 0) * 24) + (k.terakhirIstirahatJam || 0);

    let selisihJam = totalJamSekarang - totalJamTerakhir;

    if (k.terakhirIstirahatHari !== undefined && selisihJam < 5) {
        let sisa = 5 - selisihJam;
        alert(`⚠️ Kuda belum bisa istirahat! Masih dalam cooldown (${sisa} jam in-game lagi).`);
        return;
    }

    k.stamina = k.staminaMax;
    k.stres = 0;
    k.terakhirIstirahatHari = hariSekarang;
    k.terakhirIstirahatJam = jamSekarang;

    tampilkanPopupNotifikasi("💤 Kuda Beristirahat", "Stamina pulih penuh dan tingkat stres kembali ke 0!", "neon-green");
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

    let jamSekarang = gameState.jam || 0;
    if (jamSekarang < 10 || jamSekarang >= 19) {
        alert("⚠️ Arena Balap Kuda hanya buka dari jam 10.00 hingga 19.00!");
        return;
    }

    if (k.stamina < 30) {
        alert("⚠️ Stamina kuda kurang untuk mengikuti balapan (Min. 30)!");
        return;
    }

    if (gameState.uang < cfg.biayaDaftar) {
        alert(`⚠️ Biaya pendaftaran Kelas ${kelas} tidak cukup (Rp. ${cfg.biayaDaftar.toLocaleString('id-ID')})!`);
        return;
    }

    gameState.uang -= cfg.biayaDaftar;
    k.stamina = Math.max(0, k.stamina - 30);
    k.stres = Math.min(100, k.stres + 15);
    updateHeaderUI();

    // Mengambil 7 lawan NPC yang sudah digenerasi
    let lawanNpcList = balapKudaState.lawanPerKelas[kelas] || [];
    let peserta = lawanNpcList.map(npc => ({
        nama: npc.nama,
        stats: npc.stats,
        isPemain: false
    }));

    // Menambahkan Kuda Pemain (Total 8 Peserta)
    peserta.push({
        nama: k.nama + " (Kuda Kamu)",
        stats: k.stats,
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

    // Proses Hadiah jika meraih peringkat 1-3
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

    // Tampilkan Modal Peringkat Hasil Balapan 1 - 8
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
            <td style="padding:6px; color:${isPlayer ? '#60a5fa' : '#f8fafc'};">${p.nama}</td>
            <td style="padding:6px; text-align:center; color:#fbbf24;">${p.ovrDisplay}</td>
            <td style="padding:6px; text-align:center;">${p.skorAkhir}</td>
        </tr>`;
    });

    modalTeks += `</tbody></table></div>`;

    let judul = `🏆 Hasil Balapan Kelas ${kelas} (Posisi Ke-${posisiPemain})`;
    tampilkanPopupNotifikasi(judul, modalTeks, posisiPemain <= 3 ? "neon-green" : "neon-amber");
}
