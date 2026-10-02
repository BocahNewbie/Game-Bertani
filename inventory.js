// INVENTORY.JS - Logika Tas Inventory & Penjualan Hasil dengan Pilihan Jumlah

let itemJualSedangDipilih = null;

function getSellingPrice(tipe, idItem) {
    let basePrice = 200;
    if (tipe === 'hasilPanen') {
        basePrice = GAME_DATABASE.tanaman[idItem]?.hargaJual || 250;
    } else if (tipe === 'hasilTernak') {
        if (idItem === 'telur') basePrice = 300;
        else if (idItem === 'susu') basePrice = 800;
        else if (idItem === 'wol') basePrice = 600;
        else basePrice = 250;
    }
    
    // Hitung bonus dari aksesoris terpasang
    let bonusAcc = 0;
    if (typeof hitungTotalBonusAksesoris === 'function') {
        bonusAcc = hitungTotalBonusAksesoris();
    }
    
    let multiplier = (typeof MarketEconomy !== 'undefined' ? MarketEconomy.multiplier : 1.0) * (1 + bonusAcc / 100);
    return Math.floor(basePrice * multiplier);
}

function renderInventory() {
    const container = document.getElementById("tab-inventory");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    const persenJualVal = typeof MarketEconomy !== 'undefined' ? Math.round((MarketEconomy.multiplier - 1.0) * 100) : 0;
    const persenJual = (persenJualVal >= 0 ? `+${persenJualVal}%` : `${persenJualVal}%`);
    const warnaPersen = persenJualVal >= 0 ? '#166534' : '#dc2626';
    const bgPersen = persenJualVal >= 0 ? '#f0fdf4' : '#fef2f2';
    const borderPersen = persenJualVal >= 0 ? '#bbf7d0' : '#fecaca';

    let html = `
        <div class="inventory-header" style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                <h3 style="margin: 0;">🎒 Tas Inventory Kamu</h3>
                <div style="background: ${bgPersen}; border: 1px solid ${borderPersen}; border-radius: 8px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: ${warnaPersen};">
                    <span>📈 Fluktuasi Jual Pasar: <b>${persenJual}</b> (-70% s.d +21%)</span>
                </div>
            </div>
            <p style="font-size: 14px; color: #475569; margin: 0;">Semua barang hasil panen dan ternak mengikuti fluktuasi harga jual pasar global secara realtime (-70% s.d +21%).</p>
        </div>
        <div class="inventory-categories" style="display: flex; flex-direction: column; gap: 20px;">
    `;

    // 1. Kategori: Bibit Tanaman
    html += renderKategoriBox("🌱 Bibit Tanaman", gameState.inventory.bibit, false, 'bibit');

    // 2. Kategori: Pupuk Pertanian (Dipisahkan)
    html += renderKategoriBox("🧪 Pupuk Pertanian", gameState.inventory.pupuk, false, 'pupuk');

    // 3. Kategori: Pakan Ternak (Dipisahkan)
    html += renderKategoriBox("🌾 Pakan Ternak", gameState.inventory.pakan, false, 'pakan');

    // 4. Kategori: Obat & Kesuburan Ternak
    html += renderKategoriBox("💊 Obat Kesuburan Ternak", gameState.inventory.obat, false, 'obat');

    // 5. Kategori: Hasil Panen Pertanian (bisa dijual!)
    html += renderKategoriBox("🌾 Hasil Panen (Bisa Dijual)", gameState.inventory.hasilPanen, true, 'hasilPanen');

    // 6. Kategori: Hasil Ternak (bisa dijual & ditetaskan!)
    html += renderKategoriBox("🥚 Hasil Ternak (Bisa Dijual / Ditetaskan)", gameState.inventory.hasilTernak, true, 'hasilTernak');

    html += `</div>`;
    container.innerHTML = html;
}

// Fungsi pembantu untuk merender item berbasis jumlah/stok
function renderKategoriBox(namaKategori, dataKategori, bisaDijual = false, tipeKategori = '') {
    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px;">
            <h4 style="margin-top: 0; margin-bottom: 12px; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">${namaKategori}</h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    `;

    let adaItem = false;
    const persenJualVal = typeof MarketEconomy !== 'undefined' ? Math.round((MarketEconomy.multiplier - 1.0) * 100) : 0;
    const persenJual = (persenJualVal >= 0 ? `+${persenJualVal}%` : `${persenJualVal}%`);

    if (dataKategori) {
        Object.entries(dataKategori).forEach(([idItem, jumlah]) => {
            if (jumlah > 0) {
                adaItem = true;
                const hargaSatuan = bisaDijual ? getSellingPrice(tipeKategori, idItem) : 0;
                
                // Cari icon item jika ada
                let iconItem = '📦';
                if (tipeKategori === 'bibit' && GAME_DATABASE.tanaman[idItem]) iconItem = GAME_DATABASE.tanaman[idItem].icon;
                else if (tipeKategori === 'pupuk' && GAME_DATABASE.pupuk[idItem]) iconItem = GAME_DATABASE.pupuk[idItem].icon;
                else if (tipeKategori === 'pakan' && GAME_DATABASE.pakan[idItem]) iconItem = GAME_DATABASE.pakan[idItem].icon;
                else if (tipeKategori === 'obat' && GAME_DATABASE.obat[idItem]) iconItem = GAME_DATABASE.obat[idItem].icon;
                else if (idItem === 'telur') iconItem = '🥚';
                else if (idItem === 'susu') iconItem = '🥛';
                else if (idItem === 'wol') iconItem = '🧶';
                else if (GAME_DATABASE.tanaman[idItem]) iconItem = GAME_DATABASE.tanaman[idItem].icon;

                let namaTampil = idItem;
                if (GAME_DATABASE.tanaman[idItem]) namaTampil = GAME_DATABASE.tanaman[idItem].nama;
                else if (GAME_DATABASE.pupuk[idItem]) namaTampil = GAME_DATABASE.pupuk[idItem].nama;
                else if (GAME_DATABASE.pakan[idItem]) namaTampil = GAME_DATABASE.pakan[idItem].nama;
                else if (GAME_DATABASE.obat && GAME_DATABASE.obat[idItem]) namaTampil = GAME_DATABASE.obat[idItem].nama;

                subHtml += `
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 16px; min-width: 140px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <span style="font-size: 26px;">${iconItem}</span>
                        <p style="font-weight: bold; margin: 4px 0 2px 0; text-transform: capitalize; font-size: 14px;">${namaTampil}</p>
                        <p style="font-size: 13px; color: #16a34a; margin: 0 0 6px 0; font-weight: 600;">Stok: ${jumlah}</p>
                        ${bisaDijual ? `
                            <button onclick="bukaModalJualItem('${tipeKategori}', '${idItem}', ${jumlah}, ${hargaSatuan}, '${namaTampil.replace(/'/g, "\\'")}', '${iconItem}')" style="padding: 6px 12px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%;">
                                Jual (Rp ${hargaSatuan.toLocaleString()}/pcs) <span style="font-size: 10px; opacity: 0.9;">(${persenJual})</span>
                            </button>
                        ` : ''}
                        ${idItem === 'telur' ? `
                            <button onclick="masukkanTelurKeInkubasi(1)" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: bold; width: 100%; margin-top: 6px;">
                                🥚 Masukkan Inkubasi
                            </button>
                        ` : ''}
                    </div>
                `;
            }
        });
    }

    if (!adaItem) {
        subHtml += `<p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 4px 0;">Tidak ada barang</p>`;
    }

    subHtml += `</div></div>`;
    return subHtml;
}

// ==========================================
// MODAL JUAL DENGAN PILIHAN JUMLAH REALTIME
// ==========================================
function bukaModalJualItem(tipeKategori, idItem, stok, hargaSatuan, namaItem, icon) {
    const hargaAktif = getSellingPrice(tipeKategori, idItem);
    itemJualSedangDipilih = {
        tipeKategori,
        idItem,
        stok,
        hargaSatuan: hargaAktif,
        namaItem,
        icon
    };

    const modal = document.getElementById("modal-jual");
    const title = document.getElementById("modal-jual-title");
    const info = document.getElementById("modal-jual-info");
    const input = document.getElementById("input-jumlah-jual");

    const persenJualVal = typeof MarketEconomy !== 'undefined' ? Math.round((MarketEconomy.multiplier - 1.0) * 100) : 0;
    const persenJual = (persenJualVal >= 0 ? `+${persenJualVal}%` : `${persenJualVal}%`);

    if (modal && input) {
        if (title) title.innerText = `${icon} Jual ${namaItem}`;
        if (info) info.innerText = `Harga: Rp ${hargaAktif.toLocaleString()} / unit (${persenJual}) | Stok dimiliki: ${stok} buah`;
        input.value = 1;
        input.min = 1;
        input.max = stok;
        hitungTotalJual();
        modal.style.display = "flex";
    }
}

function tutupModalJual() {
    const modal = document.getElementById("modal-jual");
    if (modal) modal.style.display = "none";
    itemJualSedangDipilih = null;
}

function hitungTotalJual() {
    if (!itemJualSedangDipilih) return;
    const input = document.getElementById("input-jumlah-jual");
    const elTotal = document.getElementById("modal-jual-total");
    const qty = parseInt(input ? input.value : 1) || 1;
    const currentPrice = getSellingPrice(itemJualSedangDipilih.tipeKategori, itemJualSedangDipilih.idItem);
    itemJualSedangDipilih.hargaSatuan = currentPrice;
    const totalHarga = qty * currentPrice;
    if (elTotal) {
        elTotal.innerText = `Total Pendapatan: Rp ${totalHarga.toLocaleString()} (${qty} item)`;
    }
}

function validasiInputJual() {
    if (!itemJualSedangDipilih) return;
    const input = document.getElementById("input-jumlah-jual");
    if (!input) return;
    let val = parseInt(input.value) || 1;
    if (val < 1) val = 1;
    if (val > itemJualSedangDipilih.stok) val = itemJualSedangDipilih.stok;
    input.value = val;
    hitungTotalJual();
}

function ubahJumlahJual(delta) {
    if (!itemJualSedangDipilih) return;
    const input = document.getElementById("input-jumlah-jual");
    if (!input) return;
    let val = (parseInt(input.value) || 1) + delta;
    if (val < 1) val = 1;
    if (val > itemJualSedangDipilih.stok) val = itemJualSedangDipilih.stok;
    input.value = val;
    hitungTotalJual();
}

function setJumlahJualMaks() {
    if (!itemJualSedangDipilih) return;
    const input = document.getElementById("input-jumlah-jual");
    if (!input) return;
    input.value = itemJualSedangDipilih.stok;
    hitungTotalJual();
}

function eksekusiJualItemModal() {
    if (!itemJualSedangDipilih) return;
    const input = document.getElementById("input-jumlah-jual");
    const jumlahJual = parseInt(input ? input.value : 1) || 1;
    const { tipeKategori, idItem, stok, namaItem } = itemJualSedangDipilih;

    if (jumlahJual > stok) {
        if (typeof tampilkanToast === 'function') tampilkanToast("⚠️ Jumlah melebihi stok yang kamu miliki!");
        return;
    }

    const hargaSatuanAktif = getSellingPrice(tipeKategori, idItem);
    const totalPendapatan = jumlahJual * hargaSatuanAktif;
    gameState.inventory[tipeKategori][idItem] -= jumlahJual;
    gameState.koin += totalPendapatan;

    tutupModalJual();
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`💰 Berhasil menjual ${jumlahJual} ${namaItem} seharga Rp ${totalPendapatan.toLocaleString()}!`);
    }

    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}
