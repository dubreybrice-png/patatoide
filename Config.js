/**
 * Patato├»de ÔÇö Configuration
 * SDIS 66 ÔÇö Dimensionnement ISP
 */
var Config = {
  APP_TITLE: 'Patato├»de ÔÇö Dimensionnement ISP SDIS 66',
  SPREADSHEET_ID: '10CndZn6-E5UarPxZ0CMInceGx54lsFn2zWGS-tckyc8',

  SHEETS: {
    INTER:       'donnn├®es inter 2025',
    TEMPS:       'donn├®es temps travail isp',
    LISTING_ISP: 'listing isp',
    DELAI_ISP:   'd├®lai sll isp 2025'
  },

  COL_INTER: { NUM:1, CODE_SIN:2, SINISTRE:3, CODE_ZEC:4, ZEC:5, DEBUT:6, PREMIER_SLL:7, FIN:8, DELAI_SLL:9, DUREE:10, COMMUNE:11 },
  COL_TEMPS: { LIBELLE:1, MATRICULE:2, NOM:3, PRENOM:4, CENTRE:5, DATE_HEURE:6 },
  COL_LISTING: { NOM_PRENOM:1, CENTRE_PRINCIPAL:2, CENTRE_SECONDAIRE:3, EMAIL:4 },
  COL_DELAI: { NUM:1, TYPE_ENGIN:2, CENTRE:3, CODE_ZEC:4, ZEC:5, SORTIE_VALIDE:6, EQUIPAGE:7, SECTEUR:8, DH_DEBUT:9, DH_ALERTE:10, DH_DEPART:11, DH_SLL:12, DH_FIN:13, NB_AGENTS:14, DELAI_MOBIL:15, DELAI_ROUTE:16, DELAI_SLL:17, DUREE_ENGAGE:18 },

  SLOT_DURATION_MIN: 30,

  /* ÔòÉÔòÉÔòÉ Groupes g├®ographiques de communes ÔòÉÔòÉÔòÉ */
  COMMUNE_GROUPS: [
    { name: 'Agglo Perpignan', keywords: ['PERPIGNAN','CABESTANY','CANOHES','SALEILLES','BOMPAS','PIA','SAINT ESTEVE','VILLENEUVE DE LA RAHO','POLLESTRES','TOULOUGES','CLAIRA','SAINTE MARIE'] },
    { name: 'Salanque', keywords: ['SAINT LAURENT DE LA SALANQUE','BARCARES','TORREILLES','VILLELONGUE DE LA SALANQUE','SALSES','LEUCATE'] },
    { name: 'Rib├®ral-Aspres', keywords: ['THUIR','MILLAS','SOLER','PEZILLA','TROUILLAS','FOURQUES','PONTEILLA','NEFIACH','CORNEILLA'] },
    { name: 'Agly-Rivesaltes', keywords: ['RIVESALTES','BAIXAS','ESPIRA','VINGRAU','CASES DE PENE','ESTAGEL','LATOUR DE FRANCE','MAURY','OPOUL'] },
    { name: 'C├┤te Sablonneuse', keywords: ['CANET EN ROUSSILLON','SAINT CYPRIEN','ALENYA','LATOUR BAS ELNE'] },
    { name: 'Plaine Elne', keywords: ['ELNE','SAINT ANDRE','PALAU DEL VIDRE','BAGES','ORTAFFA','BROUILLA','SAINT GENIS DES FONTAINES'] },
    { name: 'C├┤te Vermeille-Alb├¿res', keywords: ['ARGELES','COLLIOURE','PORT-VENDRES','PORT VENDRES','BANYULS','CERBERE','SOREDE','LAROQUE'] },
    { name: 'Vallespir', keywords: ['CERET','BOULOU','AMELIE','ARLES SUR TECH','PRATS DE MOLLO','SAINT JEAN PLA DE CORTS','MAUREILLAS','REYNES'] },
    { name: 'Conflent', keywords: ['PRADES','VERNET','VINCA','ILLE SUR TET','CODALET','RIA SIRACH','MARQUIXANES','OLETTE','VILLEFRANCHE DE CONFLENT'] },
    { name: 'Fenouill├¿des', keywords: ['SAINT PAUL DE FENOUILLET','SOURNIA','CAUDIES','CAUDI├êS'] },
    { name: 'Cerdagne-Capcir', keywords: ['FONT ROMEU','BOURG MADAME','SAILLAGOUSE','MONT LOUIS','ANGLES','FORMIGUERES','MATEMALE','BOLQUERE','EYNE','PORTE PUYMORENS','LATOUR DE CAROL','OSSEJA','ENVEITG'] }
  ],

  /* ÔòÉÔòÉÔòÉ Anneaux concentriques depuis Perpignan (noms centres ISP du sheet temps travail) ÔòÉÔòÉÔòÉ */
  PERPIGNAN_RINGS: [
    { name: 'Perpignan', keywords: ['PERPIGNAN'] },
    { name: '+ ~10 min', keywords: ['CANET','RIVESALTES','RIBERAL'] },
    { name: '+ ~20 min', keywords: ['ELNE','SALANQUE','MILLAS','SAINT CYPRIEN','ASPRES','BAIXAS','PALAU'] },
    { name: '+ ~30 min', keywords: ['ARGELES','BOULOU','ILLE SUR','CERET','COTE VERMEILLE','AGLY','VINCA','BANYULS','VINGRAU'] },
    { name: '+ ~45 min+', keywords: ['VALLESPIR','PRATS','SAINT PAUL','PRADES','OLETTE','SAILLAGOUSE','PORTE'] }
  ],

  /* ÔòÉÔòÉÔòÉ Groupes de casernes (centres ISP du sheet temps travail) pour distribution par zone ÔòÉÔòÉÔòÉ */
  CENTRE_GROUPS: [
    { name: 'Agglo Perpignan', keywords: ['PERPIGNAN'] },
    { name: 'Salanque', keywords: ['SALANQUE','BARCARES'] },
    { name: 'Rib├®ral-Aspres', keywords: ['RIBERAL','ASPRES','MILLAS'] },
    { name: 'Agly-Rivesaltes', keywords: ['RIVESALTES','BAIXAS','AGLY','VINGRAU','MAURY'] },
    { name: 'C├┤te Sablonneuse', keywords: ['CANET','SAINT CYPRIEN'] },
    { name: 'Plaine Elne', keywords: ['ELNE','PALAU'] },
    { name: 'C├┤te Vermeille-Alb├¿res', keywords: ['ARGELES','COTE VERMEILLE','BANYULS'] },
    { name: 'Vallespir', keywords: ['CERET','BOULOU','VALLESPIR','PRATS'] },
    { name: 'Conflent', keywords: ['PRADES','ILLE SUR','VINCA','OLETTE'] },
    { name: 'Fenouill├¿des', keywords: ['SAINT PAUL DE FENOUILLET'] },
    { name: 'Cerdagne-Capcir', keywords: ['SAILLAGOUSE','PORTE','FONT ROMEU'] }
  ]
};
