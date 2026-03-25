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

/** DEBUG: retourne les noms bruts des centres du listing ISP */
function debugCentreNames() {
  var sh = SpreadsheetApp.openById(Config.SPREADSHEET_ID).getSheetByName(Config.SHEETS.LISTING_ISP);
  var data = sh.getDataRange().getValues();
  var c = Config.COL_LISTING;
  var names = {};
  for (var i = 1; i < data.length; i++) {
    var v = (data[i][c.CENTRE_PRINCIPAL - 1] || '').toString().trim();
    if (v) names[v] = (names[v] || 0) + 1;
  }
  return names;
}
