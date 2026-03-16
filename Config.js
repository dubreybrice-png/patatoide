/**
 * Patatoïde — Configuration
 * SDIS 66 — Dimensionnement ISP
 */
var Config = {
  APP_TITLE: 'Patatoïde — Dimensionnement ISP SDIS 66',
  SPREADSHEET_ID: '10CndZn6-E5UarPxZ0CMInceGx54lsFn2zWGS-tckyc8',

  /* ─── Noms des onglets ─── */
  SHEETS: {
    INTER:       'donnnées inter 2025',
    TEMPS:       'données temps travail isp',
    LISTING_ISP: 'listing isp',
    DELAI_ISP:   'délai sll isp 2025'
  },

  /* ─── Colonnes onglet "donnnées inter 2025" (A=1) ─── */
  COL_INTER: {
    NUM:          1,  // A — N° inter
    CODE_SIN:     2,  // B — Code sinistre
    SINISTRE:     3,  // C — Sinistre
    CODE_ZEC:     4,  // D — Code ZEC
    ZEC:          5,  // E — ZEC
    DEBUT:        6,  // F — Début
    PREMIER_SLL:  7,  // G — 1er engin SLL
    FIN:          8,  // H — Fin
    DELAI_SLL:    9,  // I — Délai SLL
    DUREE:       10,  // J — Durée inter
    COMMUNE:     11   // K — Commune
  },

  /* ─── Colonnes onglet "données temps travail isp" (A=1) ─── */
  COL_TEMPS: {
    LIBELLE:      1,  // A — Libelle Complet (Disponible / Astreinte / Garde)
    MATRICULE:    2,  // B — Matricule
    NOM:          3,  // C — Nom
    PRENOM:       4,  // D — Prénom
    CENTRE:       5,  // E — Centre Rattachement
    DATE_HEURE:   6   // F — Date Heure de début de tranche planning
  },

  /* ─── Colonnes onglet "listing isp" (A=1) ─── */
  COL_LISTING: {
    NOM_PRENOM:        1,  // A — Nom Prénom
    CENTRE_PRINCIPAL:  2,  // B — Centre Principal
    CENTRE_SECONDAIRE: 3,  // C — Centre Secondaire
    EMAIL:             4   // D — email
  },

  /* ─── Colonnes onglet "délai sll isp 2025" (A=1) ─── */
  COL_DELAI: {
    NUM:              1,   // A — N° inter
    TYPE_ENGIN:       2,   // B — Type engin
    CENTRE:           3,   // C — Centre
    CODE_ZEC:         4,   // D — Code ZEC
    ZEC:              5,   // E — ZEC
    SORTIE_VALIDE:    6,   // F — Sortie valide
    EQUIPAGE:         7,   // G — Equipage
    SECTEUR:          8,   // H — Secteur
    DH_DEBUT:         9,   // I — DH début inter
    DH_ALERTE:       10,   // J — DH alerte
    DH_DEPART:       11,   // K — DH départ
    DH_SLL:          12,   // L — DH SLL
    DH_FIN:          13,   // M — DH fin
    NB_AGENTS:       14,   // N — Nb agents engagés
    DELAI_MOBIL:     15,   // O — Délai mobilisation
    DELAI_ROUTE:     16,   // P — Délai route
    DELAI_SLL:       17,   // Q — Délai SLL
    DUREE_ENGAGE:    18    // R — Durée engagement
  },

  /* ─── Départemental ─── */
  DEPARTEMENT_CENTER: { lat: 42.6988, lng: 2.8954 },
  DEPARTEMENT_ZOOM: 9
};
