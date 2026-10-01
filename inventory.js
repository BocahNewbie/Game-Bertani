// INVENTORY.JS - Logika Pengelolaan & Tampilan Inventory Berdasarkan Kategori

function renderInventory() {
    const container = document.getElementById("tab-inventory"); // Sesuaikan dengan ID container halaman inventory di HTML kamu
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    let html = `
        <div class="inventory-header" style="margin-bottom: 20px;">
            <h3>Tas Inventory Kamu</h3>
            <p style="font-size: 14px; color: #475569;">Semua barang hasil beli, panen, dan ternak tersimpan di sini.</p>
        </div>
        <div class="inventory-categories" style="display: flex; flex-direction: column; gap: 20px;">
    `;

    // 1. Kategori: Bibit Tanaman
    html += renderKategoriBox("🌱 Bibit Tanaman", gameState.inventory.bibit);

    // 2. Kategori: Pupuk & Pakan
    html += renderKategoriBox("🧪 Pupuk & Pakan", gameState.inventory.pupukPakan);

    // 3. Kategori: Hasil Panen Pertanian
    html += renderKategoriBox("🌾 Hasil Panen", gameState.inventory.hasilPanen);

    // 4. Kategori: Hasil Ternak (Telur, Susu, Dll)
    html += renderKategoriBox("🥚 Hasil Ternak", gameState.inventory.hasilTernak);

    // 5. Kategori: Hewan Ternak di Kandang
    html += renderKandangBox("🐄 Hewan Ternak di Kandang", gameState.kandang);

    html += `</div>`;
    container.innerHTML = html;
}

// Fungsi pembantu untuk merender item berbasis jumlah/stok (Bibit, Pupuk, Hasil Panen, dll)
function renderKategoriBox(namaKategori, dataKategori) {
    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">${namaKategori}</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    `;

    if (!dataKategori || Object.keys(dataKategori).length === 0) {
        subHtml += `<p style="font-size: 13px; color: #94a3b8; font-style: italic;">Kosong</p>`;
    } else {
        Object.entries(dataKategori).forEach(([idItem, jumlah]) => {
            if (jumlah > 0) {
                subHtml += `
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 15px; min-width: 120px; text-align: center;">
                        <p style="font-weight: bold; margin: 0 0 5px 0; text-transform: capitalize;">${idItem}</p>
                        <p style="font-size: 14px; color: #16a34a; margin: 0; font-weight: 600;">Jumlah: ${jumlah}</p>
                    </div>
                `;
            }
        });
    }

    subHtml += `</div></div>`;
    return subHtml;
}

// Fungsi pembantu khusus untuk menampilkan hewan ternak di dalam kandang
function renderKandangBox(namaKategori, dataKandang) {
    let subHtml = `
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 15px;">
            <h4 style="margin-top: 0; margin-bottom: 10px; color: #1e293b; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px;">${namaKategori}</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
    `;

    let totalHewan = 0;
    if (dataKandang) {
        Object.values(dataKandang).forEach(arrayTernak => {
            if (Array.isArray(arrayTernak)) totalHewan += arrayTernak.length;
        });
    }

    if (!dataKandang || totalHewan === 0) {
        subHtml += `<p style="font-size: 13px; color: #94a3b8; font-style: italic;">Belum ada hewan di kandang</p>`;
    } else {
        Object.entries(dataKandang).forEach(([jenisTernak, listHewan]) => {
            if (listHewan && listHewan.length > 0) {
                subHtml += `
                    <div style="background: white; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 15px; min-width: 140px; text-align: center;">
                        <p style="font-weight: bold; margin: 0 0 5px 0; text-transform: capitalize;">${jenisTernak}</p>
                        <p style="font-size: 14px; color: #2563eb; margin: 0; font-weight: 600;">Total: ${listHewan.length} Ekor</p>
                    </div>
                `;
            }
        });
    }

    subHtml += `</div></div>`;
    return subHtml;
}
