export type Category = 'seeds' | 'fertilizers' | 'agrochem' | 'biologicals' | 'machinery' | 'irrigation';

export const CATEGORIES: { id: Category; label: string; short: string; focus: string }[] = [
  { id: 'seeds', label: 'Seeds & Crop Varieties', short: 'Seeds', focus: 'Phytosanitary · ISTA · Variety registration · OECD · Non-GMO · Import permits' },
  { id: 'fertilizers', label: 'Fertilizers & Plant Nutrients', short: 'Fertilizers', focus: 'Composition analysis · Heavy metals · FCO grade · Registration · SDS' },
  { id: 'agrochem', label: 'Crop Protection & Agrochem', short: 'Agrochem', focus: 'CIB&RC · Active ingredient registration · FAO specs · Hazmat · PIC' },
  { id: 'biologicals', label: 'Biological Inputs & Bio-Stimulants', short: 'Biologicals', focus: 'Strain ID · Microbial purity · Biosafety · Toxicology' },
  { id: 'machinery', label: 'Farm Machinery & Equipment', short: 'Machinery', focus: 'Pre-shipment inspection · Conformity (PVoC/SONCAP/SABER) · Test & safety' },
  { id: 'irrigation', label: 'Irrigation & Water Management', short: 'Irrigation', focus: 'ISO 9261 / IS 13487 testing · Pressure rating · Material grade' },
];

export type BlocId =
  | 'EAC' | 'COMESA' | 'SADC' | 'SACU' | 'ECOWAS' | 'UEMOA' | 'CILSS' | 'CEMAC' | 'ECCAS' | 'IGAD' | 'AES'
  | 'AMU' | 'GAFTA' | 'GCC' | 'ASEAN' | 'SAARC' | 'BIMSTEC' | 'EAEU' | 'CIS' | 'MERCOSUR';

/** How strongly a bloc instrument binds members together for a category. */
export type HarmonyLevel = 'single' | 'catalogue' | 'data' | 'standards';

export const HARMONY_LABEL: Record<HarmonyLevel, { label: string; explain: string }> = {
  single: { label: 'Single regional authorization', explain: 'One approval or registration is valid in every member state.' },
  catalogue: { label: 'Regional catalogue', explain: 'Listing in the regional variety or product catalogue gives marketing rights across members. Each consignment still needs its national import permit.' },
  data: { label: 'Mutual recognition of data', explain: 'Test dossiers and data from one member are accepted toward registration in the others. Registration itself stays national.' },
  standards: { label: 'Common standards', explain: 'Members apply harmonized standards and forms, but each runs its own approval.' },
};

export type Domain = Category | 'plantHealth';

export interface BlocInstrument {
  instrument: string;
  level: HarmonyLevel;
  effect: string;
  /** Members where the instrument is operational, when narrower than the bloc. */
  members?: string[];
}

export interface Bloc {
  id: BlocId;
  name: string;
  members: string[]; // ISO2 codes (only countries in the registry matter)
  note?: string;
  harmonization: Partial<Record<Domain, BlocInstrument>>;
}

export type Depth = 'profiled' | 'bloc' | 'indicative';
export type GmoPolicy = 'ban' | 'strict' | 'regulated' | 'permitted';
export type ConformityScope = 'machinery' | 'irrigation' | 'fertilizers' | 'agrochem';

export interface Authorities {
  nppo: string;
  seed?: string;
  fert?: string;
  pest?: string;
  biosafety?: string;
  standards?: string;
  customs?: string;
}

export interface CountryProfile {
  id: string; // ISO2
  name: string;
  region: string;
  blocs: BlocId[];
  depth: Depth;
  ports: string[];
  singleWindow?: string;
  auth: Authorities;
  conformity?: { scheme: string; body: string; scope: ConformityScope[]; note?: string };
  gmo: GmoPolicy;
  gmoNote?: string;
  /** Preferential trade agreement with India affecting the Certificate of Origin form. */
  pref?: { agreement: string; form: string };
  importDeclaration?: { name: string; system: string; note: string };
  seedPermitName?: string;
  seedRegistrar?: { name: string; permit: string; registration: string };
  alerts?: { level: 'block' | 'warn' | 'info'; text: string }[];
  notes?: string[];
  fairs?: import('./fairs.generated').FairsEntry;
}

export interface Commodity {
  id: string;
  category: Category;
  name: string;
  hs: string;
  hsNote?: string;
  botanical?: string;
  crop?: string; // key into seed standards & AD suggestions
  gmRelevant?: boolean; // crop has commercial GM events
  organic?: boolean; // fertilizer of plant/animal origin -> phytosanitary
  restrictedExport?: string;
  activeIngredient?: string;
  aiContent?: string;
  formulation?: string;
  un?: string;
  hazardClass?: string;
  packingGroup?: string;
  bioType?: 'biopesticide' | 'biofertilizer' | 'biostimulant';
  organism?: string;
  composition?: string;
  form?: string;
  machineKind?: 'tractor' | 'implement' | 'harvester' | 'sprayer' | 'tiller' | 'processing';
  standard?: string;
  material?: string;
}

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'email' | 'tel';

export interface Issue { level: 'error' | 'warn'; msg: string }

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  /** Master key this field mirrors. Present ⇒ auto-filled. */
  from?: string;
  /** Computed auto value (not from the master form), e.g. the issuing authority. */
  computed?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
  unit?: string;
  suggestions?: string[];
  full?: boolean;
  check?: (v: string, all: Record<string, string>) => Issue | null;
}

export type Panel = 'cert' | 'permit';
export type Requirement = 'mandatory' | 'conditional' | 'recommended';
export type Side = 'india' | 'destination' | 'exporter' | 'lab' | 'third-party';

export interface DocSpec {
  key: string; // storage key (country-scoped for destination docs)
  templateId: string;
  title: string;
  short: string;
  panel: Panel;
  requirement: Requirement;
  reason: string;
  issuer: string;
  side: Side;
  portal?: string;
  leadTime: string;
  leadDays: number;
  legal?: string;
  source?: { label: string; url?: string };
  sections: { title: string; fields: FieldDef[] }[];
  blocking?: string;
}

export type Master = Record<string, string>;
