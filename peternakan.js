// PETERNAKAN.JS - Logika Hewan Ternak, Ganti Nama, Button Khusus Jual Hewan, Obat Hamil, & Mesin Inkubasi Telur

let hewanSedangDiedit = null;
let hewanSedangDijual = null;
let subTabPeternakanAktif = 'ayam'; // 'ayam' | 'sapi' | 'domba' | 'inkubasi'

function switchSubTabPeternakan(tabId) {
    subTabPeternakanAktif = tabId;
    renderPeternakan();
}

function formatDurasiHari(totalDetik) {
    if (totalDetik <= 0) return "Siap Lahir";
    const hari = Math.floor(totalDetik / 86400);
    const sisaHari = totalDetik % 86400;
    const jam = Math.floor(sisaHari / 3600);
    const menit = Math.floor((sisaHari % 3600) / 60);
    const detik = sisaHari % 60;

    if (hari > 0) {
        return `${hari}h ${jam}j ${menit}m`;
    } else if (jam > 0) {
        return `${jam}j ${menit}m ${detik}s`;
    } else {
        return `${menit}m ${detik}s`;
    }
}

// Menghitung harga jual hewan ternak yang terpengaruh fluktuasi pasar global (-70% s.d +21%) & bonus aksesoris
function getHargaJualHewan(jenisId) {
    const baseHarga = GAME_DATABASE.ternak[jenisId]?.hargaJual || 1000;
    let bonusAcc = 0;
    if (typeof hitungTotalBonusAksesoris === 'function') {
        bonusAcc = hitungTotalBonusAksesoris();
    }
    let harga = baseHarga;
    if (typeof MarketEconomy !== 'undefined') {
        harga = MarketEconomy.getHargaJual(baseHarga);
    }
    return Math.max(1, Math.round(harga * (1 + bonusAcc / 100)));
}

function renderPeternakan() {
    const container = document.getElementById("tab-peternakan");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    if (!gameState.kandang) gameState.kandang = {};
    if (!gameState.inventory.pakan) gameState.inventory.pakan = {};
    if (!gameState.inventory.obat) gameState.inventory.obat = {};
    if (!gameState.inventory.hasilTernak) gameState.inventory.hasilTernak = {};
    if (!gameState.inkubasi) gameState.inkubasi = [];

    const now = Date.now();
    const stokJagung = gameState.inventory.pakan.jagung_pakan || 0;
    const stokRumput = gameState.inventory.pakan.rumput || 0;
    const stokTelur = gameState.inventory.hasilTernak.telur || 0;
    const stokObat = gameState.inventory.obat.obat_hamil || 0;
    const totalInkubasi = gameState.inkubasi.length;

    const persenJualVal = typeof MarketEconomy !== 'undefined' ? Math.round((MarketEconomy.multiplier - 1.0) * 100) : 0;
    const persenJual = (persenJualVal >= 0 ? `+${persenJualVal}%` : `${persenJualVal}%`);

    const jenisTernakList = [
        { 
            id: 'ayam', 
            nama: 'Kandang Ayam', 
            icon: '🐔', 
            pakanId: 'jagung_pakan', 
            namaPakan: 'Pakan Jagung', 
            iconPakan: '🌽', 
            stokPakan: stokJagung, 
            produksiInfo: '1 - 2 Telur',
            hargaJual: getHargaJualHewan('ayam'),
            bisaHamil: false
        },
        { 
            id: 'sapi', 
            nama: 'Kandang Sapi', 
            icon: '🐮', 
            pakanId: 'rumput', 
            namaPakan: 'Rumput Segar', 
            iconPakan: '🌿', 
            stokPakan: stokRumput, 
            produksiInfo: '2 - 7 Susu',
            hargaJual: getHargaJualHewan('sapi'),
            bisaHamil: true,
            durasiHamilHari: 20
        },
        { 
            id: 'domba', 
            nama: 'Kandang Domba', 
            icon: '🐑', 
            pakanId: 'rumput', 
            namaPakan: 'Rumput Segar', 
            iconPakan: '🌿', 
            stokPakan: stokRumput, 
            produksiInfo: '1 Wol',
            hargaJual: getHargaJualHewan('domba'),
            bisaHamil: true,
            durasiHamilHari: 15
        }
    ];

    let html = `
        <div class="peternakan-header" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                <div>
                    <h3 style="margin: 0 0 4px 0;">🐾 Area Peternakan & Inkubasi Telur</h3>
                    <p style="font-size: 13px; color: #475569; margin: 0;">
                        Rawat hewan mu dengan baik.
                    </p>
                </div>
                <!-- BUTTON KHUSUS JUAL HEWAN TERNAK -->
                <button onclick="bukaModalPilihHewanJual()" style="padding: 9px 18px; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(220,38,38,0.2);">
                    💰 Jual Hewan Ternak
                </button>
            </div>
            
            <!-- BAR INFO STOK TERNAK, PAKAN & FLUKTUASI JUAL HEWAN -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; align-items: center;">
                <span style="background: #f0fdf4; color: #166534; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid #bbf7d0;">
                    📈 Fluktuasi Jual Hewan: <b>${persenJual}</b> (-70% s.d +21%)
                </span>
                <span style="background: #fef3c7; color: #92400e; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    🌽 Jagung (Ayam): ${stokJagung}
                </span>
                <span style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    🌿 Rumput (Sapi/Domba): ${stokRumput}
                </span>
                <span style="background: #fdf2f8; color: #9d174d; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    💊 Obat Hamil: ${stokObat}
                </span>
                <span style="background: #e0f2fe; color: #075985; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    🥚 Telur di Tas: ${stokTelur}
                </span>
                <span style="background: #fae8ff; color: #86198f; padding: 5px 10px; border-radius: 6px; font-size: 12px; font-weight: bold;">
                    🐣 Sedang Diinkubasi: ${totalInkubasi} / ${gameState.kapasitasInkubasi || 1} Slot
                </span>
            </div>

            <!-- SUB-NAV AREA KANDANG & INKUBASI (TERPISAH PER HEWAN TERNAK) -->
            <div class="sub-nav" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button onclick="switchSubTabPeternakan('ayam')" class="sub-tab-btn ${subTabPeternakanAktif === 'ayam' ? 'active' : ''}">
                    🐔 Kandang Ayam
                </button>
                <button onclick="switchSubTabPeternakan('sapi')" class="sub-tab-btn ${subTabPeternakanAktif === 'sapi' ? 'active' : ''}">
                    🐮 Kandang Sapi
                </button>
                <button onclick="switchSubTabPeternakan('domba')" class="sub-tab-btn ${subTabPeternakanAktif === 'domba' ? 'active' : ''}">
                    🐑 Kandang Domba
                </button>
                <button onclick="switchSubTabPeternakan('inkubasi')" class="sub-tab-btn ${subTabPeternakanAktif === 'inkubasi' ? 'active' : ''}" style="background: ${subTabPeternakanAktif === 'inkubasi' ? '#2563eb' : '#f1f5f9'}; color: ${subTabPeternakanAktif === 'inkubasi' ? 'white' : '#1e293b'}; font-weight: bold;">
                    🥚 Mesin Inkubasi Telur (${totalInkubasi})
                </button>
            </div>
        </div>
    `;

    // Pastikan jika sub-tab invalid, fallback ke ayam
    if (!['ayam', 'sapi', 'domba', 'inkubasi'].includes(subTabPeternakanAktif)) {
        subTabPeternakanAktif = 'ayam';
    }

    // 1. TAMPILKAN TAB INKUBASI JIKA DIPILIH
    if (subTabPeternakanAktif === 'inkubasi') {
        html += renderTabInkubasi(now, stokTelur);
        container.innerHTML = html;
        return;
    }

    // 2. TAMPILKAN KANDANG HEWAN (TERPISAH PER HEWAN)
    html += `<div class="grid-kandang" style="display: flex; flex-direction: column; gap: 20px;">`;

    const daftarTampil = jenisTernakList.filter(j => j.id === subTabPeternakanAktif);

    daftarTampil.forEach(jenis => {
        if (!gameState.kandang[jenis.id]) gameState.kandang[jenis.id] = [];
        let listHewan = gameState.kandang[jenis.id];
        let maxKapasitas = gameState.kapasitasKandang ? (gameState.kapasitasKandang[jenis.id] || 2) : 2;

        html += `
            <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 18px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h4 style="margin: 0 0 2px 0; color: #1e293b; font-size: 16px;">${jenis.icon} ${jenis.nama}</h4>
                        <p style="margin: 0; font-size: 12px; color: #64748b;">
                            Pakan: <b>${jenis.iconPakan} ${jenis.namaPakan}</b> | Hasil: <b>${jenis.produksiInfo}</b> | Harga Jual: <b>Rp ${jenis.hargaJual.toLocaleString()}</b>
                        </p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="font-size: 13px; font-weight: bold; color: #475569; background: #e2e8f0; padding: 4px 10px; border-radius: 6px;">
                            Kapasitas: ${listHewan.length} / ${maxKapasitas} Ekor
                        </span>
                        <button onclick="bukaModalPilihHewanJual('${jenis.id}')" style="padding: 4px 10px; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">
                            💰 Jual ${jenis.id.toUpperCase()}
                        </button>
                    </div>
                </div>
                
                <div style="display: flex; gap: 14px; flex-wrap: wrap;">
        `;

        if (listHewan.length === 0) {
            html += `<p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 6px 0;">Kandang ini masih kosong. Beli hewan di Pasar!</p>`;
        } else {
            listHewan.forEach((hewan, idx) => {
                const siapPanen = hewan.status === "Kenyang / Siap Panen";
                const namaHewanTampil = hewan.nama || `${jenis.id.toUpperCase()} #${idx + 1}`;

                // Status Kehamilan & Cooldown Pasca Melahirkan (Sapi & Domba)
                let infoKehamilan = "";
                let tombolHamil = "";

                if (jenis.bisaHamil) {
                    if (hewan.hamil) {
                        const durasiTotalDetik = hewan.durasiHamilDetik || (jenis.id === 'sapi' ? 20 * 86400 : 15 * 86400);
                        const berlalu = Math.floor((now - (hewan.waktuHamilMulai || now)) / 1000);
                        const sisaDetik = Math.max(0, durasiTotalDetik - berlalu);

                        if (sisaDetik === 0) {
                            infoKehamilan = `
                                <div style="background: #fdf2f8; border: 1px solid #f472b6; border-radius: 6px; padding: 4px; font-size: 11px; color: #be185d; font-weight: bold; margin-bottom: 4px;">🤰 Siap Melahirkan!</div>
                                <div style="font-size: 10px; color: #dc2626; font-weight: bold; margin-bottom: 6px;">🚫 Tidak bisa dijual saat hamil</div>
                            `;
                            tombolHamil = `<button onclick="lahirkanAnakTernak('${jenis.id}', ${idx})" style="padding: 6px 10px; background: #ec4899; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%; margin-bottom: 6px;">👶 Lahirkan Anak</button>`;
                        } else {
                            infoKehamilan = `
                                <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 6px; padding: 4px; font-size: 11px; color: #be185d; font-weight: bold; margin-bottom: 4px;">🤰 Hamil: ${formatDurasiHari(sisaDetik)}</div>
                                <div style="font-size: 10px; color: #dc2626; font-weight: bold; margin-bottom: 6px;">🚫 Tidak bisa dijual saat hamil</div>
                            `;
                            tombolHamil = ``;
                        }
                    } else {
                        // Cek apakah hewan sedang cooldown 5 hari pasca melahirkan
                        let sisaCooldown = 0;
                        if (hewan.waktuMelahirkan) {
                            const cooldownTotal = hewan.cooldownHamilDetik || (5 * 86400);
                            const berlaluSetelahLahir = Math.floor((now - hewan.waktuMelahirkan) / 1000);
                            sisaCooldown = Math.max(0, cooldownTotal - berlaluSetelahLahir);
                        }

                        if (sisaCooldown > 0) {
                            infoKehamilan = `<div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 6px; padding: 4px; font-size: 11px; color: #854d0e; font-weight: bold; margin-bottom: 6px;">⏳ Istirahat Melahirkan: ${formatDurasiHari(sisaCooldown)}</div>`;
                            tombolHamil = `<button onclick="beriObatHamil('${jenis.id}', ${idx})" style="padding: 5px 8px; background: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%; margin-bottom: 6px;" title="Hewan sedang dalam masa istirahat 5 hari pasca melahirkan">💊 Istirahat (${formatDurasiHari(sisaCooldown)})</button>`;
                        } else {
                            tombolHamil = `<button onclick="beriObatHamil('${jenis.id}', ${idx})" style="padding: 5px 8px; background: #8b5cf6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%; margin-bottom: 6px;">💊 Beri Obat Hamil (${jenis.durasiHamilHari}h)</button>`;
                        }
                    }
                }

                html += `
                    <div style="background: white; border: 2px solid ${siapPanen ? '#86efac' : (hewan.hamil ? '#f472b6' : '#cbd5e1')}; border-radius: 10px; padding: 14px; min-width: 165px; max-width: 195px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">
                        <div style="font-size: 32px; margin-bottom: 4px;">${jenis.icon}</div>
                        <p style="font-weight: bold; margin: 0 0 2px 0; font-size: 14px; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${namaHewanTampil}">
                            ${namaHewanTampil}
                        </p>
                        <button onclick="bukaModalGantiNamaHewan('${jenis.id}', ${idx})" style="background: none; border: none; color: #2563eb; font-size: 11px; cursor: pointer; text-decoration: underline; margin-bottom: 8px; padding: 0;">
                            ✏️ Ganti Nama
                        </button>
                        
                        <p style="font-size: 12px; color: ${siapPanen ? '#16a34a' : '#d97706'}; margin: 0 0 8px 0; font-weight: bold;">
                            ${siapPanen ? '✨ Siap Panen' : '🍽️ Lapar'}
                        </p>

                        ${infoKehamilan}
                        ${tombolHamil}

                        <!-- TOMBOL AKSI PAKAN & PANEN PER-HEWAN -->
                        <div style="display: flex; flex-direction: column; gap: 6px;">
                            ${siapPanen ? `
                                <button onclick="panenHasilTernak('${jenis.id}', ${idx})" style="padding: 7px 12px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                                    Ambil Hasil
                                </button>
                            ` : `
                                <button onclick="beriPakanPerHewan('${jenis.id}', ${idx})" style="padding: 7px 12px; background: #d97706; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                                    Beri Pakan (1)
                                </button>
                            `}
                        </div>
                    </div>
                `;
            });
        }

        html += `
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// 1. MODAL & LOGIKA GANTI NAMA HEWAN
// ==========================================
function bukaModalGantiNamaHewan(jenisTernak, indexHewan) {
    hewanSedangDiedit = { jenis: jenisTernak, index: indexHewan };
    const modal = document.getElementById("modal-nama-hewan");
    const input = document.getElementById("input-nama-hewan");
    
    if (modal && input) {
        const hewan = gameState.kandang[jenisTernak]?.[indexHewan];
        input.value = (hewan && hewan.nama) ? hewan.nama : `${jenisTernak.toUpperCase()} #${indexHewan + 1}`;
        modal.style.display = "flex";
        setTimeout(() => input.focus(), 50);
    }
}

function tutupModalNamaHewan() {
    const modal = document.getElementById("modal-nama-hewan");
    if (modal) modal.style.display = "none";
    hewanSedangDiedit = null;
}

function simpanNamaHewanBaru() {
    if (!hewanSedangDiedit) return;
    const input = document.getElementById("input-nama-hewan");
    if (input && input.value.trim()) {
        const namaBaru = input.value.trim();
        const { jenis, index } = hewanSedangDiedit;
        if (gameState.kandang[jenis] && gameState.kandang[jenis][index]) {
            gameState.kandang[jenis][index].nama = namaBaru;
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`✨ Nama hewan berhasil diubah menjadi "${namaBaru}"!`);
            }
            renderPeternakan();
            if (typeof simpanGame === 'function') simpanGame();
        }
    }
    tutupModalNamaHewan();
}

// ==========================================
// 2. BUTTON KHUSUS JUAL HEWAN & PERSURATAN PERSETUJUAN
// ==========================================
function bukaModalPilihHewanJual(filterJenis = null) {
    const modal = document.getElementById("modal-pilih-hewan-jual");
    const listContainer = document.getElementById("modal-pilih-hewan-jual-list");
    if (!modal || !listContainer) return;

    listContainer.innerHTML = "";

    const jenisList = filterJenis ? [filterJenis] : ['ayam', 'sapi', 'domba'];
    let daftarTernakDimiliki = [];

    jenisList.forEach(j => {
        const listHewan = gameState.kandang[j] || [];
        const dataTernak = GAME_DATABASE.ternak[j];
        const hargaJualSekarang = getHargaJualHewan(j);
        listHewan.forEach((hewan, idx) => {
            daftarTernakDimiliki.push({
                jenis: j,
                index: idx,
                nama: hewan.nama || `${j.toUpperCase()} #${idx + 1}`,
                icon: dataTernak?.icon || '🐾',
                hargaJual: hargaJualSekarang,
                hamil: !!hewan.hamil
            });
        });
    });

    if (daftarTernakDimiliki.length === 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Kamu tidak memiliki hewan ternak untuk dijual!");
        }
        return;
    }

    // Render list nama-nama hewan yang bisa dipilih untuk dijual
    daftarTernakDimiliki.forEach(item => {
        const itemRow = document.createElement("button");
        itemRow.style.display = "flex";
        itemRow.style.justifyContent = "space-between";
        itemRow.style.alignItems = "center";
        itemRow.style.padding = "10px 14px";
        itemRow.style.textAlign = "left";
        itemRow.style.width = "100%";
        itemRow.style.transition = "all 0.15s ease";
        itemRow.style.borderRadius = "8px";

        if (item.hamil) {
            itemRow.style.background = "#fdf2f8";
            itemRow.style.border = "1px solid #fbcfe8";
            itemRow.style.cursor = "not-allowed";
            itemRow.style.opacity = "0.75";
            itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">${item.icon}</span>
                    <div>
                        <span style="font-weight: bold; font-size: 14px; color: #475569;">${item.nama}</span>
                        <div style="font-size: 11px; color: #db2777; font-weight: bold;">🤰 Sedang Hamil (Tidak bisa dijual)</div>
                    </div>
                </div>
                <span style="color: #94a3b8; font-weight: bold; font-size: 12px; background: #e2e8f0; padding: 3px 8px; border-radius: 4px;">🚫 Terkunci</span>
            `;
            itemRow.onclick = () => {
                if (typeof tampilkanToast === 'function') {
                    tampilkanToast(`⚠️ "${item.nama}" sedang hamil dan tidak bisa dijual! Tunggu hingga melahirkan.`);
                }
            };
        } else {
            itemRow.style.background = "#ffffff";
            itemRow.style.border = "1px solid #cbd5e1";
            itemRow.style.cursor = "pointer";
            itemRow.onmouseover = () => { itemRow.style.borderColor = "#ef4444"; itemRow.style.background = "#fef2f2"; };
            itemRow.onmouseout = () => { itemRow.style.borderColor = "#cbd5e1"; itemRow.style.background = "#ffffff"; };

            itemRow.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 20px;">${item.icon}</span>
                    <span style="font-weight: bold; font-size: 14px; color: #1e293b;">${item.nama}</span>
                </div>
                <span style="color: #16a34a; font-weight: bold; font-size: 13px;">Rp ${item.hargaJual.toLocaleString()}</span>
            `;
            itemRow.onclick = () => pilihHewanUntukDijual(item.jenis, item.index, item.nama, item.hargaJual);
        }

        listContainer.appendChild(itemRow);
    });

    modal.style.display = "flex";
}

function tutupModalPilihHewanJual() {
    const modal = document.getElementById("modal-pilih-hewan-jual");
    if (modal) modal.style.display = "none";
}

function pilihHewanUntukDijual(jenis, index, namaHewan, hargaJual) {
    const hewan = gameState.kandang[jenis]?.[index];
    if (hewan && hewan.hamil) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ "${namaHewan}" sedang hamil dan tidak bisa dijual! Tunggu hingga melahirkan.`);
        }
        return;
    }

    tutupModalPilihHewanJual();

    hewanSedangDijual = {
        jenis,
        index,
        namaHewan,
        hargaJual
    };

    const modalAlert = document.getElementById("modal-jual-hewan");
    const infoText = document.getElementById("modal-jual-hewan-text");
    if (modalAlert && infoText) {
        infoText.innerHTML = `
            Apakah Anda menyetujui penjualan hewan ternak bernama:<br/>
            <span style="font-size: 16px; font-weight: bold; color: #dc2626; display: inline-block; margin: 6px 0;">"${namaHewan}"</span><br/>
            dengan harga jual sebesar <b style="color: #16a34a;">Rp ${hargaJual.toLocaleString()}</b>?
        `;
        modalAlert.style.display = "flex";
    }
}

function tutupModalJualHewan() {
    const modal = document.getElementById("modal-jual-hewan");
    if (modal) modal.style.display = "none";
    hewanSedangDijual = null;
}

function eksekusiJualHewanModal() {
    if (!hewanSedangDijual) return;
    const { jenis, index, hargaJual, namaHewan } = hewanSedangDijual;
    const hewan = gameState.kandang[jenis]?.[index];

    if (!hewan) {
        tutupModalJualHewan();
        return;
    }

    // Validasi ketat hewan sedang hamil tidak bisa dijual
    if (hewan.hamil) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ "${namaHewan}" sedang hamil dan tidak bisa dijual!`);
        }
        tutupModalJualHewan();
        return;
    }

    if (gameState.kandang[jenis] && gameState.kandang[jenis][index]) {
        // Hapus hewan dari kandang
        gameState.kandang[jenis].splice(index, 1);
        gameState.koin += hargaJual;

        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`🎉 Penjualan disetujui! "${namaHewan}" berhasil dijual seharga Rp ${hargaJual.toLocaleString()}.`);
        }

        tutupModalJualHewan();
        if (typeof updateHeaderStats === 'function') updateHeaderStats();
        renderPeternakan();
        if (typeof simpanGame === 'function') simpanGame();
    }
}

// ==========================================
// 3. LOGIKA OBAT HAMIL & KELAHIRAN (SAPI 20 HARI, DOMBA 15 HARI, COOLDOWN 5 HARI)
// ==========================================
function beriObatHamil(jenisTernak, indexHewan) {
    if (!gameState.inventory.obat) gameState.inventory.obat = {};
    const stokObat = gameState.inventory.obat.obat_hamil || 0;

    if (stokObat <= 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Kamu tidak memiliki Obat Kesuburan Ternak! Beli di Pasar.");
        }
        return;
    }

    const hewan = gameState.kandang[jenisTernak]?.[indexHewan];
    if (!hewan) return;

    if (hewan.hamil) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Hewan ini sudah dalam masa kehamilan!");
        }
        return;
    }

    // Cek cooldown 5 hari pasca melahirkan
    if (hewan.waktuMelahirkan) {
        const cooldownTotal = hewan.cooldownHamilDetik || (5 * 86400);
        const berlaluSetelahLahir = Math.floor((Date.now() - hewan.waktuMelahirkan) / 1000);
        const sisaCooldown = cooldownTotal - berlaluSetelahLahir;
        if (sisaCooldown > 0) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⏳ "${hewan.nama || jenisTernak}" baru saja melahirkan! Butuh masa pemulihan ${formatDurasiHari(sisaCooldown)} lagi sebelum bisa diberi obat hamil.`);
            }
            return;
        }
    }

    // Durasi Realtime: Sapi 20 Hari (1.728.000 detik), Domba 15 Hari (1.296.000 detik)
    const durasiHari = jenisTernak === 'sapi' ? 20 : 15;
    const durasiDetik = durasiHari * 86400;

    gameState.inventory.obat.obat_hamil -= 1;
    hewan.hamil = true;
    hewan.waktuHamilMulai = Date.now();
    hewan.durasiHamilDetik = durasiDetik;
    delete hewan.waktuMelahirkan;
    delete hewan.cooldownHamilDetik;

    const nama = hewan.nama || `${jenisTernak} #${indexHewan + 1}`;
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`💊 Berhasil memberikan Obat Hamil ke "${nama}"! Masa kehamilan dimulai (${durasiHari} hari realtime).`);
    }

    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}

function lahirkanAnakTernak(jenisTernak, indexHewan) {
    const hewan = gameState.kandang[jenisTernak]?.[indexHewan];
    if (!hewan || !hewan.hamil) return;

    const maxCap = gameState.kapasitasKandang[jenisTernak] || 2;
    if (gameState.kandang[jenisTernak].length >= maxCap) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Kandang ${jenisTernak} penuh (${maxCap} ekor)! Perluas kandang terlebih dahulu agar anak dapat lahir.`);
        }
        return;
    }

    // Lahirkan 1 anak baru
    const nomorAnak = gameState.kandang[jenisTernak].length + 1;
    gameState.kandang[jenisTernak].push({
        nama: `ANAK ${jenisTernak.toUpperCase()} #${nomorAnak}`,
        status: "Lapar"
    });

    // Reset status hamil induk & tetapkan cooldown pemulihan 5 hari (432.000 detik)
    hewan.hamil = false;
    hewan.waktuMelahirkan = Date.now();
    hewan.cooldownHamilDetik = 5 * 86400;
    delete hewan.waktuHamilMulai;
    delete hewan.durasiHamilDetik;

    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🎉 Selamat! "${hewan.nama || jenisTernak}" telah melahirkan 1 ekor anak baru! Induk memasuki masa istirahat 5 hari.`);
    }

    renderPeternakan();
    if (typeof simpanGame === 'function') simpanGame();
}

// ==========================================
// 4. TAB & SISTEM MESIN INKUBASI TELUR
// ==========================================
function renderTabInkubasi(now, stokTelur) {
    const kapasitasMaks = gameState.kapasitasInkubasi || 1;
    const durasiStandar = GAME_DATABASE.inkubasi.durasiDetik || 60;

    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 12px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h4 style="margin: 0 0 4px 0; color: #1e293b; font-size: 18px;">🥚 Mesin Inkubasi Telur Ayam (${gameState.inkubasi.length} / ${kapasitasMaks} Slot)</h4>
                    <p style="margin: 0; font-size: 13px; color: #64748b;">
                        Simpan telur di mesin inkubasi untuk ditetaskan menjadi anak ayam (Durasi: ${durasiStandar} detik). Perluas slot di Pasar.
                    </p>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                    <button onclick="masukkanTelurKeInkubasi(1)" style="padding: 10px 16px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        ➕ Masukkan 1 Telur (${stokTelur} Tersedia)
                    </button>
                    <button onclick="bukaTab('pasar')" style="padding: 10px 14px; background: #0284c7; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        🏗️ Tambah Slot di Pasar
                    </button>
                </div>
            </div>

            <!-- GRID SLOT INKUBASI -->
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;">
    `;

    for (let i = 0; i < kapasitasMaks; i++) {
        const telur = gameState.inkubasi[i];
        if (telur) {
            const berlalu = Math.floor((now - (telur.waktuMulai || now)) / 1000);
            const sisaDetik = Math.max(0, (telur.durasiDetik || durasiStandar) - berlalu);
            const siapMenetas = sisaDetik === 0;

            subHtml += `
                <div style="background: white; border: 2px solid ${siapMenetas ? '#86efac' : '#fde047'}; border-radius: 10px; padding: 16px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="font-size: 36px; margin-bottom: 6px;">${siapMenetas ? '🐣' : '🥚'}</div>
                    <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">Slot #${i + 1}: ${siapMenetas ? 'Siap Menetas!' : 'Pengeraman Telur'}</p>
                    <p style="font-size: 12px; color: ${siapMenetas ? '#16a34a' : '#ca8a04'}; font-weight: bold; margin: 0 0 10px 0;">
                        ${siapMenetas ? '✨ Anak Ayam Siap Keluar' : `⏳ Sisa: ${sisaDetik} detik`}
                    </p>
                    ${siapMenetas ? `
                        <button onclick="tetaskanTelurInkubasi(${i})" style="padding: 8px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                            🐣 Tetaskan ke Kandang
                        </button>
                    ` : `
                        <button disabled style="padding: 8px 14px; background: #e2e8f0; color: #94a3b8; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; width: 100%; cursor: not-allowed;">
                            Menghangatkan...
                        </button>
                    `}
                </div>
            `;
        } else {
            subHtml += `
                <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px 14px; text-align: center;">
                    <div style="font-size: 28px; margin-bottom: 6px; color: #94a3b8;">⚪</div>
                    <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px; color: #64748b;">Slot #${i + 1} Kosong</p>
                    <p style="font-size: 11px; color: #94a3b8; margin: 0 0 10px 0;">Belum ada telur</p>
                    <button onclick="masukkanTelurKeInkubasi(1)" style="padding: 6px 12px; background: #e2e8f0; color: #475569; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">
                        + Isi Slot
                    </button>
                </div>
            `;
        }
    }

    subHtml += `</div></div>`;
    return subHtml;
}

function masukkanTelurKeInkubasi(jumlah = 1) {
    if (!gameState.inventory.hasilTernak) gameState.inventory.hasilTernak = {};
    const stokTelur = gameState.inventory.hasilTernak.telur || 0;

    if (stokTelur < jumlah) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Kamu tidak memiliki telur di tas inventory!");
        }
        return;
    }

    const kapasitasMaks = gameState.kapasitasInkubasi || 1;
    if (gameState.inkubasi.length >= kapasitasMaks) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Mesin inkubasi sudah penuh (${kapasitasMaks} slot)! Perluas mesin inkubasi di Pasar.`);
        }
        return;
    }

    // Kurangi telur dari inventory
    gameState.inventory.hasilTernak.telur -= jumlah;

    // Masukkan ke mesin inkubasi
    gameState.inkubasi.push({
        id: Date.now() + Math.random(),
        waktuMulai: Date.now(),
        durasiDetik: GAME_DATABASE.inkubasi.durasiDetik || 60
    });

    if (typeof tampilkanToast === 'function') {
        tampilkanToast("🥚 Telur berhasil dimasukkan ke mesin inkubasi!");
    }

    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}

function tetaskanTelurInkubasi(indexInkubasi) {
    const telur = gameState.inkubasi[indexInkubasi];
    if (!telur) return;

    const maxCap = gameState.kapasitasKandang.ayam || 2;
    if (gameState.kandang.ayam.length >= maxCap) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Kandang Ayam penuh (${maxCap} ekor)! Perbesar kandang terlebih dahulu agar anak ayam dapat masuk.`);
        }
        return;
    }

    // Hapus telur dari inkubasi
    gameState.inkubasi.splice(indexInkubasi, 1);

    // Tambah anak ayam baru
    const nomorAyam = gameState.kandang.ayam.length + 1;
    gameState.kandang.ayam.push({
        nama: `AYAM #${nomorAyam}`,
        status: "Lapar"
    });

    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🐣 Selamat! Telur berhasil menetas menjadi AYAM #${nomorAyam} dan dimasukkan ke Kandang Ayam.`);
    }

    renderPeternakan();
    if (typeof simpanGame === 'function') simpanGame();
}

// ==========================================
// 5. FUNGSI AKSI PETERNAKAN PER-HEWAN
// ==========================================
function beriPakanPerHewan(jenisTernak, indexHewan) {
    if (!gameState.inventory.pakan) gameState.inventory.pakan = {};
    const pakanStock = gameState.inventory.pakan;

    let targetPakanId = '';
    let namaPakanTeks = '';

    if (jenisTernak === 'ayam') {
        targetPakanId = 'jagung_pakan';
        namaPakanTeks = 'Pakan Jagung';
    } else if (jenisTernak === 'sapi' || jenisTernak === 'domba') {
        targetPakanId = 'rumput';
        namaPakanTeks = 'Rumput Segar';
    }

    const hewan = gameState.kandang[jenisTernak]?.[indexHewan];
    if (!hewan) return;

    if (hewan.status === "Kenyang / Siap Panen") {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ ${hewan.nama || jenisTernak} sudah kenyang! Ambil hasilnya terlebih dahulu.`);
        }
        return;
    }

    const stokDimiliki = pakanStock[targetPakanId] || 0;
    if (stokDimiliki <= 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Kamu tidak memiliki ${namaPakanTeks}! Beli di Pasar.`);
        }
        return;
    }

    // Kurangi 1 pakan spesifik untuk hewan ini saja
    pakanStock[targetPakanId] -= 1;
    hewan.status = "Kenyang / Siap Panen";

    const namaHewan = hewan.nama || `${jenisTernak} #${indexHewan + 1}`;
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🌾 Berhasil memberi 1 ${namaPakanTeks} ke ${namaHewan}! Siap dipanen.`);
    }

    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}

function panenHasilTernak(jenisTernak, indexHewan) {
    let hewan = gameState.kandang[jenisTernak]?.[indexHewan];
    if (!hewan) return;

    if (hewan.status !== "Kenyang / Siap Panen") {
        if (typeof tampilkanToast === 'function') tampilkanToast("⚠️ Hewan belum kenyang! Beri pakan terlebih dahulu.");
        return;
    }

    let hasilId = "telur";
    let jumlahHasil = 1;

    // Produksi Random:
    // Ayam: 1 - 2 Telur
    // Sapi: 2 - 7 Susu
    // Domba: 1 Wol
    if (jenisTernak === 'ayam') {
        hasilId = "telur";
        jumlahHasil = Math.floor(Math.random() * (2 - 1 + 1)) + 1; // 1 atau 2
    } else if (jenisTernak === 'sapi') {
        hasilId = "susu";
        jumlahHasil = Math.floor(Math.random() * (7 - 2 + 1)) + 2; // 2 s.d 7
    } else if (jenisTernak === 'domba') {
        hasilId = "wol";
        jumlahHasil = 1; // 1 buah wol
    }

    if (!gameState.inventory.hasilTernak) gameState.inventory.hasilTernak = {};
    gameState.inventory.hasilTernak[hasilId] = (gameState.inventory.hasilTernak[hasilId] || 0) + jumlahHasil;

    // Status kembali lapar
    hewan.status = "Lapar";

    const namaHewan = hewan.nama || `${jenisTernak} #${indexHewan + 1}`;
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🎉 Berhasil memanen dari ${namaHewan}! Mendapatkan ${jumlahHasil} buah ${hasilId}.`);
    }
    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}
