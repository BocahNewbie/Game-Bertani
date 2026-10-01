// ACCESSORIES.JS - Logika Pengelolaan & Tampilan Aksesoris / Item Tambahan

function renderAccessories() {
    const container = document.getElementById("tab-accessories"); // Sesuaikan dengan ID container halaman aksesoris di HTML kamu
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    let html = `
        <div class="accessories-header" style="margin-bottom: 20px;">
            <h3>Toko & Koleksi Aksesoris</h3>
            <p style="font-size: 14px; color: #475569;">Percantik area pertanian atau tingkatkan fitur spesial dengan aksesoris menarik.</p>
        </div>
        <div class="grid-accessories" style="display: flex; flex-direction: column; gap: 20px;">
    `;

    // Pastikan struktur state aksesoris tersedia
    if (!gameState.inventory.accessories) gameState.inventory.accessories = {};
    if (!gameState.accessoriesTerpasang) gameState.accessoriesTerpasang = [];

    // 1. Bagian Daftar Aksesoris yang Dimiliki / Bisa Dipasang
    html += `
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 10px; padding: 15px;">
            <h4 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Aksesoris Saya</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
    `;

    let totalAksesorisDimiliki = Object.values(gameState.inventory.accessories).reduce((a, b) => a + b, 0);

    if (totalAksesorisDimiliki === 0) {
        html += `<p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 5px 0;">Kamu belum memiliki aksesoris. Beli di bawah ini!</p>`;
    } else {
        Object.entries(gameState.inventory.accessories).forEach(([idAcc, jumlah]) => {
            if (jumlah > 0) {
                let isTerpasang = gameState.accessoriesTerpasang.includes(idAcc);
                html += `
                    <div style="background: white; border: 1px solid #94a3b8; border-radius: 8px; padding: 10px 15px; min-width: 140px; text-align: center;">
                        <p style="font-weight: bold; margin: 0 0 5px 0; text-transform: capitalize;">${idAcc}</p>
                        <p style="font-size: 13px; color: ${isTerpasang ? '#16a34a' : '#475569'}; margin: 0 0 8px 0; font-weight: 600;">
                            ${isTerpasang ? '✨ Terpasang' : `Miliki: ${jumlah}`}
                        </p>
                        <button onclick="togglePasangAksesoris('${idAcc}')" style="padding: 4px 10px; background: ${isTerpasang ? '#dc2626' : '#2563eb'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">
                            ${isTerpasang ? 'Lepas' : 'Pasang'}
                        </button>
                    </div>
                `;
            }
        });
    }

    html += `</div></div>`;

    // 2. Bagian Toko Pembelian Aksesoris (jika ada database aksesoris)
    html += `
        <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 10px; padding: 15px;">
            <h4 style="margin-top: 0; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Toko Aksesoris</h4>
            <div style="display: flex; gap: 15px; flex-wrap: wrap;">
    `;

    // Cek apakah database menyediakan kategori aksesoris
    const dbAccessories = GAME_DATABASE.accessories || GAME_DATABASE.aksesoris || {};
    
    if (Object.keys(dbAccessories).length === 0) {
        html += `<p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 5px 0;">Belum ada item aksesoris di database.</p>`;
    } else {
        Object.values(dbAccessories).forEach(item => {
            html += `
                <div style="background: white; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; min-width: 150px; text-align: center;">
                    <span style="font-size: 24px;">${item.icon || '🎀'}</span>
                    <p style="font-weight: bold; margin: 5px 0;">${item.nama}</p>
                    <p style="color: #475569; font-size: 13px; margin-bottom: 8px;">Harga: Rp ${item.hargaBeli}</p>
                    <button onclick="beliAksesoris('${item.id}', ${item.hargaBeli})" style="padding: 6px 12px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 12px;">Beli</button>
                </div>
            `;
        });
    }

    html += `</div></div></div>`;
    container.innerHTML = html;
}

// --- FUNGSI AKSI AKSESORIS ---

function beliAksesoris(idItem, harga) {
    if (gameState.koin < harga) {
        alert("Koin kamu tidak mencukupi untuk membeli aksesoris ini!");
        return;
    }

    gameState.koin -= harga;
    if (!gameState.inventory.accessories) gameState.inventory.accessories = {};
    gameState.inventory.accessories[idItem] = (gameState.inventory.accessories[idItem] || 0) + 1;

    alert(`Berhasil membeli aksesoris ${idItem}!`);
    renderAccessories();
    if (typeof renderInventory === 'function') renderInventory();
}

function togglePasangAksesoris(idItem) {
    if (!gameState.accessoriesTerpasang) gameState.accessoriesTerpasang = [];

    const index = gameState.accessoriesTerpasang.indexOf(idItem);
    if (index > -1) {
        // Jika sudah terpasang, lepas
        gameState.accessoriesTerpasang.splice(index, 1);
        alert(`Aksesoris ${idItem} berhasil dilepas.`);
    } else {
        // Jika belum, pasang
        gameState.accessoriesTerpasang.push(idItem);
        alert(`Aksesoris ${idItem} berhasil dipasang!`);
    }

    renderAccessories();
}
