import { COUNTRIES, byId, fairsUrl } from '../src/data/countries';
import { FAIRS } from '../src/data/fairs.generated';
import { buildStack } from '../src/data/documents';
import { commodityById, COMMODITIES } from '../src/data/commodities';
import { SAMPLE_MASTER, commodityDefaults } from '../src/data/masterSchema';
import { docState, cascadeValues } from '../src/lib/docstate';
import { pathwayFor } from '../src/lib/pathway';
import { CATEGORIES } from '../src/data/types';

let fail = 0;
const assert = (c: unknown, m: string) => { if (!c) { fail++; console.log('  ✗', m); } };

// 1. every spreadsheet row maps to a profile; hubs resolve
const unmatched = FAIRS.filter((f) => !COUNTRIES.some((c) => c.name === f.name));
assert(unmatched.length === 0, 'unmatched FAIRS names: ' + unmatched.map((u) => u.name).join(', '));
const badHub = COUNTRIES.filter((c) => c.fairs?.status === 'hub' && c.fairs.hub !== 'India' && !COUNTRIES.some((x) => x.name === c.fairs!.hub));
assert(badHub.length === 0, 'hub not resolvable: ' + badHub.map((b) => `${b.name}->${b.fairs?.hub}`).join(', '));
const ids = COUNTRIES.map((c) => c.id); assert(new Set(ids).size === ids.length, 'duplicate ISO codes');
console.log(`registry: ${COUNTRIES.length} countries, ${FAIRS.length} from spreadsheet, ${COUNTRIES.filter((c) => !c.fairs).map((c) => c.name).join(', ')} added`);

// 2. every country × category builds a stack without throwing
let total = 0;
for (const c of COUNTRIES) for (const cat of CATEGORIES) {
  const k = COMMODITIES.find((x) => x.category === cat.id)!;
  const m = { ...SAMPLE_MASTER, ...commodityDefaults(k), portOfEntry: c.ports[0], originCountry: 'India' };
  try {
    const docs = buildStack({ country: c, category: cat.id, commodity: k, master: m });
    total += docs.length;
    const keys = docs.map((d) => d.key); assert(new Set(keys).size === keys.length, `dup doc keys ${c.id}/${cat.id}: ${keys}`);
    for (const d of docs) { const fk = d.sections.flatMap((s) => s.fields.map((f) => f.key)); assert(new Set(fk).size === fk.length, `dup field keys in ${d.templateId} (${c.id})`); docState(d, cascadeValues(d, m), {}, m); }
  } catch (e) { fail++; console.log('  ✗ throws', c.id, cat.id, (e as Error).message); }
}
console.log(`stacks: ${COUNTRIES.length * CATEGORIES.length} combinations, ${total} documents built`);

// 3. named scenarios
const run = (dest: string, cat: any, com: string, extra: Record<string, string> = {}) => {
  const c = byId(dest); const k = commodityById(com)!;
  const m = { ...SAMPLE_MASTER, ...commodityDefaults(k), portOfEntry: c.ports[0], originCountry: 'India', ...extra };
  const docs = buildStack({ country: c, category: cat, commodity: k, master: m });
  const st = docs.map((d) => ({ d, s: docState(d, cascadeValues(d, m), {}, m) }));
  console.log(`\n▸ ${k.name} → ${c.name}: ${docs.length} docs | pathway: ${pathwayFor(c, cat).map((g) => g.bloc.id + '(' + g.siblings.length + ')').join(', ') || 'national'} | ${fairsUrl(c).label}`);
  for (const { d, s } of st) console.log(`   ${d.panel === 'cert' ? 'C' : 'P'} ${d.requirement.padEnd(11)} ${String(s.pct).padStart(3)}%  ${d.title}${d.blocking ? '  [BLOCKED]' : ''}`);
  return { docs, st };
};
const ke = run('KE', 'seeds', 'maize-hybrid');
assert(ke.docs.some((d) => d.title.includes('KEPHIS Plant Import Permit')), 'Kenya PIP present');
assert(ke.docs.some((d) => d.templateId === 'biosafety' && d.requirement === 'mandatory'), 'Kenya NBA mandatory for maize');
assert(ke.docs.some((d) => d.templateId === 'importDecl'), 'Kenya IDF present');
assert(pathwayFor(byId('KE'), 'seeds').some((g) => g.bloc.id === 'EAC' && g.siblings.some((s) => s.id === 'UG')), 'EAC siblings include Uganda');
const keGe = run('KE', 'seeds', 'maize-hybrid', { nonGmo: '' });
assert(keGe.docs.some((d) => d.blocking), 'GE maize to Kenya is blocked');
const sn = run('SN', 'agrochem', 'chlorantraniliprole');
assert(sn.docs.some((d) => d.title.startsWith('CSP Homologation')), 'Senegal CSP homologation');
assert(sn.docs.some((d) => d.templateId === 'dgd'), 'DG declaration for UN3082');
const snPic = run('SN', 'agrochem', 'monocrotophos');
assert(snPic.docs.some((d) => d.templateId === 'pic'), 'PIC notification for monocrotophos');
const ng = run('NG', 'machinery', 'tractor-45');
assert(ng.docs.some((d) => d.title.startsWith('SONCAP')), 'Nigeria SONCAP');
assert(ng.docs.some((d) => d.templateId === 'importDecl' && d.title.includes('Form M')), 'Nigeria Form M');
const vn = run('VN', 'irrigation', 'drip-lateral');
assert(vn.docs.some((d) => d.title.includes('AIFTA')), 'Vietnam preferential CoO (AIFTA)');
run('ET', 'biologicals', 'trichoderma');
run('EG', 'fertilizers', 'vermicompost');

// 4. validation rules
const ista = ke.docs.find((d) => d.templateId === 'ista')!;
const m = { ...SAMPLE_MASTER, ...commodityDefaults(commodityById('maize-hybrid')!) };
const s1 = docState(ista, { ...cascadeValues(ista, m), pure: '98.5', inert: '1.0', other: '0.2', germ: '85', moisture: '14' }, {}, m);
const msg = (k: string) => s1.fields.find((f) => f.def.key === k)?.issue?.msg;
assert(/must total 100/.test(msg('other') ?? ''), 'purity sum check');
assert(/below the typical minimum of 90/.test(msg('germ') ?? ''), 'germination minimum warning');
assert(/exceeds the limit of 13/.test(msg('moisture') ?? ''), 'moisture maximum');
const pip = ke.docs.find((d) => d.templateId === 'importPermit')!;
const s2 = docState(pip, { ...cascadeValues(pip, m), maxQty: '5000', issueDate: '2026-10-01', validTo: '2026-10-05' }, {}, m);
assert(/exceeds the permitted quantity/.test(s2.fields.find((f) => f.def.key === 'maxQty')?.issue?.msg ?? ''), 'permit quantity check');
assert(/expires before/.test(s2.fields.find((f) => f.def.key === 'validTo')?.issue?.msg ?? ''), 'permit validity vs ship date');
const fao = sn.docs.find((d) => d.templateId === 'faoCoA')!;
const ms = { ...SAMPLE_MASTER, ...commodityDefaults(commodityById('chlorantraniliprole')!) };
const s3 = docState(fao, { ...cascadeValues(fao, ms), aiFound: '17.0' }, {}, ms);
assert(/Outside FAO tolerance/.test(s3.fields.find((f) => f.def.key === 'aiFound')?.issue?.msg ?? ''), 'FAO tolerance 18.5 ±6%');
console.log(fail ? `\n${fail} FAILED` : '\nall checks passed');
process.exit(fail ? 1 : 0);
