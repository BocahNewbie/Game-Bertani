// PERTANIAN.JS - Logika Lahan & Pemupukan Massal
function renderPertanian() {
    renderLahan();
    renderPupukPertanian();
}

function renderLahan() {
    const container = document.getElementById("subtab-lahan");
    if (!container || !window.gameState) return;
    
    // Ambil stok pupuk dari inventory secara sinkron
    const stokUrea = gameState.inventory.pupukPakan.biasa || 0;
    const stokSuper = gameState.inventory.pupukPakan.super || 0;

    let html = `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <h4 style="margin: 0 0 5px 0; color: #1e3a8a;">🧪 Stok Pupuk Tersedia di Inventory:</h4>
                <span style="margin-right: 15px;">• Pupuk Urea: <b>${stokUrea}</b></span>
                <span>• Pupuk Super: <b>${stokSuper}</b></span>
            </div>
            <div>
                <button onclick="gunakanPupukSemuaLahan('biasa')" style="padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-right: 5px;">Pupuk Semua (Urea)</button>
                <button onclick="gunakanPupukSemuaLahan('super')" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Pupuk Semua (Super)</button>
            </div>
        </div>
    `;

    html += `<h3>Lahan Pertanian (Total Petak: ${gameState.lahan.length} / ${gameState.kapasitas.lahan})</h3>`;
    html += `<div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    gameState.lahan.forEach((petak, index) => {
        let infoTanaman = petak.tanaman ? `${petak.tanaman.toUpperCase()} (${petak.jumlah}/99)` : "Tanah Kosong";
        let statusPupuk = petak.pupukAktif ? `✨ ${petak.pupukAktif}` : "Belum Dipupuk";
        
        html += `
            <div class="petak-card" style="border: 2px solid #bfdbfe; padding: 15px; border-radius: 10px; min-width: 170px; background: #eff6ff; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 5px; color: #1e293b;">🌱 Lahan #${index + 1}</p>
                <p style="color: #475569; font-size: 14px;">${infoTanaman}</p>
                <small style="color: #0284c7; display: block; margin-top: 5px;">Status: ${petak.status}</small>
                <small style="color: #d97706; display: block; margin-top: 2px;">Efek: ${statusPupuk}</small>
                <button onclick="bukaMenuTanam(${index})" style="margin-top: 10px; padding: 6px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Kelola Lahan</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderPupukPertanian() {
    const container = document.getElementById("subtab-pupuk-tani");
    if (!container) return;
    container.innerHTML = `<h3>Manajemen Pupuk Tanaman</h3><p>Gunakan pupuk untuk mempercepat waktu panen di seluruh lahan sekaligus.</p>`;
}

// Fungsi kelola/tanam pada satu petak (maksimal 99 bibit)
function bukaMenuTanam(index) {
    const petak = gameState.lahan[index];

    if (petak.tanaman === null) {
        let jumlahTanam = prompt(`Lahan #${index + 1} kosong.\nMasukkan jumlah bibit Padi yang ingin ditanam (Maksimal 99):`, "1");
        jumlahTanam = parseInt(jumlahTanam);

        if (isNaN(jumlahTanam) || jumlahTanam <= 0) return;

        if (jumlahTanam > 99) {
            alert("Maksimal menanam adalah 99 bibit per petak lahan!");
            return;
        }

        if (gameState.inventory.bibit.padi >= jumlahTanam) {
            gameState.inventory.bibit.padi -= jumlahTanam;
            petak.tanaman = "padi";
            petak.jumlah = jumlahTanam;
            petak.status = "Sedang Tumbuh";
            
            alert(`Berhasil menanam ${jumlahTanam} bibit Padi di Lahan #${index + 1}!`);
            renderLahan();
        } else {
            alert("Bibit Padi di inventory kamu tidak mencukupi!");
        }
    } else {
        alert(`Lahan ini ditanami ${petak.tanaman} sebanyak ${petak.jumlah} buah. Status: ${petak.status}`);
    }
}

// Fungsi memberikan efek pupuk ke SEMUA LAHAN SEKALIGUS (sinkron dengan inventory)
function gunakanPupukSemuaLahan(jenisPupuk) {
    const stok = gameState.inventory.pupukPakan[jenisPupuk] || 0;

    if (stok <= 0) {
        alert(`Stok ${jenisPupuk === 'biasa' ? 'Pupuk Urea' : 'Pupuk Super'} di inventory kamu habis! Beli terlebih dahulu di Pasar.`);
        return;
    }

    // Kurangi 1 stok pupuk dari inventory pusat
    gameState.inventory.pupukPakan[jenisPupuk] -= 1;

    // Terapkan efek pupuk ke seluruh petak lahan yang ada
    gameState.lahan.forEach(petak => {
        petak.pupukAktif = jenisPupuk === 'biasa' ? 'Pupuk Urea' : 'Pupuk Super';
    });

    alert(`Berhasil menggunakan 1 buah ${jenisPupuk === 'biasa' ? 'Pupuk Urea' : 'Pupuk Super'} untuk SEMUA lahan!`);
    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
}
