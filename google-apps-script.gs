const SPREADSHEET_ID = "PEGAR_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";
const SHEET_NAME = "Inscripciones OATec";

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

    const data = JSON.parse(e.postData.contents || "{}");

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
      data.createdAt || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        result: "success",
        message: "Inscripción guardada correctamente"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        result: "error",
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
