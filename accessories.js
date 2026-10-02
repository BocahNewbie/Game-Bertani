// ACCESSORIES.JS - Logika Aksesoris Saya & Toko Aksesoris per Kategori
function hitungTotalBonusAksesoris() {
    let totalBonus = 0;
    if (!gameState.accessoriesTerpasang) {
        gameState.accessoriesTerpasang = { kepala: null, tangan: null, badan: null, kaki: null, telapak: null };
    }
    
    // Support jika masih format array lama
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
                // Ambil nilai dari bonus umum atau properti bonus spesifik lainnya
                const valBonus = item.bonus || item.bonusPanen || item.bonusHargaJualPanen || 0;
                totalBonus += (typeof valBonus === 'number' && valBonus < 5 ? Math.round(valBonus * 100) : valBonus);
            }
        }
    });
    return totalBonus;
}

// ==========================================
// 1. TAB: AKSESORIS SAYA (WARDROBE & KOLEKSI)
// ==========================================
function renderAccessories() {
    const container = document.getElementById("tab-aksesoris");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    if (!gameState.inventory.accessories) gameState.inventory.accessories = {};
    if (!gameState.accessoriesTerpasang || Array.isArray(gameState.accessoriesTerpasang)) {
        hitungTotalBonusAksesoris(); 
    }

    const totalBonus = hitungTotalBonusAksesoris();

    let html = `
        <div class="accessories-header" style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 6px 0;">🎩 Aksesoris yang Sedang Dipakai</h3>
            <p style="font-size: 14px; color: #475569; margin: 0 0 12px 0;">
                Hanya bisa memakai <b>1 aksesoris untuk setiap kategori</b> (Kepala, Tangan, Badan, Kaki, Telapak Kaki).
            </p>
            <div style="background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 8px; padding: 10px 16px; font-weight: bold; color: #0369a1; display: inline-flex; align-items: center; gap: 8px;">
                <span>✨ Total Akumulasi Bonus:</span>
                <span style="font-size: 16px; color: #0284c7;">+${totalBonus}%</span>
            </div>
        </div>

        <!-- 5 SLOT KATEGORI TERPASANG -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px;">
    `;

    KATEGORI_AKSESORIS.forEach(kat => {
        const idTerpasang = gameState.accessoriesTerpasang[kat.id];
        const itemTerpasang = idTerpasang ? GAME_DATABASE.accessories[idTerpasang] : null;
        
        let labelBonus = "Tanpa Bonus Khusus";
        if (itemTerpasang) {
            const b = itemTerpasang.bonus || itemTerpasang.bonusPanen || itemTerpasang.bonusTernak || itemTerpasang.bonusPanenAbsolut || 0;
            const formatB = (typeof b === 'number' && b < 5 && b > 0) ? `+${Math.round(b*100)}%` : `+${b}`;
            labelBonus = `Bonus: ${formatB}`;
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
                    <p style="font-size: 11px; color: #16a34a; font-weight: bold; margin: 0 0 8px 0;">${labelBonus}</p>
                    <button onclick="lepasAksesoris('${kat.id}')" style="padding: 4px 10px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold;">
                        Lepas
                    </button>
                ` : `
                    <p style="font-size: 11px; color: #94a3b8; margin: 0;">Belum dipakai</p>
                `}
            </div>
        `;
    });

    html += `</div>`;

    // 2. KOLEKSI SAYA PER KATEGORI
    html += `
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px;">
            <h3 style="margin: 0 0 6px 0;">📦 Koleksi Aksesoris Milikmu</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0;">Pilih aksesoris yang ingin dipakai. Memakai aksesoris baru akan menggantikan yang sedang terpasang di kategori yang sama.</p>
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
                
                const bCol = dataAcc.bonus || dataAcc.bonusPanen || dataAcc.bonusTernak || dataAcc.bonusPanenAbsolut || 0;
                const formatBCol = (typeof bCol === 'number' && bCol < 5 && bCol > 0) ? `+${Math.round(bCol*100)}%` : `+${bCol}`;

                html += `
                    <div style="background: white; border: 1px solid ${sedangDipakai ? '#22c55e' : '#cbd5e1'}; border-radius: 8px; padding: 10px 14px; min-width: 140px; text-align: center;">
                        <span style="font-size: 26px;">${dataAcc.icon}</span>
                        <p style="font-weight: bold; margin: 4px 0 2px 0; font-size: 13px;">${dataAcc.nama}</p>
                        <p style="font-size: 11px; color: #16a34a; font-weight: bold; margin: 0 0 6px 0;">Bonus: ${formatBCol}</p>
                        <button onclick="togglePakaiAksesoris('${idAcc}')" style="padding: 4px 10px; background: ${sedangDipakai ? '#ef4444' : '#2563eb'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">
                            ${sedangDipakai ? 'Lepas' : 'Pakai'}
                        </button>
                    </div>
                `;
            }
        });

        if (!adaKoleksiKategori) {
            html += `<p style="font-size: 12px; color: #94a3b8; font-style: italic; margin: 4px 0;">Belum memiliki aksesoris kategori ${kat.nama}. Beli di Toko Aksesoris!</p>`;
        }

        html += `</div></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// ==========================================
// 2. TAB: TOKO AKSESORIS (BELI PER KATEGORI)
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
            <p style="font-size: 14px; color: #475569; margin: 0 0 14px 0;">Aksesoris buat bergaya dan menambah bonus.</p>

            <!-- SUB-NAV KATEGORI TOKO -->
            <div class="sub-nav" style="display: flex; gap: 8px; flex-wrap: wrap;">
    `;

    KATEGORI_AKSESORIS.forEach(kat => {
        const isActive = subTabTokoAksesorisAktif === kat.id;
        html += `
            <button onclick="switchSubTabToko('${kat.id}')" class="sub-tab-btn ${isActive ? 'active' : ''}">
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

        const bToko = item.bonus || item.bonusPanen || item.bonusTernak || item.bonusPanenAbsolut || 0;
        const formatBToko = (typeof bToko === 'number' && bToko < 5 && bToko > 0) ? `+${Math.round(bToko*100)}%` : `+${bToko}`;

        html += `
            <div style="background: white; border: 1px solid ${sudahDimiliki ? '#86efac' : '#bfdbfe'}; border-radius: 10px; padding: 16px; min-width: 160px; max-width: 200px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.03);">
                <div style="font-size: 32px; margin-bottom: 6px;">${item.icon}</div>
                <p style="font-weight: bold; margin: 4px 0; font-size: 14px;">${item.nama}</p>
                <p style="font-size: 12px; color: #16a34a; font-weight: bold; margin: 0 0 6px 0;">Bonus: ${formatBToko}</p>
                <p style="color: #2563eb; font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">Rp ${hargaBeliAktif.toLocaleString()}</p>
                <p style="font-size: 12px; color: ${sudahDimiliki ? '#16a34a' : '#64748b'}; font-weight: bold; margin: 0 0 10px 0;">
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
// 3. FUNGSI EQUIPPING / PASANG AKSESORIS
// ==========================================
function togglePakaiAksesoris(idItem) {
    if (!gameState.accessoriesTerpasang || Array.isArray(gameState.accessoriesTerpasang)) {
        hitungTotalBonusAksesoris();
    }
    const item = GAME_DATABASE.accessories[idItem];
    if (!item || !item.kategori) return;

    const kat = item.kategori;
    if (gameState.accessoriesTerpasang[kat] === idItem) {
        // Lepas item
        gameState.accessoriesTerpasang[kat] = null;
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`Aksesoris ${item.nama} dilepas dari slot ${kat}.`);
        }
    } else {
        // Pasang item (otomatis menggantikan yang ada di kategori tersebut)
        const itemSebelumnya = gameState.accessoriesTerpasang[kat] ? GAME_DATABASE.accessories[gameState.accessoriesTerpasang[kat]] : null;
        gameState.accessoriesTerpasang[kat] = idItem;
        if (typeof tampilkanToast === 'function') {
            if (itemSebelumnya) {
                tampilkanToast(`✨ ${item.nama} dipakai (menggantikan ${itemSebelumnya.nama} di ${kat})!`);
            } else {
                tampilkanToast(`✨ Aksesoris ${item.nama} berhasil dipakai di ${kat}!`);
            }
        }
    }

    renderAccessories();
    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    if (typeof simpanGame === 'function') simpanGame();
}

function lepasAksesoris(kategoriId) {
    if (!gameState.accessoriesTerpasang) return;
    const idItem = gameState.accessoriesTerpasang[kategoriId];
    if (idItem) {
        const item = GAME_DATABASE.accessories[idItem];
        gameState.accessoriesTerpasang[kategoriId] = null;
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`Aksesoris ${item ? item.nama : idItem} dilepas.`);
        }
        renderAccessories();
        if (typeof updateHeaderStats === 'function') updateHeaderStats();
        if (typeof simpanGame === 'function') simpanGame();
    }
}
