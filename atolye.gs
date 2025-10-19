// Bu fonksiyon, web formu POST isteği aldığında otomatik olarak çalışır.
function doPost(e) {
  
  // 1. Gelen veriyi değişken olarak al
  const veriler = e.parameter;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 2. Verileri Sheets'e kaydet (Timestamp ile birlikte)
  // Sütun sırası: Timestamp, Ad_Soyad_Firma, Telefon, Email, Etkinlik_Tarihi, Katilimci_Sayisi, Mekan, Konsept_ve_Istekler, Atolye_Tipi
  sheet.appendRow([
    new Date(),
    veriler.Ad_Soyad_Firma,
    veriler.Telefon,
    veriler.Email,
    veriler.Etkinlik_Tarihi,
    veriler.Katilimci_Sayisi,
    veriler.Mekan,
    veriler.Konsept_ve_Istekler,
    veriler.Atolye_Tipi
  ]);
  
  // 3. Otomatik Mail Gönderme İşlemi
  
  // ALICI MAİL ADRESİNİZİ BURAYA YAZIN
  const ALICI_MAIL = "cenkcakiral@gmail.com"; 
  const KONU = `YENİ ATÖLYE TALEP FORMU: ${veriler.Ad_Soyad_Firma}`;
  
  // E-posta içeriğini HTML olarak oluştur
  const mailGovdesi = `
    <html>
      <body>
        <h3>Yeni Kokteyl Atölyesi Teklif Talebi</h3>
        <p><strong>Talep Tarihi:</strong> ${new Date().toLocaleString("tr-TR")}</p>
        <hr style="border: 1px dashed #ccc;">
        
        <p><strong>Müşteri / Firma Adı:</strong> ${veriler.Ad_Soyad_Firma}</p>
        <p><strong>Telefon:</strong> ${veriler.Telefon}</p>
        <p><strong>E-posta:</strong> ${veriler.Email}</p>
        <hr>

        <h4>ATÖLYE DETAYLARI</h4>
        <p><strong>İstenen Tarih:</strong> ${veriler.Etkinlik_Tarihi}</p>
        <p><strong>Katılımcı Sayısı:</strong> ${veriler.Katilimci_Sayisi}</p>
        <p><strong>Mekan/Bölge:</strong> ${veriler.Mekan}</p>
        <p><strong>Atölye Tipi:</strong> ${veriler.Atolye_Tipi}</p>
        <p><strong>Konsept ve İstekler:</strong><br>${veriler.Konsept_ve_Istekler}</p>
        
        <hr style="border: 1px dashed #ccc;">
        <p>Tüm detayları <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}">Google Sheets</a> üzerinde görebilirsiniz.</p>
      </body>
    </html>
  `;
  
  // E-postayı gönder
  MailApp.sendEmail({
    to: ALICI_MAIL,
    subject: KONU,
    htmlBody: mailGovdesi
  });

  // Başarılı yanıtı HTML olarak döndür (Web uygulaması için gereklidir)
  return ContentService.createTextOutput(JSON.stringify({ result: 'success', row: sheet.getLastRow() }))
    .setMimeType(ContentService.MimeType.JSON);
}