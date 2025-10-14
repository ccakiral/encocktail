// Google Apps Script URL'si buraya sabitlendi!
// GÖNDERDİĞİNİZ DOSYADAN ALINDIĞI GİBİ KULLANILDI.
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwyv3q4at5UFv8A_lY7KYx2s-0bAMbATu-Bcwx-8_uhUcEy4rwM1-OhbF5KLnq9Aua/exec";
//

const form = document.forms['contact'];
const loader = document.getElementById('loader');
const modalOverlay = document.getElementById('basvuru');
const modalTitle = document.getElementById('modal-title');
const hizmetTuruInput = document.getElementById('hizmet_turu');

// Form Gönderim Logiği
form.addEventListener('submit', e => {
    e.preventDefault();
    loader.style.display = 'block'; // Gönderiliyor... göster
    
    // Checkbox verilerini topla (Array'den String'e çevir)
    const kokteylSecimi = Array.from(document.querySelectorAll('input[name="Kokteyl_Secimi"]:checked'))
                                 .map(cb => cb.value)
                                 .join(', ');

    // Form data oluştur
    const formData = new FormData(form);
    // Çoklu seçimi FormData'ya tek bir alan olarak ekle
    formData.set('Kokteyl_Secimi', kokteylSecimi);
    
    fetch(GAS_WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', // CORS hatasını engeller
        body: formData
    })
        .then(response => {
            // Başarılı olursa (no-cors modunda response.ok kontrol edilemez)
            loader.style.display = 'none'; // Gönderiliyor... gizle
            form.reset(); // Formu temizle
            
            // Başarılı sayfasına yönlendir (success.html)
            window.location.href = 'success.html'; 
        })
        .catch(error => {
            console.error('Hata!', error.message);
            loader.style.display = 'none'; // Gönderiliyor... gizle
            alert('Gönderimde bir hata oluştu. Lütfen daha sonra tekrar deneyin veya bize doğrudan e-posta gönderin.');
        });
});

// Modal Açma/Kapatma Logiği
document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('.open-modal');
    const closeButton = document.querySelector('.close-modal');

    // Açma
    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Hangi butona tıklandığına göre modal başlığını ve gizli alanı ayarla
            const hizmetTuru = button.getAttribute('data-hizmet'); 
            
            if (hizmetTuru === 'ATOLYE') {
                modalTitle.textContent = 'Kokteyl Atölyesi Bilgi ve Teklif Formu';
                hizmetTuruInput.value = 'ATÖLYE HİZMETİ';
            } else {
                modalTitle.textContent = 'Bar Hizmeti Teklif Formu';
                hizmetTuruInput.value = 'BAR HİZMETİ';
            }
            
            modalOverlay.style.display = 'flex'; // Modalı göster
            document.body.style.overflow = 'hidden'; // Sayfayı kaydırmayı engelle
        });
    });

    // Kapatma (X butonu)
    closeButton.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.style.display = 'none'; // Modalı gizle
        document.body.style.overflow = 'auto'; // Sayfa kaydırmayı geri aç
    });

    // Kapatma (Overlay'e tıklama)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});