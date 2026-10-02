// ACCESSORIES.JS - Logika Aksesoris, Toko, Deskripsi Natural, & Cooldown 6 Jam (21600 detik)

function hitungTotalBonusAksesoris() {
    let totalBonus = 0;
    if (!gameState.accessoriesTerpasang) {
        gameState.accessoriesTerpasang = { kepala: null, tangan: null, badan: null, kaki: null, telapak: null };
    }
    
    if (Array.isArray(gameState.accessoriesTerpasang)) {
        const tempObj = { kepala: null, tangan: null, badan: null, kaki: null, telapak: null };
        gameState.accessoriesTerpasang.forEach(idAcc => {
            const item = GAME_DATABASE.accessories[idAcc];
            if (item && item.kategori) tempObj[item.kategori] = idAcc;
        });
        gameState.accessoriesTerpasang = tempObj;
    }

    Object.values(gameState.accessoriesTerpasang).forEach(idAcc => {
        if (idAcc) {
            const item = GAME_DATABASE.accessories[idAcc];
            if (item) {
                const valBonus = item.bonusPanen || item.bonus || 0;
                totalBonus += (typeof valBonus === 'number' && valBonus < 5 ? Math.round(valBonus * 100) : valBonus);
            }
        }
    });
    return totalBonus;
}

// Fungsi helper untuk mendeskripsikan efek secara natural
function formatDeskripsiEfek(item) {
    let deskripsi = [];

    if (item.bonusPanen) {
        deskripsi.push(`Meningkatkan hasil panen sebesar +${Math.round(item.bonusPanen * 100)}%.`);
    }
    if (item.bonusPanenAbsolut) {
        deskripsi.push(`Menambahkan +${item.bonusPanenAbsolut} jumlah hasil panen.`);
    }
    if (item.bonusTernak) {
        if (item.bonusTernak > 0) {
            deskripsi.push(`Memberikan bonus +${item.bonusTernak} hasil ternak.`);
        } else {
            deskripsi.push(`Mengurangi hasil ternak sebesar ${item.bonusTernak}.`);
        }
    }
    if (item.bonusHargaJualPanen) {
        deskripsi.push(`Menaikkan harga jual hasil panen sebesar +${Math.round(item.bonusHargaJualPanen * 100)}%.`);
    }
    if (item.bonusHargaJualTernak) {
        deskripsi.push(`Menaikkan harga jual hasil ternak sebesar +${Math.round(item.bonusHargaJualTernak * 100)}%.`);
    }
    if (item.bonusHargaJualSemua) {
        deskripsi.push(`Menaikkan harga jual panen & ternak sebesar +${Math.round(item.bonusHargaJualSemua * 100)}%.`);
    }
    if (item.bonusHargaJualKol) {
        deskripsi.push(`Menaikkan harga jual khusus tanaman kol sebesar +${Math.round(item.bonusHargaJualKol * 100)}%.`);
    }
    if (item.syaratTopi) deskripsi.push(`Syarat: Harus memakai Topi Jerami.`);
    if (item.syaratBadan) deskripsi.push(`Syarat: Harus memakai Kaos Partai.`);
    if (item.syaratTangan) deskripsi.push(`Syarat: Harus memakai Sarung Tangan Biasa.`);
    if (item.syaratBaju) deskripsi.push(`Syarat: Harus memakai Baju Hazmat.`);
    if (item.efekKhusus) deskripsi.push(`Efek Khusus: Menahan dampak dari ${item.efekKhusus}.`);

    return deskripsi.length > 0 ? deskripsi.join(' ') : "Tidak memiliki efek khusus.";
}

// ==========================================
// 1. TAB: AKSESORIS SAYA
// ==========================================
function renderAccessories() {
    const container = document.getElementById("tab-aksesoris");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    if (!gameState.inventory.accessories) gameState.inventory.accessories = {};
    if (!gameState.accessoriesTerpasang || Array.isArray(gameState.accessoriesTerpasang)) {
        hitungTotalBonusAksesoris(); 
    }
    if (!gameState.waktuPasangAksesoris) {
        gameState.waktuPasangAksesoris = {};
    }

    const totalBonus = hitungTotalBonusAksesoris();
    const waktuSekarang = Math.floor(Date.now() / 1000); // Waktu detik saat ini
    const durasiCooldown = 6 * 3600; // 6 Jam dalam detik

    let html = `
        <div class="accessories-header" style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 6px 0;">🎩 Aksesoris yang Sedang Dipakai</h3>
            <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">
                Hanya bisa memakai <b>1 aksesoris untuk setiap kategori</b>. Aksesoris yang baru dipasang tidak dapat dilepas selama 6 jam.
            </p>
            <div style="background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 8px; padding: 10px 16px; font-weight: bold; color: #0369a1; display: inline-flex; align-items: center; gap: 8px;">
                <span>✨ Total Akumulasi Bonus Panen:</span>
                <span style="font-size: 16px; color: #0284c7;">+${totalBonus}%</span>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px;">
    `;

    KATEGORI_AKSESORIS.forEach(kat => {
        const idTerpasang = gameState.accessoriesTerpasang[kat.id];
        const itemTerpasang = idTerpasang ? GAME_DATABASE.accessories[idTerpasang] : null;
        
        let teksDeskripsi = "Tanpa Efek Khusus";
        let statusLepas = true;
        let sisaWaktuStr = "";

        if (itemTerpasang) {
            teksDeskripsi = formatDeskripsiEfek(itemTerpasang);
            
            // Cek durasi cooldown 6 jam
            const waktuPasang = gameState.waktuPasangAksesoris[kat.id] || 0;
            const selisihWaktu = waktuSekarang - waktuPasang;
            if (selisihWaktu < durasiCooldown) {
                statusLepas = false;
                const sisaDetik = durasiCooldown - selisihWaktu;
                const jamSisa = Math.floor(sisaDetik / 3600);
                const menitSisa = Math.floor((sisaDetik % 3600) / 60);
                sisaWaktuStr = `(Terkunci: ${jamSisa}j ${menitSisa}m)`;
            }
        }

        html += `
            <div style="background: ${itemTerpasang ? '#f0fdf4' : '#f8fafc'}; border: 2px solid ${itemTerpasang ? '#86efac' : '#e2e8f0'}; border-radius: 12px; padding: 14px; text-align: center;">
                <p style="font-size: 12px; font-weight: bold; color: #64748b; margin: 0 0 6px 0; text-transform: uppercase;">
                    ${kat.icon} ${kat.nama}
                </p>
                <div style="font-size: 32px; margin-bottom: 6px;">
                    ${itemTerpasang ? itemTerpasang.icon : '⚪'}
                </div>
                <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 13px; color: ${itemTerpasang ? '#15803d' : '#94a3b8'};">
                    ${itemTerpasang ? itemTerpasang.nama : 'Kosong'}
                </p>
                ${itemTerpasang ? `
                    <p style="font-size: 10px; color: #475569; margin: 0 0 8px 0; line-height: 1.3;">${teksDeskripsi}</p>${statusLepas ? `
                        <button onclick="lepasAksesoris('${kat.id}')" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">
                            Lepas
                        </button>
                    ` : `
                        <p style="font-size: 10px; color: #dc2626; font-weight: bold; margin: 0;">🔒 ${sisaWaktuStr}</p>
                    `}
                ` : `
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">Belum dipakai</p>
                `}
            </div>
        `;
    });

    html += `</div>`;

    // KOLEKSI
    html += `
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px;">
            <h3 style="margin: 0 0 6px 0;">📦 Koleksi Aksesoris Milikmu</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Pilih aksesoris untuk dipasang.</p>
    `;

    KATEGORI_AKSESORIS.forEach(kat => {
        html += `
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 10px 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
                    ${kat.icon} Kategori: ${kat.nama}
                </h4>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        `;

        let adaKoleksiKategori = false;
        Object.entries(gameState.inventory.accessories).forEach(([idAcc, jumlah]) => {
            const dataAcc = GAME_DATABASE.accessories[idAcc];
            if (jumlah > 0 && dataAcc && dataAcc.kategori === kat.id) {
                adaKoleksiKategori = true;
                const sedangDipakai = gameState.accessoriesTerpasang[kat.id] === idAcc;
                const teksDeskripsiItem = formatDeskripsiEfek(dataAcc);

                html += `
                    <div style="background: white; border: 1px solid ${sedangDipakai ? '#22c55e' : '#cbd5e1'}; border-radius: 8px; padding: 10px 14px; width: 200px; text-align: center;">
                        <span style="font-size: 26px;">${dataAcc.icon}</span>
                        <p style="font-weight: bold; margin: 4px 0 2px 0; font-size: 13px;">${dataAcc.nama}</p>
                        <p style="font-size: 10px; color: #475569; margin: 0 0 8px 0; line-height: 1.2; min-height: 28px;">${teksDeskripsiItem}</p>
                        <button onclick="togglePakaiAksesoris('${idAcc}')" style="padding: 4px 10px; background: ${sedangDipakai ? '#64748b' : '#2563eb'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">
                            ${sedangDipakai ? 'Sedang Dipakai' : 'Pakai'}
                        </button>
                    </div>
                `;
            }
        });

        if (!adaKoleksiKategori) {
            html += `<p style="font-size: 12px; color: #94a3b8; font-style: italic; margin: 4px 0;">Belum memiliki aksesoris kategori ${kat.nama}.</p>`;
        }

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// 2. TAB: TOKO AKSESORIS
// ==========================================
let subTabTokoAksesorisAktif = 'kepala';

function switchSubTabToko(kategoriId) {
    subTabTokoAksesorisAktif = kategoriId;
    renderTokoAccessories();
}

function renderTokoAccessories() {
    const container = document.getElementById("tab-toko-aksesoris");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    let html = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                <h3 style="margin: 0;">🛍️ Toko Aksesoris Petani</h3>
                <span style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: bold;">
                    🏷️ Fluktuasi Beli: ${typeof MarketEconomy !== 'undefined' ? MarketEconomy.getPersentaseBeli() : '0%'}
                </span>
            </div>
            <p style="font-size: 14px; color: #475569; margin: 0 0 14px 0;">Beli aksesoris keren untuk meningkatkan hasil pertanian dan peternakan.</p>

            <div class="sub-nav" style="display: flex; gap: 8px; flex-wrap: wrap;">
    `;

    KATEGORI_AKSESORIS.forEach(kat => {
        const isActive = subTabTokoAksesorisAktif === kat.id;
        html += `
            <button onclick="switchSubTabToko('${kat.id}')" class="sub-tab-btn ${isActive ? 'active' : ''}" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: ${isActive ? '#2563eb' : 'white'}; color: ${isActive ? 'white' : '#334155'}; cursor: pointer; font-weight: bold; font-size: 12px;">
                ${kat.icon} ${kat.nama}
            </button>
        `;
    });

    html += `</div></div>`;

    const katData = KATEGORI_AKSESORIS.find(k => k.id === subTabTokoAksesorisAktif) || KATEGORI_AKSESORIS[0];

    html += `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 18px;">
            <h4 style="margin: 0 0 14px 0; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">
                ${katData.icon} Pilihan Aksesoris: ${katData.nama}
            </h4>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
    `;

    const itemsKategori = Object.values(GAME_DATABASE.accessories).filter(item => item.kategori === katData.id);

    itemsKategori.forEach(item => {
        const jumlahDimiliki = (gameState.inventory.accessories && gameState.inventory.accessories[item.id]) || 0;
        const sudahDimiliki = jumlahDimiliki > 0;
        const hargaBeliAktif = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getHargaBeli(item.hargaBeli) : item.hargaBeli;
        const teksDeskripsiToko = formatDeskripsiEfek(item);

        html += `
            <div style="background: white; border: 1px solid ${sudahDimiliki ? '#86efac' : '#bfdbfe'}; border-radius: 10px; padding: 14px; width: 210px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                <div style="font-size: 30px; margin-bottom: 4px;">${item.icon}</div>
                <p style="font-weight: bold; margin: 4px 0 2px 0; font-size: 13px;">${item.nama}</p>
                <p style="font-size: 10px; color: #475569; margin: 0 0 6px 0; line-height: 1.2; min-height: 32px;">${teksDeskripsiToko}</p>
                <p style="color: #2563eb; font-weight: bold; font-size: 13px; margin: 0 0 4px 0;">Rp ${hargaBeliAktif.toLocaleString()}</p>
                <p style="font-size: 11px; color: ${sudahDimiliki ? '#16a34a' : '#64748b'}; font-weight: bold; margin: 0 0 8px 0;">
                    ${sudahDimiliki ? '✅ Dimiliki' : 'Belum Dimiliki'}
                </p>
                ${sudahDimiliki ? `
                    <button disabled style="padding: 6px 14px; background: #cbd5e1; color: #475569; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; width: 100%; cursor: not-allowed;">
                        Dimiliki
                    </button>
                ` : `
                    <button onclick="bukaModalBeliItem('accessories', '${item.id}',${hargaBeliAktif}, '${item.nama.replace(/'/g, "\\'")}', '${item.icon}')" style="padding: 6px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                        Beli
                    </button>
                `}
            </div>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
}

// ==========================================
// 3. FUNGSI EQUIP / UNEQUIP DENGAN COOLDOWN 6 JAM
// ==========================================
function togglePakaiAksesoris(idItem) {
    if (!gameState.accessoriesTerpasang || Array.isArray(gameState.accessoriesTerpasang)) {
        hitungTotalBonusAksesoris();
    }
    if (!gameState.waktuPasangAksesoris) {
        gameState.waktuPasangAksesoris = {};
    }

    const item = GAME_DATABASE.accessories[idItem];
    if (!item || !item.kategori) return;

    const kat = item.kategori;
    
    // Jika diklik pada item yang sedang terpasang, cek dulu durasi cooldown 6 jam
    if (gameState.accessoriesTerpasang[kat] === idItem) {
        const waktuPasang = gameState.waktuPasangAksesoris[kat] || 0;
        const waktuSekarang = Math.floor(Date.now() / 1000);
        const durasiCooldown = 6 * 3600; // 6 Jam

        if (waktuSekarang - waktuPasang < durasiCooldown) {
            const sisaDetik = durasiCooldown - (waktuSekarang - waktuPasang);
            const jamSisa = Math.floor(sisaDetik / 3600);
            const menitSisa = Math.floor((sisaDetik % 3600) / 60);
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️️ Aksesoris ini baru dipakai! Baru bisa dilepas dalam ${jamSisa} jam ${menitSisa} menit.`);
            }
            return;
        }

        // Jika sudah lebih dari 6 jam, boleh dilepas
        gameState.accessoriesTerpasang[kat] = null;
        gameState.waktuPasangAksesoris[kat] = null;
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`Aksesoris ${item.nama} berhasil dilepas.`);
        }
    } else {
        // Memakai aksesoris baru, catat waktu pasang saat ini
        gameState.accessoriesTerpasang[kat] = idItem;
        gameState.waktuPasangAksesoris[kat] = Math.floor(Date.now() / 1000);
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`✨ Aksesoris ${item.nama} berhasil dipakai! Terkunci selama 6 jam.`);
        }
    }

    renderAccessories();
    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    if (typeof simpanGame === 'function') simpanGame();
}

function lepasAksesoris(kategoriId) {
    if (!gameState.accessoriesTerpasang || !gameState.waktuPasangAksesoris) return;
    
    const idItem = gameState.accessoriesTerpasang[kategoriId];
    if (!idItem) return;

    const waktuPasang = gameState.waktuPasangAksesoris[kategoriId] || 0;
    const waktuSekarang = Math.floor(Date.now() / 1000);
    const durasiCooldown = 6 * 3600; // 6 Jam

    if (waktuSekarang - waktuPasang < durasiCooldown) {
        const sisaDetik = durasiCooldown - (waktuSekarang - waktuPasang);
        const jamSisa = Math.floor(sisaDetik / 3600);
        const menitSisa = Math.floor((sisaDetik % 3600) / 60);
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Aksesoris terkunci! Baru bisa dilepas setelah ${jamSisa} jam ${menitSisa} menit.`);
        }
        return;
    }

    const item = GAME_DATABASE.accessories[idItem];
    gameState.accessoriesTerpasang[kategoriId] = null;
    gameState.waktuPasangAksesoris[kategoriId] = null;
    
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`Aksesoris ${item ? item.nama : ''} berhasil dilepas.`);
    }
    
    renderAccessories();
    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    if (typeof simpanGame === 'function') simpanGame();
}
