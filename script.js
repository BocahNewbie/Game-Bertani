// SCRIPT.JS - Pengendali Utama Game & State
const gameState = {
    nickname: "Petani Master",
    koin: 2500,
    
    // Lahan awal 1 petak, dengan properti tambahan status pupuk
    lahan: [
        { id: 1, tanaman: null, jumlah: 0, status: "Kosong", pupukAktif: null, waktuTanam: 0 }
    ],

    kapasitas: {
        lahan: 10,
        kandang_ayam: 3,
        kandang_sapi: 2,
        kandang_domba: 2
    },

    kandang: {
        ayam: [],
        sapi: [],
        domba: []
    },

    aksesoris: {
        kepala: null,
        tangan: null,
        baju: null,
        kaki: null,
        telapak: null,
        totalBonus: 0
    },

    inventory: {
        bibit: {
            padi: 50,
            jagung: 20,
            cabai: 10
        },
        hasilPanen: {},
        pupukPakan: {
            biasa: 5, // Stok awal pupuk urea untuk uji coba
            super: 2  // Stok awal pupuk super untuk uji coba
        }
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

    if (tabId === 'pertanian' && typeof renderPertanian === 'function') renderPertanian();
    if (tabId === 'pasar' && typeof renderPasar === 'function') renderPasar();
    if (tabId === 'inventory' && typeof renderInventory === 'function') renderInventory();
}

// --- FUNGSI NAVIGASI SUB-TAB ---
function switchSubTab(parentTab, subId) {
    const parentContainer = document.getElementById(`tab-${parentTab}`);
    if (!parentContainer) return;

    parentContainer.querySelectorAll('.sub-content').forEach(el => el.classList.remove('active'));
    parentContainer.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));

    const targetSub = document.getElementById(`subtab-${subId}`);
    if (targetSub) targetSub.classList.add('active');

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

window.onload = function() {
    console.log("Game-Bertani Berhasil Dimuat!");
    if (typeof renderPertanian === 'function') renderPertanian();
};
