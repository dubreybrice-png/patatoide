/**
 * Patatoïde — Code.js (point d'entrée)
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏥 Patatoïde')
    .addItem('Ouvrir la webapp', 'ouvrirWebapp')
    .addToUi();
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(Config.APP_TITLE)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function ouvrirWebapp() {
  var html = HtmlService.createHtmlOutputFromFile('Index')
    .setWidth(1200)
    .setHeight(800);
  SpreadsheetApp.getUi().showModalDialog(html, Config.APP_TITLE);
}

/* ─── Helpers ─── */
function getSpreadsheet_() {
  return SpreadsheetApp.openById(Config.SPREADSHEET_ID);
}

function getSheet_(name) {
  var ss = getSpreadsheet_();
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Onglet introuvable : ' + name);
  return sh;
}
