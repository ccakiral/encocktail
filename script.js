// Google Apps Script URL'si buraya sabitlendi!
// En son ve çalışan URL budur.
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxPJd7fi_pIO87Ls5FAUZBhEwVeLmglPad3cegkWdaJ1q4BWdDWxP5Yqwp3ZmtjRDEr/exec"; 

// B. DOM Elementleri 
const barForm = document.forms['barContact'];
const atolyeForm = document.forms['atolyeContact'];
const barLoader = document.getElementById('barLoader');
const atolyeLoader = document.getElementById('atolyeLoader');
const barModal = document.getElementById('bar-form-modal');
const atolyeModal = document.getElementById('atolye-form-modal');

// *******************************************************************
// A. SABİT HİZMET VE FİYAT KURALLARI
// *******************************************************************
const SABITLER = {
    MINIMUM_SAAT: 3,
    MINIMUM_UCRET: 500,       
    EK_SAAT_UCRET: 100,
    EK_KOKTEYL_UCRET: 60,     
    MAKS_KOKTEYL_CESIDI: 3,   
    TUKETIM_ORANI_SAAT: 1.5,  
    GUVENLIK_MARJI_BUZ: 1.10, 
};

// Ürün ve Tedarik Listesi (Yer kazanmak için tam listeyi atlıyorum, kodunuzda tam olmalıdır)
const URUN_FIYATLARI = {
    'Lime suyu': { fiyat: 10, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Limon suyu': { fiyat: 10, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    // ... Diğer ENCOCKTAIL malzemeleri
    'Buz': { fiyat: 2, birim: 'KG', tedarik: 'ENCOCKTAIL', miks_kategori: 'Diğer' },
    'Rom': { fiyat: 300, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    // ... Diğer MÜŞTERİ (Alkol) malzemeleri
};

// Kokteyl Tarifleri (Yer kazanmak için tam listeyi atlıyorum, kodunuzda tam olmalıdır)
const MALZEME_IHTIYACI = {
    'Mojito': { malzeme: { 'Rom': { miktar: 0.05, birim: 'Litre' }, 'Lime suyu': { miktar: 0.1, birim: 'Litre' }, 'Nane şurubu': { miktar: 0.05, birim: 'Litre' }, 'Soda': { miktar: 0.1, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Whiskey Sour': { malzeme: { 'Burbon viski': { miktar: 0.06, birim: 'Litre' }, 'Limon suyu': { miktar: 0.05, birim: 'Litre' }, 'Şeker şurubu': { miktar: 0.03, birim: 'Litre' }, 'Buz': { miktar: 0.12, birim: 'KG' } } },
    // ... Diğer tarifler
};


// *******************************************************************
// C. ORTAK FORM GÖNDERİM FONKSİYONU
// *******************************************************************
function handleFormSubmit(e, form, loader, successUrl) {
    e.preventDefault();
    loader.style.display = 'block'; 
    
    const formData = new FormData(form);
    formData.set('type', form.name); // Hangi formun gönderildiğini Apps Script'e bildir

    if (form.name === 'barContact') {
        const kokteylSecimiArray = Array.from(document.querySelectorAll('#barKokteylSecim input[name="Kokteyl_Secimi"]:checked'))
                                 .map(cb => cb.value);
        
        const misafirSayisi = parseFloat(formData.get('Misafir_Sayisi')) || 0;
        const servisSaati = parseFloat(formData.get('Servis_Saati')) || 0;
        
        formData.set('Kokteyl_Secimi', kokteylSecimiArray.join(', '));
        
        let hesaplamaSonuclari = { toplamFiyat: 0, hizmetMaliyeti: 0, miksMaliyeti: 0, opsiyonelTedarikMaliyeti: 0, miksMalzemeTedarikListesi: [], tahminiKokteylAdedi: 0, ortalamaMaliyet: 0 };
        
        if (misafirSayisi > 0 && servisSaati > 0 && kokteylSecimiArray.length > 0) {
            hesaplamaSonuclari = hesaplaTeklif(misafirSayisi, servisSaati, kokteylSecimiArray);
        }
        
        // Hesaplama Sonuçlarını Sheets'e gitmek üzere formData'ya ekle
        formData.set('Teklif_Hizmet_Fiyat', hesaplamaSonuclari.hizmetMaliyeti.toFixed(2));
        formData.set('Teklif_Miks_Fiyat', hesaplamaSonuclari.miksMaliyeti.toFixed(2));
        formData.set('Teklif_Opsiyonel_Fiyat', hesaplamaSonuclari.opsiyonelTedarikMaliyeti.toFixed(2));
        formData.set('Teklif_Toplam_Fiyat', hesaplamaSonuclari.toplamFiyat.toFixed(2));
        formData.set('Tahmini_Kokteyl_Adedi', hesaplamaSonuclari.tahminiKokteylAdedi.toFixed(0));
        formData.set('Ortalama_Maliyet', hesaplamaSonuclari.ortalamaMaliyeti.toFixed(2));
        
        // Detaylı Bilgileri success.html'e aktarmak için localStorage kullan
        localStorage.setItem('teklifDetaylari', JSON.stringify({
            toplamFiyat: hesaplamaSonuclari.toplamFiyat.toFixed(2),
            hizmetFiyat: hesaplamaSonuclari.hizmetMaliyeti.toFixed(2),
            miksFiyat: hesaplamaSonuclari.miksMaliyeti.toFixed(2),
            opsiyonelFiyat: hesaplamaSonuclari.opsiyonelTedarikMaliyeti.toFixed(2),
            kokteylAdedi: hesaplamaSonuclari.tahminiKokteylAdedi.toFixed(0),
            ortalamaMaliyet: hesaplamaSonuclari.ortalamaMaliyeti.toFixed(2),
            miksMalzemeTedarikListesi: hesaplamaSonuclari.miksMalzemeTedarikListesi, 
        }));
    }

    // --- FETCH (GÖNDERİM) KISMI ---
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            // Bu header, GAS'in veriyi doğru (e.parameter) okumasını sağlar.
            'Content-Type': 'application/x-www-form-urlencoded', 
        },
        // FormData'yı URLSearchParams'e çevirerek gönderme
        body: new URLSearchParams(formData).toString() 
    })
    .then(response => {
        // GAS'ten yanıt başarılı olsa da olmasa da, Success sayfasına yönlendiriliriz.
        loader.style.display = 'none'; 
        window.location.href = successUrl; 
    })
    .catch(error => {
        loader.style.display = 'none'; 
        console.error('Gönderim hatası:', error);
        alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    });
}

// *** HESAPLAMA MANTIĞI FONKSİYONU *** (Doğru ve öncekiyle aynıdır)
function hesaplaTeklif(misafirSayisi, servisSaati, kokteylSecimiArray) {
    // 1. Tahmini Kokteyl Adedi
    const tahminiKokteylAdedi = misafirSayisi * servisSaati * SABITLER.TUKETIM_ORANI_SAAT;

    // 2. Hizmet Maliyeti
    let hizmetMaliyeti = SABITLER.MINIMUM_UCRET; 
    if (servisSaati > SABITLER.MINIMUM_SAAT) {
        hizmetMaliyeti += (servisSaati - SABITLER.MINIMUM_SAAT) * SABITLER.EK_SAAT_UCRET;
    }
    if (kokteylSecimiArray.length > SABITLER.MAKS_KOKTEYL_CESIDI) {
        hizmetMaliyeti += (kokteylSecimiArray.length - SABITLER.MAKS_KOKTEYL_CESIDI) * SABITLER.EK_KOKTEYL_UCRET;
    }
    
    // 3. Miks Malzeme İhtiyacı ve Maliyetleri
    const toplamMalzemeIhtiyaci = {};
    
    kokteylSecimiArray.forEach(kokteylAdi => {
        const tarif = MALZEME_IHTIYACI[kokteylAdi];
        if (tarif) {
            for (const [malzemeAdi, detay] of Object.entries(tarif.malzeme)) {
                const toplamMiktar = detay.miktar * tahminiKokteylAdedi;
                
                if (!toplamMalzemeIhtiyaci[malzemeAdi]) {
                    toplamMalzemeIhtiyaci[malzemeAdi] = { miktar: 0, birim: detay.birim };
                }
                toplamMalzemeIhtiyaci[malzemeAdi].miktar += toplamMiktar;
            }
        }
    });

    let miksMaliyeti = 0; 
    let opsiyonelTedarikMaliyeti = 0; 
    const miksMalzemeTedarikListesi = [];

    for (const [malzemeAdi, ihtiyac] of Object.entries(toplamMalzemeIhtiyaci)) {
        const urun = URUN_FIYATLARI[malzemeAdi];
        if (urun) {
             if (malzemeAdi === 'Buz') {
                ihtiyac.miktar *= SABITLER.GUVENLIK_MARJI_BUZ;
            }
            
            const maliyet = ihtiyac.miktar * urun.fiyat;
            
            if (urun.tedarik === 'ENCOCKTAIL') {
                miksMaliyeti += maliyet;
                miksMalzemeTedarikListesi.push({ 
                    isim: malzemeAdi, 
                    miktar: ihtiyac.miktar, 
                    birim: urun.birim,
                });
            } else if (urun.tedarik === 'MÜŞTERİ') {
                opsiyonelTedarikMaliyeti += maliyet;
            }
        }
    }
    
    const toplamFiyat = hizmetMaliyeti + miksMaliyeti;
    const ortalamaMaliyet = (miksMaliyeti / tahminiKokteylAdedi) || 0;

    return {
        hizmetMaliyeti: hizmetMaliyeti,
        miksMaliyeti: miksMaliyeti,
        opsiyonelTedarikMaliyeti: opsiyonelTedarikMaliyeti,
        toplamFiyat: toplamFiyat,
        tahminiKokteylAdedi: tahminiKokteylAdedi, 
        ortalamaMaliyet: ortalamaMaliyeti,         
        miksMalzemeTedarikListesi: miksMalzemeTedarikListesi,
    };
}


// E. FORM DİNLEYİCİLERİ VE MODAL LOGİĞİ (DEĞİŞMEDİ)
barForm.addEventListener('submit', (e) => handleFormSubmit(e, barForm, barLoader, 'success.html'));
atolyeForm.addEventListener('submit', (e) => handleFormSubmit(e, atolyeForm, atolyeLoader, 'success.html'));

document.addEventListener('DOMContentLoaded', () => {
    // Modal açma/kapama mantığı buraya kopyalanmıştır.
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