// SCRIPT.JS - Pengendali Utama Game & Manajemen State
const gameState = {
    nickname: "Petani Master",
    koin: 2500,
    // Lahan awal diatur misal 4 petak, bisa diekspansi sampai maksimal 10 petak
    lahan: Array(4).fill().map(() => ({ tanaman: null, status: "Kosong", waktuTanam: 0 })),
    
    // Penyimpanan Kandang Ternak
    kandang: {
        ayam: [],
        sapi: [],
        domba: []
    },

    // Kapasitas Maksimal Kandang & Lahan
    kapasitas: {
        lahan: 4,
        kandang_ayam: 3,
        kandang_sapi: 2,
        kandang_domba: 2
    },

    // Slot Aksesoris (Kepala, Tangan, Baju, Kaki, Telapak)
    aksesoris: {
        kepala: null,
        tangan: null,
        baju: null,
        kaki: null,
        telapak: null,
        totalBonus: 0
    },

    // Inventory Terpusat
    inventory: {
        hasilPanen: {},
        hasilTernak: {},
        pupukPakan: {}
    }
};

// --- FUNGSI NAVIGASI TAB UTAMA ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Panggil fungsi render sesuai tab yang dibuka
    if (tabId === 'pertanian' && typeof renderPertanian === 'function') renderPertanian();
    if (tabId === 'peternakan' && typeof renderPeternakan === 'function') renderPeternakan();
    if (tabId === 'pasar' && typeof renderPasar === 'function') renderPasar();
    if (tabId === 'aksesoris' && typeof renderAksesoris === 'function') renderAksesoris();
    if (tabId === 'inventory' && typeof renderInventory === 'function') renderInventory();
}

// --- FUNGSI NAVIGASI SUB-TAB DI DALAM TAB ---
function switchSubTab(parentTab, subId) {
    const parentContainer = document.getElementById(`tab-${parentTab}`);
    if (!parentContainer) return;

    // Sembunyikan semua sub-content di dalam tab tersebut
    parentContainer.querySelectorAll('.sub-content').forEach(el => el.classList.remove('active'));
    parentContainer.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));

    // Tampilkan sub-content yang dituju
    const targetSub = document.getElementById(`subtab-${subId}`);
    if (targetSub) targetSub.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// Inisialisasi Saat Game Dimuat
window.onload = function() {
    console.log("Game-Bertani Berhasil Dimuat!");
    if (typeof MarketEconomy !== 'undefined') MarketEconomy.acakFluktuasi();
    if (typeof WeatherSystem !== 'undefined') WeatherSystem.gantiCuaca();
    
    // Render awal tab pertanian
    if (typeof renderLahan === 'function') renderLahan();
};
