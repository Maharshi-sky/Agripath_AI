import JSZip from 'jszip';
import type { CountryProfile, Commodity, Master, Category } from '../data/types';
import { CATEGORIES } from '../data/types';
import type { StackItem } from './useStack';
import { docPdf, packPdf, type PdfCtx, type CoverInfo } from './pdf';
import { pathwayFor } from './pathway';
import { HARMONY_LABEL } from '../data/types';
import { fairsUrl } from '../data/countries';
import { saveFile, slug, type SaveOutcome } from './files';
import { draftIdFor } from './useStack';

const statusLabel = (s: string) => ({ blocked: 'Blocked', complete: 'Complete', attention: 'Warnings', progress: 'In progress' } as Record<string, string>)[s] ?? s;

export function pdfCtx(country: CountryProfile, commodity?: Commodity): PdfCtx {
  return { country, commodity, generatedAt: new Date(), draftId: draftIdFor(country.id) };
}

function cover(country: CountryProfile, category: Category, _commodity: Commodity | undefined, master: Master, items: StackItem[]): CoverInfo {
  const pw = pathwayFor(country, category).map((g) => `${g.bloc.id} - ${g.instrument.instrument} [${HARMONY_LABEL[g.instrument.level].label}]. Shared with: ${g.siblings.map((s) => s.name).join(', ') || '-'}`);
  return {
    rows: [
      ['Exporter', `${master.exporterName ?? ''} (IEC ${master.iec ?? '-'})`],
      ['Consignee', master.consigneeName ?? ''],
      ['Category', CATEGORIES.find((c) => c.id === category)!.label],
      ['Commodity / HS', `${master.productName ?? ''} - HS ${master.hsCode ?? ''}`],
      ['Route', `${master.portOfLoading ?? ''} -> ${master.portOfEntry ?? ''} (${master.transportMode ?? ''})`],
      ['Invoice', `${master.invoiceNo ?? ''} dated ${master.invoiceDate ?? ''} - ${master.currency ?? ''} ${master.invoiceValue ?? ''} ${master.incoterm ?? ''}`],
      ['Plant-health authority', country.auth.nppo],
      ['FAIRS reference', fairsUrl(country).label],
    ],
    checklist: items.map((i) => ({ title: i.doc.title, req: i.doc.requirement, status: statusLabel(i.st.status), pct: i.st.pct, issuer: i.doc.issuer })),
    pathway: pw.length ? pw : ['National pathway - no regional instrument harmonizes this category for this destination.'],
  };
}

export function dossierJson(country: CountryProfile, category: Category, commodity: Commodity | undefined, master: Master, items: StackItem[]) {
  return {
    schema: 'agripass.dossier/v1',
    generatedAt: new Date().toISOString(),
    route: { source: 'India', destination: { iso2: country.id, name: country.name, blocs: country.blocs, dataDepth: country.depth }, category, commodity: commodity ? { id: commodity.id, name: commodity.name, hs: commodity.hs } : null },
    fairs: { ...country.fairs, resolved: fairsUrl(country) },
    authorities: country.auth,
    pathway: pathwayFor(country, category).map((g) => ({ bloc: g.bloc.id, instrument: g.instrument.instrument, level: g.instrument.level, effect: g.instrument.effect, siblings: g.siblings.map((s) => s.id) })),
    master,
    documents: items.map(({ doc, st }) => ({
      key: doc.key, template: doc.templateId, title: doc.title, panel: doc.panel === 'cert' ? 'certification' : 'permit', requirement: doc.requirement,
      reason: doc.reason, issuer: doc.issuer, side: doc.side, portal: doc.portal ?? null, leadTime: doc.leadTime, source: doc.source ?? null, blocking: doc.blocking ?? null,
      status: st.status, completion: { pct: st.pct, filled: st.filled, required: st.required },
      fields: Object.fromEntries(st.fields.map((f) => [f.def.key, { label: f.def.label, value: f.value, origin: f.kind === 'manual' ? 'manual' : f.overridden ? 'master-overridden' : f.kind === 'computed' ? 'computed' : 'master', ...(f.issue ? { issue: f.issue } : {}) }])),
    })),
  };
}

export async function exportJson(country: CountryProfile, category: Category, commodity: Commodity | undefined, master: Master, items: StackItem[]): Promise<SaveOutcome> {
  const data = JSON.stringify(dossierJson(country, category, commodity, master, items), null, 2);
  return saveFile(`agripass-dossier-${slug(country.name)}-${category}.json`, data, 'application/json');
}

export async function exportDocPdf(item: StackItem, country: CountryProfile, commodity?: Commodity): Promise<SaveOutcome> {
  const pdf = docPdf(item.doc, item.st, pdfCtx(country, commodity));
  return saveFile(`${slug(item.doc.short)}-${slug(country.name)}-draft.pdf`, pdf.output('blob'), 'application/pdf');
}

export async function exportPackPdf(country: CountryProfile, category: Category, commodity: Commodity | undefined, master: Master, items: StackItem[]): Promise<SaveOutcome> {
  const pdf = packPdf(items, pdfCtx(country, commodity), cover(country, category, commodity, master, items));
  return saveFile(`agripass-document-pack-${slug(country.name)}-${category}.pdf`, pdf.output('blob'), 'application/pdf');
}

export async function exportZip(country: CountryProfile, category: Category, commodity: Commodity | undefined, master: Master, items: StackItem[]): Promise<SaveOutcome> {
  const zip = new JSZip();
  const ctx = pdfCtx(country, commodity);
  const folder = zip.folder(`agripass-${slug(country.name)}-${category}`)!;
  items.forEach((it, i) => folder.file(`${String(i + 1).padStart(2, '0')}-${slug(it.doc.short)}.pdf`, docPdf(it.doc, it.st, ctx).output('arraybuffer')));
  folder.file('00-document-pack.pdf', packPdf(items, ctx, cover(country, category, commodity, master, items)).output('arraybuffer'));
  folder.file('dossier.json', JSON.stringify(dossierJson(country, category, commodity, master, items), null, 2));
  const csv = ['Document,Panel,Requirement,Status,Completion %,Issuer,Lead time']
    .concat(items.map(({ doc, st }) => [doc.title, doc.panel, doc.requirement, statusLabel(st.status), st.pct, doc.issuer, doc.leadTime].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')))
    .join('\n');
  folder.file('checklist.csv', csv);
  folder.file('README.txt', `AgriPass Global — document pack for India → ${country.name} (${category}).\nAll PDFs are pre-filled drafts for application and review. They are not official certificates.\nGenerated ${new Date().toISOString()}.\n`);
  const blob = await zip.generateAsync({ type: 'blob' });
  return saveFile(`agripass-${slug(country.name)}-${category}-pack.zip`, blob, 'application/zip');
}
