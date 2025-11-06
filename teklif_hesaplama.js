// Google Apps Script URL'si buraya sabitlendi!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzrZHqPoB6p8gOqhpVbzqN4LjVw_5D-zEIWwZKC2YTbLOZxPNFZ6x0VDSTjvfN9lcQH/exec";

// A. SABİT HİZMET VE FİYAT KURALLARI
const SABITLER = {
    MINIMUM_SAAT: 3,
    MINIMUM_UCRET: 25000,       // 3 Saat servis için sabit ücret
    EK_SAAT_UCRET: 7500,        
    EK_KOKTEYL_UCRET: 5000,     // 3 çeşidi aşan her kokteyl için
    MAKS_KOKTEYL_CESIDI: 4,     // Maksimum seçilebilecek çeşit sayısı
    TUKETIM_ORANI_SAAT: 1.5,    // Misafir * Saat * 1.5 formülü için katsayı (Ortalama kokteyl tüketimi)
    GUVENLIK_MARJI_BUZ: 1.10,   // Buz için %10 erime/güvenlik marjı
};

// YENİ: EKSTRA HİZMET SABİTLERİ
const EKSTRA_HIZMETLER = {
    "MASALARA_MENU": {
        isim: "Masalara Özel Kokteyl Menüsü",
        fiyat: 15, // TL
        birim: "Kişi",
        carpimFaktoru: "misafirSayisi"
    },
    "KURU_BUZLU_SUNUM": {
        isim: "Kuru Buzlu/Özel Sunum Efekti",
        fiyat: 5000, // TL
        birim: "Sabit",
        carpimFaktoru: "sabit"
    },
    "CAM_BARDAK_KIRALAMA": {
        isim: "Lüks Cam Bardak Kiralama",
        fiyat: 25, // TL
        birim: "Kişi",
        carpimFaktoru: "misafirSayisi"
    },
    "OZEL_BARDAK_BASKI": {
        isim: "Bardaklara Özel Baskı/Etiket",
        fiyat: 5, // TL
        birim: "Bardak",
        carpimFaktoru: "kokteylAdedi" // Hesaplanan toplam kokteyl adedi ile çarpılacak
    },
    "MOBILE_BAR_KIRALAMA": {
        isim: "Ekstra Mobile Bar Tezgahı Kiralama",
        fiyat: 5000, // TL
        birim: "Sabit",
        carpimFaktoru: "sabit"
    },
    "OZEL_KOKTEYL_TASARLAMA": {
        isim: "Etkinliğe Özel Kokteyl Tasarlama",
        fiyat: 1000, // TL
        birim: "Sabit",
        carpimFaktoru: "sabit"
    },
    // Bu ekstra, diğerleri gibi seçilmeyecek, KM input'u üzerinden otomatik hesaplanıp gösterilecek.
    "UZAK_MESAFE": { 
        isim: "Uzak Mesafe Ulaşım (Bornova Bazlı)",
        fiyat: 10, // TL/KM
        birim: "KM",
        carpimFaktoru: "uzakMesafeKM",
        otomatikHesaplanan: true
    }
};


// B. ÜRÜN FİYATLARI VE TEDARİK SORUMLULUĞU
const URUN_FIYATLARI = {
    // Fiyatlar Litre bazlıdır (BUZ hariç). (Örn: 1500 TL/Litre)
    // --- ENCOCKTAIL (Zorunlu Satışlar - Miks Malzemeler) ---
    "PORTAKAL_LIKORU":     { fiyat: 1500, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "LIKORLER" }, 
    "KAHVE_LIKORU":        { fiyat: 1500, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "LIKORLER" }, 

    "KAHVE_SOGUK_DEMLEME":{ fiyat: 750, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "SUPER_JUICE_LIME":    { fiyat: 500, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "LIMON_SUYU":          { fiyat: 500,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "CRANBERRY_SUYU":      { fiyat: 500,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "LIMONATA_SUYU":       { fiyat: 500,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "COOL_LIME_SUYU":      { fiyat: 750, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "BERRY_HIBISCUS_SUYU":{ fiyat: 750, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 

    "SEKER_SURUBU":        { fiyat: 250,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" }, 
    "TONIK_SURUBU":        { fiyat: 500, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" }, 
    "ELDERFLOWER_SURUBU": { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" }, 
    "BAL_SURUBU":          { fiyat: 1000,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" }, 
    "AHUDUDU_SURUBU":      { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" }, 

    "HIBISKUS_SOSU":       { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, 
    "KUZUKULAGI_SOSU":     { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, 
    "MANGO_SOSU":          { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, 
    "ORMANMEYVE_SOSU":     { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, 
    "MANGO_MULE_SOSU":     { fiyat: 1000, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, 
    
    "PORTAKAL_DILIMI": { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "LIME_DILIMI":      { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "NANE_DALI":        { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "LIMON_DILIMI":     { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "BIBER_DILIMI":     { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "FESLEGEN":         { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 
    "BERRY":            { fiyat: 5, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, 

    "TATLANDIRICI":     { fiyat: 5,  birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "KATKI" }, 
    "KOPUK":            { fiyat: 5,  birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "KATKI" }, 
    
    // --- MÜŞTERİ TEDARİĞİ (Ana Alkollü İçecekler) ---
    "CIN":        { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "VOTKA":      { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "ROM":        { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "VISKI":      { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "TEKILA":     { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "BOURBON":    { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "APEROL":     { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "RAKI":       { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "KIRMIZI_VERMUT": { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "CAMPARI":    { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 
    "KOPUKLU_SARAP": { fiyat: 1500, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1500, grup: "ALKOLLER" }, 

    "BUZ":        { fiyat: 35,  birim: "Kg",    satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 35, grup: "DIGER" },    
    "SODA_TONIK_SU": { fiyat: 50, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 50, grup: "DIGER" }, 
    "ZENCEFILLI_GAZOZ": { fiyat: 100, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 100, grup: "DIGER" }, 
};

// C. ALKOLLERİN ŞİŞE HACMİ VE MARKA BİLGİLERİ (cL bazında)
const ALKOLLER_SISE_HACIMLERI = {
    "CIN":      { hacim_cl: 100, marka: "Bombay, Gordon's, Beefeater" },
    "VOTKA":    { hacim_cl: 100, marka: "Absolut, Smirnoff" },
    "ROM":      { hacim_cl: 70, marka: "Bacardi, Captain Morgan" },
    "VISKI":    { hacim_cl: 70, marka: "Jack Daniel's, Johnnie Walker" },
    "TEKILA":   { hacim_cl: 70, marka: "Olmeca, Jose Cuervo" },
    "BOURBON": { hacim_cl: 70, marka: "Jim Beam, Wild Turkey" },
    "APEROL":   { hacim_cl: 100, marka: "Aperol" }, 
    "RAKI":      { hacim_cl: 70, marka: "Yeni Rakı, Efe" },
    "KIRMIZI_VERMUT": { hacim_cl: 100, marka: "Martini Rosso" },
    "CAMPARI": { hacim_cl: 100, marka: "Campari" },
    "KOPUKLU_SARAP": { hacim_cl: 75, marka: "Prosecco, Şampanya" },
    
    "DIGER_TEDARIK": {
        "BUZ": { birim: "Kg", marka: "buzzizmir" },
        "SODA_TONIK_SU": { birim: "Litre", marka: "Uludağ, Freşa, Özkaynak, Kızılay, Sarıkız" },
        "ZENCEFILLI_GAZOZ": { birim: "Litre", marka: "Beyoğlu" }
    }
};


// D. KOKTEYL REÇETELERİ
// Not: Sıvılar Santilitre (cL), Buz Gram (g), Garnitür/Katkı Adet (Adet) cinsindendir.
const RECELLER = {
    "MOJITO":             { ROM: 4.5, SUPER_JUICE_LIME: 3, SEKER_SURUBU: 2, NANE_DALI: 5, SODA_TONIK_SU: 6, BUZ: 250 },
    "WHISKEY_SOUR":       { BOURBON: 6, LIMON_SUYU: 3, SEKER_SURUBU: 1.5, BUZ: 100, KOPUK: 1 },
    "MARGARITA":          { TEKILA: 5, PORTAKAL_LIKORU: 2.5, SUPER_JUICE_LIME: 2.5, BUZ: 100, LIME_DILIMI: 1 },
    "GIN_TONIC":          { CIN: 6, TONIK_SURUBU: 2, SODA_TONIK_SU: 12, LIME_DILIMI: 2, BUZ: 250 },
    "OLD_FASHIONED":      { BOURBON: 6, SEKER_SURUBU: 1, TATLANDIRICI: 2, BUZ: 100, PORTAKAL_DILIMI: 1 },
    "NEGRONI":            { CIN: 3, KIRMIZI_VERMUT: 3, CAMPARI: 3, PORTAKAL_DILIMI: 1, BUZ: 150 },
    "ESPRESSO_MARTINI":   { VOTKA: 5, KAHVE_LIKORU: 3, KAHVE_SOGUK_DEMLEME: 3, SEKER_SURUBU: 1, BUZ: 100, KOPUK: 1 },
    "APEROL_SPRITZ":      { KOPUKLU_SARAP: 9, APEROL: 6, SODA_TONIK_SU: 3, PORTAKAL_DILIMI: 1, BUZ: 200 },
    "HUGO_SPRITZ":        { ELDERFLOWER_SURUBU: 2, KOPUKLU_SARAP: 10, SODA_TONIK_SU: 5, NANE_DALI: 5, BUZ: 200 },
    "FRENCH_75":          { CIN: 3, LIMON_SUYU: 1.5, SEKER_SURUBU: 1, KOPUKLU_SARAP: 9, LIME_DILIMI: 1, BUZ: 50 },
    "COSMOPOLITAN":       { VOTKA: 4.5, PORTAKAL_LIKORU: 1.5, CRANBERRY_SUYU: 4.5, SUPER_JUICE_LIME: 1.5, BUZ: 100 },
    "CLOVER_CLUB":        { CIN: 4.5, AHUDUDU_SURUBU: 1.5, SUPER_JUICE_LIME: 2.25, BUZ: 100, KOPUK: 1, NANE_DALI: 1 },
    "GREEN SHADE":        { CIN: 5, KUZUKULAGI_SOSU: 7.5, BUZ: 200, KOPUK: 1, LIME_DILIMI: 1},
    "THE_BERRY_PATCH":    { VOTKA: 5, ORMANMEYVE_SOSU: 7.5, BUZ: 200, FESLEGEN: 1, BERRY: 3,}, 
    "HIBISCUS_ISLE":      { ROM: 5, HIBISKUS_SOSU: 7.5, BUZ: 200, NANE_DALI: 1, LIME_DILIMI: 1 }, 
    "THE_SPICY_SUNSET":   { VOTKA: 5, MANGO_SOSU: 7.5, BUZ: 200, BIBER_DILIMI: 1}, 
    "LEMONADE":           { LIMONATA_SUYU: 15, LIMON_DILIMI: 1, BUZ: 250 },
    "COOL_LIME":          { COOL_LIME_SUYU: 15, LIME_DILIMI: 1, NANE_DALI: 1, BUZ: 250 },
    "BERRY_HIBISCUS":     { BERRY_HIBISCUS_SUYU: 15, BERRY: 3, NANE_DALI: 1, BUZ: 250 },
    "MANGO_MULE":         { MANGO_MULE_SOSU: 9, ZENCEFILLI_GAZOZ: 6, LIMON_DILIMI: 1, BUZ: 250 }
};

// E. ELEMENTLERİ AL
const misafirSayisiInput = document.getElementById('misafirSayisi');
const servisSaatiInput = document.getElementById('servisSaati');
const uzakMesafeKMInput = document.getElementById('uzakMesafeKM'); 
const hesaplaButton = document.getElementById('calculateButton');
const submitButton = document.getElementById('submitButton'); 
const musteriIletisimInput = document.getElementById('musteriIletisim'); 
const telefonNumarasiInput = document.getElementById('telefonNumarasi'); 
const kokteylSecimiKapsayici = document.getElementById('kokteylSecimiKapsayici'); 
const ekstraSecimiKapsayici = document.getElementById('ekstraSecimiKapsayici'); 


// F. YARDIMCI FONKSİYONLAR
function formatCurrency(amount) {
    return `₺${amount.toFixed(2)}`;
}

// G. KOKTEYL CHECKBOX'LARINI DİNAMİK OLARAK OLUŞTUR
function kokteylCheckboxlariOlustur() {
    kokteylSecimiKapsayici.innerHTML = ''; 
    const kokteyller = Object.keys(RECELLER);
    kokteyller.forEach((kokteyl) => {
        const div = document.createElement('div');
        div.classList.add('checkbox-item');
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = kokteyl.toLowerCase().replace(/ /g, '_'); 
        input.name = 'kokteyl';
        input.value = kokteyl; 
        
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = kokteyl.replace(/_/g, ' '); 

        div.appendChild(input);
        div.appendChild(label);
        kokteylSecimiKapsayici.appendChild(div);
    });
}

// YENİ: EKSTRA CHECKBOX'LARINI DİNAMİK OLARAK OLUŞTUR
function ekstraCheckboxlariOlustur() {
    ekstraSecimiKapsayici.innerHTML = '';

    // Uzak Mesafe maliyetini göstermek için bir alan oluştur (checkbox değil, otomatik hesaplanıyor)
    const uzakMesafeGosterim = document.createElement('div');
    uzakMesafeGosterim.classList.add('checkbox-item'); 
    uzakMesafeGosterim.id = 'uzakMesafeMaliyetGosterim';
    uzakMesafeGosterim.innerHTML = `
        <label>Uzak Mesafe Ulaşım (KM Başı ₺${EKSTRA_HIZMETLER.UZAK_MESAFE.fiyat}):</label>
        <strong id="uzakMesafeMaliyeti" style="margin-left: auto;">₺0.00</strong>
    `;
    ekstraSecimiKapsayici.appendChild(uzakMesafeGosterim);

    // Diğer Seçilebilir Ekstralar (Checkbox)
    const ekstralar = Object.keys(EKSTRA_HIZMETLER).filter(key => !EKSTRA_HIZMETLER[key].otomatikHesaplanan);

    ekstralar.forEach((ekstraKey) => {
        const ekstra = EKSTRA_HIZMETLER[ekstraKey];
        const div = document.createElement('div');
        div.classList.add('checkbox-item');
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = ekstraKey.toLowerCase().replace(/_/g, '-'); 
        input.name = 'ekstra';
        input.value = ekstraKey; 
        
        let fiyatEtiketi = '';
        if (ekstra.birim === 'Sabit') {
            fiyatEtiketi = ` (${formatCurrency(ekstra.fiyat)})`;
        } else if (ekstra.birim === 'Kişi') {
            fiyatEtiketi = ` (Kişi Başı ${formatCurrency(ekstra.fiyat)})`;
        } else if (ekstra.birim === 'Bardak') {
            fiyatEtiketi = ` (Bardak Başı ${formatCurrency(ekstra.fiyat)} - Tahmini Adet)`;
        }

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.innerHTML = ekstra.isim + fiyatEtiketi;

        div.appendChild(input);
        div.appendChild(label);
        ekstraSecimiKapsayici.appendChild(div); 
    });
}

// H. ANA HESAPLAMA FONKSİYONU 
function teklifiHesapla(shouldScroll = false) {
    
    // 1. Veri Alımı ve Doğrulama
    const misafirSayisi = parseInt(misafirSayisiInput.value);
    const servisSaati = parseInt(servisSaatiInput.value);
    const uzakMesafeKM = parseInt(uzakMesafeKMInput.value) || 0; 
    
    const seciliKokteylElementleri = document.querySelectorAll('input[name="kokteyl"]:checked');
    const kokteylSecimi = Array.from(seciliKokteylElementleri).map(el => el.value);
    const seciliEkstraElementleri = document.querySelectorAll('input[name="ekstra"]:checked'); 
    const ekstraSecimi = Array.from(seciliEkstraElementleri).map(el => el.value);

    // Geçerlilik kontrolü (hesaplama yapılmazsa veya hatalıysa sıfırla)
    if (isNaN(misafirSayisi) || misafirSayisi < 10 || isNaN(servisSaati) || servisSaati < SABITLER.MINIMUM_SAAT || kokteylSecimi.length === 0) {
        // Hatalı durumda sıfırla ve çık
        document.getElementById('toplamFiyat').textContent = formatCurrency(0);
        listeleriGoster([], []);
        ekstraMaliyetTablosunuGoster([], SABITLER.MINIMUM_UCRET, 0, 0); 
        document.getElementById('uzakMesafeMaliyeti').textContent = formatCurrency(0);
        if (shouldScroll) {
            alert("Lütfen tüm zorunlu alanları (Min. Misafir: 10, Min. Saat: 3) doldurun ve en az bir kokteyl seçimi yapın.");
        }
        return;
    }

    if (kokteylSecimi.length > SABITLER.MAKS_KOKTEYL_CESIDI) {
        alert(`Maksimum ${SABITLER.MAKS_KOKTEYL_CESIDI} çeşit kokteyl seçebilirsiniz. Lütfen seçiminizi azaltın.`);
        return;
    }

    // 2. Tüketim ve Temel Hesaplamalar
    const tahminiKokteylAdedi = Math.ceil(misafirSayisi * servisSaati * SABITLER.TUKETIM_ORANI_SAAT);
    
    const temelHizmetUcreti = SABITLER.MINIMUM_UCRET;
    const ekSaatUcreti = (servisSaati > SABITLER.MINIMUM_SAAT)
        ? (servisSaati - SABITLER.MINIMUM_SAAT) * SABITLER.EK_SAAT_UCRET
        : 0;
    
    const kokteylCesitUcreti = (kokteylSecimi.length > 3) 
        ? (kokteylSecimi.length - 3) * SABITLER.EK_KOKTEYL_UCRET 
        : 0;

    // 3. EKSTRA HİZMET MALİYETİ HESAPLAMASI
    let ekstraMaliyeti = 0;
    let ekstraMaliyetListesi = [];

    // Uzak Mesafe (Otomatik Hesaplanan)
    const uzakMesafeBilgi = EKSTRA_HIZMETLER.UZAK_MESAFE;
    const uzakMesafeMaliyeti = uzakMesafeKM * uzakMesafeBilgi.fiyat;
    ekstraMaliyeti += uzakMesafeMaliyeti;
    ekstraMaliyetListesi.push({
        isim: uzakMesafeBilgi.isim,
        miktar: uzakMesafeKM,
        birim: uzakMesafeBilgi.birim,
        fiyat: uzakMesafeMaliyeti,
        tip: 'KM'
    });
    // Uzak Mesafe maliyetini ekstra listeleme alanında göster
    document.getElementById('uzakMesafeMaliyeti').textContent = formatCurrency(uzakMesafeMaliyeti);


    // Diğer Seçili Ekstralar (Checkbox)
    ekstraSecimi.forEach(ekstraKey => {
        const ekstraBilgi = EKSTRA_HIZMETLER[ekstraKey];
        let carpan = 0;
        if (ekstraBilgi.carpimFaktoru === "misafirSayisi") {
            carpan = misafirSayisi;
        } else if (ekstraBilgi.carpimFaktoru === "kokteylAdedi") {
            carpan = tahminiKokteylAdedi;
        } else { // Sabit
            carpan = 1;
        }

        const maliyet = carpan * ekstraBilgi.fiyat;
        ekstraMaliyeti += maliyet;

        ekstraMaliyetListesi.push({
            isim: ekstraBilgi.isim,
            miktar: carpan,
            birim: ekstraBilgi.birim,
            fiyat: maliyet,
            tip: ekstraBilgi.carpimFaktoru
        });
    });

    // 4. MİKS ve OPSİYONEL MALİYET HESAPLAMASI
    let toplamMalzemeIhtiyaci = {};
    kokteylSecimi.forEach(kokteyl => {
        const recete = RECELLER[kokteyl];
        if (recete) {
            // Ortalama alarak ekle (Önceki JS'deki mantık)
            for (const malzeme in recete) {
                const miktar = recete[malzeme] / kokteylSecimi.length; 
                toplamMalzemeIhtiyaci[malzeme] = (toplamMalzemeIhtiyaci[malzeme] || 0) + miktar;
            }
        }
    });

    let miksMaliyeti = 0;
    let opsiyonelTedarikMaliyeti = 0;
    let encocktailTedarikListesi = [];
    let musteriTedarikListesi = [];
    
    for (const malzeme in toplamMalzemeIhtiyaci) {
        const bilgi = URUN_FIYATLARI[malzeme];
        if (!bilgi) continue;

        let satinAlinacakMiktar = 0;
        let gerekliMiktarHesapBiriminde = toplamMalzemeIhtiyaci[malzeme] * tahminiKokteylAdedi;

        // KRİTİK BİRİM DÖNÜŞÜMÜ
        if (malzeme === "BUZ") {
            if (gerekliMiktarHesapBiriminde > 0) {
              gerekliMiktarHesapBiriminde = gerekliMiktarHesapBiriminde / 1000; // g -> Kg
            }
        } else if (bilgi.birim !== "Adet") {
            if (gerekliMiktarHesapBiriminde > 0) {
              gerekliMiktarHesapBiriminde = gerekliMiktarHesapBiriminde / 100; // cL -> L
            }
        }
        if (malzeme === "BUZ") {
            gerekliMiktarHesapBiriminde *= SABITLER.GUVENLIK_MARJI_BUZ; 
        }

        const satisKati = bilgi.satisKati || 1;
        satinAlinacakMiktar = Math.ceil(gerekliMiktarHesapBiriminde / satisKati) * satisKati;
        const maliyet = satinAlinacakMiktar * bilgi.fiyat;

        if (bilgi.tedarikci === "ENCOCKTAIL") {
            miksMaliyeti += maliyet;
            encocktailTedarikListesi.push({isim: malzeme.replace(/_/g, ' '), miktar: satinAlinacakMiktar, birim: bilgi.birim});
        } else if (bilgi.tedarikci === "MUSTERI") {
            opsiyonelTedarikMaliyeti += maliyet; 
            if (ALKOLLER_SISE_HACIMLERI[malzeme] && ALKOLLER_SISE_HACIMLERI[malzeme].hacim_cl) {
                const siseBilgisi = ALKOLLER_SISE_HACIMLERI[malzeme];
                const gerekliSiseAdedi = Math.ceil((gerekliMiktarHesapBiriminde * 100) / siseBilgisi.hacim_cl);
                musteriTedarikListesi.push({
                    isim: malzeme.replace(/_/g, ' '),
                    miktar: gerekliSiseAdedi,
                    birim: "Şişe",
                    ekBilgi: `(${siseBilgisi.hacim_cl}cl, Örnek: ${siseBilgisi.marka})`
                });
            } else {
                let ekBilgi = '';
                if (ALKOLLER_SISE_HACIMLERI.DIGER_TEDARIK[malzeme]) {
                    const digerBilgi = ALKOLLER_SISE_HACIMLERI.DIGER_TEDARIK[malzeme];
                    ekBilgi = ` (Örnek: ${digerBilgi.marka})`;
                }
                 musteriTedarikListesi.push({
                    isim: malzeme.replace(/_/g, ' '),
                    miktar: satinAlinacakMiktar,
                    birim: bilgi.birim,
                    ekBilgi: ekBilgi
                });
            }
        }
    }

    
    const toplamHizmetMaliyeti = temelHizmetUcreti + ekSaatUcreti + kokteylCesitUcreti + ekstraMaliyeti; 
    const toplamFiyat = toplamHizmetMaliyeti + miksMaliyeti + opsiyonelTedarikMaliyeti;
    const ortalamaMaliyet = toplamFiyat / tahminiKokteylAdedi;


    // 5. Sonuçları HTML'e Yansıt
    document.getElementById('miksFiyat').textContent = formatCurrency(miksMaliyeti);
    document.getElementById('opsiyonelFiyat').textContent = formatCurrency(opsiyonelTedarikMaliyeti);
    document.getElementById('toplamFiyat').textContent = formatCurrency(toplamFiyat);
    document.getElementById('kokteylAdedi').textContent = tahminiKokteylAdedi;
    document.getElementById('ortalamaMaliyet').textContent = formatCurrency(ortalamaMaliyet);

    // Tedarik Listelerini Göster
    listeleriGoster(encocktailTedarikListesi, musteriTedarikListesi);
    // Ekstra maliyet listesini göster
    ekstraMaliyetTablosunuGoster(ekstraMaliyetListesi, temelHizmetUcreti, ekSaatUcreti, kokteylCesitUcreti);


    // Kayıt için verileri submit butonuna bağla
    submitButton.dataset.toplamFiyat = toplamFiyat.toFixed(2);
    submitButton.dataset.miksFiyat = miksMaliyeti.toFixed(2);
    submitButton.dataset.hizmetFiyat = (temelHizmetUcreti + ekSaatUcreti + kokteylCesitUcreti).toFixed(2); // Temel Hizmet + Ek Saat + Ek Kokteyl Ücreti
    submitButton.dataset.ekstraFiyat = ekstraMaliyeti.toFixed(2); // Ekstralar ve KM dahil
    submitButton.dataset.opsiyonelFiyat = opsiyonelTedarikMaliyeti.toFixed(2);
    submitButton.dataset.kokteylAdedi = tahminiKokteylAdedi;
    
    // shouldScroll (Butona basılma) durumunda kaydırma yap
    if (shouldScroll) {
        submitButton.style.display = 'block'; 
        const teklifOzetiElementi = document.getElementById('teklifOzeti');
        if (teklifOzetiElementi) {
            teklifOzetiElementi.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start'      
            });
        }
    }
}

// I. TEDARİK LİSTELERİNİ GÖSTERME FONKSİYONU
function listeleriGoster(encocktailListe, musteriListe) {
    const encocktailKapsayici = document.getElementById('encocktailTedarikListesi');
    const musteriKapsayici = document.getElementById('musteriTedarikListesi');

    // ENCOCKTAIL Listesi (Miks Malzemeler)
    encocktailKapsayici.innerHTML = '';
    const encocktailUl = document.createElement('ul');
    encocktailListe.forEach(item => {
        const li = document.createElement('li');
        const miktarGosterim = item.miktar.toFixed(item.birim === 'Adet' ? 0 : 1);
        li.innerHTML = `${item.isim}: <strong>${miktarGosterim} ${item.birim}</strong>`;
        encocktailUl.appendChild(li);
    });
    encocktailKapsayici.appendChild(encocktailUl);

    // MÜŞTERİ Listesi (Alkol, Buz, Soda) - HİZALAMA DÜZELTMESİ UYGULANMIŞTIR
    musteriKapsayici.innerHTML = '';
    const musteriUl = document.createElement('ul');
    musteriListe.forEach(item => {
        const li = document.createElement('li');
        
        const miktarGosterim = item.miktar.toFixed(item.birim === 'Şişe' || item.birim === 'Adet' ? 0 : 1);
        const ekBilgi = item.ekBilgi ? `<span class="note-small">${item.ekBilgi}</span>` : ''; 
        
        li.innerHTML = `
            <span class="item-name">${item.isim}</span> 
            <span class="item-quantity">
                <strong>${miktarGosterim} ${item.birim}</strong>${ekBilgi}
            </span>
        `;
        
        musteriUl.appendChild(li);
    });
    
    if (musteriListe.length === 0) {
        const defaultLi = document.createElement('li');
        defaultLi.textContent = 'Lütfen menüden kokteyl seçimi yapınız ve teklifi hesaplayınız.';
        musteriUl.appendChild(defaultLi);
        musteriKapsayici.innerHTML = ''; 
        musteriKapsayici.appendChild(musteriUl);
    } else {
        musteriKapsayici.appendChild(musteriUl);
    }
}

// J. EKSTRA MALİYET TABLOSUNU GÖSTERME FONKSİYONU (BAŞLIK HİZALAMASI GÜNCELLENDİ)
function ekstraMaliyetTablosunuGoster(ekstraMaliyetListesi, temelHizmetUcreti, ekSaatUcreti, kokteylCesitUcreti) {
    const ekstraMaliyetBody = document.getElementById('ekstraMaliyetBody');
    ekstraMaliyetBody.innerHTML = '';

    // 1. Temel Hizmet Ücreti (Min 3 Saat Sabit Ücret)
    let trTemel = document.createElement('tr');
    trTemel.innerHTML = `
        <td>Temel Hizmet Ücreti (${SABITLER.MINIMUM_SAAT} Saat Servis)</td>
        <td>Sabit</td>
        <td class="price">${formatCurrency(temelHizmetUcreti)}</td>
    `;
    ekstraMaliyetBody.appendChild(trTemel);

    // 2. Ek Saat Ücreti
    if (ekSaatUcreti > 0) {
        let ekSaatSayisi = ekSaatUcreti / SABITLER.EK_SAAT_UCRET;
        let trEkSaat = document.createElement('tr');
        trEkSaat.innerHTML = `
            <td>Ek Saat Hizmet Ücreti</td>
            <td>${ekSaatSayisi} Saat</td>
            <td class="price">${formatCurrency(ekSaatUcreti)}</td>
        `;
        ekstraMaliyetBody.appendChild(trEkSaat);
    }

    // 3. Ek Kokteyl Çeşidi Ücreti
    if (kokteylCesitUcreti > 0) {
        let ekCesitSayisi = kokteylCesitUcreti / SABITLER.EK_KOKTEYL_UCRET;
        let trEkCesit = document.createElement('tr');
        trEkCesit.innerHTML = `
            <td>Ek Kokteyl Çeşidi Ücreti</td>
            <td>${ekCesitSayisi} Çeşit</td>
            <td class="price">${formatCurrency(kokteylCesitUcreti)}</td>
        `;
        ekstraMaliyetBody.appendChild(trEkCesit);
    }

    // 4. Ekstra Hizmetler ve KM
    if (ekstraMaliyetListesi.length > 0) {
        // Ekstra Hizmetler Başlığı (Artık SOLA YASLI)
        let ekstraBaslik = document.createElement('tr');
        // text-align: center; -> text-align: left; olarak değiştirildi
        ekstraBaslik.innerHTML = `<td colspan="3" style="text-align: left; font-weight: 600; background-color: #f0f0f0;">Seçilen Ekstra Hizmetler ve Ulaşım</td>`; 
        ekstraMaliyetBody.appendChild(ekstraBaslik);

        // Uzak Mesafeyi en üste al
        const uzakMesafeItem = ekstraMaliyetListesi.find(item => item.tip === 'KM');
        if (uzakMesafeItem) {
             const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${uzakMesafeItem.isim}</td>
                <td>${uzakMesafeItem.miktar} KM</td>
                <td class="price">${formatCurrency(uzakMesafeItem.fiyat)}</td>
            `;
            ekstraMaliyetBody.appendChild(tr);
        }

        // Diğer Ekstralar
        ekstraMaliyetListesi.filter(item => item.tip !== 'KM').forEach(item => {
            const tr = document.createElement('tr');
            
            let miktarBirimMetin = "";
            if (item.tip === 'sabit') {
                miktarBirimMetin = "Sabit Ücret";
            } else if (item.tip === 'misafirSayisi') {
                miktarBirimMetin = `${item.miktar} Kişi`;
            } else if (item.tip === 'kokteylAdedi') {
                miktarBirimMetin = `${item.miktar} Bardak (Tahmini)`;
            }
            
            tr.innerHTML = `
                <td>${item.isim}</td>
                <td>${miktarBirimMetin}</td>
                <td class="price">${formatCurrency(item.fiyat)}</td>
            `;
            ekstraMaliyetBody.appendChild(tr);
        });
    }
    
    // Toplam Hizmet satırı
    const tumEkstralarinToplamFiyati = ekstraMaliyetListesi.reduce((sum, item) => sum + item.fiyat, 0);
    let totalHizmet = temelHizmetUcreti + ekSaatUcreti + kokteylCesitUcreti + tumEkstralarinToplamFiyati;
    let totalRow = document.createElement('tr');
    totalRow.classList.add('total-row');
    totalRow.innerHTML = `
        <td colspan="2">TOPLAM HİZMET ve EKSTRA MALİYETİ</td>
        <td class="price">${formatCurrency(totalHizmet)}</td>
    `;
    ekstraMaliyetBody.appendChild(totalRow);
}


// K. VERİ GÖNDERME FONKSİYONU
function veriGonder() {
    // 1. Hesaplama yapılmış mı kontrol et
    if (document.getElementById('toplamFiyat').textContent === '₺0.00') {
        alert("Lütfen teklifi önce hesaplayın.");
        return;
    }

    // 2. Form verilerini topla
    const musteriIletisim = musteriIletisimInput.value;
    const telefonNumarasi = telefonNumarasiInput.value; 
    const misafirSayisi = parseInt(misafirSayisiInput.value);
    const servisSaati = parseInt(servisSaatiInput.value);
    const uzakMesafeKM = parseInt(uzakMesafeKMInput.value) || 0;
    
    const kokteylSecimi = Array.from(document.querySelectorAll('input[name="kokteyl"]:checked')).map(el => el.value);
    
    // Seçili ekstraları ve KM bilgisini topla
    const ekstraSecimi = Array.from(document.querySelectorAll('input[name="ekstra"]:checked')).map(el => EKSTRA_HIZMETLER[el.value].isim);
    
    if (uzakMesafeKM > 0) {
        const uzakMesafeMaliyeti = uzakMesafeKM * EKSTRA_HIZMETLER.UZAK_MESAFE.fiyat;
        ekstraSecimi.push(`Uzak Mesafe Ulaşım (${uzakMesafeKM} KM - ${formatCurrency(uzakMesafeMaliyeti)})`);
    }

    if (!musteriIletisim || !telefonNumarasi) { 
        alert("Lütfen Müşteri/İletişim Bilgisi ve Telefon Numarası alanlarını doldurun.");
        return;
    }

    // Fiyatları data-set'ten al
    const kayitVerisi = {
        musteriIletisim: musteriIletisim,
        telefonNumarasi: telefonNumarasi, 
        misafirSayisi: misafirSayisi,
        servisSaati: servisSaati,
        kokteylSecimi: kokteylSecimi.join(', '), 
        ekstraHizmetler: ekstraSecimi.join(' | '), 
        hizmetFiyat: submitButton.dataset.hizmetFiyat, 
        ekstraFiyat: submitButton.dataset.ekstraFiyat, 
        miksFiyat: submitButton.dataset.miksFiyat,
        opsiyonelFiyat: submitButton.dataset.opsiyonelFiyat,
        toplamFiyat: submitButton.dataset.toplamFiyat,
        tahminiKokteyl: submitButton.dataset.kokteylAdedi
    };
    
    // Butonu disable et ve yükleniyor yap
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = 'Gönderiliyor...';
    submitButton.disabled = true;

    // 3. Veriyi Gönder
    GonderGoogleSheets(kayitVerisi)
    .finally(() => {
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// L. GOOGLE SHEETS ENTEGRASYON FONKSİYONU
function GonderGoogleSheets(veri) {
    if (!veri) return Promise.reject("Veri boş.");

    return fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(veri).toString()
    })
    .then(response => {
        window.location.href = "tesekkurler.html"; 
        return response;
    })
    .catch(error => {
        console.error('Gönderme Hatası:', error);
        alert("Hata oluştu! Lütfen tekrar deneyin veya yöneticinizle iletişime geçin.");
        throw error; 
    });
}


// M. EVENT LISTENERS
hesaplaButton.addEventListener('click', () => teklifiHesapla(true));
submitButton.addEventListener('click', veriGonder);

// Sayfa yüklendiğinde listeyi RECELLER'dan ve EKSTRALAR'dan dinamik olarak oluştur
document.addEventListener('DOMContentLoaded', () => {
    kokteylCheckboxlariOlustur();
    ekstraCheckboxlariOlustur(); 
    // Sayfa yüklendiğinde ilk boş hesaplamayı yap (Kaydırma yok)
    teklifiHesapla(false); 
    
    // Checkbox ve input alanlarına dinleyicileri dinamik olarak ekle
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    allCheckboxes.forEach(checkbox => {
        // Checkbox değişiminde sadece hesaplama yap (kaydırma yapma)
        checkbox.addEventListener('change', () => teklifiHesapla(false));
    });

    // Sayı giriş alanlarına dinleyicileri dinamik olarak ekle
    const allInputs = document.querySelectorAll('#misafirSayisi, #servisSaati, #uzakMesafeKM');
    allInputs.forEach(input => {
        // Input değişiminde (değer girilince) sadece hesaplama yap (kaydırma yapma)
        input.addEventListener('change', () => teklifiHesapla(false));
        input.addEventListener('keyup', () => teklifiHesapla(false));
    });
});