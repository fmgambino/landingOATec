IMPORTANTE: EL ERROR ACTUAL ES 401 UNAUTHORIZED DEL WEB APP DE GOOGLE APPS SCRIPT.

Eso NO se arregla con HTML/CSS/JS solamente.

Pasos obligatorios:
1. Abrí tu proyecto de Apps Script.
2. Pegá este code.gs:

const SPREADSHEET_ID = "1wvLnSmYjLTszPSONqhBEyMKNe5-f6Y-NwB_m6nKF-Ac";
const SHEET_NAME = "Inscripciones OATec";

function doGet() {
  return ContentService.createTextOutput("OATec form endpoint OK")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Fecha de registro",
        "Nombres",
        "Apellidos",
        "Edad",
        "Fecha de nacimiento",
        "DNI",
        "Curso",
        "División",
        "Institución",
        "Competencia",
        "Temática",
        "Timestamp ISO"
      ]);
    }

    const data = e.parameter || {};

    sheet.appendRow([
      new Date(),
      data.firstName || "",
      data.lastName || "",
      data.age || "",
      data.birthDate || "",
      data.dni || "",
      data.course || "",
      data.division || "",
      data.institution || "Instituto San Miguel",
      data.competition || "OATec ITBA 2026",
      data.theme || "Desafío Espacial",
      data.createdAt || new Date().toISOString()
    ]);

    SpreadsheetApp.flush();
    return HtmlService.createHtmlOutput("OK");
  } catch (error) {
    return HtmlService.createHtmlOutput("ERROR: " + error);
  }
}

3. Deploy > Manage deployments > Web app.
4. Execute as: Me
5. Who has access: Anyone
6. Guardá y copiá la URL nueva terminada en /exec.
7. Reemplazá esa URL en index.html, atributo action del form.
8. Probá primero la URL /exec sola en el navegador.
   Si no abre, el problema sigue siendo el deployment.

Tu planilla Excel subida tiene una hoja llamada exactamente:
Inscripciones OATec
