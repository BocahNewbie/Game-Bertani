// PERTANIAN.JS - Logika Pertanian, Tanam Bibit, & Pupuk dengan Sistem Shared Cooldown

let petakTanamTerpilih = null;
let bibitTanamTerpilih = null;

function renderPertanian() {
    const container = document.getElementById("tab-pertanian");
    if (!container || typeof GAME_DATABASE === 'undefined' || !gameState) return;

    if (!gameState.cooldownPupuk) {
        gameState.cooldownPupuk = { sampai: 0, oleh: null, nama: null, biasa: 0, super: 0 };
    }

    const now = Date.now();
    const cooldownExp = gameState.cooldownPupuk.sampai || Math.max(gameState.cooldownPupuk.biasa || 0, gameState.cooldownPupuk.super || 0);
    const sisaDetikShared = Math.max(0, Math.ceil((cooldownExp - now) / 1000));
    const sedangCooldownShared = sisaDetikShared > 0;
    const pemicuCooldown = gameState.cooldownPupuk.nama || 'Pupuk';

    let html = `
        <div class="pertanian-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
            <div>
                <h3 style="margin: 0 0 4px 0;">🌱 Lahan Pertanian (${gameState.lahan.length} Petak Aktif)</h3>
                <div style="font-size: 13px; color: #475569; display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <span>🧪 Status Pupuk: <b style="color: ${sedangCooldownShared ? '#ea580c' : '#16a34a'};">${sedangCooldownShared ? '⏳ Cooldown ' + formatMenitDetik(sisaDetikShared) : '✅ Siap Digunakan'}</b></span>
                </div>
            </div>
            <button onclick="bukaModalPupuk()" style="padding: 10px 16px; background: ${sedangCooldownShared ? '#94a3b8' : '#16a34a'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                🧪 Gunakan Pupuk Massal ${sedangCooldownShared ? '(' + formatMenitDetik(sisaDetikShared) + ')' : ''}
            </button>
        </div>
        <div class="grid-lahan" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px;">
    `;

    gameState.lahan.forEach((petak, index) => {
        let statusTeks = "Kosong";
        let backgroundCard = "#f8fafc";
        let siapPanen = false;
        let sisaWaktuTeks = "";

        if (petak.status === "Ditanam") {
            const dataTanaman = GAME_DATABASE.tanaman[petak.tanaman] || { durasi: 30, icon: "🌱", nama: petak.tanaman };
            let totalDurasiDetik = dataTanaman.durasi || 30;

            if (petak.pupukAktif) {
                const efekPupuk = GAME_DATABASE.pupuk[petak.pupukAktif]?.efekPengurangDurasi || 10;
                totalDurasiDetik = Math.max(5, totalDurasiDetik - efekPupuk);
            }

            const waktuBerlaluDetik = Math.floor((now - (petak.waktuTanam || now)) / 1000);
            const sisaDetik = Math.max(0, totalDurasiDetik - waktuBerlaluDetik);

            statusTeks = `${dataTanaman.icon || '🌱'} ${dataTanaman.nama} (${petak.jumlah} bibit)`;

            if (sisaDetik === 0) {
                siapPanen = true;
                backgroundCard = "#dcfce7";
            } else {
                sisaWaktuTeks = `⏳ Sisa: ${sisaDetik} detik`;
                backgroundCard = petak.pupukAktif ? "#e0f2fe" : "#fef9c3";
            }
        } else {
            statusTeks = "Kosong";
        }

        html += `
            <div class="petak-lahan-card" style="border: 2px solid #cbd5e1; padding: 16px; border-radius: 12px; background: ${backgroundCard}; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <p style="font-weight: bold; margin-bottom: 6px; font-size: 15px;">Petak Lahan #${petak.id}</p>
                <p style="font-size: 14px; font-weight: bold; color: ${petak.status === 'Ditanam' ? '#15803d' : '#64748b'}; margin-bottom: 6px;">${statusTeks}</p>
                ${sisaWaktuTeks ? `<p style="font-size: 12px; color: #2563eb; font-weight: bold; margin-bottom: 8px;">${sisaWaktuTeks}</p>` : ''}
                ${petak.pupukAktif ? `<p style="font-size: 11px; color: #15803d; font-weight: bold; margin-bottom: 8px;">✨ Pupuk: ${GAME_DATABASE.pupuk[petak.pupukAktif]?.nama || petak.pupukAktif}</p>` : ``}
                
                ${petak.status === "Kosong" ? `
                    <button onclick="bukaModalTanam(${index})" style="padding: 8px 14px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%;">Tanam Bibit</button>
                ` : siapPanen ? `
                    <button onclick="panenLahan(${index})" style="padding: 8px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%;">Panen Hasil</button>
                ` : `
                    <button onclick="panenLahan(${index})" style="padding: 8px 14px; background: #94a3b8; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; width: 100%;">Menunggu Matang</button>
                `}
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

function formatMenitDetik(totalDetik) {
    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;
    return `${menit}m ${detik < 10 ? '0' : ''}${detik}s`;
}

// ==========================================
// MODAL & AKSI PUPUK MASSAL DENGAN SHARED COOLDOWN
// ==========================================
function bukaModalPupuk() {
    if (!gameState.cooldownPupuk) {
        gameState.cooldownPupuk = { sampai: 0, oleh: null, nama: null, biasa: 0, super: 0 };
    }
    if (!gameState.inventory.pupuk) {
        gameState.inventory.pupuk = {};
    }

    const modal = document.getElementById("modal-pupuk");
    const list = document.getElementById("modal-pupuk-list");
    if (!modal || !list) return;

    list.innerHTML = "";
    const now = Date.now();

    // Hitung shared cooldown aktif
    const cooldownExp = gameState.cooldownPupuk.sampai || Math.max(gameState.cooldownPupuk.biasa || 0, gameState.cooldownPupuk.super || 0);
    const sisaDetikShared = Math.max(0, Math.ceil((cooldownExp - now) / 1000));
    const sedangCooldown = sisaDetikShared > 0;
    const namaPemicu = gameState.cooldownPupuk.nama || 'Pupuk';

    if (sedangCooldown) {
        const infoCooldown = document.createElement("div");
        infoCooldown.style.background = "#fff7ed";
        infoCooldown.style.border = "1px solid #fdba74";
        infoCooldown.style.borderRadius = "8px";
        infoCooldown.style.padding = "10px 14px";
        infoCooldown.style.fontSize = "13px";
        infoCooldown.style.color = "#c2410c";
        infoCooldown.style.fontWeight = "600";
        infoCooldown.style.marginBottom = "4px";
        infoCooldown.innerHTML = `⏳ Semua pupuk sedang cooldown selama <b>${formatMenitDetik(sisaDetikShared)}</b>.`;
        list.appendChild(infoCooldown);
    }

    const daftarPupuk = [
        { id: 'biasa', data: GAME_DATABASE.pupuk.biasa },
        { id: 'super', data: GAME_DATABASE.pupuk.super }
    ];

    daftarPupuk.forEach(p => {
        const item = p.data;
        const stok = gameState.inventory.pupuk[p.id] || 0;

        const row = document.createElement("div");
        row.style.background = "#f8fafc";
        row.style.border = "1px solid #cbd5e1";
        row.style.borderRadius = "10px";
        row.style.padding = "14px";
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.gap = "10px";

        let buttonHtml = "";
        if (sedangCooldown) {
            buttonHtml = `<button disabled style="padding: 8px 12px; background: #94a3b8; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: not-allowed;">⏳ Cooldown (${formatMenitDetik(sisaDetikShared)})</button>`;
        } else if (stok <= 0) {
            buttonHtml = `<button disabled style="padding: 8px 12px; background: #cbd5e1; color: #64748b; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: not-allowed;">Stok Habis</button>`;
        } else {
            buttonHtml = `<button onclick="eksekusiGunakanPupuk('${p.id}')" style="padding: 8px 14px; background: #16a34a; color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;">Gunakan</button>`;
        }

        row.innerHTML = `
            <div style="text-align: left;">
                <p style="font-weight: bold; margin: 0 0 4px 0; font-size: 14px;">${item.icon} ${item.nama}</p>
                <p style="font-size: 12px; color: #475569; margin: 0 0 4px 0;">${item.deskripsi}</p>
                <p style="font-size: 12px; color: #16a34a; font-weight: bold; margin: 0;">Stok: ${stok} buah</p>
            </div>
            <div>${buttonHtml}</div>
        `;
        list.appendChild(row);
    });

    modal.style.display = "flex";
}

function tutupModalPupuk() {
    const modal = document.getElementById("modal-pupuk");
    if (modal) modal.style.display = "none";
}

function eksekusiGunakanPupuk(jenisPupuk) {
    if (!gameState.cooldownPupuk) {
        gameState.cooldownPupuk = { sampai: 0, oleh: null, nama: null, biasa: 0, super: 0 };
    }
    if (!gameState.inventory.pupuk) gameState.inventory.pupuk = {};

    const itemPupuk = GAME_DATABASE.pupuk[jenisPupuk];
    if (!itemPupuk) return;

    const now = Date.now();
    const cooldownExp = gameState.cooldownPupuk.sampai || Math.max(gameState.cooldownPupuk.biasa || 0, gameState.cooldownPupuk.super || 0);
    if (now < cooldownExp) {
        const sisa = Math.ceil((cooldownExp - now) / 1000);
        const pemicu = gameState.cooldownPupuk.nama || 'pupuk';
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Semua pupuk sedang cooldown! Tunggu ${formatMenitDetik(sisa)} lagi.`);
        }
        return;
    }

    const stok = gameState.inventory.pupuk[jenisPupuk] || 0;
    if (stok <= 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`⚠️ Kamu tidak memiliki ${itemPupuk.nama}! Beli di Pasar.`);
        }
        return;
    }

    // Kurangi 1 pupuk & aktifkan cooldown bersama (shared cooldown) mengikuti pupuk yang digunakan
    gameState.inventory.pupuk[jenisPupuk] -= 1;
    const cooldownBaru = now + (itemPupuk.cooldownDetik * 1000);
    gameState.cooldownPupuk = {
        sampai: cooldownBaru,
        oleh: jenisPupuk,
        nama: itemPupuk.nama,
        biasa: cooldownBaru,
        super: cooldownBaru
    };

    // Terapkan ke semua lahan aktif
    let countDipupuk = 0;
    gameState.lahan.forEach(petak => {
        if (petak.status === "Ditanam") {
            petak.pupukAktif = jenisPupuk;
            countDipupuk++;
        }
    });

    tutupModalPupuk();

    const menitCd = Math.floor(itemPupuk.cooldownDetik / 60);
    if (countDipupuk > 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`✨ ${itemPupuk.nama} berhasil disebarkan ke ${countDipupuk} petak! Semua pupuk masuk cooldown ${menitCd} menit.`);
        }
    } else {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast(`🧪 ${itemPupuk.nama} digunakan. Semua pupuk masuk cooldown ${menitCd} menit.`);
        }
    }

    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}

// ==========================================
// FUNGSI TANAM & PANEN
// ==========================================
function bukaModalTanam(indexPetak) {
    petakTanamTerpilih = indexPetak;
    const bibitTersedia = gameState.inventory.bibit || {};
    const daftarBibitKey = Object.keys(bibitTersedia).filter(key => bibitTersedia[key] > 0);

    if (daftarBibitKey.length === 0) {
        if (typeof tampilkanToast === 'function') {
            tampilkanToast("⚠️ Kamu tidak memiliki bibit di inventory! Beli dulu di Pasar.");
        }
        return;
    }

    const modalPilih = document.getElementById("modal-pilih-bibit");
    const listContainer = document.getElementById("modal-pilih-bibit-list");

    if (modalPilih && listContainer) {
        listContainer.innerHTML = "";
        daftarBibitKey.forEach(idBibit => {
            const dataTanaman = GAME_DATABASE.tanaman[idBibit] || { nama: idBibit, icon: "🌱" };
            const btn = document.createElement("button");
            btn.className = "btn-secondary";
            btn.style.textAlign = "left";
            btn.style.padding = "10px 14px";
            btn.style.display = "flex";
            btn.style.justifyContent = "space-between";
            btn.style.alignItems = "center";
            btn.innerHTML = `<span>${dataTanaman.icon || '🌱'} <b>${dataTanaman.nama}</b></span> <span style="color: #16a34a; font-weight: bold;">Stok: ${bibitTersedia[idBibit]}</span>`;
            btn.onclick = () => pilihBibitUntukTanam(idBibit);
            listContainer.appendChild(btn);
        });
        modalPilih.style.display = "flex";
    }
}

function pilihBibitUntukTanam(idBibit) {
    bibitTanamTerpilih = idBibit;
    tutupModalPilihBibit();

    const stokDimiliki = gameState.inventory.bibit[idBibit] || 0;
    const modalTanam = document.getElementById("modal-tanam");
    const inputJumlah = document.getElementById("input-jumlah-tanam");
    const infoText = document.getElementById("modal-tanam-info");
    const titleText = document.getElementById("modal-tanam-title");

    if (modalTanam && inputJumlah) {
        const dataTanaman = GAME_DATABASE.tanaman[idBibit] || { nama: idBibit };
        if (titleText) titleText.innerText = `Tanam ${dataTanaman.nama}`;
        if (infoText) infoText.innerText = `Maksimal 99 bibit per petak. Stok kamu: ${stokDimiliki}`;
        inputJumlah.max = Math.min(99, stokDimiliki);
        inputJumlah.min = 1;
        inputJumlah.value = 1;
        modalTanam.style.display = "flex";
    }
}

function tutupModalPilihBibit() {
    const modalPilih = document.getElementById("modal-pilih-bibit");
    if (modalPilih) modalPilih.style.display = "none";
}

function tutupModalTanam() {
    const modalTanam = document.getElementById("modal-tanam");
    if (modalTanam) modalTanam.style.display = "none";
}

function validasiInputTanam() {
    const input = document.getElementById("input-jumlah-tanam");
    if (!input || !bibitTanamTerpilih) return;
    const stok = gameState.inventory.bibit[bibitTanamTerpilih] || 0;
    const max = Math.min(99, stok);
    let val = parseInt(input.value) || 1;
    if (val < 1) val = 1;
    if (val > max) val = max;
    input.value = val;
}

function ubahJumlahTanam(delta) {
    const input = document.getElementById("input-jumlah-tanam");
    if (!input || !bibitTanamTerpilih) return;
    const stok = gameState.inventory.bibit[bibitTanamTerpilih] || 0;
    const max = Math.min(99, stok);
    let val = (parseInt(input.value) || 1) + delta;
    if (val < 1) val = 1;
    if (val > max) val = max;
    input.value = val;
}

function setJumlahTanamMaks() {
    const input = document.getElementById("input-jumlah-tanam");
    if (!input || !bibitTanamTerpilih) return;
    const stok = gameState.inventory.bibit[bibitTanamTerpilih] || 0;
    input.value = Math.min(99, stok);
}

function eksekusiTanamBibit() {
    if (petakTanamTerpilih === null || !bibitTanamTerpilih) return;
    const input = document.getElementById("input-jumlah-tanam");
    const jumlahTanam = parseInt(input ? input.value : 1) || 1;
    const stokDimiliki = gameState.inventory.bibit[bibitTanamTerpilih] || 0;

    if (jumlahTanam > stokDimiliki) {
        if (typeof tampilkanToast === 'function') tampilkanToast("⚠️ Jumlah melebihi stok yang kamu miliki!");
        return;
    }

    gameState.inventory.bibit[bibitTanamTerpilih] -= jumlahTanam;
    gameState.lahan[petakTanamTerpilih] = {
        ...gameState.lahan[petakTanamTerpilih],
        tanaman: bibitTanamTerpilih,
        jumlah: jumlahTanam,
        status: "Ditanam",
        pupukAktif: null,
        waktuTanam: Date.now()
    };

    tutupModalTanam();
    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🌱 Berhasil menanam ${jumlahTanam} bibit ${bibitTanamTerpilih}!`);
    }
    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}

function panenLahan(indexPetak) {
    let petak = gameState.lahan[indexPetak];
    if (petak.status !== "Ditanam") return;

    const dataTanaman = GAME_DATABASE.tanaman[petak.tanaman] || { durasi: 30 };
    let totalDurasi = dataTanaman.durasi || 30;
    if (petak.pupukAktif) {
        const efek = GAME_DATABASE.pupuk[petak.pupukAktif]?.efekPengurangDurasi || 10;
        totalDurasi = Math.max(5, totalDurasi - efek);
    }

    const waktuBerlalu = Math.floor((Date.now() - (petak.waktuTanam || 0)) / 1000);
    if (waktuBerlalu < totalDurasi) {
        const sisa = totalDurasi - waktuBerlalu;
        if (typeof tampilkanToast === 'function') tampilkanToast(`⏳ Tanaman belum matang! Tunggu ${sisa} detik lagi.`);
        return;
    }

    let hasilPanenId = petak.tanaman;
    let totalHasil = petak.jumlah;

    if (petak.pupukAktif) {
        totalHasil = Math.floor(totalHasil * 1.5);
    }

    if (!gameState.inventory.hasilPanen) gameState.inventory.hasilPanen = {};
    gameState.inventory.hasilPanen[hasilPanenId] = (gameState.inventory.hasilPanen[hasilPanenId] || 0) + totalHasil;

    gameState.lahan[indexPetak] = {
        id: petak.id,
        tanaman: null,
        jumlah: 0,
        status: "Kosong",
        pupukAktif: null,
        waktuTanam: 0
    };

    if (typeof tampilkanToast === 'function') {
        tampilkanToast(`🎉 Panen Berhasil! Mendapatkan ${totalHasil} buah ${hasilPanenId}!`);
    }
    renderPertanian();
    if (typeof renderInventory === 'function') renderInventory();
    if (typeof simpanGame === 'function') simpanGame();
}
