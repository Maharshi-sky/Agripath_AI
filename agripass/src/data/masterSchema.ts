import type { Category, FieldDef, Master, Commodity, CountryProfile } from './types';
import { V, all } from './validators';
import { PORTS_OF_LOADING, SEED_TREATMENTS, INDIAN_STATES, IRRIGATION_STANDARDS } from './standards';

export type MasterSectionId = 'exporter' | 'consignee' | 'shipment' | 'product';

export interface MasterSection { id: MasterSectionId; title: string; blurb: string; fields: FieldDef[] }

export const exporterFields: FieldDef[] = [
  { key: 'exporterName', label: 'Exporter / company name', required: true, placeholder: 'Registered legal name' },
  { key: 'iec', label: 'IEC code', required: true, placeholder: 'AABCD1234E', check: V.iec, hint: 'Importer-Exporter Code issued by DGFT (10 characters).' },
  { key: 'rcmcNo', label: 'APEDA / EPC RCMC no.', required: true, placeholder: 'RCMC/APEDA/0xxxx/2025-26' },
  { key: 'gstin', label: 'GSTIN', placeholder: '27AABCD1234E1Z5', check: V.gstin },
  { key: 'exporterAddress', label: 'Registered address', type: 'textarea', required: true, full: true },
  { key: 'exporterState', label: 'State', type: 'select', options: INDIAN_STATES, required: true },
  { key: 'contactPerson', label: 'Contact person', required: true },
  { key: 'exporterPhone', label: 'Phone', type: 'tel', required: true, check: V.phone, placeholder: '+91 …' },
  { key: 'exporterEmail', label: 'Email', type: 'email', required: true, check: V.email },
];

export const consigneeFields = (dest?: CountryProfile): FieldDef[] => [
  { key: 'consigneeName', label: 'Overseas buyer / consignee', required: true },
  { key: 'consigneeTaxId', label: 'Tax / registration ID', required: true, placeholder: 'e.g. KRA PIN, TIN, VAT no.' },
  { key: 'consigneeAddress', label: 'Physical address', type: 'textarea', required: true, full: true },
  { key: 'consigneeContact', label: 'Consignee contact (phone/email)', placeholder: '+254 … / buyer@…' },
  { key: 'portOfEntry', label: 'Port of entry', type: 'select', options: dest?.ports ?? [], required: true },
  { key: 'notifyParty', label: 'Notify party (if different)', placeholder: 'Clearing agent name' },
];

export const shipmentFields: FieldDef[] = [
  { key: 'originCountry', label: 'Country of origin', required: true, hint: 'Locked to India for this platform.' },
  { key: 'originDistrict', label: 'Place of origin (district, state)', required: true, placeholder: 'e.g. Karimnagar, Telangana', hint: 'Printed on the phytosanitary certificate.' },
  { key: 'portOfLoading', label: 'Port of loading', type: 'select', options: PORTS_OF_LOADING, required: true },
  { key: 'transportMode', label: 'Mode of transport', type: 'select', options: ['Sea — FCL', 'Sea — LCL', 'Air', 'Road', 'Rail'], required: true },
  { key: 'vesselFlight', label: 'Vessel / voyage or flight no.', placeholder: 'MSC ARIA V.512E' },
  { key: 'shipDate', label: 'Expected shipment date', type: 'date', required: true },
  { key: 'packingDetails', label: 'Packing details', required: true, full: true, placeholder: 'e.g. 1,000 × 20 kg laminated HDPE bags, palletized' },
  { key: 'numPackages', label: 'No. of packages', type: 'number', required: true, check: V.positive },
  { key: 'grossWeight', label: 'Gross weight', type: 'number', unit: 'kg', required: true, check: V.positive },
  { key: 'netWeight', label: 'Net weight', type: 'number', unit: 'kg', required: true, check: all(V.positive, V.netLeGross) },
  { key: 'shippingMarks', label: 'Distinguishing marks', placeholder: 'Lot no. / buyer marks / container no.' },
  { key: 'woodPackaging', label: 'Wooden pallets / crates used', type: 'checkbox', hint: 'Triggers ISPM-15 treatment evidence.' },
  { key: 'invoiceNo', label: 'Commercial invoice no.', required: true },
  { key: 'invoiceDate', label: 'Invoice date', type: 'date', required: true, check: V.notFuture },
  { key: 'invoiceValue', label: 'Invoice value', type: 'number', required: true, check: V.positive },
  { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'INR', 'AED', 'GBP', 'KES'], required: true },
  { key: 'incoterm', label: 'Incoterm (2020)', type: 'select', options: ['FOB', 'CFR', 'CIF', 'FCA', 'CPT', 'CIP', 'EXW', 'DAP', 'DDP'], required: true },
];

const common = (c?: Commodity): FieldDef[] => [
  { key: 'productName', label: 'Commercial product name', required: true, full: true },
  { key: 'hsCode', label: 'HS code', required: true, check: V.hs, hint: c?.hsNote },
  { key: 'lotNo', label: 'Lot / batch no.', required: true },
];

export const productFields = (cat: Category, c?: Commodity): FieldDef[] => {
  switch (cat) {
    case 'seeds':
      return [
        ...common(c),
        { key: 'botanicalName', label: 'Botanical name', required: true },
        { key: 'variety', label: 'Variety / hybrid name', required: true },
        { key: 'seedClass', label: 'Seed class', type: 'select', options: ['Certified (C1)', 'Certified (C2)', 'Basic / Foundation', 'Pre-basic', 'Hybrid F1 — truthfully labelled', 'Standard (vegetable)'], required: true },
        { key: 'harvestYear', label: 'Harvest / production season', placeholder: 'Kharif 2025' },
        { key: 'treatment', label: 'Seed treatment chemical', type: 'select', options: SEED_TREATMENTS, required: true },
        { key: 'treatmentDose', label: 'Treatment dose', placeholder: '2.5 g/kg seed' },
        { key: 'nonGmo', label: 'Certified non-GMO lot', type: 'checkbox', hint: 'Unticking signals a GE lot; GE-ban destinations will block.' },
        { key: 'fumigated', label: 'Consignment fumigated before export', type: 'checkbox' },
      ];
    case 'fertilizers':
      return [
        ...common(c),
        { key: 'composition', label: 'Declared composition / grade', required: true, full: true },
        { key: 'physicalForm', label: 'Physical form', required: true },
        { key: 'mfgDate', label: 'Manufacturing date', type: 'date', required: true, check: V.notFuture },
        { key: 'unNumber', label: 'UN number (if dangerous goods)', check: V.un },
      ];
    case 'agrochem':
      return [
        ...common(c),
        { key: 'activeIngredient', label: 'Active ingredient (ISO common name)', required: true },
        { key: 'aiContent', label: 'A.i. content', required: true },
        { key: 'formulation', label: 'Formulation type', required: true },
        { key: 'unNumber', label: 'UN number', check: V.un },
        { key: 'hazardClass', label: 'Hazard class', type: 'select', options: ['', '3', '6.1', '8', '9'] },
        { key: 'packingGroup', label: 'Packing group', type: 'select', options: ['', 'I', 'II', 'III'] },
        { key: 'mfgDate', label: 'Manufacturing date', type: 'date', required: true, check: V.notFuture },
        { key: 'expiryDate', label: 'Expiry date', type: 'date', required: true, check: V.after('mfgDate', 'manufacturing date') },
      ];
    case 'biologicals':
      return [
        ...common(c),
        { key: 'bioType', label: 'Product type', type: 'select', options: ['biopesticide', 'biofertilizer', 'biostimulant'], required: true },
        { key: 'organism', label: 'Organism (scientific name)', required: true },
        { key: 'strainCode', label: 'Strain code / accession', required: true, placeholder: 'e.g. NAIMCC-F-0xxxx' },
        { key: 'aiContent', label: 'Viable count / content', required: true },
        { key: 'formulation', label: 'Formulation / carrier', required: true },
        { key: 'mfgDate', label: 'Manufacturing date', type: 'date', required: true, check: V.notFuture },
        { key: 'expiryDate', label: 'Expiry date', type: 'date', required: true, check: V.after('mfgDate', 'manufacturing date') },
        { key: 'nonGmo', label: 'Non-genetically modified strain', type: 'checkbox' },
      ];
    case 'machinery':
      return [
        ...common(c),
        { key: 'make', label: 'Make / brand', required: true },
        { key: 'model', label: 'Model', required: true },
        { key: 'serialNos', label: 'Serial / chassis nos.', required: true, full: true },
        { key: 'engineNos', label: 'Engine nos.' },
        { key: 'powerRating', label: 'Power rating', required: true, placeholder: '45 HP (33.6 kW)' },
        { key: 'yearOfMfg', label: 'Year of manufacture', type: 'number', required: true },
        { key: 'condition', label: 'Condition', type: 'select', options: ['New', 'Used / refurbished'], required: true },
      ];
    case 'irrigation':
      return [
        ...common(c),
        { key: 'materialGrade', label: 'Material grade', required: true },
        { key: 'dimensions', label: 'Size / dimensions', required: true, placeholder: '16 mm OD × 1.2 mm wall' },
        { key: 'pressureRating', label: 'Pressure rating', required: true, placeholder: '2.5 kg/cm² (PN 2.5)' },
        { key: 'flowRate', label: 'Nominal flow rate', placeholder: '4 l/h @ 1 bar' },
        { key: 'applicableStandard', label: 'Applicable standard', type: 'select', options: IRRIGATION_STANDARDS, required: true },
      ];
  }
};

export const masterSections = (cat: Category, c?: Commodity, dest?: CountryProfile): MasterSection[] => [
  { id: 'exporter', title: 'Exporter', blurb: 'Your company. Saved as a profile and reused on every shipment.', fields: exporterFields },
  { id: 'consignee', title: 'Consignee / importer', blurb: 'Overseas buyer and entry point.', fields: consigneeFields(dest) },
  { id: 'shipment', title: 'Consignment & shipment', blurb: 'Ports, packing, weights and invoice.', fields: shipmentFields },
  { id: 'product', title: 'Product specifics', blurb: 'Category-specific identity of the goods.', fields: productFields(cat, c) },
];

/** Commodity → master defaults (applied on commodity change). */
export const commodityDefaults = (c: Commodity): Master => {
  const m: Master = { productName: c.name, hsCode: c.hs };
  if (c.botanical) m.botanicalName = c.botanical;
  if (c.composition) m.composition = c.composition;
  if (c.form) m.physicalForm = c.form;
  if (c.activeIngredient) m.activeIngredient = c.activeIngredient;
  if (c.aiContent) m.aiContent = c.aiContent;
  if (c.formulation) m.formulation = c.formulation;
  m.unNumber = c.un ?? '';
  m.hazardClass = c.hazardClass ?? '';
  m.packingGroup = c.packingGroup ?? '';
  if (c.bioType) m.bioType = c.bioType;
  if (c.organism) m.organism = c.organism;
  if (c.material) m.materialGrade = c.material;
  if (c.standard) {
    const s = IRRIGATION_STANDARDS.find((x) => c.standard!.split(' / ').some((p) => x.startsWith(p.split(':')[0])));
    if (s) m.applicableStandard = s;
  }
  return m;
};

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d: number) => new Date(Date.now() + d * 864e5).toISOString().slice(0, 10);
const minus = (d: number) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);

/** Clearly-marked example data so the tool opens in a working state. */
export const SAMPLE_MASTER: Master = {
  exporterName: 'Sample: Godavari Agri Seeds Pvt. Ltd.',
  iec: 'AABCG1234K', rcmcNo: 'RCMC/APEDA/04217/2025-26', gstin: '36AABCG1234K1Z8',
  exporterAddress: 'Plot 14, Phase II, IDA Mallapur, Hyderabad 500076, Telangana, India', exporterState: 'Telangana',
  contactPerson: 'R. Sharma (Export Manager)', exporterPhone: '+91 40 4000 1234', exporterEmail: 'exports@example-seeds.in',
  consigneeName: 'Sample: Rift Valley Agro-Dealers Ltd.', consigneeTaxId: 'P051234567X',
  consigneeAddress: 'Enterprise Road, Industrial Area, P.O. Box 00000, Nairobi, Kenya', consigneeContact: '+254 20 000 0000',
  notifyParty: 'Sample: Coastline Clearing & Forwarding',
  originCountry: 'India', originDistrict: 'Karimnagar, Telangana',
  portOfLoading: 'Nhava Sheva (JNPT), Maharashtra', transportMode: 'Sea — FCL', vesselFlight: 'MSC ARIA V.512E', shipDate: plus(12),
  packingDetails: '1,000 × 20 kg laminated HDPE bags, palletized (20 pallets)', numPackages: '1000', grossWeight: '20450', netWeight: '20000',
  shippingMarks: 'GAS/KE/25-118 · Container MSCU 123456-7', woodPackaging: 'true',
  invoiceNo: 'GAS/EXP/2025-26/118', invoiceDate: minus(2), invoiceValue: '52000', currency: 'USD', incoterm: 'CIF',
  lotNo: 'GAS-MZ-2511-07', variety: 'Sample hybrid GAS-HM 525', seedClass: 'Hybrid F1 — truthfully labelled', harvestYear: 'Kharif 2025',
  treatment: 'Thiram + Metalaxyl (dual dressing)', treatmentDose: '3 g/kg + 2 g/kg seed', nonGmo: 'true', fumigated: '',
  mfgDate: minus(40), expiryDate: plus(690), strainCode: 'Sample: NAIMCC-F-0xxxx', make: 'Sample make', model: 'Sample 4510', serialNos: 'Sample SN 0001–0010',
  powerRating: '45 HP (33.6 kW)', yearOfMfg: String(new Date().getFullYear()), condition: 'New', dimensions: '16 mm OD × 1.2 mm wall',
  pressureRating: '2.5 kg/cm² (PN 2.5)', flowRate: '4 l/h @ 1 bar',
};

export const isSampleValue = (v?: string) => !!v && v.startsWith('Sample');
export { today };
