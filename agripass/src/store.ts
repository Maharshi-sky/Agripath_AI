import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from './lib/storage';
import type { Category, DocSpec, Master } from './data/types';
import { COMMODITIES, commodityById } from './data/commodities';
import { byId } from './data/countries';
import { SAMPLE_MASTER, commodityDefaults, exporterFields, consigneeFields } from './data/masterSchema';
import { cascadeValues } from './lib/docstate';

export interface Profile { id: string; name: string; data: Master; savedAt: number }
export interface Template { id: string; name: string; data: Master; destId: string; category: Category; commodityId: string; savedAt: number }
export interface Toast { id: number; text: string; tone: 'ok' | 'warn' | 'info' }

const EXPORTER_KEYS = exporterFields.map((f) => f.key);
const CONSIGNEE_KEYS = consigneeFields().map((f) => f.key);
const pick = (m: Master, keys: string[]) => Object.fromEntries(keys.filter((k) => m[k] !== undefined).map((k) => [k, m[k]]));
const uid = () => Math.random().toString(36).slice(2, 9);

interface State {
  destId: string;
  category: Category;
  commodityId: string;
  master: Master;
  docValues: Record<string, Record<string, string>>;
  overrides: Record<string, Record<string, boolean>>;
  lastApplied: number | null;
  flashKeys: string[];
  flashAt: number;
  compare: string[];
  exporters: Profile[];
  consignees: Profile[];
  templates: Template[];
  openDoc: string | null;
  previewDoc: string | null;
  toasts: Toast[];

  setDest: (id: string) => void;
  setCategory: (c: Category) => void;
  setCommodity: (id: string) => void;
  setMaster: (k: string, v: string) => void;
  patchMaster: (p: Master) => void;
  clearMaster: (scope?: 'all' | 'exporter' | 'consignee') => void;
  loadSample: () => void;
  initDocs: (docs: DocSpec[]) => void;
  applyMaster: (docs: DocSpec[]) => { docs: number; values: number };
  setDocValue: (docKey: string, k: string, v: string) => void;
  setOverride: (docKey: string, k: string, on: boolean, docs?: DocSpec[]) => void;
  resetDoc: (doc: DocSpec) => void;
  saveProfile: (kind: 'exporter' | 'consignee', name: string) => void;
  loadProfile: (kind: 'exporter' | 'consignee', id: string) => void;
  deleteProfile: (kind: 'exporter' | 'consignee', id: string) => void;
  saveTemplate: (name: string) => void;
  loadTemplate: (id: string) => void;
  deleteTemplate: (id: string) => void;
  toggleCompare: (id: string) => void;
  setOpenDoc: (k: string | null) => void;
  setPreview: (k: string | null) => void;
  toast: (text: string, tone?: Toast['tone']) => void;
  dismiss: (id: number) => void;
}

const firstPort = (destId: string) => byId(destId)?.ports[0] ?? '';

const initialMaster = (): Master => ({
  ...SAMPLE_MASTER,
  ...commodityDefaults(commodityById('maize-hybrid')!),
  portOfEntry: firstPort('KE'),
});

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      destId: 'KE',
      category: 'seeds',
      commodityId: 'maize-hybrid',
      master: initialMaster(),
      docValues: {},
      overrides: {},
      lastApplied: null,
      flashKeys: [],
      flashAt: 0,
      compare: ['UG', 'TZ'],
      exporters: [],
      consignees: [],
      templates: [],
      openDoc: null,
      previewDoc: null,
      toasts: [],

      setDest: (id) => {
        const c = byId(id);
        const m = get().master;
        set({ destId: id, master: { ...m, portOfEntry: c.ports.includes(m.portOfEntry) ? m.portOfEntry : c.ports[0] }, openDoc: null });
      },
      setCategory: (cat) => {
        const first = COMMODITIES.find((x) => x.category === cat)!;
        set({ category: cat, commodityId: first.id, master: { ...get().master, ...commodityDefaults(first) }, openDoc: null });
      },
      setCommodity: (id) => {
        const k = commodityById(id);
        if (!k) return;
        set({ commodityId: id, master: { ...get().master, ...commodityDefaults(k) } });
      },
      setMaster: (k, v) => set({ master: { ...get().master, [k]: v } }),
      patchMaster: (p) => set({ master: { ...get().master, ...p } }),
      clearMaster: (scope = 'all') => {
        const m = get().master;
        if (scope === 'all') {
          const k = commodityById(get().commodityId)!;
          set({ master: { originCountry: 'India', portOfEntry: firstPort(get().destId), ...commodityDefaults(k) } });
        } else {
          const keys = scope === 'exporter' ? EXPORTER_KEYS : CONSIGNEE_KEYS;
          set({ master: Object.fromEntries(Object.entries(m).filter(([k]) => !keys.includes(k))) });
        }
      },
      loadSample: () => {
        const k = commodityById(get().commodityId)!;
        set({ master: { ...SAMPLE_MASTER, ...commodityDefaults(k), portOfEntry: firstPort(get().destId) } });
      },

      initDocs: (docs) => {
        const { docValues, master, overrides } = get();
        const missing = docs.filter((d) => !docValues[d.key]);
        if (!missing.length) return;
        const next = { ...docValues };
        for (const d of missing) next[d.key] = cascadeValues(d, master, overrides[d.key]);
        set({ docValues: next });
      },
      applyMaster: (docs) => {
        const { docValues, master, overrides } = get();
        const next = { ...docValues };
        let values = 0;
        const touched: string[] = [];
        for (const d of docs) {
          const cv = cascadeValues(d, master, overrides[d.key]);
          const cur = next[d.key] ?? {};
          let changed = 0;
          for (const [k, v] of Object.entries(cv)) if (cur[k] !== v) changed++;
          values += Object.keys(cv).length;
          if (changed) touched.push(d.key);
          next[d.key] = { ...cur, ...cv };
        }
        set({ docValues: next, lastApplied: Date.now(), flashKeys: touched, flashAt: Date.now() });
        return { docs: docs.length, values };
      },
      setDocValue: (docKey, k, v) => {
        const dv = get().docValues;
        set({ docValues: { ...dv, [docKey]: { ...(dv[docKey] ?? {}), [k]: v } } });
      },
      setOverride: (docKey, k, on, docs) => {
        const ov = get().overrides;
        const cur = { ...(ov[docKey] ?? {}) };
        if (on) cur[k] = true;
        else delete cur[k];
        set({ overrides: { ...ov, [docKey]: cur } });
        if (!on && docs) {
          const d = docs.find((x) => x.key === docKey);
          if (d) {
            const cv = cascadeValues(d, get().master, cur);
            get().setDocValue(docKey, k, cv[k] ?? '');
          }
        }
      },
      resetDoc: (doc) => {
        const { docValues, overrides, master } = get();
        const ov = { ...overrides };
        delete ov[doc.key];
        set({ overrides: ov, docValues: { ...docValues, [doc.key]: cascadeValues(doc, master) } });
      },

      saveProfile: (kind, name) => {
        const keys = kind === 'exporter' ? EXPORTER_KEYS : CONSIGNEE_KEYS;
        const p: Profile = { id: uid(), name, data: pick(get().master, keys), savedAt: Date.now() };
        if (kind === 'exporter') set({ exporters: [p, ...get().exporters.filter((x) => x.name !== name)] });
        else set({ consignees: [p, ...get().consignees.filter((x) => x.name !== name)] });
        get().toast(`Saved ${kind} profile "${name}"`, 'ok');
      },
      loadProfile: (kind, id) => {
        const list = kind === 'exporter' ? get().exporters : get().consignees;
        const p = list.find((x) => x.id === id);
        if (!p) return;
        get().patchMaster(p.data);
        get().toast(`Loaded ${kind} profile "${p.name}". Apply master data to update documents.`, 'info');
      },
      deleteProfile: (kind, id) => {
        if (kind === 'exporter') set({ exporters: get().exporters.filter((x) => x.id !== id) });
        else set({ consignees: get().consignees.filter((x) => x.id !== id) });
      },
      saveTemplate: (name) => {
        const s = get();
        const t: Template = { id: uid(), name, data: { ...s.master }, destId: s.destId, category: s.category, commodityId: s.commodityId, savedAt: Date.now() };
        set({ templates: [t, ...s.templates.filter((x) => x.name !== name)] });
        get().toast(`Saved shipment template "${name}"`, 'ok');
      },
      loadTemplate: (id) => {
        const t = get().templates.find((x) => x.id === id);
        if (!t) return;
        set({ destId: t.destId, category: t.category, commodityId: t.commodityId, master: { ...t.data } });
        get().toast(`Loaded template "${t.name}"`, 'info');
      },
      deleteTemplate: (id) => set({ templates: get().templates.filter((x) => x.id !== id) }),
      toggleCompare: (id) => {
        const c = get().compare;
        set({ compare: c.includes(id) ? c.filter((x) => x !== id) : [...c, id].slice(-4) });
      },
      setOpenDoc: (k) => set({ openDoc: k }),
      setPreview: (k) => set({ previewDoc: k }),
      toast: (text, tone = 'ok') => {
        const id = Date.now() + Math.random();
        set({ toasts: [...get().toasts, { id, text, tone }].slice(-3) });
        setTimeout(() => get().dismiss(id), 4200);
      },
      dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    }),
    {
      name: 'agripass-v1',
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        destId: s.destId, category: s.category, commodityId: s.commodityId, master: s.master, docValues: s.docValues,
        overrides: s.overrides, lastApplied: s.lastApplied, compare: s.compare, exporters: s.exporters, consignees: s.consignees, templates: s.templates,
      }),
    },
  ),
);
