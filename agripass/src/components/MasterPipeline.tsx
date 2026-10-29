import { useState, useRef, useEffect } from 'react';
import { Building2, User, Ship, Package, Save, FolderOpen, Trash2, Wand2, ChevronDown, Eraser, FlaskRound, Lock } from 'lucide-react';
import { useStore } from '../store';
import { masterSections, type MasterSectionId, isSampleValue } from '../data/masterSchema';
import type { FieldDef, Issue, Master } from '../data/types';
import { FieldInput } from './FieldInput';
import { Pill, SectionHead } from './ui';
import type { StackItem } from '../lib/useStack';
import { commodityById } from '../data/commodities';
import { byId } from '../data/countries';

const ICON: Record<MasterSectionId, typeof Building2> = { exporter: Building2, consignee: User, shipment: Ship, product: Package };

export const masterIssue = (def: FieldDef, m: Master): Issue | null => {
  const v = m[def.key] ?? '';
  if (def.required && def.type !== 'checkbox' && !String(v).trim()) return { level: 'error', msg: 'Required — used on several documents.' };
  return v && def.check ? def.check(v, m) : null;
};

export function MasterPipeline({ items, onApply }: { items: StackItem[]; onApply: () => void }) {
  const { master, setMaster, category, commodityId, destId } = useStore();
  const [tab, setTab] = useState<MasterSectionId>('exporter');
  const [open, setOpen] = useState(true);
  const secs = masterSections(category, commodityById(commodityId), byId(destId));
  const stale = items.reduce((a, i) => a + i.st.stale, 0);
  const autoCount = items.reduce((a, i) => a + i.st.fields.filter((f) => f.kind === 'auto').length, 0);
  const hasSample = Object.values(master).some(isSampleValue);
  // how many documents use each master key
  const usage = (k: string) => items.filter((i) => i.doc.sections.some((s) => s.fields.some((f) => f.from === k || f.from?.includes(`{${k}}`)))).length;

  return (
    <section aria-labelledby="master-h" className="gutter mx-auto max-w-[1440px] pt-8">
      <SectionHead step="Step 2 · Single-window master data" title="Type it once. Every document fills itself."
        blurb={`${autoCount} fields across ${items.length} documents mirror this form. Profiles and templates are saved in this browser.`}
        right={
          <div className="flex flex-wrap items-center gap-2">
            {hasSample && <Pill tone="info"><FlaskRound size={11} aria-hidden /> Sample data loaded</Pill>}
            <button className="btn-primary" onClick={onApply}>
              <Wand2 size={15} aria-hidden /> Apply master data to all documents
              {stale > 0 && <span className="ml-1 rounded-full bg-brandink/20 px-1.5 text-[11px] num">{stale}</span>}
            </button>
          </div>
        } />
      <div className="rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
          <ProfileBar />
          <button className="btn-quiet" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="master-body">
            {open ? 'Collapse' : 'Expand'} <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        </div>
        {open && (
          <div id="master-body" className="grid md:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="flex gap-1 overflow-x-auto border-b border-line p-2 md:flex-col md:border-b-0 md:border-r" role="tablist" aria-label="Master data sections">
              {secs.map((s) => {
                const Icon = ICON[s.id];
                const req = s.fields.filter((f) => f.required && f.type !== 'checkbox' && f.key !== 'originCountry');
                const ok = req.filter((f) => !masterIssue(f, master) && master[f.key]);
                const bad = s.fields.filter((f) => masterIssue(f, master)?.level === 'error' && master[f.key]);
                return (
                  <button key={s.id} role="tab" id={`mtab-${s.id}`} aria-selected={tab === s.id} onClick={() => setTab(s.id)}
                    className={`flex min-w-[150px] items-center gap-2 rounded-lg px-2.5 py-2 text-left md:min-w-0 ${tab === s.id ? 'bg-brandsoft text-brand' : 'hover:bg-surface2'}`}>
                    <Icon size={16} aria-hidden className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold">{s.title}</span>
                      <span className={`block text-[11px] num ${bad.length ? 'text-danger' : ok.length === req.length ? 'text-auto' : 'text-muted'}`}>
                        {bad.length ? `${bad.length} invalid` : `${ok.length}/${req.length} required`}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
            <div className="min-w-0 p-4">
              {secs.filter((s) => s.id === tab).map((s) => (
                <div key={s.id}>
                  <p className="mb-3 text-[12.5px] text-muted">{s.blurb}</p>
                  <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
                    {s.fields.map((f) => f.key === 'originCountry' ? (
                      <div key={f.key} className="min-w-0">
                        <div className="mb-1 text-[12px] font-semibold text-muted">Country of origin</div>
                        <div className="field-input flex items-center gap-2 bg-surface2"><Lock size={13} className="text-muted" aria-hidden />India</div>
                      </div>
                    ) : (
                      <div key={f.key} className={`relative min-w-0 ${f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                        <FieldInput id={`m-${f.key}`} def={{ ...f, full: false }} value={master[f.key] ?? ''} onChange={(v) => setMaster(f.key, v)} issue={master[f.key] ? masterIssue(f, master) : null} tone="plain" />
                        {usage(f.key) > 0 && <span className="absolute right-0 top-0 text-[10.5px] text-auto num" title="Documents that use this field">→ {usage(f.key)} doc{usage(f.key) > 1 ? 's' : ''}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Popover({ label, icon, children, id }: { label: string; icon: React.ReactNode; children: (close: () => void) => React.ReactNode; id: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button id={id} className="btn-ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>{icon}{label}<ChevronDown size={13} aria-hidden /></button>
      {open && <div className="absolute left-0 z-40 mt-1 w-72 rounded-lg border border-line bg-surface p-2 shadow-xl animate-rise">{children(() => setOpen(false))}</div>}
    </div>
  );
}

function SaveForm({ id, placeholder, onSave }: { id: string; placeholder: string; onSave: (n: string) => void }) {
  const [name, setName] = useState('');
  return (
    <form className="flex gap-1.5" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onSave(name.trim()); setName(''); } }}>
      <input id={id} value={name} onChange={(e) => setName(e.target.value)} placeholder={placeholder} className="field-input" />
      <button type="submit" className="btn-primary px-2.5" disabled={!name.trim()}><Save size={14} aria-hidden />Save</button>
    </form>
  );
}

function ProfileList({ items, onLoad, onDelete, empty }: { items: { id: string; name: string; savedAt: number }[]; onLoad: (id: string) => void; onDelete: (id: string) => void; empty: string }) {
  if (!items.length) return <p className="px-1 py-2 text-[12px] text-muted">{empty}</p>;
  return (
    <ul className="mt-1 max-h-52 overflow-y-auto">
      {items.map((p) => (
        <li key={p.id} className="flex items-center gap-1 rounded hover:bg-surface2">
          <button className="min-w-0 flex-1 truncate px-2 py-1.5 text-left text-[13px]" onClick={() => onLoad(p.id)}>{p.name}<span className="ml-1 text-[11px] text-muted">{new Date(p.savedAt).toLocaleDateString()}</span></button>
          <button className="btn-quiet px-1.5" aria-label={`Delete ${p.name}`} onClick={() => onDelete(p.id)}><Trash2 size={13} /></button>
        </li>
      ))}
    </ul>
  );
}

function ProfileBar() {
  const s = useStore();
  const [confirmClear, setConfirmClear] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Popover id="pf-exp" label="Exporter profile" icon={<Building2 size={14} aria-hidden />}>
        {(close) => <>
          <div className="eyebrow mb-1">Save current exporter</div>
          <SaveForm id="pf-exp-name" placeholder={s.master.exporterName || 'Profile name'} onSave={(n) => { s.saveProfile('exporter', n); close(); }} />
          <div className="eyebrow mb-0.5 mt-3">Load</div>
          <ProfileList items={s.exporters} empty="No saved exporter profiles yet." onLoad={(id) => { s.loadProfile('exporter', id); close(); }} onDelete={(id) => s.deleteProfile('exporter', id)} />
        </>}
      </Popover>
      <Popover id="pf-con" label="Consignee" icon={<User size={14} aria-hidden />}>
        {(close) => <>
          <div className="eyebrow mb-1">Save current consignee</div>
          <SaveForm id="pf-con-name" placeholder={s.master.consigneeName || 'Buyer name'} onSave={(n) => { s.saveProfile('consignee', n); close(); }} />
          <div className="eyebrow mb-0.5 mt-3">Load</div>
          <ProfileList items={s.consignees} empty="No saved consignees yet." onLoad={(id) => { s.loadProfile('consignee', id); close(); }} onDelete={(id) => s.deleteProfile('consignee', id)} />
        </>}
      </Popover>
      <Popover id="pf-tpl" label="Templates" icon={<FolderOpen size={14} aria-hidden />}>
        {(close) => <>
          <div className="eyebrow mb-1">Save whole shipment as template</div>
          <SaveForm id="pf-tpl-name" placeholder="e.g. Maize seed → Kenya, 20 t FCL" onSave={(n) => { s.saveTemplate(n); close(); }} />
          <div className="eyebrow mb-0.5 mt-3">Load template</div>
          <ProfileList items={s.templates} empty="No templates yet." onLoad={(id) => { s.loadTemplate(id); close(); }} onDelete={(id) => s.deleteTemplate(id)} />
        </>}
      </Popover>
      <button className="btn-quiet" onClick={() => { s.loadSample(); s.toast('Sample data loaded. It is marked "Sample:" and is not real.', 'info'); }}><FlaskRound size={14} aria-hidden />Load sample</button>
      {confirmClear ? (
        <span className="flex items-center gap-1 rounded-md bg-dangerbg px-1.5 py-0.5 text-[12px] text-danger">
          Clear all master data?
          <button className="btn-quiet px-1.5 text-danger" onClick={() => { s.clearMaster('all'); setConfirmClear(false); s.toast('Master form cleared.', 'info'); }}>Clear</button>
          <button className="btn-quiet px-1.5" onClick={() => setConfirmClear(false)}>Cancel</button>
        </span>
      ) : (
        <button className="btn-quiet" onClick={() => setConfirmClear(true)}><Eraser size={14} aria-hidden />Clear</button>
      )}
    </div>
  );
}
