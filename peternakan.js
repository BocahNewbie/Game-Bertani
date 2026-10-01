// PETERNAKAN.JS - Logika Tab Peternakan
function switchSubTabPeternakan(subKategori) {
    document.querySelectorAll('#tab-peternakan .sub-content').forEach(el => {
        el.classList.remove('active');
    });
    const target = document.getElementById(`subtab-${subKategori}`);
    if (target) target.classList.add('active');
}

function renderKandang(jenisHewan) {
    const container = document.getElementById(`kandang-${jenisHewan}-container`);
    if (!container) return;
    container.innerHTML = `<p>Menampilkan hewan ${jenisHewan}...</p>`;
}
