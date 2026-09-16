import { FieldSample } from '../types';

// Procedurally generated high-fidelity agricultural visual representations (SVG Data URIs)
// for field testing in Cross River State conditions.

const createSvgDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
};

// 1. Cassava Mosaic Disease (Chlorotic mottled twisted leaf)
const cassavaCmdSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#1e2c1e"/>
  <!-- Soil / farm background -->
  <circle cx="200" cy="150" r="160" fill="#2b3d26"/>
  <!-- Cassava petiole -->
  <path d="M200,280 Q205,200 200,150" stroke="#b45309" stroke-width="6" fill="none" stroke-linecap="round"/>
  <!-- Five palmate lobes of cassava leaf -->
  <!-- Center lobe: twisted, chlorotic yellow and green mottling -->
  <path d="M200,150 C180,100 175,50 195,15 C205,50 215,90 200,150" fill="#84cc16"/>
  <path d="M190,80 C180,60 178,40 195,20 C198,40 192,70 190,80" fill="#facc15" opacity="0.85"/>
  <path d="M197,110 C188,95 185,85 198,75 C202,90 200,105 197,110" fill="#eab308" opacity="0.9"/>
  <!-- Left upper lobe: distorted, curled -->
  <path d="M200,150 C150,130 100,100 65,80 C100,115 150,145 200,150" fill="#65a30d"/>
  <path d="M120,115 C95,100 80,90 70,82 C90,102 110,112 120,115" fill="#fde047" opacity="0.8"/>
  <path d="M150,130 Q120,115 135,110" stroke="#ca8a04" stroke-width="4" fill="none"/>
  <!-- Right upper lobe: wrinkled with yellow mosaic patches -->
  <path d="M200,150 C250,130 300,100 335,80 C300,115 250,145 200,150" fill="#4d7c0f"/>
  <path d="M260,120 C290,105 315,90 330,83 C310,105 280,120 260,120" fill="#fde047" opacity="0.85"/>
  <!-- Left lower lobe: stunted -->
  <path d="M200,150 C150,170 110,180 80,195 C115,185 160,170 200,150" fill="#84cc16"/>
  <path d="M130,175 C105,185 95,190 85,193 C105,185 125,180 130,175" fill="#fde047" opacity="0.9"/>
  <!-- Right lower lobe -->
  <path d="M200,150 C250,170 290,180 320,195 C285,185 240,170 200,150" fill="#65a30d"/>
  <path d="M255,172 C275,180 295,188 310,192 C290,185 270,178 255,172" fill="#eab308" opacity="0.85"/>
  <!-- Veins and necrotic curling -->
  <line x1="200" y1="150" x2="195" y2="25" stroke="#fef08a" stroke-width="2"/>
  <line x1="200" y1="150" x2="70" y2="83" stroke="#fef08a" stroke-width="2"/>
  <line x1="200" y1="150" x2="330" y2="83" stroke="#fef08a" stroke-width="2"/>
  <text x="20" y="35" fill="#fef08a" font-family="sans-serif" font-weight="bold" font-size="14">CASSAVA MOSAIC (CMD) - IKOM</text>
</svg>`);

// 2. Cocoa Black Pod (Phytophthora megakarya)
const cocoaBlackPodSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#1a140f"/>
  <!-- Cocoa trunk bark -->
  <path d="M70,0 L80,300 L30,300 L20,0 Z" fill="#382212"/>
  <path d="M75,120 Q120,125 150,135" stroke="#452a16" stroke-width="12" fill="none" stroke-linecap="round"/>
  <!-- Cocoa Pod body (elongated oval with grooves) -->
  <ellipse cx="230" cy="160" rx="75" ry="110" fill="#c2410c" transform="rotate(-15 230 160)"/>
  <!-- Pod ridges -->
  <path d="M230,55 Q205,155 215,260" stroke="#9a3412" stroke-width="4" fill="none"/>
  <path d="M230,55 Q245,155 240,260" stroke="#9a3412" stroke-width="4" fill="none"/>
  <!-- Black pod rot lesion spreading rapidly from tip and base -->
  <path d="M190,130 C190,180 210,245 220,265 C240,265 270,240 275,190 C260,165 240,150 215,135 Z" fill="#18181b"/>
  <!-- White fuzzy sporangia fungal bloom on the edge of the black lesion -->
  <path d="M195,140 Q215,150 240,160 Q265,175 273,190" stroke="#e4e4e7" stroke-dasharray="3,3" stroke-width="4" fill="none"/>
  <circle cx="215" cy="180" r="12" fill="#27272a"/>
  <circle cx="235" cy="205" r="18" fill="#09090b"/>
  <text x="20" y="35" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="14">COCOA BLACK POD - ETUNG / BOKI</text>
</svg>`);

// 3. Maize Fall Armyworm damage
const maizeArmywormSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#132314"/>
  <!-- Maize stalk -->
  <rect x="185" y="140" width="30" height="160" fill="#4d7c0f"/>
  <!-- Maize leaves arching -->
  <path d="M185,180 C110,160 50,190 20,240 C60,200 130,190 185,200" fill="#65a30d"/>
  <path d="M215,180 C290,160 350,190 380,240 C340,200 270,190 215,200" fill="#65a30d"/>
  <!-- Central whorl leaves -->
  <path d="M190,140 C170,80 150,40 120,20 C160,50 185,90 195,140" fill="#4d7c0f"/>
  <path d="M210,140 C230,80 250,40 280,20 C240,50 215,90 205,140" fill="#4d7c0f"/>
  <!-- Ragged, chewed windowpane feeding holes from Fall Armyworm -->
  <ellipse cx="160" cy="65" rx="14" ry="8" fill="#132314"/>
  <ellipse cx="175" cy="100" rx="10" ry="16" fill="#132314"/>
  <ellipse cx="230" cy="70" rx="16" ry="10" fill="#132314"/>
  <ellipse cx="218" cy="115" rx="12" ry="14" fill="#132314"/>
  <!-- Yellowed necrotic edges around feeding holes -->
  <path d="M148,60 Q160,75 173,65" stroke="#eab308" stroke-width="2" fill="none"/>
  <path d="M218,65 Q232,80 245,68" stroke="#eab308" stroke-width="2" fill="none"/>
  <!-- Granular yellowish-brown frass (caterpillar droppings) in whorl -->
  <circle cx="198" cy="125" r="3" fill="#854d0e"/>
  <circle cx="204" cy="122" r="2.5" fill="#a16207"/>
  <circle cx="195" cy="130" r="3.5" fill="#713f12"/>
  <circle cx="202" cy="133" r="2" fill="#854d0e"/>
  <text x="20" y="35" fill="#fde047" font-family="sans-serif" font-weight="bold" font-size="14">MAIZE FALL ARMYWORM - OGOJA</text>
</svg>`);

// 4. Plantain Black Sigatoka
const plantainSigatokaSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#0f1c10"/>
  <!-- Broad plantain leaf blade with central midrib -->
  <path d="M20,290 C50,150 120,40 380,20 C340,160 250,260 20,290 Z" fill="#3f6212"/>
  <path d="M20,290 C120,180 230,100 380,20" stroke="#84cc16" stroke-width="8" fill="none"/>
  <!-- Characteristic reddish-brown to black elongated streaks parallel to veins -->
  <!-- Early streaks with yellow halo -->
  <path d="M150,160 L180,185" stroke="#facc15" stroke-width="9" stroke-linecap="round"/>
  <path d="M150,160 L180,185" stroke="#78350f" stroke-width="5" stroke-linecap="round"/>
  <!-- Advanced necrotic black lesions merging into large dead patches -->
  <path d="M220,110 L270,145" stroke="#facc15" stroke-width="12" stroke-linecap="round"/>
  <path d="M220,110 L270,145" stroke="#1c1917" stroke-width="8" stroke-linecap="round"/>
  <path d="M110,210 L155,245" stroke="#1c1917" stroke-width="7" stroke-linecap="round"/>
  <path d="M270,70 L320,100" stroke="#1c1917" stroke-width="10" stroke-linecap="round"/>
  <!-- Dried tip necrosis -->
  <path d="M340,30 C360,22 375,20 380,20 C360,55 330,80 320,60 Z" fill="#451a03"/>
  <text x="20" y="35" fill="#fed7aa" font-family="sans-serif" font-weight="bold" font-size="14">PLANTAIN BLACK SIGATOKA - BIASE</text>
</svg>`);

// 5. Oil Palm Magnesium Deficiency (Orange Frond Spotting)
const oilPalmDeficiencySvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#142116"/>
  <!-- Central rachis (thick stem) -->
  <path d="M30,270 Q160,180 380,110" stroke="#a16207" stroke-width="9" fill="none" stroke-linecap="round"/>
  <!-- Leaflets exposed to sun: intense bright orange-yellow chlorosis while base remains green -->
  <!-- Top leaflets -->
  <path d="M100,210 L130,110" stroke="#ea580c" stroke-width="7" stroke-linecap="round"/>
  <path d="M100,210 L108,180" stroke="#4d7c0f" stroke-width="7" stroke-linecap="round"/>
  <path d="M150,180 L200,90" stroke="#f97316" stroke-width="7" stroke-linecap="round"/>
  <path d="M150,180 L162,155" stroke="#4d7c0f" stroke-width="7" stroke-linecap="round"/>
  <path d="M210,155 L280,75" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
  <path d="M210,155 L225,135" stroke="#4d7c0f" stroke-width="7" stroke-linecap="round"/>
  <path d="M280,135 L360,65" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <!-- Bottom leaflets -->
  <path d="M110,225 L160,285" stroke="#ea580c" stroke-width="7" stroke-linecap="round"/>
  <path d="M170,195 L240,265" stroke="#f97316" stroke-width="7" stroke-linecap="round"/>
  <path d="M230,170 L320,240" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/>
  <path d="M300,145 L380,210" stroke="#fbbf24" stroke-width="6" stroke-linecap="round"/>
  <!-- Severe necrotic spotting / tipping -->
  <circle cx="130" cy="110" r="4" fill="#7c2d12"/>
  <circle cx="200" cy="90" r="4" fill="#7c2d12"/>
  <circle cx="280" cy="75" r="4" fill="#7c2d12"/>
  <text x="20" y="35" fill="#fed7aa" font-family="sans-serif" font-weight="bold" font-size="14">OIL PALM ORANGE FROND - AKAMKPA</text>
</svg>`);

// 6. Yam Anthracnose / Vine Blight
const yamAnthracnoseSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#241b14"/>
  <!-- Yam bamboo stake -->
  <rect x="230" y="0" width="14" height="300" fill="#78350f"/>
  <!-- Twining yam vine -->
  <path d="M210,290 Q240,240 235,190 Q225,140 240,90 Q235,40 238,10" stroke="#4d7c0f" stroke-width="5" fill="none"/>
  <!-- Yam heart-shaped leaf 1 (affected) -->
  <path d="M190,130 C150,90 90,110 90,150 C90,190 140,220 190,240 C240,220 290,190 290,150 C290,110 230,90 190,130 Z" fill="#65a30d"/>
  <!-- Anthracnose black pinhead spots with bright yellow chlorotic halos -->
  <circle cx="150" cy="160" r="14" fill="#fde047"/>
  <circle cx="150" cy="160" r="8" fill="#1c1917"/>
  <circle cx="220" cy="155" r="16" fill="#fde047"/>
  <circle cx="220" cy="155" r="10" fill="#1c1917"/>
  <circle cx="185" cy="190" r="18" fill="#fde047"/>
  <circle cx="185" cy="190" r="11" fill="#1c1917"/>
  <circle cx="130" cy="190" r="10" fill="#fde047"/>
  <circle cx="130" cy="190" r="5" fill="#1c1917"/>
  <!-- Black necrotic tip causing 'scorch' appearance -->
  <path d="M175,225 Q190,240 205,225 Z" fill="#1c1917"/>
  <text x="20" y="35" fill="#fde047" font-family="sans-serif" font-weight="bold" font-size="14">YAM ANTHRACNOSE - YALA / OGOJA</text>
</svg>`);

// 7. Non-plant image (Testing verification rule #1)
const farmWrenchToolsSvg = createSvgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <rect width="400" height="300" fill="#18181b"/>
  <!-- Metal workshop bench -->
  <rect x="0" y="240" width="400" height="60" fill="#27272a"/>
  <!-- Steel spanner / wrench -->
  <rect x="80" y="140" width="220" height="24" rx="4" fill="#94a3b8"/>
  <circle cx="80" cy="152" r="30" fill="#94a3b8"/>
  <rect x="55" y="142" width="30" height="20" fill="#18181b"/>
  <circle cx="300" cy="152" r="28" fill="#94a3b8"/>
  <rect x="295" y="142" width="25" height="20" fill="#18181b"/>
  <!-- Screws & bolts -->
  <circle cx="150" cy="210" r="12" fill="#cbd5e1"/>
  <circle cx="210" cy="220" r="10" fill="#64748b"/>
  <text x="20" y="35" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="14">TEST: HARDWARE TOOL (NON-PLANT)</text>
</svg>`);

export const FIELD_SAMPLES: FieldSample[] = [
  {
    id: 'cassava-cmd',
    title: 'Cassava Mosaic Disease (CMD)',
    crop: 'Cassava',
    localZone: 'Ikom & Obubra Belt',
    category: 'Disease',
    thumbnailUrl: cassavaCmdSvg,
    description:
      'Stunted leaf development with severe chlorotic yellow mottling and distorted blade curling on young stems.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Cassava (Manihot esculenta)',
      health_status: 'Diseased',
      pathology_name: 'Cassava Mosaic Begomovirus (CMD)',
      confidence_score: 0.96,
      severity_level: 'Moderate',
      observable_symptoms: [
        'Characteristic yellow-green mosaic chlorosis on leaf lobes',
        'Distortion and asymmetrical twisting of leaf margins',
        'Stunting of newly formed petioles and reduced leaf area',
      ],
      immediate_containment_step:
        'Rogue out (uproot) severely twisted young stands immediately; bury or burn them away from the field to stop whiteflies from spreading virus.',
      organic_local_remedy:
        'Spray water steeped with bitter neem leaves (Dongoyaro) mixed with grated local black soap weekly to drive away whiteflies (Bemisia tabaci). Intercrop with maize or pigeon pea to break whitefly flight corridors.',
      standard_chemical_treatment:
        'Target vector whiteflies using systemic insecticides like Lambda-cyhalothrin (Karate 5EC or Lamdex) or Imidacloprid (Confidor) at 30-40ml per 15L knapsack. Wear rubber boots, gloves, and face shield when spraying.',
      prevention_future:
        'Only plant certified virus-free stem cuttings from IITA or National Root Crops Research Institute (NRCRI) resistant clones such as TME 419, TMS 98/0505, or Game-Changer varieties.',
      action_plan_0_2_hours:
        'Uproot (rogue out) severely twisted or yellowed cassava stands immediately; transport them in sacks out of the field to prevent whiteflies from carrying viral sap to adjacent rows.',
      action_plan_2_6_hours:
        'Prepare Dongoyaro (neem) botanical extract: pound fresh leaves or seeds, soak in water with grated local black soap as a natural vector deterrent spray.',
      action_plan_6_24_hours:
        'Survey entire field for whitefly presence on leaf undersides at dusk. Apply neem deterrent spray or selective vector spray on boundary buffer rows.',
      avoid: [
        'Do NOT cut stems from symptomatic plants for next season propagation.',
        'Do NOT leave rogued cassava foliage beside drainage furrows where vectors congregate.',
        'Do NOT apply excessive high-nitrogen fertilizer which accelerates succulent vegetative growth favored by whiteflies.',
      ],
      escalation:
        'Contact Cross River Agricultural Development Programme (CRADP) or IITA extension agents if over 20% of stands in your block show severe twisting.',
      local_context_used: 'Central Cocoa & Cassava Belt (Ikom / Obubra)',
      pidgin_audio_script:
        'Farmer well done o! Wetin dey worry your cassava so na Cassava Mosaic sickness. Dis sickness dey come from tiny whitefly insects wey dey carry bad water enter di plant, na why di leaves dey turn yellow, dey twist like rope. First thing wey you go do now now: uproot any stand wey don spoil pass, go burn am or bury am far from farm so e no go touch others. If you no wan spend money buy chemical, squeeze plenty Dongoyaro neem leaf for inside water, put small black soap, spray di leaves make di whitefly run comot. Next planting season, no take cutting from sick farm; go carry clean resistant bundle like TME 419 from IITA or agric extension officers. Your farm go dey fine!',
    },
  },
  {
    id: 'cocoa-black-pod',
    title: 'Cocoa Black Pod Rot',
    crop: 'Cocoa',
    localZone: 'Etung & Boki Cocoa Belt',
    category: 'Disease',
    thumbnailUrl: cocoaBlackPodSvg,
    description:
      'Dark brown to pitch-black necrotic spreading lesion on developing cocoa pod with white sporulation.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Cocoa (Theobroma cacao)',
      health_status: 'Diseased',
      pathology_name: 'Cocoa Black Pod (Phytophthora megakarya)',
      confidence_score: 0.98,
      severity_level: 'Critical',
      observable_symptoms: [
        'Rapidly expanding dark brown to pitch-black rot across pod surface',
        'Characteristic white velvety fungal sporangia ring along rot margin',
        'Internal bean pulp decay and mummification of pod',
      ],
      immediate_containment_step:
        'Pluck all infected pods with a sanitized pruning hook immediately, remove them completely from the plantation, and bury them at least 50cm underground with wood ash.',
      organic_local_remedy:
        'Prune dense canopy and chupons (water shoots) to allow sunlight and breeze to dry the humidity. Coat cut surfaces with fresh wood ash and clay paste. Maintain clean weed-free ground around tree base.',
      standard_chemical_treatment:
        'Foliar and pod spray of systemic plus contact copper fungicide such as Ridomil Gold (Metalaxyl-M + Mancozeb) or Nordox 75WG / Kocide 2000 (Copper Hydroxide) at 50g per 15L knapsack every 14-21 days during heavy rains. Always wear safety gear.',
      prevention_future:
        'Adopt regular 2-week sanitation harvesting throughout rainy season. Maintain 3m x 3m planting spacing and plant Phytophthora-tolerant CRIN hybrid materials.',
      action_plan_0_2_hours:
        'Using a disinfected harvesting hook, pluck all blackened and infected cocoa pods immediately to halt Phytophthora sporangia spore release.',
      action_plan_2_6_hours:
        'Carry infected pods away from the plantation; dig a sanitary trench at least 50cm deep, deposit pods, and cover with fresh domestic wood ash before burying.',
      action_plan_6_24_hours:
        'Prune low-hanging chupons (water shoots) to open tree canopy for airflow and sunlight penetration. In early morning, apply preventative copper spray (Ridomil Gold / Nordox) to healthy developing pods.',
      avoid: [
        'Do NOT leave plucked diseased pods on the plantation floor or near irrigation ditches.',
        'Do NOT prune trees with unsterilized tools after cutting infected pods; dip blade in wood ash or bleach water.',
        'Do NOT spray chemical fungicides during torrential downpours when runoff wastes inputs.',
      ],
      escalation:
        'Alert the local Cocoa Farmers Association or extension officer if black pod spreads to more than 15 trees within a 48-hour rainy spell.',
      local_context_used: 'Etung & Boki Rainforest Cocoa Belt',
      pidgin_audio_script:
        'Agric people well done! Dis black mark wey dey eat your cocoa pod na Black Pod sickness, Phytophthora megakarya, and e dey spread like wild fire for rainy season for Cross River. As I dey talk to you now, take your pruning hook pluck all dem black pods sharp-sharp! Carry dem comot from farm go dig hole bury dem with wood ash. Open di cocoa tree canopy so breeze and sun fit enter, because cold and wet place na wetin di sickness like. Enter agro-store for Ikom or your junction, buy Ridomil Gold or Nordox copper spray, mix am according to measurement spray di pods. Protect your hands and eyes with mask and gloves. If you do this one, your harvest go full bags!',
    },
  },
  {
    id: 'maize-armyworm',
    title: 'Maize Fall Armyworm',
    crop: 'Maize',
    localZone: 'Ogoja & Yala Savanna',
    category: 'Pest',
    thumbnailUrl: maizeArmywormSvg,
    description:
      'Chewed ragged holes in maize whorl with wet yellowish frass deposits and stunted tassel development.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Maize (Zea mays)',
      health_status: 'Pest Infested',
      pathology_name: 'Fall Armyworm (Spodoptera frugiperda)',
      confidence_score: 0.95,
      severity_level: 'Critical',
      observable_symptoms: [
        'Extensive windowpane feeding holes in newly unfurling whorl leaves',
        'Coarse, yellowish-brown sawdust-like frass accumulated inside whorl',
        'Chewed terminal buds preventing normal stalk elongation',
      ],
      immediate_containment_step:
        'Manually crush visible caterpillars in the whorl early in the morning, and drop fine dry sand mixed with wood ash directly into the funnel.',
      organic_local_remedy:
        'Mix 2 handfuls of sieved dry wood ash with 1 handful of dry sand and a pinch of ground hot pepper (atarodo); pour half a teaspoon into each maize whorl to suffocate and irritate young larvae. Botanical spray of crushed neem seed extract also works effectively.',
      standard_chemical_treatment:
        'Apply Ampligo 150 ZC (Chlorantraniliprole + Lambda-cyhalothrin) at 10-15ml per 15L sprayer, or Emamectin Benzoate 5% SG (Proclaim) directly aimed into the whorl nozzle at dusk when caterpillars come out to feed.',
      prevention_future:
        'Early planting with first steady rains in April/May to escape peak moth populations. Intercrop with Desmodium or Mucuna (push-pull strategy) and plant high-yielding hybrid seeds like Oba Super 1 or 2.',
      action_plan_0_2_hours:
        'Walk rows early in the morning and manually crush large caterpillars visible in the maize funnel/whorl before they burrow deeper into the growing point.',
      action_plan_2_6_hours:
        'Collect 2 parts sieved dry hearth wood ash, 1 part fine sand, and a pinch of ground hot pepper (atarodo). Mix thoroughly in a bucket.',
      action_plan_6_24_hours:
        'Drop half a teaspoon of the wood ash/sand mixture directly into each maize whorl to desiccate and irritate larvae, or apply evening spray of Ampligo / Emamectin Benzoate at dusk when caterpillars feed actively.',
      avoid: [
        'Do NOT spray insecticides at midday under direct sunlight when caterpillars hide deep inside the whorl.',
        'Do NOT apply uncalibrated pesticide overdoses which kill beneficial predatory ants and earwigs.',
        'Do NOT ignore nearby border grasses where armyworm moths lay alternate egg batches.',
      ],
      escalation:
        'Seek immediate agrochemical input advice if whorl damage exceeds 20-30% of plants prior to tassel emergence.',
      local_context_used: 'Ogoja & Yala Savanna Grain Belt',
      pidgin_audio_script:
        'Farmer greetings o! Dis caterpillar wey dey chop your corn heart na Fall Armyworm, the wicked worm wey dey bite holes for whorl leave brown sawdust inside. If you no quick stop am, e go chop di whole farm before corn bring tassel. Today today, early morning, carry dry wood ash mix with fine sand and small dry pepper, drop half spoon straight inside every corn whorl. The ash and sand go choke the caterpillar die. If plenty worms still dey, buy Ampligo or Emamectin Benzoate chemical, spray am for evening time when the worms come outside chop. Make sure you cover your nose and mouth well when you dey spray. You go conquer am!',
    },
  },
  {
    id: 'plantain-sigatoka',
    title: 'Plantain Black Sigatoka',
    crop: 'Plantain',
    localZone: 'Akamkpa & Biase Plantations',
    category: 'Disease',
    thumbnailUrl: plantainSigatokaSvg,
    description:
      'Long reddish-brown to black streaks parallel to leaf veins merging into large necrotic scorched zones.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Plantain / Banana (Musa paradisiaca)',
      health_status: 'Diseased',
      pathology_name: 'Black Sigatoka (Pseudocercospora fijiensis)',
      confidence_score: 0.94,
      severity_level: 'Moderate',
      observable_symptoms: [
        'Dark reddish-brown to black elongated lesions parallel to lateral veins',
        'Yellow chlorotic halos surrounding necrotic leaf streaks',
        'Premature death and collapse of lower leaves, causing small bunches',
      ],
      immediate_containment_step:
        'De-leaf (prune off) severely spotted lower leaves using a clean cutlass, lay them face down on soil and cover with dried banana mulch or compost.',
      organic_local_remedy:
        'Strict de-leafing hygiene every 10 days. Apply wood ash around root zones to boost potassium and strengthen plant cell walls. Ensure high spacing (3m x 2m) to improve air circulation.',
      standard_chemical_treatment:
        'Foliar spray with systemic fungicides such as Propiconazole (Tilt 250 EC) or Mancozeb 80WP mixed with mineral oil or surfactant to help stick to waxy plantain leaves during heavy downpours.',
      prevention_future:
        'Mulch heavily with organic manure to boost plant vigor; introduce Sigatoka-resistant plantain hybrids developed by IITA (such as PITA 14, PITA 17, or BITA 3).',
      action_plan_0_2_hours:
        'De-leaf (prune off) severely spotted lower leaves displaying black necrotic streaks using a clean, sharp cutlass.',
      action_plan_2_6_hours:
        'Place pruned infected leaves upside down (abaxial face to soil) under pseudostems and cover with dry grass mulch to prevent airborne ascospore ejection.',
      action_plan_6_24_hours:
        'Clear encroaching weeds within 2 meters of pseudostem bases and spread wood ash around roots to deliver potassium. Schedule early morning fungicide spray if rain is forecast.',
      avoid: [
        'Do NOT leave pruned diseased leaves standing upright or elevated where breeze catches spores.',
        'Do NOT plant suckers at overly dense spacing (< 2.5m x 2.5m) in humid plantation bottoms.',
        'Do NOT cut healthy green upper functional leaves needed for bunch filling.',
      ],
      escalation:
        'Consult ADP extension specialists if younger leaves (< leaf 4 from the top) collapse before flowering.',
      local_context_used: 'Akamkpa & Biase Plantations (Southern Agro-Zone)',
      pidgin_audio_script:
        'My plantain farmer, well done! Wetin dey spoil your plantain leaves so na Black Sigatoka fungus. E dey start like tiny brown line, come turn black like fire burn di leaf, make plantain bunch small and ripen before time. Wetin you go do right away: take sharp cutlass cut all dem dry black leaves comot, turn di back face ground make breeze no carry di sickness blow go up. Put plenty animal dung or compost and wood ash round the plantain root make e get power. Spray am with Tilt or Mancozeb if rain dey too heavy. Your plantain fingers go fat well well!',
    },
  },
  {
    id: 'oil-palm-orange-frond',
    title: 'Oil Palm Orange Frond (Mg Deficiency)',
    crop: 'Oil Palm',
    localZone: 'Calabar & Akamkpa Palm Estates',
    category: 'Deficiency',
    thumbnailUrl: oilPalmDeficiencySvg,
    description:
      'Lower fronds exhibit striking bright orange-yellow discoloration on sun-exposed leaflets while leaflet bases stay green.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Oil Palm (Elaeis guineensis)',
      health_status: 'Nutrient Deficient',
      pathology_name: 'Magnesium (Mg) Deficiency / Orange Frond Spotting',
      confidence_score: 0.92,
      severity_level: 'Moderate',
      observable_symptoms: [
        'Vivid bright orange-yellow chlorosis on older, lower fronds exposed to sunlight',
        'Leaflet bases shaded from direct sunlight retain dark green color',
        'Progressive necrotic tip scorch on severely chlorotic older leaflets',
      ],
      immediate_containment_step:
        'Do not prune off orange fronds prematurely as the palm still extracts nutrients; apply quick-acting magnesium fertilizer around the weeded weed-circle (ring weeded area).',
      organic_local_remedy:
        'Spread well-rotted empty fruit bunches (EFB), oil mill decanter cake, or palm kernel cake around the palm ring (1.5 to 2 meters from trunk) to restore organic minerals and moisture.',
      standard_chemical_treatment:
        'Broadcast Kieserite (Magnesium Sulfate - MgSO4) at 1.0 to 1.5 kg per mature palm or Dolomite limestone (if soil is very acidic) in a ring around the drip line before onset of heavy rains.',
      prevention_future:
        'Balance Potassium (MOP) and Magnesium fertilizer ratios in sandy coastal acid soils of Cross River State to prevent induced Mg lock-out.',
      action_plan_0_2_hours:
        'Inspect and confirm that only older sun-exposed lower fronds show orange spotting while new spear leaves remain green (distinguishing deficiency from lethal crown rot).',
      action_plan_2_6_hours:
        'Clear a 2-meter weed circle around the palm base; do NOT cut off the orange fronds prematurely, as the palm continues salvaging mobile nutrients from them.',
      action_plan_6_24_hours:
        'Broadcast 1.0 to 1.5 kg of Kieserite (Magnesium Sulfate) or Dolomite in an even ring along the frond drip line before expected rainfall; mulch with empty fruit bunches (EFB) if available.',
      avoid: [
        'Do NOT prune off chlorotic orange fronds; cutting them starves the palm and reduces yield further.',
        'Do NOT dump concentrated muriate of potash (MOP) without balancing magnesium ratios in acidic sands.',
        'Do NOT apply fertilizers directly against the palm trunk bark.',
      ],
      escalation:
        'Request soil and leaf tissue sampling from NIFOR / extension agents if orange spotting affects middle fronds across large plantation acreage.',
      local_context_used: 'Calabar & Akamkpa Palm Estates',
      pidgin_audio_script:
        'Palm farmer greetings to you! Wetin dey make your palm fronds turn bright yellow and orange like orange peel no be insect sickness o; na hunger for Magnesium mineral for inside Cross River acid soil. Di plant dey shout say e need food! No cut the orange leaves yet o. First clear the grass round the palm tree trunk, then pour one to two kilograms of Kieserite or Dolomite powder round the palm. You fit also carry empty palm fruit bunch or burnt ash from palm mill spread round am. Inside three months, new green fronds go shoot out and your palm oil bunch go weigh heavy!',
    },
  },
  {
    id: 'yam-anthracnose',
    title: 'Yam Anthracnose (Vine Scorch)',
    crop: 'Yams',
    localZone: 'Ogoja & Obudu Yam Hubs',
    category: 'Disease',
    thumbnailUrl: yamAnthracnoseSvg,
    description:
      'Dark brown to black necrotic spots with yellow borders causing foliage blight and vine die-back on yam mounds.',
    presetDiagnosis: {
      is_plant: true,
      crop_identified: 'Yam (Dioscorea alata / rotundata)',
      health_status: 'Diseased',
      pathology_name: 'Yam Anthracnose / Scorch (Colletotrichum gloeosporioides)',
      confidence_score: 0.95,
      severity_level: 'Critical',
      observable_symptoms: [
        'Small dark brown to black circular lesions with chlorotic yellow halo on leaves',
        'Lesions coalescing to cause premature blight and blackened scorched foliage',
        'Black necrotic streaks on twining vines leading to vine die-back',
      ],
      immediate_containment_step:
        'Prune severely blackened vines touching soil, prop up fallen vines onto tall dry bamboo stakes to minimize rain-splash from infected soil.',
      organic_local_remedy:
        'Dust generous quantities of dry wood ash over the yam mound and lower foliage to deter fungal spore germination. Spray fermented garlic and neem leaf tea.',
      standard_chemical_treatment:
        'Apply Mancozeb 80 WP or Carbendazim (Bavistin) at 40g per 15L knapsack, alternating with systemic Azoxystrobin every 14 days during wet July-September months. Observe harvest interval.',
      prevention_future:
        'Use certified disease-free seed yam setts treated with wood ash and fungicide slurry before planting. Practice 3-year crop rotation without planting yams in same mound location.',
      action_plan_0_2_hours:
        'Carefully prop up fallen or sagging yam vines onto sturdy dry bamboo stakes to elevate foliage at least 1 meter away from contaminated rain-splashed soil.',
      action_plan_2_6_hours:
        'Prune blackened dying leaf clusters touching the ground with a clean knife, and dust the yam mounds generously with fine hearth wood ash to deter spore germination.',
      action_plan_6_24_hours:
        'Prepare Mancozeb 80WP or Carbendazim protective spray (40g/15L knapsack) and apply evenly over both leaf surfaces during calm early morning conditions.',
      avoid: [
        'Do NOT walk through wet yam fields during rain or heavy dew, as foot traffic rapidly disperses sticky fungal conidia.',
        'Do NOT use overhead irrigation or splash water directly onto yam vine foliage.',
        'Do NOT save infected tubers from scorched vines as seed setts for subsequent planting.',
      ],
      escalation:
        'Escalate to local Ogoja/Obudu cooperative agronomists if vine die-back reaches the main stem within 3 days.',
      local_context_used: 'Ogoja & Obudu Yam Hubs',
      pidgin_audio_script:
        'Ogoja and Obudu yam farmers, salute! Dis black spots wey dey burn your yam leaves and make vine turn black dry die, na Anthracnose fungal scorch. Heavy rain dey splash am from ground enter the leaves. Quick action wey you must do: lift the yam vines from ground tie dem well for dry bamboo stick make air enter. Throw dry wood ash plenty round the yam heap. Then carry Mancozeb or Carbendazim chemical spray the leaves front and back make the fungus die. Next year, treat your seed yam sett with ash and clean fungicide before you bury am for mound. God go protect your big yam tubers!',
    },
  },
  {
    id: 'tool-non-plant',
    title: 'Workshop Steel Spanner (Non-Plant)',
    crop: 'Auto-detect',
    localZone: 'Field Equipment Station',
    category: 'Non-Plant',
    thumbnailUrl: farmWrenchToolsSvg,
    description:
      'Mechanical iron wrench on workbench. Demonstrates strict verification rule #1: is_plant = false.',
    presetDiagnosis: {
      is_plant: false,
      crop_identified: 'Not a plant',
      health_status: 'Unknown',
      pathology_name: null,
      confidence_score: 0.0,
      severity_level: 'None',
      observable_symptoms: [],
      immediate_containment_step: null,
      organic_local_remedy: null,
      standard_chemical_treatment: null,
      prevention_future: null,
      action_plan_0_2_hours:
        'No plant tissue detected. Please take a clear, well-lit photo focusing on a crop leaf, stem, fruit, or root.',
      action_plan_2_6_hours:
        'Ensure phone camera lens is clean and hold phone 15-30cm from the crop in natural daylight.',
      action_plan_6_24_hours:
        'Rescan with AgriScan when a field crop specimen is ready for health assessment.',
      avoid: [
        'Do NOT upload photos of farming tools, machinery, buildings, animals, or distant landscape panoramas.',
        'Do NOT apply agricultural chemicals or interventions to mechanical equipment.',
      ],
      escalation: 'No agronomic escalation required for non-plant objects.',
      local_context_used: null,
      pidgin_audio_script:
        'Dis picture wey you upload no be plant o. Na mechanical tool or iron wey dey here. Abeg snap clean photo of your crop leaf, stem, or fruit wey you wan make our agronomist inspect.',
    },
  },
];
