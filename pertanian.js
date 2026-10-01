// PERTANIAN.JS - Logika Utama Pertanian (Tanam, Kapasitas 99 Bibit, & Pupuk Menyeluruh)

function renderPertanian() {
    const container = document.getElementById("tab-pertanian"); // Sesuaikan dengan ID container halaman pertanian di HTML kamu
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    let html = `
        <div class="pertanian-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h3>Lahan Pertanian (${gameState.lahan.length} Petak Aktif)</h3>
            <button onclick="gunakanPupukMassal()" style="padding: 8px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                🧪 Gunakan Pupuk (Semua Lahan)
            </button>
        </div>
        <div class="grid-lahan" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
    `;

    gameState.lahan.forEach((petak, index) => {
        let statusTeks = "Kosong";
        let backgroundCard = "#f8fafc";
        
        if (petak.status === "Ditanam") {
            statusTeks = `Tanam: ${petak.tanaman} (${petak.jumlah}/99 bibit)`;
            backgroundCard = petak.pupukAktif ? "#dcfce7" : "#fef9c3"; // Hijau jika dipupuk, kuning jika tumbuh biasa
        }

        html += `
            <div class="petak-lahan-card" style="border: 2px solid #cbd5e1; padding: 15px; border-radius: 10px; background: ${backgroundCard}; text-align: center;">
                <p style="font-weight: bold; margin-bottom: 5px;">Petak Lahan #${petak.id}</p>
                <p style="font-size: 13px; color: #475569; margin-bottom: 10px;">Status: ${statusTeks}</p>
                ${petak.pupukAktif ? `<p style="font-size: 11px; color: #15803d; font-weight: bold; margin-bottom: 8px;">✨ Terpapar Pupuk</p>` : ``}
                
                ${petak.status === "Kosong" ? `
                    <button onclick="bukaModalTanam(${index})" style="padding: 6px 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Tanam Bibit</button>
                ` : `
                    <button onclick="panenLahan(${index})" style="padding: 6px 12px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Panen Hasil</button>
                `}
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

// --- FUNGSI AKSI PERTANIAN ---

// Membuka pilihan bibit untuk ditanam (Maksimal 99 bibit per petak)
function bukaModalTanam(indexPetak) {
    // Cek bibit apa saja yang ada di inventory
    const bibitTersedia = gameState.inventory.bibit;
    const daftarBibitKey = Object.keys(bibitTersedia).filter(key => bibitTersedia[key] > 0);

    if (daftarBibitKey.length === 0) {
        alert("Kamu tidak memiliki bibit di inventory! Beli dulu di Pasar.");
        return;
    }

    // Untuk simpelnya, kita buat prompt pilihan atau ambil bibit pertama/utama yang tersedia
    // Kamu bisa kustomisasi bagian ini jika ingin menggunakan modal HTML popup kustom
    let pilihanText = "Pilih jenis bibit yang ingin ditanam:\n";
    daftarBibitKey.forEach((idBibit, idx) => {
        pilihanText += `${idx + 1}. ${idBibit} (Stok: ${bibitTersedia[idBibit]})\n`;
    });

    let pilihanIndeks = prompt(pilihanText);
    if (!pilihanIndeks) return;

    let indexPilihanNum = parseInt(pilihanIndeks) - 1;
    if (isNaN(indexPilihanNum) || !daftarBibitKey[indexPilihanNum]) {
        alert("Pilihan tidak valid!");
        return;
    }

    let idBibitPilihan = daftarBibitKey[indexPilihanNum];
    let stokDimiliki = bibitTersedia[idBibitPilihan];

    // Tanya jumlah yang ingin ditanam (maksimal 99 per petak, atau sebanyak stok jika kurang dari 99)
    let maxBisaTanam = Math.min(99, stokDimiliki);
    let jumlahInput = prompt(`Mau tanam berapa bibit ${idBibitPilihan}? (Maksimal di petak ini: 99, Stok kamu: ${stokDimiliki})`, maxBisaTanam);
    
    let jumlahTanam = parseInt(jumlahInput);
    if (isNaN(jumlahTanam) || jumlahTanam <= 0) return;

    if (jumlahTanam > 99) {
        alert("Satu petak lahan hanya bisa menampung maksimal 99 bibit!");
        return;
    }

    if (jumlahTanam > stokDimiliki) {
        alert("Jumlah melebihi stok bibit yang kamu miliki di inventory!");
        return;
    }

    // Kurangi inventory bibit & masukkan ke petak lahan
    gameState.inventory.bibit[idBibitPilihan] -= jumlahTanam;
    
    gameState.lahan[indexPetak] = {
        ...gameState.lahan[indexPetak],
        tanaman: idBibitPilihan,
        jumlah: jumlahTanam,
        status: "Ditanam",
        waktuTanam: Date.now()
    };

    alert(`Berhasil menanam ${jumlahTanam} bibit ${idBibitPilihan} di Lahan #${gameState.lahan[indexPetak].id}!`);
    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
}

// Fitur Pupuk Massal: Memupuk seluruh petak lahan pertanian sekaligus dalam satu kali klik
function gunakanPupukMassal() {
    // Cek ketersediaan pupuk di inventory (asumsi ID pupuk standar di database adalah 'pupuk_dasar' atau sejenisnya)
    // Kita cek semua key di inventory.pupukPakan yang mengandung kata 'pupuk'
    let jenisPupukDitemukan = null;
    for (let key in gameState.inventory.pupukPakan) {
        if (key.includes('pupuk') && gameState.inventory.pupukPakan[key] > 0) {
            jenisPupukDitemukan = key;
            break;
        }
    }

    if (!jenisPupukDitemukan) {
        alert("Kamu tidak memiliki Pupuk di inventory! Beli terlebih dahulu di Pasar.");
        return;
    }

    // Kurangi 1 stok pupuk
    gameState.inventory.pupukPakan[jenisPupukDitemukan] -= 1;

    // Aktifkan status pupuk ke SELURUH petak lahan yang sedang aktif ditanam
    let adaLahanDipupuk = false;
    gameState.lahan.forEach(petak => {
        if (petak.status === "Ditanam") {
            petak.pupukAktif = jenisPupukDitemukan;
            adaLahanDipupuk = true;
        }
    });

    if (adaLahanDipupuk) {
        alert("Berhasil! Pupuk disebar dan memengaruhi semua petak lahan pertanian sekaligus!");
    } else {
        alert("Pupuk terpakai, tapi tidak ada tanaman aktif di lahan saat ini.");
    }

    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
}

// Panen hasil pertanian
function panenLahan(indexPetak) {
    let petak = gameState.lahan[indexPetak];
    if (petak.status !== "Ditanam") return;

    let hasilPanenId = petak.tanaman; // Hasil panen disamakan dengan ID bibitnya
    let totalHasil = petak.jumlah;

    // Jika menggunakan pupuk, berikan bonus hasil panen (misal dikali 1.5 atau 2, opsional)
    if (petak.pupukAktif) {
        totalHasil = Math.floor(totalHasil * 1.5); // Bonus 50% berkat pupuk
    }

    // Masukkan ke inventory hasil panen (misal: disimpan di inventory.hasilPanen atau langsung jadi koin/item)
    if (!gameState.inventory.hasilPanen) gameState.inventory.hasilPanen = {};
    gameState.inventory.hasilPanen[hasilPanenId] = (gameState.inventory.hasilPanen[hasilPanenId] || 0) + totalHasil;

    // Reset petak kembali kosong
    gameState.lahan[indexPetak] = {
        id: petak.id,
        tanaman: null,
        jumlah: 0,
        status: "Kosong",
        pupukAktif: null,
        waktuTanam: 0
    };

    alert(`Panen Berhasil! Kamu mendapatkan ${totalHasil} buah ${hasilPanenId}!`);
    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
}
