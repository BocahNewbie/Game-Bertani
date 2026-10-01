// PASAR.JS - Logika Tab Pasar & Transaksi Jual Beli
function renderPasar() {
    renderPasarBibit();
    renderPasarPupukPakan();
    renderPasarTernak();
    renderPasarEkspansi();
}

// 1. Sub-Kategori: Pasar Bibit
function renderPasarBibit() {
    const container = document.getElementById("subtab-pasar-bibit");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    let html = `<h3>Pasar Bibit Tanaman</h3><div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    Object.values(GAME_DATABASE.tanaman).forEach(item => {
        html += `
            <div class="petak-card" style="border: 2px solid #bfdbfe; padding: 15px; border-radius: 10px; min-width: 160px; background: #eff6ff; text-align: center;">
                <span style="font-size: 28px;">${item.icon}</span>
                <p style="font-weight: bold; margin: 5px 0;">${item.nama}</p>
                <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Harga: Rp ${item.hargaBeli}</p>
                <button onclick="beliBarangPasar('bibit', '${item.id}', ${item.hargaBeli})" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Beli Bibit</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 2. Sub-Kategori: Pasar Pupuk & Pakan
function renderPasarPupukPakan() {
    const container = document.getElementById("subtab-pasar-pupuk-pakan");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    let html = `<h3>Pasar Pupuk & Pakan Ternak</h3><div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    // Gabungkan pupuk dan pakan untuk ditampilkan di pasar
    const listLogistik = { ...GAME_DATABASE.pupuk, ...GAME_DATABASE.pakan };

    Object.values(listLogistik).forEach(item => {
        html += `
            <div class="petak-card" style="border: 2px solid #bfdbfe; padding: 15px; border-radius: 10px; min-width: 160px; background: #eff6ff; text-align: center;">
                <span style="font-size: 28px;">${item.icon}</span>
                <p style="font-weight: bold; margin: 5px 0;">${item.nama}</p>
                <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Harga: Rp ${item.hargaBeli}</p>
                <button onclick="beliBarangPasar('pupukPakan', '${item.id}', ${item.hargaBeli})" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Beli</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 3. Sub-Kategori: Pasar Hewan Ternak
function renderPasarTernak() {
    const container = document.getElementById("subtab-pasar-ternak");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    let html = `<h3>Pasar Hewan Ternak</h3><div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    Object.values(GAME_DATABASE.ternak).forEach(item => {
        html += `
            <div class="petak-card" style="border: 2px solid #bfdbfe; padding: 15px; border-radius: 10px; min-width: 160px; background: #eff6ff; text-align: center;">
                <span style="font-size: 28px;">${item.icon}</span>
                <p style="font-weight: bold; margin: 5px 0;">${item.nama}</p>
                <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Harga: Rp ${item.hargaBeli}</p>
                <button onclick="beliBarangPasar('ternak', '${item.id}', ${item.hargaBeli})" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Beli Ternak</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// 4. Sub-Kategori: Pasar Ekspansi (Lahan maks 10 petak & Kandang)
function renderPasarEkspansi() {
    const container = document.getElementById("subtab-pasar-ekspansi");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    let html = `<h3>Pasar Ekspansi & Perluasan</h3><div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    Object.values(GAME_DATABASE.ekspansi).forEach(item => {
        let infoLimit = item.id === 'lahan' ? ` (Saat ini: ${gameState.lahan.length}/${item.maxLimit})` : "";
        html += `
            <div class="petak-card" style="border: 2px solid #bfdbfe; padding: 15px; border-radius: 10px; min-width: 180px; background: #eff6ff; text-align: center;">
                <p style="font-weight: bold; margin: 5px 0;">🏗️ ${item.nama}</p>
                <p style="color: #475569; font-size: 13px; margin-bottom: 4px;">${infoLimit}</p>
                <p style="color: #475569; font-size: 14px; margin-bottom: 8px;">Biaya: Rp ${item.hargaBeli}</p>
                <button onclick="beliEkspansi('${item.id}', ${item.hargaBeli}, ${item.maxLimit})" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Ekspansi</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

// --- FUNGSI EKSEKUSI TRANSAKSI DI PASAR ---
function beliBarangPasar(kategori, idItem, harga) {
    if (gameState.koin < harga) {
        alert("Koin kamu tidak mencukupi untuk membeli barang ini!");
        return;
    }

    // Kurangi koin pemain
    gameState.koin -= harga;

    // Masukkan barang ke inventory sesuai kategori
    if (kategori === 'bibit') {
        gameState.inventory.bibit[idItem] = (gameState.inventory.bibit[idItem] || 0) + 1;
        alert(`Berhasil membeli 1 buah bibit ${idItem}!`);
    } else if (kategori === 'pupukPakan') {
        gameState.inventory.pupukPakan[idItem] = (gameState.inventory.pupukPakan[idItem] || 0) + 1;
        alert(`Berhasil membeli 1 unit logistik (${idItem})!`);
    } else if (kategori === 'ternak') {
        if (!gameState.kandang[idItem]) gameState.kandang[idItem] = [];
        gameState.kandang[idItem].push({ nama: idItem, status: "Sehat" });
        alert(`Berhasil membeli 1 ekor ${idItem} dan memasukkannya ke kandang!`);
    }

    // Perbarui tampilan jika fungsi render lain aktif
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof renderPertanian === 'function') renderPertanian();
    console.log(`Sisa koin: ${gameState.koin}`);
}

// Fungsi khusus transaksi ekspansi (misal: tambah petak lahan sampai batas 10)
function beliEkspansi(tipe, harga, maxLimit) {
    if (gameState.koin < harga) {
        alert("Koin kamu tidak mencukupi untuk melakukan ekspansi!");
        return;
    }

    if (tipe === 'lahan') {
        if (gameState.lahan.length >= maxLimit) {
            alert(`Lahan pertanian sudah mencapai batas maksimal yaitu ${maxLimit} petak!`);
            return;
        }

        gameState.koin -= harga;
        // Tambah 1 petak lahan baru ke state
        gameState.lahan.push({ id: gameState.lahan.length + 1, tanaman: null, jumlah: 0, status: "Kosong", pupukAktif: null, waktuTanam: 0 });
        
        alert(`Berhasil memperluas lahan! Total petak sekarang: ${gameState.lahan.length}`);
        renderPasarEkspansi();
        if (typeof renderPertanian === 'function') renderPertanian();
    } else {
        alert(`Fitur ekspansi ${tipe} akan segera diaktifkan!`);
    }
}
