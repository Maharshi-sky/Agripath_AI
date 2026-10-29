import type { Category, Commodity, CountryProfile, DocSpec, FieldDef, Master, Requirement, Panel, Side } from './types';
import { V, all } from './validators';
import { AD_SUGGESTIONS, SEED_STANDARDS, HEAVY_METALS, isPIC } from './standards';
import { BLOCS } from './blocs';
import { fairsUrl } from './countries';

export interface Ctx { country: CountryProfile; category: Category; commodity?: Commodity; master: Master }

// ── field helpers ───────────────────────────────────────────────
const A = (key: string, label: string, from: string, o: Partial<FieldDef> = {}): FieldDef => ({ key, label, from, required: true, ...o });
const AO = (key: string, label: string, from: string, o: Partial<FieldDef> = {}): FieldDef => A(key, label, from, { required: false, ...o });
const K = (key: string, label: string, computed: string, o: Partial<FieldDef> = {}): FieldDef => ({ key, label, computed, ...o });
const M = (key: string, label: string, o: Partial<FieldDef> = {}): FieldDef => ({ key, label, required: true, ...o });
const O = (key: string, label: string, o: Partial<FieldDef> = {}): FieldDef => ({ key, label, required: false, ...o });

const num = (v: string) => Number(String(v ?? '').replace(/,/g, ''));
const dateM = (key: string, label: string, o: Partial<FieldDef> = {}) => M(key, label, { type: 'date', ...o });

const exporterBlock = (): FieldDef[] => [
  A('exporter', 'Exporter', 'exporterName'),
  A('exporterAddr', 'Exporter address', 'exporterAddress', { full: true }),
  A('iec', 'IEC code', 'iec'),
];
const consigneeBlock = (): FieldDef[] => [
  A('consignee', 'Consignee', 'consigneeName'),
  A('consigneeAddr', 'Consignee address', 'consigneeAddress', { full: true }),
];
const transportBlock = (): FieldDef[] => [
  A('pol', 'Port of loading', 'portOfLoading'),
  A('poe', 'Declared point of entry', 'portOfEntry'),
  A('mode', 'Means of conveyance', 'transportMode'),
  AO('vessel', 'Vessel / flight', 'vesselFlight'),
];
const packBlock = (): FieldDef[] => [
  A('packing', 'Number & description of packages', '{numPackages} packages — {packingDetails}', { full: true }),
  AO('marks', 'Distinguishing marks', 'shippingMarks'),
  A('gross', 'Gross weight (kg)', 'grossWeight'),
  A('net', 'Net weight (kg)', 'netWeight'),
];
const destBlock = (c: CountryProfile) => K('destCountry', 'Country of destination', c.name);

const shortAuth = (s?: string) => (s ? (s.match(/\(([A-Z][A-Za-z&]{1,10})\)/)?.[1] ?? s.split(' — ')[0]) : '');
const isFlag = (m: Master, k: string) => m[k] === 'true';
const cityOf = (pol?: string) => (pol ? pol.replace(/^Air Cargo — /, '').split(',')[0].split(' (')[0] : 'port of loading');

function srcFor(c: CountryProfile, fairsBacked: boolean, legal?: string): DocSpec['source'] {
  const f = fairsUrl(c);
  if (fairsBacked && f.url) return { label: f.label, url: f.url };
  return { label: legal ? legal : `Regulatory knowledge base${f.via ? ` · FAIRS hub: ${f.via.name}` : ''} — verify with the authority`, url: f.url };
}

const FAIRS_BACKED: Record<string, string[]> = {
  KE: ['psc', 'importPermit', 'conformity', 'biosafety', 'radiation', 'fumigation'],
  TZ: ['psc', 'importPermit', 'conformity', 'coo'],
  ET: ['psc', 'importPermit', 'coo', 'insurance', 'conformity', 'biosafety'],
  NG: ['psc', 'importPermit'],
  GH: ['psc'],
  ZA: ['psc', 'importPermit'],
  VN: ['psc', 'importPermit'],
  BD: ['psc', 'importPermit', 'ispm15', 'coo', 'fumigation'],
  ID: ['psc', 'seedImport', 'nongmo', 'coo'],
};

interface Base {
  templateId: string; title: string; short: string; panel: Panel; side: Side; issuer: string; portal?: string;
  leadTime: string; leadDays: number; legal?: string; sections: DocSpec['sections'];
}

function make(ctx: Ctx, b: Base, requirement: Requirement, reason: string, extra: Partial<DocSpec> = {}): DocSpec {
  const scoped = b.side === 'destination' || ['conformity', 'importDecl'].includes(b.templateId);
  const backed = FAIRS_BACKED[ctx.country.id]?.includes(b.templateId) ?? false;
  return {
    key: scoped ? `${ctx.country.id}:${b.templateId}` : b.templateId,
    requirement, reason, source: srcFor(ctx.country, backed, backed ? undefined : b.legal), ...b, ...extra,
  };
}

// ═════════════ Templates ═════════════

function psc(ctx: Ctx): Base {
  const { country: c, commodity: k, master: m } = ctx;
  const ads = [...(AD_SUGGESTIONS[k?.crop ?? ''] ?? ['The consignment was inspected and found free from quarantine pests specified by the importing country.', 'The consignment is free from soil and plant debris.'])];
  if (c.id === 'ET') ads.unshift('Plant materials are free from diseases and pests; and plant parts are free from soil.');
  if (c.id === 'KE' && k?.crop === 'wheat') ads.unshift('The wheat seed lot was tested and found free from Tilletia indica (Karnal bunt).');
  const maxDays = c.id === 'ID' ? 21 : c.id === 'NG' ? 14 : 14;
  return {
    templateId: 'psc', title: 'Phytosanitary Certificate', short: 'PSC', panel: 'cert', side: 'india',
    issuer: `NPPO India — Directorate of Plant Protection, Quarantine & Storage · Plant Quarantine Station, ${cityOf(m.portOfLoading)}`,
    portal: 'PQIS (Plant Quarantine Information System) — e-PSC', leadTime: '2–3 working days after inspection', leadDays: 3,
    legal: 'IPPC · ISPM 12 (Phytosanitary certificates)',
    sections: [
      { title: 'Description of consignment', fields: [
        ...exporterBlock().slice(0, 2), ...consigneeBlock(),
        ...packBlock().slice(0, 2),
        A('origin', 'Place of origin', 'originDistrict'),
        A('conveyance', 'Declared means of conveyance', '{transportMode} — {vesselFlight}'),
        A('poe', 'Declared point of entry', 'portOfEntry'),
        A('produce', 'Name of produce and quantity declared', '{productName}, {variety} — {netWeight} kg net (lot {lotNo})', { full: true }),
        A('botanical', 'Botanical name of plants', 'botanicalName'),
        destBlock(c),
      ] },
      { title: 'Additional declaration', fields: [
        M('ad', 'Additional declaration (as required by import permit)', { type: 'textarea', full: true, suggestions: ads, hint: 'Must match the wording on the destination import permit exactly.', check: V.minLen(20) }),
        (c.seedPermitName ? M : O)('permitRef', `Import permit no. quoted on PSC${c.seedPermitName ? ` (${c.seedPermitName})` : ''}`, { hint: c.id === 'BD' ? 'FAIRS: Bangladesh requires the IP number and date on the PSC.' : 'Quote the destination permit number when the permit requires it.' }),
      ] },
      { title: 'Disinfestation and/or disinfection treatment', fields: [
        M('treatType', 'Treatment', { type: 'select', options: ['Seed dressing (chemical)', 'Fumigation', 'Hot-water treatment', 'Heat treatment', 'No treatment'] }),
        AO('chemical', 'Chemical (active ingredient)', 'treatment'),
        AO('concentration', 'Concentration / dose', 'treatmentDose'),
        O('duration', 'Duration and temperature', { placeholder: 'e.g. 24 h at 25 °C' }),
        dateM('treatDate', 'Date of treatment', { check: (v, a) => (v && m.shipDate && new Date(v) > new Date(m.shipDate) ? { level: 'error', msg: 'Treatment must be completed before the shipment date.' } : V.notFuture(v, a)) }),
      ] },
      { title: 'Inspection & application', fields: [
        O('pqisRef', 'PQIS application no.', { placeholder: 'PQIS/EXP/2025/…' }),
        dateM('inspDate', 'Date of inspection', { check: (v) => {
          if (!v || !m.shipDate) return null;
          const gap = (new Date(m.shipDate).getTime() - new Date(v).getTime()) / 864e5;
          if (gap < 0) return { level: 'error', msg: 'Inspection must take place before shipment.' };
          if (gap > maxDays) return { level: 'warn', msg: `Inspection is ${Math.round(gap)} days before shipment; ${c.name} expects issuance within ~${maxDays} days of departure.` };
          return null;
        } }),
        M('inspPlace', 'Place of inspection', { placeholder: 'Exporter’s processing plant / CFS' }),
      ] },
    ],
  };
}

function ista(ctx: Ctx): Base {
  const st = SEED_STANDARDS[ctx.commodity?.crop ?? ''];
  const sumCheck = (_v: string, a: Record<string, string>) => {
    if (a.pure === '' || a.inert === '' || a.other === '' || a.pure == null || a.inert == null || a.other == null) return null;
    const s = num(a.pure) + num(a.inert) + num(a.other);
    return Math.abs(s - 100) > 0.1 ? { level: 'error' as const, msg: `Pure seed + inert matter + other seeds = ${s.toFixed(1)}%; must total 100%.` } : null;
  };
  return {
    templateId: 'ista', title: 'ISTA International Seed Lot Certificate', short: 'ISTA', panel: 'cert', side: 'lab',
    issuer: 'ISTA-accredited seed testing laboratory', leadTime: '7–14 days (germination test period)', leadDays: 14,
    legal: 'ISTA International Rules for Seed Testing',
    sections: [
      { title: 'Seed lot', fields: [
        A('species', 'Species', 'botanicalName'), A('variety', 'Variety', 'variety'), A('lot', 'Seed lot no.', 'lotNo'),
        A('lotWeight', 'Lot weight (kg)', 'netWeight'), A('containers', 'No. of containers', 'numPackages'),
        M('colour', 'Certificate type', { type: 'select', options: ['Orange — lot sampled & tested by the lab', 'Blue — sample only (lab did not sample lot)'], hint: 'Regional catalogue movement and most NSAs expect the Orange certificate.' }),
        M('labName', 'Laboratory name'), M('labCode', 'ISTA accreditation code', { placeholder: 'e.g. INDL0xxx' }),
        dateM('samplingDate', 'Date of sampling', { check: V.notFuture }), dateM('testDate', 'Date tests completed', { check: all(V.notFuture, V.after('samplingDate', 'sampling date')) }),
      ] },
      { title: 'Purity analysis', fields: [
        M('pure', 'Pure seed', { type: 'number', unit: '%', check: all(V.pct, st ? V.min(st.purity, `${st.label} pure seed`) : () => null) }),
        M('inert', 'Inert matter', { type: 'number', unit: '%', check: V.pct }),
        M('other', 'Other seeds', { type: 'number', unit: '%', check: all(V.pct, sumCheck) }),
        O('otherCount', 'Other seeds by number', { placeholder: 'e.g. 0 in 1000 g' }),
      ] },
      { title: 'Germination', fields: [
        M('germ', 'Germination (normal seedlings)', { type: 'number', unit: '%', check: all(V.pct, st ? V.min(st.germ, `${st.label} germination`) : () => null), hint: st ? `Typical certified minimum: ${st.germ}%.` : undefined }),
        O('abnormal', 'Abnormal seedlings', { type: 'number', unit: '%', check: V.pct }),
        O('hard', 'Hard / fresh ungerminated', { type: 'number', unit: '%', check: V.pct }),
        M('method', 'Test method', { type: 'select', options: ['Between paper (BP)', 'Top of paper (TP)', 'Sand (S)', 'Paper + sand (BP/S)'] }),
        M('duration', 'Test duration', { type: 'number', unit: 'days' }),
      ] },
      { title: 'Moisture & other tests', fields: [
        M('moisture', 'Moisture content', { type: 'number', unit: '%', check: all(V.pct, st ? V.max(st.moisture, `${st.label} moisture`) : () => null), hint: st ? `Typical maximum: ${st.moisture}%.` : undefined }),
        M('moistureMethod', 'Moisture method', { type: 'select', options: ['Low constant temperature oven (103 °C, 17 h)', 'High constant temperature oven (130 °C)'] }),
        O('tsw', '1000-seed weight', { type: 'number', unit: 'g' }),
        O('health', 'Seed health test (if requested)', { full: true, placeholder: 'e.g. ToBRFV RT-PCR — not detected' }),
      ] },
    ],
  };
}

function coo(ctx: Ctx): Base {
  const p = ctx.country.pref;
  return {
    templateId: 'coo', title: p ? `Certificate of Origin — ${p.form}` : 'Certificate of Origin (Non-preferential)', short: 'CoO', panel: 'cert', side: 'india',
    issuer: p ? 'Export Inspection Council / designated agency (preferential)' : 'Authorized agency — FIEO / Chamber of Commerce (non-preferential)',
    portal: 'DGFT Common Digital Platform for Certificate of Origin (trade.gov.in)', leadTime: '1 working day', leadDays: 1,
    legal: p ? p.agreement + ' rules of origin' : 'Non-preferential rules of origin (DGFT)',
    sections: [
      { title: 'Parties', fields: [...exporterBlock(), ...consigneeBlock(), destBlock(ctx.country)] },
      { title: 'Transport & goods', fields: [
        ...transportBlock(), ...packBlock().slice(0, 3),
        A('goods', 'Description of goods', '{productName} (lot {lotNo})', { full: true }), A('hs', 'HS code', 'hsCode'),
        A('invoice', 'Invoice no. & date', '{invoiceNo} dated {invoiceDate}'),
      ] },
      { title: 'Origin', fields: [
        K('form', 'Form', p ? p.form : 'Non-preferential Certificate of Origin'),
        p ? M('criterion', 'Origin criterion', { type: 'select', options: ['WO — Wholly obtained', 'CTSH + RVC ≥ 35%', 'RVC ≥ 35%', 'PSR — product-specific rule'], hint: 'Seeds and crops grown in India are wholly obtained (WO).' })
          : K('criterion', 'Origin statement', 'Goods produced / manufactured in India'),
        O('cooRef', 'CoO application ref.'),
        ...(ctx.country.id === 'ET' ? [M('chamberAuth', 'Chamber of Commerce authentication ref.', { hint: 'FAIRS: Ethiopia requires authentication by an authorized Chamber of Commerce.' })] : []),
      ] },
    ],
  };
}

function nongmo(): Base {
  return {
    templateId: 'nongmo', title: 'Non-GMO Certificate / Declaration', short: 'Non-GMO', panel: 'cert', side: 'lab',
    issuer: 'NABL-accredited GMO testing laboratory + exporter declaration', leadTime: '3–5 days (PCR test)', leadDays: 5,
    legal: 'Cartagena Protocol on Biosafety · destination biosafety law',
    sections: [
      { title: 'Lot identity', fields: [A('product', 'Product', 'productName'), A('botanical', 'Botanical name', 'botanicalName'), AO('variety', 'Variety', 'variety'), A('lot', 'Lot no.', 'lotNo'), A('qty', 'Quantity (kg)', 'netWeight')] },
      { title: 'Test result', fields: [
        M('lab', 'Testing laboratory'),
        M('method', 'Method', { type: 'select', options: ['Real-time PCR — 35S/NOS/FMV/bar screening', 'Event-specific real-time PCR', 'Lateral flow strip (protein)'] }),
        M('lod', 'Limit of detection', { type: 'number', unit: '%', placeholder: '0.01' }),
        M('reportNo', 'Test report no.'), dateM('testDate', 'Test date', { check: V.notFuture }),
        M('result', 'Result', { type: 'select', options: ['Not detected (< LOD)', 'Detected'], check: (v) => (v === 'Detected' ? { level: 'error', msg: 'GE material detected — this lot cannot be declared non-GMO.' } : null) }),
        M('declared', 'Exporter declares the lot is not genetically modified', { type: 'checkbox', full: true }),
      ] },
    ],
  };
}

function seedCoA(): Base {
  return {
    templateId: 'seedCoA', title: 'Manufacturer Certificate of Analysis / Genetic Purity Report', short: 'Seed CoA', panel: 'cert', side: 'exporter',
    issuer: 'Exporter’s quality-control laboratory', leadTime: 'In-house; grow-out test 45–60 days if not on file', leadDays: 2,
    sections: [
      { title: 'Lot', fields: [A('product', 'Product', 'productName'), A('variety', 'Variety', 'variety'), A('lot', 'Lot no.', 'lotNo'), A('class', 'Seed class', 'seedClass'), A('treatment', 'Seed treatment', 'treatment')] },
      { title: 'Results', fields: [
        M('genPurity', 'Genetic purity (GOT / SSR markers)', { type: 'number', unit: '%', check: all(V.pct, V.min(98, 'Hybrid genetic purity')) }),
        M('gpMethod', 'Genetic purity method', { type: 'select', options: ['Grow-out test (GOT)', 'SSR molecular markers', 'SNP markers'] }),
        O('physPurity', 'Physical purity', { type: 'number', unit: '%', check: V.pct }),
        O('germ', 'Germination (in-house)', { type: 'number', unit: '%', check: V.pct }),
        M('reportNo', 'Report no.'), dateM('date', 'Date of analysis', { check: V.notFuture }),
        M('analyst', 'Authorized analyst'),
      ] },
    ],
  };
}

function oecd(): Base {
  return {
    templateId: 'oecd', title: 'OECD Seed Scheme Varietal Certificate', short: 'OECD', panel: 'cert', side: 'india',
    issuer: 'National Designated Authority for OECD Seed Schemes (MoA&FW) via State Seed Certification Agency',
    leadTime: 'Season-long field inspection; certificate 3–5 days after final lab test', leadDays: 5, legal: 'OECD Seed Schemes (India participates since 2008)',
    sections: [
      { title: 'Lot', fields: [A('species', 'Species', 'botanicalName'), A('variety', 'Variety', 'variety'), A('lot', 'Lot reference', 'lotNo'), A('weight', 'Declared weight (kg)', 'netWeight')] },
      { title: 'Certification', fields: [
        M('scheme', 'OECD scheme', { type: 'select', options: ['Maize & Sorghum', 'Cereals', 'Grasses & Legumes', 'Crucifers & Other Oil/Fibre Species', 'Vegetables', 'Sugar & Fodder Beet'] }),
        M('category', 'Category', { type: 'select', options: ['Pre-basic', 'Basic', 'Certified — 1st generation', 'Certified — 2nd generation', 'Standard (vegetable)'] }),
        M('oecdRef', 'OECD reference no.'), M('agency', 'Certifying agency', { placeholder: 'State Seed Certification Agency' }),
        O('fieldInsp', 'Field inspection report no.'),
      ] },
    ],
  };
}

function fumigation(ctx: Ctx): Base {
  return {
    templateId: 'fumigation', title: 'Fumigation Certificate', short: 'Fumigation', panel: 'cert', side: 'third-party',
    issuer: 'PPQS-accredited fumigation agency (NSPM)', leadTime: '1–7 days depending on fumigant', leadDays: 4,
    sections: [
      { title: 'Consignment', fields: [A('exporter', 'Exporter', 'exporterName'), A('consignee', 'Consignee', 'consigneeName'), A('goods', 'Commodity', '{productName} — {netWeight} kg'), A('packing', 'Packages', '{numPackages} packages'), AO('marks', 'Marks / container nos.', 'shippingMarks'), A('poe', 'Port of entry', 'portOfEntry'), destBlock(ctx.country)] },
      { title: 'Treatment', fields: [
        M('fumigant', 'Fumigant', { type: 'select', options: ['Methyl bromide (MBr)', 'Aluminium phosphide (ALP / PH₃)'] }),
        M('dosage', 'Dosage', { type: 'number', unit: 'g/m³' }),
        M('exposure', 'Exposure period', { type: 'number', unit: 'hours', check: (v, a) => {
          const min = (a.fumigant ?? '').startsWith('Aluminium') ? 72 : 24;
          return v && num(v) < min ? { level: 'warn', msg: `${(a.fumigant ?? 'Fumigant').split(' (')[0]} normally needs at least ${min} h exposure.` } : null;
        } }),
        M('temp', 'Minimum air temperature', { type: 'number', unit: '°C', check: (v, a) => ((a.fumigant ?? '').startsWith('Methyl') && v && num(v) < 10 ? { level: 'warn', msg: 'MBr below 10 °C needs a higher dose schedule.' } : null) }),
        dateM('date', 'Date of fumigation', { check: V.notFuture }), M('place', 'Place of fumigation'),
        M('accNo', 'Agency accreditation no.', { placeholder: 'e.g. MBR-xxx / ALP-xxx' }),
        M('gasFree', 'Gas-free (TLV) clearance confirmed', { type: 'checkbox' }),
      ] },
    ],
  };
}

function radiation(): Base {
  return {
    templateId: 'radiation', title: 'Radiation / Radioactivity Certificate', short: 'Radiation', panel: 'cert', side: 'lab',
    issuer: 'Accredited radioactivity testing laboratory (for KNRA)', portal: 'KenTrade', leadTime: '2–3 days', leadDays: 3,
    sections: [{ title: 'Test', fields: [A('product', 'Product', 'productName'), A('lot', 'Lot', 'lotNo'), M('lab', 'Laboratory'), M('cs137', 'Cs-137 activity', { type: 'number', unit: 'Bq/kg', check: V.max(50, 'Cs-137') }), M('reportNo', 'Report no.'), dateM('date', 'Date', { check: V.notFuture })] }],
  };
}

function ispm15(): Base {
  return {
    templateId: 'ispm15', title: 'Wood Packaging Treatment Certificate (ISPM 15)', short: 'ISPM 15', panel: 'cert', side: 'third-party',
    issuer: 'PPQS-registered ISPM 15 treatment provider', leadTime: '1–2 days', leadDays: 2, legal: 'IPPC · ISPM 15',
    sections: [{ title: 'Wood packaging', fields: [
      A('marks', 'Consignment marks', '{shippingMarks}', { required: false }),
      M('wpmType', 'Wood packaging items', { placeholder: 'e.g. 20 pallets, 4 crates' }),
      M('treatment', 'Treatment', { type: 'select', options: ['HT — Heat treatment 56 °C / 30 min core', 'MB — Methyl bromide', 'DH — Dielectric heating'] }),
      M('ippcCode', 'IPPC mark registration code', { placeholder: 'IN-xxx' }), dateM('date', 'Treatment date', { check: V.notFuture }),
    ] }],
  };
}

function insurance(ctx: Ctx): Base {
  return {
    templateId: 'insurance', title: 'Marine / Cargo Insurance Certificate', short: 'Insurance', panel: 'cert', side: 'third-party',
    issuer: ctx.country.id === 'ET' ? 'Insurer as required by the importer (Ethiopia: cover placed locally)' : 'Cargo insurer', leadTime: 'Same day', leadDays: 1,
    sections: [{ title: 'Cover', fields: [
      A('assured', 'Assured', 'exporterName'), A('voyage', 'Voyage', '{portOfLoading} → {portOfEntry}'), A('invoice', 'Invoice', '{invoiceNo} — {currency} {invoiceValue}'),
      M('insurer', 'Insurer'), M('policyNo', 'Policy / certificate no.'),
      M('insuredValue', 'Insured value', { type: 'number', check: (v) => (v && ctx.master.invoiceValue && num(v) < num(ctx.master.invoiceValue) * 1.1 ? { level: 'warn', msg: 'Incoterms CIF/CIP require at least 110% of invoice value.' } : null) }),
      M('cover', 'Cover', { type: 'select', options: ['Institute Cargo Clauses (A)', 'Institute Cargo Clauses (B)', 'Institute Cargo Clauses (C)'] }),
      dateM('date', 'Date of issue'),
    ] }],
  };
}

function invoice(ctx: Ctx): Base {
  const d = ctx.country.importDeclaration;
  const ins = ['CIF', 'CIP'].includes(ctx.master.incoterm);
  const frt = ['CIF', 'CFR', 'CPT', 'CIP', 'DAP', 'DDP'].includes(ctx.master.incoterm);
  return {
    templateId: 'invoice', title: 'Commercial Invoice & Packing List', short: 'Invoice/PL', panel: 'permit', side: 'exporter',
    issuer: 'Exporter (signed customs invoice)', leadTime: 'Same day', leadDays: 0,
    sections: [
      { title: 'Parties', fields: [...exporterBlock(), AO('gstin', 'GSTIN', 'gstin'), ...consigneeBlock(), A('taxId', 'Consignee tax ID', 'consigneeTaxId'), AO('notify', 'Notify party', 'notifyParty')] },
      { title: 'Shipment', fields: [A('invNo', 'Invoice no.', 'invoiceNo'), A('invDate', 'Invoice date', 'invoiceDate'), ...transportBlock(), A('incoterm', 'Incoterm', 'incoterm'), A('origin', 'Country of origin', 'originCountry'), destBlock(ctx.country)] },
      { title: 'Goods & packing list', fields: [
        A('goods', 'Description', '{productName} — lot {lotNo}', { full: true }), A('hs', 'HS code', 'hsCode'), ...packBlock(),
        A('value', 'Total value', '{currency} {invoiceValue}'),
        M('unitPrice', 'Unit price', { placeholder: 'e.g. USD 2.60 / kg' }),
        (frt ? M : O)('freight', 'Freight charges', { type: 'number', hint: frt ? `Required under ${ctx.master.incoterm}.` : undefined }),
        (ins ? M : O)('insurance', 'Insurance charges', { type: 'number', hint: ins ? `Required under ${ctx.master.incoterm}.` : undefined }),
      ] },
      { title: 'Commercial terms & declarations', fields: [
        M('po', 'Buyer’s order / contract no.'),
        M('payment', 'Payment terms', { type: 'select', options: ['100% advance (TT)', 'LC at sight', 'LC 60 days', 'Documents against payment (DP)', 'Documents against acceptance (DA 60)', 'Cash against documents (CAD)'] }),
        ...(d ? [M('declRef', `${d.name} no.`, { hint: d.note, check: ctx.country.id === 'EG' ? (v: string) => (v && !/^\d{19}$/.test(v.replace(/\s/g, '')) ? { level: 'error' as const, msg: 'ACID is a 19-digit number.' } : null) : undefined })] : []),
        M('declaration', 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', { type: 'checkbox', full: true }),
      ] },
    ],
  };
}

function shippingBill(ctx: Ctx): Base {
  return {
    templateId: 'shippingBill', title: 'Shipping Bill — Export Declaration (ICEGATE)', short: 'Shipping Bill', panel: 'permit', side: 'india',
    issuer: 'Indian Customs (CBIC) — filed by exporter / customs broker', portal: 'ICEGATE', leadTime: 'Same day; LEO after examination', leadDays: 1,
    legal: 'Customs Act 1962, Sec. 50',
    sections: [
      { title: 'Declaration', fields: [A('exporter', 'Exporter', 'exporterName'), A('iec', 'IEC', 'iec'), AO('gstin', 'GSTIN', 'gstin'), A('pol', 'Port of loading', 'portOfLoading'), destBlock(ctx.country), A('invoice', 'Invoice', '{invoiceNo} — {currency} {invoiceValue} ({incoterm})'), A('hs', 'RITC / HS', 'hsCode'), A('net', 'Net weight (kg)', 'netWeight')] },
      { title: 'Customs particulars', fields: [
        M('adCode', 'AD code (bank)', { placeholder: 'Registered on ICEGATE' }), O('broker', 'Customs broker licence no.'),
        M('scheme', 'Export incentive scheme', { type: 'select', options: ['RoDTEP', 'Duty Drawback', 'RoDTEP + Drawback', 'Advance Authorisation', 'EPCG', 'None'] }),
        O('sbNo', 'Shipping bill no. (after filing)'), O('leo', 'Let Export Order date', { type: 'date' }),
      ] },
    ],
  };
}

function importDecl(ctx: Ctx): Base {
  const d = ctx.country.importDeclaration!;
  return {
    templateId: 'importDecl', title: `${d.name} — ${ctx.country.name}`, short: d.name.split(' (')[0], panel: 'permit', side: 'destination',
    issuer: `Importer via ${d.system}`, portal: d.system, leadTime: '2–5 days (importer-side)', leadDays: 5,
    sections: [{ title: 'Pre-shipment import declaration', fields: [
      A('importer', 'Importer', 'consigneeName'), A('taxId', 'Importer tax ID', 'consigneeTaxId'), A('supplier', 'Supplier', 'exporterName'),
      A('invoice', 'Proforma / invoice', '{invoiceNo} — {currency} {invoiceValue}'), A('hs', 'HS code', 'hsCode'),
      M('declNo', `${d.name} no.`, { check: ctx.country.id === 'EG' ? (v) => (v && !/^\d{19}$/.test(v.replace(/\s/g, '')) ? { level: 'error', msg: 'ACID is a 19-digit number.' } : null) : undefined }),
      dateM('declDate', 'Date registered'), ...(ctx.country.id === 'NG' ? [O('paar', 'PAAR no.')] : []),
    ] }],
  };
}

function importPermit(ctx: Ctx, title?: string): Base {
  const c = ctx.country;
  return {
    templateId: 'importPermit', title: title ?? c.seedPermitName ?? `Plant Import Permit — ${shortAuth(c.auth.nppo) || c.name}`, short: 'Import permit', panel: 'permit', side: 'destination',
    issuer: c.auth.nppo, portal: c.singleWindow, leadTime: '3–10 working days (importer applies)', leadDays: 10,
    sections: [
      { title: 'Permit particulars (from the issued permit)', fields: [
        A('importer', 'Permit holder (importer)', 'consigneeName'), A('importerAddr', 'Importer address', 'consigneeAddress', { full: true }),
        A('exporter', 'Exporter', 'exporterName'), A('origin', 'Country of origin', 'originCountry'),
        A('commodity', 'Commodity', '{productName} ({botanicalName})', { full: true }), AO('variety', 'Variety', 'variety'),
        A('poe', 'Point of entry', 'portOfEntry'), A('mode', 'Mode', 'transportMode'),
      ] },
      { title: 'Permit details', fields: [
        M('permitNo', 'Permit no.'), M('officer', 'Issuing officer / station'),
        dateM('issueDate', 'Date of issue', { check: V.notFuture }),
        dateM('validTo', 'Valid until', { check: (v, a) => V.after('issueDate', 'date of issue')(v, a) ?? (v && ctx.master.shipDate && new Date(v) < new Date(ctx.master.shipDate) ? { level: 'error', msg: 'Permit expires before the expected shipment date.' } : null) }),
        M('maxQty', 'Maximum quantity authorized', { type: 'number', unit: 'kg', check: (v) => (v && ctx.master.netWeight && num(v) < num(ctx.master.netWeight) ? { level: 'error', msg: `Consignment (${ctx.master.netWeight} kg) exceeds the permitted quantity.` } : null) }),
        O('conditions', 'Special conditions / required declarations', { type: 'textarea', full: true, hint: 'Copy the ADs here; they feed the PSC wording.' }),
      ] },
    ],
  };
}

function seedImport(ctx: Ctx): Base {
  const r = ctx.country.seedRegistrar!;
  return {
    templateId: 'seedImport', title: `${r.permit.split(',')[0]}`, short: 'Seed licence', panel: 'permit', side: 'destination',
    issuer: ctx.country.auth.seed ?? r.name, portal: ctx.country.singleWindow, leadTime: '5–15 working days', leadDays: 15,
    sections: [{ title: 'Seed import authorization', fields: [
      A('importer', 'Importer', 'consigneeName'), A('species', 'Species', 'botanicalName'), A('variety', 'Variety', 'variety'), A('qty', 'Quantity (kg)', 'netWeight'),
      M('licNo', 'Permit / licence no.'), dateM('date', 'Date of issue', { check: V.notFuture }),
      dateM('validTo', 'Valid until', { check: (v) => (v && ctx.master.shipDate && new Date(v) < new Date(ctx.master.shipDate) ? { level: 'error', msg: 'Licence expires before shipment.' } : null), hint: ctx.country.id === 'ID' ? 'FAIRS: Indonesian seed import licences are valid 6 months; copy to IQA.' : undefined }),
      M('purpose', 'Purpose', { type: 'select', options: ['Commercial sale', 'National performance / DUS trials', 'Multiplication & re-export'] }),
    ] }],
  };
}

function varietyReg(ctx: Ctx): Base {
  const cats = ctx.country.blocs.map((b) => BLOCS[b]).filter((b) => b.harmonization.seeds?.level === 'catalogue').map((b) => `${b.id} regional catalogue`);
  return {
    templateId: 'varietyReg', title: 'Variety Registration / Catalogue Listing Evidence', short: 'Variety reg.', panel: 'permit', side: 'destination',
    issuer: ctx.country.auth.seed ?? ctx.country.auth.nppo, leadTime: 'Existing listing; new release needs 2+ seasons of NPT/DUS', leadDays: 2,
    sections: [{ title: 'Listing', fields: [
      A('species', 'Species', 'botanicalName'), A('variety', 'Variety', 'variety'),
      M('catalogue', 'Listed in', { type: 'select', options: [`${ctx.country.name} national variety list`, ...cats, 'Not yet listed — NPT/DUS trial permit'], check: (v) => (v?.startsWith('Not yet') ? { level: 'warn', msg: 'Unlisted varieties may enter only as trial seed, in limited quantities.' } : null) }),
      M('regNo', 'Registration / listing no.'), M('releaseYear', 'Year of release', { type: 'number' }),
      M('maintainer', 'Maintainer / breeder'), O('dus', 'DUS / NPT report ref.'),
    ] }],
  };
}

function biosafety(ctx: Ctx): Base {
  return {
    templateId: 'biosafety', title: `Biosafety Clearance — ${shortAuth(ctx.country.auth.biosafety) || 'National Biosafety Authority'}`, short: 'Biosafety', panel: 'permit', side: 'destination',
    issuer: ctx.country.auth.biosafety ?? 'National biosafety authority', leadTime: '2–8 weeks', leadDays: 30,
    legal: 'Cartagena Protocol · national biosafety act',
    sections: [{ title: 'Clearance', fields: [
      A('product', 'Product', 'productName'), A('species', 'Species', 'botanicalName'), AO('variety', 'Variety', 'variety'), A('lot', 'Lot', 'lotNo'),
      K('gmoPolicy', 'Destination GMO policy', ctx.country.gmoNote ?? ctx.country.gmo, { full: true }),
      M('clearNo', 'Application / clearance no.'),
      M('decision', 'Decision type', { type: 'select', options: ['Non-GE confirmation / no-objection', 'GE import approval — contained use', 'GE import approval — commercial release'] }),
      dateM('date', 'Date of decision', { check: V.notFuture }), O('validTo', 'Valid until', { type: 'date' }),
    ] }],
  };
}

function conformity(ctx: Ctx): Base {
  const cf = ctx.country.conformity!;
  const saber = ctx.country.id === 'SA';
  const mach = ctx.category === 'machinery';
  return {
    templateId: 'conformity', title: cf.scheme, short: cf.scheme.split(' —')[0].split(' (')[0], panel: 'cert', side: 'third-party',
    issuer: cf.body, portal: saber ? 'SABER platform' : undefined, leadTime: '5–10 working days (inspection + test review)', leadDays: 10,
    sections: [
      { title: 'Goods', fields: [
        A('exporter', 'Exporter', 'exporterName'), A('importer', 'Importer', 'consigneeName'), A('product', 'Product', 'productName'), A('hs', 'HS code', 'hsCode'),
        ...(mach ? [A('model', 'Make / model', '{make} {model}'), A('serials', 'Serial nos.', 'serialNos', { full: true })] : [A('lot', 'Lot / batch', 'lotNo')]),
        A('invoice', 'Invoice', '{invoiceNo} — {currency} {invoiceValue}'), A('qty', 'Quantity', '{numPackages} packages, {netWeight} kg'),
      ] },
      { title: 'Conformity assessment', fields: [
        M('rfc', saber ? 'Product Certificate (PCoC) no.' : 'Request for Certification (RFC) no.'),
        ...(saber ? [M('sc', 'Shipment Certificate (SC) no.')] : []),
        M('agent', 'Inspection body (in India)', { suggestions: ['Bureau Veritas', 'Intertek', 'SGS', 'TÜV Rheinland', 'Cotecna'] }),
        dateM('inspDate', 'Inspection date', { check: V.notFuture }),
        M('testRefs', 'Test reports submitted', { full: true, placeholder: 'Report nos. and standards' }),
        M('cocNo', 'Certificate of Conformity no.'),
        dateM('validTo', 'CoC valid until', { check: (v) => (v && ctx.master.shipDate && new Date(v) < new Date(ctx.master.shipDate) ? { level: 'error', msg: 'CoC expires before shipment.' } : null), hint: cf.note }),
      ] },
    ],
  };
}

function fertCoA(ctx: Ctx): Base {
  const organic = !!ctx.commodity?.organic;
  return {
    templateId: 'fertCoA', title: 'Certificate of Analysis — Chemical Composition & Heavy Metals', short: 'Fert. CoA', panel: 'cert', side: 'lab',
    issuer: 'NABL-accredited fertilizer testing laboratory (or State Fertilizer Quality Control Lab)', leadTime: '3–5 days', leadDays: 5,
    legal: 'Fertilizer (Control) Order 1985 — methods of analysis',
    sections: [
      { title: 'Sample', fields: [A('product', 'Product', 'productName'), A('grade', 'Declared grade', 'composition', { full: true }), A('batch', 'Batch', 'lotNo'), A('mfg', 'Manufactured', 'mfgDate'), M('lab', 'Laboratory & NABL no.'), M('reportNo', 'Report no.'), dateM('date', 'Date of report', { check: V.notFuture })] },
      { title: 'Nutrients found', fields: [
        O('n', 'Total N', { type: 'number', unit: '%', check: V.pct }), O('p', 'P₂O₅ (water-soluble)', { type: 'number', unit: '%', check: V.pct }), O('k', 'K₂O (water-soluble)', { type: 'number', unit: '%', check: V.pct }),
        ...(organic ? [M('oc', 'Organic carbon', { type: 'number', unit: '%', check: all(V.pct, V.min(12, 'Organic carbon')) })] : []),
        M('moisture', 'Moisture', { type: 'number', unit: '%', check: V.pct }),
        O('ph', 'pH (1:5 / 10% solution)', { type: 'number' }),
        M('verdict', 'Conformity with declared grade', { type: 'select', options: ['Within tolerance of declared grade', 'Out of tolerance'], check: (v) => (v === 'Out of tolerance' ? { level: 'error', msg: 'Lot is out of tolerance; it cannot be exported under the declared grade.' } : null) }),
      ] },
      { title: 'Heavy metals (mg/kg)', fields: HEAVY_METALS.map((h) => M(h.key, h.label, { type: 'number', unit: 'mg/kg', check: V.max(h.max, h.label + ' (FCO ceiling)') })) },
    ],
  };
}

function sds(): Base {
  return {
    templateId: 'sds', title: 'Safety Data Sheet (GHS, 16 sections)', short: 'SDS', panel: 'cert', side: 'exporter',
    issuer: 'Manufacturer / exporter', leadTime: 'On file', leadDays: 0, legal: 'UN GHS Rev. 10 · Section 1–16 format',
    sections: [{ title: 'SDS identification', fields: [
      A('product', 'Product identifier', 'productName'), A('supplier', 'Supplier', 'exporterName'), AO('un', 'UN number', 'unNumber'), AO('class', 'Transport hazard class', 'hazardClass'),
      M('ghs', 'GHS classification', { placeholder: 'e.g. Aquatic Chronic 2 (H411)', suggestions: ['Not classified as hazardous', 'Aquatic Acute 1 / Chronic 1 (H400, H410)', 'Acute Tox. 4 (H302) · Eye Irrit. 2 (H319)', 'Flam. Liq. 3 (H226) · Asp. Tox. 1 (H304)'] }),
      M('signal', 'Signal word', { type: 'select', options: ['Danger', 'Warning', 'None'] }),
      M('revision', 'Revision no.'), dateM('revDate', 'Revision date', { check: (v) => (v && Date.now() - new Date(v).getTime() > 5 * 365 * 864e5 ? { level: 'warn', msg: 'SDS is over 5 years old — review and reissue.' } : null) }),
      M('emergency', '24-h emergency phone', { type: 'tel', check: V.phone }), M('languages', 'Languages supplied', { placeholder: 'English, French' }),
    ] }],
  };
}

function fcoDecl(): Base {
  return {
    templateId: 'fcoDecl', title: 'Manufacturer’s Declaration of Composition & FCO Grade', short: 'FCO decl.', panel: 'cert', side: 'exporter',
    issuer: 'Manufacturer (licensed under FCO 1985)', leadTime: 'Same day', leadDays: 0, legal: 'Fertilizer (Control) Order, 1985',
    sections: [{ title: 'Declaration', fields: [
      A('product', 'Product', 'productName'), A('grade', 'Declared composition', 'composition', { full: true }), A('form', 'Physical form', 'physicalForm'), A('batch', 'Batch', 'lotNo'), A('mfg', 'Manufactured', 'mfgDate'),
      M('fcoRef', 'FCO schedule / grade reference', { full: true, placeholder: 'FCO 1985, Schedule I — 100% water-soluble NPK 19:19:19' }),
      M('licence', 'Manufacturing certificate / State authorisation no.'), M('plant', 'Manufacturing plant location'),
      M('declared', 'The product conforms to the declared composition and is free from prohibited substances.', { type: 'checkbox', full: true }),
    ] }],
  };
}

function regPermit(ctx: Ctx, kind: 'fert' | 'pest' | 'bio'): Base {
  const c = ctx.country;
  const auth = kind === 'fert' ? c.auth.fert : kind === 'pest' ? c.auth.pest : (ctx.master.bioType === 'biopesticide' ? c.auth.pest : c.auth.fert);
  const cilss = c.blocs.includes('CILSS') && (kind !== 'fert');
  const cemac = c.blocs.includes('CEMAC') && (kind !== 'fert');
  const title = cilss ? 'CSP Homologation + National Import Authorization' : cemac ? 'CPAC Homologation + National Import Authorization'
    : `${kind === 'fert' ? 'Fertilizer' : kind === 'pest' ? 'Pesticide' : 'Bio-input'} Registration & Import Permit — ${shortAuth(auth) || c.name}`;
  return {
    templateId: kind === 'fert' ? 'fertReg' : kind === 'pest' ? 'pestReg' : 'bioReg', title, short: 'Registration', panel: 'permit', side: 'destination',
    issuer: cilss ? 'Comité Sahélien des Pesticides (CSP, Bamako) + national authority' : cemac ? 'CPAC (Yaoundé) + national authority' : auth ?? `${c.name} registration authority (Ministry of Agriculture)`,
    portal: c.singleWindow, leadTime: 'Registration: existing (new: 6–24 months) · import permit 5–15 days', leadDays: 15,
    sections: [
      { title: 'Product registration', fields: [
        A('product', 'Registered trade name', 'productName'), ...(kind !== 'fert' ? [A('ai', 'Active ingredient / organism', kind === 'pest' ? '{activeIngredient} {aiContent}' : '{organism}')] : [A('grade', 'Grade', 'composition')]),
        M('regNo', cilss || cemac ? 'Homologation no.' : 'Registration no.'), M('holder', 'Registration holder / local agent'),
        dateM('regValid', 'Registration valid until', { check: V.notPast }),
      ] },
      { title: 'Import permit', fields: [A('importer', 'Importer', 'consigneeName'), A('qty', 'Quantity', '{netWeight} kg'), M('permitNo', 'Import permit no.'), dateM('permitDate', 'Permit date', { check: V.notFuture }), O('labelRef', 'Label approval ref.')] },
    ],
  };
}

function cibrc(bio = false): Base {
  return {
    templateId: 'cibrc', title: bio ? 'CIB&RC Registration — Biopesticide (export)' : 'CIB&RC Registration Certificate / Export Permission', short: 'CIB&RC', panel: 'permit', side: 'india',
    issuer: 'Central Insecticides Board & Registration Committee (CIB&RC), Faridabad', portal: 'CROP (Online Pesticide Registration)',
    leadTime: 'Existing registration; new export-only registration takes months', leadDays: 3, legal: 'Insecticides Act 1968 — Sec. 9(3) / 9(4) · Insecticides Rules 1971',
    sections: [{ title: 'Registration', fields: [
      A('ai', 'Active ingredient', bio ? 'organism' : 'activeIngredient'), A('formulation', 'Formulation', bio ? 'formulation' : '{aiContent} {formulation}'), A('product', 'Product', 'productName'), A('state', 'Licensing state', 'exporterState'),
      M('regNo', 'CIB&RC registration no.', { placeholder: 'CIR-xxxxx/2025-…' }),
      M('section', 'Registration category', { type: 'select', options: ['9(3) — Regular', '9(3) — Export only', '9(4) — Me-too', '9(3B) — Provisional'] }),
      M('mfgLicence', 'State manufacturing licence no.'), O('validity', 'Licence valid until', { type: 'date', check: V.notPast }),
    ] }],
  };
}

function faoCoA(ctx: Ctx): Base {
  const declared = num((ctx.master.aiContent ?? '').match(/[\d.]+/)?.[0] ?? '');
  const tol = declared <= 2.5 ? declared * 0.15 : declared <= 10 ? declared * 0.1 : declared <= 25 ? declared * 0.06 : declared <= 50 ? declared * 0.05 : 2.5;
  return {
    templateId: 'faoCoA', title: 'Certificate of Analysis — FAO/WHO Specification Compliance', short: 'FAO CoA', panel: 'cert', side: 'lab',
    issuer: 'NABL / GLP-certified analytical laboratory', leadTime: '3–7 days', leadDays: 7, legal: 'FAO/WHO Manual on Pesticide Specifications (JMPS)',
    sections: [
      { title: 'Sample', fields: [A('product', 'Product', 'productName'), A('ai', 'Active ingredient', 'activeIngredient'), A('declared', 'Declared content', 'aiContent'), A('batch', 'Batch', 'lotNo'), A('mfg', 'Manufactured', 'mfgDate'), A('exp', 'Expiry', 'expiryDate'), M('lab', 'Laboratory (NABL/GLP no.)'), M('reportNo', 'Report no.'), dateM('date', 'Date', { check: V.notFuture })] },
      { title: 'Results', fields: [
        M('aiFound', 'A.i. content found', { type: 'number', unit: '% w/w', hint: declared ? `FAO tolerance for ${declared}%: ±${tol.toFixed(2)}% → ${(declared - tol).toFixed(2)}–${(declared + tol).toFixed(2)}%.` : undefined,
          check: (v) => (v && declared && Math.abs(num(v) - declared) > tol ? { level: 'error', msg: `Outside FAO tolerance (${(declared - tol).toFixed(2)}–${(declared + tol).toFixed(2)}%).` } : null) }),
        M('faoSpec', 'FAO specification reference', { placeholder: 'e.g. FAO Specification xxx/SC (year)' }),
        O('impurities', 'Relevant impurities', { unit: 'g/kg' }), O('suspensibility', 'Suspensibility', { type: 'number', unit: '%', check: V.min(60, 'Suspensibility') }),
        O('ph', 'pH range'), O('stability', 'Storage stability (54 °C / 14 d)', { placeholder: 'Complies' }),
        M('verdict', 'Conformity', { type: 'select', options: ['Complies with FAO specification', 'Does not comply'], check: (v) => (v === 'Does not comply' ? { level: 'error', msg: 'Non-compliant batch cannot be shipped.' } : null) }),
      ] },
    ],
  };
}

function dgd(ctx: Ctx): Base {
  const air = (ctx.master.transportMode ?? '').startsWith('Air');
  return {
    templateId: 'dgd', title: air ? 'Shipper’s Declaration for Dangerous Goods (IATA DGR)' : 'Dangerous Goods Declaration (IMDG Code)', short: 'DG decl.', panel: 'cert', side: 'exporter',
    issuer: 'Shipper (trained DG signatory)', leadTime: 'Same day; book DG space 5–7 days ahead', leadDays: 1, legal: air ? 'IATA Dangerous Goods Regulations' : 'IMDG Code (Amdt. 42-24)',
    sections: [{ title: 'Dangerous goods', fields: [
      A('un', 'UN number', 'unNumber'), A('class', 'Class', 'hazardClass'), AO('pg', 'Packing group', 'packingGroup'), A('product', 'Trade name', 'productName'), A('pkgs', 'No. & kind of packages', '{numPackages} — {packingDetails}', { full: true }), A('gross', 'Gross mass (kg)', 'grossWeight'), AO('vessel', 'Vessel / flight', 'vesselFlight'),
      M('psn', 'Proper shipping name', { full: true, suggestions: [`ENVIRONMENTALLY HAZARDOUS SUBSTANCE, LIQUID, N.O.S. (${ctx.master.activeIngredient ?? 'a.i.'})`, `ENVIRONMENTALLY HAZARDOUS SUBSTANCE, SOLID, N.O.S. (${ctx.master.activeIngredient ?? 'a.i.'})`, `PESTICIDE, LIQUID, TOXIC, N.O.S. (${ctx.master.activeIngredient ?? 'a.i.'})`] }),
      M('mp', 'Marine pollutant', { type: 'select', options: ['Yes', 'No'] }), O('ems', 'EmS', { placeholder: 'F-A, S-F' }), O('flash', 'Flash point', { unit: '°C' }),
      M('regime', 'Regulation', { type: 'select', options: ['IMDG Code (sea)', 'IATA DGR (air)', 'ADR (road)'], check: (v) => (v && air && !v.startsWith('IATA') ? { level: 'error', msg: 'Air shipments must be declared under IATA DGR.' } : !air && v?.startsWith('IATA') && (ctx.master.transportMode ?? '').startsWith('Sea') ? { level: 'error', msg: 'Sea shipments must be declared under the IMDG Code.' } : null) }),
    ] }],
  };
}

function pic(ctx: Ctx): Base {
  return {
    templateId: 'pic', title: 'Rotterdam Convention — PIC Export Notification', short: 'PIC', panel: 'permit', side: 'india',
    issuer: 'Designated National Authority (Pesticides), Ministry of Agriculture & Farmers Welfare', leadTime: 'Notify ≥ 30 days before first export each year', leadDays: 30,
    legal: 'Rotterdam Convention, Art. 12 & Annex III',
    sections: [{ title: 'Notification', fields: [A('ai', 'Chemical (Annex III)', 'activeIngredient'), K('dest', 'Importing Party', ctx.country.name), M('notifRef', 'Export notification ref.'), dateM('sent', 'Date sent', { check: V.notFuture }), M('response', 'Importing-country import response', { type: 'select', options: ['Consent', 'Consent with conditions', 'No response on file', 'No consent'], check: (v) => (v === 'No consent' ? { level: 'error', msg: 'The importing Party has not consented — export is not permitted.' } : v === 'No response on file' ? { level: 'warn', msg: 'Without an import response, obtain explicit consent before export.' } : null) }), O('consentRef', 'Explicit consent ref.')] }],
  };
}

function label(): Base {
  return {
    templateId: 'label', title: 'Approved Label & Leaflet Specimen', short: 'Label', panel: 'cert', side: 'exporter', issuer: 'Exporter (per destination approval)', leadTime: 'Print run 7–10 days', leadDays: 7,
    sections: [{ title: 'Label', fields: [A('product', 'Product', 'productName'), M('languages', 'Label languages'), O('approval', 'Label approval ref.'), M('phi', 'PHI, REI, antidote & pictograms shown', { type: 'checkbox' })] }],
  };
}

function strainId(): Base {
  return {
    templateId: 'strainId', title: 'Strain Identification Certificate', short: 'Strain ID', panel: 'cert', side: 'lab', issuer: 'Recognized microbial culture collection / accredited lab', leadTime: '7–10 days', leadDays: 10,
    sections: [{ title: 'Identity', fields: [
      A('organism', 'Organism', 'organism'), A('strain', 'Strain code', 'strainCode'),
      M('depository', 'Depository', { type: 'select', options: ['NAIMCC (ICAR-NBAIM, Mau)', 'MTCC (CSIR-IMTECH, Chandigarh)', 'NCIM (CSIR-NCL, Pune)', 'NFCCI (ARI, Pune)', 'Other recognized depository'] }),
      M('accession', 'Accession no.'), M('method', 'Identification method', { type: 'select', options: ['16S rRNA gene sequencing', 'ITS region sequencing', 'Whole-genome sequencing', 'MALDI-TOF MS'] }),
      M('identity', 'Sequence identity to type strain', { type: 'number', unit: '%', check: all(V.pct, V.min(99, 'Sequence identity')) }), O('genbank', 'GenBank accession'),
      M('lab', 'Laboratory'), dateM('date', 'Report date', { check: V.notFuture }),
    ] }],
  };
}

function microCoA(): Base {
  const cfu = (v: string) => {
    if (!v) return null;
    const m = v.replace(/\s/g, '').match(/^([\d.]+)(?:[x×*]10\^?([\d]+)|e(\d+))?$/i);
    return m ? null : { level: 'error' as const, msg: 'Use scientific notation, e.g. 2.1×10^8 or 2.1e8.' };
  };
  return {
    templateId: 'microCoA', title: 'Microbial Purity & Viable Count — Certificate of Analysis', short: 'Micro CoA', panel: 'cert', side: 'lab', issuer: 'NABL-accredited microbiology laboratory', leadTime: '5–7 days', leadDays: 7,
    sections: [{ title: 'Results', fields: [
      A('product', 'Product', 'productName'), A('organism', 'Organism', 'organism'), A('declared', 'Declared count', 'aiContent'), A('batch', 'Batch', 'lotNo'), A('mfg', 'Manufactured', 'mfgDate'), A('exp', 'Expiry', 'expiryDate'),
      M('count', 'Viable count found', { unit: 'CFU/g or /ml', check: cfu }),
      M('contam', 'Contaminants', { type: 'select', options: ['No contamination at 10⁻⁵ dilution', 'Contamination detected'], check: (v) => (v === 'Contamination detected' ? { level: 'error', msg: 'Contaminated batch fails purity — do not ship.' } : null) }),
      M('pathogens', 'Salmonella, E. coli, Shigella, Vibrio: absent', { type: 'checkbox' }),
      O('ph', 'pH', { type: 'number' }), O('moisture', 'Moisture', { type: 'number', unit: '%' }),
      M('lab', 'Laboratory'), M('reportNo', 'Report no.'), dateM('date', 'Date', { check: V.notFuture }),
    ] }],
  };
}

function toxSummary(): Base {
  return {
    templateId: 'toxSummary', title: 'Toxicology & Ecotoxicology Summary', short: 'Tox summary', panel: 'cert', side: 'lab', issuer: 'GLP-compliant toxicology laboratory', leadTime: 'From registration dossier', leadDays: 2,
    sections: [{ title: 'Summary', fields: [
      A('organism', 'Organism / product', '{organism} — {productName}'),
      M('ld50', 'Acute oral LD₅₀ (rat)', { unit: 'mg/kg bw', placeholder: '> 2000' }), O('dermal', 'Acute dermal LD₅₀', { unit: 'mg/kg bw' }),
      M('pathogenicity', 'Mammalian pathogenicity / infectivity', { type: 'select', options: ['Non-pathogenic, non-infective', 'Infective — cleared within study period', 'Pathogenic'], check: (v) => (v === 'Pathogenic' ? { level: 'error', msg: 'Pathogenic strains are not registrable as bio-inputs.' } : null) }),
      O('eco', 'Bees / fish / earthworm findings', { full: true }), M('glp', 'GLP laboratory & study refs.', { full: true }),
    ] }],
  };
}

function nbaIndia(): Base {
  return {
    templateId: 'nbaIndia', title: 'NBA Approval — Biological Diversity Act, 2002', short: 'NBA India', panel: 'permit', side: 'india',
    issuer: 'National Biodiversity Authority, Chennai', leadTime: '30–90 days', leadDays: 60, legal: 'Biological Diversity Act 2002 (amended 2023), Sec. 3 & 4',
    sections: [{ title: 'Access & benefit-sharing', fields: [A('organism', 'Biological resource', '{organism} ({strainCode})'), M('form', 'Application form & ref.'), M('approval', 'Approval / exemption no.'), dateM('date', 'Date', { check: V.notFuture })] }],
  };
}

function fcoBio(ctx: Ctx): Base {
  const stim = ctx.master.bioType === 'biostimulant';
  return {
    templateId: 'fcoBio', title: stim ? 'FCO Schedule VI — Biostimulant Registration (India)' : 'FCO Schedule III — Biofertilizer Manufacturing Certificate (India)', short: 'FCO', panel: 'permit', side: 'india',
    issuer: stim ? 'Department of Agriculture & Farmers Welfare (Central Biostimulant Committee)' : 'State Department of Agriculture (registering authority)', leadTime: 'Existing certificate', leadDays: 2, legal: 'Fertilizer (Control) Order 1985',
    sections: [{ title: 'Certificate', fields: [A('product', 'Product', 'productName'), A('organism', 'Organism / ingredient', 'organism'), A('state', 'State', 'exporterState'), M('certNo', 'Certificate / registration no.'), dateM('validTo', 'Valid until', { check: V.notPast })] }],
  };
}

function psi(): Base {
  return {
    templateId: 'psi', title: 'Pre-Shipment Inspection Certificate', short: 'PSI', panel: 'cert', side: 'third-party', issuer: 'Export Inspection Agency / independent inspection body', leadTime: '2–3 days', leadDays: 3,
    legal: 'Export (Quality Control & Inspection) Act 1963 where notified; otherwise contract requirement',
    sections: [{ title: 'Inspection', fields: [
      A('exporter', 'Exporter', 'exporterName'), A('consignee', 'Consignee', 'consigneeName'), A('product', 'Product', 'productName'), A('model', 'Make / model', '{make} {model}'), A('serials', 'Serial nos.', 'serialNos', { full: true }), A('pkgs', 'Packages', 'numPackages'), A('invoice', 'Invoice', 'invoiceNo'),
      M('agency', 'Inspection agency'), dateM('date', 'Inspection date', { check: V.notFuture }), M('place', 'Place of inspection'),
      M('finding', 'Finding', { type: 'select', options: ['Conforms to contract & standards', 'Conforms — minor observations', 'Does not conform'], check: (v) => (v === 'Does not conform' ? { level: 'error', msg: 'Non-conforming goods cannot be released for export.' } : null) }),
      M('reportNo', 'Report no.'),
    ] }],
  };
}

function machTest(ctx: Ctx): Base {
  const ph = ctx.country.id === 'PH';
  const tractor = ctx.commodity?.machineKind === 'tractor' || ctx.commodity?.machineKind === 'tiller';
  return {
    templateId: 'machTest', title: ph ? 'AMTEC Test & Evaluation Report (PAES)' : tractor ? 'Tractor Test Certificate (CFMTTI Budni / OECD Tractor Codes)' : 'Machinery Test & Performance Report',
    short: 'Test report', panel: 'cert', side: ph ? 'destination' : 'india',
    issuer: ph ? 'Agricultural Machinery Testing & Evaluation Center (AMTEC), UPLB' : tractor ? 'Central Farm Machinery Training & Testing Institute (CFMTTI), Budni' : 'CFMTTI Budni / NRFMTTI Hisar / SRFMTTI Anantapur / NERFMTTI Biswanath Chariali',
    leadTime: 'Existing test report; new test 2–4 months', leadDays: 3, legal: ph ? 'RA 10601 (AFMech Law) · PAES' : 'OECD Standard Codes for Official Testing of Tractors',
    sections: [{ title: 'Test', fields: [
      A('model', 'Make / model', '{make} {model}'), A('power', 'Rated power', 'powerRating'),
      M('reportNo', 'Test report no.'), dateM('date', 'Test date', { check: V.notFuture }),
      M('code', 'Test code', { type: 'select', options: ph ? ['PAES — Philippine Agricultural Engineering Standards'] : ['OECD Code 2 — tractor performance', 'OECD Codes 4/6/7 — ROPS strength', 'Bureau of Indian Standards test code', 'ISO 4254 — safety evaluation', 'RNAM / ANTAM test code'] }),
      O('pto', 'Max. PTO power', { type: 'number', unit: 'kW' }),
      O('noise', 'Noise at operator’s ear', { type: 'number', unit: 'dB(A)', check: V.max(90, 'Operator noise') }),
      ...(tractor ? [M('rops', 'ROPS & seat belt fitted', { type: 'checkbox' })] : []),
    ] }],
  };
}

function machDoC(): Base {
  return {
    templateId: 'machDoC', title: 'Manufacturer’s Declaration of Conformity (Safety)', short: 'DoC', panel: 'cert', side: 'exporter', issuer: 'Manufacturer', leadTime: 'Same day', leadDays: 0,
    sections: [{ title: 'Declaration', fields: [
      A('model', 'Make / model', '{make} {model}'), A('serials', 'Serial nos.', 'serialNos', { full: true }), A('year', 'Year of manufacture', 'yearOfMfg'),
      M('standards', 'Standards applied', { full: true, suggestions: ['ISO 4254-1:2013 — Agricultural machinery: safety', 'ISO 26322-1:2008 — Tractors: safety', 'ISO 12100:2010 — Risk assessment', 'ISO 3600 — Operator’s manuals'] }),
      M('manualLang', 'Operator manual languages'), M('signatory', 'Authorized signatory'), dateM('date', 'Date'),
      M('declared', 'The machinery described conforms to the standards listed.', { type: 'checkbox', full: true }),
    ] }],
  };
}

function cleanliness(): Base {
  return {
    templateId: 'cleanliness', title: 'Phytosanitary Cleanliness Certificate — Used Machinery', short: 'Cleanliness', panel: 'cert', side: 'india',
    issuer: 'NPPO India — Plant Quarantine Station', leadTime: '2–3 days', leadDays: 3, legal: 'IPPC · ISPM 41 (used vehicles, machinery & equipment)',
    sections: [{ title: 'Inspection', fields: [A('model', 'Machinery', '{make} {model} — {serialNos}', { full: true }), M('method', 'Cleaning method', { placeholder: 'High-pressure wash + steam' }), dateM('date', 'Inspection date', { check: V.notFuture }), M('free', 'Free from soil, seeds & plant debris', { type: 'checkbox' }), O('pscNo', 'PSC no.')] }],
  };
}

function irrTest(): Base {
  const cat = (a: Record<string, string>) => ((a.category ?? '').startsWith('A') ? 5 : 10);
  return {
    templateId: 'irrTest', title: 'Emitter / Pipe Performance Test Certificate', short: 'Perf. test', panel: 'cert', side: 'lab', issuer: 'NABL-accredited / BIS-recognized hydraulics laboratory', leadTime: '5–10 days', leadDays: 10, legal: 'ISO 9261:2004 · IS 13487 / IS 13488',
    sections: [
      { title: 'Product', fields: [A('product', 'Product', 'productName'), A('standard', 'Standard', 'applicableStandard'), A('dims', 'Dimensions', 'dimensions'), A('pressure', 'Pressure rating', 'pressureRating'), AO('flow', 'Nominal flow', 'flowRate'), A('batch', 'Batch', 'lotNo')] },
      { title: 'Hydraulic results', fields: [
        M('category', 'Uniformity category', { type: 'select', options: ['A — CVm ≤ 5%', 'B — CVm ≤ 10%'] }),
        M('cvm', 'Coefficient of manufacturing variation (CVm)', { type: 'number', unit: '%', check: (v, a) => (v && num(v) > cat(a) ? { level: 'error', msg: `CVm ${v}% exceeds the category limit of ${cat(a)}%.` } : null) }),
        M('flowDev', 'Mean flow deviation from nominal', { type: 'number', unit: '%', check: (v, a) => (v && Math.abs(num(v)) > cat(a) ? { level: 'error', msg: `Flow deviation exceeds ±${cat(a)}%.` } : null) }),
        O('exponent', 'Emitter exponent (x)', { type: 'number', hint: 'Pressure-compensating emitters typically < 0.2.' }),
        M('hydro', 'Hydrostatic / burst test', { placeholder: '1.8× working pressure, 1 h — no leakage' }),
        M('result', 'Overall result', { type: 'select', options: ['Pass', 'Fail'], check: (v) => (v === 'Fail' ? { level: 'error', msg: 'Failed batch cannot be certified.' } : null) }),
        M('lab', 'Laboratory'), M('reportNo', 'Report no.'), dateM('date', 'Date', { check: V.notFuture }),
      ] },
    ],
  };
}

function material(): Base {
  return {
    templateId: 'material', title: 'Material Grade & Raw Material Certificate', short: 'Material', panel: 'cert', side: 'exporter', issuer: 'Manufacturer (resin supplier mill certificate attached)', leadTime: 'On file', leadDays: 0,
    sections: [{ title: 'Material', fields: [
      A('grade', 'Polymer grade', 'materialGrade'), A('batch', 'Production batch', 'lotNo'),
      M('resin', 'Resin supplier & grade'), O('mfi', 'Melt flow index', { type: 'number', unit: 'g/10 min' }), O('density', 'Density', { type: 'number', unit: 'g/cm³' }),
      M('cb', 'Carbon black content', { type: 'number', unit: '%', check: (v) => (v && (num(v) < 2 || num(v) > 3) ? { level: 'warn', msg: 'UV-stable PE pipe normally carries 2–3% carbon black.' } : null) }),
      M('virgin', 'Raw material', { type: 'select', options: ['100% virgin', 'Virgin + in-house regrind ≤ 10%', 'Contains recycled material'], check: (v) => (v === 'Contains recycled material' ? { level: 'warn', msg: 'Many tenders and standards prohibit recycled material in emitting pipe.' } : null) }),
    ] }],
  };
}

function bisCert(): Base {
  return {
    templateId: 'bisCert', title: 'Product Certification Evidence (BIS / ISO 9001)', short: 'BIS/ISO', panel: 'cert', side: 'india', issuer: 'Bureau of Indian Standards / accredited certification body', leadTime: 'On file', leadDays: 0,
    sections: [{ title: 'Certificate', fields: [A('product', 'Product', 'productName'), M('type', 'Certificate type', { type: 'select', options: ['BIS ISI licence (CM/L)', 'ISO 9001:2015', 'ISO 9001 + BIS licence'] }), M('certNo', 'Licence / certificate no.'), dateM('validTo', 'Valid until', { check: V.notPast })] }],
  };
}

// ═════════════ Rules engine ═════════════

export function buildStack(ctx: Ctx): DocSpec[] {
  const { country: c, category: cat, commodity: k, master: m } = ctx;
  const docs: DocSpec[] = [];
  const push = (b: Base, r: Requirement, reason: string, extra?: Partial<DocSpec>) => docs.push(make(ctx, b, r, reason, extra));
  const conf = c.conformity && c.conformity.scope.includes(cat as never);
  const regionCatalogue = c.blocs.map((b) => BLOCS[b]).filter((b) => b.harmonization.seeds?.level === 'catalogue').map((b) => b.id);

  if (cat === 'seeds') {
    push(psc(ctx), 'mandatory', `Required by ${shortAuth(c.auth.nppo) || c.name} for all seed and plant material (IPPC).`);
    push(ista(ctx), 'mandatory', regionCatalogue.length ? `Seed quality evidence for ${c.name}; ISTA Orange certificate is the reference for ${regionCatalogue.join('/')} regional seed trade.` : 'Seed quality evidence expected by the destination seed authority.');
    const ge = !isFlag(m, 'nonGmo');
    const gmoHeavy = c.gmo === 'ban' || c.gmo === 'strict' || (c.id === 'ID' && k?.gmRelevant);
    push(nongmo(), gmoHeavy || k?.gmRelevant ? 'mandatory' : 'recommended', c.gmo === 'ban' ? `${c.name} bans GE agricultural imports — a negative PCR result is expected.` : c.id === 'ID' ? 'FAIRS: Indonesia requires a GMO/Non-GMO statement for corn, soybean, tomato and potato.' : k?.gmRelevant ? `${k.name.split(' ')[0]} has commercial GM events; buyers and regulators expect a non-GMO test.` : 'Supports buyer due diligence.',
      ge && c.gmo === 'ban' ? { blocking: `${c.name} prohibits GE seed imports. Tick "Certified non-GMO lot" in the master form only when the lot has tested non-GMO.` } : {});
    push(seedCoA(), 'mandatory', 'Manufacturer purity and genetic-purity evidence supporting the ISTA certificate and the label claims.');
    push(oecd(), 'recommended', regionCatalogue.length ? `OECD varietal certification eases ${regionCatalogue.join('/')} catalogue listing and certified-seed trade.` : 'Recognized evidence of varietal identity and purity.');
    if (isFlag(m, 'fumigated') || c.id === 'KE' || c.id === 'BD')
      push(fumigation(ctx), isFlag(m, 'fumigated') ? 'mandatory' : 'conditional', isFlag(m, 'fumigated') ? 'The consignment is fumigated; the certificate must accompany the PSC.' : `FAIRS lists a fumigation certificate for ${c.name} depending on commodity; required if the import permit specifies fumigation.`);
    if (c.id === 'KE') push(radiation(), 'conditional', 'FAIRS (Kenya 2026): KNRA radiation certificate for commodities entering through the port, processed on KenTrade.');
    push(importPermit(ctx), c.depth === 'indicative' ? 'conditional' : 'mandatory', `Issued by ${c.auth.nppo} to the importer before shipment; its conditions set the PSC additional declarations.`);
    if (c.seedRegistrar && !/^covered|no separate/i.test(c.seedRegistrar.permit))
      push(seedImport(ctx), 'mandatory', `${c.seedRegistrar.name} authorizes seed imports separately from the plant-health permit.`);
    push(varietyReg(ctx), c.seedRegistrar ? 'mandatory' : 'recommended', c.seedRegistrar ? `Variety must be on the ${c.seedRegistrar.registration}.` : `Commercial seed generally needs national listing${regionCatalogue.length ? ` or ${regionCatalogue.join('/')} regional catalogue listing` : ''}.`);
    if (c.auth.biosafety && (gmoHeavy || k?.gmRelevant || ge))
      push(biosafety(ctx), ge || (k?.gmRelevant && (c.gmo === 'ban' || c.gmo === 'strict')) ? 'mandatory' : 'recommended',
        ge ? 'GE status declared — biosafety approval is required before import.' : `${shortAuth(c.auth.biosafety)} verifies non-GE status for GM-relevant crops.`,
        ge && c.gmo === 'ban' ? { blocking: `GE seed cannot be imported into ${c.name}.` } : {});
  }

  if (cat === 'fertilizers') {
    push(fertCoA(ctx), 'mandatory', 'Destination registration and customs testing compare the declared grade and heavy metals against this report.');
    push(fcoDecl(), 'mandatory', 'Manufacturer composition declaration referencing the FCO grade.');
    push(sds(), 'mandatory', 'Required for handling, storage and the destination registration dossier.');
    if (k?.organic) push(psc(ctx), 'mandatory', 'Organic manures are plant/animal-derived and need phytosanitary certification.');
    if (conf) push(conformity(ctx), 'mandatory', `${c.conformity!.scheme} applies to fertilizers entering ${c.name}.`);
    if (k?.organic) push(importPermit(ctx, `Import Permit for Organic Fertilizer — ${shortAuth(c.auth.nppo)}`), 'mandatory', 'Organic inputs need a plant-health import permit.');
    push(regPermit(ctx, 'fert'), 'mandatory', `Product must be registered with ${c.auth.fert ?? 'the national fertilizer regulator'} and each shipment covered by an import permit.`);
    if (m.unNumber) push(dgd(ctx), 'mandatory', `${m.unNumber} — dangerous goods for transport.`);
  }

  if (cat === 'agrochem') {
    push(faoCoA(ctx), 'mandatory', 'Batch analysis against FAO/WHO specifications is required for registration and import release.');
    push(sds(), 'mandatory', 'Mandatory for hazardous chemicals in transport and at destination.');
    if (m.unNumber) push(dgd(ctx), 'mandatory', `${m.unNumber}, class ${m.hazardClass || '—'}: dangerous goods under ${(m.transportMode ?? '').startsWith('Air') ? 'IATA DGR' : 'the IMDG Code'}.`);
    push(label(), 'recommended', 'Destination authorities check the label against the approved specimen at entry.');
    if (conf) push(conformity(ctx), 'mandatory', `${c.conformity!.scheme} covers agrochemicals in ${c.name}.`);
    push(cibrc(), 'mandatory', 'Export of insecticides from India requires CIB&RC registration (regular or export-only) and a State manufacturing licence.');
    if (isPIC(m.activeIngredient)) push(pic(ctx), 'mandatory', `${m.activeIngredient} is listed in Annex III of the Rotterdam Convention — an export notification and import response are required.`);
    push(regPermit(ctx, 'pest'), 'mandatory', c.blocs.includes('CILSS') ? 'One CSP homologation covers all CILSS states; the importer then needs a national import authorization.' : c.blocs.includes('CEMAC') ? 'CPAC homologation is valid across CEMAC; plus a national import authorization.' : `The product must be registered with ${c.auth.pest ?? 'the national pesticide authority'} before import.`);
  }

  if (cat === 'biologicals') {
    const bt = m.bioType || k?.bioType;
    push(strainId(), 'mandatory', 'Registration authorities and NPPOs require proof of strain identity for live organisms.');
    push(microCoA(), 'mandatory', 'Viable count and contaminant freedom are release criteria for microbial products.');
    push(toxSummary(), bt === 'biopesticide' ? 'mandatory' : 'recommended', bt === 'biopesticide' ? 'Biopesticide registration needs mammalian pathogenicity and toxicity data.' : 'Supports biostimulant/biofertilizer registration.');
    push(psc(ctx), 'conditional', 'Required by most NPPOs for live organisms or plant-based carriers; confirm on the import permit.');
    push(sds(), 'recommended', 'Handling and storage information.');
    if (bt === 'biopesticide') push(cibrc(true), 'mandatory', 'Biopesticides are registered under the Insecticides Act (Sec. 9(3B)/9(3)).');
    else push(fcoBio(ctx), 'mandatory', bt === 'biostimulant' ? 'Biostimulants must be registered under FCO Schedule VI.' : 'Biofertilizers must meet FCO Schedule III and hold a manufacturing certificate.');
    push(nbaIndia(), 'conditional', 'Needed if the strain was isolated from Indian biological resources and is transferred commercially abroad.');
    push(importPermit(ctx, `Import Permit for Live Microbial Products — ${shortAuth(c.auth.nppo) || c.name}`), 'mandatory', 'Live organisms need an NPPO import permit naming the organism and strain.');
    push(regPermit(ctx, 'bio'), 'mandatory', bt === 'biopesticide' ? `Biopesticide registration with ${c.blocs.includes('CILSS') ? 'the CSP (CILSS)' : c.auth.pest ?? 'the pesticide authority'}.` : `Registration with ${c.auth.fert ?? 'the fertilizer regulator'}.`);
    if (c.auth.biosafety && !isFlag(m, 'nonGmo')) push(biosafety(ctx), 'mandatory', 'Genetically modified strain declared — biosafety approval required.', c.gmo === 'ban' ? { blocking: `GM organisms cannot be imported into ${c.name}.` } : {});
  }

  if (cat === 'machinery') {
    const used = (m.condition ?? '').startsWith('Used');
    if (conf) push(conformity(ctx), 'mandatory', `${c.conformity!.scheme} is required to clear machinery in ${c.name}.`);
    push(psi(), conf ? 'recommended' : 'recommended', conf ? 'Your inspection body may combine PSI with the destination conformity inspection.' : 'Buyers and LC terms commonly require independent pre-shipment inspection.');
    push(machTest(ctx), c.id === 'PH' || k?.machineKind === 'tractor' ? 'mandatory' : 'recommended', c.id === 'PH' ? 'AFMech Law: machinery must be AMTEC-tested to PAES before sale.' : k?.machineKind === 'tractor' ? 'Tractor performance and ROPS test evidence is requested by importers, conformity bodies and tenders.' : 'Performance evidence for buyer and conformity body.');
    push(machDoC(), 'mandatory', 'Safety conformity declaration referenced by the conformity body and customs.');
    if (used) push(cleanliness(), 'mandatory', 'Used agricultural machinery must be certified free of soil and plant debris (ISPM 41).');
  }

  if (cat === 'irrigation') {
    push(irrTest(), 'mandatory', 'Uniformity (CVm) and flow tests to the stated standard are required by buyers, subsidy programs and conformity bodies.');
    push(material(), 'mandatory', 'Raw material evidence (virgin resin, carbon black) for durability and standards compliance.');
    if (conf) push(conformity(ctx), 'mandatory', `${c.conformity!.scheme} applies to plastic pipes and irrigation equipment in ${c.name}.`);
    push(bisCert(), 'recommended', 'BIS licence or ISO 9001 supports conformity assessment and tenders.');
  }

  // ── common documents ──
  push(coo(ctx), 'mandatory', c.pref ? `Claim tariff preference under ${c.pref.agreement}.` : 'Required by customs to establish origin.');
  if (isFlag(m, 'woodPackaging')) push(ispm15(), 'mandatory', 'Wood packaging must be ISPM 15 treated and marked.');
  if (['CIF', 'CIP'].includes(m.incoterm) || c.id === 'ET') push(insurance(ctx), 'mandatory', c.id === 'ET' ? 'FAIRS (Ethiopia): an insurance certificate accompanies imports.' : `Seller must insure under ${m.incoterm}.`);
  push(invoice(ctx), 'mandatory', 'Customs valuation and clearance at both ends.');
  push(shippingBill(ctx), 'mandatory', 'Indian export customs declaration (Let Export Order).');
  if (c.importDeclaration) push(importDecl(ctx), 'mandatory', `${c.importDeclaration.name}: ${c.importDeclaration.note}`);

  return docs;
}

export const REQ_ORDER: Record<Requirement, number> = { mandatory: 0, conditional: 1, recommended: 2 };
