import type { DocSpec, FieldDef, Issue, Master } from '../data/types';

export type FieldKind = 'auto' | 'computed' | 'manual';

export interface FieldState {
  def: FieldDef;
  section: string;
  kind: FieldKind;
  value: string;
  live: string; // what the master currently says (auto) or computed value
  stale: boolean;
  overridden: boolean;
  issue: Issue | null;
}

export interface DocState {
  fields: FieldState[];
  required: number;
  filled: number;
  pct: number;
  remaining: FieldState[];
  errors: FieldState[];
  warns: FieldState[];
  stale: number;
  status: 'blocked' | 'complete' | 'attention' | 'progress';
}

const display = (v?: string) => (v === 'true' ? 'Yes' : v === undefined || v === null ? '' : String(v));

/** Resolve a master reference: a key, or a template like "{productName} — {netWeight} kg". */
export function liveValue(def: FieldDef, master: Master): string {
  if (def.computed !== undefined) return def.computed;
  if (!def.from) return '';
  if (!def.from.includes('{')) return display(master[def.from]);
  const keys = [...def.from.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  if (keys.every((k) => !master[k])) return '';
  return def.from.replace(/\{(\w+)\}/g, (_, k) => display(master[k]) || '—');
}

export const sourceKeys = (def: FieldDef): string[] =>
  !def.from ? [] : def.from.includes('{') ? [...def.from.matchAll(/\{(\w+)\}/g)].map((m) => m[1]) : [def.from];

export const isFilled = (v: string, def: FieldDef) => (def.type === 'checkbox' ? v === 'true' || v === 'Yes' : !!v && String(v).trim() !== '' && !/^—/.test(v));

export function docState(doc: DocSpec, stored: Record<string, string> | undefined, overrides: Record<string, boolean> | undefined, master: Master): DocState {
  const vals = stored ?? {};
  const ov = overrides ?? {};
  const fields: FieldState[] = [];
  // checks receive the doc's own values for cross-field rules
  const flat: Record<string, string> = {};
  for (const s of doc.sections) for (const f of s.fields) flat[f.key] = f.from || f.computed !== undefined ? (ov[f.key] ? vals[f.key] ?? '' : vals[f.key] ?? liveValue(f, master)) : vals[f.key] ?? '';

  for (const s of doc.sections) {
    for (const def of s.fields) {
      const kind: FieldKind = def.computed !== undefined ? 'computed' : def.from ? 'auto' : 'manual';
      const live = kind === 'manual' ? '' : liveValue(def, master);
      let value: string;
      if (kind === 'computed') value = live;
      else if (kind === 'auto') value = ov[def.key] ? vals[def.key] ?? '' : vals[def.key] ?? '';
      else value = vals[def.key] ?? '';
      const stale = kind === 'auto' && !ov[def.key] && value !== live;
      let issue: Issue | null = null;
      if (def.required && !isFilled(value, def)) {
        issue = { level: 'error', msg: kind === 'auto' ? (live ? 'Not applied yet — run "Apply master data".' : 'Missing in the master form.') : def.type === 'checkbox' ? 'Confirm this declaration.' : 'Required for this document.' };
      } else if (value && def.check) {
        issue = def.check(value, flat);
      }
      if (!issue && kind === 'auto' && value && def.from?.includes('{')) {
        const blank = sourceKeys(def).filter((k) => !master[k]);
        if (blank.length) issue = { level: 'warn', msg: `Part of this value is blank in the master form (${blank.join(', ')}).` };
      }
      fields.push({ def, section: s.title, kind, value, live, stale, overridden: !!ov[def.key], issue });
    }
  }
  const req = fields.filter((f) => f.def.required || f.kind === 'computed');
  const ok = req.filter((f) => isFilled(f.value, f.def) && f.issue?.level !== 'error');
  const errors = fields.filter((f) => f.issue?.level === 'error');
  const warns = fields.filter((f) => f.issue?.level === 'warn');
  const pct = req.length ? Math.round((ok.length / req.length) * 100) : 100;
  const status: DocState['status'] = doc.blocking ? 'blocked' : pct === 100 && !errors.length ? (warns.length ? 'attention' : 'complete') : 'progress';
  return { fields, required: req.length, filled: ok.length, pct, remaining: req.filter((f) => !ok.includes(f)), errors, warns, stale: fields.filter((f) => f.stale).length, status };
}

/** Values to write into a doc when cascading master data: every non-overridden auto field. */
export function cascadeValues(doc: DocSpec, master: Master, overrides?: Record<string, boolean>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const s of doc.sections) for (const f of s.fields) if (f.from && !overrides?.[f.key]) out[f.key] = liveValue(f, master);
  return out;
}
