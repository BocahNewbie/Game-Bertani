// PERTANIAN.JS - Logika Lahan & Penanaman Maksimal 99 Bibit
function renderPertanian() {
    renderLahan();
    renderPupukPertanian();
}

function renderLahan() {
    const container = document.getElementById("subtab-lahan");
    if (!container || !window.gameState) return;
    
    let html = `<h3>Lahan Pertanian (Total Petak: ${gameState.lahan.length} / ${gameState.kapasitas.lahan})</h3>`;
    html += `<div class="grid-container" style="display: flex; gap: 15px; flex-wrap: wrap;">`;
    
    gameState.lahan.forEach((petak, index) => {
        let infoTanaman = petak.tanaman ? `${petak.tanaman.toUpperCase()} (${petak.jumlah}/99)` : "Tanah Kosong";
        html += `
            <div class="petak-card" style="border: 2px solid #cbd5e1; padding: 15px; border-radius: 8px; min-width: 150px; background: #f8fafc; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 5px;">🌱 Lahan #${index + 1}</p>
                <p style="color: #475569; font-size: 14px;">${infoTanaman}</p>
                <small style="color: #0284c7; display: block; margin-top: 5px;">Status: ${petak.status}</small>
                <button onclick="bukaMenuTanam(${index})" style="margin-top: 10px; padding: 5px 10px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer;">Kelola Lahan</button>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderPupukPertanian() {
    const container = document.getElementById("subtab-pupuk-tani");
    if (!container) return;
    container.innerHTML = `<h3>Manajemen Pupuk Tanaman</h3><p>Gunakan pupuk untuk mempercepat waktu panen di lahan.</p>`;
}

// Fungsi interaksi saat tombol "Kelola Lahan" diklik
function bukaMenuTanam(index) {
    const petak = gameState.lahan[index];

    if (petak.tanaman === null) {
        // Jika kosong, tawarkan pilihan bibit dari inventory (Contoh pakai Padi)
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
        // Jika sudah ada tanaman, opsi panen atau cek status
        alert(`Lahan ini ditanami ${petak.tanaman} sebanyak ${petak.jumlah} buah. Status: ${petak.status}`);
    }
}
