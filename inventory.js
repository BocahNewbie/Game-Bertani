// INVENTORY.JS - Penyimpanan Hasil & Logistik
function renderInventory() {
    const cPanen = document.getElementById("subtab-inv-panen");
    if (cPanen) cPanen.innerHTML = "<h3>Inventory: Hasil Panen</h3><p>Belum ada hasil panen tersimpan.</p>";

    const cTernak = document.getElementById("subtab-inv-ternak");
    if (cTernak) cTernak.innerHTML = "<h3>Inventory: Hasil Ternak</h3><p>Belum ada hasil ternak tersimpan.</p>";

    const cLogistik = document.getElementById("subtab-inv-logistik");
    if (cLogistik) {
        const stokUrea = gameState.inventory.pupukPakan.biasa || 0;
        const stokSuper = gameState.inventory.pupukPakan.super || 0;
        
        cLogistik.innerHTML = `
            <h3>Inventory: Pupuk & Pakan Ternak</h3>
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
                <p>• Pupuk Urea: <b>${stokUrea}</b> sak</p>
                <p>• Pupuk Super: <b>${stokSuper}</b> sak</p>
            </div>
        `;
    }
}
