// SCRIPT.JS - Logika Utama, State Global, Navigasi Tab, & Sistem Modal Modern

// --- 1. GAME STATE GLOBAL ---
let gameState = {
    koin: 1500, // Modal awal koin
    lahan: [
        { id: 1, tanaman: null, jumlah: 0, status: "Kosong", pupukAktif: null, waktuTanam: 0 }
    ],
    inventory: {
        bibit: { bayam: 5 },
        pupukPakan: { pupuk_dasar: 2, pakan_ayam: 2 },
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
    accessoriesTerpasang: []
};

// --- 2. INISIALISASI SAAT HALAMAN DIMUAT ---
document.addEventListener("DOMContentLoaded", () => {
    // Jalankan render awal ke tab pertanian saat halaman siap
    bukaTab('pertanian');
});

// --- 3. SISTEM NAVIGASI TAB UTAMA & SUB-TAB ---
function bukaTab(namaTab) {
    // Sembunyikan semua konten tab utama
    const panes = document.querySelectorAll(".tab-pane");
    panes.forEach(pane => pane.style.display = "none");

    // Tampilkan tab target yang dipilih
    const targetPane = document.getElementById(`tab-${namaTab}`);
    if (targetPane) {
        targetPane.style.display = "block";
    }

    // Panggil fungsi render modul terkait secara otomatis
    if (namaTab === 'pertanian' && typeof renderPertanian === 'function') {
        renderPertanian();
    } else if (namaTab === 'pasar' && typeof renderPasar === 'function') {
        renderPasar();
    } else if (namaTab === 'inventory' && typeof renderInventory === 'function') {
        renderInventory();
    } else if (namaTab === 'peternakan' && typeof renderPeternakan === 'function') {
        renderPeternakan();
    } else if (namaTab === 'accessories' && typeof renderAccessories === 'function') {
        renderAccessories();
    }
    
    updateHeaderStats();
}

// Update tampilan informasi koin di bagian atas game
function updateHeaderStats() {
    const elKoin = document.getElementById("stat-koin");
    if (elKoin) {
        elKoin.innerText = `Rp ${gameState.koin.toLocaleString()}`;
    }
}


// --- 4. SISTEM MODAL / POPUP KUSTOM MODERN ---
function tampilkanModal(judul, pesan, denganInput = false, nilaiAwal = 1, callbackKonfirmasi) {
    const modal = document.getElementById("game-modal");
    if (!modal) {
        // Fallback pengaman jika elemen modal belum terpasang di HTML
        if (denganInput) {
            let res = prompt(`${judul}\n${pesan}`, nilaiAwal);
            if (res !== null && callbackKonfirmasi) callbackKonfirmasi(parseInt(res));
        } else {
            if (confirm(`${judul}\n${pesan}`) && callbackKonfirmasi) callbackKonfirmasi();
        }
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
        // Bersihkan event listener sebelumnya agar tidak terjadi penumpukan aksi
        const btnBaru = btnKonfirmasi.cloneNode(true);
        btnKonfirmasi.parentNode.replaceChild(btnBaru, btnKonfirmasi);

        btnBaru.addEventListener("click", () => {
            let nilaiInput = (denganInput && inputField) ? parseInt(inputField.value) : null;
            tutupModal();
            if (callbackKonfirmasi) callbackKonfirmasi(nilaiInput);
        });
    }
}

function tutupModal() {
    const modal = document.getElementById("game-modal");
    if (modal) {
        modal.style.display = "none";
    }
}
