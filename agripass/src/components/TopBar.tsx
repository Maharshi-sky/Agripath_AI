import { useEffect, useRef, useState } from 'react';
import { Wand2, Download, ChevronDown, Moon, Sun, Files, FileArchive, FileJson } from 'lucide-react';
import { flag } from '../data/countries';
import { CATEGORIES, type CountryProfile, type Category } from '../data/types';
import { Bar } from './ui';

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
      <rect x="1.5" y="1.5" width="29" height="29" rx="7" fill="rgb(var(--c-brand))" />
      <path d="M16 25V13" stroke="rgb(var(--c-brandink))" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M16 16c0-4 2.8-6.6 7-6.8-.2 4.2-2.9 6.8-7 6.8Z" fill="rgb(var(--c-brandink))" />
      <path d="M16 19.5c0-3.4-2.4-5.6-6-5.8.2 3.6 2.5 5.8 6 5.8Z" fill="rgb(var(--c-brandink))" opacity=".75" />
      <circle cx="16" cy="16" r="12.2" fill="none" stroke="rgb(var(--c-brandink))" strokeWidth="1" strokeDasharray="1.6 2.2" opacity=".55" />
    </svg>
  );
}

const getTheme = () => { try { return localStorage.getItem('agp-theme'); } catch { return null; } };

export function TopBar({ country, category, product, readiness, stale, onApply, onExport }: {
  country: CountryProfile; category: Category; product: string; readiness: number; stale: number; onApply: () => void; onExport: (k: 'pack' | 'zip' | 'json') => void;
}) {
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState<string | null>(getTheme());
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    else document.documentElement.removeAttribute('data-theme');
  }, [theme]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const isDark = theme === 'dark' || (!theme && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  const toggle = () => { const t = isDark ? 'light' : 'dark'; setTheme(t); try { localStorage.setItem('agp-theme', t); } catch { /* ignore */ } };

  return (
    <header className="no-print sticky z-30 border-b border-line bg-surface/95 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="gutter mx-auto flex max-w-[1440px] items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          <Mark />
          <div className="leading-tight">
            <div className="wide text-[15.5px] font-extrabold tracking-tight">AgriPass Global</div>
            <div className="hidden text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted sm:block">Single-window agri-compliance</div>
          </div>
        </div>
        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 text-[13px] lg:flex">
          <span className="truncate rounded-full bg-surface2 px-3 py-1">{flag('IN')} India → {flag(country.id)} <strong>{country.name}</strong> · {CATEGORIES.find((c) => c.id === category)!.short} · <span className="text-muted">{product}</span></span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden w-28 sm:block" title="Mandatory-field readiness">
            <div className="flex justify-between text-[10.5px] font-semibold text-muted"><span>Readiness</span><span className="num">{readiness}%</span></div>
            <Bar pct={readiness} />
          </div>
          <button className={stale ? 'btn-primary' : 'btn-ghost'} onClick={onApply} title="Apply master data to all documents">
            <Wand2 size={15} aria-hidden /><span className="hidden md:inline">Apply master data</span>
            {stale > 0 && <span className="rounded-full bg-brandink/20 px-1.5 text-[11px] num">{stale}</span>}
          </button>
          <div ref={ref} className="relative">
            <button className="btn-ghost" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-haspopup="menu"><Download size={15} aria-hidden /><span className="hidden sm:inline">Export</span><ChevronDown size={13} aria-hidden /></button>
            {menu && (
              <div role="menu" className="absolute right-0 z-40 mt-1 w-64 rounded-lg border border-line bg-surface p-1 shadow-xl animate-rise">
                {([['pack', 'Unified document pack (PDF)', Files], ['zip', 'All documents (ZIP of PDFs)', FileArchive], ['json', 'Compliance dossier (JSON)', FileJson]] as const).map(([k, l, I]) => (
                  <button key={k} role="menuitem" className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-[13px] hover:bg-surface2" onClick={() => { setMenu(false); onExport(k); }}><I size={15} className="text-brand" aria-hidden />{l}</button>
                ))}
              </div>
            )}
          </div>
          <button className="btn-quiet" onClick={toggle} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>{isDark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </div>
    </header>
  );
}
