/**
 * Patatoïde — DataService.js
 * Toute la logique de lecture / agrégation des données
 */

/* ═══════════════════════════════════════════════════════
   1. LECTURE BRUTE DES ONGLETS
   ═══════════════════════════════════════════════════════ */

/** Lit toutes les interventions (onglet donnnées inter 2025) */
function getInterventions_() {
  var sh = getSheet_(Config.SHEETS.INTER);
  var data = sh.getDataRange().getValues();
  var c = Config.COL_INTER;
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var num = (r[c.NUM - 1] || '').toString().trim();
    if (!num) continue;
    rows.push({
      num:        num,
      codeSin:    (r[c.CODE_SIN - 1] || '').toString().trim(),
      sinistre:   (r[c.SINISTRE - 1] || '').toString().trim(),
      codeZec:    (r[c.CODE_ZEC - 1] || '').toString().trim(),
      zec:        (r[c.ZEC - 1] || '').toString().trim(),
      debut:      r[c.DEBUT - 1],
      premierSll: r[c.PREMIER_SLL - 1],
      fin:        r[c.FIN - 1],
      delaiSll:   (r[c.DELAI_SLL - 1] || '').toString().trim(),
      duree:      (r[c.DUREE - 1] || '').toString().trim(),
      commune:    (r[c.COMMUNE - 1] || '').toString().trim()
    });
  }
  return rows;
}

/** Lit les temps de travail ISP */
function getTempsISP_() {
  var sh = getSheet_(Config.SHEETS.TEMPS);
  var data = sh.getDataRange().getValues();
  var c = Config.COL_TEMPS;
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var mat = (r[c.MATRICULE - 1] || '').toString().trim();
    if (!mat) continue;
    rows.push({
      libelle:   (r[c.LIBELLE - 1] || '').toString().trim(),
      matricule: mat,
      nom:       (r[c.NOM - 1] || '').toString().trim(),
      prenom:    (r[c.PRENOM - 1] || '').toString().trim(),
      centre:    (r[c.CENTRE - 1] || '').toString().trim(),
      dateHeure: r[c.DATE_HEURE - 1]
    });
  }
  return rows;
}

/** Lit le listing ISP */
function getListingISP_() {
  var sh = getSheet_(Config.SHEETS.LISTING_ISP);
  var data = sh.getDataRange().getValues();
  var c = Config.COL_LISTING;
  var rows = [];
  // La première ligne peut être vide (header row 1 vide puis row 2 = headers)
  var startRow = 1;
  // Trouver la ligne d'en-tête
  for (var i = 0; i < Math.min(3, data.length); i++) {
    var firstCell = (data[i][0] || '').toString().trim().toLowerCase();
    if (firstCell === 'nom prénom' || firstCell === 'nom prenom') {
      startRow = i + 1;
      break;
    }
  }
  for (var i = startRow; i < data.length; i++) {
    var r = data[i];
    var np = (r[c.NOM_PRENOM - 1] || '').toString().trim();
    if (!np) continue;
    rows.push({
      nomPrenom:        np,
      centrePrincipal:  (r[c.CENTRE_PRINCIPAL - 1] || '').toString().trim(),
      centreSecondaire: (r[c.CENTRE_SECONDAIRE - 1] || '').toString().trim(),
      email:            (r[c.EMAIL - 1] || '').toString().trim()
    });
  }
  return rows;
}

/** Lit les délais SLL ISP */
function getDelaisISP_() {
  var sh = getSheet_(Config.SHEETS.DELAI_ISP);
  var data = sh.getDataRange().getValues();
  var c = Config.COL_DELAI;
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var num = (r[c.NUM - 1] || '').toString().trim();
    if (!num) continue;
    rows.push({
      num:          num,
      typeEngin:    (r[c.TYPE_ENGIN - 1] || '').toString().trim(),
      centre:       (r[c.CENTRE - 1] || '').toString().trim(),
      codeZec:      (r[c.CODE_ZEC - 1] || '').toString().trim(),
      zec:          (r[c.ZEC - 1] || '').toString().trim(),
      sortieValide: (r[c.SORTIE_VALIDE - 1] || '').toString().trim(),
      equipage:     (r[c.EQUIPAGE - 1] || '').toString().trim(),
      secteur:      (r[c.SECTEUR - 1] || '').toString().trim(),
      dhDebut:      r[c.DH_DEBUT - 1],
      dhAlerte:     r[c.DH_ALERTE - 1],
      dhDepart:     r[c.DH_DEPART - 1],
      dhSll:        r[c.DH_SLL - 1],
      dhFin:        r[c.DH_FIN - 1],
      nbAgents:     r[c.NB_AGENTS - 1],
      delaiMobil:   (r[c.DELAI_MOBIL - 1] || '').toString().trim(),
      delaiRoute:   (r[c.DELAI_ROUTE - 1] || '').toString().trim(),
      delaiSll:     (r[c.DELAI_SLL - 1] || '').toString().trim(),
      dureeEngage:  (r[c.DUREE_ENGAGE - 1] || '').toString().trim()
    });
  }
  return rows;
}

/* ═══════════════════════════════════════════════════════
   2. AGRÉGATION & STATS — INTERVENTIONS
   ═══════════════════════════════════════════════════════ */

/** Parse "HH:MM:SS" → minutes (float) */
function parseHMS_(str) {
  if (!str) return null;
  str = str.toString().trim();
  var m = str.match(/^(\d+):(\d+):(\d+)$/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseInt(m[3], 10) / 60;
}

/** Parse une date (Date obj ou string) → { month, hour, dayOfWeek } */
function parseDateParts_(v) {
  var d;
  if (v instanceof Date) {
    d = v;
  } else {
    var s = (v || '').toString().trim();
    // format JJ/MM/AAAA HH:MM
    var m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (m) {
      d = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]), parseInt(m[4]), parseInt(m[5]));
    } else {
      d = new Date(s);
    }
  }
  if (isNaN(d.getTime())) return null;
  return {
    date: d,
    month: d.getMonth() + 1,
    hour: d.getHours(),
    dayOfWeek: d.getDay() // 0=dim
  };
}

/* ═══════════════════════════════════════════════════════
   3. API PRINCIPALE — getPageData()
   ═══════════════════════════════════════════════════════ */

function getPageData() {
  var interventions = getInterventions_();
  var tempsISP      = getTempsISP_();
  var listingISP    = getListingISP_();
  var delaisISP     = getDelaisISP_();

  return {
    stats:       buildStats_(interventions, tempsISP, listingISP, delaisISP),
    listing:     listingISP,
    centres:     buildCentresList_(listingISP)
  };
}

function buildCentresList_(listing) {
  var set = {};
  for (var i = 0; i < listing.length; i++) {
    var c = listing[i].centrePrincipal;
    if (c) set[c] = (set[c] || 0) + 1;
    var c2 = listing[i].centreSecondaire;
    if (c2) {
      if (!set[c2]) set[c2] = 0;
    }
  }
  var result = [];
  for (var k in set) {
    result.push({ centre: k, nbIsp: set[k] });
  }
  result.sort(function (a, b) { return b.nbIsp - a.nbIsp; });
  return result;
}

function buildStats_(interventions, tempsISP, listingISP, delaisISP) {
  return {
    interGlobal:    buildInterStats_(interventions),
    interISP:       buildInterISPStats_(delaisISP),
    tempsISP:       buildTempsStats_(tempsISP),
    effectif:       buildEffectifStats_(listingISP),
    delais:         buildDelaiStats_(delaisISP)
  };
}

/* ─── Stats interventions globales ─── */
function buildInterStats_(rows) {
  var total = rows.length;
  var byCommune = {};
  var byMonth = {};
  var byHour = {};
  var byDayOfWeek = {};
  var bySinistre = {};
  var delais = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    // Par commune
    var com = r.commune || 'Inconnu';
    byCommune[com] = (byCommune[com] || 0) + 1;

    // Par sinistre
    var sin = r.sinistre || 'Inconnu';
    bySinistre[sin] = (bySinistre[sin] || 0) + 1;

    // Par mois/heure/jour
    var dp = parseDateParts_(r.debut);
    if (dp) {
      var mk = dp.month;
      byMonth[mk] = (byMonth[mk] || 0) + 1;
      byHour[dp.hour] = (byHour[dp.hour] || 0) + 1;
      byDayOfWeek[dp.dayOfWeek] = (byDayOfWeek[dp.dayOfWeek] || 0) + 1;
    }

    // Délai SLL
    var d = parseHMS_(r.delaiSll);
    if (d !== null) delais.push(d);
  }

  // Top 20 communes
  var communeArr = objToSorted_(byCommune);
  // Top sinistres
  var sinistreArr = objToSorted_(bySinistre);
  // Heures 0-23
  var hourArr = [];
  for (var h = 0; h < 24; h++) hourArr.push({ key: h, val: byHour[h] || 0 });
  // Mois 1-12
  var monthArr = [];
  var moisNoms = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  for (var m = 1; m <= 12; m++) monthArr.push({ key: moisNoms[m], val: byMonth[m] || 0 });
  // Jours
  var jourNoms = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  var dayArr = [];
  for (var d = 0; d < 7; d++) dayArr.push({ key: jourNoms[d], val: byDayOfWeek[d] || 0 });

  // Percentiles délai
  delais.sort(function (a, b) { return a - b; });
  var p50 = delais.length ? delais[Math.floor(delais.length * 0.5)] : 0;
  var p90 = delais.length ? delais[Math.floor(delais.length * 0.9)] : 0;

  return {
    total: total,
    byCommune: communeArr.slice(0, 30),
    bySinistre: sinistreArr.slice(0, 15),
    byHour: hourArr,
    byMonth: monthArr,
    byDay: dayArr,
    delaiMedian: Math.round(p50 * 10) / 10,
    delaiP90: Math.round(p90 * 10) / 10,
    nbDelais: delais.length
  };
}

/* ─── Stats interventions ISP ─── */
function buildInterISPStats_(delais) {
  var total = delais.length;
  var byCentre = {};
  var byZec = {};
  var byHour = {};
  var byMonth = {};
  var delaiRouteArr = [];
  var delaiSllArr = [];

  for (var i = 0; i < delais.length; i++) {
    var r = delais[i];
    var c = r.centre || 'Inconnu';
    byCentre[c] = (byCentre[c] || 0) + 1;

    var z = r.zec || 'Inconnu';
    byZec[z] = (byZec[z] || 0) + 1;

    var dp = parseDateParts_(r.dhDebut);
    if (dp) {
      byHour[dp.hour] = (byHour[dp.hour] || 0) + 1;
      var mk = dp.month;
      byMonth[mk] = (byMonth[mk] || 0) + 1;
    }

    var dr = parseHMS_(r.delaiRoute);
    if (dr !== null) delaiRouteArr.push(dr);
    var ds = parseHMS_(r.delaiSll);
    if (ds !== null) delaiSllArr.push(ds);
  }

  delaiRouteArr.sort(function (a, b) { return a - b; });
  delaiSllArr.sort(function (a, b) { return a - b; });

  var hourArr = [];
  for (var h = 0; h < 24; h++) hourArr.push({ key: h, val: byHour[h] || 0 });

  var moisNoms = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  var monthArr = [];
  for (var m = 1; m <= 12; m++) monthArr.push({ key: moisNoms[m], val: byMonth[m] || 0 });

  return {
    total: total,
    byCentre: objToSorted_(byCentre),
    byZec: objToSorted_(byZec).slice(0, 20),
    byHour: hourArr,
    byMonth: monthArr,
    delaiRouteMedian: median_(delaiRouteArr),
    delaiRouteP90: percentile_(delaiRouteArr, 0.9),
    delaiSllMedian: median_(delaiSllArr),
    delaiSllP90: percentile_(delaiSllArr, 0.9),
    nbDelaisRoute: delaiRouteArr.length,
    nbDelaisSll: delaiSllArr.length
  };
}

/* ─── Stats temps de travail ISP ─── */
function buildTempsStats_(rows) {
  // Dédoublonnage : pour chaque (matricule, dateHeure identique),
  // on garde Garde > Astreinte > Disponible
  var priority = { 'garde': 3, 'astreinte': 2, 'disponible': 1 };
  var grouped = {};
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var lib = r.libelle.toLowerCase().replace(/[^a-zéèêà]/g, '');
    var type = 'disponible';
    if (lib.indexOf('garde') !== -1) type = 'garde';
    else if (lib.indexOf('astreinte') !== -1) type = 'astreinte';

    var dh = '';
    if (r.dateHeure instanceof Date) {
      dh = r.dateHeure.getTime().toString();
    } else {
      dh = (r.dateHeure || '').toString().trim();
    }
    var key = r.matricule + '||' + dh;

    if (!grouped[key] || (priority[type] || 0) > (priority[grouped[key].type] || 0)) {
      grouped[key] = {
        type: type,
        matricule: r.matricule,
        nom: r.nom,
        prenom: r.prenom,
        centre: r.centre,
        dateHeure: r.dateHeure
      };
    }
  }

  // Convertir en liste
  var deduped = [];
  for (var k in grouped) deduped.push(grouped[k]);

  // Stats par ISP
  var byISP = {};
  var byCentre = {};
  var byType = { garde: 0, astreinte: 0, disponible: 0 };
  var byHour = {};
  var byMonth = {};

  for (var i = 0; i < deduped.length; i++) {
    var r = deduped[i];
    var t = r.type;
    byType[t] = (byType[t] || 0) + 1;

    var ispKey = r.matricule;
    if (!byISP[ispKey]) byISP[ispKey] = { matricule: r.matricule, nom: r.nom, prenom: r.prenom, centre: r.centre, garde: 0, astreinte: 0, disponible: 0, total: 0 };
    byISP[ispKey][t]++;
    byISP[ispKey].total++;

    var ctr = r.centre || 'Inconnu';
    if (!byCentre[ctr]) byCentre[ctr] = { garde: 0, astreinte: 0, disponible: 0, total: 0 };
    byCentre[ctr][t]++;
    byCentre[ctr].total++;

    var dp = parseDateParts_(r.dateHeure);
    if (dp) {
      byHour[dp.hour] = (byHour[dp.hour] || 0) + 1;
      byMonth[dp.month] = (byMonth[dp.month] || 0) + 1;
    }
  }

  // Top ISP
  var ispArr = [];
  for (var k in byISP) ispArr.push(byISP[k]);
  ispArr.sort(function (a, b) { return b.total - a.total; });

  // Par centre
  var centreArr = [];
  for (var k in byCentre) centreArr.push({ centre: k, garde: byCentre[k].garde, astreinte: byCentre[k].astreinte, disponible: byCentre[k].disponible, total: byCentre[k].total });
  centreArr.sort(function (a, b) { return b.total - a.total; });

  var hourArr = [];
  for (var h = 0; h < 24; h++) hourArr.push({ key: h, val: byHour[h] || 0 });

  var moisNoms = ['', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  var monthArr = [];
  for (var m = 1; m <= 12; m++) monthArr.push({ key: moisNoms[m], val: byMonth[m] || 0 });

  return {
    totalCreneaux: deduped.length,
    byType: byType,
    byISP: ispArr,
    byCentre: centreArr,
    byHour: hourArr,
    byMonth: monthArr
  };
}

/* ─── Stats effectif ISP ─── */
function buildEffectifStats_(listing) {
  var byCentre = {};
  for (var i = 0; i < listing.length; i++) {
    var c = listing[i].centrePrincipal || 'Non affecté';
    byCentre[c] = (byCentre[c] || 0) + 1;
  }
  var arr = [];
  for (var k in byCentre) arr.push({ centre: k, count: byCentre[k] });
  arr.sort(function (a, b) { return b.count - a.count; });
  return { total: listing.length, byCentre: arr };
}

/* ─── Stats délais ISP ─── */
function buildDelaiStats_(delais) {
  var byCentre = {};
  for (var i = 0; i < delais.length; i++) {
    var r = delais[i];
    var c = r.centre || 'Inconnu';
    if (!byCentre[c]) byCentre[c] = { routeArr: [], sllArr: [], count: 0 };
    byCentre[c].count++;
    var dr = parseHMS_(r.delaiRoute);
    if (dr !== null) byCentre[c].routeArr.push(dr);
    var ds = parseHMS_(r.delaiSll);
    if (ds !== null) byCentre[c].sllArr.push(ds);
  }
  var arr = [];
  for (var k in byCentre) {
    var o = byCentre[k];
    o.routeArr.sort(function (a, b) { return a - b; });
    o.sllArr.sort(function (a, b) { return a - b; });
    arr.push({
      centre: k,
      count: o.count,
      routeMedian: median_(o.routeArr),
      routeP90: percentile_(o.routeArr, 0.9),
      sllMedian: median_(o.sllArr),
      sllP90: percentile_(o.sllArr, 0.9)
    });
  }
  arr.sort(function (a, b) { return b.count - a.count; });
  return arr;
}

/* ─── Helpers ─── */
function objToSorted_(obj) {
  var arr = [];
  for (var k in obj) arr.push({ key: k, val: obj[k] });
  arr.sort(function (a, b) { return b.val - a.val; });
  return arr;
}

function median_(sortedArr) {
  if (!sortedArr.length) return 0;
  return Math.round(sortedArr[Math.floor(sortedArr.length * 0.5)] * 10) / 10;
}

function percentile_(sortedArr, p) {
  if (!sortedArr.length) return 0;
  return Math.round(sortedArr[Math.floor(sortedArr.length * p)] * 10) / 10;
}
