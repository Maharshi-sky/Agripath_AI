import { useEffect, useRef } from 'react';
import { X, Download, Printer } from 'lucide-react';
import { useStore } from '../store';
import type { StackItem } from '../lib/useStack';
import { draftIdFor } from '../lib/useStack';
import { inArtifactViewer } from '../lib/files';
import { flag } from '../data/countries';
import type { CountryProfile } from '../data/types';

export function PreviewModal({ items, country, onPdf }: { items: StackItem[]; country: CountryProfile; onPdf: (i: StackItem) => void }) {
  const { previewDoc, setPreview } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items.find((i) => i.doc.key === previewDoc);
  useEffect(() => {
    if (!item) return;
    closeRef.current?.focus();
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(null);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [item, setPreview]);
  if (!item) return null;
  const { doc, st } = item;
  const sections = [...new Set(st.fields.map((f) => f.section))];
  let box = 0;
  const draft = draftIdFor(country.id)(doc);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Preview: ${doc.title}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
      <div className="gutter no-print flex items-center gap-2 bg-surface py-2 shadow">
        <div className="min-w-0 flex-1">
          <div className="eyebrow">Live preview · {st.pct}% complete</div>
          <div className="truncate text-[14px] font-bold">{doc.title}</div>
        </div>
        <button className="btn-primary" onClick={() => onPdf(item)}><Download size={14} aria-hidden /><span className="hidden sm:inline">Download PDF</span></button>
        {!inArtifactViewer() && <button className="btn-ghost" onClick={() => window.print()}><Printer size={14} aria-hidden /><span className="hidden sm:inline">Print</span></button>}
        <button ref={closeRef} className="btn-ghost px-2" onClick={() => setPreview(null)} aria-label="Close preview"><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto py-6" onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
        <div className="gutter mx-auto max-w-[860px]">
          <article className="print-area cert-paper relative overflow-hidden rounded-sm p-3 shadow-2xl sm:p-5">
            <div className="guilloche pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative border-[3px] border-double border-[#1b5741] p-4 sm:p-6">
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                <span className="wide -rotate-[32deg] whitespace-nowrap text-[44px] font-extrabold tracking-[0.15em] text-[#1b5741]/[0.07] sm:text-[64px]">DRAFT · NOT OFFICIAL</span>
              </div>
              <header className="relative flex flex-col gap-3 border-b-2 border-[#1b5741] pb-3 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#4b5a52]">{doc.issuer}</div>
                  <h2 className="mt-1 font-serif text-[22px] font-bold uppercase leading-tight tracking-wide text-[#13261d] sm:text-[26px]">{doc.title}</h2>
                  <div className="mt-1 text-[11.5px] text-[#4b5a52]">India {flag('IN')} → {country.name} {flag(country.id)} · {doc.legal ?? doc.leadTime}</div>
                </div>
                <div className="shrink-0 rotate-[-4deg] self-start rounded border-2 border-[#9a3412] px-3 py-1.5 text-center text-[#9a3412]">
                  <div className="text-[15px] font-extrabold tracking-[0.2em]">DRAFT</div>
                  <div className="font-mono text-[9.5px]">{draft}</div>
                  <div className="text-[9px] uppercase tracking-wider">pre-filled application</div>
                </div>
              </header>
              {sections.map((s) => (
                <section key={s} className="relative mt-4">
                  <h3 className="mb-1.5 bg-[#e7ede4] px-2 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#1b5741]">{s}</h3>
                  <div className="grid grid-cols-1 border-l border-t border-[#c8cec4] sm:grid-cols-2">
                    {st.fields.filter((f) => f.section === s).map((f) => {
                      box++;
                      const v = f.def.type === 'checkbox' ? (f.value === 'true' || f.value === 'Yes' ? '☒ Confirmed' : '☐ Not confirmed') : f.value;
                      const wide = f.def.full || (v?.length ?? 0) > 60;
                      return (
                        <div key={f.def.key} className={`min-w-0 border-b border-r border-[#c8cec4] px-2 py-1.5 ${wide ? 'sm:col-span-2' : ''} ${!v && f.def.required ? 'bg-[#fdf1df]' : ''}`}>
                          <div className="flex items-baseline gap-1 text-[9.5px] uppercase tracking-wide text-[#5b6a61]">
                            <span className="font-mono">{box}.</span><span>{f.def.label}</span>
                            {f.kind !== 'manual' && <span className="ml-auto text-[8.5px] text-[#047857]">master</span>}
                          </div>
                          <div className={`mt-0.5 whitespace-pre-line break-words font-serif text-[13.5px] leading-snug ${v ? 'text-[#13261d]' : 'italic text-[#b45309]'}`}>
                            {v ? `${v}${f.def.unit ? ` ${f.def.unit}` : ''}` : f.def.required ? 'Required — not yet completed' : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
              <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                <div className="h-20 border border-[#c8cec4] p-2 text-[9.5px] uppercase tracking-wide text-[#5b6a61]">{doc.side === 'exporter' ? 'Authorized signatory (exporter)' : 'Issuing officer — name, designation, date'}</div>
                <div className="h-20 border border-dashed border-[#c8cec4] p-2 text-[9.5px] uppercase tracking-wide text-[#5b6a61]">{doc.side === 'exporter' ? 'Company stamp' : 'Official seal — applied by the authority on issuance'}</div>
              </div>
              <p className="relative mt-4 text-[10.5px] leading-snug text-[#5b6a61]">
                Pre-filled application draft prepared with AgriPass Global. It is not an official certificate and is not valid for customs or plant-health clearance until the competent authority issues and signs it. Requirement basis: {doc.reason}
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
