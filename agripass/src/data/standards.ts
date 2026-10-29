/** Typical certified-seed minimums used for warnings (EAC/COMESA/SADC harmonized seed standards — verify crop schedule). */
export const SEED_STANDARDS: Record<string, { germ: number; purity: number; moisture: number; label: string }> = {
  maize: { germ: 90, purity: 98, moisture: 13, label: 'Hybrid maize' },
  rice: { germ: 80, purity: 98, moisture: 13, label: 'Rice' },
  sorghum: { germ: 75, purity: 98, moisture: 12, label: 'Sorghum' },
  millet: { germ: 75, purity: 98, moisture: 12, label: 'Pearl millet' },
  wheat: { germ: 85, purity: 98, moisture: 13, label: 'Wheat' },
  soybean: { germ: 70, purity: 98, moisture: 12, label: 'Soybean' },
  groundnut: { germ: 70, purity: 96, moisture: 9, label: 'Groundnut' },
  cotton: { germ: 70, purity: 98, moisture: 10, label: 'Cotton' },
  tomato: { germ: 75, purity: 98, moisture: 8, label: 'Tomato' },
  chilli: { germ: 65, purity: 98, moisture: 8, label: 'Chilli' },
  onion: { germ: 70, purity: 98, moisture: 8, label: 'Onion' },
  cabbage: { germ: 75, purity: 98, moisture: 7, label: 'Cabbage' },
  okra: { germ: 65, purity: 99, moisture: 10, label: 'Okra' },
  watermelon: { germ: 75, purity: 98, moisture: 8, label: 'Watermelon' },
};

const KHAPRA = 'The consignment was inspected and found free from Trogoderma granarium (Khapra beetle).';
const SOIL = 'The consignment is free from soil, plant debris and quarantine weed seeds (including Striga spp.).';

/** Candidate Additional Declarations by crop. Final wording must match the destination import permit. */
export const AD_SUGGESTIONS: Record<string, string[]> = {
  maize: [
    'The seed lot was tested and found free from Maize Chlorotic Mottle Virus (MCMV) and Sugarcane Mosaic Virus (SCMV) — Maize Lethal Necrosis.',
    'The seed was produced in fields inspected during active growth and found free from Peronosclerospora spp. (downy mildews).',
    'The consignment is free from Prostephanus truncatus (larger grain borer).',
    'The seed lot was tested and found free from Pantoea stewartii subsp. stewartii and Stenocarpella maydis.',
    KHAPRA, SOIL,
  ],
  rice: ['The seed was hot-water treated and treated with an approved fungicide prior to export.', 'The seed lot is free from Tilletia barclayana (kernel smut) and Xanthomonas oryzae pv. oryzicola.', KHAPRA, SOIL],
  wheat: ['The wheat seed was produced in an area free from Tilletia indica (Karnal bunt), or the lot was tested and found free from it.', 'The seed lot is free from Anguina tritici (seed gall nematode).', KHAPRA, SOIL],
  sorghum: ['The seed was produced in fields found free from Peronosclerospora sorghi (sorghum downy mildew).', KHAPRA, SOIL],
  millet: ['The seed was produced in fields found free from Sclerospora graminicola (downy mildew).', KHAPRA, SOIL],
  soybean: ['The seed lot was tested and found free from Soybean mosaic virus and Peronospora manshurica.', SOIL],
  groundnut: ['The consignment is free from Caryedon serratus (groundnut bruchid) and Peanut stripe virus.', KHAPRA, SOIL],
  cotton: ['The seed was acid-delinted and found free from Pectinophora gossypiella (pink bollworm) and Anthonomus grandis (boll weevil).', 'The seed lot is free from Xanthomonas citri pv. malvacearum.', SOIL],
  tomato: ['The seed lot was tested by RT-PCR and found free from Tomato brown rugose fruit virus (ToBRFV).', 'The seed lot is free from Clavibacter michiganensis subsp. michiganensis and Potato spindle tuber viroid (PSTVd).', SOIL],
  chilli: ['The seed lot was tested by RT-PCR and found free from Tomato brown rugose fruit virus (ToBRFV).', 'The seed lot is free from Pepper mild mottle virus and Potato spindle tuber viroid (PSTVd).', SOIL],
  onion: ['The seed lot is free from Ditylenchus dipsaci (stem and bulb nematode).', SOIL],
  cabbage: ['The seed lot was tested and found free from Xanthomonas campestris pv. campestris (black rot) and Plenodomus lingam.', SOIL],
  okra: ['The seed lot is free from Bhendi yellow vein mosaic virus.', SOIL],
  watermelon: ['The seed lot was tested and found free from Acidovorax citrulli (bacterial fruit blotch).', 'The seed lot is free from Cucumber green mottle mosaic virus (CGMMV).', SOIL],
};

export const SEED_TREATMENTS = [
  'Untreated',
  'Thiram 75% WS',
  'Captan 50% WP',
  'Carbendazim 50% WP',
  'Metalaxyl-M 31.8% ES',
  'Thiram + Metalaxyl (dual dressing)',
  'Fludioxonil + Metalaxyl-M FS',
  'Imidacloprid 600 FS',
  'Thiamethoxam 30% FS',
];

/** FCO (India) heavy-metal ceilings for organic manure, mg/kg. Destination limits may be stricter. */
export const HEAVY_METALS: { key: string; label: string; max: number }[] = [
  { key: 'hm_as', label: 'Arsenic (As)', max: 10 },
  { key: 'hm_cd', label: 'Cadmium (Cd)', max: 5 },
  { key: 'hm_cr', label: 'Chromium (Cr)', max: 50 },
  { key: 'hm_pb', label: 'Lead (Pb)', max: 100 },
  { key: 'hm_hg', label: 'Mercury (Hg)', max: 0.15 },
  { key: 'hm_ni', label: 'Nickel (Ni)', max: 50 },
];

/** Pesticides listed in Annex III of the Rotterdam Convention (PIC procedure) — subset relevant to Indian exports. */
export const PIC_ANNEX_III = [
  'monocrotophos', 'methamidophos', 'endosulfan', 'carbofuran', 'phorate', 'methyl parathion', 'parathion', 'alachlor', 'aldicarb',
  'trichlorfon', 'azinphos-methyl', 'lindane', 'ddt', 'dieldrin', 'aldrin', 'chlordane', 'heptachlor', 'captafol', 'dinoseb',
  'ethylene dibromide', 'fluoroacetamide', 'tributyltin', 'binapacryl', 'toxaphene', 'pentachlorophenol', 'hexachlorobenzene',
];

export const isPIC = (ai?: string) => !!ai && PIC_ANNEX_III.some((p) => ai.toLowerCase().includes(p));

export const IRRIGATION_STANDARDS = [
  'ISO 9261:2004 — Emitters & emitting pipe',
  'IS 13487 — Emitters',
  'IS 13488 — Emitting pipes',
  'IS 12786 — Polyethylene laterals',
  'ISO 15886-3 — Sprinklers (hydraulic testing)',
  'ISO 9912-2 — Strainer-type filters',
  'ISO 4427 / IS 4984 — PE pipes',
  'IS 4985 / ISO 1452 — PVC-U pipes',
  'IEC 62253 — PV pumping systems',
];

export const PORTS_OF_LOADING = [
  'Nhava Sheva (JNPT), Maharashtra',
  'Mundra, Gujarat',
  'Kandla (Deendayal), Gujarat',
  'Hazira, Gujarat',
  'Chennai, Tamil Nadu',
  'Kattupalli, Tamil Nadu',
  'Tuticorin (V.O. Chidambaranar), Tamil Nadu',
  'Visakhapatnam, Andhra Pradesh',
  'Krishnapatnam, Andhra Pradesh',
  'Kolkata / Haldia, West Bengal',
  'Cochin, Kerala',
  'ICD Tughlakabad, Delhi',
  'Air Cargo — Mumbai (BOM)',
  'Air Cargo — Delhi (DEL)',
  'Air Cargo — Bengaluru (BLR)',
  'Air Cargo — Hyderabad (HYD)',
  'Air Cargo — Chennai (MAA)',
  'LCS Petrapole (Road)',
  'LCS Raxaul (Road)',
];

export const INDIAN_STATES = ['Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];
