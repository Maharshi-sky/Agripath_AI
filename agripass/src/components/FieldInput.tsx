import { CircleAlert, TriangleAlert, Sparkles } from 'lucide-react';
import type { FieldDef, Issue } from '../data/types';

export function FieldInput({ id, def, value, onChange, issue, showIssue = true, tone = 'manual' }: {
  id: string; def: FieldDef; value: string; onChange: (v: string) => void; issue?: Issue | null; showIssue?: boolean; tone?: 'manual' | 'plain';
}) {
  const err = showIssue && issue?.level === 'error';
  const warn = showIssue && issue?.level === 'warn';
  const ring = err ? 'border-danger/60' : warn ? 'border-manual/60' : tone === 'manual' && def.required && !value ? 'border-manual/40' : '';
  const describedBy = issue && showIssue ? `${id}-msg` : def.hint ? `${id}-hint` : undefined;
  const common = { id, 'aria-invalid': err || undefined, 'aria-describedby': describedBy } as const;

  let control;
  if (def.type === 'checkbox') {
    control = (
      <label htmlFor={id} className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-[13px] ${value === 'true' ? 'border-auto/40 bg-autobg/50' : `border-line bg-surface ${ring}`}`}>
        <input {...common} type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : '')} className="mt-0.5 h-4 w-4 accent-[rgb(var(--c-brand))]" />
        <span className="leading-snug">{def.label}{def.required && <span className="text-manual"> *</span>}</span>
      </label>
    );
  } else if (def.type === 'select') {
    control = (
      <select {...common} value={value} onChange={(e) => onChange(e.target.value)} className={`field-input ${ring}`}>
        <option value="">{def.required ? 'Select…' : '—'}</option>
        {(def.options ?? []).filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
        {value && !(def.options ?? []).includes(value) && <option value={value}>{value}</option>}
      </select>
    );
  } else if (def.type === 'textarea') {
    control = <textarea {...common} value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={def.placeholder} className={`field-input resize-y ${ring}`} />;
  } else {
    control = (
      <div className="relative">
        <input {...common} type={def.type === 'number' ? 'text' : def.type ?? 'text'} inputMode={def.type === 'number' ? 'decimal' : undefined}
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={def.placeholder}
          className={`field-input ${def.unit ? 'pr-14' : ''} ${def.type === 'number' ? 'num' : ''} ${ring}`} />
        {def.unit && <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11.5px] text-muted">{def.unit}</span>}
      </div>
    );
  }

  return (
    <div className={`min-w-0 ${def.full || def.type === 'textarea' || (def.type === 'checkbox' && def.label.length > 50) ? 'sm:col-span-2' : ''}`}>
      {def.type !== 'checkbox' && (
        <label htmlFor={id} className="mb-1 block text-[12px] font-semibold text-muted">
          {def.label}{def.required && <span className="text-manual"> *</span>}
        </label>
      )}
      {control}
      {def.suggestions && def.suggestions.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {def.suggestions.map((s) => {
            const used = value.includes(s);
            return (
              <button key={s} type="button" disabled={used}
                onClick={() => onChange(def.type === 'textarea' && value ? `${value.trim()}\n${s}` : s)}
                className="inline-flex max-w-full items-start gap-1 rounded border border-dashed border-line px-1.5 py-0.5 text-left text-[11.5px] leading-snug text-muted hover:border-brand hover:text-brand disabled:opacity-40">
                <Sparkles size={11} className="mt-0.5 shrink-0" aria-hidden /><span className="min-w-0">{s}</span>
              </button>
            );
          })}
        </div>
      )}
      {issue && showIssue ? (
        <p id={`${id}-msg`} className={`mt-1 flex items-start gap-1 text-[11.5px] leading-snug ${err ? 'text-danger' : 'text-manual'}`}>
          {err ? <CircleAlert size={12} className="mt-0.5 shrink-0" aria-hidden /> : <TriangleAlert size={12} className="mt-0.5 shrink-0" aria-hidden />}{issue.msg}
        </p>
      ) : def.hint ? <p id={`${id}-hint`} className="mt-1 text-[11.5px] leading-snug text-muted">{def.hint}</p> : null}
    </div>
  );
}
