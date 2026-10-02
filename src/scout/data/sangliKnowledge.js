/**
 * Sangli District — Agriculture Knowledge (Field Scout reference)
 *
 * Sangli is the featured demo district for Geo-Farm, so it carries the most
 * detailed content in the Knowledge Library. Content here is field-scout
 * reference material, not a diagnosis: every entry uses cautious language
 * ("commonly encountered", "possible signs", "field verification required")
 * and defers chemical product/dosage choices to the agriculture officer.
 *
 * Crop area figures and the pest/disease names for Sugarcane, Jowar,
 * Groundnut and Soybean are drawn from the Maharashtra State Agriculture
 * Contingency Plan for Sangli District (ICAR-CRIDA / MPKV Rahuri source
 * document supplied with this project). Terminology from that document is
 * preserved where used. Figures are historical planning estimates from that
 * document, not live statistics — they are shown only to give a field scout
 * context on which crops matter most in the district.
 */

export const SANGLI_DISTRICT_NOTE =
  'Sangli sits in the Western Maharashtra Scarcity/Plain Zone (Deccan plateau, semi-arid). ' +
  'Sugarcane, grapes, turmeric and pomegranate are grown mainly under irrigation (canals, wells, ' +
  'lift schemes), while jowar, groundnut and soybean are largely rainfed kharif/rabi crops. ' +
  'Source: Maharashtra State Agriculture Contingency Plan — Sangli District.';

export const SANGLI_CROPS = [
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    areaNote: 'Approx. 55.7 thousand ha, almost entirely irrigated — the district\u2019s largest single irrigated crop.',
  },
  {
    id: 'grapes',
    name: 'Grapes',
    areaNote: 'Approx. 10.2 thousand ha, irrigated. The Tasgaon\u2013Miraj\u2013Palus belt is a well-known grape and raisin growing area.',
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    areaNote: 'Approx. 9.0 thousand ha, irrigated spice crop.',
  },
  {
    id: 'jowar',
    name: 'Jowar / Sorghum',
    areaNote: 'Approx. 256 thousand ha combined kharif + rabi — the most widely grown field crop in the district, mostly rainfed.',
  },
  {
    id: 'groundnut',
    name: 'Groundnut',
    areaNote: 'Approx. 40 thousand ha, mainly kharif rainfed with some summer irrigated area.',
  },
  {
    id: 'soybean',
    name: 'Soybean',
    areaNote: 'Approx. 83 thousand ha, kharif rainfed.',
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate',
    areaNote: 'Approx. 6.3 thousand ha, irrigated. Grown where relevant, mainly on shallow/medium black soils.',
  },
];

/**
 * Each entry follows the fixed field-scout format:
 * crop, name (pest/disease), type, symptoms, photograph, fieldCheck,
 * riskClues, management, escalation.
 */
export const SANGLI_PEST_LIBRARY = [
  // ── Sugarcane ────────────────────────────────────────────────
  {
    id: 'sgl-sugarcane-01',
    cropId: 'sugarcane',
    crop: 'Sugarcane',
    name: 'Early Shoot Borer',
    type: 'Insect pest',
    symptoms: [
      'Dead heart in young shoots — the central leaf whorl dries and pulls out easily',
      'Small entry holes near ground level on the stem',
      'Withering of the central shoot',
    ],
    photograph: [
      'Close-up of a dead-heart shoot pulled out',
      'Entry hole near the base of the stalk',
      'Wide shot of the affected row or patch',
    ],
    fieldCheck: [
      'Pull a suspected dead-heart shoot — a foul smell and a larva inside suggest borer damage',
      'Count affected tillers in a sample of 10 plants to estimate spread',
    ],
    riskClues: [
      'Commonly seen in the first 3\u20134 months after planting',
      'Field scout should check more carefully in delayed or water-stressed cane',
    ],
    management: [
      'Field sanitation — remove and destroy dead-heart shoots',
      'Maintain recommended spacing and irrigation schedule',
      'Pheromone traps can help monitor adult moths',
      'Any chemical spray should follow locally approved recommendations — confirm product and dose with the agriculture officer',
    ],
    escalation: 'Escalate if dead heart is seen in more than roughly 1 in 10 tillers, or is spreading across the field rather than staying patchy.',
  },
  {
    id: 'sgl-sugarcane-02',
    cropId: 'sugarcane',
    crop: 'Sugarcane',
    name: 'Internode / Stem Borer',
    type: 'Insect pest',
    symptoms: [
      'Rows of small shot-holes on the stalk',
      'Reddish frass (excreta) visible near entry points',
      'Cane may snap easily at a tunnelled internode',
    ],
    photograph: [
      'Split stalk showing internal tunnelling',
      'External shot-holes with frass',
    ],
    fieldCheck: [
      'Split a few suspect canes lengthwise to check for larval tunnels',
      'Check for weak internodes that break easily',
    ],
    riskClues: [
      'Field scout should check more during the grand growth stage (monsoon months)',
      'Dense, poorly-thinned crop is a relevant field concern',
    ],
    management: [
      'Detrashing — remove dried leaves that shelter larvae',
      'Remove severely tunnelled canes at harvest to reduce carry-over',
      'Conserve natural enemies; avoid unnecessary broad-spectrum spraying',
      'Confirm any spray schedule with the agriculture officer',
    ],
    escalation: 'Escalate if tunnelling is found across multiple rows, or canes are breaking/lodging in the field.',
  },
  {
    id: 'sgl-sugarcane-03',
    cropId: 'sugarcane',
    crop: 'Sugarcane',
    name: 'White Woolly Aphid',
    type: 'Sucking pest',
    symptoms: [
      'White, cottony/woolly colonies on the underside of leaves',
      'Sticky honeydew and black sooty mould on leaves',
      'Yellowing and drying of lower leaves',
    ],
    photograph: [
      'Close-up of woolly colonies under the leaf',
      'Leaf showing sooty mould',
    ],
    fieldCheck: [
      'Check the underside of lower and middle leaves first',
      'Look for ant activity — ants feed on the honeydew and often signal an active colony',
    ],
    riskClues: [
      'Tends to spread faster in warm, humid, dusty conditions',
      'Often noticed after a dry spell is followed by sudden humidity',
    ],
    management: [
      'Remove and destroy heavily infested lower leaves',
      'Conserve natural predators (ladybird beetles, lacewings)',
      'Avoid excess nitrogen, which favours aphid build-up',
      'Chemical treatment only as per locally approved recommendation',
    ],
    escalation: 'Escalate if colonies are climbing higher up the plant or appearing across several nearby fields.',
  },
  {
    id: 'sgl-sugarcane-04',
    cropId: 'sugarcane',
    crop: 'Sugarcane',
    name: 'Red Rot',
    type: 'Fungal disease',
    symptoms: [
      'Reddened internal tissue with white cross-patches when the stalk is split',
      'Alcoholic/sour smell from the split cane',
      'Drying and yellowing of leaves starting from the top, drooping in patches',
    ],
    photograph: [
      'Split stalk showing red discoloration with white bands',
      'Field patch showing drying/wilting canes',
    ],
    fieldCheck: [
      'Split a few wilting canes lengthwise — reddened tissue with white patches and a sour smell are the field signs to check for',
      'Note whether drying is spreading outward from one patch',
    ],
    riskClues: [
      'Favoured by waterlogging and by planting infected seed cane',
      'Often follows heavy rain in poorly drained fields',
    ],
    management: [
      'Use disease-free, certified seed cane for planting',
      'Improve field drainage; avoid waterlogging',
      'Remove and destroy affected clumps to reduce spread',
      'This is a serious disease in cane-growing belts — confirm any fungicide/seed-treatment step with the agriculture officer',
    ],
    escalation: 'Escalate promptly — red rot can spread through irrigation water and infected seed material; get officer confirmation before any replanting decision.',
  },

  // ── Grapes ───────────────────────────────────────────────────
  {
    id: 'sgl-grapes-01',
    cropId: 'grapes',
    crop: 'Grapes',
    name: 'Downy Mildew',
    type: 'Fungal disease',
    symptoms: [
      'Yellow, oily patches on the upper leaf surface',
      'White downy fungal growth on the underside, usually visible after rain or dew',
      'Shrivelling of infected berries',
    ],
    photograph: [
      'Top of the leaf showing the oily yellow patch',
      'Underside of the same leaf showing white downy growth',
      'Close-up of an affected bunch',
    ],
    fieldCheck: [
      'Check leaf undersides early morning, when downy growth is most visible',
      'Inspect bunches in the lower canopy first — that zone holds humidity longest',
    ],
    riskClues: [
      'Field scout should watch closely after rain or heavy dew combined with mild temperatures',
      'Dense canopy with poor airflow is a relevant risk factor',
    ],
    management: [
      'Improve canopy airflow through timely pruning/training',
      'Remove and destroy heavily infected leaves/bunches',
      'Follow a locally approved fungicide schedule — confirm product and dose with the agriculture officer',
      'Avoid overhead irrigation during high-risk weather',
    ],
    escalation: 'Escalate if spread is fast during flowering or fruit-set, since downy mildew can cause major yield loss quickly at that stage.',
  },
  {
    id: 'sgl-grapes-02',
    cropId: 'grapes',
    crop: 'Grapes',
    name: 'Powdery Mildew',
    type: 'Fungal disease',
    symptoms: [
      'White powdery coating on leaves, shoots or berries',
      'Leaf curling and stunted shoot growth',
      'Cracking of infected young berries',
    ],
    photograph: [
      'Close-up of powdery coating on a leaf or berry',
      'Wide shot of an affected shoot',
    ],
    fieldCheck: [
      'Rub the white coating — powdery mildew smears off, unlike surface dust',
      'Check young, tender shoots and berries first',
    ],
    riskClues: [
      'Favoured by warm, dry days with humid nights',
      'Shaded, poorly ventilated canopy is a relevant field concern',
    ],
    management: [
      'Improve sunlight penetration and airflow via canopy management',
      'Sulfur-based or locally approved fungicide as per label — confirm with the agriculture officer',
      'Avoid excess nitrogen fertigation',
    ],
    escalation: 'Escalate if berry cracking/infection is seen close to harvest, since fruit quality and marketability are directly affected.',
  },
  {
    id: 'sgl-grapes-03',
    cropId: 'grapes',
    crop: 'Grapes',
    name: 'Thrips',
    type: 'Sucking pest',
    symptoms: [
      'Silvery streaks and scarring on leaves and berry skin',
      'Curled or distorted young leaves',
      'Corky, rough patches ("russeting") on berries',
    ],
    photograph: [
      'Close-up of silvery/scarred leaf',
      'Berry showing corky russeting',
    ],
    fieldCheck: [
      'Tap a shoot or flower cluster over white paper — tiny thrips become visible',
      'Check inside curled young leaves',
    ],
    riskClues: [
      'Population commonly builds up in hot, dry weather',
      'Often rises just after flowering',
    ],
    management: [
      'Blue/yellow sticky traps for monitoring',
      'Conserve predatory mites and other natural enemies',
      'Spray only on threshold, as per locally approved recommendation',
    ],
    escalation: 'Escalate if berry russeting is extensive close to harvest, since it affects table-grape/raisin quality.',
  },
  {
    id: 'sgl-grapes-04',
    cropId: 'grapes',
    crop: 'Grapes',
    name: 'Mealybugs',
    type: 'Sucking pest',
    symptoms: [
      'White, waxy, cottony insects clustered on stems, bunch stalks and under loose bark',
      'Sticky honeydew and black sooty mould',
      'Bunch and berry drop in heavy infestation',
    ],
    photograph: [
      'Close-up of a mealybug colony on a bunch stalk',
      'Sooty mould on leaves or bunches',
    ],
    fieldCheck: [
      'Check bark crevices and the base of bunches — mealybugs shelter in these spots',
      'Look for ant activity, which often signals a mealybug colony',
    ],
    riskClues: [
      'Tends to spread along irrigation lines and via ants; drought-stressed vines are more prone',
      'Old, rough bark is a relevant risk factor when bark scraping has been skipped',
    ],
    management: [
      'Bark scraping/removal of loose bark where mealybugs shelter',
      'Sticky bands on trunks and biological control agents where available',
      'Field sanitation — destroy severely infested plant material',
      'Confirm chemical options and dose with the agriculture officer',
    ],
    escalation: 'Escalate if colonies are found on multiple vines or on bunches close to harvest.',
  },

  // ── Turmeric ─────────────────────────────────────────────────
  {
    id: 'sgl-turmeric-01',
    cropId: 'turmeric',
    crop: 'Turmeric',
    name: 'Rhizome Rot',
    type: 'Soil-borne disease (fungal/bacterial)',
    symptoms: [
      'Yellowing and drying of leaves, starting from the margins',
      'Rotting, soft, foul-smelling rhizomes when dug up',
      'Plants wilting and collapsing in patches',
    ],
    photograph: [
      'Dug-up rhizome showing rot',
      'Patch of wilting/yellowing plants in the field',
    ],
    fieldCheck: [
      'Dig up a wilting plant and check the rhizome for softness or a foul smell',
      'Check drainage in the affected patch — rot usually starts in waterlogged spots',
    ],
    riskClues: [
      'Strongly linked to waterlogging and poor drainage',
      'Often follows continuous turmeric cultivation on the same plot',
    ],
    management: [
      'Improve field drainage; avoid waterlogging',
      'Use disease-free, treated seed rhizomes',
      'Practice crop rotation rather than continuous turmeric',
      'Confirm any soil/seed treatment product with the agriculture officer',
    ],
    escalation: 'Escalate if rot is spreading beyond a small patch — this disease can affect a plot rapidly.',
  },
  {
    id: 'sgl-turmeric-02',
    cropId: 'turmeric',
    crop: 'Turmeric',
    name: 'Leaf Spot / Leaf Blotch',
    type: 'Fungal disease',
    symptoms: [
      'Small, oval brown/dark spots on leaves with yellow margins',
      'Spots enlarging and merging into a scorched appearance',
      'Premature drying of leaves',
    ],
    photograph: [
      'Close-up of individual leaf spots',
      'Wide shot of a badly spotted canopy',
    ],
    fieldCheck: [
      'Check older, lower leaves first — spots usually start there',
      'Note whether spots are spreading upward through the canopy',
    ],
    riskClues: [
      'Favoured by high humidity, close spacing and prolonged leaf wetness',
      'A relevant field concern during heavy monsoon periods',
    ],
    management: [
      'Avoid overcrowded planting; ensure good airflow',
      'Remove and destroy severely affected leaves',
      'Locally approved fungicide if spread is significant — confirm with the agriculture officer',
    ],
    escalation: 'Escalate if leaf spot is causing significant premature leaf loss, since this affects rhizome development.',
  },
  {
    id: 'sgl-turmeric-03',
    cropId: 'turmeric',
    crop: 'Turmeric',
    name: 'Shoot Borer',
    type: 'Insect pest',
    symptoms: [
      'Withering and drying of the central shoot ("dead heart")',
      'Small holes on the pseudostem with visible frass',
      'Affected shoots can be pulled out easily',
    ],
    photograph: [
      'Close-up of the dead central shoot pulled out',
      'Entry hole with frass on the pseudostem',
    ],
    fieldCheck: [
      'Pull a suspected dead shoot to check for larva/frass inside',
      'Count affected shoots per plant clump',
    ],
    riskClues: [
      'Population commonly builds up during the monsoon growth period',
    ],
    management: [
      'Remove and destroy affected shoots promptly',
      'Field sanitation to reduce carry-over between seasons',
      'Confirm chemical options with the agriculture officer if infestation is heavy',
    ],
    escalation: 'Escalate if a large share of shoots per clump are affected, since this reduces yield directly.',
  },

  // ── Jowar / Sorghum ──────────────────────────────────────────
  {
    id: 'sgl-jowar-01',
    cropId: 'jowar',
    crop: 'Jowar / Sorghum',
    name: 'Shoot Fly',
    type: 'Insect pest',
    symptoms: [
      'Dead heart in young seedlings — the central leaf whorl dries and pulls out easily',
      'Foul smell from the pulled-out dead heart',
      'Withered, discoloured central shoot',
    ],
    photograph: [
      'Close-up of a dead-heart seedling pulled apart',
      'Field patch showing scattered dead-heart seedlings',
    ],
    fieldCheck: [
      'Pull a few wilting seedlings — an easy pull with a rotten smell suggests shoot fly damage',
      'Count affected seedlings per row to estimate percentage damage',
    ],
    riskClues: [
      'Highest risk in the first 2\u20133 weeks after germination, especially with delayed or staggered sowing',
      'Named in the district contingency plan as a key early-season sorghum pest',
    ],
    management: [
      'Timely, uniform sowing within the recommended window to avoid the peak fly period',
      'Fish-meal traps for monitoring adult flies (as referenced in the district contingency plan)',
      'Confirm any insecticide spray with the agriculture officer',
    ],
    escalation: 'Escalate if dead-heart incidence is high across the field soon after germination — early loss here is hard to recover from.',
  },
  {
    id: 'sgl-jowar-02',
    cropId: 'jowar',
    crop: 'Jowar / Sorghum',
    name: 'Stem Borer',
    type: 'Insect pest',
    symptoms: [
      'Rows of small shot-holes on leaves at the whorl stage',
      'Dead heart in older plants',
      'Tunnelling and frass inside the stem',
    ],
    photograph: [
      'Leaf whorl showing rows of shot-holes',
      'Split stem showing tunnelling',
    ],
    fieldCheck: [
      'Unroll the central whorl leaf — a shot-hole pattern points to early stem borer feeding',
      'Split a few dead-heart stems to check for larvae or frass',
    ],
    riskClues: [
      'Risk increases with continuous sorghum cropping and residue left in the field',
    ],
    management: [
      'Destroy crop residue/stubble after harvest to reduce carry-over',
      'Confirm spray timing/product with the agriculture officer if monitoring shows an active population',
    ],
    escalation: 'Escalate if damage is widespread rather than a few isolated plants.',
  },
  {
    id: 'sgl-jowar-03',
    cropId: 'jowar',
    crop: 'Jowar / Sorghum',
    name: 'Aphids / Jassids',
    type: 'Sucking pest',
    symptoms: [
      'Clusters of small insects on the underside of leaves and on the earhead',
      'Yellowing and curling of leaves',
      'Sticky honeydew and sooty mould in heavy infestation',
    ],
    photograph: [
      'Close-up of an aphid/jassid colony on the leaf underside',
      'Leaf showing yellowing/honeydew',
    ],
    fieldCheck: [
      'Check leaf undersides and the earhead for colonies',
      'Note whether ants are present, feeding on the honeydew',
    ],
    riskClues: [
      'Population often rises in warm weather following a dry spell',
    ],
    management: [
      'Conserve natural predators',
      'Confirm chemical spray with the agriculture officer if the threshold is exceeded',
    ],
    escalation: 'Escalate if infestation is heavy at the earhead stage, since it can affect grain fill.',
  },
  {
    id: 'sgl-jowar-04',
    cropId: 'jowar',
    crop: 'Jowar / Sorghum',
    name: 'Grain Mould',
    type: 'Fungal disease (post-harvest / at maturity)',
    symptoms: [
      'Grey/black or pink fungal growth on grain heads',
      'Discoloured, shrivelled grain',
      'Most visible after rain around maturity/harvest',
    ],
    photograph: [
      'Close-up of a mouldy grain head',
      'Sample of affected grain',
    ],
    fieldCheck: [
      'Check earheads for mould, especially if rain occurs near maturity',
      'Compare grain colour/texture against a healthy head',
    ],
    riskClues: [
      'Directly linked to rain and high humidity around grain maturity — the district contingency plan flags this specifically after unseasonal rain',
    ],
    management: [
      'Harvest promptly at maturity where possible, to limit field exposure to moisture',
      'Proper drying before storage',
      'Confirm any fungicide treatment with the agriculture officer',
    ],
    escalation: 'Escalate if grain mould is widespread — it affects both yield and grain quality/marketability.',
  },

  // ── Groundnut ────────────────────────────────────────────────
  {
    id: 'sgl-groundnut-01',
    cropId: 'groundnut',
    crop: 'Groundnut',
    name: 'Leaf Spot & Rust',
    type: 'Fungal disease',
    symptoms: [
      'Circular dark brown/black spots on leaves (leaf spot)',
      'Orange-brown pustules on the leaf underside (rust)',
      'Premature yellowing and leaf fall',
    ],
    photograph: [
      'Close-up of leaf spot lesions',
      'Close-up of rust pustules on the leaf underside',
    ],
    fieldCheck: [
      'Check older leaves first for spots/pustules',
      'Rub the leaf underside — rust pustules leave an orange powder on fingers',
    ],
    riskClues: [
      'Favoured by humid weather and dense canopy',
      'Listed in the district contingency plan as a common concern following unseasonal rain',
    ],
    management: [
      'Field sanitation — remove and destroy heavily infected leaves/debris',
      'Locally approved fungicide only as per officer guidance',
      'Avoid excess overhead irrigation during flowering-to-pod stage',
    ],
    escalation: 'Escalate if defoliation is severe before pod filling, since it affects pod development directly.',
  },
  {
    id: 'sgl-groundnut-02',
    cropId: 'groundnut',
    crop: 'Groundnut',
    name: 'Thrips & Jassids',
    type: 'Sucking pest',
    symptoms: [
      'Silvering/browning of the leaf surface (thrips)',
      'Leaf curling and "hopper burn" yellowing at leaf margins (jassids)',
      'Stunted plant growth in heavy infestation',
    ],
    photograph: [
      'Close-up of silvered/browned leaf',
      'Leaf edge showing hopper-burn yellowing',
    ],
    fieldCheck: [
      'Check young leaves and terminal shoots for thrips damage',
      'Check leaf margins for the characteristic hopper-burn yellowing',
    ],
    riskClues: [
      'Population usually rises in warm, dry spells during the vegetative stage',
    ],
    management: [
      'Conserve natural predators',
      'Confirm insecticide choice/dose with the agriculture officer if threshold is crossed',
    ],
    escalation: 'Escalate if hopper-burn/silvering is spreading fast across the field.',
  },
  {
    id: 'sgl-groundnut-03',
    cropId: 'groundnut',
    crop: 'Groundnut',
    name: 'Leaf Roller',
    type: 'Insect pest',
    symptoms: [
      'Leaves rolled/webbed together with a larva feeding inside',
      'Skeletonized or scraped leaf patches',
      'Visible webbing',
    ],
    photograph: [
      'Close-up of a rolled leaf opened to show larva/webbing',
    ],
    fieldCheck: [
      'Open a few rolled leaves to confirm larva presence',
      'Count the number of rolled leaves per plant',
    ],
    riskClues: [
      'Builds up during warm, humid weather in a standing crop',
    ],
    management: [
      'Hand-destroy rolled leaves where infestation is light',
      'Confirm spray option with the agriculture officer for heavier infestation',
    ],
    escalation: 'Escalate if rolling is widespread across the field rather than a few isolated plants.',
  },
  {
    id: 'sgl-groundnut-04',
    cropId: 'groundnut',
    crop: 'Groundnut',
    name: 'Aflatoxin Risk (Aspergillus) — Post-harvest',
    type: 'Storage/quality risk (fungal)',
    symptoms: [
      'Yellow-green mould growth on pods/kernels',
      'Musty smell in stored produce',
      'Shrivelled, discoloured kernels',
    ],
    photograph: [
      'Close-up of mouldy pods/kernels',
      'Storage condition (damp or leaking area), if relevant',
    ],
    fieldCheck: [
      'Check pods/kernels after harvest for mould and discoloration',
      'Check moisture level and drying/storage conditions',
    ],
    riskClues: [
      'Risk rises sharply if harvested pods are not dried properly before storage, especially after unseasonal rain — the district contingency plan flags proper drying as the key safeguard',
    ],
    management: [
      'Proper sun-drying before storage is the primary safeguard (per the district contingency plan)',
      'Store in dry, well-ventilated conditions',
      'Do not use visibly mouldy produce for seed or consumption — escalate for guidance',
    ],
    escalation: 'Escalate any suspected aflatoxin contamination immediately — this is a food-safety concern, not only a yield issue.',
  },

  // ── Soybean ──────────────────────────────────────────────────
  {
    id: 'sgl-soybean-01',
    cropId: 'soybean',
    crop: 'Soybean',
    name: 'Root Rot / Collar Rot',
    type: 'Fungal disease',
    symptoms: [
      'Yellowing and wilting of plants, often in patches',
      'Rotting at the collar/root region when the plant is pulled out',
      'Plants easily uprooted due to rotted roots',
    ],
    photograph: [
      'Uprooted plant showing rotted collar/root',
      'Field patch showing wilting',
    ],
    fieldCheck: [
      'Pull a wilting plant and inspect the collar region for rot/discoloration',
      'Check whether wilting is spreading from a low-lying or waterlogged spot',
    ],
    riskClues: [
      'Linked to waterlogging and untreated/infected seed — the district contingency plan recommends seed treatment as a preventive step',
    ],
    management: [
      'Use treated, disease-free seed',
      'Improve field drainage',
      'Confirm any seed-treatment or fungicide product with the agriculture officer',
    ],
    escalation: 'Escalate if wilting patches are expanding, since root rot can spread through the field.',
  },
  {
    id: 'sgl-soybean-02',
    cropId: 'soybean',
    crop: 'Soybean',
    name: 'Rust',
    type: 'Fungal disease',
    symptoms: [
      'Small reddish-brown pustules mainly on the leaf underside',
      'Yellowing and premature drying/defoliation of leaves',
    ],
    photograph: [
      'Close-up of rust pustules on the leaf underside',
      'Plant showing premature yellowing/defoliation',
    ],
    fieldCheck: [
      'Check the underside of lower leaves first — rust usually appears there before spreading upward',
    ],
    riskClues: [
      'Favoured by humid weather; the district contingency plan recommends early sowing and rust-tolerant varieties as preventive steps',
    ],
    management: [
      'Prefer rust-tolerant varieties where available for future sowing',
      'Locally approved fungicide only as per officer guidance',
      'Field sanitation after harvest',
    ],
    escalation: 'Escalate if rust is spreading rapidly during pod-fill, since it can cause significant yield loss.',
  },
  {
    id: 'sgl-soybean-03',
    cropId: 'soybean',
    crop: 'Soybean',
    name: 'Spodoptera / Hairy Caterpillar / Semilooper',
    type: 'Insect pest (defoliators)',
    symptoms: [
      'Irregular holes and skeletonized patches on leaves',
      'Visible caterpillars/larvae on leaves, often clustered in early stages',
      'Rapid defoliation in heavy infestation',
    ],
    photograph: [
      'Close-up of larvae on a leaf',
      'Wide shot of a defoliated patch',
    ],
    fieldCheck: [
      'Check leaf undersides for egg masses or young larvae in a cluster',
      'Estimate the percentage of leaf area lost in the affected patch',
    ],
    riskClues: [
      'The district contingency plan specifically recommends pheromone traps for monitoring Spodoptera',
    ],
    management: [
      'Install pheromone traps for early monitoring (as per the district contingency plan)',
      'Hand-pick and destroy egg masses/larval clusters where feasible',
      'Confirm any insecticide spray with the agriculture officer if threshold is crossed',
    ],
    escalation: 'Escalate if defoliation is spreading fast — these pests can strip a field within days under favourable conditions.',
  },

  // ── Pomegranate ──────────────────────────────────────────────
  {
    id: 'sgl-pomegranate-01',
    cropId: 'pomegranate',
    crop: 'Pomegranate',
    name: 'Bacterial Blight',
    type: 'Bacterial disease',
    symptoms: [
      'Small, dark, oily/water-soaked spots on leaves, stems and fruit',
      'Spots often angular, later turning necrotic',
      'Fruit cracking associated with severe lesions',
    ],
    photograph: [
      'Close-up of leaf spots',
      'Fruit showing lesions/cracking',
    ],
    fieldCheck: [
      'Check leaves and fruit for the characteristic oily/water-soaked spots',
      'Check whether nearby plants show similar spotting — this disease spreads via wind-driven rain and water splash',
    ],
    riskClues: [
      'Spreads faster in wet, humid weather and after wind-driven rain',
      'Higher risk in orchards with poor sanitation or pruning debris left in the field',
    ],
    management: [
      'Prune and destroy affected twigs/leaves; sanitize tools between plants',
      'Avoid overhead irrigation during humid weather',
      'This is a serious, officer-notifiable concern in pomegranate belts — confirm any copper-based spray schedule and dose with the agriculture officer',
    ],
    escalation: 'Escalate promptly — bacterial blight can spread quickly across an orchard and cause major fruit loss.',
  },
  {
    id: 'sgl-pomegranate-02',
    cropId: 'pomegranate',
    crop: 'Pomegranate',
    name: 'Fruit Borer',
    type: 'Insect pest',
    symptoms: [
      'Entry holes on fruit with visible frass',
      'Premature fruit drop',
      'A larva may be visible inside affected fruit',
    ],
    photograph: [
      'Close-up of the entry hole with frass on fruit',
      'Dropped or damaged fruit',
    ],
    fieldCheck: [
      'Check the fruit surface for small holes and frass, especially near the calyx end',
      'Cut open a suspect dropped fruit to check for a larva',
    ],
    riskClues: [
      'Risk rises as fruit matures and during warm, humid periods',
    ],
    management: [
      'Bag fruit at an early stage where feasible (physical protection)',
      'Field sanitation — remove and destroy fallen/infested fruit promptly',
      'Confirm any spray schedule with the agriculture officer',
    ],
    escalation: 'Escalate if fruit damage/drop is widespread across the orchard close to harvest.',
  },
];

export function getSangliEntriesByCrop(cropId) {
  return SANGLI_PEST_LIBRARY.filter((e) => e.cropId === cropId);
}
