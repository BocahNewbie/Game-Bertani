// PASAR.JS - Logika Toko Desa & Transaksi dengan Pilihan Jumlah dan Fluktuasi Harga Beli

let itemBeliSedangDipilih = null;

function renderPasar() {
    const container = document.getElementById("tab-pasar");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    if (!gameState.hargaEkspansi) {
        gameState.hargaEkspansi = {
            lahan: 650000,
            kandang_ayam: 250000,
            kandang_sapi: 750000,
            kandang_domba: 450000
        };
    }

    const persenBeli = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getPersentaseBeli() : '0%';
    const persenJualVal = typeof MarketEconomy !== 'undefined' ? Math.round((MarketEconomy.multiplier - 1.0) * 100) : 0;
    const persenJual = (persenJualVal >= 0 ? `+${persenJualVal}%` : `${persenJualVal}%`);

    let html = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                <h3 style="margin: 0;">🛒 Pasar Desa</h3>
                <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 6px 14px; display: inline-flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 600;">
                    <span style="color: #1e40af;">🏷️ Fluktuasi Beli: <b style="color: ${(typeof MarketEconomy !== 'undefined' && MarketEconomy.buyMultiplier > 1) ? '#dc2626' : '#16a34a'};">${persenBeli}</b> (-2% s.d +50%)</span>
                    <span style="color: #cbd5e1;">|</span>
                    <span style="color: #166534;">📈 Fluktuasi Jual: <b>${persenJual}</b> (-70% s.d +21%)</span>
                </div>
            </div>
            <p style="font-size: 14px; color: #475569; margin: 0;">Harga beli barang di pasar (termasuk hewan ternak) berfluktuasi.</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
    `;

    // 1. Bibit Tanaman
    html += renderKategoriPasar("🌱 Bibit Tanaman", GAME_DATABASE.tanaman, 'bibit');
    
    // 2. Pupuk Pertanian
    html += renderKategoriPasar("🧪 Pupuk Pertanian", GAME_DATABASE.pupuk, 'pupuk');

    // 3. Pakan Ternak
    html += renderKategoriPasar("🌾 Pakan Ternak", GAME_DATABASE.pakan, 'pakan');

    // 4. Obat & Kesuburan Ternak
    if (GAME_DATABASE.obat) {
        html += renderKategoriPasar("💊 Obat & Kesuburan Ternak", GAME_DATABASE.obat, 'obat');
    }

    // 5. Hewan Ternak
    html += renderKategoriPasar("🐾 Hewan Ternak", GAME_DATABASE.ternak, 'ternak');

    // 6. Ekspansi & Perluasan (Dibeli 1 per 1, harga naik 674%)
    html += renderKategoriPasar("🏗️ Ekspansi & Perluasan (Satu per Satu)", GAME_DATABASE.ekspansi, 'ekspansi');

    html += `</div>`;
    container.innerHTML = html;
}

function renderKategoriPasar(judul, dataItem, tipeKategori) {
    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 16px;">
            <h4 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px;">${judul}</h4>
            <div style="display: flex; gap: 14px; flex-wrap: wrap;">
    `;

    Object.values(dataItem).forEach(item => {
        let infoTambahan = "";
        let hargaBeliAktif = item.hargaBeli;

        if (tipeKategori === 'ekspansi') {
            hargaBeliAktif = (gameState.hargaEkspansi && gameState.hargaEkspansi[item.id]) ? gameState.hargaEkspansi[item.id] : item.hargaBeli;
            infoTambahan = `<p style="font-size: 11px; color: #b45309; font-weight: bold; margin: 0 0 6px 0;">Beli 1 unit (Naik 674% berikutnya)</p>`;
        } else {
            // Hitung harga beli dengan fluktuasi
            hargaBeliAktif = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getHargaBeli(item.hargaBeli) : item.hargaBeli;
            if (item.deskripsi) {
                infoTambahan = `<p style="font-size: 11px; color: #64748b; margin: 0 0 6px 0;">${item.deskripsi}</p>`;
            } else if (item.hasilPanen) {
                infoTambahan = `<p style="font-size: 11px; color: #16a34a; margin: 0 0 6px 0;">Produksi: ${item.hasilPanen}</p>`;
            }
        }

        const persenBeliVal = typeof MarketEconomy !== 'undefined' ? Math.round(((MarketEconomy.buyMultiplier || 1.0) - 1.0) * 100) : 0;
        const persenBeliText = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getPersentaseBeli() : '0%';
        const warnaPersenBeli = persenBeliVal > 0 ? '#dc2626' : (persenBeliVal < 0 ? '#16a34a' : '#64748b');

        subHtml += `
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; min-width: 150px; max-width: 180px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 28px;">${item.icon || '📦'}</span>
                <p style="font-weight: bold; margin: 6px 0 4px 0; font-size: 14px;">${item.nama}</p>
                ${infoTambahan}
                <p style="color: #2563eb; font-weight: bold; font-size: 13px; margin-bottom: 8px;">
                    Rp ${hargaBeliAktif.toLocaleString()}
                    ${tipeKategori !== 'ekspansi' ? `<span style="font-size: 11px; font-weight: 600; color: ${warnaPersenBeli};">(${persenBeliText})</span>` : ''}
                </p>
                ${tipeKategori === 'ekspansi' ? `
                    <button onclick="beliSatuEkspansi('${item.id}', '${item.nama.replace(/'/g, "\\'")}')" style="padding: 6px 14px; background: #0284c7; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                        Beli 1 Unit
                    </button>
                ` : `
                    <button onclick="bukaModalBeliItem('${tipeKategori}', '${item.id}', ${hargaBeliAktif}, '${item.nama.replace(/'/g, "\\'")}', '${item.icon || '📦'}')" style="padding: 6px 10px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold; width: 100%;">
                        Beli (Rp ${hargaBeliAktif.toLocaleString()}) <span style="font-size: 10px; opacity: 0.95;">[${persenBeliText}]</span>
                    </button>
                `}
            </div>
        `;
    });

    subHtml += `</div></div>`;
    return subHtml;
}

// ==========================================
// PEMBELIAN SATU PER SATU UNTUK PERLUASAN (NAIK 674%)
// ==========================================
function beliSatuEkspansi(idItem, namaItem) {
    if (!gameState.hargaEkspansi) {
        gameState.hargaEkspansi = {
            lahan: 650000,
            kandang_ayam: 250000,
            kandang_sapi: 750000,
            kandang_domba: 450000,
            inkubasi: 65000
        };
    }

    const hargaBeli = gameState.hargaEkspansi[idItem] || (GAME_DATABASE.ekspansi[idItem]?.hargaBeli || 1000);

    // Cek batas limit
    if (idItem === 'lahan') {
        const maxLimit = GAME_DATABASE.ekspansi.lahan.maxLimit || 10;
        if (gameState.lahan.length >= maxLimit) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️ Lahan pertanian sudah mencapai batas maksimal (${maxLimit} petak)!`);
            }
            return;
        }
    } else if (idItem.startsWith('kandang_') || idItem === 'kandang') {
        const jenis = idItem.replace('kandang_', '');
        const capSekarang = gameState.kapasitasKandang[jenis] || 2;
        const maxCap = GAME_DATABASE.ekspansi[idItem]?.maxLimit || 10;
        if (capSekarang >= maxCap) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️ Kapasitas kandang ${jenis} sudah mencapai batas maksimal (${maxCap} ekor)!`);
            }
            return;
        }
    } else if (idItem === 'inkubasi') {
        const capSekarang = gameState.kapasitasInkubasi || 1;
        const maxCap = GAME_DATABASE.ekspansi.inkubasi?.maxLimit || 8;
        if (capSekarang >= maxCap) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️ Kapasitas mesin inkubasi sudah mencapai batas maksimal (${maxCap} slot)!`);
            }
            return;
        }
    }

    // Cek koin
    if (gameState.koin < hargaBeli) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Koin tidak mencukupi! Dibutuhkan Rp ${hargaBeli.toLocaleString()}.`);
        }
        return;
    }

    // Kurangi koin
    gameState.koin -= hargaBeli;

    // Terapkan ekspansi
    if (idItem === 'lahan') {
        gameState.lahan.push({
            id: gameState.lahan.length + 1,
            tanaman: null,
            jumlah: 0,
            status: "Kosong",
            pupukAktif: null,
            waktuTanam: 0
        });
    } else if (idItem.startsWith('kandang_') || idItem === 'kandang') {
        const jenis = idItem.replace('kandang_', '');
        gameState.kapasitasKandang[jenis] = (gameState.kapasitasKandang[jenis] || 2) + 2;
    } else if (idItem === 'inkubasi') {
        gameState.kapasitasInkubasi = (gameState.kapasitasInkubasi || 1) + 1;
    }

    // Harga perluasan selanjutnya naik 674% dari harga terakhir: hargaBaru = round(hargaBeli * 6.74)
    const hargaBerikutnya = Math.round(hargaBeli * 6.74);
    gameState.hargaEkspansi[idItem] = hargaBerikutnya;

    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🎉 Berhasil memperluas 1 unit ${namaItem}! Harga selanjutnya menjadi Rp ${hargaBerikutnya.toLocaleString()}.`);
    }

    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    if (typeof renderPasar === 'function') renderPasar();
    if (typeof renderPertanian === 'function') renderPertanian();
    if (typeof renderPeternakan === 'function') renderPeternakan();
    if (typeof simpanGame === 'function') simpanGame();
}

// ==========================================
// MODAL BELI DENGAN PILIHAN JUMLAH (BIBIT, PUPUK, PAKAN, TERNAK)
// ==========================================
function bukaModalBeliItem(kategori, idItem, hargaBeli, namaItem, icon) {
    // Cek jika aksesoris sudah dimiliki
    if (kategori === 'accessories') {
        const sudahDimiliki = (gameState.inventory.accessories && gameState.inventory.accessories[idItem] > 0);
        if (sudahDimiliki) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️ Aksesoris ${namaItem} sudah kamu miliki dan tidak bisa dibeli lagi!`);
            }
            return;
        }
    }

    if (gameState.koin < hargaBeli) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Koin kamu tidak mencukupi untuk membeli barang ini!");
        }
        return;
    }

    // Tentukan batas maksimal beli (maksimal di batas 999 unit)
    let maxAffordable = Math.floor(gameState.koin / hargaBeli);
    let maxBisaBeli = Math.min(999, maxAffordable);

    if (kategori === 'ternak') {
        const maxCap = gameState.kapasitasKandang[idItem] || 2;
        const hewanSekarang = (gameState.kandang[idItem] || []).length;
        const sisaKapasitas = maxCap - hewanSekarang;
        if (sisaKapasitas <= 0) {
            if (typeof tampilkanToast === 'function') {
                tampilkanToast(`⚠️ Kandang ${idItem} sudah penuh (Maks: ${maxCap} ekor)! Perbesar kandang terlebih dahulu.`);
            }
            return;
        }
        maxBisaBeli = Math.min(maxBisaBeli, sisaKapasitas);
    } else if (kategori === 'accessories') {
        maxBisaBeli = 1; // Aksesoris hanya bisa dibeli 1
    }

    itemBeliSedangDipilih = {
        kategori,
        idItem,
        hargaBeli,
        namaItem,
        icon,
        maxBisaBeli: Math.min(999, Math.max(1, maxBisaBeli))
    };

    const modal = document.getElementById("modal-beli");
    const title = document.getElementById("modal-beli-title");
    const info = document.getElementById("modal-beli-info");
    const input = document.getElementById("input-jumlah-beli");

    const persenBeliText = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getPersentaseBeli() : '0%';

    if (modal && input) {
        if (title) title.innerText = `${icon} Beli ${namaItem}`;
        if (info) info.innerText = `Harga: Rp ${hargaBeli.toLocaleString()} / unit (${persenBeliText}) | Maksimal beli: ${itemBeliSedangDipilih.maxBisaBeli} (Koin: Rp ${gameState.koin.toLocaleString()})`;
        input.value = 1;
        input.min = 1;
        input.max = itemBeliSedangDipilih.maxBisaBeli;
        hitungTotalBeli();
        modal.style.display = "flex";
    }
}

function tutupModalBeli() {
    const modal = document.getElementById("modal-beli");
    if (modal) modal.style.display = "none";
    itemBeliSedangDipilih = null;
}

function hitungTotalBeli() {
    if (!itemBeliSedangDipilih) return;
    const input = document.getElementById("input-jumlah-beli");
    const elTotal = document.getElementById("modal-beli-total");
    let qty = parseInt(input ? input.value : 1) || 1;
    if (qty > 999) qty = 999;
    const totalHarga = qty * itemBeliSedangDipilih.hargaBeli;
    const persenBeliText = typeof MarketEconomy !== 'undefined' ? MarketEconomy.getPersentaseBeli() : '0%';
    if (elTotal) {
        elTotal.innerText = `Total Biaya: Rp ${totalHarga.toLocaleString()} (${qty} item) [${persenBeliText}]`;
    }
}

function validasiInputBeli() {
    if (!itemBeliSedangDipilih) return;
    const input = document.getElementById("input-jumlah-beli");
    if (!input) return;
    let val = parseInt(input.value) || 1;
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    if (val > itemBeliSedangDipilih.maxBisaBeli) val = itemBeliSedangDipilih.maxBisaBeli;
    input.value = val;
    hitungTotalBeli();
}

function ubahJumlahBeli(delta) {
    if (!itemBeliSedangDipilih) return;
    const input = document.getElementById("input-jumlah-beli");
    if (!input) return;
    let val = (parseInt(input.value) || 1) + delta;
    if (val < 1) val = 1;
    if (val > 999) val = 999;
    if (val > itemBeliSedangDipilih.maxBisaBeli) val = itemBeliSedangDipilih.maxBisaBeli;
    input.value = val;
    hitungTotalBeli();
}

function setJumlahBeliMaks() {
    if (!itemBeliSedangDipilih) return;
    const input = document.getElementById("input-jumlah-beli");
    if (!input) return;
    input.value = Math.min(999, itemBeliSedangDipilih.maxBisaBeli);
    hitungTotalBeli();
}

function eksekusiBeliItem() {
    if (!itemBeliSedangDipilih) return;
    const input = document.getElementById("input-jumlah-beli");
    let jumlahBeli = parseInt(input ? input.value : 1) || 1;
    if (jumlahBeli < 1) jumlahBeli = 1;
    if (jumlahBeli > 999) jumlahBeli = 999;
    if (jumlahBeli > itemBeliSedangDipilih.maxBisaBeli) jumlahBeli = itemBeliSedangDipilih.maxBisaBeli;
    const totalHarga = jumlahBeli * itemBeliSedangDipilih.hargaBeli;

    if (gameState.koin < totalHarga) {
        if (typeof tampilkanToast === 'function') tampilkanToast("⚠️ Koin tidak mencukupi!");
        return;
    }

    const { kategori, idItem, namaItem } = itemBeliSedangDipilih;

    // Proteksi aksesoris tidak bisa dibeli 2x
    if (kategori === 'accessories' && gameState.inventory.accessories && gameState.inventory.accessories[idItem] > 0) {
        if (typeof tampilkanToast === 'function') tampilkanToast("⚠️ Aksesoris ini sudah kamu miliki!");
        tutupModalBeli();
        return;
    }

    gameState.koin -= totalHarga;

    if (kategori === 'ternak') {
        if (!gameState.kandang[idItem]) gameState.kandang[idItem] = [];
        for (let i = 0; i < jumlahBeli; i++) {
            const nextIdx = gameState.kandang[idItem].length + 1;
            gameState.kandang[idItem].push({ 
                nama: `${idItem.toUpperCase()} #${nextIdx}`,
                status: "Lapar" 
            });
        }
        if (typeof tampilkanToast === 'function') tampilkanToast(`🐾 Berhasil membeli ${jumlahBeli} ekor ${namaItem}!`);
    } else if (kategori === 'bibit') {
        if (!gameState.inventory.bibit) gameState.inventory.bibit = {};
        gameState.inventory.bibit[idItem] = (gameState.inventory.bibit[idItem] || 0) + jumlahBeli;
        if (typeof tampilkanToast === 'function') tampilkanToast(`🌱 Berhasil membeli ${jumlahBeli} bibit ${namaItem}!`);
    } else if (kategori === 'pupuk') {
        if (!gameState.inventory.pupuk) gameState.inventory.pupuk = {};
        gameState.inventory.pupuk[idItem] = (gameState.inventory.pupuk[idItem] || 0) + jumlahBeli;
        if (typeof tampilkanToast === 'function') tampilkanToast(`🧪 Berhasil membeli ${jumlahBeli} ${namaItem}!`);
    } else if (kategori === 'pakan') {
        if (!gameState.inventory.pakan) gameState.inventory.pakan = {};
        gameState.inventory.pakan[idItem] = (gameState.inventory.pakan[idItem] || 0) + jumlahBeli;
        if (typeof tampilkanToast === 'function') tampilkanToast(`🌾 Berhasil membeli ${jumlahBeli} ${namaItem}!`);
    } else if (kategori === 'obat') {
        if (!gameState.inventory.obat) gameState.inventory.obat = {};
        gameState.inventory.obat[idItem] = (gameState.inventory.obat[idItem] || 0) + jumlahBeli;
        if (typeof tampilkanToast === 'function') tampilkanToast(`💊 Berhasil membeli ${jumlahBeli} ${namaItem}!`);
    } else if (kategori === 'accessories') {
        if (!gameState.inventory.accessories) gameState.inventory.accessories = {};
        gameState.inventory.accessories[idItem] = 1;
        if (typeof tampilkanToast === 'function') tampilkanToast(`🎩 Berhasil membeli ${namaItem}! Status: Dimiliki.`);
    }

    tutupModalBeli();
    if (typeof updateHeaderStats === 'function') updateHeaderStats();
    if (typeof renderPasar === 'function') renderPasar();
    if (typeof renderTokoAccessories === 'function') renderTokoAccessories();
    if (typeof renderAccessories === 'function') renderAccessories();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}
