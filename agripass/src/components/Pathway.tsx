import { useMemo } from 'react';
import { ArrowRight, ExternalLink, Network, Plus, Check, TriangleAlert, OctagonAlert, Info, Landmark, Leaf } from 'lucide-react';
import { useStore } from '../store';
import { COUNTRIES, flag, fairsUrl } from '../data/countries';
import { COMMODITIES } from '../data/commodities';
import { CATEGORIES, HARMONY_LABEL, type CountryProfile } from '../data/types';
import { pathwayFor, fairsGroup } from '../lib/pathway';
import { Combobox } from './Combobox';
import { CAT_ICON, DepthPill, Pill, SectionHead } from './ui';

const REGION_ORDER = ['East Africa', 'West Africa', 'Central Africa', 'Southern Africa', 'Indian Ocean', 'North Africa', 'Middle East', 'South Asia', 'Southeast Asia', 'Pacific', 'Central Asia', 'Caucasus', 'South America'];

export function Pathway() {
  const { destId, category, commodityId, setDest, setCategory, setCommodity } = useStore();
  const country = COUNTRIES.find((c) => c.id === destId)!;
  const commodity = COMMODITIES.find((c) => c.id === commodityId);
  const options = useMemo(
    () => [...COUNTRIES].sort((a, b) => REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region) || a.name.localeCompare(b.name))
      .map((c) => ({ value: c.id, label: c.name, group: c.region, prefix: flag(c.id), meta: c.depth === 'profiled' ? 'Full profile' : c.blocs.slice(0, 2).join(' · ') })),
    [],
  );

  return (
    <section aria-labelledby="pathway-h" className="gutter mx-auto max-w-[1440px] pt-6">
      <SectionHead step="Step 1 · Regulatory pathway" title="Where is this consignment going?" blurb={`${COUNTRIES.length} destinations: all 79 from your FAIRS spreadsheet plus UAE, Saudi Arabia, Brazil, Thailand and Malaysia.`} />
      <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
        <div className="grid items-end gap-3 lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)_minmax(0,1.3fr)]">
          <div className="min-w-0">
            <label className="eyebrow mb-1 block">Source country</label>
            <div className="flex items-center gap-2 rounded-md border border-line bg-surface2 px-2.5 py-1.5">
              <span className="text-[17px] leading-none">{flag('IN')}</span>
              <span className="font-semibold">India</span>
              <span className="truncate text-[11.5px] text-muted">APEDA · NPPO (PPQS) · CIB&amp;RC · DGFT</span>
            </div>
          </div>
          <ArrowRight className="mx-auto hidden text-muted lg:block" size={18} aria-hidden />
          <div className="min-w-0">
            <label htmlFor="dest" className="eyebrow mb-1 block">Destination country</label>
            <Combobox id="dest" label="Destination country" value={destId} options={options} onChange={setDest} placeholder="Search 84 countries, regions…" />
          </div>
          <div className="min-w-0">
            <label htmlFor="commodity" className="eyebrow mb-1 block">Commodity / variety &amp; HS code</label>
            <div className="flex gap-2">
              <select id="commodity" value={commodityId} onChange={(e) => setCommodity(e.target.value)} className="field-input min-w-0 flex-1 font-semibold">
                {COMMODITIES.filter((c) => c.category === category).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <span className="flex shrink-0 items-center rounded-md border border-line bg-surface2 px-2 font-mono text-[12.5px]" title="HS code (6-digit subheading)">HS {commodity?.hs}</span>
            </div>
          </div>
        </div>

        <div className="mt-4" role="tablist" aria-label="Agri-input category">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
            {CATEGORIES.map((c) => {
              const Icon = CAT_ICON[c.id];
              const on = c.id === category;
              return (
                <button key={c.id} id={`cat-${c.id}`} role="tab" aria-selected={on} onClick={() => setCategory(c.id)}
                  className={`group flex min-w-0 items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition ${on ? 'border-brand bg-brandsoft' : 'border-line bg-surface hover:bg-surface2'}`}>
                  <Icon size={18} className={`mt-0.5 shrink-0 ${on ? 'text-brand' : 'text-muted'}`} aria-hidden />
                  <span className="min-w-0">
                    <span className={`block text-[13px] font-semibold leading-tight ${on ? 'text-brand' : ''}`}>{c.label}</span>
                    <span className="mt-0.5 hidden text-[11px] leading-snug text-muted md:line-clamp-2">{c.focus}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {(commodity?.hsNote || commodity?.restrictedExport) && (
          <div className="mt-3 flex flex-col gap-1.5">
            {commodity.hsNote && <p className="flex items-start gap-1.5 text-[12.5px] text-info"><Info size={14} className="mt-0.5 shrink-0" aria-hidden />{commodity.hsNote}</p>}
            {commodity.restrictedExport && <p className="flex items-start gap-1.5 text-[12.5px] text-manual"><TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden />India export policy: {commodity.restrictedExport}</p>}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Harmonized country={country} />
        <CountryProfileCard country={country} />
      </div>
    </section>
  );
}

function Chip({ c }: { c: CountryProfile }) {
  const { setDest, compare, toggleCompare } = useStore();
  const inCmp = compare.includes(c.id);
  return (
    <span className="inline-flex overflow-hidden rounded-full border border-line bg-surface text-[12.5px]">
      <button type="button" onClick={() => setDest(c.id)} className="flex items-center gap-1.5 py-1 pl-2 pr-1.5 hover:bg-surface2" title={`Switch destination to ${c.name}`}>
        <span className="leading-none">{flag(c.id)}</span>{c.name}
      </button>
      <button type="button" onClick={() => toggleCompare(c.id)} aria-pressed={inCmp} aria-label={`${inCmp ? 'Remove' : 'Add'} ${c.name} ${inCmp ? 'from' : 'to'} comparison`}
        className={`border-l border-line px-1.5 ${inCmp ? 'bg-brand text-brandink' : 'text-muted hover:bg-surface2'}`} title="Multi-destination compare">
        {inCmp ? <Check size={12} /> : <Plus size={12} />}
      </button>
    </span>
  );
}

function Harmonized({ country }: { country: CountryProfile }) {
  const category = useStore((s) => s.category);
  const groups = pathwayFor(country, category);
  const main = groups.filter((g) => g.domain !== 'plantHealth');
  const ph = groups.filter((g) => g.domain === 'plantHealth');
  const fg = fairsGroup(country);
  const cat = CATEGORIES.find((c) => c.id === category)!;
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2">
        <Network size={16} className="text-brand" aria-hidden />
        <h3 className="text-[14px] font-bold">Harmonized regulatory pathway</h3>
        <span className="text-[12px] text-muted">· {cat.short}</span>
      </div>
      {main.length ? (
        <p className="mt-2 text-[14px] leading-snug">
          <strong>{country.name}</strong> follows{' '}
          {main.map((g, i) => <span key={g.bloc.id}>{i > 0 && (i === main.length - 1 ? ' and ' : ', ')}<strong className="text-brand">{g.instrument.instrument.split(' · ')[0]}</strong></span>)}.
        </p>
      ) : (
        <p className="mt-2 text-[14px] leading-snug"><strong>{country.name}</strong> runs a <strong>national pathway</strong> for {cat.label.toLowerCase()}. No regional instrument applies{country.blocs.length ? `, although it is a member of ${country.blocs.join(', ')}` : ''}.</p>
      )}
      <div className="mt-3 flex flex-col gap-3">
        {[...main, ...ph].map((g) => (
          <div key={g.bloc.id + g.domain} className={`rounded-lg border p-3 ${g.domain === 'plantHealth' ? 'border-dashed border-line' : 'border-brand/25 bg-brandsoft/40'}`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <Pill tone="brand">{g.bloc.id}</Pill>
              <span className="text-[12.5px] font-semibold">{g.bloc.name}</span>
              <Pill tone={g.instrument.level === 'single' ? 'auto' : g.instrument.level === 'catalogue' ? 'info' : 'neutral'}>{HARMONY_LABEL[g.instrument.level].label}</Pill>
              {g.domain === 'plantHealth' && <Pill><Leaf size={11} aria-hidden /> Plant health</Pill>}
            </div>
            <p className="mt-1.5 text-[12.5px] leading-snug text-muted"><span className="text-ink">{g.instrument.instrument}.</span> {g.instrument.effect}</p>
            {g.siblings.length > 0 && (
              <div className="mt-2">
                <div className="eyebrow mb-1">Same pathway · click to switch, + to compare</div>
                <div className="flex flex-wrap gap-1.5">{g.siblings.map((s) => <Chip key={s.id} c={s} />)}</div>
              </div>
            )}
          </div>
        ))}
        {g0note(country)}
        {fg.members.length > 0 && (
          <div className="rounded-lg bg-surface2 p-3">
            <div className="eyebrow mb-1">FAIRS reporting group · USDA office {fg.hubName ? `covering ${fg.hubName}` : ''}</div>
            <p className="mb-2 text-[12px] text-muted">These countries share a FAIRS report in your spreadsheet. That is a reporting arrangement, not a shared legal pathway.</p>
            <div className="flex flex-wrap gap-1.5">{fg.members.slice(0, 14).map((s) => <Chip key={s.id} c={s} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const g0note = (c: CountryProfile) =>
  c.blocs.some((b) => b === 'ECOWAS' || b === 'AES') ? (
    <p className="flex items-start gap-1.5 text-[12px] text-muted"><Info size={13} className="mt-0.5 shrink-0" aria-hidden />Mali, Burkina Faso and Niger left ECOWAS in January 2025 (AES); UEMOA and CILSS instruments still bind them.</p>
  ) : null;

function CountryProfileCard({ country: c }: { country: CountryProfile }) {
  const f = fairsUrl(c);
  const rows: [string, string | undefined][] = [
    ['Plant health (NPPO)', c.auth.nppo], ['Seed regulator', c.auth.seed], ['Fertilizer regulator', c.auth.fert], ['Pesticide regulator', c.auth.pest],
    ['Biosafety', c.auth.biosafety], ['Standards / conformity', c.conformity ? `${c.conformity.scheme} — ${c.conformity.body}` : c.auth.standards], ['Single window', c.singleWindow],
  ];
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Landmark size={16} className="text-brand" aria-hidden />
        <h3 className="text-[14px] font-bold">{flag(c.id)} {c.name} — regulators</h3>
        <DepthPill d={c.depth} />
        <Pill tone={c.gmo === 'ban' ? 'danger' : c.gmo === 'strict' ? 'manual' : 'neutral'}>GMO: {c.gmo}</Pill>
      </div>
      {c.alerts?.map((a, i) => (
        <div key={i} className={`mt-2 flex items-start gap-2 rounded-md p-2 text-[12.5px] ${a.level === 'block' ? 'bg-dangerbg text-danger' : a.level === 'warn' ? 'bg-manualbg text-manual' : 'bg-infobg text-info'}`}>
          {a.level === 'block' ? <OctagonAlert size={15} className="mt-0.5 shrink-0" aria-hidden /> : a.level === 'warn' ? <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden /> : <Info size={15} className="mt-0.5 shrink-0" aria-hidden />}
          <span>{a.text}</span>
        </div>
      ))}
      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 text-[12.5px] sm:grid-cols-[150px_minmax(0,1fr)]">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      {c.gmoNote && <p className="mt-2 text-[12px] text-muted">{c.gmoNote}</p>}
      {c.notes?.length ? <ul className="mt-2 list-disc space-y-0.5 pl-4 text-[12px] text-muted">{c.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[12px]">
        <span className="text-muted">Source:</span>
        {f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand hover:underline">{f.label}<ExternalLink size={12} aria-hidden /></a> : <span>{f.label}</span>}
        {c.fairs?.countryReportUrl && <a href={c.fairs.countryReportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline">Country Report<ExternalLink size={12} aria-hidden /></a>}
      </div>
    </div>
  );
}
