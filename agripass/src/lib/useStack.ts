import { useMemo } from 'react';
import { useStore } from '../store';
import { byId } from '../data/countries';
import { commodityById } from '../data/commodities';
import { buildStack, REQ_ORDER } from '../data/documents';
import { docState, type DocState } from './docstate';
import type { DocSpec } from '../data/types';

export interface StackItem { doc: DocSpec; st: DocState }

export function useStack() {
  const destId = useStore((s) => s.destId);
  const category = useStore((s) => s.category);
  const commodityId = useStore((s) => s.commodityId);
  const master = useStore((s) => s.master);
  const docValues = useStore((s) => s.docValues);
  const overrides = useStore((s) => s.overrides);

  const country = byId(destId);
  const commodity = commodityById(commodityId);
  const docs = useMemo(() => buildStack({ country, category, commodity, master: { ...master, originCountry: 'India' } }), [country, category, commodity, master]);
  const items: StackItem[] = useMemo(
    () => docs.map((doc) => ({ doc, st: docState(doc, docValues[doc.key], overrides[doc.key], { ...master, originCountry: 'India' }) }))
      .sort((a, b) => REQ_ORDER[a.doc.requirement] - REQ_ORDER[b.doc.requirement]),
    [docs, docValues, overrides, master],
  );
  const summary = useMemo(() => {
    const mand = items.filter((i) => i.doc.requirement === 'mandatory');
    const done = mand.filter((i) => i.st.status === 'complete' || i.st.status === 'attention');
    const req = items.reduce((a, i) => a + (i.doc.requirement === 'mandatory' ? i.st.required : 0), 0);
    const fil = items.reduce((a, i) => a + (i.doc.requirement === 'mandatory' ? i.st.filled : 0), 0);
    const stale = items.reduce((a, i) => a + i.st.stale, 0);
    const blocked = items.filter((i) => i.doc.blocking);
    const openLead = Math.max(0, ...items.filter((i) => i.doc.requirement === 'mandatory' && i.st.status === 'progress').map((i) => i.doc.leadDays));
    return { mandatory: mand.length, done: done.length, readiness: req ? Math.round((fil / req) * 100) : 0, stale, blocked, openLead, errors: items.reduce((a, i) => a + i.st.errors.length, 0) };
  }, [items]);
  return { country, commodity, category, docs, items, summary, master };
}

export const draftIdFor = (countryId: string) => (d: DocSpec) => `AGP-${countryId}-${d.templateId.toUpperCase().slice(0, 6)}-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;
