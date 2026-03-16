/**
 * Patatoïde — DataService.js
 * Lecture + agrégation de toutes les données
 */

/* ═══════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════ */
function getSpreadsheet_() { return SpreadsheetApp.openById(Config.SPREADSHEET_ID); }
function getSheet_(name) {
  var sh = getSpreadsheet_().getSheetByName(name);
  if (!sh) throw new Error('Onglet introuvable : ' + name);
  return sh;
}

function parseHMS_(str) {
  if (!str) return null;
  str = str.toString().trim();
  if (str === '-' || str === '') return null;
  var m = str.match(/(\d+):(\d+):(\d+)/);
  if (!m) return null;
  return parseInt(m[1],10)*60 + parseInt(m[2],10) + parseInt(m[3],10)/60;
}

function parseDateParts_(v) {
  var d;
  if (v instanceof Date) { d = v; }
  else {
    var s = (v||'').toString().trim();
    var m = s.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
    if (m) d = new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5]);
    else d = new Date(s);
  }
  if (!d || isNaN(d.getTime())) return null;
  return { date:d, month:d.getMonth()+1, hour:d.getHours(), dayOfWeek:d.getDay() };
}

function slotKey_(v) {
  var d;
  if (v instanceof Date) { d = v; }
  else {
    var s = (v||'').toString().trim();
    var m = s.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (m) d = new Date(+m[3], +m[2]-1, +m[1], +m[4], +m[5], +m[6]);
    else d = new Date(s);
  }
  if (!d || isNaN(d.getTime())) return null;
  return d.getTime();
}

function objToSorted_(o) {
  var a=[]; for (var k in o) a.push({key:k,val:o[k]});
  a.sort(function(a,b){return b.val-a.val;}); return a;
}
function median_(arr) { if(!arr.length)return 0; arr.sort(function(a,b){return a-b;}); return Math.round(arr[Math.floor(arr.length*0.5)]*10)/10; }
function mean_(arr) { if(!arr.length)return 0; var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return Math.round(s/arr.length*10)/10; }

function matchKeywords_(text, keywords) {
  var t = (text||'').toUpperCase().replace(/,/g,' ').replace(/\s+/g,' ').trim();
  for (var i=0; i<keywords.length; i++) {
    if (t.indexOf(keywords[i].toUpperCase()) !== -1) return true;
  }
  return false;
}

/* ═══════════════════════════════════════════════════════
   LECTURE BRUTE
   ═══════════════════════════════════════════════════════ */
function readInter_() {
  var sh=getSheet_(Config.SHEETS.INTER), data=sh.getDataRange().getValues(), c=Config.COL_INTER, rows=[];
  for (var i=1;i<data.length;i++) {
    var r=data[i], num=(r[c.NUM-1]||'').toString().trim();
    if(!num)continue;
    rows.push({ num:num, commune:(r[c.COMMUNE-1]||'').toString().trim(), debut:r[c.DEBUT-1], delaiSll:(r[c.DELAI_SLL-1]||'').toString().trim() });
  }
  return rows;
}

function readTemps_() {
  var sh=getSheet_(Config.SHEETS.TEMPS), data=sh.getDataRange().getValues(), c=Config.COL_TEMPS, rows=[];
  for (var i=1;i<data.length;i++) {
    var r=data[i], mat=(r[c.MATRICULE-1]||'').toString().trim();
    if(!mat)continue;
    rows.push({
      libelle:(r[c.LIBELLE-1]||'').toString().trim(),
      matricule:mat,
      nom:(r[c.NOM-1]||'').toString().trim(),
      prenom:(r[c.PRENOM-1]||'').toString().trim(),
      centre:(r[c.CENTRE-1]||'').toString().trim(),
      dateHeure:r[c.DATE_HEURE-1]
    });
  }
  return rows;
}

function readListing_() {
  var sh=getSheet_(Config.SHEETS.LISTING_ISP), data=sh.getDataRange().getValues(), c=Config.COL_LISTING, rows=[];
  var start=1;
  for (var i=0;i<Math.min(3,data.length);i++) {
    var f=(data[i][0]||'').toString().trim().toLowerCase();
    if(f==='nom prénom'||f==='nom prenom'){start=i+1;break;}
  }
  for (var i=start;i<data.length;i++) {
    var r=data[i], np=(r[c.NOM_PRENOM-1]||'').toString().trim();
    if(!np)continue;
    rows.push({ nomPrenom:np, centrePrincipal:(r[c.CENTRE_PRINCIPAL-1]||'').toString().trim(), centreSecondaire:(r[c.CENTRE_SECONDAIRE-1]||'').toString().trim() });
  }
  return rows;
}

function readDelais_() {
  var sh=getSheet_(Config.SHEETS.DELAI_ISP), data=sh.getDataRange().getValues(), c=Config.COL_DELAI, rows=[];
  for (var i=1;i<data.length;i++) {
    var r=data[i], num=(r[c.NUM-1]||'').toString().trim();
    if(!num)continue;
    rows.push({
      num:num, centre:(r[c.CENTRE-1]||'').toString().trim(),
      delaiRoute:(r[c.DELAI_ROUTE-1]||'').toString().trim(),
      delaiSll:(r[c.DELAI_SLL-1]||'').toString().trim()
    });
  }
  return rows;
}

/* ═══════════════════════════════════════════════════════
   API PRINCIPALE
   ═══════════════════════════════════════════════════════ */
function getPageData() {
  var inter   = readInter_();
  var temps   = readTemps_();
  var listing = readListing_();
  var delais  = readDelais_();

  var deduped = deduplicateTemps_(temps);

  return {
    interStats:       buildInterStats_(inter),
    tempsStats:       buildTempsStats_(deduped),
    effectifStats:    buildEffectifStats_(listing),
    delaiStats:       buildDelaiAvg_(delais),
    availDept:        buildAvailability_(deduped, null),
    availRings:       buildRingAvailability_(deduped),
    zeroCoverageByHour: buildZeroCoverageByHour_(deduped),
    centres:          buildCentresList_(listing)
  };
}

/* ═══════════════════════════════════════════════════════
   DEDUPLICATION TEMPS
   Même matricule + même dateHeure → garde > astreinte > dispo
   ═══════════════════════════════════════════════════════ */
function deduplicateTemps_(rows) {
  var priority = { 'garde':3, 'astreinte':2, 'disponible':1 };
  var grouped = {};
  for (var i=0; i<rows.length; i++) {
    var r = rows[i];
    var lib = r.libelle.toLowerCase();
    var type = 'disponible';
    if (lib.indexOf('garde') !== -1) type = 'garde';
    else if (lib.indexOf('astreinte') !== -1) type = 'astreinte';

    var sk = slotKey_(r.dateHeure);
    if (sk === null) continue;
    var key = r.matricule + '|' + sk;

    if (!grouped[key] || (priority[type]||0) > (priority[grouped[key].type]||0)) {
      grouped[key] = { type:type, matricule:r.matricule, nom:r.nom, prenom:r.prenom, centre:r.centre, slotTs:sk, dateHeure:r.dateHeure };
    }
  }
  var result = [];
  for (var k in grouped) result.push(grouped[k]);
  return result;
}

/* ═══════════════════════════════════════════════════════
   STATS INTERVENTIONS
   ═══════════════════════════════════════════════════════ */
function buildInterStats_(rows) {
  var total = rows.length;
  var byCommune = {}, byHour = {}, byGroup = {};

  for (var i=0; i<rows.length; i++) {
    var r = rows[i];
    var com = r.commune || 'Inconnu';
    byCommune[com] = (byCommune[com]||0) + 1;

    var dp = parseDateParts_(r.debut);
    if (dp) byHour[dp.hour] = (byHour[dp.hour]||0) + 1;

    // Groupe géographique
    var gName = findCommuneGroup_(com);
    byGroup[gName] = (byGroup[gName]||0) + 1;
  }

  var hourArr = [];
  for (var h=0;h<24;h++) hourArr.push({key:h, val:byHour[h]||0});

  return {
    total: total,
    byCommune: objToSorted_(byCommune).slice(0,30),
    byGroup: objToSorted_(byGroup),
    byHour: hourArr
  };
}

function findCommuneGroup_(commune) {
  var groups = Config.COMMUNE_GROUPS;
  for (var g=0; g<groups.length; g++) {
    if (matchKeywords_(commune, groups[g].keywords)) return groups[g].name;
  }
  return 'Autres';
}

/* ═══════════════════════════════════════════════════════
   STATS TEMPS TRAVAIL (après dédup, sans garde)
   ═══════════════════════════════════════════════════════ */
function buildTempsStats_(deduped) {
  var byType = { astreinte:0, disponible:0 };
  var byISP = {};
  var byCentre = {};
  var byHour = {};
  var byMonth = {};
  var totalSlots = 0;

  for (var i=0; i<deduped.length; i++) {
    var r = deduped[i];
    if (r.type === 'garde') continue; // on ignore la garde

    totalSlots++;
    byType[r.type] = (byType[r.type]||0) + 1;

    // Par ISP
    var ik = r.matricule;
    if (!byISP[ik]) byISP[ik] = { matricule:r.matricule, nom:r.nom, prenom:r.prenom, centre:r.centre, astreinte:0, disponible:0, total:0 };
    byISP[ik][r.type]++;
    byISP[ik].total++;

    // Par centre
    var ck = r.centre || 'Inconnu';
    if (!byCentre[ck]) byCentre[ck] = { astreinte:0, disponible:0, total:0 };
    byCentre[ck][r.type]++;
    byCentre[ck].total++;

    var dp = parseDateParts_(r.dateHeure);
    if (dp) {
      byHour[dp.hour] = (byHour[dp.hour]||0) + 1;
      byMonth[dp.month] = (byMonth[dp.month]||0) + 1;
    }
  }

  var ispArr = [];
  for (var k in byISP) {
    var p = byISP[k];
    p.tauxAstreinte = p.total > 0 ? Math.round(p.astreinte / p.total * 1000) / 10 : 0;
    p.heuresTotal = Math.round(p.total * Config.SLOT_DURATION_MIN / 60 * 10) / 10;
    ispArr.push(p);
  }
  ispArr.sort(function(a,b){ return b.total - a.total; });

  var centreArr = [];
  for (var k in byCentre) {
    var c = byCentre[k];
    c.centre = k;
    c.pctAstreinte = c.total > 0 ? Math.round(c.astreinte / c.total * 1000) / 10 : 0;
    c.pctDispo = c.total > 0 ? Math.round(c.disponible / c.total * 1000) / 10 : 0;
    centreArr.push(c);
  }
  centreArr.sort(function(a,b){ return b.total - a.total; });

  var hourArr = [];
  for (var h=0;h<24;h++) hourArr.push({key:h, val:byHour[h]||0});

  var moisNoms = ['','Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  var monthArr = [];
  for (var m=1;m<=12;m++) monthArr.push({key:moisNoms[m], val:byMonth[m]||0});

  return {
    totalSlots: totalSlots,
    heuresTotal: Math.round(totalSlots * Config.SLOT_DURATION_MIN / 60),
    byType: byType,
    byISP: ispArr,
    byCentre: centreArr,
    byHour: hourArr,
    byMonth: monthArr
  };
}

/* ═══════════════════════════════════════════════════════
   EFFECTIF
   ═══════════════════════════════════════════════════════ */
function buildEffectifStats_(listing) {
  var byCentre = {};
  for (var i=0;i<listing.length;i++) {
    var c = listing[i].centrePrincipal || 'Non affecté';
    byCentre[c] = (byCentre[c]||0) + 1;
  }
  var arr = [];
  for (var k in byCentre) arr.push({key:k, val:byCentre[k]});
  arr.sort(function(a,b){return b.val-a.val;});
  return { total:listing.length, byCentre:arr };
}

function buildCentresList_(listing) {
  var set = {};
  for (var i=0;i<listing.length;i++) {
    var c = listing[i].centrePrincipal;
    if (c) set[c] = (set[c]||0) + 1;
  }
  var r = [];
  for (var k in set) r.push({centre:k,nbIsp:set[k]});
  r.sort(function(a,b){return b.nbIsp-a.nbIsp;});
  return r;
}

/* ═══════════════════════════════════════════════════════
   DELAIS ISP — moyennes simples col P et Q
   ═══════════════════════════════════════════════════════ */
function buildDelaiAvg_(delais) {
  var routeArr = [], sllArr = [];
  for (var i=0;i<delais.length;i++) {
    var dr = parseHMS_(delais[i].delaiRoute);
    var ds = parseHMS_(delais[i].delaiSll);
    if (dr !== null) routeArr.push(dr);
    if (ds !== null) sllArr.push(ds);
  }
  return {
    totalSorties: delais.length,
    moyRoute: mean_(routeArr),
    moySll: mean_(sllArr),
    medRoute: median_(routeArr),
    medSll: median_(sllArr),
    nbRoute: routeArr.length,
    nbSll: sllArr.length
  };
}

/* ═══════════════════════════════════════════════════════
   DISPONIBILITÉ / COUVERTURE
   Combien d'ISP dispo (astreinte ou dispo) à chaque instant ?
   ═══════════════════════════════════════════════════════ */
function buildAvailability_(deduped, centreFilter) {
  // centreFilter = null (tout le dept) ou array de keywords
  var slotCounts = {}; // slotTs → nb ISP
  var allSlotTs = {};

  for (var i=0; i<deduped.length; i++) {
    var r = deduped[i];
    if (r.type === 'garde') continue;

    // Filtre par centre si demandé
    if (centreFilter && !matchKeywords_(r.centre, centreFilter)) continue;

    allSlotTs[r.slotTs] = true;
    slotCounts[r.slotTs] = (slotCounts[r.slotTs]||0) + 1;
  }

  // Trouver la plage temporelle complète
  var minTs = Infinity, maxTs = -Infinity;
  for (var i=0; i<deduped.length; i++) {
    var ts = deduped[i].slotTs;
    if (ts < minTs) minTs = ts;
    if (ts > maxTs) maxTs = ts;
  }

  // Compter tous les créneaux de 30 min dans la plage
  var slotMs = Config.SLOT_DURATION_MIN * 60 * 1000;
  var totalSlots = 0;
  if (minTs < Infinity && maxTs > -Infinity) {
    totalSlots = Math.floor((maxTs - minTs) / slotMs) + 1;
  }

  // Distribution : combien de créneaux ont 0, 1, 2... ISP
  var dist = {};
  var slotsWithIsp = 0;
  var maxIsp = 0;
  for (var ts in slotCounts) {
    var n = slotCounts[ts];
    dist[n] = (dist[n]||0) + 1;
    slotsWithIsp++;
    if (n > maxIsp) maxIsp = n;
  }

  // Créneaux avec 0 ISP
  var slotsZero = totalSlots - slotsWithIsp;
  if (slotsZero < 0) slotsZero = 0;
  dist[0] = slotsZero;

  // Convertir en tableau ordonné avec %
  var distArr = [];
  for (var n = 0; n <= maxIsp; n++) {
    var count = dist[n] || 0;
    var pct = totalSlots > 0 ? Math.round(count / totalSlots * 1000) / 10 : 0;
    distArr.push({ ispCount: n, slots: count, pct: pct, heures: Math.round(count * Config.SLOT_DURATION_MIN / 60 * 10) / 10 });
  }

  var heuresZero = Math.round(slotsZero * Config.SLOT_DURATION_MIN / 60 * 10) / 10;
  var pctZero = totalSlots > 0 ? Math.round(slotsZero / totalSlots * 1000) / 10 : 0;

  return {
    totalSlots: totalSlots,
    totalHeures: Math.round(totalSlots * Config.SLOT_DURATION_MIN / 60),
    heuresZeroIsp: heuresZero,
    pctZeroIsp: pctZero,
    distribution: distArr,
    maxIsp: maxIsp
  };
}

/* ═══════════════════════════════════════════════════════
   COUVERTURE PAR ANNEAUX CONCENTRIQUES
   ═══════════════════════════════════════════════════════ */
function buildRingAvailability_(deduped) {
  var rings = Config.PERPIGNAN_RINGS;
  var results = [];
  var cumulKeywords = [];

  for (var r = 0; r < rings.length; r++) {
    // Cumuler les keywords (chaque anneau inclut les précédents)
    for (var k = 0; k < rings[r].keywords.length; k++) {
      cumulKeywords.push(rings[r].keywords[k]);
    }
    var avail = buildAvailability_(deduped, cumulKeywords.slice());
    results.push({
      ringName: rings[r].name,
      ringLabel: r === 0 ? rings[r].name : rings.slice(0, r+1).map(function(x){return x.name;}).join(' → '),
      heuresZeroIsp: avail.heuresZeroIsp,
      pctZeroIsp: avail.pctZeroIsp,
      distribution: avail.distribution,
      totalHeures: avail.totalHeures
    });
  }
  return results;
}

/* ═══════════════════════════════════════════════════════
   HEURES SANS COUVERTURE — PAR TRANCHE HORAIRE
   À quelle heure de la journée se produisent les 0 ISP ?
   ═══════════════════════════════════════════════════════ */
function buildZeroCoverageByHour_(deduped) {
  // 1. Build set of slots with at least one ISP (excluding garde)
  var coveredSlots = {};
  for (var i = 0; i < deduped.length; i++) {
    var r = deduped[i];
    if (r.type === 'garde') continue;
    coveredSlots[r.slotTs] = true;
  }

  // 2. Find min/max timestamps
  var minTs = Infinity, maxTs = -Infinity;
  for (var i = 0; i < deduped.length; i++) {
    var ts = deduped[i].slotTs;
    if (ts < minTs) minTs = ts;
    if (ts > maxTs) maxTs = ts;
  }

  if (minTs >= Infinity) return { byHour: [], totalZeroSlots: 0 };

  // 3. Iterate all 30-min slots and find those with 0 ISP
  var slotMs = Config.SLOT_DURATION_MIN * 60 * 1000;
  var zeroByHour = {};
  var totalByHour = {};
  var totalZeroSlots = 0;

  for (var h = 0; h < 24; h++) { zeroByHour[h] = 0; totalByHour[h] = 0; }

  for (var ts = minTs; ts <= maxTs; ts += slotMs) {
    var d = new Date(ts);
    var h = d.getHours();
    totalByHour[h]++;
    if (!coveredSlots[ts]) {
      zeroByHour[h]++;
      totalZeroSlots++;
    }
  }

  var byHour = [];
  for (var h = 0; h < 24; h++) {
    var pct = totalByHour[h] > 0 ? Math.round(zeroByHour[h] / totalByHour[h] * 1000) / 10 : 0;
    byHour.push({ hour: h, zeroSlots: zeroByHour[h], totalSlots: totalByHour[h], pct: pct, heures: Math.round(zeroByHour[h] * Config.SLOT_DURATION_MIN / 60 * 10) / 10 });
  }

  return { byHour: byHour, totalZeroSlots: totalZeroSlots };
}
