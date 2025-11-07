// Google Apps Script URL'si buraya sabitlendi!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwDUeanc0DglhkoDhbo2igm2N0rI43GM9q3q57-hRkyqZGbCm6EW6w-pwRMROI1xBuu/exec";

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
        isim: "Kuru Buzlu Sunum",
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
        isim: "Bardaklara Özel Etiket",
        fiyat: 5, // TL
        birim: "Bardak",
        carpimFaktoru: "kokteylAdedi" // Hesaplanan toplam kokteyl adedi ile çarpılacak
    },
    "MOBILE_BAR_KIRALAMA": {
        isim: "Mobile Bar Tezgahı Kiralama",
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
    // Uzak Mesafe kaldırıldı
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
        "BUZ": { birim: "Kg", marka: "Buzzizmir" },
        "SODA_TONIK_SU": { birim: "Litre", marka: "Uludağ, Kızılay, Sarıkız" },
        "ZENCEFILLI_GAZOZ": { birim: "Litre", marka: "Beyoğlu" }
    }
};


// D. KOKTEYL REÇETELERİ
const RECELLER = {
    "MOJITO":             { ROM: 4.5, SUPER_JUICE_LIME: 3, SEKER_SURUBU: 2, NANE_DALI: 5, SODA_TONIK_SU: 6, BUZ: 250 },
    "WHISKEY_SOUR":       { BOURBON: 6, LIMON_SUYU: 3, SEKER_SURUBU: 1.5, BUZ: 100, KOPUK: 1 },
    "MARGARITA":          { TEKILA: 5, PORTAKAL_LIKORU: 2.5, SUPER_JUICE_LIME: 2.5, BUZ: 100, LIME_DILIMI: 1 },
    "GIN_TONIC":          { CIN: 6, TONIK_SURUBU: 2, SODA_TONIK_SU: 12, LIME_DILIMI: 2, BUZ: 250 },
    "OLD_FASHIONED":      { BOURBON: 6, SEKER_SURUBU: 1, TATLANDIRICI: 2, BUZ: 100, PORTAKAL_DILIMI: 1 },
    "NEGRONI":            { CIN: 3, KIRMIZI_VERMUT: 3, CAMPARI: 3, PORTAKAL_DILIMI: 1, BUZ: 150 },
    "ESPRESSO_MARTINI":   { VOTKA: 5, KAHVE_LIKORU: 3, KAHVE_SOGUK_DEMLEME: 3, SEKER_SURUBU: 1, BUZ: 100 },
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
const hesaplaButton = document.getElementById('calculateButton');
const submitButton = document.getElementById('submitButton'); 
const musteriIletisimInput = document.getElementById('musteriIletisim'); 
const telefonNumarasiInput = document.getElementById('telefonNumarasi'); 
const etkinlikTarihiInput = document.getElementById('etkinlikTarihi'); 
const etkinlikAdresiInput = document.getElementById('etkinlikAdresi'); 
const etkinlikTuruInput = document.getElementById('etkinlikTuru'); 
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
        // İsimleri temizle ve kullanıcıya göster
        label.textContent = kokteyl.replace(/_/g, ' '); 

        div.appendChild(input);
        div.appendChild(label);
        kokteylSecimiKapsayici.appendChild(div);
    });
}

// YENİ: EKSTRA CHECKBOX'LARINI DİNAMİK OLARAK OLUŞTUR
function ekstraCheckboxlariOlustur() {
    ekstraSecimiKapsayici.innerHTML = '';
    const ekstralar = Object.keys(EKSTRA_HIZMETLER); 

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
        label.innerHTML = ekstra.isim ;

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
    
    const seciliKokteylElementleri = document.querySelectorAll('input[name="kokteyl"]:checked');
    const kokteylSecimi = Array.from(seciliKokteylElementleri).map(el => el.value);
    const seciliEkstraElementleri = document.querySelectorAll('input[name="ekstra"]:checked'); 
    const ekstraSecimi = Array.from(seciliEkstraElementleri).map(el => el.value);

    // Geçerlilik kontrolü (hesaplama yapılmazsa veya hatalıysa sıfırla)
    if (isNaN(misafirSayisi) || misafirSayisi < 10 || isNaN(servisSaati) || servisSaati < SABITLER.MINIMUM_SAAT || kokteylSecimi.length === 0) {
        // Hatalı durumda sıfırla ve çık
        document.getElementById('toplamEncocktailMaliyet').textContent = formatCurrency(0);
        document.getElementById('toplamMusteriMaliyet').textContent = formatCurrency(0);
        document.getElementById('genelToplamFiyat').textContent = formatCurrency(0);
        listeleriGoster([], []); 
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
        ekstraMaliyetListesi.push({
            isim: ekstraBilgi.isim,
            miktar: carpan,
            birim: ekstraBilgi.birim,
            fiyat: maliyet,
            tip: ekstraBilgi.carpimFaktoru
        });
        ekstraMaliyeti += maliyet;
    });

    // 4. MİKS ve OPSİYONEL MALİYET HESAPLAMASI
    let toplamMalzemeIhtiyaci = {};
    kokteylSecimi.forEach(kokteyl => {
        const recete = RECELLER[kokteyl];
        if (recete) {
            // Ortalama alarak ekle
            for (const malzeme in recete) {
                const miktar = recete[malzeme] / kokteylSecimi.length; 
                toplamMalzemeIhtiyaci[malzeme] = (toplamMalzemeIhtiyaci[malzeme] || 0) + miktar;
            }
        }
    });

    let miksMaliyeti = 0;
    let opsiyonelTedarikMaliyeti = 0; // Müşteri Tedarik Maliyeti
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
            
            let gosterilenIsim = malzeme.replace(/_/g, ' ');

            // İSTEK: SODA TONIK SU İFADESİNİ SADECE "SODA" (BÜYÜK HARFLE) OLARAK DEĞİŞTİR
            if (malzeme === "SODA_TONIK_SU") {
                gosterilenIsim = "SODA"; 
            }
            // --- BİTTİ ---

            if (ALKOLLER_SISE_HACIMLERI[malzeme] && ALKOLLER_SISE_HACIMLERI[malzeme].hacim_cl) {
                const siseBilgisi = ALKOLLER_SISE_HACIMLERI[malzeme];
                const gerekliSiseAdedi = Math.ceil((gerekliMiktarHesapBiriminde * 100) / siseBilgisi.hacim_cl);
                musteriTedarikListesi.push({
                    isim: gosterilenIsim,
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
                    isim: gosterilenIsim,
                    miktar: satinAlinacakMiktar,
                    birim: bilgi.birim,
                    ekBilgi: ekBilgi
                });
            }
        }
    }

    // 5. YENİ TOPLAMLARIN HESAPLANMASI
    const temelHizmetMaliyeti = temelHizmetUcreti + ekSaatUcreti + kokteylCesitUcreti + ekstraMaliyeti; 
    const toplamEncocktailMaliyeti = temelHizmetMaliyeti + miksMaliyeti; // Hizmet + Ekstra + Miks Malzemeler
    const toplamMusteriMaliyeti = opsiyonelTedarikMaliyeti; // Müşteriye Ait (Alkol, Buz, Soda)
    const genelToplamFiyat = toplamEncocktailMaliyeti + toplamMusteriMaliyeti;

    // 6. Sonuçları HTML'e Yansıt
    document.getElementById('toplamEncocktailMaliyet').textContent = formatCurrency(toplamEncocktailMaliyeti);
    document.getElementById('toplamMusteriMaliyet').textContent = formatCurrency(toplamMusteriMaliyeti);
    document.getElementById('genelToplamFiyat').textContent = formatCurrency(genelToplamFiyat);
    document.getElementById('kokteylAdedi').textContent = tahminiKokteylAdedi;
    document.getElementById('ortalamaMaliyet').textContent = formatCurrency(genelToplamFiyat / tahminiKokteylAdedi);

    // Tedarik Listelerini Göster
    listeleriGoster(encocktailTedarikListesi, musteriTedarikListesi);

    // Kayıt için verileri submit butonuna bağla
    submitButton.dataset.toplamFiyat = genelToplamFiyat.toFixed(2);
    submitButton.dataset.miksFiyat = miksMaliyeti.toFixed(2);
    submitButton.dataset.hizmetFiyat = (temelHizmetUcreti + ekSaatUcreti + kokteylCesitUcreti).toFixed(2); 
    submitButton.dataset.ekstraFiyat = ekstraMaliyeti.toFixed(2); 
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

// I. TEDARİK LİSTELERİNİ GÖSTERME FONKSİYONU (Sadece Müşteri Listesi kaldı)
function listeleriGoster(encocktailListe, musteriListe) {
    const musteriKapsayici = document.getElementById('musteriTedarikListesi');

    // MÜŞTERİ Listesi (Alkol, Buz, Soda)
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

// J. EKSTRA MALİYET TABLOSUNU GÖSTERME FONKSİYONU (Kullanıcı isteğiyle gizlendi)
function ekstraMaliyetTablosunuGoster(ekstraMaliyetListesi, temelHizmetUcreti, ekSaatUcreti, kokteylCesitUcreti) {
    // Bu bölüm, kullanıcı isteği üzerine boş bırakılmıştır.
}


// K. VERİ GÖNDERME FONKSİYONU
function veriGonder() {
    // 1. Hesaplama yapılmış mı kontrol et
    if (document.getElementById('genelToplamFiyat').textContent === '₺0.00') {
        alert("Lütfen teklifi önce hesaplayın.");
        return;
    }

    // 2. Form verilerini topla
    const musteriIletisim = musteriIletisimInput.value;
    const telefonNumarasi = telefonNumarasiInput.value; 
    const etkinlikTarihi = etkinlikTarihiInput.value; 
    const etkinlikAdresi = etkinlikAdresiInput.value; 
    const etkinlikTuru = etkinlikTuruInput.value; 
    const misafirSayisi = parseInt(misafirSayisiInput.value);
    const servisSaati = parseInt(servisSaatiInput.value);
    
    const kokteylSecimi = Array.from(document.querySelectorAll('input[name="kokteyl"]:checked')).map(el => el.value);
    const ekstraSecimi = Array.from(document.querySelectorAll('input[name="ekstra"]:checked')).map(el => EKSTRA_HIZMETLER[el.value].isim);
    
    // Zorunlu alan kontrolü güncellendi
    if (!musteriIletisim || !telefonNumarasi || !etkinlikTarihi || !etkinlikAdresi || !etkinlikTuru) { 
        alert("Lütfen tüm zorunlu iletişim ve etkinlik detay alanlarını doldurun.");
        return;
    }

    // Fiyatları data-set'ten al
    // KRİTİK: VERİ SIRASI, GAS ARRAY DİZİLİMİYLE TAM EŞLEŞTİRİLDİ (Sütun 2'den 16'ya)
    const kayitVerisi = {
        musteriIletisim: musteriIletisim,       // 2. SÜTUN
        telefonNumarasi: telefonNumarasi,       // 3. SÜTUN
        etkinlikTarihi: etkinlikTarihi,         // 4. SÜTUN
        etkinlikAdresi: etkinlikAdresi,         // 5. SÜTUN
        etkinlikTuru: etkinlikTuru,             // 6. SÜTUN
        misafirSayisi: misafirSayisi,           // 7. SÜTUN
        servisSaati: servisSaati,               // 8. SÜTUN
        kokteylSecimi: kokteylSecimi.join(', '),// 9. SÜTUN
        ekstraHizmetler: ekstraSecimi.join(' | ') || 'Seçilmedi',// 10. SÜTUN
        tahminiKokteyl: submitButton.dataset.kokteylAdedi, // 11. SÜTUN (**DÜZELTİLDİ**)
        hizmetFiyat: submitButton.dataset.hizmetFiyat, // 12. SÜTUN
        ekstraFiyat: submitButton.dataset.ekstraFiyat, // 13. SÜTUN
        miksFiyat: submitButton.dataset.miksFiyat, // 14. SÜTUN
        opsiyonelFiyat: submitButton.dataset.opsiyonelFiyat, // 15. SÜTUN
        toplamFiyat: submitButton.dataset.toplamFiyat // 16. SÜTUN
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

    // no-cors modunda yanıtı kontrol edemeyiz, ancak yönlendirmeyi yapabiliriz.
    return fetch(GAS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(veri).toString()
    })
    .then(() => {
        // İstek gönderildikten sonra (başarılı veya başarısız), tarayıcıyı yönlendir
        window.location.href = "tesekkurler.html"; 
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
    // BURASI KOKTEYL VE EKSTRA LİSTELERİNİ OLUŞTURUR
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

    // Hesaplamayı etkileyen sayı giriş alanlarına dinleyicileri ekle
    const allInputs = document.querySelectorAll('#misafirSayisi, #servisSaati');
    allInputs.forEach(input => {
        // Input değişiminde (değer girilince) sadece hesaplama yap (kaydırma yapma)
        input.addEventListener('change', () => teklifiHesapla(false));
        input.addEventListener('keyup', () => teklifiHesapla(false));
    });
});