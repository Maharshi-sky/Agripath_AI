import type { Bloc, BlocId } from './types';

/**
 * Regional economic communities and the regulatory instruments they apply per input category.
 * "Managed through" in the FAIRS spreadsheet is a USDA reporting arrangement and is kept separate
 * (see fairs.generated.ts); only the instruments below drive the "same pathway" chips.
 */
export const BLOCS: Record<BlocId, Bloc> = {
  EAC: {
    id: 'EAC', name: 'East African Community',
    members: ['KE', 'UG', 'TZ', 'RW', 'BI', 'SS', 'CD', 'SO'],
    harmonization: {
      plantHealth: { instrument: 'EAC SPS Protocol & EAC Phytosanitary Measures (common import conditions, pest lists)', level: 'standards', effect: 'Partner States apply harmonized phytosanitary import requirements and inspection procedures.' },
      seeds: { instrument: 'EAC Seeds and Plant Varieties Act, 2018 · EAC Gazette variety listing · East African Standards for seed (EAS)', level: 'catalogue', effect: 'A variety released in two Partner States can be listed in the EAC Variety Catalogue and marketed across the Community. Seed classes, labels and certification standards are common.' },
      fertilizers: { instrument: 'East African Standards for fertilizers (EAS) & EAC fertilizer labelling rules', level: 'standards', effect: 'Common quality and labelling standards. Registration and import permits remain national.' },
      agrochem: { instrument: 'EAC Harmonized Guidelines for Registration of Pesticides', level: 'data', effect: 'Efficacy and residue data generated in one Partner State count toward registration in the others.' },
      biologicals: { instrument: 'EAC Guidelines for Biopesticide & Biocontrol Agent Registration', level: 'data', effect: 'Shared dossier format, and data from one Partner State is recognized in the others.' },
      machinery: { instrument: 'East African Standards for agricultural machinery (adopted nationally)', level: 'standards', effect: 'Same standards across the bloc; each state runs its own conformity certificate (PVoC).' },
      irrigation: { instrument: 'East African Standards for plastic pipes & micro-irrigation', level: 'standards', effect: 'Common product standards; national pre-export verification applies.' },
    },
  },
  COMESA: {
    id: 'COMESA', name: 'Common Market for Eastern & Southern Africa',
    members: ['BI', 'KM', 'CD', 'DJ', 'EG', 'ER', 'SZ', 'ET', 'KE', 'LY', 'MG', 'MW', 'MU', 'RW', 'SC', 'SO', 'SD', 'TN', 'UG', 'ZM', 'ZW'],
    harmonization: {
      seeds: { instrument: 'COMESA Seed Trade Harmonization Regulations, 2014 (COMSHIP) · COMESA Variety Catalogue · COMESA seed certificate & label', level: 'catalogue', effect: 'A variety released in two member states enters the COMESA Variety Catalogue and can be traded under COMESA seed certificates and labels.', members: ['BI', 'KE', 'MW', 'RW', 'UG', 'ZM', 'ZW', 'ET', 'EG', 'SD', 'MG', 'SZ', 'MU', 'CD'] },
      plantHealth: { instrument: 'COMESA SPS Regulations & COMESA Green Pass (SPS certification scheme)', level: 'standards', effect: 'Shared SPS procedures for regional trade.' },
    },
  },
  SADC: {
    id: 'SADC', name: 'Southern African Development Community',
    members: ['AO', 'BW', 'KM', 'CD', 'SZ', 'LS', 'MG', 'MW', 'MU', 'MZ', 'NA', 'SC', 'ZA', 'TZ', 'ZM', 'ZW'],
    harmonization: {
      seeds: { instrument: 'SADC Harmonized Seed Regulatory System (HSRS) · SADC Variety Catalogue · SADC Seed Certification & Quality Assurance Scheme', level: 'catalogue', effect: 'A variety released in two member states can be listed in the SADC Variety Catalogue and marketed in all members that have domesticated HSRS, using SADC seed labels and certificates.' },
      plantHealth: { instrument: 'SADC Quarantine & Phytosanitary Measures for Seed', level: 'standards', effect: 'Common phytosanitary rules for seed moving within the region.' },
      agrochem: { instrument: 'SADC Guidelines for Harmonized Pesticide Registration', level: 'data', effect: 'Common dossier format and data sharing. Registration stays national.' },
    },
  },
  SACU: { id: 'SACU', name: 'Southern African Customs Union', members: ['ZA', 'BW', 'NA', 'LS', 'SZ'], note: 'Common external tariff; goods cleared in South Africa may move within SACU.', harmonization: {} },
  ECOWAS: {
    id: 'ECOWAS', name: 'Economic Community of West African States',
    members: ['BJ', 'CV', 'CI', 'GM', 'GH', 'GN', 'GW', 'LR', 'NG', 'SN', 'SL', 'TG'],
    note: 'Mali, Burkina Faso and Niger withdrew from ECOWAS in January 2025 (now AES). They remain in UEMOA and CILSS.',
    harmonization: {
      seeds: { instrument: 'ECOWAS Regulation C/REG.4/05/2008 · West African Catalogue of Plant Species and Varieties (COAFEV)', level: 'catalogue', effect: 'A variety listed in COAFEV can be marketed across member states under harmonized certification and labelling.' },
      agrochem: { instrument: 'ECOWAS Regulation C/REG.3/05/2008 · West African Committee for Pesticide Registration (COAHP)', level: 'single', effect: 'A regional registration covers all member states. In CILSS countries this runs through the Sahelian Pesticide Committee (CSP).' },
      biologicals: { instrument: 'ECOWAS Regulation C/REG.3/05/2008 (biopesticides included)', level: 'single', effect: 'Biopesticides follow the regional pesticide registration route.' },
      fertilizers: { instrument: 'ECOWAS Regulation C/REG.13/12/12 on fertilizer quality control', level: 'standards', effect: 'Harmonized fertilizer quality, labelling and tolerance rules. Registration stays national.' },
    },
  },
  UEMOA: {
    id: 'UEMOA', name: 'West African Economic & Monetary Union',
    members: ['BJ', 'BF', 'CI', 'GW', 'ML', 'NE', 'SN', 'TG'],
    harmonization: {
      seeds: { instrument: 'Regulation No. 03/2009/CM/UEMOA (aligned with ECOWAS C/REG.4/05/2008)', level: 'catalogue', effect: 'The common seed catalogue and certification rules apply across the eight members.' },
      agrochem: { instrument: 'Regulation No. 04/2009/CM/UEMOA on pesticide registration', level: 'single', effect: 'Pesticide registration follows the regional CSP/COAHP model.' },
    },
  },
  CILSS: {
    id: 'CILSS', name: 'CILSS — Sahelian Pesticide Committee (CSP)',
    members: ['BJ', 'BF', 'CV', 'TD', 'CI', 'GM', 'GN', 'GW', 'ML', 'MR', 'NE', 'SN', 'TG'],
    harmonization: {
      agrochem: { instrument: 'Common Regulation for Pesticide Registration in CILSS Member States · Comité Sahélien des Pesticides (CSP)', level: 'single', effect: 'One CSP homologation authorizes sale in all 13 member states. Importers then obtain a national import authorization.' },
      biologicals: { instrument: 'CSP registration of biopesticides', level: 'single', effect: 'Biopesticides are homologated once by the CSP for all members.' },
    },
  },
  CEMAC: {
    id: 'CEMAC', name: 'CEMAC — Inter-State Pesticides Committee of Central Africa (CPAC)',
    members: ['CM', 'CF', 'TD', 'CG', 'GA', 'GQ'],
    harmonization: {
      agrochem: { instrument: 'CEMAC Common Regulation on Pesticide Homologation · Comité Inter-États des Pesticides d’Afrique Centrale (CPAC)', level: 'single', effect: 'One CPAC homologation is valid in all six CEMAC states.' },
      biologicals: { instrument: 'CPAC homologation (biopesticides)', level: 'single', effect: 'Biopesticides follow the single CPAC route.' },
    },
  },
  ECCAS: { id: 'ECCAS', name: 'Economic Community of Central African States', members: ['AO', 'BI', 'CM', 'CF', 'TD', 'CG', 'CD', 'GQ', 'GA', 'ST', 'RW'], harmonization: {} },
  IGAD: { id: 'IGAD', name: 'Intergovernmental Authority on Development', members: ['DJ', 'ER', 'ET', 'KE', 'SO', 'SS', 'SD', 'UG'], harmonization: {} },
  AES: { id: 'AES', name: 'Alliance of Sahel States', members: ['ML', 'BF', 'NE'], harmonization: {} },
  AMU: { id: 'AMU', name: 'Arab Maghreb Union', members: ['DZ', 'LY', 'MR', 'MA', 'TN'], note: 'No operational input-regulation harmonization; each member runs a national pathway.', harmonization: {} },
  GAFTA: { id: 'GAFTA', name: 'Greater Arab Free Trade Area', members: ['EG', 'MA', 'TN', 'LY', 'SD', 'JO', 'IQ', 'SY', 'YE', 'AE', 'SA', 'DZ'], harmonization: {} },
  GCC: {
    id: 'GCC', name: 'Gulf Cooperation Council',
    members: ['AE', 'SA'],
    harmonization: {
      plantHealth: { instrument: 'GCC Common Agricultural Quarantine Law (Plant Quarantine Law of the GCC States)', level: 'standards', effect: 'Common plant quarantine rules, applied by each state’s ministry.' },
      agrochem: { instrument: 'GCC Unified Pesticide Registration Guide (GCC Pesticides Committee)', level: 'data', effect: 'Common registration dossier and evaluation. Each state issues its own registration and import permit.' },
      fertilizers: { instrument: 'GSO fertilizer standards', level: 'standards', effect: 'Common GSO product standards; national registration.' },
      machinery: { instrument: 'GSO technical regulations', level: 'standards', effect: 'Common GSO standards; national conformity programs (e.g., SABER in Saudi Arabia).' },
    },
  },
  ASEAN: {
    id: 'ASEAN', name: 'Association of Southeast Asian Nations',
    members: ['KH', 'MM', 'LA', 'VN', 'PH', 'ID', 'TH', 'MY', 'TL'],
    harmonization: {
      agrochem: { instrument: 'ASEAN harmonized pesticide MRLs & ASEAN guidelines on pesticide registration', level: 'standards', effect: 'Common residue limits and dossier guidance. Registration stays national.' },
      plantHealth: { instrument: 'ASEAN SPS guidelines (APPPC region)', level: 'standards', effect: 'Shared guidelines; import permits remain national.' },
    },
  },
  SAARC: {
    id: 'SAARC', name: 'South Asian Association for Regional Cooperation (SAFTA)',
    members: ['BD', 'BT', 'MV', 'NP', 'PK', 'LK', 'AF'],
    harmonization: {
      seeds: { instrument: 'SAARC Seed Bank Agreement (2011) & SAARC framework for harmonized seed testing/certification', level: 'standards', effect: 'Shared testing protocols. Variety release and import permits stay national.' },
    },
  },
  BIMSTEC: { id: 'BIMSTEC', name: 'Bay of Bengal Initiative (BIMSTEC)', members: ['BD', 'BT', 'MM', 'NP', 'LK'], harmonization: {} },
  EAEU: {
    id: 'EAEU', name: 'Eurasian Economic Union',
    members: ['AM', 'KG'],
    harmonization: {
      plantHealth: { instrument: 'EAEU Unified Quarantine Phytosanitary Requirements (EEC Council Decision No. 157)', level: 'single', effect: 'One set of quarantine requirements across the Union. A consignment cleared into one member moves freely.' },
      machinery: { instrument: 'TR CU 010/2011 (safety of machinery) · TR CU 031/2012 (agricultural tractors & trailers) · EAC mark', level: 'single', effect: 'One EAC Declaration or Certificate of Conformity is valid across the Union.' },
      irrigation: { instrument: 'EAEU technical regulations (EAC conformity declaration where applicable)', level: 'single', effect: 'Union-wide conformity declaration.' },
    },
  },
  CIS: { id: 'CIS', name: 'Commonwealth of Independent States', members: ['UZ', 'TJ', 'TM', 'KG', 'AM'], harmonization: {} },
  MERCOSUR: {
    id: 'MERCOSUR', name: 'MERCOSUR (COSAVE plant protection region)',
    members: ['BR'],
    harmonization: {
      plantHealth: { instrument: 'COSAVE regional phytosanitary standards & MERCOSUR GMC resolutions', level: 'standards', effect: 'Common phytosanitary standards across MERCOSUR.' },
    },
  },
};
