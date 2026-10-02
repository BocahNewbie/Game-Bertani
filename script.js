// SCRIPT.JS - Logika Utama, State Global, Navigasi Tab, Sistem Modal & Penyimpanan

// --- 1. DEFAULT & CURRENT GAME STATE ---
const DEFAULT_GAME_STATE = {
    namaPlayer: "Petani Newbie",
    koin: 1250,
    lahan: [
        { id: 1, tanaman: null, jumlah: 0, status: "Kosong", pupukAktif: null, waktuTanam: 0 }
    ],
    inventory: {
        bibit: {},
        pupuk: {},
        pakan: {},
        obat: {},
        hasilPanen: {},
        hasilTernak: {},
        accessories: {}
    },
    kandang: {
        ayam: [],
        sapi: [],
        domba: []
    },
    kapasitasKandang: {
        ayam: 2,
        sapi: 2,
        domba: 2
    },
    kapasitasInkubasi: 1,
    inkubasi: [],
    accessoriesTerpasang: {
        kepala: null,
        tangan: null,
        badan: null,
        kaki: null,
        telapak: null
    },
    cooldownPupuk: {
        sampai: 0,
        oleh: null,
        nama: null,
        biasa: 0,
        super: 0
    },
    hargaEkspansi: {
        lahan: 1000,
        kandang_ayam: 2500,
        kandang_sapi: 7500,
        kandang_domba: 5000,
        inkubasi: 1500
    }
};

let gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));

// --- 2. PENYIMPANAN LOCALSTORAGE ---
function muatGame() {
    try {
        const data = localStorage.getItem('gameState_bertani_v3') || localStorage.getItem('gameState_bertani_v2');
        if (data) {
            const parsed = JSON.parse(data);
            
            // Migrasi format pupuk dan pakan jika masih tercampur di pupukPakan
            if (parsed.inventory && parsed.inventory.pupukPakan) {
                parsed.inventory.pupuk = parsed.inventory.pupuk || {};
                parsed.inventory.pakan = parsed.inventory.pakan || {};
                for (let k in parsed.inventory.pupukPakan) {
                    if (k === 'biasa' || k === 'super') {
                        parsed.inventory.pupuk[k] = parsed.inventory.pupukPakan[k];
                    } else {
                        parsed.inventory.pakan[k] = parsed.inventory.pupukPakan[k];
                    }
                }
                delete parsed.inventory.pupukPakan;
            }

            // Migrasi format aksesoris terpasang jika masih array
            if (Array.isArray(parsed.accessoriesTerpasang)) {
                const newAcc = { kepala: null, tangan: null, badan: null, kaki: null, telapak: null };
                parsed.accessoriesTerpasang.forEach(idAcc => {
                    const item = GAME_DATABASE.accessories[idAcc];
                    if (item && item.kategori) newAcc[item.kategori] = idAcc;
                });
                parsed.accessoriesTerpasang = newAcc;
            }

            gameState = {
                ...JSON.parse(JSON.stringify(DEFAULT_GAME_STATE)),
                ...parsed,
                inventory: {
                    ...DEFAULT_GAME_STATE.inventory,
                    ...(parsed.inventory || {})
                },
                kandang: {
                    ...DEFAULT_GAME_STATE.kandang,
                    ...(parsed.kandang || {})
                },
                kapasitasKandang: {
                    ...DEFAULT_GAME_STATE.kapasitasKandang,
                    ...(parsed.kapasitasKandang || {})
                },
                kapasitasInkubasi: (parsed.kapasitasInkubasi !== undefined) ? parsed.kapasitasInkubasi : 1,
                inkubasi: parsed.inkubasi || [],
                accessoriesTerpasang: {
                    ...DEFAULT_GAME_STATE.accessoriesTerpasang,
                    ...(parsed.accessoriesTerpasang || {})
                },
                cooldownPupuk: {
                    ...DEFAULT_GAME_STATE.cooldownPupuk,
                    ...(parsed.cooldownPupuk || {})
                },
                hargaEkspansi: {
                    ...DEFAULT_GAME_STATE.hargaEkspansi,
                    ...(parsed.hargaEkspansi || {})
                }
            };
        } else {
            localStorage.removeItem('gameState_bertani');
            gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
        }
    } catch (e) {
        console.warn('Gagal memuat game dari localStorage:', e);
    }
}

function simpanGame() {
    try {
        localStorage.setItem('gameState_bertani_v3', JSON.stringify(gameState));
        tampilkanToast("💾 Permainan berhasil disimpan!");
    } catch (e) {
        console.warn('Gagal menyimpan game:', e);
    }
}

function bukaModalReset() {
    const modal = document.getElementById("modal-reset");
    if (modal) {
        modal.style.display = "flex";
    } else {
        tampilkanModal("Reset Permainan", "Apakah Anda yakin ingin mereset seluruh progres permainan?", false, 1, () => {
            eksekusiResetGame();
        });
    }
}

function tutupModalReset() {
    const modal = document.getElementById("modal-reset");
    if (modal) modal.style.display = "none";
}

function eksekusiResetGame() {
    localStorage.removeItem('gameState_bertani_v3');
    localStorage.removeItem('gameState_bertani_v2');
    localStorage.removeItem('gameState_bertani');
    gameState = JSON.parse(JSON.stringify(DEFAULT_GAME_STATE));
    tutupModalReset();
    updateHeaderStats();
    bukaTab('pertanian');
    tampilkanToast("🔄 Permainan berhasil direset ke awal!");
}

// --- 3. MODAL NICKNAME ---
function bukaModalNickname() {
    const modal = document.getElementById("modal-nickname");
    const input = document.getElementById("input-nickname");
    if (input) input.value = gameState.namaPlayer;
    if (modal) {
        modal.style.display = "flex";
    } else {
        tampilkanModal("Ganti Nama Petani", "Masukkan nama baru Anda:", true, 1, (val) => {
            if (val) {
                gameState.namaPlayer = String(val);
                updateHeaderStats();
                simpanGame();
            }
        });
    }
}

function tutupModalNickname() {
    const modal = document.getElementById("modal-nickname");
    if (modal) modal.style.display = "none";
}

function simpanNickname() {
    const input = document.getElementById("input-nickname");
    if (input && input.value.trim()) {
        gameState.namaPlayer = input.value.trim();
        updateHeaderStats();
        simpanGame();
        tampilkanToast(`👨‍🌾 Nama berhasil diganti menjadi ${gameState.namaPlayer}!`);
    }
    tutupModalNickname();
}

// --- 4. TOAST NOTIFIKASI ---
function tampilkanToast(pesan) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.innerText = pesan;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add("fade-out");
        setTimeout(() => toast.remove(), 400);
    }, 2800);
}

// Redirect alert bawaan ke toast agar aman di iframe
window.alert = function(pesan) {
    tampilkanToast(pesan);
};

// --- 5. HEADER STATS & CUACA ---
function updateHeaderStats() {
    const elKoin = document.getElementById("player-koin") || document.getElementById("stat-koin");
    if (elKoin) elKoin.innerText = `Rp ${gameState.koin.toLocaleString()}`;

    const elNama = document.getElementById("player-nickname") || document.getElementById("stat-nama-player");
    if (elNama) elNama.innerText = `👨‍🌾 ${gameState.namaPlayer} ✏️`;

    const elCuaca = document.getElementById("info-cuaca");
    if (elCuaca && typeof WeatherSystem !== 'undefined') {
        elCuaca.innerText = `Cuaca: ${WeatherSystem.cuacaAktif}`;
    }
}

// --- 6. NAVIGASI TAB UTAMA & SUB-TAB ---
let currentTabAktif = 'pertanian';

function switchTab(namaTab) {
    bukaTab(namaTab);
}

function bukaTab(namaTab) {
    currentTabAktif = namaTab;
    let tabId = namaTab;

    // Sembunyikan semua tab
    const allContents = document.querySelectorAll(".tab-content, .tab-pane");
    allContents.forEach(pane => {
        pane.style.display = "none";
        pane.classList.remove("active");
    });

    // Tampilkan container tab aktif
    const target = document.getElementById(`tab-${tabId}`) || document.getElementById(`tab-${namaTab}`);
    if (target) {
        target.style.display = "block";
        target.classList.add("active");
    }

    // Update active class tombol navigasi
    const allBtns = document.querySelectorAll(".tab-btn");
    allBtns.forEach(btn => {
        const onclickAttr = btn.getAttribute("onclick") || "";
        if (onclickAttr.includes(`'${namaTab}'`)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    // Panggil render fungsi masing-masing
    if (tabId === 'pertanian' && typeof renderPertanian === 'function') renderPertanian();
    else if (tabId === 'peternakan' && typeof renderPeternakan === 'function') renderPeternakan();
    else if (tabId === 'aksesoris' && typeof renderAccessories === 'function') renderAccessories();
    else if (tabId === 'toko-aksesoris' && typeof renderTokoAccessories === 'function') renderTokoAccessories();
    else if (tabId === 'pasar' && typeof renderPasar === 'function') renderPasar();
    else if (tabId === 'inventory' && typeof renderInventory === 'function') renderInventory();

    updateHeaderStats();
}

function switchSubTab(parentTab, subTabName) {
    const parent = document.getElementById(`tab-${parentTab}`);
    if (!parent) return;

    const subContents = parent.querySelectorAll(".sub-content");
    subContents.forEach(sc => {
        sc.classList.remove("active");
        sc.style.display = "none";
    });

    const targetSub = document.getElementById(`subtab-${subTabName}`);
    if (targetSub) {
        targetSub.classList.add("active");
        targetSub.style.display = "block";
    }

    const subBtns = parent.querySelectorAll(".sub-tab-btn");
    subBtns.forEach(btn => {
        const attr = btn.getAttribute("onclick") || "";
        if (attr.includes(`'${subTabName}'`)) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// --- 7. SISTEM MODAL / POPUP KUSTOM UNIVERSAL ---
function tampilkanModal(judul, pesan, denganInput = false, nilaiAwal = 1, callbackKonfirmasi = null) {
    const modal = document.getElementById("game-modal");
    if (!modal) {
        if (callbackKonfirmasi) callbackKonfirmasi(nilaiAwal);
        return;
    }

    const elJudul = document.getElementById("modal-title");
    const elPesan = document.getElementById("modal-message");
    const inputContainer = document.getElementById("modal-input-container");
    const inputField = document.getElementById("modal-input-value");
    const btnKonfirmasi = document.getElementById("modal-btn-confirm");

    if (elJudul) elJudul.innerText = judul;
    if (elPesan) elPesan.innerText = pesan;

    if (denganInput && inputContainer && inputField) {
        inputContainer.style.display = "block";
        inputField.value = nilaiAwal;
    } else if (inputContainer) {
        inputContainer.style.display = "none";
    }

    modal.style.display = "flex";

    if (btnKonfirmasi) {
        const btnBaru = btnKonfirmasi.cloneNode(true);
        btnKonfirmasi.parentNode.replaceChild(btnBaru, btnKonfirmasi);

        btnBaru.addEventListener("click", () => {
            let nilaiInput = (denganInput && inputField) ? inputField.value : null;
            tutupModal();
            if (callbackKonfirmasi) callbackKonfirmasi(nilaiInput);
        });
    }
}

function tutupModal() {
    const modal = document.getElementById("game-modal");
    if (modal) modal.style.display = "none";
}

// --- 8. INISIALISASI & TICKER WAKTU ---
document.addEventListener("DOMContentLoaded", () => {
    muatGame();
    bukaTab('pertanian');
    updateHeaderStats();

    // Ticker berkala setiap detik untuk refresh countdown tanaman, pupuk, kehamilan, & inkubasi
    setInterval(() => {
        if (currentTabAktif === 'pertanian') {
            if (typeof renderPertanian === 'function') renderPertanian();
        } else if (currentTabAktif === 'peternakan') {
            if (typeof renderPeternakan === 'function') renderPeternakan();
        }
    }, 1000);

    // Ticker cuaca & ekonomi setiap 30 detik
    setInterval(() => {
        if (typeof WeatherSystem !== 'undefined' && typeof WeatherSystem.gantiCuaca === 'function') {
            WeatherSystem.gantiCuaca();
        }
        if (typeof MarketEconomy !== 'undefined' && typeof MarketEconomy.acakFluktuasi === 'function') {
            MarketEconomy.acakFluktuasi();
            if (currentTabAktif === 'pasar' && typeof renderPasar === 'function') renderPasar();
            if (currentTabAktif === 'toko-aksesoris' && typeof renderTokoAccessories === 'function') renderTokoAccessories();
            if (currentTabAktif === 'inventory' && typeof renderInventory === 'function') renderInventory();
            if (currentTabAktif === 'peternakan' && typeof renderPeternakan === 'function') renderPeternakan();
        }
        updateHeaderStats();
    }, 30000);
});
