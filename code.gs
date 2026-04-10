const SPREADSHEET_ID = '1zDyqmLhGARnpX0wc484X5gUxk5zLdkCB-wJL-6nrQfI';
const SHEET_NAME = 'Inscripcion-OATec2026';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'Fecha de registro',
        'Nombres',
        'Apellidos',
        'Edad',
        'Fecha de nacimiento',
        'DNI',
        'Curso',
        'División',
        'Institución',
        'Competencia',
        'Temática',
        'Timestamp ISO'
      ]);
    }

    const data = e && e.parameter ? e.parameter : {};

    sheet.appendRow([
      new Date(),
      data.firstName || '',
      data.lastName || '',
      data.age || '',
      data.birthDate || '',
      data.dni || '',
      data.course || '',
      data.division || '',
      data.institution || 'Instituto San Miguel',
      data.competition || 'OATec ITBA 2026',
      data.theme || 'Desafío Espacial',
      data.createdAt || new Date().toISOString()
    ]);

    SpreadsheetApp.flush();
    return ContentService.createTextOutput('OK');
  } catch (error) {
    return ContentService.createTextOutput('ERROR: ' + error.message);
  }
}