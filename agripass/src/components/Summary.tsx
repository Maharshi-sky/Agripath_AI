import { useMemo } from 'react';
import { FileArchive, FileJson, Files, OctagonAlert, Clock, ArrowLeftRight, X, Check, Minus } from 'lucide-react';
import { useStore } from '../store';
import type { StackItem } from '../lib/useStack';
import { Bar, Pill, ReqPill, Ring, SectionHead } from './ui';
import { buildStack } from '../data/documents';
import { byId, flag } from '../data/countries';
import { commodityById } from '../data/commodities';
import { pathwayFor } from '../lib/pathway';
import type { Requirement } from '../data/types';

const STATUS: Record<string, { label: string; tone: 'auto' | 'manual' | 'danger' | 'neutral' }> = {
  complete: { label: 'Complete', tone: 'auto' }, attention: { label: 'Check warnings', tone: 'manual' }, progress: { label: 'In progress', tone: 'neutral' }, blocked: { label: 'Blocked', tone: 'danger' },
};

export function Summary({ items, summary, onExport }: { items: StackItem[]; summary: { mandatory: number; done: number; readiness: number; stale: number; blocked: StackItem[]; openLead: number; errors: number }; onExport: (k: 'pack' | 'zip' | 'json') => void }) {
  const setOpenDoc = useStore((s) => s.setOpenDoc);
  const jump = (key: string) => { setOpenDoc(key); setTimeout(() => document.getElementById(`doc-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); };
  const critical = items.filter((i) => i.doc.requirement === 'mandatory' && i.st.status === 'progress').sort((a, b) => b.doc.leadDays - a.doc.leadDays).slice(0, 3);
  const issues = items.flatMap((i) => i.st.errors.filter((f) => f.value || f.kind === 'auto').map((f) => ({ i, f }))).slice(0, 8);

  return (
    <section aria-labelledby="sum-h" className="gutter mx-auto max-w-[1440px] pt-10">
      <SectionHead step="Step 4 · Dossier" title="Readiness, validation and export" blurb="PDFs are pre-filled drafts with a DRAFT watermark, for application and review. They are not official certificates." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
            <Ring pct={summary.readiness} size={84} />
            <div className="min-w-0">
              <div className="text-[15px] font-bold num">{summary.done} of {summary.mandatory} mandatory documents ready</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {summary.blocked.length > 0 && <Pill tone="danger">{summary.blocked.length} blocked</Pill>}
                <Pill tone={summary.errors ? 'manual' : 'auto'}>{summary.errors} open field issues</Pill>
                {summary.stale > 0 && <Pill tone="manual">{summary.stale} fields out of date</Pill>}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-[13.5px] font-bold"><Clock size={15} className="text-brand" aria-hidden />Critical path</div>
            {critical.length ? (
              <ul className="space-y-2">
                {critical.map((c) => (
                  <li key={c.doc.key}><button className="w-full text-left" onClick={() => jump(c.doc.key)}>
                    <div className="flex items-baseline justify-between gap-2 text-[13px]"><span className="min-w-0 truncate font-semibold hover:underline">{c.doc.title}</span><span className="shrink-0 text-muted num">~{c.doc.leadDays} d</span></div>
                    <div className="truncate text-[11.5px] text-muted">{c.doc.leadTime}</div>
                  </button></li>
                ))}
              </ul>
            ) : <p className="text-[13px] text-auto">All mandatory documents are complete.</p>}
            {summary.openLead > 0 && <p className="mt-2 border-t border-line pt-2 text-[12px] text-muted">Start the longest item now: the earliest realistic shipment is about {summary.openLead} days out.</p>}
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-2 text-[13.5px] font-bold">Export</div>
            <div className="grid gap-2">
              <button className="btn-primary justify-start" onClick={() => onExport('pack')}><Files size={15} aria-hidden />Unified document pack (PDF)</button>
              <button className="btn-ghost justify-start" onClick={() => onExport('zip')}><FileArchive size={15} aria-hidden />All documents, one PDF each (ZIP)</button>
              <button className="btn-ghost justify-start" onClick={() => onExport('json')}><FileJson size={15} aria-hidden />Compliance dossier (JSON)</button>
            </div>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-line bg-surface">
          {(summary.blocked.length > 0 || issues.length > 0) && (
            <div className="border-b border-line p-4">
              <div className="mb-2 flex items-center gap-2 text-[13.5px] font-bold"><OctagonAlert size={15} className="text-danger" aria-hidden />Fix before shipping</div>
              <ul className="space-y-1.5 text-[12.5px]">
                {summary.blocked.map((b) => <li key={b.doc.key}><button className="text-left text-danger hover:underline" onClick={() => jump(b.doc.key)}><strong>{b.doc.short}:</strong> {b.doc.blocking}</button></li>)}
                {issues.map(({ i, f }) => <li key={i.doc.key + f.def.key}><button className="text-left hover:underline" onClick={() => jump(i.doc.key)}><strong>{i.doc.short} · {f.def.label}:</strong> <span className="text-muted">{f.issue?.msg}</span></button></li>)}
              </ul>
            </div>
          )}
          <div className="scroll-x">
            <table className="w-full min-w-[620px] text-[12.5px]">
              <caption className="sr-only">Document checklist</caption>
              <thead><tr className="border-b border-line text-left text-muted">
                <th className="px-4 py-2 font-semibold">Document</th><th className="px-2 py-2 font-semibold">Requirement</th><th className="px-2 py-2 font-semibold">Status</th><th className="w-36 px-4 py-2 font-semibold">Completion</th>
              </tr></thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.doc.key} className="border-b border-line/70 last:border-0 hover:bg-surface2/60">
                    <td className="px-4 py-2"><button className="text-left font-semibold hover:underline" onClick={() => jump(i.doc.key)}>{i.doc.title}</button><div className="text-[11px] text-muted">{i.doc.panel === 'cert' ? 'Certification' : 'Permit'} · {i.doc.issuer.split(' — ')[0].slice(0, 70)}</div></td>
                    <td className="px-2 py-2"><ReqPill r={i.doc.requirement} /></td>
                    <td className="px-2 py-2"><Pill tone={STATUS[i.st.status].tone}>{STATUS[i.st.status].label}</Pill></td>
                    <td className="px-4 py-2"><div className="flex items-center gap-2"><Bar pct={i.doc.blocking ? 0 : i.st.pct} /><span className="w-9 text-right num">{i.st.pct}%</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

const GENERIC: Record<string, string> = {
  psc: 'Phytosanitary Certificate', ista: 'ISTA seed lot certificate', nongmo: 'Non-GMO certificate', seedCoA: 'Seed CoA / genetic purity', oecd: 'OECD varietal certificate',
  fumigation: 'Fumigation certificate', radiation: 'Radiation certificate', importPermit: 'NPPO import permit', seedImport: 'Seed import licence', varietyReg: 'Variety registration',
  biosafety: 'Biosafety clearance', conformity: 'Destination conformity (CoC)', fertCoA: 'Fertilizer CoA & heavy metals', sds: 'Safety Data Sheet', fcoDecl: 'FCO composition declaration',
  fertReg: 'Fertilizer registration + permit', pestReg: 'Pesticide registration + permit', bioReg: 'Bio-input registration + permit', cibrc: 'CIB&RC registration', faoCoA: 'FAO spec CoA',
  dgd: 'Dangerous goods declaration', pic: 'PIC export notification', label: 'Approved label', strainId: 'Strain ID certificate', microCoA: 'Microbial CoA', toxSummary: 'Toxicology summary',
  nbaIndia: 'NBA India approval', fcoBio: 'FCO bio-input certificate', psi: 'Pre-shipment inspection', machTest: 'Machinery test report', machDoC: 'Safety declaration of conformity',
  cleanliness: 'Used machinery cleanliness', irrTest: 'Emitter/pipe performance test', material: 'Material grade certificate', bisCert: 'BIS / ISO evidence', coo: 'Certificate of Origin',
  ispm15: 'ISPM 15 wood packaging', insurance: 'Insurance certificate', invoice: 'Commercial invoice & packing list', shippingBill: 'Shipping bill (ICEGATE)', importDecl: 'Pre-shipment import declaration',
};
const R: Record<Requirement, string> = { mandatory: 'M', conditional: 'C', recommended: 'R' };

export function Compare() {
  const { destId, compare, category, commodityId, master, toggleCompare, setDest } = useStore();
  const ids = [destId, ...compare.filter((c) => c !== destId)];
  const cols = useMemo(() => ids.map((id) => {
    const country = byId(id);
    const docs = buildStack({ country, category, commodity: commodityById(commodityId), master: { ...master, originCountry: 'India' } });
    return { country, docs, blocs: pathwayFor(country, category).filter((g) => g.domain !== 'plantHealth').map((g) => g.bloc.id) };
  }), [ids.join(','), category, commodityId, master]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = [...new Set(cols.flatMap((c) => c.docs.map((d) => d.templateId)))];
  const base = cols[0];
  const shared = rows.filter((r) => cols.every((c) => c.docs.some((d) => d.templateId === r && d.requirement === base.docs.find((x) => x.templateId === r)?.requirement)));

  return (
    <section aria-labelledby="cmp-h" className="gutter mx-auto max-w-[1440px] pt-10">
      <SectionHead step="Multi-destination check" title="Compare destinations side by side"
        blurb="Add sibling countries from the pathway card (+). Rows that match across every destination can be prepared once." />
      <div className="rounded-xl border border-line bg-surface">
        {ids.length < 2 ? (
          <p className="flex items-center gap-2 p-4 text-[13px] text-muted"><ArrowLeftRight size={15} aria-hidden />Use the + on any country chip above to compare it with {byId(destId).name}.</p>
        ) : (
          <>
            <p className="border-b border-line px-4 py-2.5 text-[12.5px]"><strong className="num">{shared.length} of {rows.length}</strong> document types carry the same requirement in all {ids.length} destinations.</p>
            <div className="scroll-x">
              <table className="w-full min-w-[560px] text-[12.5px]">
                <thead>
                  <tr className="border-b border-line">
                    <th className="sticky left-0 bg-surface px-4 py-2 text-left font-semibold text-muted">Document</th>
                    {cols.map((c, i) => (
                      <th key={c.country.id} className="px-3 py-2 text-left align-top">
                        <div className="flex items-center gap-1">
                          <button className={`font-bold hover:underline ${i === 0 ? 'text-brand' : ''}`} onClick={() => setDest(c.country.id)}>{flag(c.country.id)} {c.country.name}</button>
                          {i > 0 && <button className="btn-quiet px-1" aria-label={`Remove ${c.country.name}`} onClick={() => toggleCompare(c.country.id)}><X size={12} /></button>}
                        </div>
                        <div className="mt-0.5 text-[11px] font-normal text-muted num">{c.docs.length} docs · {c.blocs.join(', ') || 'national'}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r} className={`border-b border-line/70 last:border-0 ${shared.includes(r) ? '' : 'bg-manualbg/25'}`}>
                      <td className="sticky left-0 bg-surface px-4 py-1.5 font-semibold">{GENERIC[r] ?? r}{shared.includes(r) && <Check size={12} className="ml-1 inline text-auto" aria-label="same everywhere" />}</td>
                      {cols.map((c) => {
                        const d = c.docs.find((x) => x.templateId === r);
                        return (
                          <td key={c.country.id} className="px-3 py-1.5">
                            {d ? <span className="flex items-center gap-1.5"><span className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10.5px] font-bold ${d.requirement === 'mandatory' ? 'bg-dangerbg text-danger' : d.requirement === 'conditional' ? 'bg-manualbg text-manual' : 'bg-surface2 text-muted'}`} title={d.requirement}>{R[d.requirement]}</span><span className="truncate text-[11.5px] text-muted" title={d.issuer}>{d.issuer.split(' — ')[0].split(' (')[0].slice(0, 34)}</span></span>
                              : <Minus size={14} className="text-line" aria-label="not required" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-2 text-[11px] text-muted">M = mandatory · C = conditional · R = recommended. Highlighted rows differ between destinations.</p>
          </>
        )}
      </div>
    </section>
  );
}
