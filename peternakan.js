// PETERNAKAN.JS - Logika Kandang Hewan Ternak (Ayam, Sapi, Domba) & Batas Kapasitas Awal 2 Ekor

function renderPeternakan() {
    const container = document.getElementById("tab-peternakan"); // Sesuaikan dengan ID container halaman peternakan di HTML kamu
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    // Pastikan struktur state kandang sudah siap untuk 3 jenis hewan ini dengan kapasitas awal 2
    if (!gameState.kandang) gameState.kandang = {};
    
    const jenisTernakList = [
        { id: 'ayam', nama: 'Kandang Ayam', icon: '🐔' },
        { id: 'sapi', nama: 'Kandang Sapi', icon: '🐮' },
        { id: 'domba', nama: 'Kandang Domba', icon: '🐑' }
    ];

    let html = `
        <div class="peternakan-header" style="margin-bottom: 20px;">
            <h3>Area Peternakan & Kandang</h3>
            <p style="font-size: 14px; color: #475569;">Rawat hewan ternakmu dan kumpulkan hasil produksinya di sini.</p>
        </div>
        <div class="grid-kandang" style="display: flex; flex-direction: column; gap: 20px;">
    `;

    jenisTernakList.forEach(jenis => {
        // Ambil data hewan di kandang tersebut, default array kosong
        if (!gameState.kandang[jenis.id]) gameState.kandang[jenis.id] = [];
        let listHewan = gameState.kandang[jenis.id];
        
        // Batas kapasitas kandang awal adalah 2 (bisa ditambah lewat ekspansi nantinya)
        let maxKapasitas = gameState.kapasitasKandang ? (gameState.kapasitasKandang[jenis.id] || 2) : 2;

        html += `
            <div style="background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 10px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #1e293b;">${jenis.icon} ${jenis.nama}</h4>
                    <span style="font-size: 13px; font-weight: bold; color: #475569; background: #e2e8f0; padding: 3px 8px; border-radius: 6px;">
                        Kapasitas: ${listHewan.length} / ${maxKapasitas} Ekor
                    </span>
                </div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
        `;

        if (listHewan.length === 0) {
            html += `<p style="font-size: 13px; color: #94a3b8; font-style: italic; margin: 5px 0;">Kandang ini masih kosong. Beli hewan di Pasar!</p>`;
        } else {
            listHewan.forEach((hewan, idx) => {
                html += `
                    <div style="background: white; border: 1px solid #94a3b8; border-radius: 8px; padding: 10px 12px; min-width: 130px; text-align: center;">
                        <p style="font-weight: bold; margin: 0 0 4px 0; text-transform: capitalize;">${jenis.id} #${idx + 1}</p>
                        <p style="font-size: 12px; color: #16a34a; margin: 0 0 8px 0; font-weight: 600;">Status: ${hewan.status || 'Sehat'}</p>
                        <button onclick="panenHasilTernak('${jenis.id}', ${idx})" style="padding: 4px 8px; background: #16a34a; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold;">Ambil Hasil</button>
                    </div>
                `;
            });
        }

        html += `
                </div>
                <button onclick="beriPakanTernak('${jenis.id}')" style="padding: 6px 12px; background: #d97706; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">
                    🌾 Beri Pakan ${jenis.nama}
                </button>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// --- FUNGSI AKSI PETERNAKAN ---

// Memberi pakan pada jenis ternak tertentu
function beriPakanTernak(jenisTernak) {
    if (!gameState.inventory || !gameState.inventory.pupukPakan) {
        alert("Kamu tidak memiliki pakan di inventory!");
        return;
    }

    // Cari pakan yang sesuai di inventory
    let idPakan = `pakan_${jenisTernak}`; // Asumsi ID pakan di database disesuaikan, misal 'pakan_ayam'
    // Atau kita cari jenis pakan apa saja yang tersedia jika format key berbeda
    let stokPakan = 0;
    
    // Cek langsung key pakan yang cocok
    for (let key in gameState.inventory.pupukPakan) {
        if (key.includes(jenisTernak) || key.includes('pakan')) {
            if (gameState.inventory.pupukPakan[key] > 0) {
                idPakan = key;
                stokPakan = gameState.inventory.pupukPakan[key];
                break;
            }
        }
    }

    if (stokPakan <= 0) {
        alert(`Kamu tidak memiliki pakan untuk ${jenisTernak}! Beli terlebih dahulu di Pasar.`);
        return;
    }

    let listHewan = gameState.kandang[jenisTernak];
    if (!listHewan || listHewan.length === 0) {
        alert(`Tidak ada hewan di dalam ${jenisTernak} untuk diberi pakan!`);
        return;
    }

    // Kurangi 1 pakan
    gameState.inventory.pupukPakan[idPakan] -= 1;

    // Ubah status hewan menjadi kenyang/siap produksi
    listHewan.forEach(hewan => {
        hewan.status = "Kenyang / Siap Panen";
    });

    alert(`Berhasil memberi pakan ${jenisTernak}! Hewan-hewan menjadi sehat dan siap menghasilkan produk.`);
    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
}

// Memanen hasil dari hewan ternak (Telur, Susu, Wol, dll)
function panenHasilTernak(jenisTernak, indexHewan) {
    let hewan = gameState.kandang[jenisTernak][indexHewan];
    if (!hewan) return;

    if (hewan.status !== "Kenyang / Siap Panen") {
        alert("Hewan ini belum diberi pakan atau belum waktunya menghasilkan produk! Beri pakan terlebih dahulu.");
        return;
    }

    // Tentukan jenis hasil ternak berdasarkan jenis hewannya
    let hasilId = "telur";
    if (jenisTernak === 'ayam') hasilId = "telur";
    else if (jenisTernak === 'sapi') hasilId = "susu";
    else if (jenisTernak === 'domba') hasilId = "wol";

    // Masukkan ke inventory hasil ternak
    if (!gameState.inventory.hasilTernak) gameState.inventory.hasilTernak = {};
    gameState.inventory.hasilTernak[hasilId] = (gameState.inventory.hasilTernak[hasilId] || 0) + 1;

    // Kembalikan status hewan normal setelah dipanen
    hewan.status = "Sehat";

    alert(`Berhasil memanen dari ${jenisTernak} #${indexHewan + 1}! Mendapatkan 1 buah ${hasilId}.`);
    renderPeternakan();
    if (typeof renderInventory === 'function') renderInventory();
}
