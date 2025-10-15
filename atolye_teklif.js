// Google Apps Script URL'si buraya sabitlendi!
const GAS_WEB_APP_URL_ATOLYE = "https://script.google.com/macros/s/AKfycbwJgtDnM5ELcH1fTpXbMPGAUjfsGiwS0XDRJtWp4P5XZLNAcmYkzR2EJoOFdenDPtv5vg/exec";

document.getElementById('atolyeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 1. Form Verilerini Toplama
    const veri = {
        Ad_Soyad_Firma: document.getElementById('musteriAdSoyad').value,
        Telefon: document.getElementById('telefon').value,
        Email: document.getElementById('email').value,
        Etkinlik_Tarihi: document.getElementById('tarih').value,
        Katilimci_Sayisi: document.getElementById('katilimciSayisi').value,
        Mekan: document.getElementById('mekan').value,
        Konsept_ve_Istekler: document.getElementById('konsept').value,
        Atolye_Tipi: document.getElementById('atölyeTipi').value
    };

    // Butonun yükleniyor durumunu ayarla
    const submitButton = document.querySelector('.submit-button');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = 'Gönderiliyor...';
    submitButton.disabled = true;

    // 2. Google Sheets'e Gönderme
    GonderGoogleSheetsAtolye(veri)
        .catch(error => {
            // Hata durumunda yakalama
            console.error('Gönderim hatası:', error);
            // Yönlendirme, hatanın kullanıcıya yansımasını engeller.
            window.location.href = "tesekkurler.html";
        })
        .finally(() => {
            // Butonu eski haline getir (Yönlendirme gerçekleşmezse)
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        });
});


// --- GOOGLE SHEETS ENTEGRASYON FONKSİYONU (ATÖLYE) ---
function GonderGoogleSheetsAtolye(veri) {
    if (!veri) return Promise.reject("Veri boş");

    return fetch(GAS_WEB_APP_URL_ATOLYE, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(veri).toString()
    })
    .then(response => {
        // Yönlendirme
        window.location.href = "tesekkurler.html"; 
    });
}