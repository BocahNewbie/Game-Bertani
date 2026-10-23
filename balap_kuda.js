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
        ovrMin: 100, ovrMax: 200, 
        biayaDaftar: 3000,
        hadiah: { j1: 20000, j2: 10000, j3: 5000 }
    },
    "C": { 
        nama: "Kelas C (Amatir)",   
        ovrMin: 201, ovrMax: 350, 
        biayaDaftar: 10000,
        hadiah: { j1: 50000, j2: 30000, j3: 15000 }
    },
    "B": { 
        nama: "Kelas B (Pro)",      
        ovrMin: 351, ovrMax: 500, 
        biayaDaftar: 27000,
        hadiah: { j1: 150000, j2: 75000, j3: 35000 }
    },
    "A": { 
        nama: "Kelas A (Elite)",    
        ovrMin: 501, ovrMax: 700, 
        biayaDaftar: 70000,
        hadiah: { j1: 350000, j2: 175000, j3: 85000 }
    },
    "S": { 
        nama: "Kelas S (Master)",   
        ovrMin: 701, ovrMax: 900, 
        biayaDaftar: 150000,
        hadiah: { j1: 800000, j2: 400000, j3: 200000 }
    },
    "SS": { 
        nama: "Kelas SS (Legend)",  
        ovrMin: 901, ovrMax: 1200,
        biayaDaftar: 450000,
        hadiah: { j1: 2500000, j2: 1250000, j3: 600000 }
    }
};

const NAMA_KUDA_NPC = ["Baron", "Zeus", "Shadow", "Pegasus", "Bintang", "Thunder", "Blaze", "Tornado", "Valkyrie", "Titan", "Phantom", "Eclipse", "Byakko", "Dandan", "Kelp"];

// --- FUNGSI UTAMA / RENDER TAB ---
function renderBalapKuda() {
    const container = document.getElementById("area-balap-kuda");
    if (!container) return;

    // Paksa buat pasar kuda jika belum ada data sama sekali atau hari berganti
    if (!balapKudaState.daftarPasarKuda || balapKudaState.daftarPasarKuda.length === 0 || balapKudaState.musimBalapHari !== gameState.waktuHari) {
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
        let ovrAsli = hitungOverallKuda(k.stats);
        let statE = hitungStatEfektif(k);
        let ovrEfektif = hitungOverallKuda(statE);

        let statusPenaltiTeks = statE.penaltiPersen > 0 
            ? `<span style="color:#f87171; font-size:0.85rem;">(📉 Penurunan Performa -${statE.penaltiPersen}% karena lelah/stres)</span>` 
            : `<span style="color:#34d399; font-size:0.85rem;">(✨ Performa Optimal 100%)</span>`;

        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3>🐎 ${k.nama} <span style="color:#fbbf24;">[Kelas Tertinggi: ${k.kelasMaks}]</span></h3>
                    <p>OVR Asli: <b>${ovrAsli} Pts</b> | OVR Efektif: <b style="color:${statE.penaltiPersen > 0 ? '#f87171' : '#34d399'}; font-size:1.2rem;">${ovrEfektif} Pts</b> ${statusPenaltiTeks}</p>
                    <p>⚡ Stamina: <b>${k.stamina} / ${k.staminaMax}</b> | 🪨 Stres: <b style="color:${k.stres > 50 ? '#f87171' : '#34d399'}">${k.stres} / 100</b></p>
                </div>
                <div>
                    <button onclick="latihKuda('kecepatan')" style="background:#2563eb; margin:2px;">🏃 Latih Kecepatan</button>
                    <button onclick="latihKuda('dayaTahan')" style="background:#2563eb; margin:2px;">🛡️ Latih Daya Tahan</button>
                    <button onclick="latihKuda('akselerasi')" style="background:#2563eb; margin:2px;">🚀 Latih Akselerasi</button>
                    <button onclick="latihKuda('kelincahan')" style="background:#2563eb; margin:2px;">🌀 Latih Kelincahan</button>
                    <button onclick="istirahatKuda()" style="background:#059669; margin:2px;">💤 Istirahatkan Kuda</button>
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
                <p style="font-size:0.8rem; color:#fbbf24; margin-top:5px;">
                    🥇 J1: Rp. ${cfg.hadiah.j1.toLocaleString('id-ID')}<br>
                    🥈 J2: Rp. ${cfg.hadiah.j2.toLocaleString('id-ID')}<br>
                    🥉 J3: Rp. ${cfg.hadiah.j3.toLocaleString('id-ID')}
                </p>
                <button onclick="mulaiBalapanKelas('${kls}')" style="background:${bisaIkut ? '#059669' : '#334155'}; width:100%; margin-top:10px;" ${!bisaIkut ? 'disabled' : ''}>
                    ${!balapKudaState.kudaPemain ? 'Butuh Kuda' : (!dapatAksesKelas(kls) ? 'Terkunci (Juarai Kelas Sebelum)' : 'Ikut Tanding')}
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

// --- MEKANIK PASAR KUDA ---
function generasiPasarKuda() {
    balapKudaState.daftarPasarKuda = [];
    for (let i = 0; i < 3; i++) {
        let nama = "Kuda " + NAMA_KUDA_NPC[Math.floor(Math.random() * NAMA_KUDA_NPC.length)];
        let stats = buatStatRandom(80, 180);
        let harga = 35000 + Math.round(hitungOverallKuda(stats) * 80);
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
        kelasMaks: "D",
        isPemain: true
    };

    balapKudaState.daftarPasarKuda.splice(index, 1);
    updateHeaderUI();
    tampilkanPopupNotifikasi("🎉 Kuda Baru!", `Kamu berhasil membeli ${item.nama}!`, "neon-green");
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

    k.stamina -= 30;
    let penambahanStres = Math.floor(Math.random() * 11) + 20;
    k.stres = Math.min(100, k.stres + penambahanStres);

    let penambahanStat = Math.floor(Math.random() * 2) + 1; 

    if (k.stres > 70) {
        penambahanStat = Math.random() < 0.5 ? 0 : 1;
        tampilkanPopupNotifikasi(
            "⚠️ Kuda Sangat Stres!", 
            "Kuda kelelahan dan stres berat! Latihan menjadi tidak efektif.", 
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

    k.stamina = k.staminaMax;
    k.stres = Math.max(0, k.stres - 50);
    tampilkanPopupNotifikasi("💤 Kuda Beristirahat", "Stamina pulih penuh dan tingkat stres berkurang drastis!", "neon-green");
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
    k.stamina = Math.max(0, k.stamina - 30);
    k.stres = Math.min(100, k.stres + 15);
    updateHeaderUI();

    let peserta = [];
    for (let i = 0; i < 6; i++) {
        let statsNpc = buatStatRandom(cfg.ovrMin, cfg.ovrMax);
        peserta.push({
            nama: NAMA_KUDA_NPC[i % NAMA_KUDA_NPC.length] + ` [NPC]`,
            stats: statsNpc,
            isPemain: false
        });
    }

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

        p.skorAkhir = poinKecepatan + dayaTahanFactor + keberuntungan;
        p.penaltiPersen = statEfektif.penaltiPersen || 0;
    });

    peserta.sort((a, b) => b.skorAkhir - a.skorAkhir);

    let posisiPemain = peserta.findIndex(p => p.isPemain) + 1;
    let juara1 = peserta[0];
    let urutanKelas = ["D", "C", "B", "A", "S", "SS"];
    let idxSekarang = urutanKelas.indexOf(kelas);

    let pemainPeserta = peserta.find(p => p.isPemain);
    let infoPenaltiTeks = (pemainPeserta && pemainPeserta.penaltiPersen > 10) 
        ? `\n⚠️ Performa kudamu turun ${pemainPeserta.penaltiPersen}% karena lelah/stres!` 
        : "";

    if (posisiPemain === 1) {
        let hadiahUang = cfg.hadiah.j1;
        gameState.uang += hadiahUang;
        updateHeaderUI();

        if (idxSekarang < urutanKelas.length - 1 && urutanKelas.indexOf(k.kelasMaks) === idxSekarang) {
            k.kelasMaks = urutanKelas[idxSekarang + 1];
        }

        tampilkanPopupNotifikasi(
            "🥇 JUARA 1 BALAPAN!", 
            `Selamat! Kudamu meraih Juara 1 di Kelas ${kelas}! Hadiah: Rp. ${hadiahUang.toLocaleString('id-ID')}${infoPenaltiTeks}`, 
            "neon-green"
        );
    } else if (posisiPemain === 2) {
        let hadiahUang = cfg.hadiah.j2;
        gameState.uang += hadiahUang;
        updateHeaderUI();

        tampilkanPopupNotifikasi(
            "🥈 JUARA 2 BALAPAN!", 
            `Luar biasa! Kudamu finish di posisi 2 di Kelas ${kelas}! Hadiah: Rp. ${hadiahUang.toLocaleString('id-ID')}${infoPenaltiTeks}`, 
            "neon-blue"
        );
    } else if (posisiPemain === 3) {
        let hadiahUang = cfg.hadiah.j3;
        gameState.uang += hadiahUang;
        updateHeaderUI();

        tampilkanPopupNotifikasi(
            "🥉 JUARA 3 BALAPAN!", 
            `Bagus! Kudamu finish di posisi 3 di Kelas ${kelas}! Hadiah: Rp. ${hadiahUang.toLocaleString('id-ID')}${infoPenaltiTeks}`, 
            "neon-amber"
        );
    } else {
        tampilkanPopupNotifikasi(
            `Hasil Balapan Kelas ${kelas}`, 
            `Kudamu finish di posisi ke-${posisiPemain}. Juara 1 diraih oleh ${juara1.nama}!${infoPenaltiTeks}`, 
            "neon-amber"
        );
    }

    renderBalapKuda();
}
