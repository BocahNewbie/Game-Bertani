// PASAR.JS - Logika Tab Pasar & Transaksi Jual Beli
function renderPasarBibit() {
    const container = document.getElementById("pasar-bibit-container");
    if (!container) container.innerHTML = "";
    
    // Contoh mengambil data dari database.js
    if (typeof GAME_DATABASE !== 'undefined') {
        Object.keys(GAME_DATABASE.tanaman).forEach(key => {
            const item = GAME_DATABASE.tanaman[key];
            // Render item pasar...
        });
    }
}
