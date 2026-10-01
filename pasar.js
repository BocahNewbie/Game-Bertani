// PASAR.JS - Logika Toko & Transaksi

function renderPasar() {
    const container = document.getElementById("tab-pasar");
    if (!container || typeof GAME_DATABASE === 'undefined') return;

    let html = `
        <div style="margin-bottom: 20px;">
            <h3>Pasar Desa</h3>
            <p style="font-size: 14px; color: #475569;">Beli kebutuhan bercocok tanam, hewan ternak, pupuk, atau perluas lahanmu di sini.</p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
    `;

    // 1. Bibit
    html += renderKategoriPasar("Bibit Tanaman", GAME_DATABASE.tanaman, 'bibit');
    // 2. Pupuk & Pakan
    html += renderKategoriPasar("Pupuk & Pakan", { ...GAME_DATABASE.pupuk, ...GAME_DATABASE.pakan }, 'pupukPakan');
    // 3. Ternak
    html += renderKategoriPasar("Hewan Ternak", GAME_DATABASE.ternak, 'ternak');
    // 4. Ekspansi
    html += renderKategoriPasar("Ekspansi & Perluasan", GAME_DATABASE.ekspansi, 'ekspansi');

    html += `</div>`;
    container.innerHTML = html;
}

function renderKategoriPasar(judul, dataItem, tipeKategori) {
    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 15px;">
            <h4 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">${judul}</h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    `;

    Object.values(dataItem).forEach(item => {
        subHtml += `
            <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; min-width: 150px; text-align: center;">
                <span style="font-size: 26px;">${item.icon || '📦'}</span>
                <p style="font-weight: bold; margin: 6px 0 4px 0;">${item.nama}</p>
                <p style="color: #475569; font-size: 13px; margin-bottom: 8px;">Harga: Rp ${item.hargaBeli.toLocaleString()}</p>
                <button onclick="beliDariPasar('${tipeKategori}', '${item.id}', ${item.hargaBeli})" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: bold;">Beli</button>
            </div>
        `;
    });

    subHtml += `</div></div>`;
    return subHtml;
}

function beliDariPasar(kategori, idItem, harga) {
    if (gameState.koin < harga) {
        tampilkanModal("Uang Tidak Cukup", "Koin kamu tidak mencukupi untuk membeli barang ini!", false, 1, null);
        return;
    }

    if (kategori === 'ekspansi') {
        if (idItem === 'lahan') {
            if (gameState.lahan.length >= 10) {
                tampilkanModal("Batas Maksimal", "Lahan pertanian sudah mencapai batas maksimal (10 petak)!", false, 1, null);
                return;
            }
            gameState.koin -= harga;
            gameState.lahan.push({
                id: gameState.lahan.length + 1,
                tanaman: null,
                jumlah: 0,
                status: "Kosong",
                pupukAktif: null,
                waktuTanam: 0
            });
            tampilkanModal("Berhasil!", "Berhasil memperluas 1 petak lahan baru!", false, 1, null);
        } else if (idItem === 'kandang') {
            gameState.koin -= harga;
            gameState.kapasitasKandang.ayam += 2;
            gameState.kapasitasKandang.sapi += 2;
            gameState.kapasitasKandang.domba += 2;
            tampilkanModal("Berhasil!", "Kapasitas semua kandang bertambah +2 ekor!", false, 1, null);
        }
    } else if (kategori === 'ternak') {
        let maxCap = gameState.kapasitasKandang[idItem] || 2;
        if (gameState.kandang[idItem].length >= maxCap) {
            tampilkanModal("Kandang Penuh", `Kandang ${idItem} sudah penuh (Maks: ${maxCap} ekor)! Beli ekspansi kandang jika ingin menambah.`, false, 1, null);
            return;
        }
        gameState.koin -= harga;
        gameState.kandang[idItem].push({ status: "Sehat" });
        tampilkanModal("Berhasil!", `Berhasil membeli 1 ekor ${idItem} ke kandang!`, false, 1, null);
    } else {
        // Bibit atau Pupuk/Pakan
        gameState.koin -= harga;
        if (kategori === 'bibit') {
            gameState.inventory.bibit[idItem] = (gameState.inventory.bibit[idItem] || 0) + 1;
        } else {
            gameState.inventory.pupukPakan[idItem] = (gameState.inventory.pupukPakan[idItem] || 0) + 1;
        }
        tampilkanModal("Berhasil!", `Berhasil membeli 1 buah ${idItem}!`, false, 1, null);
    }

    updateHeaderStats();
    if (typeof renderInventory === 'function') renderInventory();
}
