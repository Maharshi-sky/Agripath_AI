import type { ReactNode } from 'react';
import { Sprout, FlaskConical, SprayCan, Microscope, Tractor, Droplets, Lock, PenLine } from 'lucide-react';
import type { Category, Requirement, Side, Depth } from '../data/types';

export const CAT_ICON: Record<Category, typeof Sprout> = { seeds: Sprout, fertilizers: FlaskConical, agrochem: SprayCan, biologicals: Microscope, machinery: Tractor, irrigation: Droplets };

export function Pill({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'auto' | 'manual' | 'danger' | 'info' | 'brand'; className?: string }) {
  const t = {
    neutral: 'bg-surface2 text-muted border-line',
    auto: 'bg-autobg text-auto border-auto/25',
    manual: 'bg-manualbg text-manual border-manual/30',
    danger: 'bg-dangerbg text-danger border-danger/30',
    info: 'bg-infobg text-info border-info/25',
    brand: 'bg-brandsoft text-brand border-brand/25',
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-4 ${t} ${className}`}>{children}</span>;
}

export const AutoTag = () => <Pill tone="auto"><Lock size={11} aria-hidden /> Auto-filled from master</Pill>;
export const ManualTag = () => <Pill tone="manual"><PenLine size={11} aria-hidden /> Manual required</Pill>;

export function ReqPill({ r }: { r: Requirement }) {
  return <Pill tone={r === 'mandatory' ? 'danger' : r === 'conditional' ? 'manual' : 'neutral'}>{r === 'mandatory' ? 'Mandatory' : r === 'conditional' ? 'Conditional' : 'Recommended'}</Pill>;
}

export const SIDE_LABEL: Record<Side, string> = { india: 'India authority', destination: 'Destination authority', exporter: 'Exporter-issued', lab: 'Laboratory', 'third-party': 'Third-party agency' };

export function DepthPill({ d }: { d: Depth }) {
  return d === 'profiled' ? <Pill tone="brand">Full profile</Pill> : d === 'bloc' ? <Pill tone="info">Bloc-derived</Pill> : <Pill>Indicative</Pill>;
}

export function Bar({ pct, tone }: { pct: number; tone?: 'auto' | 'manual' | 'danger' }) {
  const t = tone ?? (pct === 100 ? 'auto' : pct >= 60 ? 'manual' : 'danger');
  const c = { auto: 'bg-auto', manual: 'bg-manual', danger: 'bg-danger' }[t];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${c} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({ pct, size = 64, label }: { pct: number; size?: number; label?: string }) {
  const r = size / 2 - 5;
  const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label ?? 'Readiness'} ${pct}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--c-surface2))" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct === 100 ? 'rgb(var(--c-auto))' : 'rgb(var(--c-brand))'} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * C} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .6s' }} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="rgb(var(--c-ink))" fontSize={size * 0.26} fontWeight={700} className="num">{pct}%</text>
    </svg>
  );
}

export function SectionHead({ step, title, blurb, right }: { step: string; title: string; blurb?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="eyebrow">{step}</div>
        <h2 className="wide text-[19px] font-bold leading-tight tracking-tight">{title}</h2>
        {blurb && <p className="mt-0.5 max-w-[68ch] text-[13px] text-muted">{blurb}</p>}
      </div>
      {right}
    </div>
  );
}
