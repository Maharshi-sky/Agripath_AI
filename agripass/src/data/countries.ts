import { FAIRS } from './fairs.generated';
import type { CountryProfile, BlocId, Authorities, CountryProfile as CP } from './types';

type Seed = Omit<CP, 'fairs' | 'depth' | 'gmo'> & { depth?: CP['depth']; gmo?: CP['gmo'] };

const AIFTA = { agreement: 'ASEAN–India Trade in Goods Agreement (AITIGA)', form: 'AIFTA Certificate of Origin (Form AI)' };
const SAFTA = { agreement: 'South Asian Free Trade Area (SAFTA)', form: 'SAFTA Certificate of Origin' };

const gen = (country: string): Authorities => ({
  nppo: `National Plant Protection Organization of ${country} (Ministry of Agriculture)`,
});

const SEEDS: Seed[] = [
  // ───────────── East Africa ─────────────
  {
    id: 'KE', name: 'Kenya', region: 'East Africa', blocs: ['EAC', 'COMESA', 'IGAD'], depth: 'profiled',
    ports: ['Mombasa (Kilindini)', 'JKIA Nairobi (Air)', 'Malaba (Road)', 'Lamu'],
    singleWindow: 'KenTrade — Kenya National Electronic Single Window',
    auth: {
      nppo: 'Kenya Plant Health Inspectorate Service (KEPHIS)',
      seed: 'KEPHIS — Seed Certification & Plant Variety Protection (Seeds and Plant Varieties Act, Cap 326)',
      fert: 'Fertilizer & Animal Foodstuffs Board (MoALD) · KEBS standards',
      pest: 'Pest Control Products Board (PCPB)',
      biosafety: 'National Biosafety Authority (NBA)',
      standards: 'Kenya Bureau of Standards (KEBS)', customs: 'Kenya Revenue Authority — Customs (iCMS)',
    },
    conformity: { scheme: 'Pre-Export Verification of Conformity (PVoC) — Certificate of Conformity', body: 'KEBS (via appointed PVoC agents)', scope: ['machinery', 'irrigation', 'fertilizers'], note: 'FAIRS (2026): CoC valid three months, single shipment. Where no PVoC agent is contracted in the origin country, goods undergo destination inspection at Kenyan ports.' },
    gmo: 'ban', gmoNote: 'FAIRS 2026: Kenya currently bans imports of genetically engineered agricultural and food products. NBA approval is still needed to confirm non-GE status of GM-relevant crops.',
    importDeclaration: { name: 'Import Declaration Form (IDF)', system: 'KenTrade', note: 'Lodged by the Kenyan importer before shipment; the IDF number must appear on the commercial invoice.' },
    seedPermitName: 'KEPHIS Plant Import Permit (PIP)',
    seedRegistrar: { name: 'KEPHIS', permit: 'Plant Import Permit covers seed; no separate seed import licence', registration: 'Kenya National Variety List (after National Performance Trials) or EAC Variety Catalogue listing' },
    notes: ['FAIRS lists a Radiation Certificate (KNRA) for commodities entering through the port, via KenTrade.', 'FAIRS lists Fumigation, Noxious Weed and Karnal Bunt–free certificates depending on commodity.'],
  },
  {
    id: 'TZ', name: 'Tanzania', region: 'East Africa', blocs: ['EAC', 'SADC'], depth: 'profiled',
    ports: ['Dar es Salaam', 'Tanga', 'Julius Nyerere Intl. (Air)', 'Namanga (Road)'],
    singleWindow: 'Tanzania Electronic Single Window System (TeSWS) · TANCIS',
    auth: {
      nppo: 'Tanzania Plant Health and Pesticides Authority (TPHPA)',
      seed: 'Tanzania Official Seed Certification Institute (TOSCI)',
      fert: 'Tanzania Fertilizer Regulatory Authority (TFRA)',
      pest: 'Tanzania Plant Health and Pesticides Authority (TPHPA)',
      biosafety: 'Vice President’s Office — Division of Environment (National Biosafety Focal Point)',
      standards: 'Tanzania Bureau of Standards (TBS)', customs: 'Tanzania Revenue Authority (TRA)',
    },
    conformity: { scheme: 'Pre-Shipment Verification of Conformity (PVoC) — Certificate of Conformity', body: 'Tanzania Bureau of Standards (TBS)', scope: ['machinery', 'irrigation', 'fertilizers'], note: 'FAIRS (2026): CoC issued per consignment, valid three months; supplier declarations not accepted. Goods can still be rejected at port.' },
    gmo: 'strict', gmoNote: 'GMO imports need a biosafety permit. FAIRS notes TBS issues the GMO import permit for GE food/feed.',
    seedPermitName: 'TPHPA Plant Import Permit',
    seedRegistrar: { name: 'TOSCI', permit: 'TOSCI Seed Import Permit', registration: 'Tanzania National Variety List or EAC/SADC Variety Catalogue' },
    notes: ['Zanzibar applies its own rules (not covered here).'],
  },
  {
    id: 'UG', name: 'Uganda', region: 'East Africa', blocs: ['EAC', 'COMESA', 'IGAD'], depth: 'profiled',
    ports: ['Entebbe Intl. (Air)', 'Malaba (Road, via Mombasa)', 'Busia (Road)', 'Mutukula (Road, via Dar es Salaam)'],
    singleWindow: 'Uganda Electronic Single Window (UeSW)',
    auth: {
      nppo: 'MAAIF — Department of Crop Inspection & Certification (DCIC)',
      seed: 'MAAIF — National Seed Certification Services (NSCS)',
      fert: 'Agricultural Chemicals Board (ACB), MAAIF', pest: 'Agricultural Chemicals Board (ACB), MAAIF',
      biosafety: 'Uganda National Council for Science and Technology (UNCST)',
      standards: 'Uganda National Bureau of Standards (UNBS)', customs: 'Uganda Revenue Authority (URA)',
    },
    conformity: { scheme: 'Pre-Export Verification of Conformity (PVoC) — Certificate of Conformity', body: 'UNBS (via appointed PVoC agents)', scope: ['machinery', 'irrigation', 'fertilizers'] },
    gmo: 'strict', gmoNote: 'No enacted GMO law permitting commercial GE planting material; confined trials only via UNCST.',
    seedPermitName: 'MAAIF Plant Import Permit',
    seedRegistrar: { name: 'MAAIF NSCS', permit: 'MAAIF Seed Import Permit', registration: 'Uganda National Variety List or EAC/COMESA catalogue' },
  },
  {
    id: 'RW', name: 'Rwanda', region: 'East Africa', blocs: ['EAC', 'COMESA', 'ECCAS'], depth: 'bloc',
    ports: ['Kigali Intl. (Air)', 'Rusumo (Road, via Dar es Salaam)', 'Gatuna (Road, via Mombasa)'],
    singleWindow: 'Rwanda Electronic Single Window (ReSW)',
    auth: { nppo: 'Rwanda Inspectorate, Competition and Consumer Protection Authority (RICA)', seed: 'RICA — Seed Certification', pest: 'RICA / MINAGRI — Pesticide Registration', fert: 'MINAGRI — Fertilizer Regulation', standards: 'Rwanda Standards Board (RSB)', biosafety: 'Rwanda Environment Management Authority (REMA)' },
    gmo: 'strict',
  },
  {
    id: 'BI', name: 'Burundi', region: 'East Africa', blocs: ['EAC', 'COMESA', 'ECCAS'], depth: 'bloc',
    ports: ['Bujumbura Intl. (Air)', 'Port of Bujumbura (Lake Tanganyika)', 'Kobero (Road)'],
    auth: { nppo: 'Ministère de l’Environnement, de l’Agriculture et de l’Élevage — Direction de la Protection des Végétaux', standards: 'Bureau Burundais de Normalisation (BBN)' },
    gmo: 'strict',
  },
  {
    id: 'SS', name: 'South Sudan', region: 'East Africa', blocs: ['EAC', 'IGAD'], depth: 'bloc',
    ports: ['Juba Intl. (Air)', 'Nimule (Road, via Mombasa)'],
    auth: { nppo: 'Ministry of Agriculture & Food Security — Directorate of Plant Protection', standards: 'South Sudan National Bureau of Standards (SSNBS)' },
    alerts: [{ level: 'warn', text: 'Insecure overland corridors; confirm consignee capacity and routing before shipment.' }],
  },
  {
    id: 'SO', name: 'Somalia', region: 'East Africa', blocs: ['EAC', 'COMESA', 'IGAD'], depth: 'indicative',
    ports: ['Mogadishu', 'Berbera', 'Bosaso', 'Aden Adde Intl. (Air)'],
    auth: { nppo: 'Ministry of Agriculture & Irrigation — Plant Protection Department' },
  },
  {
    id: 'ER', name: 'Eritrea', region: 'East Africa', blocs: ['COMESA', 'IGAD'], depth: 'indicative',
    ports: ['Massawa', 'Asmara Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Regulatory Services Department' },
  },
  {
    id: 'DJ', name: 'Djibouti', region: 'East Africa', blocs: ['COMESA', 'IGAD'], depth: 'indicative',
    ports: ['Port of Djibouti (Doraleh)', 'Djibouti–Ambouli (Air)'], auth: { nppo: 'Ministère de l’Agriculture — Service de la Protection des Végétaux' },
  },
  {
    id: 'ET', name: 'Ethiopia', region: 'East Africa', blocs: ['COMESA', 'IGAD'], depth: 'profiled',
    ports: ['Djibouti (Doraleh) → Modjo Dry Port', 'Addis Ababa Bole (Air)', 'Galafi (Road)'],
    singleWindow: 'Ethiopian Electronic Single Window (eSW)',
    auth: {
      nppo: 'Ethiopian Agricultural Authority (EAA) — Plant Health Regulatory Directorate',
      seed: 'Ethiopian Agricultural Authority (EAA) — Seed Regulatory Directorate',
      fert: 'Ministry of Agriculture / EAA — Fertilizer regulation',
      pest: 'Ethiopian Agricultural Authority (EAA) — Pesticide Registration',
      biosafety: 'Environmental Protection Authority (EPA) with EFDA',
      standards: 'Ministry of Trade & Regional Integration (MoTRI) / Ethiopian Conformity Assessment Enterprise',
      customs: 'Ethiopian Customs Commission',
    },
    conformity: { scheme: 'Certificate of Conformity for products under Compulsory Ethiopian Standards', body: 'MoTRI / EFDA via accredited PSI bodies', scope: ['machinery', 'irrigation'], note: 'FAIRS (2025): CoC valid three months, single consignment; third-party pre-shipment inspection.' },
    gmo: 'regulated', gmoNote: 'GMO import permit from EFDA and EPA (Biosafety Proclamation 896/2015).',
    seedPermitName: 'EAA Plant Import Permit (Schedule I plants)',
    seedRegistrar: { name: 'EAA', permit: 'EAA Seed Import Permit', registration: 'Ethiopian National Variety Register or COMESA Variety Catalogue' },
    notes: ['FAIRS: PSC must state plant parts are free from soil; seeds may be certified heat-treated and free from seed-borne diseases.', 'FAIRS lists an Insurance Certificate and Chamber-authenticated Certificate of Origin.'],
  },
  {
    id: 'SD', name: 'Sudan', region: 'East Africa', blocs: ['COMESA', 'IGAD', 'GAFTA'], depth: 'indicative',
    ports: ['Port Sudan', 'Port Sudan New Intl. (Air)'],
    auth: { nppo: 'Ministry of Agriculture & Forests — Plant Protection Directorate (Plant Quarantine)' },
    alerts: [{ level: 'warn', text: 'Ongoing conflict disrupts regulators and logistics; confirm the issuing office and payment channel first.' }],
  },
  // ───────────── West Africa ─────────────
  {
    id: 'NG', name: 'Nigeria', region: 'West Africa', blocs: ['ECOWAS'], depth: 'profiled',
    ports: ['Apapa (Lagos)', 'Tin Can Island (Lagos)', 'Lekki Deep Sea Port', 'Onne (Rivers)', 'MMIA Lagos (Air)'],
    singleWindow: 'Nigeria Customs Service (B’Odogwu) · Nigeria Trade Portal',
    auth: {
      nppo: 'Nigeria Agricultural Quarantine Service (NAQS)',
      seed: 'National Agricultural Seeds Council (NASC)',
      fert: 'Federal Ministry of Agriculture & Food Security — National Fertilizer Quality Control (Act 2019)',
      pest: 'National Agency for Food & Drug Administration & Control (NAFDAC)',
      biosafety: 'National Biosafety Management Agency (NBMA)',
      standards: 'Standards Organisation of Nigeria (SON)', customs: 'Nigeria Customs Service',
    },
    conformity: { scheme: 'SONCAP — Product Certificate + SONCAP Certificate (SC)', body: 'Standards Organisation of Nigeria (SON) via accredited agents', scope: ['machinery', 'irrigation', 'fertilizers'] },
    gmo: 'regulated', gmoNote: 'NBMA has approved several GM crops (e.g., Bt cowpea, TELA maize). Non-GM seed may still need an NBMA attestation.',
    importDeclaration: { name: 'Form M (+ PAAR)', system: 'Nigeria Customs / authorized dealer bank', note: 'Importer registers Form M before shipment; Pre-Arrival Assessment Report issued by Customs.' },
    seedPermitName: 'NAQS Plant Import Permit',
    seedRegistrar: { name: 'NASC', permit: 'NASC Seed Import Permit', registration: 'National Crop Varieties Register (NACGRAB/NASC) or ECOWAS COAFEV catalogue' },
    notes: ['FAIRS (2026): NAQS Plant Import Permit valid six months for fruits/vegetables, one year for others; requires PSC.'],
  },
  {
    id: 'GH', name: 'Ghana', region: 'West Africa', blocs: ['ECOWAS'], depth: 'profiled',
    ports: ['Tema', 'Takoradi', 'Kotoka Intl. Accra (Air)'],
    singleWindow: 'Integrated Customs Management System (ICUMS)',
    auth: {
      nppo: 'Plant Protection & Regulatory Services Directorate (PPRSD), MoFA',
      seed: 'PPRSD Seed Inspection Division · National Seed Council (Plants and Fertilizer Act, 2010 — Act 803)',
      fert: 'PPRSD — Fertilizer Registration (Act 803)',
      pest: 'Environmental Protection Authority (EPA) — Pesticide Registration',
      biosafety: 'National Biosafety Authority (NBA Ghana)',
      standards: 'Ghana Standards Authority (GSA)', customs: 'Ghana Revenue Authority — Customs',
    },
    conformity: { scheme: 'GSA import inspection & conformity assessment (high-risk goods)', body: 'Ghana Standards Authority', scope: ['machinery', 'irrigation'] },
    gmo: 'regulated', gmoNote: 'NBA Ghana has approved Bt cowpea and other events; GM material requires an NBA permit.',
    seedPermitName: 'PPRSD Plant Import Permit',
    seedRegistrar: { name: 'PPRSD / National Seed Council', permit: 'PPRSD Seed Import Permit', registration: 'National Variety Release Register or ECOWAS COAFEV catalogue' },
    notes: ['FAIRS (2026): Ghana does not accept supplier/manufacturer self-declarations; each shipment needs its own original certificate.', 'Only registered corporate entities may import (Registrar General’s Department).'],
  },
  {
    id: 'SN', name: 'Senegal', region: 'West Africa', blocs: ['ECOWAS', 'UEMOA', 'CILSS'], depth: 'profiled',
    ports: ['Port Autonome de Dakar', 'Blaise Diagne Intl. (Air)'],
    singleWindow: 'ORBUS — Guichet Unique (GAINDE)',
    auth: {
      nppo: 'Direction de la Protection des Végétaux (DPV)',
      seed: 'Division des Semences (DISEM), Ministère de l’Agriculture',
      fert: 'Ministère de l’Agriculture — Direction de l’Agriculture',
      pest: 'Comité Sahélien des Pesticides (CSP, CILSS) + DPV import authorization',
      biosafety: 'Autorité Nationale de Biosécurité (ANB)',
      standards: 'Association Sénégalaise de Normalisation (ASN)',
    },
    gmo: 'strict',
    seedPermitName: 'DPV Permis d’importation phytosanitaire',
    seedRegistrar: { name: 'DISEM', permit: 'DISEM seed import authorization', registration: 'Catalogue national or ECOWAS/UEMOA COAFEV catalogue' },
    notes: ['The Senegal FAIRS PDF could not be read automatically; this profile draws on published regulations.'],
  },
  {
    id: 'CI', name: 'Côte d\'Ivoire', region: 'West Africa', blocs: ['ECOWAS', 'UEMOA', 'CILSS'], depth: 'profiled',
    ports: ['Port Autonome d’Abidjan', 'San-Pédro', 'Félix-Houphouët-Boigny Intl. (Air)'],
    singleWindow: 'Guichet Unique du Commerce Extérieur (GUCE-CI)',
    auth: { nppo: 'Direction de la Protection des Végétaux, du Contrôle et de la Qualité (DPVCQ)', seed: 'DPVCQ — Contrôle des semences', pest: 'CSP (CILSS) + Comité National des Pesticides', fert: 'Ministère de l’Agriculture — DPVCQ', standards: 'CODINORM' },
    conformity: { scheme: 'Verification of Conformity (VoC) programme', body: 'Ministère du Commerce / CODINORM via appointed agents', scope: ['machinery', 'irrigation'] },
    gmo: 'strict',
    seedPermitName: 'DPVCQ Phytosanitary Import Permit',
  },
  {
    id: 'TG', name: 'Togo', region: 'West Africa', blocs: ['ECOWAS', 'UEMOA', 'CILSS'], depth: 'bloc',
    ports: ['Port Autonome de Lomé', 'Lomé–Tokoin (Air)'], singleWindow: 'SEGUCE Togo',
    auth: { nppo: 'Direction de la Protection des Végétaux (DPV)', pest: 'CSP (CILSS) + DPV' },
  },
  {
    id: 'BJ', name: 'Benin', region: 'West Africa', blocs: ['ECOWAS', 'UEMOA', 'CILSS'], depth: 'bloc',
    ports: ['Port Autonome de Cotonou', 'Cadjehoun (Air)'], singleWindow: 'Guichet Unique du Commerce Extérieur (GUCE Bénin)',
    auth: { nppo: 'Direction de la Production Végétale / ABSSA — Plant Protection', pest: 'CSP (CILSS) + national authorization' },
  },
  {
    id: 'ML', name: 'Mali', region: 'West Africa', blocs: ['UEMOA', 'CILSS', 'AES'], depth: 'bloc',
    ports: ['Bamako–Sénou (Air)', 'via Dakar / Abidjan (Road/Rail)'],
    auth: { nppo: 'Office de Protection des Végétaux (OPV) / Direction Nationale de l’Agriculture', pest: 'CSP (CILSS)' },
    alerts: [{ level: 'info', text: 'Left ECOWAS in January 2025 (AES). UEMOA seed rules and CILSS pesticide registration still apply.' }],
  },
  {
    id: 'BF', name: 'Burkina Faso', region: 'West Africa', blocs: ['UEMOA', 'CILSS', 'AES'], depth: 'bloc',
    ports: ['Ouagadougou (Air)', 'via Abidjan / Lomé / Tema (Road)'],
    auth: { nppo: 'Direction de la Protection des Végétaux et du Conditionnement (DPVC)', pest: 'CSP (CILSS)' },
    alerts: [{ level: 'info', text: 'Left ECOWAS in January 2025 (AES). UEMOA and CILSS frameworks still apply.' }],
  },
  {
    id: 'NE', name: 'Niger', region: 'West Africa', blocs: ['UEMOA', 'CILSS', 'AES'], depth: 'bloc',
    ports: ['Niamey Diori Hamani (Air)', 'via Cotonou / Lomé (Road)'],
    auth: { nppo: 'Direction Générale de la Protection des Végétaux (DGPV)', pest: 'CSP (CILSS)' },
    alerts: [{ level: 'info', text: 'Left ECOWAS in January 2025 (AES). UEMOA and CILSS frameworks still apply.' }],
  },
  { id: 'GN', name: 'Guinea', region: 'West Africa', blocs: ['ECOWAS', 'CILSS'], depth: 'bloc', ports: ['Port Autonome de Conakry', 'Conakry Gbessia (Air)'], auth: { nppo: 'Direction Nationale de la Protection des Végétaux et des Denrées Stockées', pest: 'CSP (CILSS)' } },
  { id: 'SL', name: 'Sierra Leone', region: 'West Africa', blocs: ['ECOWAS'], depth: 'bloc', ports: ['Queen Elizabeth II Quay, Freetown', 'Lungi Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture & Food Security — Crop Protection Directorate' } },
  { id: 'LR', name: 'Liberia', region: 'West Africa', blocs: ['ECOWAS'], depth: 'bloc', ports: ['Freeport of Monrovia', 'Roberts Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Plant Quarantine / LACRA' } },
  { id: 'GW', name: 'Guinea-Bissau', region: 'West Africa', blocs: ['ECOWAS', 'UEMOA', 'CILSS'], depth: 'bloc', ports: ['Port of Bissau', 'Osvaldo Vieira Intl. (Air)'], auth: { nppo: 'Direcção de Serviços de Protecção Vegetal', pest: 'CSP (CILSS)' } },
  { id: 'GM', name: 'Gambia', region: 'West Africa', blocs: ['ECOWAS', 'CILSS'], depth: 'bloc', ports: ['Port of Banjul', 'Banjul Intl. (Air)'], auth: { nppo: 'Department of Agriculture — Plant Protection Services', pest: 'CSP (CILSS) + National Environment Agency' } },
  { id: 'MR', name: 'Mauritania', region: 'West Africa', blocs: ['CILSS', 'AMU'], depth: 'bloc', ports: ['Port Autonome de Nouakchott', 'Nouadhibou', 'Nouakchott–Oumtounsy (Air)'], auth: { nppo: 'Ministère de l’Agriculture — Direction de la Protection des Végétaux', pest: 'CSP (CILSS)' } },
  { id: 'CV', name: 'Cape Verde', region: 'West Africa', blocs: ['ECOWAS', 'CILSS'], depth: 'bloc', ports: ['Porto da Praia', 'Porto Grande (Mindelo)', 'Nelson Mandela Intl. (Air)'], auth: { nppo: 'Ministério da Agricultura e Ambiente — Sanidade Vegetal', pest: 'CSP (CILSS)' } },
  // ───────────── Central Africa ─────────────
  {
    id: 'CM', name: 'Cameroon', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS'], depth: 'bloc',
    ports: ['Port Autonome de Douala', 'Kribi Deep Sea Port', 'Douala Intl. (Air)'], singleWindow: 'Guichet Unique du Commerce Extérieur (GUCE Cameroun)',
    auth: { nppo: 'MINADER — Direction de la Réglementation et du Contrôle de Qualité des Intrants et Produits Agricoles', pest: 'CPAC (CEMAC) + Commission Nationale d’Homologation', standards: 'Agence des Normes et de la Qualité (ANOR)' },
    conformity: { scheme: 'PECAE — Programme d’Évaluation de la Conformité avant Embarquement', body: 'ANOR via appointed inspection agents', scope: ['machinery', 'irrigation', 'fertilizers', 'agrochem'] },
  },
  { id: 'TD', name: 'Chad', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS', 'CILSS'], depth: 'bloc', ports: ['via Douala (Road/Rail)', 'N’Djamena Intl. (Air)'], auth: { nppo: 'Direction de la Protection des Végétaux et du Conditionnement', pest: 'CPAC (CEMAC) or CSP (CILSS)' } },
  { id: 'CF', name: 'Central African Republic', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS'], depth: 'indicative', ports: ['via Douala (Road)', 'Bangui M’Poko (Air)'], auth: { nppo: 'Ministère de l’Agriculture — Service de Protection des Végétaux', pest: 'CPAC (CEMAC)' } },
  { id: 'CG', name: 'Republic of Congo', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS'], depth: 'bloc', ports: ['Port Autonome de Pointe-Noire', 'Maya-Maya Brazzaville (Air)'], auth: { nppo: 'Ministère de l’Agriculture — Direction de la Protection des Végétaux', pest: 'CPAC (CEMAC)' } },
  { id: 'GA', name: 'Gabon', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS'], depth: 'bloc', ports: ['Owendo (Libreville)', 'Port-Gentil', 'Léon-Mba Intl. (Air)'], auth: { nppo: 'AGASA — Agence Gabonaise de Sécurité Alimentaire', pest: 'CPAC (CEMAC)' } },
  { id: 'GQ', name: 'Equatorial Guinea', region: 'Central Africa', blocs: ['CEMAC', 'ECCAS'], depth: 'indicative', ports: ['Malabo', 'Bata', 'Malabo Intl. (Air)'], auth: { nppo: 'Ministerio de Agricultura — Sanidad Vegetal', pest: 'CPAC (CEMAC)' } },
  { id: 'ST', name: 'São Tomé & Príncipe', region: 'Central Africa', blocs: ['ECCAS'], depth: 'indicative', ports: ['Port of São Tomé', 'São Tomé Intl. (Air)'], auth: { nppo: 'Direcção da Agricultura — Sanidade Vegetal' } },
  {
    id: 'CD', name: 'DR Congo', region: 'Central Africa', blocs: ['EAC', 'SADC', 'COMESA', 'ECCAS'], depth: 'bloc',
    ports: ['Matadi', 'Kinshasa N’djili (Air)', 'Kasumbalesa (Road, via Durban/Dar)', 'Goma (Road, via Mombasa)'],
    auth: { nppo: 'Ministère de l’Agriculture — Direction de la Protection des Végétaux', seed: 'Service National des Semences (SENASEM)', standards: 'Office Congolais de Contrôle (OCC)' },
    conformity: { scheme: 'OCC import inspection & conformity certificate', body: 'Office Congolais de Contrôle (OCC)', scope: ['machinery', 'irrigation', 'fertilizers'] },
  },
  // ───────────── Southern Africa ─────────────
  {
    id: 'ZA', name: 'South Africa', region: 'Southern Africa', blocs: ['SADC', 'SACU'], depth: 'profiled',
    ports: ['Durban', 'Cape Town', 'Gqeberha (Port Elizabeth)', 'Ngqura', 'O.R. Tambo Intl. (Air)'],
    singleWindow: 'SARS eFiling Customs',
    auth: {
      nppo: 'Department of Agriculture (DoA) — Directorate Plant Health',
      seed: 'DoA — Variety Control & Seed Certification (Plant Improvement Act)',
      fert: 'Registrar: Act 36 of 1947 (Fertilizers, Farm Feeds, Agricultural Remedies and Stock Remedies Act)',
      pest: 'Registrar: Act 36 of 1947 — Agricultural Remedies (L-number)',
      biosafety: 'GMO Act 15 of 1997 — Registrar & Executive Council',
      standards: 'National Regulator for Compulsory Specifications (NRCS)', customs: 'South African Revenue Service (SARS)',
    },
    gmo: 'permitted', gmoNote: 'GM events are approved under the GMO Act. Each GM import needs a GMO Act permit.',
    seedPermitName: 'Import Permit — Agricultural Pests Act, 1983 (Act 36 of 1983)',
    seedRegistrar: { name: 'DoA Variety Control', permit: 'Covered by the Act 36/1983 import permit', registration: 'South African Variety List (Plant Improvement Act) or SADC Variety Catalogue' },
    notes: ['FAIRS (2026): certificates must be signed before shipment; South Africa does not accept certificates endorsed after shipping.', 'No pre-shipment conformity scheme for agricultural machinery; NRCS Letter of Authority only for compulsory-specification products.'],
  },
  {
    id: 'ZM', name: 'Zambia', region: 'Southern Africa', blocs: ['SADC', 'COMESA'], depth: 'bloc',
    ports: ['Kenneth Kaunda Intl. Lusaka (Air)', 'Nakonde (Road, via Dar es Salaam)', 'Chirundu (Road, via Durban/Beira)'],
    auth: { nppo: 'ZARI — Plant Quarantine and Phytosanitary Service (PQPS)', seed: 'Seed Control and Certification Institute (SCCI)', pest: 'Zambia Environmental Management Agency (ZEMA)', fert: 'Ministry of Agriculture — Fertilizer regulation', biosafety: 'National Biosafety Authority (NBA Zambia)', standards: 'Zambia Compulsory Standards Agency (ZCSA)' },
    gmo: 'strict',
  },
  {
    id: 'ZW', name: 'Zimbabwe', region: 'Southern Africa', blocs: ['SADC', 'COMESA'], depth: 'bloc',
    ports: ['Beitbridge (Road, via Durban)', 'Forbes/Machipanda (Road, via Beira)', 'R.G. Mugabe Intl. Harare (Air)'],
    auth: { nppo: 'Plant Quarantine Services Institute (Dept. of Research & Specialist Services)', seed: 'Seed Services Institute', pest: 'Plant Protection Research Institute — Pesticide Registration', biosafety: 'National Biotechnology Authority of Zimbabwe', standards: 'Standards Association of Zimbabwe' },
    conformity: { scheme: 'Consignment Based Conformity Assessment (CBCA)', body: 'Ministry of Industry & Commerce via appointed agents', scope: ['machinery', 'irrigation', 'fertilizers'] },
    gmo: 'ban', gmoNote: 'Zimbabwe does not permit GE seed for planting.',
  },
  { id: 'MW', name: 'Malawi', region: 'Southern Africa', blocs: ['SADC', 'COMESA'], depth: 'bloc', ports: ['Kamuzu Intl. Lilongwe (Air)', 'Mwanza (Road, via Beira)', 'Mchinji (Road)', 'via Nacala Corridor'], auth: { nppo: 'Department of Agricultural Research Services — Plant Protection', seed: 'Seed Services Unit', pest: 'Pesticides Control Board', standards: 'Malawi Bureau of Standards (MBS)' }, gmo: 'regulated' },
  { id: 'MZ', name: 'Mozambique', region: 'Southern Africa', blocs: ['SADC'], depth: 'bloc', ports: ['Maputo', 'Beira', 'Nacala', 'Maputo Intl. (Air)'], singleWindow: 'Janela Única Electrónica (JUE)', auth: { nppo: 'Ministério da Agricultura — Departamento de Sanidade Vegetal', seed: 'Departamento de Sementes', pest: 'Registo de Pesticidas (Ministério da Agricultura)' } },
  { id: 'BW', name: 'Botswana', region: 'Southern Africa', blocs: ['SADC', 'SACU'], depth: 'bloc', ports: ['Sir Seretse Khama Intl. (Air)', 'Tlokweng / Ramatlabama (Road, via Durban)'], auth: { nppo: 'Ministry of Agriculture — Plant Protection Division', standards: 'Botswana Bureau of Standards (BOBS)' } },
  { id: 'NA', name: 'Namibia', region: 'Southern Africa', blocs: ['SADC', 'SACU'], depth: 'bloc', ports: ['Walvis Bay', 'Hosea Kutako Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Directorate of Plant Health', standards: 'Namibian Standards Institution (NSI)' } },
  { id: 'AO', name: 'Angola', region: 'Southern Africa', blocs: ['SADC', 'ECCAS'], depth: 'bloc', ports: ['Luanda', 'Lobito', 'Namibe', 'Dr. António Agostinho Neto Intl. (Air)'], auth: { nppo: 'Ministério da Agricultura e Florestas — Serviço Nacional de Sanidade Vegetal', seed: 'Serviço Nacional de Sementes (SENSE)' } },
  { id: 'LS', name: 'Lesotho', region: 'Southern Africa', blocs: ['SADC', 'SACU'], depth: 'bloc', ports: ['Maseru Bridge (Road, via Durban)', 'Moshoeshoe I Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Plant Protection' } },
  { id: 'SZ', name: 'Eswatini', region: 'Southern Africa', blocs: ['SADC', 'SACU', 'COMESA'], depth: 'bloc', ports: ['Ngwenya / Oshoek (Road, via Durban)', 'Lomahasha (Road, via Maputo)', 'King Mswati III Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Plant Protection & Quarantine' } },
  { id: 'MG', name: 'Madagascar', region: 'Indian Ocean', blocs: ['SADC', 'COMESA'], depth: 'bloc', ports: ['Toamasina', 'Mahajanga', 'Ivato Antananarivo (Air)'], auth: { nppo: 'Direction de la Protection des Végétaux (DPV)' } },
  {
    id: 'MU', name: 'Mauritius', region: 'Indian Ocean', blocs: ['SADC', 'COMESA'], depth: 'bloc', ports: ['Port Louis', 'SSR Intl. (Air)'],
    auth: { nppo: 'National Plant Protection Office (NPPO), Ministry of Agro-Industry', seed: 'Seed Testing Laboratory, Ministry of Agro-Industry', pest: 'Dangerous Chemicals Control Board' },
    pref: { agreement: 'India–Mauritius CECPA', form: 'CECPA Certificate of Origin' },
  },
  { id: 'SC', name: 'Seychelles', region: 'Indian Ocean', blocs: ['SADC', 'COMESA'], depth: 'bloc', ports: ['Port Victoria', 'Seychelles Intl. (Air)'], auth: { nppo: 'Seychelles Agricultural Agency — Biosecurity Unit' } },
  { id: 'KM', name: 'Comoros', region: 'Indian Ocean', blocs: ['SADC', 'COMESA'], depth: 'indicative', ports: ['Moroni', 'Prince Said Ibrahim Intl. (Air)'], auth: { nppo: 'Ministère de l’Agriculture — Service de Protection des Végétaux' } },
  // ───────────── North Africa ─────────────
  {
    id: 'EG', name: 'Egypt', region: 'North Africa', blocs: ['COMESA', 'GAFTA'], depth: 'profiled',
    ports: ['Alexandria', 'Port Said', 'Damietta', 'Ain Sokhna', 'Cairo Intl. (Air)'],
    singleWindow: 'NAFEZA — National Single Window (ACI)',
    auth: {
      nppo: 'Central Administration of Plant Quarantine (CAPQ)',
      seed: 'Central Administration for Seed Testing & Certification (CASC)',
      fert: 'Ministry of Agriculture & Land Reclamation — Fertilizer Registration',
      pest: 'Agricultural Pesticides Committee (APC)',
      biosafety: 'National Biosafety Committee (MALR)',
      standards: 'General Organization for Export & Import Control (GOEIC)', customs: 'Egyptian Customs Authority',
    },
    conformity: { scheme: 'GOEIC import inspection & release', body: 'General Organization for Export & Import Control (GOEIC)', scope: ['machinery', 'irrigation'] },
    gmo: 'strict',
    importDeclaration: { name: 'Advance Cargo Information (ACI) — ACID number', system: 'NAFEZA / CargoX', note: 'Importer registers the shipment before loading; the 19-digit ACID must appear on the invoice and bill of lading.' },
    seedPermitName: 'CAPQ Import Permit',
    seedRegistrar: { name: 'CASC', permit: 'CASC seed import approval', registration: 'Egyptian variety registration (Variety Registration Committee)' },
    notes: ['The Egypt FAIRS PDF could not be read automatically; this profile draws on published regulations.'],
  },
  { id: 'MA', name: 'Morocco', region: 'North Africa', blocs: ['AMU', 'GAFTA'], depth: 'bloc', ports: ['Casablanca', 'Tanger Med', 'Agadir', 'Mohammed V Intl. (Air)'], singleWindow: 'PortNet', auth: { nppo: 'Office National de Sécurité Sanitaire des Produits Alimentaires (ONSSA)', seed: 'ONSSA — Contrôle des semences', pest: 'ONSSA — Homologation des pesticides', fert: 'ONSSA — Homologation des matières fertilisantes', standards: 'IMANOR' } },
  { id: 'DZ', name: 'Algeria', region: 'North Africa', blocs: ['AMU', 'GAFTA'], depth: 'bloc', ports: ['Algiers', 'Oran', 'Béjaïa', 'Houari Boumediene (Air)'], auth: { nppo: 'Direction de la Protection des Végétaux et des Contrôles Techniques (DPVCT), MADR', seed: 'Centre National de Contrôle et de Certification des Semences et Plants (CNCC)', pest: 'DPVCT — Homologation' }, gmo: 'ban', gmoNote: 'Algeria prohibits import of GE planting material.' },
  { id: 'TN', name: 'Tunisia', region: 'North Africa', blocs: ['AMU', 'COMESA', 'GAFTA'], depth: 'bloc', ports: ['Radès', 'Sfax', 'Bizerte', 'Tunis–Carthage (Air)'], auth: { nppo: 'Direction Générale de la Santé Végétale et du Contrôle des Intrants Agricoles (DGSVCIA)' } },
  { id: 'LY', name: 'Libya', region: 'North Africa', blocs: ['AMU', 'COMESA', 'GAFTA'], depth: 'indicative', ports: ['Tripoli', 'Misrata', 'Benghazi', 'Mitiga (Air)'], auth: { nppo: 'Ministry of Agriculture — National Centre for Plant Protection' }, alerts: [{ level: 'warn', text: 'Fragmented administration; confirm which authority issues permits at the chosen port.' }] },
  // ───────────── South Asia ─────────────
  {
    id: 'BD', name: 'Bangladesh', region: 'South Asia', blocs: ['SAARC', 'BIMSTEC'], depth: 'profiled',
    ports: ['Chattogram', 'Mongla', 'Benapole (Road — Petrapole)', 'Hazrat Shahjalal Intl. (Air)'],
    singleWindow: 'Bangladesh Single Window (BSW)',
    auth: {
      nppo: 'Plant Quarantine Wing, Department of Agricultural Extension (MoA)',
      seed: 'Seed Certification Agency (SCA) · National Seed Board (NSB)',
      fert: 'Ministry of Agriculture — Fertilizer (Management) Act 2006 registration',
      pest: 'Plant Protection Wing, DAE — Pesticide Technical Advisory Committee (PTAC)',
      biosafety: 'National Committee on Biosafety (MoEFCC)',
      standards: 'Bangladesh Standards & Testing Institution (BSTI)', customs: 'National Board of Revenue (NBR)',
    },
    gmo: 'regulated', gmoNote: 'Bt brinjal approved; GM material needs biosafety approval.',
    pref: SAFTA,
    seedPermitName: 'Plant Quarantine Wing Import Permit (IP)',
    seedRegistrar: { name: 'SCA / NSB', permit: 'Covered by PQW Import Permit', registration: 'NSB variety registration (mandatory for notified crops: rice, wheat, jute, potato, sugarcane)' },
    notes: ['FAIRS (2025): Import Permit valid 4–5 months; the IP number and date must appear on the PSC.', 'FAIRS: hybrid rice seed — PSC must state hot-water treatment and approved fungicide treatment.', 'FAIRS: ISPM-15 certificate required for wood packaging.'],
  },
  {
    id: 'NP', name: 'Nepal', region: 'South Asia', blocs: ['SAARC', 'BIMSTEC'], depth: 'bloc',
    ports: ['Birgunj ICD (Raxaul)', 'Biratnagar (Jogbani)', 'Bhairahawa (Sunauli)', 'Tribhuvan Intl. (Air)'],
    auth: { nppo: 'Plant Quarantine & Pesticide Management Centre (PQPMC)', seed: 'Seed Quality Control Centre (SQCC)', pest: 'PQPMC — Pesticide Registration' },
    pref: { agreement: 'India–Nepal Treaty of Trade', form: 'Certificate of Origin under the India–Nepal Treaty of Trade' },
  },
  {
    id: 'LK', name: 'Sri Lanka', region: 'South Asia', blocs: ['SAARC', 'BIMSTEC'], depth: 'bloc',
    ports: ['Colombo', 'Hambantota', 'Bandaranaike Intl. (Air)'],
    auth: { nppo: 'National Plant Quarantine Service (NPQS), Department of Agriculture', seed: 'Seed Certification & Plant Protection Centre (SCPPC)', pest: 'Office of the Registrar of Pesticides', fert: 'National Fertilizer Secretariat', standards: 'Sri Lanka Standards Institution (SLSI)' },
    pref: { agreement: 'India–Sri Lanka Free Trade Agreement (ISFTA)', form: 'ISFTA Certificate of Origin' },
  },
  {
    id: 'PK', name: 'Pakistan', region: 'South Asia', blocs: ['SAARC'], depth: 'bloc', ports: ['Karachi', 'Port Qasim'],
    auth: { nppo: 'Department of Plant Protection (DPP)', seed: 'Federal Seed Certification & Registration Department' },
    alerts: [{ level: 'block', text: 'India–Pakistan trade is suspended. Pakistan halted all trade with India, including via third countries, in April 2025. Confirm current status with DGFT before any shipment.' }],
  },
  {
    id: 'AF', name: 'Afghanistan', region: 'South Asia', blocs: ['SAARC'], depth: 'indicative', ports: ['Kabul Intl. (Air)', 'via Chabahar (Iran) — Road'],
    auth: { nppo: 'Ministry of Agriculture, Irrigation & Livestock — Plant Protection & Quarantine Directorate' },
    pref: { agreement: 'India–Afghanistan Preferential Trade Agreement', form: 'Preferential Certificate of Origin (India–Afghanistan PTA)' },
    alerts: [{ level: 'warn', text: 'Overland transit via Pakistan is unavailable. Use air cargo or the Chabahar route, and screen the payment channel.' }],
  },
  { id: 'MV', name: 'Maldives', region: 'South Asia', blocs: ['SAARC'], depth: 'bloc', ports: ['Malé Commercial Harbour', 'Velana Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture & Animal Welfare — Plant Quarantine' }, pref: SAFTA },
  { id: 'BT', name: 'Bhutan', region: 'South Asia', blocs: ['SAARC', 'BIMSTEC'], depth: 'bloc', ports: ['Phuentsholing (Road — Jaigaon)', 'Samdrup Jongkhar (Road)', 'Paro Intl. (Air)'], auth: { nppo: 'Bhutan Food and Drug Authority (BFDA, formerly BAFRA)', seed: 'National Seed Centre' }, notes: ['India–Bhutan Agreement on Trade, Commerce and Transit: free trade regime.'] },
  // ───────────── Southeast Asia ─────────────
  { id: 'KH', name: 'Cambodia', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'bloc', ports: ['Sihanoukville', 'Phnom Penh Autonomous Port', 'Techo Intl. (Air)'], auth: { nppo: 'General Directorate of Agriculture — Dept. of Plant Protection, Sanitary & Phytosanitary', pest: 'GDA — Agricultural Materials Registration', fert: 'GDA — Agricultural Materials Registration' }, pref: AIFTA },
  { id: 'MM', name: 'Myanmar', region: 'Southeast Asia', blocs: ['ASEAN', 'BIMSTEC'], depth: 'bloc', ports: ['Yangon (Thilawa)', 'Tamu (Road — Moreh)', 'Yangon Intl. (Air)'], singleWindow: 'Myanmar Tradenet 2.0 (import licences)', auth: { nppo: 'Plant Protection Division, Department of Agriculture', seed: 'Seed Division, Department of Agriculture', pest: 'Pesticide Registration Board', fert: 'Fertilizer Committee' }, pref: AIFTA },
  { id: 'LA', name: 'Laos', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'bloc', ports: ['via Laem Chabang (Thailand)', 'Thanaleng Dry Port', 'Wattay Intl. (Air)'], auth: { nppo: 'Department of Agriculture — Plant Protection Centre' }, pref: AIFTA },
  { id: 'TL', name: 'Timor-Leste', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'indicative', ports: ['Tibar Bay Port', 'Presidente Nicolau Lobato (Air)'], auth: { nppo: 'Ministry of Agriculture — Quarantine & Biosecurity' }, notes: ['Joined ASEAN in October 2025; AITIGA preferences not yet extended.'] },
  {
    id: 'VN', name: 'Vietnam', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'profiled',
    ports: ['Hai Phong', 'Cat Lai (Ho Chi Minh City)', 'Cai Mep–Thi Vai', 'Noi Bai Hanoi (Air)', 'Tan Son Nhat (Air)'],
    singleWindow: 'Vietnam National Single Window (VNSW)',
    auth: {
      nppo: 'Department of Crop Production & Plant Protection (PPPD), Ministry of Agriculture & Environment (MAE)',
      seed: 'PPPD — Plant variety recognition for circulation (Law on Crop Production 2018)',
      fert: 'PPPD — Fertilizer recognition for circulation (Decree 84/2019, as amended)',
      pest: 'PPPD — List of pesticides permitted for use in Vietnam',
      biosafety: 'MAE — GMO certificate (Decree 69/2010, as amended)',
      standards: 'Directorate for Standards, Metrology & Quality (STAMEQ)',
    },
    gmo: 'regulated', pref: AIFTA,
    seedPermitName: 'PPPD Plant Quarantine Import Permit (PRA-list articles)',
    seedRegistrar: { name: 'PPPD', permit: 'Variety must be recognized for circulation, or a PPPD import licence for testing', registration: 'Vietnam national list of recognized varieties' },
    notes: ['FAIRS (2026): from January 2026, plant quarantine import permit applications must name the supplier/exporter (MAE Circular 07/2026).', 'FAIRS: no radioactivity attestation required.'],
  },
  {
    id: 'PH', name: 'Philippines', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'bloc',
    ports: ['Manila International Container Port', 'Subic Bay', 'Cebu', 'NAIA Manila (Air)'],
    auth: { nppo: 'Bureau of Plant Industry (BPI) — Plant Quarantine Service', seed: 'BPI — National Seed Industry Council (NSIC) variety registration', pest: 'Fertilizer and Pesticide Authority (FPA)', fert: 'Fertilizer and Pesticide Authority (FPA)', biosafety: 'BPI Biotech Office (Joint Department Circular No. 1, 2021)', standards: 'Bureau of Philippine Standards (BPS)' },
    seedPermitName: 'BPI Sanitary & Phytosanitary Import Clearance (SPSIC)', pref: AIFTA,
    notes: ['Agricultural machinery must be tested by AMTEC and meet PAES under the Agricultural and Fisheries Mechanization (AFMech) Law, RA 10601.'],
  },
  {
    id: 'ID', name: 'Indonesia', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'profiled',
    ports: ['Tanjung Priok (Jakarta)', 'Tanjung Perak (Surabaya)', 'Belawan (Medan)', 'Soekarno–Hatta (Air)'],
    singleWindow: 'Indonesia National Single Window (INSW) · OSS',
    auth: {
      nppo: 'Indonesian Quarantine Authority (Barantin / IQA)',
      seed: 'Ministry of Agriculture — Center for Plant Variety Protection & Agricultural Licensing (PVTPP)',
      fert: 'Ministry of Agriculture — Directorate General of Agricultural Infrastructure & Facilities (fertilizer registration)',
      pest: 'Ministry of Agriculture — Pesticide Commission (registration)',
      biosafety: 'Biosafety Commission for GM Products (KKH PRG)',
      standards: 'National Standardization Agency (BSN) — SNI', customs: 'Directorate General of Customs & Excise',
    },
    gmo: 'regulated', gmoNote: 'FAIRS (2026): a GMO / Non-GMO statement is required for potatoes, soybeans, corn, tomatoes and derivatives.',
    pref: AIFTA,
    seedPermitName: 'MOA Seed Import License (Izin Pemasukan Benih)',
    seedRegistrar: { name: 'MOA PVTPP', permit: 'Seed Import License, valid 6 months; copy to IQA', registration: 'Variety release / registration by MOA' },
    notes: ['FAIRS (2026): PSC — departure within 21 days of issuance (IQA Reg. 14/2024).', 'FAIRS: Prior Notice to IQA required before departure for plant products.'],
  },
  { id: 'TH', name: 'Thailand', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'bloc', ports: ['Laem Chabang', 'Bangkok Port (Khlong Toei)', 'Suvarnabhumi (Air)'], auth: { nppo: 'Department of Agriculture — Plant Quarantine (Office of Agricultural Regulation)', seed: 'Department of Agriculture — Plant Varieties Protection & Seed Act', pest: 'Department of Agriculture — Hazardous Substance Act registration', fert: 'Department of Agriculture — Fertilizer Act registration', standards: 'Thai Industrial Standards Institute (TISI)' }, pref: AIFTA, notes: ['Not in the FAIRS spreadsheet; added as the reporting hub for Laos.'] },
  { id: 'MY', name: 'Malaysia', region: 'Southeast Asia', blocs: ['ASEAN'], depth: 'bloc', ports: ['Port Klang', 'Penang', 'Tanjung Pelepas', 'KLIA (Air)'], auth: { nppo: 'Department of Agriculture — Plant Biosecurity Division (with MAQIS at entry)', pest: 'Pesticides Board (Pesticides Act 1974)', standards: 'SIRIM' }, pref: { agreement: 'India–Malaysia CECA (MICECA) / AITIGA', form: 'MICECA or AIFTA Certificate of Origin' }, notes: ['Not in the FAIRS spreadsheet; added as the reporting hub for Papua New Guinea.'] },
  { id: 'PG', name: 'Papua New Guinea', region: 'Pacific', blocs: [], depth: 'bloc', ports: ['Port Moresby', 'Lae', 'Jacksons Intl. (Air)'], auth: { nppo: 'National Agriculture Quarantine & Inspection Authority (NAQIA)' } },
  // ───────────── Middle East & Gulf ─────────────
  {
    id: 'AE', name: 'United Arab Emirates', region: 'Middle East', blocs: ['GCC', 'GAFTA'], depth: 'profiled',
    ports: ['Jebel Ali', 'Khalifa Port (Abu Dhabi)', 'Sharjah (Khalid Port)', 'Dubai Intl. / DWC (Air)'],
    singleWindow: 'Dubai Trade · Advanced Trade & Logistics Platform (ATLP)',
    auth: {
      nppo: 'Ministry of Climate Change & Environment (MOCCAE)',
      seed: 'MOCCAE — Seed & plant import permits', fert: 'MOCCAE — Fertilizer & soil conditioner registration',
      pest: 'MOCCAE — Pesticide registration (GCC unified guide)', biosafety: 'MOCCAE',
      standards: 'Ministry of Industry & Advanced Technology (MoIAT)', customs: 'Federal Authority for Identity, Citizenship, Customs & Port Security',
    },
    gmo: 'regulated', pref: { agreement: 'India–UAE CEPA', form: 'CEPA Certificate of Origin' },
    seedPermitName: 'MOCCAE Import Permit (plants & seeds)',
    seedRegistrar: { name: 'MOCCAE', permit: 'Covered by MOCCAE import permit', registration: 'MOCCAE approval of seed variety/source' },
    notes: ['Not in the FAIRS spreadsheet; added as a priority destination and reporting hub for Afghanistan.'],
  },
  {
    id: 'SA', name: 'Saudi Arabia', region: 'Middle East', blocs: ['GCC', 'GAFTA'], depth: 'profiled',
    ports: ['Jeddah Islamic Port', 'King Abdulaziz Port (Dammam)', 'King Abdulaziz Intl. (Air)', 'Riyadh Dry Port'],
    singleWindow: 'FASAH', auth: {
      nppo: 'Ministry of Environment, Water & Agriculture (MEWA)', seed: 'MEWA — Seed import approval',
      fert: 'MEWA — Fertilizer registration', pest: 'MEWA — Pesticide registration (GCC unified guide)',
      biosafety: 'MEWA / SFDA', standards: 'Saudi Standards, Metrology & Quality Org. (SASO)', customs: 'ZATCA',
    },
    conformity: { scheme: 'SABER — Product Certificate of Conformity (PCoC) + Shipment Certificate (SC)', body: 'SASO via SABER-registered conformity bodies', scope: ['machinery', 'irrigation', 'fertilizers'] },
    gmo: 'strict', gmoNote: 'Cultivation of GE crops is not permitted; GE planting seed is effectively not importable. Verify with MEWA.',
    seedPermitName: 'MEWA Plant Import Permit',
    notes: ['Not in the FAIRS spreadsheet; added as a priority destination and reporting hub for Yemen.'],
  },
  { id: 'YE', name: 'Yemen', region: 'Middle East', blocs: ['GAFTA'], depth: 'indicative', ports: ['Aden', 'Mukalla', 'Hodeidah'], auth: { nppo: 'Ministry of Agriculture & Irrigation — General Directorate of Plant Protection' }, alerts: [{ level: 'warn', text: 'Conflict affects port access, Red Sea routing and payments. Confirm the receiving authority for the chosen port.' }] },
  { id: 'IQ', name: 'Iraq', region: 'Middle East', blocs: ['GAFTA'], depth: 'bloc', ports: ['Umm Qasr', 'Baghdad Intl. (Air)', 'Erbil Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Plant Protection Directorate', standards: 'Central Organization for Standardization & Quality Control (COSQC)' }, conformity: { scheme: 'Iraq Verification of Conformity (VoC) — Certificate of Conformity', body: 'COSQC via appointed agents', scope: ['machinery', 'irrigation', 'fertilizers'] } },
  { id: 'SY', name: 'Syria', region: 'Middle East', blocs: ['GAFTA'], depth: 'indicative', ports: ['Latakia', 'Tartus', 'Damascus Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture & Agrarian Reform — Plant Protection Directorate' }, alerts: [{ level: 'warn', text: 'Screen the consignee and payment channel against current sanctions lists before contracting.' }] },
  { id: 'JO', name: 'Jordan', region: 'Middle East', blocs: ['GAFTA'], depth: 'bloc', ports: ['Aqaba', 'Queen Alia Intl. (Air)'], auth: { nppo: 'Ministry of Agriculture — Plant Protection & Phytosanitary Directorate', pest: 'Ministry of Agriculture — Pesticide Registration', standards: 'Jordan Standards & Metrology Organization (JSMO)' } },
  // ───────────── Central Asia & Caucasus ─────────────
  { id: 'UZ', name: 'Uzbekistan', region: 'Central Asia', blocs: ['CIS'], depth: 'indicative', ports: ['Tashkent Islam Karimov (Air)', 'via Bandar Abbas (Iran) — INSTC Rail/Road'], auth: { nppo: 'Agency for Plant Protection & Quarantine (Ministry of Agriculture)', standards: 'Uzbek Agency for Technical Regulation' }, conformity: { scheme: 'National conformity certificate', body: 'Uzbek Agency for Technical Regulation', scope: ['machinery', 'irrigation'] } },
  { id: 'KG', name: 'Kyrgyzstan', region: 'Central Asia', blocs: ['EAEU', 'CIS'], depth: 'bloc', ports: ['Manas Intl. Bishkek (Air)', 'via Kazakhstan — Rail'], auth: { nppo: 'State Inspectorate for Veterinary & Phytosanitary Safety' }, conformity: { scheme: 'EAEU Declaration / Certificate of Conformity (EAC mark)', body: 'EAEU-accredited conformity body', scope: ['machinery', 'irrigation'] } },
  { id: 'TJ', name: 'Tajikistan', region: 'Central Asia', blocs: ['CIS'], depth: 'indicative', ports: ['Dushanbe Intl. (Air)', 'via Uzbekistan — Rail'], auth: { nppo: 'Main State Inspectorate for Plant Quarantine' } },
  { id: 'TM', name: 'Turkmenistan', region: 'Central Asia', blocs: ['CIS'], depth: 'indicative', ports: ['Turkmenbashi', 'Ashgabat (Air)', 'via Iran — Road'], auth: { nppo: 'State Plant Quarantine Service' } },
  { id: 'AM', name: 'Armenia', region: 'Caucasus', blocs: ['EAEU', 'CIS'], depth: 'bloc', ports: ['Zvartnots Intl. (Air)', 'via Poti (Georgia) — Road', 'via Iran — Road'], auth: { nppo: 'Food Safety Inspection Body (FSIB)' }, conformity: { scheme: 'EAEU Declaration / Certificate of Conformity (EAC mark)', body: 'EAEU-accredited conformity body', scope: ['machinery', 'irrigation'] } },
  { id: 'GE', name: 'Georgia', region: 'Caucasus', blocs: [], depth: 'indicative', ports: ['Poti', 'Batumi', 'Tbilisi Intl. (Air)'], auth: { nppo: 'National Food Agency (NFA)' }, notes: ['EU–Georgia DCFTA: EU-aligned plant health and product rules are being adopted.'] },
  // ───────────── Americas ─────────────
  {
    id: 'BR', name: 'Brazil', region: 'South America', blocs: ['MERCOSUR'], depth: 'profiled',
    ports: ['Santos', 'Paranaguá', 'Itajaí', 'Rio Grande', 'Viracopos (Air)', 'Guarulhos (Air)'],
    singleWindow: 'Portal Único Siscomex (LPCO licences)',
    auth: {
      nppo: 'MAPA — Departamento de Sanidade Vegetal (DSV)',
      seed: 'MAPA — RENASEM (registration of seed importers) & RNC (National Cultivar Registry)',
      fert: 'MAPA — Fertilizer registration (Decree 4,954/2004, as amended)',
      pest: 'MAPA + ANVISA + IBAMA (Pesticides Law 14,785/2023)',
      biosafety: 'CTNBio — National Technical Biosafety Commission',
      standards: 'INMETRO', customs: 'Receita Federal',
    },
    gmo: 'permitted', gmoNote: 'GM events need CTNBio approval.',
    pref: { agreement: 'India–MERCOSUR Preferential Trade Agreement', form: 'India–MERCOSUR PTA Certificate of Origin (listed tariff lines only)' },
    seedPermitName: 'MAPA Import Authorization (LPCO, Siscomex)',
    seedRegistrar: { name: 'MAPA', permit: 'Importer must hold RENASEM registration', registration: 'Cultivar must be in the National Cultivar Registry (RNC)' },
    notes: ['Not in the FAIRS spreadsheet; added as a priority destination.', 'Pest Risk Analysis must exist for the species/origin pair before MAPA authorizes seed import from India.'],
  },
];

const HUB_ALIAS: Record<string, string> = { 'United Arab Emirates (UAE)': 'United Arab Emirates', India: 'India' };
const FAIRS_ALIAS: Record<string, string> = {};

export const COUNTRIES: CountryProfile[] = SEEDS.map((s) => {
  const fairs = FAIRS.find((f) => f.name === s.name || FAIRS_ALIAS[f.name] === s.name);
  return {
    ...s,
    depth: s.depth ?? 'bloc',
    gmo: s.gmo ?? 'regulated',
    auth: { ...gen(s.name), ...s.auth },
    fairs: fairs ? { ...fairs, hub: fairs.hub ? HUB_ALIAS[fairs.hub] ?? fairs.hub : undefined } : undefined,
  };
}).sort((a, b) => a.name.localeCompare(b.name));

export const byId = (id: string) => COUNTRIES.find((c) => c.id === id)!;
export const byName = (n: string) => COUNTRIES.find((c) => c.name === n);

export const flag = (iso2: string) =>
  String.fromCodePoint(...[...iso2.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export const fairsUrl = (c: CountryProfile): { url?: string; via?: CountryProfile; label: string } => {
  if (!c.fairs) return { label: 'Not in FAIRS spreadsheet' };
  if (c.fairs.status === 'own') return { url: c.fairs.exportCertUrl, label: `FAIRS Export Certificate Report ${c.fairs.year}` };
  if (c.fairs.status === 'hub' && c.fairs.hub) {
    const hub = byName(c.fairs.hub);
    if (hub?.fairs?.status === 'own') return { url: hub.fairs.exportCertUrl, via: hub, label: `FAIRS report via ${hub.name} (${hub.fairs.year})` };
    return { via: hub, label: `FAIRS coverage via ${c.fairs.hub}` };
  }
  return { label: 'FAIRS report unavailable' };
};

export const blocMembers = (id: BlocId) => COUNTRIES.filter((c) => c.blocs.includes(id));
