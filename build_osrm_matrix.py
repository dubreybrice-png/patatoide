"""
Script pour construire les matrices de temps de trajet réel via OSRM.
Génère un fichier JS à inclure dans Index.html avec :
  - TRAVEL_CIS_MIN[i][j] : temps en minutes entre CIS[i] et CIS[j]
  - COMMUNE_NEAREST[k]   : {cisIdx, min} pour chaque commune
"""
import urllib.request, json, time, math, sys

# ═══ 41 CIS (même ordre que dans Index.html) ═══
CIS = [
    {"id":"agly","lat":42.7957,"lng":2.6878},
    {"id":"baixas","lat":42.7546,"lng":2.8103},
    {"id":"canet","lat":42.7066,"lng":3.0130},
    {"id":"caudies","lat":42.8099,"lng":2.3742},
    {"id":"le-barcares","lat":42.7910,"lng":3.0340},
    {"id":"maury","lat":42.8329,"lng":2.5878},
    {"id":"millas","lat":42.6944,"lng":2.6950},
    {"id":"pnord","lat":42.7200,"lng":2.8950},
    {"id":"riberal","lat":42.6980,"lng":2.7650},
    {"id":"rivesaltes","lat":42.7702,"lng":2.8770},
    {"id":"salanque","lat":42.7714,"lng":2.9936},
    {"id":"salses","lat":42.8367,"lng":2.9208},
    {"id":"st-paul-fenouillet","lat":42.8109,"lng":2.5030},
    {"id":"vingrau","lat":42.8591,"lng":2.7382},
    {"id":"capcir","lat":42.5718,"lng":2.0695},
    {"id":"cerdagne","lat":42.4323,"lng":1.9485},
    {"id":"font-romeu","lat":42.5044,"lng":2.0370},
    {"id":"ille-sur-tet","lat":42.6710,"lng":2.6210},
    {"id":"mont-louis","lat":42.5106,"lng":2.1213},
    {"id":"olette","lat":42.5430,"lng":2.2750},
    {"id":"porte","lat":42.5472,"lng":1.8312},
    {"id":"prades","lat":42.6177,"lng":2.4216},
    {"id":"saillagouse","lat":42.4590,"lng":2.0370},
    {"id":"sournia","lat":42.7316,"lng":2.4317},
    {"id":"vernet","lat":42.5458,"lng":2.3870},
    {"id":"vinca","lat":42.6438,"lng":2.5277},
    {"id":"pouest","lat":42.6980,"lng":2.8400},
    {"id":"psud","lat":42.6770,"lng":2.8950},
    {"id":"les-aspres","lat":42.6336,"lng":2.7553},
    {"id":"saint-cyprien","lat":42.6193,"lng":3.0067},
    {"id":"elne","lat":42.5991,"lng":2.9718},
    {"id":"palau","lat":42.5711,"lng":2.9609},
    {"id":"argeles","lat":42.5460,"lng":3.0233},
    {"id":"boulou","lat":42.5230,"lng":2.8334},
    {"id":"ceret","lat":42.4860,"lng":2.7480},
    {"id":"vallespir","lat":42.4581,"lng":2.6313},
    {"id":"st-laurent-cerdans","lat":42.3853,"lng":2.6101},
    {"id":"prats","lat":42.4053,"lng":2.4855},
    {"id":"cote-vermeille","lat":42.5170,"lng":3.1040},
    {"id":"banyuls","lat":42.4830,"lng":3.1290},
    {"id":"cerbere","lat":42.4424,"lng":3.1685},
]

# ═══ 226 COMMUNES ═══
COMMUNES = [
    {"n":"L'Albère","lat":42.4762,"lng":2.897},
    {"n":"Alénya","lat":42.6413,"lng":2.9824},
    {"n":"Amélie-les-Bains-Palalda","lat":42.4508,"lng":2.687},
    {"n":"Les Angles","lat":42.5797,"lng":2.049},
    {"n":"Angoustrine-Villeneuve-des-Escaldes","lat":42.546,"lng":1.9443},
    {"n":"Ansignan","lat":42.7646,"lng":2.5233},
    {"n":"Arboussols","lat":42.6669,"lng":2.4953},
    {"n":"Argelès-sur-Mer","lat":42.53,"lng":3.0234},
    {"n":"Arles-sur-Tech","lat":42.4531,"lng":2.6228},
    {"n":"Ayguatébia-Talau","lat":42.5561,"lng":2.1962},
    {"n":"Bages","lat":42.6075,"lng":2.8893},
    {"n":"Baho","lat":42.7066,"lng":2.8229},
    {"n":"Baillestavy","lat":42.5682,"lng":2.5266},
    {"n":"Baixas","lat":42.744,"lng":2.8079},
    {"n":"Banyuls-dels-Aspres","lat":42.5653,"lng":2.8649},
    {"n":"Banyuls-sur-Mer","lat":42.4602,"lng":3.1014},
    {"n":"Le Barcarès","lat":42.8118,"lng":3.028},
    {"n":"La Bastide","lat":42.5371,"lng":2.5752},
    {"n":"Bélesta","lat":42.7241,"lng":2.6228},
    {"n":"Bolquère","lat":42.5225,"lng":2.0614},
    {"n":"Bompas","lat":42.7271,"lng":2.9426},
    {"n":"Boule-d'Amont","lat":42.5884,"lng":2.5905},
    {"n":"Bouleternère","lat":42.6435,"lng":2.5878},
    {"n":"Le Boulou","lat":42.5267,"lng":2.8328},
    {"n":"Bourg-Madame","lat":42.438,"lng":1.9608},
    {"n":"Brouilla","lat":42.5759,"lng":2.8927},
    {"n":"La Cabanasse","lat":42.501,"lng":2.1056},
    {"n":"Cabestany","lat":42.6804,"lng":2.9507},
    {"n":"Caixas","lat":42.6031,"lng":2.6633},
    {"n":"Calce","lat":42.7477,"lng":2.7545},
    {"n":"Calmeilles","lat":42.5507,"lng":2.6735},
    {"n":"Camélas","lat":42.6404,"lng":2.6911},
    {"n":"Campôme","lat":42.6506,"lng":2.3826},
    {"n":"Campoussy","lat":42.6978,"lng":2.452},
    {"n":"Canaveilles","lat":42.5348,"lng":2.2179},
    {"n":"Canet-en-Roussillon","lat":42.6809,"lng":3.002},
    {"n":"Canohès","lat":42.6514,"lng":2.8294},
    {"n":"Caramany","lat":42.7388,"lng":2.5572},
    {"n":"Casefabre","lat":42.6156,"lng":2.6127},
    {"n":"Cases-de-Pène","lat":42.7931,"lng":2.7771},
    {"n":"Cassagnes","lat":42.7415,"lng":2.626},
    {"n":"Casteil","lat":42.5035,"lng":2.4229},
    {"n":"Castelnou","lat":42.6247,"lng":2.7046},
    {"n":"Catllar","lat":42.6407,"lng":2.4186},
    {"n":"Caudiès-de-Fenouillèdes","lat":42.8213,"lng":2.3781},
    {"n":"Caudiès-de-Conflent","lat":42.5623,"lng":2.1451},
    {"n":"Cerbère","lat":42.4471,"lng":3.1493},
    {"n":"Céret","lat":42.473,"lng":2.7565},
    {"n":"Claira","lat":42.7626,"lng":2.9458},
    {"n":"Clara-Villerach","lat":42.5831,"lng":2.4489},
    {"n":"Codalet","lat":42.6015,"lng":2.4169},
    {"n":"Collioure","lat":42.5087,"lng":3.0744},
    {"n":"Conat","lat":42.6203,"lng":2.3426},
    {"n":"Corbère","lat":42.6515,"lng":2.6614},
    {"n":"Corbère-les-Cabanes","lat":42.66,"lng":2.6837},
    {"n":"Corneilla-de-Conflent","lat":42.5786,"lng":2.382},
    {"n":"Corneilla-la-Rivière","lat":42.7098,"lng":2.7247},
    {"n":"Corneilla-del-Vercol","lat":42.6228,"lng":2.9512},
    {"n":"Corsavy","lat":42.483,"lng":2.541},
    {"n":"Coustouges","lat":42.3602,"lng":2.632},
    {"n":"Dorres","lat":42.5125,"lng":1.9224},
    {"n":"Les Cluses","lat":42.4847,"lng":2.8437},
    {"n":"Égat","lat":42.5008,"lng":2.0195},
    {"n":"Elne","lat":42.6083,"lng":2.978},
    {"n":"Enveitg","lat":42.491,"lng":1.8922},
    {"n":"Err","lat":42.4131,"lng":2.0678},
    {"n":"Escaro","lat":42.5337,"lng":2.319},
    {"n":"Espira-de-l'Agly","lat":42.7987,"lng":2.8231},
    {"n":"Espira-de-Conflent","lat":42.6168,"lng":2.4923},
    {"n":"Estagel","lat":42.7642,"lng":2.7077},
    {"n":"Estavar","lat":42.4764,"lng":2.0121},
    {"n":"Estoher","lat":42.5695,"lng":2.4829},
    {"n":"Eus","lat":42.6552,"lng":2.4478},
    {"n":"Eyne","lat":42.4544,"lng":2.111},
    {"n":"Feilluns","lat":42.7613,"lng":2.4877},
    {"n":"Fenouillet","lat":42.7786,"lng":2.382},
    {"n":"Fillols","lat":42.5587,"lng":2.4257},
    {"n":"Finestret","lat":42.6068,"lng":2.5194},
    {"n":"Fontpédrouse","lat":42.4718,"lng":2.202},
    {"n":"Fontrabiouse","lat":42.6413,"lng":2.0514},
    {"n":"Formiguères","lat":42.6227,"lng":2.0629},
    {"n":"Fosse","lat":42.7842,"lng":2.4335},
    {"n":"Fourques","lat":42.5845,"lng":2.7759},
    {"n":"Fuilla","lat":42.5673,"lng":2.3549},
    {"n":"Glorianes","lat":42.5904,"lng":2.5528},
    {"n":"Ille-sur-Têt","lat":42.6746,"lng":2.6167},
    {"n":"Joch","lat":42.6151,"lng":2.5244},
    {"n":"Jujols","lat":42.5852,"lng":2.2823},
    {"n":"Lamanère","lat":42.3628,"lng":2.5191},
    {"n":"Lansac","lat":42.7685,"lng":2.5651},
    {"n":"Laroque-des-Albères","lat":42.5179,"lng":2.9314},
    {"n":"Latour-Bas-Elne","lat":42.6041,"lng":3.0067},
    {"n":"Latour-de-Carol","lat":42.4746,"lng":1.8736},
    {"n":"Latour-de-France","lat":42.7701,"lng":2.6498},
    {"n":"Lesquerde","lat":42.7927,"lng":2.5381},
    {"n":"La Llagonne","lat":42.5401,"lng":2.083},
    {"n":"Llauro","lat":42.5458,"lng":2.7494},
    {"n":"Llo","lat":42.4358,"lng":2.0895},
    {"n":"Llupia","lat":42.6275,"lng":2.7827},
    {"n":"Mantet","lat":42.4555,"lng":2.2922},
    {"n":"Marquixanes","lat":42.6344,"lng":2.4848},
    {"n":"Los Masos","lat":42.6145,"lng":2.4593},
    {"n":"Matemale","lat":42.5788,"lng":2.1154},
    {"n":"Maureillas-las-Illas","lat":42.4635,"lng":2.7999},
    {"n":"Maury","lat":42.816,"lng":2.6194},
    {"n":"Millas","lat":42.6966,"lng":2.6865},
    {"n":"Molitg-les-Bains","lat":42.6624,"lng":2.3955},
    {"n":"Montalba-le-Château","lat":42.699,"lng":2.5658},
    {"n":"Montauriol","lat":42.5777,"lng":2.725},
    {"n":"Montbolo","lat":42.4924,"lng":2.6265},
    {"n":"Montescot","lat":42.6158,"lng":2.9188},
    {"n":"Montesquieu-des-Albères","lat":42.5206,"lng":2.8685},
    {"n":"Montferrer","lat":42.4415,"lng":2.567},
    {"n":"Mont-Louis","lat":42.5098,"lng":2.1197},
    {"n":"Montner","lat":42.7439,"lng":2.6946},
    {"n":"Mosset","lat":42.6719,"lng":2.2848},
    {"n":"Nahuja","lat":42.4243,"lng":1.9995},
    {"n":"Néfiach","lat":42.696,"lng":2.6566},
    {"n":"Nohèdes","lat":42.6256,"lng":2.2547},
    {"n":"Nyer","lat":42.4957,"lng":2.2764},
    {"n":"Font-Romeu-Odeillo-Via","lat":42.5145,"lng":2.0212},
    {"n":"Olette","lat":42.5938,"lng":2.2449},
    {"n":"Oms","lat":42.5319,"lng":2.7102},
    {"n":"Opoul-Périllos","lat":42.8817,"lng":2.8601},
    {"n":"Oreilla","lat":42.5788,"lng":2.2272},
    {"n":"Ortaffa","lat":42.5855,"lng":2.9191},
    {"n":"Osséja","lat":42.3923,"lng":2.0006},
    {"n":"Palau-de-Cerdagne","lat":42.3864,"lng":1.9818},
    {"n":"Palau-del-Vidre","lat":42.5662,"lng":2.9595},
    {"n":"Passa","lat":42.5674,"lng":2.804},
    {"n":"Perpignan","lat":42.699,"lng":2.9045},
    {"n":"Le Perthus","lat":42.4664,"lng":2.8639},
    {"n":"Peyrestortes","lat":42.7484,"lng":2.8471},
    {"n":"Pézilla-de-Conflent","lat":42.7356,"lng":2.4884},
    {"n":"Pézilla-la-Rivière","lat":42.7089,"lng":2.76},
    {"n":"Pia","lat":42.7506,"lng":2.9172},
    {"n":"Planès","lat":42.4701,"lng":2.1444},
    {"n":"Planèzes","lat":42.7736,"lng":2.6215},
    {"n":"Pollestres","lat":42.6373,"lng":2.8736},
    {"n":"Ponteilla","lat":42.6347,"lng":2.8288},
    {"n":"Porta","lat":42.5212,"lng":1.7935},
    {"n":"Porté-Puymorens","lat":42.5546,"lng":1.8381},
    {"n":"Port-Vendres","lat":42.5034,"lng":3.1048},
    {"n":"Prades","lat":42.6107,"lng":2.4276},
    {"n":"Prats-de-Mollo-la-Preste","lat":42.4174,"lng":2.4229},
    {"n":"Prats-de-Sournia","lat":42.7399,"lng":2.4535},
    {"n":"Prugnanes","lat":42.8254,"lng":2.435},
    {"n":"Prunet-et-Belpuig","lat":42.5655,"lng":2.6373},
    {"n":"Puyvalador","lat":42.6488,"lng":2.1097},
    {"n":"Py","lat":42.4683,"lng":2.3635},
    {"n":"Rabouillet","lat":42.7265,"lng":2.3646},
    {"n":"Railleu","lat":42.5923,"lng":2.1619},
    {"n":"Rasiguères","lat":42.7732,"lng":2.5979},
    {"n":"Réal","lat":42.64,"lng":2.1488},
    {"n":"Reynès","lat":42.466,"lng":2.6971},
    {"n":"Ria-Sirach","lat":42.6101,"lng":2.3828},
    {"n":"Rigarda","lat":42.6292,"lng":2.5375},
    {"n":"Rivesaltes","lat":42.7761,"lng":2.8769},
    {"n":"Rodès","lat":42.6563,"lng":2.5485},
    {"n":"Sahorre","lat":42.5255,"lng":2.3565},
    {"n":"Saillagouse","lat":42.4564,"lng":2.0382},
    {"n":"Saint-André","lat":42.5541,"lng":2.9794},
    {"n":"Saint-Arnac","lat":42.7737,"lng":2.5343},
    {"n":"Sainte-Colombe-de-la-Commanderie","lat":42.6161,"lng":2.7421},
    {"n":"Saint-Cyprien","lat":42.6205,"lng":3.0139},
    {"n":"Saint-Estève","lat":42.7154,"lng":2.8445},
    {"n":"Saint-Féliu-d'Amont","lat":42.6752,"lng":2.7166},
    {"n":"Saint-Féliu-d'Avall","lat":42.6733,"lng":2.7498},
    {"n":"Saint-Génis-des-Fontaines","lat":42.5488,"lng":2.9221},
    {"n":"Saint-Hippolyte","lat":42.8104,"lng":2.9754},
    {"n":"Saint-Jean-Lasseille","lat":42.5863,"lng":2.8646},
    {"n":"Saint-Jean-Pla-de-Corts","lat":42.5183,"lng":2.7938},
    {"n":"Saint-Laurent-de-Cerdans","lat":42.3944,"lng":2.6222},
    {"n":"Saint-Laurent-de-la-Salanque","lat":42.8073,"lng":2.9993},
    {"n":"Sainte-Léocadie","lat":42.4298,"lng":2.0057},
    {"n":"Sainte-Marie-la-Mer","lat":42.7262,"lng":3.0168},
    {"n":"Saint-Marsal","lat":42.5256,"lng":2.6182},
    {"n":"Saint-Martin-de-Fenouillet","lat":42.7848,"lng":2.4777},
    {"n":"Saint-Michel-de-Llotes","lat":42.6465,"lng":2.6268},
    {"n":"Saint-Nazaire","lat":42.6619,"lng":2.9895},
    {"n":"Saint-Paul-de-Fenouillet","lat":42.8229,"lng":2.5025},
    {"n":"Saint-Pierre-dels-Forcats","lat":42.4778,"lng":2.114},
    {"n":"Saleilles","lat":42.6553,"lng":2.947},
    {"n":"Salses-le-Château","lat":42.8359,"lng":2.9134},
    {"n":"Sansa","lat":42.6189,"lng":2.1788},
    {"n":"Sauto","lat":42.5166,"lng":2.1461},
    {"n":"Serdinya","lat":42.5736,"lng":2.324},
    {"n":"Serralongue","lat":42.3846,"lng":2.5559},
    {"n":"Le Soler","lat":42.6756,"lng":2.7999},
    {"n":"Sorède","lat":42.5083,"lng":2.988},
    {"n":"Souanyas","lat":42.5493,"lng":2.2826},
    {"n":"Sournia","lat":42.7138,"lng":2.4171},
    {"n":"Taillet","lat":42.5191,"lng":2.6808},
    {"n":"Tarerach","lat":42.6816,"lng":2.5081},
    {"n":"Targasonne","lat":42.5014,"lng":1.9877},
    {"n":"Taulis","lat":42.5149,"lng":2.6145},
    {"n":"Taurinya","lat":42.555,"lng":2.4408},
    {"n":"Tautavel","lat":42.8163,"lng":2.7161},
    {"n":"Le Tech","lat":42.4439,"lng":2.5154},
    {"n":"Terrats","lat":42.6046,"lng":2.7584},
    {"n":"Théza","lat":42.6403,"lng":2.947},
    {"n":"Thuès-Entre-Valls","lat":42.5006,"lng":2.2317},
    {"n":"Thuir","lat":42.6384,"lng":2.7618},
    {"n":"Tordères","lat":42.5653,"lng":2.7619},
    {"n":"Torreilles","lat":42.7571,"lng":3.0059},
    {"n":"Toulouges","lat":42.6723,"lng":2.8234},
    {"n":"Tresserre","lat":42.5559,"lng":2.842},
    {"n":"Trévillach","lat":42.7091,"lng":2.5105},
    {"n":"Trilla","lat":42.7369,"lng":2.5229},
    {"n":"Trouillas","lat":42.6055,"lng":2.8235},
    {"n":"Ur","lat":42.4594,"lng":1.9382},
    {"n":"Urbanya","lat":42.6429,"lng":2.2964},
    {"n":"Valcebollère","lat":42.382,"lng":2.0472},
    {"n":"Valmanya","lat":42.5251,"lng":2.5089},
    {"n":"Vernet-les-Bains","lat":42.5363,"lng":2.4152},
    {"n":"Villefranche-de-Conflent","lat":42.5955,"lng":2.3575},
    {"n":"Villelongue-de-la-Salanque","lat":42.7261,"lng":2.977},
    {"n":"Villelongue-dels-Monts","lat":42.5238,"lng":2.8979},
    {"n":"Villemolaque","lat":42.5976,"lng":2.848},
    {"n":"Villeneuve-de-la-Raho","lat":42.6402,"lng":2.909},
    {"n":"Villeneuve-la-Rivière","lat":42.7046,"lng":2.7964},
    {"n":"Vinça","lat":42.6431,"lng":2.5225},
    {"n":"Vingrau","lat":42.8588,"lng":2.7904},
    {"n":"Vira","lat":42.7653,"lng":2.3899},
    {"n":"Vivès","lat":42.5303,"lng":2.766},
    {"n":"Le Vivier","lat":42.7637,"lng":2.4423},
]

OSRM_BASE = "https://router.project-osrm.org"

def osrm_table(coords, sources=None, destinations=None, retries=3):
    """Appel OSRM Table API. coords = [(lng,lat), ...]. Retourne matrice durations en secondes."""
    coord_str = ";".join(f"{lng},{lat}" for lng, lat in coords)
    url = f"{OSRM_BASE}/table/v1/driving/{coord_str}?annotations=duration"
    if sources is not None:
        url += "&sources=" + ";".join(str(s) for s in sources)
    if destinations is not None:
        url += "&destinations=" + ";".join(str(d) for d in destinations)
    
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "SDIS66-patatoide/1.0"})
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode())
            if data.get("code") == "Ok":
                return data["durations"]
            print(f"  WARN: OSRM code: {data.get('code')}, tentative {attempt+1}/{retries}", file=sys.stderr)
        except Exception as e:
            print(f"  WARN: Erreur OSRM (tentative {attempt+1}/{retries}): {e}", file=sys.stderr)
        if attempt < retries - 1:
            wait = 5 * (attempt + 1)
            print(f"    Attente {wait}s avant retry...", file=sys.stderr)
            time.sleep(wait)
    return None

def main():
    print("=== Construction des matrices de temps de trajet OSRM ===")
    
    # 1) Matrice CIS <-> CIS (41x41)
    print(f"\n1) Matrice CIS<->CIS ({len(CIS)}x{len(CIS)})...")
    cis_coords = [(c["lng"], c["lat"]) for c in CIS]
    
    cis_matrix = osrm_table(cis_coords)
    if cis_matrix is None:
        print("ERREUR: Impossible d'obtenir la matrice CIS↔CIS", file=sys.stderr)
        sys.exit(1)
    
    # Convertir en minutes (arrondi 1 décimale)
    cis_min = []
    for row in cis_matrix:
        cis_min.append([round(v / 60, 1) if v is not None else 999 for v in row])
    
    print("  OK: Matrice CIS obtenue")
    # Afficher quelques exemples
    for i in range(min(3, len(CIS))):
        for j in range(min(3, len(CIS))):
            if i != j:
                print(f"    {CIS[i]['id']} -> {CIS[j]['id']}: {cis_min[i][j]} min")
    
    # 2) Matrice COMMUNES -> CIS (226x41)
    print(f"\n2) Matrice Communes->CIS ({len(COMMUNES)}x{len(CIS)})...")
    
    BATCH_SIZE = 30
    commune_min = []  # 226 lignes × 41 colonnes
    
    for batch_start in range(0, len(COMMUNES), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(COMMUNES))
        batch_communes = COMMUNES[batch_start:batch_end]
        n_comm = len(batch_communes)
        
        # Coordonnées : d'abord les communes du batch, puis tous les CIS
        coords = [(c["lng"], c["lat"]) for c in batch_communes]
        coords += cis_coords
        
        sources = list(range(n_comm))
        destinations = list(range(n_comm, n_comm + len(CIS)))
        
        print(f"  Batch {batch_start//BATCH_SIZE + 1}/{math.ceil(len(COMMUNES)/BATCH_SIZE)}: "
              f"communes {batch_start}-{batch_end-1} ({n_comm} sources, {len(CIS)} destinations)...")
        
        durations = osrm_table(coords, sources=sources, destinations=destinations)
        if durations is None:
            print(f"  WARN: Batch echoue, on utilise le fallback Haversine", file=sys.stderr)
            # Fallback: Haversine × 1.2 / 65
            for ci, comm in enumerate(batch_communes):
                row = []
                for cis in CIS:
                    km = haversine(comm["lat"], comm["lng"], cis["lat"], cis["lng"])
                    row.append(round(km * 1.2 / 65 * 60, 1))
                commune_min.append(row)
        else:
            for row in durations:
                commune_min.append([round(v / 60, 1) if v is not None else 999 for v in row])
        
        # Respecter le rate limit du serveur public
        if batch_end < len(COMMUNES):
            print("    Pause 2s...")
            time.sleep(2)
    
    print(f"  OK: Matrice Communes obtenue ({len(commune_min)} lignes)")
    
    # 3) Calculer le CIS le plus proche pour chaque commune
    print("\n3) Calcul du CIS le plus proche par commune...")
    commune_nearest = []
    for i, row in enumerate(commune_min):
        best_idx = 0
        best_val = row[0]
        for j in range(1, len(row)):
            if row[j] < best_val:
                best_val = row[j]
                best_idx = j
        commune_nearest.append({"cisIdx": best_idx, "min": best_val})
    
    # 4) Generer le JS
    print("\n4) Génération du fichier JS...")
    
    lines = []
    lines.append("/* === MATRICES TEMPS DE TRAJET OSRM (generees automatiquement) === */")
    lines.append("/* CIS-to-CIS : TRAVEL_CIS_MIN[i][j] = minutes de trajet route réelle */")
    lines.append("var TRAVEL_CIS_MIN=[")
    for i, row in enumerate(cis_min):
        lines.append("[" + ",".join(str(v) for v in row) + "]" + ("," if i < len(cis_min)-1 else ""))
    lines.append("];")
    lines.append("")
    lines.append("/* Commune-to-CIS : TRAVEL_COMM_MIN[k][j] = minutes de la commune k au CIS j */")
    lines.append("var TRAVEL_COMM_MIN=[")
    for i, row in enumerate(commune_min):
        lines.append("[" + ",".join(str(v) for v in row) + "]" + ("," if i < len(commune_min)-1 else ""))
    lines.append("];")
    lines.append("")
    lines.append("/* CIS le plus proche par commune (index dans CIS[], temps en minutes) */")
    lines.append("var COMMUNE_NEAREST=[")
    batch = []
    for cn in commune_nearest:
        batch.append(f"{{c:{cn['cisIdx']},m:{cn['min']}}}")
    # Group par lignes de 10
    for i in range(0, len(batch), 10):
        chunk = ",".join(batch[i:i+10])
        lines.append(chunk + ("," if i+10 < len(batch) else ""))
    lines.append("];")
    
    output = "\n".join(lines)
    
    with open("osrm_travel_data.js", "w", encoding="utf-8") as f:
        f.write(output)
    
    print(f"\nOK: Fichier osrm_travel_data.js genere ({len(output)} caracteres)")
    print(f"   CIS matrix: {len(cis_min)}×{len(cis_min[0])}")
    print(f"   Commune matrix: {len(commune_min)}×{len(commune_min[0])}")
    print(f"   Commune nearest: {len(commune_nearest)} entrées")
    
    # Stats rapides
    print("\n=== Quelques statistiques ===")
    all_cis_times = [cis_min[i][j] for i in range(len(cis_min)) for j in range(len(cis_min)) if i != j]
    print(f"  Temps CIS<->CIS: min={min(all_cis_times)}, max={max(all_cis_times)}, "
          f"moy={round(sum(all_cis_times)/len(all_cis_times),1)} min")
    
    comm_times = [cn["min"] for cn in commune_nearest]
    print(f"  Temps commune->CIS le + proche: min={min(comm_times)}, max={max(comm_times)}, "
          f"moy={round(sum(comm_times)/len(comm_times),1)} min")

def haversine(lat1, lng1, lat2, lng2):
    """Distance Haversine en km (fallback)."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

if __name__ == "__main__":
    main()
