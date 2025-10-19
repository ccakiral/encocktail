/**
 * MOBİL BAR TEKLİF HESAPLAMA FORMU (teklif_hesaplama.js) için özel GAS kodu
 */
function doPost(e) {
  // E-posta bildirim adresi
  const mailAdresi = "cenkcakiral@gmail.com"; 
  
  // Hedef Sheets dosyanızı alın
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  // Sheets'teki sayfanızın adını buraya yazın (Örn: 'Sayfa1' veya 'Bar')
  const sheet = ss.getSheetByName('Sayfa1'); 

  if (!e.parameter || !sheet) {
    Logger.log("Hata: Gecersiz veri veya Sheets'te hedef sayfa bulunamadi.");
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: "Hedef Sheets sayfası bulunamadı veya veri eksik. Sayfa adını kontrol edin." 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = e.parameter;
  const timestamp = new Date();

  // Sheets Sütun Başlıkları ile BİREBİR EŞLEŞEN SIRA
  // (Timestamp hariç 9 veri alanı)
  const rowData = [
    timestamp,
    data.musteriIletisim || '',
    data.misafirSayisi || '',
    data.servisSaati || '',
    data.kokteylSecimi || '',
    data.hizmetFiyat || '',
    data.miksFiyat || '',
    data.opsiyonelFiyat || '',
    data.toplamFiyat || '',
    data.tahminiKokteyl || ''
  ];
  
  sheet.appendRow(rowData);

  // E-posta Bildirimi
  const emailBody = `--- YENİ MOBİL BAR TEKLİF TALEBİ GELDİ ---\n\n
    Müşteri/İletişim: ${data.musteriIletisim}\n
    Misafir Sayısı: ${data.misafirSayisi}\n
    Servis Saati: ${data.servisSaati}\n
    Seçilen Kokteyller: ${data.kokteylSecimi}\n
    TOPLAM TEKLİF: ${data.toplamFiyat}\n\n
    Detaylar Sheets'e kaydedilmiştir.`;
    
  MailApp.sendEmail({ to: mailAdresi, subject: "YENİ MOBİL BAR TEKLİF TALEBİ GELDİ", body: emailBody });

  // Başarılı yanıt
  return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}