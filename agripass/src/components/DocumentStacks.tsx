import { useEffect, useState } from 'react';
import { FileCheck2, Stamp, Clock, ExternalLink, Eye, Download, Printer, RotateCcw, ChevronDown, Lock, Pencil, Link2, OctagonAlert, CircleCheck, TriangleAlert, Info } from 'lucide-react';
import { useStore } from '../store';
import type { StackItem } from '../lib/useStack';
import type { FieldState } from '../lib/docstate';
import { FieldInput } from './FieldInput';
import { AutoTag, Bar, ManualTag, Pill, ReqPill, SectionHead, SIDE_LABEL } from './ui';
import { inArtifactViewer } from '../lib/files';
import type { DocSpec } from '../data/types';

type Filter = 'all' | 'mandatory' | 'open';

export function DocumentStacks({ items, onPdf }: { items: StackItem[]; onPdf: (i: StackItem) => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = items.filter((i) => filter === 'all' || (filter === 'mandatory' ? i.doc.requirement === 'mandatory' : i.st.status !== 'complete'));
  const certs = shown.filter((i) => i.doc.panel === 'cert');
  const permits = shown.filter((i) => i.doc.panel === 'permit');
  return (
    <section aria-labelledby="docs-h" className="gutter mx-auto max-w-[1440px] pt-8">
      <SectionHead step="Step 3 · Smart document stacks" title="Certificates and permits for this route"
        blurb="Open a document to see which fields came from the master form and which still need typing for this document."
        right={
          <div className="flex rounded-lg border border-line bg-surface p-0.5" role="radiogroup" aria-label="Filter documents">
            {(['all', 'mandatory', 'open'] as Filter[]).map((f) => (
              <button key={f} role="radio" aria-checked={filter === f} onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-[12.5px] font-semibold ${filter === f ? 'bg-brand text-brandink' : 'text-muted hover:text-ink'}`}>
                {f === 'all' ? `All (${items.length})` : f === 'mandatory' ? 'Mandatory' : 'Incomplete'}
              </button>
            ))}
          </div>
        } />
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Mandatory certifications" icon={<FileCheck2 size={16} aria-hidden />} items={certs} label="Certificate" onPdf={onPdf} all={items.filter((i) => i.doc.panel === 'cert')} />
        <Panel title="Import & movement permits" icon={<Stamp size={16} aria-hidden />} items={permits} label="Permit" onPdf={onPdf} all={items.filter((i) => i.doc.panel === 'permit')} />
      </div>
    </section>
  );
}

function Panel({ title, icon, items, all, label, onPdf }: { title: string; icon: React.ReactNode; items: StackItem[]; all: StackItem[]; label: string; onPdf: (i: StackItem) => void }) {
  const done = all.filter((i) => i.st.status === 'complete' || i.st.status === 'attention').length;
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-brand">{icon}</span>
        <h3 id={label === 'Certificate' ? 'docs-h' : undefined} className="text-[15px] font-bold">{title}</h3>
        <span className="text-[12px] text-muted num">{done}/{all.length} ready</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.length === 0 && <p className="rounded-lg border border-dashed border-line p-4 text-[13px] text-muted">Nothing here for this filter.</p>}
        {items.map((it) => <DocumentCard key={it.doc.key} item={it} n={all.indexOf(it) + 1} label={label} onPdf={() => onPdf(it)} />)}
      </div>
    </div>
  );
}

function DocumentCard({ item, n, label, onPdf }: { item: StackItem; n: number; label: string; onPdf: () => void }) {
  const { doc, st } = item;
  const { openDoc, setOpenDoc, setPreview, flashKeys, flashAt, resetDoc } = useStore();
  const open = openDoc === doc.key;
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (flashKeys.includes(doc.key) && Date.now() - flashAt < 1500) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 2300);
      return () => clearTimeout(t);
    }
  }, [flashAt, flashKeys, doc.key]);

  const remainingManual = st.remaining.filter((f) => f.kind === 'manual').length;
  const statusLine = doc.blocking ? 'Blocked' : st.status === 'complete' ? 'Complete' : st.status === 'attention' ? `Complete — ${st.warns.length} warning${st.warns.length > 1 ? 's' : ''}` : `${st.pct}% complete — ${st.remaining.length} field${st.remaining.length === 1 ? '' : 's'} remaining`;

  return (
    <article id={`doc-${doc.key}`} className={`relative min-w-0 rounded-xl border bg-surface transition ${open ? 'border-brand/40 shadow-md' : 'border-line'} ${flash ? 'animate-flash' : ''} ${doc.requirement === 'recommended' && !open ? 'opacity-[0.92]' : ''}`}>
      <div className="perf absolute inset-y-3 left-0 w-2" aria-hidden />
      <button type="button" onClick={() => setOpenDoc(open ? null : doc.key)} aria-expanded={open} aria-controls={`body-${doc.key}`}
        className="flex w-full items-start gap-3 rounded-xl py-3 pl-5 pr-3 text-left">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${st.status === 'complete' ? 'bg-autobg text-auto' : doc.blocking ? 'bg-dangerbg text-danger' : 'bg-surface2 text-muted'}`}>
          {doc.blocking ? <OctagonAlert size={18} aria-hidden /> : st.status === 'complete' ? <CircleCheck size={18} aria-hidden /> : doc.panel === 'cert' ? <FileCheck2 size={18} aria-hidden /> : <Stamp size={18} aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted num">{label} {n}</span>
            <ReqPill r={doc.requirement} />
            <Pill>{SIDE_LABEL[doc.side]}</Pill>
            {st.stale > 0 && <Pill tone="manual">{st.stale} out of date</Pill>}
          </div>
          <h4 className="mt-1 text-[14.5px] font-bold leading-snug">{doc.title}</h4>
          <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{doc.issuer}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-32 shrink-0 sm:w-44"><Bar pct={doc.blocking ? 0 : st.pct} tone={doc.blocking ? 'danger' : undefined} /></div>
            <span className={`text-[12px] font-semibold num ${doc.blocking ? 'text-danger' : st.status === 'complete' ? 'text-auto' : 'text-ink'}`}>{statusLine}</span>
          </div>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className="inline-flex items-center gap-1 text-[11.5px] text-muted"><Clock size={12} aria-hidden />{doc.leadTime.split(';')[0].split(' (')[0]}</span>
          <ChevronDown size={16} className={`text-muted transition ${open ? 'rotate-180' : ''}`} aria-hidden />
        </div>
      </button>

      {open && (
        <div id={`body-${doc.key}`} className="border-t border-line px-4 pb-4 pt-3 animate-rise">
          {doc.blocking && <div className="mb-3 flex items-start gap-2 rounded-md bg-dangerbg p-2.5 text-[12.5px] font-semibold text-danger"><OctagonAlert size={15} className="mt-0.5 shrink-0" aria-hidden />{doc.blocking}</div>}
          <div className="mb-3 rounded-md bg-surface2 p-2.5 text-[12.5px] leading-snug">
            <span className="font-semibold">Why: </span>{doc.reason}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-muted">
              {doc.legal && <span>Basis: {doc.legal}</span>}
              {doc.portal && <span>Portal: {doc.portal}</span>}
              <span>Lead time: {doc.leadTime}</span>
              {doc.source && (doc.source.url ? <a className="inline-flex items-center gap-1 text-brand hover:underline" href={doc.source.url} target="_blank" rel="noreferrer">{doc.source.label}<ExternalLink size={11} aria-hidden /></a> : <span>{doc.source.label}</span>)}
            </div>
          </div>

          <AutoTier item={item} />
          <ManualTier item={item} remaining={remainingManual} />

          {(st.errors.length > 0 || st.warns.length > 0) && (
            <div className="mt-3 rounded-md border border-line p-2.5">
              <div className="eyebrow mb-1">Checklist validation</div>
              <ul className="space-y-1 text-[12px]">
                {[...st.errors, ...st.warns].slice(0, 8).map((f) => (
                  <li key={f.def.key}>
                    <button className="flex items-start gap-1.5 text-left hover:underline" onClick={() => document.getElementById(fid(doc, f))?.focus()}>
                      {f.issue?.level === 'error' ? <OctagonAlert size={12} className="mt-0.5 shrink-0 text-danger" aria-hidden /> : <TriangleAlert size={12} className="mt-0.5 shrink-0 text-manual" aria-hidden />}
                      <span><strong>{f.def.label}</strong> — {f.issue?.msg}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className="btn-primary" onClick={() => setPreview(doc.key)}><Eye size={14} aria-hidden />Preview</button>
            <button className="btn-ghost" onClick={onPdf}><Download size={14} aria-hidden />Download PDF</button>
            {!inArtifactViewer() && <button className="btn-ghost" onClick={() => { setPreview(doc.key); setTimeout(() => window.print(), 350); }}><Printer size={14} aria-hidden />Print</button>}
            <button className="btn-quiet ml-auto" onClick={() => resetDoc(doc)}><RotateCcw size={13} aria-hidden />Reset document</button>
          </div>
        </div>
      )}
    </article>
  );
}

const fid = (doc: DocSpec, f: FieldState) => `f-${doc.key.replace(/[^a-z0-9]/gi, '')}-${f.def.key}`;

function AutoTier({ item }: { item: StackItem }) {
  const { doc, st } = item;
  const { setOverride, setDocValue } = useStore();
  const docs = [doc];
  const autos = st.fields.filter((f) => f.kind !== 'manual');
  if (!autos.length) return null;
  return (
    <div className="rounded-lg border border-auto/25 bg-autobg/30 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <AutoTag />
        <span className="text-[11.5px] text-muted num">{autos.length} fields · edit the master form, or unlock a field to change it on this document only</span>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        {autos.map((f) => (
          <div key={f.def.key} className={`min-w-0 ${f.def.full || (f.value?.length ?? 0) > 60 ? 'sm:col-span-2' : ''}`}>
            <dt className="mb-0.5 flex items-center gap-1 text-[11.5px] font-semibold text-muted">
              {f.kind === 'computed' ? <Info size={11} aria-hidden /> : f.overridden ? <Pencil size={11} className="text-info" aria-hidden /> : <Lock size={11} aria-hidden />}
              <span className="truncate">{f.def.label}</span>
              {f.stale && <span className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-manual" title="Master value changed — apply to update" />}
              {f.kind === 'auto' && (
                f.overridden
                  ? <button className="ml-auto inline-flex items-center gap-0.5 text-[11px] text-info hover:underline" onClick={() => setOverride(doc.key, f.def.key, false, docs)}><Link2 size={11} aria-hidden />Re-link</button>
                  : <button className="ml-auto inline-flex items-center gap-0.5 text-[11px] text-muted hover:text-ink" onClick={() => setOverride(doc.key, f.def.key, true)} aria-label={`Edit ${f.def.label} on this document only`}><Pencil size={11} aria-hidden />Edit here</button>
              )}
            </dt>
            <dd>
              {f.overridden ? (
                <input id={fid(doc, f)} value={f.value} onChange={(e) => setDocValue(doc.key, f.def.key, e.target.value)} className="field-input border-info/40 bg-infobg/30" />
              ) : (
                <div id={fid(doc, f)} tabIndex={-1} className={`min-h-[32px] rounded-md border px-2.5 py-1.5 text-[13px] leading-snug ${f.value ? 'border-auto/20 bg-surface' : 'border-danger/40 bg-dangerbg/40 text-danger'} ${f.stale ? 'border-manual/50' : ''} break-words`}>
                  {f.value || (f.issue?.msg ?? '—')}
                  {f.stale && f.value && <span className="mt-0.5 block text-[11px] text-manual">Master now: {f.live || '(blank)'}</span>}
                </div>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ManualTier({ item, remaining }: { item: StackItem; remaining: number }) {
  const { doc, st } = item;
  const setDocValue = useStore((s) => s.setDocValue);
  const manual = st.fields.filter((f) => f.kind === 'manual');
  if (!manual.length) return null;
  const sections = [...new Set(manual.map((f) => f.section))];
  return (
    <div className="mt-3 rounded-lg border border-manual/30 bg-manualbg/30 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <ManualTag />
        <span className="text-[11.5px] text-muted num">{remaining ? `${remaining} still to fill` : 'All document-specific fields filled'}</span>
      </div>
      {sections.map((s) => (
        <fieldset key={s} className="mt-2 first:mt-0">
          <legend className="eyebrow mb-1.5">{s}</legend>
          <div className="grid gap-x-3 gap-y-2.5 sm:grid-cols-2">
            {manual.filter((f) => f.section === s).map((f) => (
              <FieldInput key={f.def.key} id={fid(doc, f)} def={f.def} value={f.value} onChange={(v) => setDocValue(doc.key, f.def.key, v)} issue={f.issue} showIssue={!!f.value} />
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
