import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

export interface Option { value: string; label: string; group?: string; prefix?: string; meta?: string }

export function Combobox({ id, value, options, onChange, placeholder = 'Search…', label }: { id: string; value: string; options: Option[]; onChange: (v: string) => void; placeholder?: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [hi, setHi] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const cur = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? options.filter((o) => (o.label + ' ' + (o.group ?? '') + ' ' + (o.meta ?? '')).toLowerCase().includes(s)) : options;
  }, [q, options]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  useEffect(() => { setHi(0); }, [q]);
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-i="${hi}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [hi, open]);

  const choose = (v: string) => { onChange(v); setOpen(false); setQ(''); };
  let lastGroup = '';

  return (
    <div ref={ref} className="relative">
      <button id={id} type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="field-input flex items-center gap-2 text-left">
        <span className="text-[17px] leading-none">{cur?.prefix}</span>
        <span className="min-w-0 flex-1 truncate font-semibold">{cur?.label ?? placeholder}</span>
        {cur?.meta && <span className="hidden truncate text-[11px] text-muted sm:inline">{cur.meta}</span>}
        <ChevronDown size={15} className="shrink-0 text-muted" aria-hidden />
      </button>
      {open && (
        <div className="absolute z-40 mt-1 w-full min-w-[260px] overflow-hidden rounded-lg border border-line bg-surface shadow-xl animate-rise">
          <div className="flex items-center gap-2 border-b border-line px-2.5 py-2">
            <Search size={14} className="text-muted" aria-hidden />
            <input id={`${id}-q`} autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
              className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-muted/60"
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(filtered.length - 1, h + 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
                if (e.key === 'Enter' && filtered[hi]) { e.preventDefault(); choose(filtered[hi].value); }
                if (e.key === 'Escape') setOpen(false);
              }} role="combobox" aria-controls={`${id}-list`} aria-expanded="true" />
          </div>
          <ul id={`${id}-list`} ref={listRef} role="listbox" className="max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 && <li className="px-3 py-3 text-[13px] text-muted">No match for “{q}”.</li>}
            {filtered.map((o, i) => {
              const g = o.group && o.group !== lastGroup ? o.group : null;
              if (o.group) lastGroup = o.group;
              return (
                <li key={o.value} role="presentation">
                  {g && <div className="eyebrow px-3 pb-1 pt-2">{g}</div>}
                  <button type="button" role="option" aria-selected={o.value === value} data-i={i}
                    onMouseEnter={() => setHi(i)} onClick={() => choose(o.value)}
                    className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13.5px] ${i === hi ? 'bg-surface2' : ''} ${o.value === value ? 'font-semibold text-brand' : ''}`}>
                    <span className="w-5 text-[16px] leading-none">{o.prefix}</span>
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {o.meta && <span className="shrink-0 text-[11px] text-muted">{o.meta}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
