/****************************************************
 * PATATOÏDE — Dimensionnement ISP SDIS 66
 * Carte des zones de couverture ISP
 * Version: 1.0 | 2026-03-16
 ****************************************************/

function doGet(e) {
  var t = HtmlService.createTemplateFromFile("Index");
  t.scriptUrl = ScriptApp.getService().getUrl();
  return t.evaluate()
    .setTitle("Patatoïde — Dimensionnement ISP SDIS 66")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
