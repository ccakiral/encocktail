// Google Apps Script URL'si buraya sabitlendi!
// Bu URL ARTIK DEĞİŞMEYECEK.
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz8YdWe9jdMhvSJg_QoptO2EyF9PhbYsuDIN3_GL_HvHKX7fVMv_xjrtGbnK0s6NnkK/exec";

// B. DOM Elementleri
const barForm = document.forms['barContact'];
const atolyeForm = document.forms['atolyeContact'];
const barLoader = document.getElementById('barLoader');
const atolyeLoader = document.getElementById('atolyeLoader');
const barModal = document.getElementById('bar-form-modal');
const atolyeModal = document.getElementById('atolye-form-modal');


// C. ORTAK FORM GÖNDERİM FONKSİYONU
function handleFormSubmit(e, form, loader, successUrl) {
    e.preventDefault();
    loader.style.display = 'block'; 
    
    const formData = new FormData(form);
    
    // Sadece Bar Formu için Kokteyl Seçimi verisini topla
    if (form.name === 'barContact') {
         const kokteylSecimi = Array.from(document.querySelectorAll('#barKokteylSecim input[name="Kokteyl_Secimi"]:checked'))
                                 .map(cb => cb.value)
                                 .join(', ');
        formData.set('Kokteyl_Secimi', kokteylSecimi);
        
        // Maksimum 4 çeşit kontrolü (Kritik kontrol)
        const maxAllowed = 4;
        const totalSelected = kokteylSecimi.split(',').filter(item => item.trim() !== '').length;

        if (totalSelected > maxAllowed) {
            alert(`Maksimum ${maxAllowed} çeşit kokteyl seçebilirsiniz. Lütfen seçiminizi azaltın.`);
            loader.style.display = 'none';
            return;
        }
    }
    
    // Veriyi Apps Script'in beklediği URL-encoded formata dönüştür
    const urlEncodedData = new URLSearchParams(formData).toString();
    
    fetch(GAS_WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        // KRİTİK: Headers'ı doğru ayarlıyoruz
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: urlEncodedData // URL-encoded string'i gönderiyoruz
    })
        .then(() => {
            loader.style.display = 'none'; 
            form.reset(); 
            // Başarılı sayfaya yönlendirmeden önce 1 saniye beklemek
            setTimeout(() => {
                window.location.href = successUrl; 
            }, 500);
        })
        .catch(error => {
            console.error(form.name + ' Formu Hata!', error.message);
            loader.style.display = 'none'; 
            alert('Formunuz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        });
}


// D. FORMLARA EVENT LISTENERS EKLE
barForm.addEventListener('submit', (e) => handleFormSubmit(e, barForm, barLoader, 'success.html'));
atolyeForm.addEventListener('submit', (e) => handleFormSubmit(e, atolyeForm, atolyeLoader, 'success.html'));


// E. MODAL AÇMA/KAPATMA LOGİĞİ (Değişmedi)
document.addEventListener('DOMContentLoaded', () => {
    const openButtons = document.querySelectorAll('.open-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    const modals = {
        '#bar-form-modal': barModal,
        '#atolye-form-modal': atolyeModal
    };

    openButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = button.getAttribute('href'); 
            const targetModal = modals[targetId];

            if (targetModal) {
                targetModal.style.display = 'flex'; 
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = button.closest('.modal-form-overlay');
            if (modal) {
                modal.style.display = 'none'; 
                document.body.style.overflow = 'auto'; 
            }
        });
    });

    [barModal, atolyeModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
});