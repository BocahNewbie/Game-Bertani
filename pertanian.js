// PERTANIAN.JS - Logika Tab Pertanian
function renderLahan() {
    const container = document.getElementById("lahan-container");
    if (!container) return;
    container.innerHTML = "";
    
    // Asumsi gameState didefinisikan secara global di script.js
    if (!window.gameState || !window.gameState.lahan) return;

    window.gameState.lahan.forEach((petak, index) => {
        container.innerHTML += `
            <div class="petak-lahan" onclick="klikLahan(${index})">
                <p>${petak.tanaman ? petak.tanaman : "Tanah Kosong"}</p>
                <small>${petak.status || "Siap Tanam"}</small>
            </div>
        `;
    });
}

function klikLahan(index) {
    console.log(`Lahan pertanian ke-${index} diklik.`);
    // Logika buka modal tanam / panen di sini
}
