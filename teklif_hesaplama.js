// Google Apps Script URL'si buraya sabitlendi!
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzrZHqPoB6p8gOqhpVbzqN4LjVw_5D-zEIWwZKC2YTbLOZxPNFZ6x0VDSTjvfN9lcQH/exec";

// A. SABİT HİZMET VE FİYAT KURALLARI
const SABITLER = {
    MINIMUM_SAAT: 3,
    MINIMUM_UCRET: 500,       // 3 Saat servis için sabit ücret
    EK_SAAT_UCRET: 100,
    EK_KOKTEYL_UCRET: 100,     // 3 çeşidi aşan her kokteyl için
    MAKS_KOKTEYL_CESIDI: 4,   // Maksimum seçilebilecek çeşit sayısı
    TUKETIM_ORANI_SAAT: 1.5,  // Misafir * Saat * 1.5 formülü için katsayı (Ortalama kokteyl tüketimi)
    GUVENLIK_MARJI_BUZ: 1.10, // Buz için %10 erime/güvenlik marjı
};

// B. ÜRÜN FİYATLARI VE TEDARİK SORUMLULUĞU
const URUN_FIYATLARI = {
    // Fiyatlar Litre bazlıdır (BUZ hariç). (Örn: 25 TL/Litre)
    // --- ENCOCKTAIL (Zorunlu Satışlar - Miks Malzemeler) ---
    // 1. Ev Yapımı Likörler (Yüksek Değerli, Niş Ürünler)
    "PORTAKAL_LIKORU":     { fiyat: 25, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "LIKORLER" }, 
    "KAHVE_LIKORU":        { fiyat: 25, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "LIKORLER" }, 

    // 2. Özel Bazlar, Püreler ve Şuruplar (Miks Kalitesi İçin Kritik)
    "KAHVE_SOGUK_DEMLEME":{ fiyat: 15, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "SUPER_JUICE_LIME":    { fiyat: 10, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "LIMON_SUYU":          { fiyat: 8,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" },
    "CRANBERRY_SUYU":      { fiyat: 8,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, 
    "LIMONATA_SUYU":       { fiyat: 8,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, // YENİ
    "COOL_LIME_SUYU":      { fiyat: 10, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, // YENİ
    "BERRY_HIBISCUS_SUYU":{ fiyat: 12, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_BAZ" }, // YENİ

    "SEKER_SURUBU":        { fiyat: 5,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" },
    "TONIK_SURUBU":        { fiyat: 18, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" },
    "ELDERFLOWER_SURUBU": { fiyat: 15, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" },
    "BAL_SURUBU":          { fiyat: 8,  birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" },
    "AHUDUDU_SURUBU":      { fiyat: 12, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "SURUPLAR" },

    // SOSLAR (GÜNCELLENDİ)
    "HIBISKUS_SOSU":       { fiyat: 12, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, // HIBISKUS_BAZ'dan GÜNCELLENDİ
    "KUZUKULAGI_SOSU":     { fiyat: 15, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" },
    "MANGO_SOSU":          { fiyat: 18, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, // MANGO_PURESI'den GÜNCELLENDİ
    "ORMANMEYVE_SOSU":     { fiyat: 18, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" },
    "MANGO_MULE_SOSU":     { fiyat: 18, birim: "Litre", satisKati: 0.5, tedarikci: "ENCOCKTAIL", grup: "OZEL_SOS" }, // YENİ
    
    // 3. Garnitür ve Özel Katkılar (Adet Bazlı)
    "PORTAKAL_DILIMI": { fiyat: 0.25, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" },
    "LIME_DILIMI":      { fiyat: 0.20, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" },
    "NANE_DALI":        { fiyat: 0.50, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" },
    "LIMON_DILIMI":     { fiyat: 0.20, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, // YENİ
    "BIBER_DILIMI":     { fiyat: 0.25, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, // YENİ
    "FESLEGEN":         { fiyat: 0.50, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, // YENİ
    "BERRY":            { fiyat: 0.25, birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "GARNITUR" }, // YENİ

    "TATLANDIRICI":     { fiyat: 0.5,  birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "KATKI" }, 
    "KOPUK":            { fiyat: 0.5,  birim: "Adet", satisKati: 1, tedarikci: "ENCOCKTAIL", grup: "KATKI" }, 
    
    // --- MÜŞTERİ TEDARİĞİ (Ana Alkollü İçecekler) ---
    // ... Alkollü içecekler aynı kaldı ...
    "CIN":        { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "VOTKA":      { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "ROM":        { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "VISKI":      { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "TEKILA":     { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "BOURBON":    { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "APEROL":     { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" }, 
    "RAKI":       { fiyat: 38, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 38, grup: "ALKOLLER" },
    "KIRMIZI_VERMUT": { fiyat: 30, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 30, grup: "ALKOLLER" },
    "CAMPARI":    { fiyat: 40, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 40, grup: "ALKOLLER" }, 
    "KOPUKLU_SARAP": { fiyat: 50, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 50, grup: "ALKOLLER" }, 

    "BUZ":        { fiyat: 1,  birim: "Kg",    satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 1, grup: "DIGER" }, // Kg bazlı fiyat    
    "SODA_TONIK_SU": { fiyat: 2, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 2, grup: "DIGER" }, 
    "ZENCEFILLI_GAZOZ": { fiyat: 5, birim: "Litre", satisKati: 1, tedarikci: "MUSTERI", opsiyonFiyat: 5, grup: "DIGER" }, // YENİ
};

// C. ALKOLLERİN ŞİŞE HACMİ VE MARKA BİLGİLERİ (cL bazında)
const ALKOLLER_SISE_HACIMLERI = {
    // ... Aynı Kaldı ...
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
};


// D. KOKTEYL REÇETELERİ (GÖNDERDİĞİNİZ NİHAİ TARİFLER İLE GÜNCELLENDİ)
// Not: Sıvılar Santilitre (cL), Buz Gram (g), Garnitür/Katkı Adet (Adet) cinsindendir.
const RECELLER = {
    // NİHAİ KLASİK KOKTEYLLER
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

    // İMZA/HOUSE KOKTEYLLER (GÜNCELLENDİ)
    "GREEN SHADE":        { CIN: 5, KUZUKULAGI_SOSU: 7.5, BUZ: 200, KOPUK: 1, LIME_DILIMI: 1},
    "THE_BERRY_PATCH":    { VOTKA: 5, ORMANMEYVE_SOSU: 7.5, BUZ: 200, FESLEGEN: 1, BERRY: 3,}, // Yeni malzemeler eklendi
    "HIBISCUS_ISLE":      { ROM: 5, HIBISKUS_SOSU: 7.5, BUZ: 200, NANE_DALI: 1, LIME_DILIMI: 1 }, // HIBISKUS_SOSU ve vol. güncellendi
    "THE_SPICY_SUNSET":   { VOTKA: 5, MANGO_SOSU: 7.5, BUZ: 200, BIBER_DILIMI: 1}, // MANGO_SOSU ve BIBER_DILIMI eklendi

    // ALKOLSÜZ KOKTEYLLER (TAMAMEN YENİ TARİFLER)
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
const kokteylSecimiKapsayici = document.getElementById('kokteylSecimiKapsayici'); 

// F. YARDIMCI FONKSİYONLAR
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// G. KOKTEYL CHECKBOX'LARINI DİNAMİK OLARAK OLUŞTUR
function kokteylCheckboxlariOlustur() {
    kokteylSecimiKapsayici.innerHTML = ''; // İçeriği temizle

    const kokteyller = Object.keys(RECELLER);
    kokteyller.forEach((kokteyl) => {
        const div = document.createElement('div');
        div.classList.add('checkbox-item');
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = kokteyl.toLowerCase().replace(/ /g, '_'); // ID, küçük harf ve alt çizgi
        input.name = 'kokteyl';
        input.value = kokteyl; // Reçete anahtarı
        
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = kokteyl.replace(/_/g, ' '); // Görünen isim

        div.appendChild(input);
        div.appendChild(label);
        kokteylSecimiKapsayici.appendChild(div);
    });
}

// H. ANA HESAPLAMA FONKSİYONU
function hesaplaVeGoster(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }
    
    // 1. Veri Alımı ve Doğrulama
    const misafirSayisi = parseInt(misafirSayisiInput.value);
    const servisSaati = parseInt(servisSaatiInput.value);
    
    if (isNaN(misafirSayisi) || misafirSayisi < 10 || isNaN(servisSaati) || servisSaati < SABITLER.MINIMUM_SAAT) {
        alert(`Lütfen geçerli değerler girin:\n- Misafir Sayısı (Min: 10)\n- Servis Süresi (Min: ${SABITLER.MINIMUM_SAAT} Saat)`);
        return;
    }

    const seciliKokteylElementleri = document.querySelectorAll('input[name="kokteyl"]:checked');
    const kokteylSecimi = Array.from(seciliKokteylElementleri).map(el => el.value);

    if (kokteylSecimi.length === 0) {
        alert("Lütfen menüden en az bir kokteyl seçin.");
        return;
    }
    
    if (kokteylSecimi.length > SABITLER.MAKS_KOKTEYL_CESIDI) {
        alert(`Maksimum ${SABITLER.MAKS_KOKTEYL_CESIDI} çeşit kokteyl seçebilirsiniz. Lütfen seçiminizi azaltın.`);
        return;
    }

    // 2. Tüketim ve Temel Hesaplamalar
    const tahminiKokteylAdedi = Math.ceil(misafirSayisi * servisSaati * SABITLER.TUKETIM_ORANI_SAAT);
    
    const hizmetMaliyeti = (servisSaati > SABITLER.MINIMUM_SAAT)
        ? SABITLER.MINIMUM_UCRET + (servisSaati - SABITLER.MINIMUM_SAAT) * SABITLER.EK_SAAT_UCRET
        : SABITLER.MINIMUM_UCRET;
    
    const kokteylCesitUcreti = (kokteylSecimi.length > 3) 
        ? (kokteylSecimi.length - 3) * SABITLER.EK_KOKTEYL_UCRET 
        : 0;

    // Toplam Kokteyl Başına Gerekli Malzeme (cL, g veya Adet cinsinden)
    let toplamMalzemeIhtiyaci = {}; 

    // Her seçilen kokteylin reçetesini topla ve ortalamasını al
    kokteylSecimi.forEach(kokteylAdi => {
        const recete = RECELLER[kokteylAdi];
        for (const malzeme in recete) {
            const miktar = recete[malzeme] / kokteylSecimi.length; 
            toplamMalzemeIhtiyaci[malzeme] = (toplamMalzemeIhtiyaci[malzeme] || 0) + miktar;
        }
    });

    // 3. Fiyat Hesaplama
    let miksMaliyeti = 0;
    let opsiyonelTedarikMaliyeti = 0;
    let encocktailTedarikListesi = [];
    let musteriTedarikListesi = [];

    for (const malzeme in toplamMalzemeIhtiyaci) {
        const bilgi = URUN_FIYATLARI[malzeme];
        if (!bilgi) {
            console.warn(`Uyarı: ${malzeme} için fiyat bilgisi bulunamadı.`);
            continue;
        }

        let satinAlinacakMiktar = 0;
        let gerekliMiktarHesapBiriminde = toplamMalzemeIhtiyaci[malzeme] * tahminiKokteylAdedi;

        // KRİTİK BİRİM DÖNÜŞÜMÜ
        if (malzeme === "BUZ") {
            // Buz: Gram (g) -> Kilogram (Kg) (Fiyat birimi)
            // (g * Adet) / 1000 = Gerekli Kilogram (Kg)
            if (gerekliMiktarHesapBiriminde > 0) {
              gerekliMiktarHesapBiriminde = gerekliMiktarHesapBiriminde / 1000;
            }
        } else if (bilgi.birim === "Adet") {
            // Adet bazlı malzemeler: Zaten Adet olarak kalır.
            // gerekliMiktarHesapBiriminde zaten toplam adettir.
        } else {
            // Sıvılar (Alkol, Şurup vb.): Santilitre (cL) -> Litre (L) (Fiyat birimi)
            // (cL * Adet) / 100 = Gerekli Litre (L)
            if (gerekliMiktarHesapBiriminde > 0) {
              gerekliMiktarHesapBiriminde = gerekliMiktarHesapBiriminde / 100;
            }
        }

        // Buz için %10 güvenlik marjı ekle (gerekliMiktarHesapBiriminde artık Kg cinsinden)
        if (malzeme === "BUZ") {
            gerekliMiktarHesapBiriminde *= SABITLER.GUVENLIK_MARJI_BUZ; 
        }

        // Satış Katına yuvarla
        const satisKati = bilgi.satisKati || 1;
        satinAlinacakMiktar = Math.ceil(gerekliMiktarHesapBiriminde / satisKati) * satisKati;

        const maliyet = satinAlinacakMiktar * bilgi.fiyat;
        
        const tedarikItem = {
            isim: malzeme.replace(/_/g, ' '),
            miktar: satinAlinacakMiktar,
            birim: bilgi.birim
        };

        if (bilgi.tedarikci === "ENCOCKTAIL") {
            miksMaliyeti += maliyet;
            encocktailTedarikListesi.push(tedarikItem);
        } else if (bilgi.tedarikci === "MUSTERI") {
            opsiyonelTedarikMaliyeti += maliyet;

            // Alkollü içecekler için ayrıca şişe bazında listeleme yap
            if (ALKOLLER_SISE_HACIMLERI[malzeme]) {
                const siseBilgisi = ALKOLLER_SISE_HACIMLERI[malzeme];
                // Gerekli miktar (Litre cinsinden) * 100 (cL'ye çevirme) / Şişe hacmi (cl) = Gerekli Şişe Adedi
                const gerekliSiseAdedi = Math.ceil((gerekliMiktarHesapBiriminde * 100) / siseBilgisi.hacim_cl);
                
                musteriTedarikListesi.push({
                    isim: malzeme.replace(/_/g, ' '),
                    miktar: gerekliSiseAdedi,
                    birim: "Şişe",
                    ekBilgi: `(${siseBilgisi.hacim_cl}cl, Örnek: ${siseBilgisi.marka})`
                });
            } else {
                // Buz, soda vb. tedarik listesine ekle
                 musteriTedarikListesi.push(tedarikItem);
            }
        }
    }

    const toplamHizmetMaliyeti = hizmetMaliyeti + kokteylCesitUcreti;
    const toplamFiyat = toplamHizmetMaliyeti + miksMaliyeti;
    const ortalamaMaliyet = toplamFiyat / tahminiKokteylAdedi;


    // 4. Sonuçları HTML'e Yansıt
    document.getElementById('hizmetFiyat').textContent = formatCurrency(toplamHizmetMaliyeti);
    document.getElementById('miksFiyat').textContent = formatCurrency(miksMaliyeti);
    document.getElementById('opsiyonelFiyat').textContent = formatCurrency(opsiyonelTedarikMaliyeti);
    document.getElementById('toplamFiyat').textContent = formatCurrency(toplamFiyat);
    document.getElementById('kokteylAdedi').textContent = tahminiKokteylAdedi;
    document.getElementById('ortalamaMaliyet').textContent = formatCurrency(ortalamaMaliyet);

    // Tedarik Listelerini Göster
    listeleriGoster(encocktailTedarikListesi, musteriTedarikListesi);

    // Kayıt için verileri submit butonuna bağla
    submitButton.dataset.toplamFiyat = toplamFiyat.toFixed(2);
    submitButton.dataset.miksFiyat = miksMaliyeti.toFixed(2);
    submitButton.dataset.hizmetFiyat = toplamHizmetMaliyeti.toFixed(2);
    submitButton.dataset.opsiyonelFiyat = opsiyonelTedarikMaliyeti.toFixed(2);
    submitButton.dataset.kokteylAdedi = tahminiKokteylAdedi;
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
        // Miktar gösterme: Adet değilse virgülden sonra 1 basamak göster
        const miktarGosterim = item.miktar.toFixed(item.birim === 'Adet' ? 0 : 1);
        li.innerHTML = `${item.isim}: <strong>${miktarGosterim} ${item.birim}</strong>`;
        encocktailUl.appendChild(li);
    });
    encocktailKapsayici.appendChild(encocktailUl);

    // MÜŞTERİ Listesi (Alkol, Buz, Soda)
    musteriKapsayici.innerHTML = '';
    musteriListe.forEach(item => {
        const li = document.createElement('li');
        // Miktar gösterme: Şişe veya Adet ise tam sayı göster
        const miktarGosterim = item.miktar.toFixed(item.birim === 'Şişe' || item.birim === 'Adet' ? 0 : 1);
        const ekBilgi = item.ekBilgi ? ` <span class="note-small">${item.ekBilgi}</span>` : '';
        li.innerHTML = `${item.isim}: <strong>${miktarGosterim} ${item.birim}</strong>${ekBilgi}`;
        musteriKapsayici.appendChild(li);
    });
}

// J. VERİ GÖNDERME FONKSİYONU
function veriGonder() {
    // 1. Hesaplama yapılmış mı kontrol et
    if (document.getElementById('toplamFiyat').textContent === '$0.00') {
        alert("Lütfen teklifi önce hesaplayın.");
        return;
    }

    // 2. Form verilerini topla
    const musteriIletisim = musteriIletisimInput.value;
    const misafirSayisi = parseInt(misafirSayisiInput.value);
    const servisSaati = parseInt(servisSaatiInput.value);
    const kokteylSecimi = Array.from(document.querySelectorAll('input[name="kokteyl"]:checked')).map(el => el.value);

    if (!musteriIletisim) {
        alert("Lütfen Müşteri/İletişim Bilgisi alanını doldurun.");
        return;
    }

    // Fiyatları data-set'ten al
    const kayitVerisi = {
        musteriIletisim: musteriIletisim,
        misafirSayisi: misafirSayisi,
        servisSaati: servisSaati,
        kokteylSecimi: kokteylSecimi.join(', '), 
        hizmetFiyat: submitButton.dataset.hizmetFiyat,
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
        // Yönlendirme gerçekleşmezse (HATA durumunda), butonu düzelt
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// K. GOOGLE SHEETS ENTEGRASYON FONKSİYONU
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
        // [DÜZELTME UYGULANDI]: Başarılı kabul edip tesekkurler.html sayfasına yönlendir.
        window.location.href = "tesekkurler.html"; 
        // Yönlendirme olduğu için butonu geri açmaya gerek kalmayacaktır.
        return response;
    })
    .catch(error => {
        console.error('Gönderme Hatası:', error);
        alert("Hata oluştu! Lütfen tekrar deneyin veya yöneticinizle iletişime geçin.");
        throw error; 
    });
}


// L. EVENT LISTENERS
hesaplaButton.addEventListener('click', hesaplaVeGoster);
submitButton.addEventListener('click', veriGonder);

// Sayfa yüklendiğinde listeyi RECELLER'dan dinamik olarak oluştur
document.addEventListener('DOMContentLoaded', kokteylCheckboxlariOlustur);