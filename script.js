// Google Apps Script URL'si buraya sabitlendi!
// LÜTFEN BU URL'Yİ KENDİ AKTİF WEB APP URL'NİZLE DEĞİŞTİRDİĞİNİZDEN EMİN OLUN!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz8YdWe9jdMhvSJg_QoptO2EyF9PhbYsuDIN3_GL_HvHKX7fVMv_xjrtGbnK0s6NnkK/exec";

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

// B. ÜRÜN FİYATLARI VE TEDARİK SORUMLULUĞU 
const URUN_FIYATLARI = {
    'Lime suyu': { fiyat: 10, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Limon suyu': { fiyat: 10, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Kızılcık suyu': { fiyat: 8, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Elma Suyu': { fiyat: 7, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Nane şurubu': { fiyat: 15, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Şeker şurubu': { fiyat: 15, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Ev yapımı tonik şurubu': { fiyat: 20, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Vanilya şurubu': { fiyat: 25, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Ahududu şurubu': { fiyat: 20, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Bal şurubu': { fiyat: 18, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Soda': { fiyat: 5, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Gazlı' },
    'Proseco': { fiyat: 50, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şarap' },
    'Kuzukulağı': { fiyat: 10, birim: 'adet', tedarik: 'ENCOCKTAIL', miks_kategori: 'Diğer' },
    'Orman meyveleri sosu': { fiyat: 30, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Sos' },
    'Hibiskus çayı': { fiyat: 15, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'İçecek' },
    'Ananas püresi': { fiyat: 25, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Püre' },
    'Mango püresi': { fiyat: 30, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Püre' },
    'Acı biber sosu': { fiyat: 50, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Sos' },
    'Aromatik bitter': { fiyat: 100, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Diğer' },
    'Kahve likörü': { fiyat: 40, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Likör' },
    'Espresso': { fiyat: 15, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'İçecek' },
    'Campari': { fiyat: 50, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Likör' },
    'Rosso vermut': { fiyat: 45, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şarap' },
    'Aperol': { fiyat: 60, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Likör' },
    'Mürver çiçeği şurubu': { fiyat: 20, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Şurup' },
    'Portakal likörü': { fiyat: 35, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Likör' },
    'Vegan köpük yapıcı': { fiyat: 80, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Diğer' },
    'Zencefil gazozu': { fiyat: 7, birim: 'Litre', tedarik: 'ENCOCKTAIL', miks_kategori: 'Gazlı' },
    'Lime': { fiyat: 15, birim: 'KG', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Limon': { fiyat: 10, birim: 'KG', tedarik: 'ENCOCKTAIL', miks_kategori: 'Meyve' },
    'Buz': { fiyat: 2, birim: 'KG', tedarik: 'ENCOCKTAIL', miks_kategori: 'Diğer' },
    
    // MÜŞTERİ TARAFINDAN TEDARİK EDİLECEK ALKOLLER
    'Rom': { fiyat: 300, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Burbon viski': { fiyat: 500, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Tekila': { fiyat: 400, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'London Dry Gin': { fiyat: 450, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Cin': { fiyat: 450, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Votka': { fiyat: 350, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Limonlu votka': { fiyat: 380, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
    'Şampanya': { fiyat: 700, birim: 'Litre', tedarik: 'MÜŞTERİ', miks_kategori: 'Alkol' },
};

// C. MALZEME İHTİYACI/TARİFLERİ
const MALZEME_IHTIYACI = {
    // keyifli-menu
    'Mojito': { malzeme: { 'Rom': { miktar: 0.05, birim: 'Litre' }, 'Lime suyu': { miktar: 0.1, birim: 'Litre' }, 'Nane şurubu': { miktar: 0.05, birim: 'Litre' }, 'Soda': { miktar: 0.1, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Whiskey Sour': { malzeme: { 'Burbon viski': { miktar: 0.06, birim: 'Litre' }, 'Limon suyu': { miktar: 0.05, birim: 'Litre' }, 'Şeker şurubu': { miktar: 0.03, birim: 'Litre' }, 'Buz': { miktar: 0.12, birim: 'KG' } } },
    'Margarita': { malzeme: { 'Tekila': { miktar: 0.06, birim: 'Litre' }, 'Lime suyu': { miktar: 0.05, birim: 'Litre' }, 'Portakal likörü': { miktar: 0.02, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Cin Tonik': { malzeme: { 'London Dry Gin': { miktar: 0.05, birim: 'Litre' }, 'Ev yapımı tonik şurubu': { miktar: 0.05, birim: 'Litre' }, 'Soda': { miktar: 0.15, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    // ozel-menu
    'Green Shade': { malzeme: { 'Cin': { miktar: 0.05, birim: 'Litre' }, 'Kuzukulağı': { miktar: 0.01, birim: 'adet' }, 'Elma Suyu': { miktar: 0.1, birim: 'Litre' }, 'Buz': { miktar: 0.1, birim: 'KG' } } },
    'The Berry Patch': { malzeme: { 'Votka': { miktar: 0.05, birim: 'Litre' }, 'Orman meyveleri sosu': { miktar: 0.05, birim: 'Litre' }, 'Limon suyu': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Hibiscus Isle': { malzeme: { 'Rom': { miktar: 0.05, birim: 'Litre' }, 'Hibiskus çayı': { miktar: 0.1, birim: 'Litre' }, 'Vanilya şurubu': { miktar: 0.03, birim: 'Litre' }, 'Ananas püresi': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'The Spicy Sunset': { malzeme: { 'Tekila': { miktar: 0.06, birim: 'Litre' }, 'Mango püresi': { miktar: 0.05, birim: 'Litre' }, 'Bal şurubu': { miktar: 0.03, birim: 'Litre' }, 'Acı biber sosu': { miktar: 0.005, birim: 'Litre' }, 'Buz': { miktar: 0.12, birim: 'KG' } } },
    // seckin-menu
    'Old Fashioned': { malzeme: { 'Burbon viski': { miktar: 0.06, birim: 'Litre' }, 'Şeker şurubu': { miktar: 0.01, birim: 'Litre' }, 'Aromatik bitter': { miktar: 0.005, birim: 'Litre' }, 'Buz': { miktar: 0.1, birim: 'KG' } } },
    'Negroni': { malzeme: { 'Cin': { miktar: 0.05, birim: 'Litre' }, 'Campari': { miktar: 0.05, birim: 'Litre' }, 'Rosso vermut': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Espresso Martini': { malzeme: { 'Votka': { miktar: 0.05, birim: 'Litre' }, 'Kahve likörü': { miktar: 0.03, birim: 'Litre' }, 'Espresso': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.05, birim: 'KG' } } },
    'Aperol Spritz': { malzeme: { 'Aperol': { miktar: 0.075, birim: 'Litre' }, 'Proseco': { miktar: 0.1, birim: 'Litre' }, 'Soda': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    'Hugo Spritz': { malzeme: { 'Mürver çiçeği şurubu': { miktar: 0.03, birim: 'Litre' }, 'Proseco': { miktar: 0.1, birim: 'Litre' }, 'Soda': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    'French 75': { malzeme: { 'Cin': { miktar: 0.03, birim: 'Litre' }, 'Limon suyu': { miktar: 0.05, birim: 'Litre' }, 'Şeker şurubu': { miktar: 0.02, birim: 'Litre' }, 'Şampanya': { miktar: 0.1, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Cosmopolitan': { malzeme: { 'Limonlu votka': { miktar: 0.05, birim: 'Litre' }, 'Portakal likörü': { miktar: 0.02, birim: 'Litre' }, 'Kızılcık suyu': { miktar: 0.05, birim: 'Litre' }, 'Lime suyu': { miktar: 0.03, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
    'Clover Club': { malzeme: { 'Cin': { miktar: 0.05, birim: 'Litre' }, 'Limon suyu': { miktar: 0.03, birim: 'Litre' }, 'Ahududu şurubu': { miktar: 0.03, birim: 'Litre' }, 'Vegan köpük yapıcı': { miktar: 0.005, birim: 'Litre' }, 'Buz': { miktar: 0.1, birim: 'KG' } } },
    // Alkolsüzler
    'Lemonade': { malzeme: { 'Limon': { miktar: 0.2, birim: 'KG' }, 'Şeker şurubu': { miktar: 0.1, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    'Cool Lime': { malzeme: { 'Lime suyu': { miktar: 0.1, birim: 'Litre' }, 'Nane şurubu': { miktar: 0.02, birim: 'Litre' }, 'Şeker şurubu': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    'Berry Hibicus': { malzeme: { 'Orman meyveleri sosu': { miktar: 0.1, birim: 'Litre' }, 'Hibiskus çayı': { miktar: 0.1, birim: 'Litre' }, 'Lime suyu': { miktar: 0.03, birim: 'Litre' }, 'Buz': { miktar: 0.2, birim: 'KG' } } },
    'Mango Mule': { malzeme: { 'Zencefil gazozu': { miktar: 0.1, birim: 'Litre' }, 'Bal şurubu': { miktar: 0.03, birim: 'Litre' }, 'Mango püresi': { miktar: 0.05, birim: 'Litre' }, 'Buz': { miktar: 0.15, birim: 'KG' } } },
};

// *******************************************************************
// D. ORTAK FORM GÖNDERİM FONKSİYONU
// *******************************************************************
function handleFormSubmit(e, form, loader, successUrl) {
    e.preventDefault();
    loader.style.display = 'block'; 
    
    const formData = new FormData(form);
    
    if (form.name === 'barContact') {
        const kokteylSecimiArray = Array.from(document.querySelectorAll('#barKokteylSecim input[name="Kokteyl_Secimi"]:checked'))
                                 .map(cb => cb.value);
        
        formData.set('Kokteyl_Secimi', kokteylSecimiArray.join(', '));

        const misafirSayisi = parseFloat(formData.get('Misafir_Sayisi')) || 0;
        const servisSaati = parseFloat(formData.get('Servis_Saati')) || 0;
        
        // HESAPLAMA BAŞLANGICI
        let hesaplamaSonuclari = { toplamFiyat: 0, hizmetMaliyeti: 0, miksMaliyeti: 0, opsiyonelTedarikMaliyeti: 0, miksMalzemeTedarikListesi: [], tahminiKokteylAdedi: 0, ortalamaMaliyet: 0 };
        
        if (misafirSayisi > 0 && servisSaati > 0 && kokteylSecimiArray.length > 0) {
            hesaplamaSonuclari = hesaplaTeklif(misafirSayisi, servisSaati, kokteylSecimiArray);
        }
        // HESAPLAMA SONU

        // Hesaplama Sonuçlarını Sheets'e gitmek üzere formData'ya ekle
        formData.set('Teklif_Hizmet_Fiyat', hesaplamaSonuclari.hizmetMaliyeti.toFixed(2));
        formData.set('Teklif_Miks_Fiyat', hesaplamaSonuclari.miksMaliyeti.toFixed(2));
        formData.set('Teklif_Opsiyonel_Fiyat', hesaplamaSonuclari.opsiyonelTedarikMaliyeti.toFixed(2));
        formData.set('Teklif_Toplam_Fiyat', hesaplamaSonuclari.toplamFiyat.toFixed(2));
        // YENİ ALANLAR EKLENDİ
        formData.set('Tahmini_Kokteyl_Adedi', hesaplamaSonuclari.tahminiKokteylAdedi.toFixed(0));
        formData.set('Ortalama_Maliyet', hesaplamaSonuclari.ortalamaMaliyet.toFixed(2));
        
        // Detaylı Bilgileri success.html'e aktarmak için localStorage kullan
        localStorage.setItem('teklifDetaylari', JSON.stringify({
            toplamFiyat: hesaplamaSonuclari.toplamFiyat.toFixed(2),
            hizmetFiyat: hesaplamaSonuclari.hizmetMaliyeti.toFixed(2),
            miksFiyat: hesaplamaSonuclari.miksMaliyeti.toFixed(2),
            opsiyonelFiyat: hesaplamaSonuclari.opsiyonelTedarikMaliyeti.toFixed(2),
            // YENİ ALANLAR EKLENDİ
            kokteylAdedi: hesaplamaSonuclari.tahminiKokteylAdedi.toFixed(0),
            ortalamaMaliyet: hesaplamaSonuclari.ortalamaMaliyet.toFixed(2),
            miksMalzemeTedarikListesi: hesaplamaSonuclari.miksMalzemeTedarikListesi, 
        }));
    }

    // --- FETCH (GÖNDERİM) KISMI ---
    fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData).toString()
    })
    .then(response => {
        loader.style.display = 'none'; 
        window.location.href = successUrl; 
    })
    .catch(error => {
        loader.style.display = 'none'; 
        console.error('Gönderim hatası:', error);
        alert('Form gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    });
}

// *** HESAPLAMA MANTIĞI FONKSİYONU *** (YENİ RETURN DEĞERLERİ EKLENDİ)
function hesaplaTeklif(misafirSayisi, servisSaati, kokteylSecimiArray) {
    // --- 1. Toplam Tahmini Kokteyl Adedini Hesapla ---
    const tahminiKokteylAdedi = misafirSayisi * servisSaati * SABITLER.TUKETIM_ORANI_SAAT;

    // --- 2. Hizmet Maliyetini Hesapla ---
    let hizmetMaliyeti = SABITLER.MINIMUM_UCRET; 
    if (servisSaati > SABITLER.MINIMUM_SAAT) {
        hizmetMaliyeti += (servisSaati - SABITLER.MINIMUM_SAAT) * SABITLER.EK_SAAT_UCRET;
    }
    
    if (kokteylSecimiArray.length > SABITLER.MAKS_KOKTEYL_CESIDI) {
        hizmetMaliyeti += (kokteylSecimiArray.length - SABITLER.MAKS_KOKTEYL_CESIDI) * SABITLER.EK_KOKTEYL_UCRET;
    }
    
    // --- 3. Miks Malzeme İhtiyacını Hesapla ve Maliyetleri Ayır ---
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
            // Buz için güvenlik marjını sadece Buz malzemesine uygula
             if (malzemeAdi === 'Buz') {
                ihtiyac.miktar *= SABITLER.GUVENLIK_MARJI_BUZ;
            }
            
            const maliyet = ihtiyac.miktar * urun.fiyat;
            
            if (urun.tedarik === 'ENCOCKTAIL') {
                miksMaliyeti += maliyet;
                // Liste detaylarını topla
                miksMalzemeTedarikListesi.push({ 
                    isim: malzemeAdi, 
                    miktar: ihtiyac.miktar, 
                    birim: urun.birim,
                    fiyat: (ihtiyac.miktar * urun.fiyat).toFixed(2)
                });
            } else if (urun.tedarik === 'MÜŞTERİ') {
                opsiyonelTedarikMaliyeti += maliyet;
            }
        }
    }
    
    const toplamFiyat = hizmetMaliyeti + miksMaliyeti;
    const ortalamaMaliyet = (miksMaliyeti / tahminiKokteylAdedi) || 0; // Ortalama maliyeti hesapla

    return {
        hizmetMaliyeti: hizmetMaliyeti,
        miksMaliyeti: miksMaliyeti,
        opsiyonelTedarikMaliyeti: opsiyonelTedarikMaliyeti,
        toplamFiyat: toplamFiyat,
        tahminiKokteylAdedi: tahminiKokteylAdedi, // YENİ EKLENDİ
        ortalamaMaliyet: ortalamaMaliyet,         // YENİ EKLENDİ
        miksMalzemeTedarikListesi: miksMalzemeTedarikListesi,
    };
}


// E. FORM DİNLEYİCİLERİ VE MODAL LOGİĞİ (DEĞİŞMEDİ)
barForm.addEventListener('submit', (e) => handleFormSubmit(e, barForm, barLoader, 'success.html'));
atolyeForm.addEventListener('submit', (e) => handleFormSubmit(e, atolyeForm, atolyeLoader, 'success.html'));

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