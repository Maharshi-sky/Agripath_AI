// agripass/src/App.tsx
import { useCallback, useEffect } from 'react';
import { useStore } from './store';
import { useStack, type StackItem } from './lib/useStack';
import { TopBar } from './components/TopBar';
import { Pathway } from './components/Pathway';
import { MasterPipeline } from './components/MasterPipeline';
import { DocumentStacks } from './components/DocumentStacks';
import { Summary, Compare } from './components/Summary';
import { PreviewModal } from './components/PreviewModal';
import { Toasts } from './components/Toasts';
import { exportDocPdf, exportJson, exportPackPdf, exportZip } from './lib/exporters';
import type { SaveOutcome } from './lib/files';
import { storageAvailable } from './lib/storage';
import { COUNTRIES } from './data/countries';
import { FAIRS } from './data/fairs.generated';
import type { Category } from './data/types';

export default function App() {
  const { country, commodity, category, docs, items, summary, master } = useStack();
  const { initDocs, applyMaster, toast, setDest, setCategory, setCommodity } = useStore();
  const keys = docs.map((d) => d.key).join('|');

  // ── READ INCOMING PARAMS FROM AGRIPATH STEP 4 ──
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlDest = params.get('dest');
      const urlCat = params.get('cat') as Category | null;
      const urlCommodity = params.get('commodity');

      if (urlDest) {
        const matched = COUNTRIES.find(
          (c) => c.id.toUpperCase() === urlDest.toUpperCase() || c.name.toLowerCase() === urlDest.toLowerCase()
        );
        if (matched) setDest(matched.id);
      }

      if (urlCat) {
        setCategory(urlCat);
      }

      if (urlCommodity) {
        setCommodity(urlCommodity);
      }
    } catch (e) {
      console.warn('URL params parse error in AgriPass:', e);
    }
  }, [setDest, setCategory, setCommodity]);

  useEffect(() => { initDocs(docs); }, [keys]); // eslint-disable-line react-hooks/exhaustive-deps

  const report = useCallback((o: SaveOutcome, what: string) => {
    if (o === 'saved') toast(`${what} ready.`, 'ok');
    else if (o === 'declined') toast('Download cancelled.', 'info');
    else toast('Downloads are not available in this view.', 'warn');
  }, [toast]);

  const onApply = () => {
    const r = applyMaster(docs);
    toast(`Master data applied: ${r.values} field values cascaded into ${r.docs} documents.`, 'ok');
  };
  const onPdf = async (i: StackItem) => report(await exportDocPdf(i, country, commodity), `${i.doc.short} PDF`);
  const onExport = async (k: 'pack' | 'zip' | 'json') => {
    toast(k === 'zip' ? 'Building the ZIP…' : 'Preparing…', 'info');
    if (k === 'pack') report(await exportPackPdf(country, category, commodity, master, items), 'Document pack');
    if (k === 'zip') report(await exportZip(country, category, commodity, master, items), 'ZIP pack');
    if (k === 'json') report(await exportJson(country, category, commodity, master, items), 'JSON dossier');
  };

  return (
    <div className="min-h-screen">
      <TopBar country={country} category={category} product={master.productName ?? ''} readiness={summary.readiness} stale={summary.stale} onApply={onApply} onExport={onExport} />
      <main className="no-print pb-16">
        <Pathway />
        <MasterPipeline items={items} onApply={onApply} />
        <DocumentStacks items={items} onPdf={onPdf} />
        <Summary items={items} summary={summary} onExport={onExport} />
        <Compare />
        <footer className="gutter mx-auto mt-12 max-w-[1440px] border-t border-line pt-4 text-[11.5px] leading-relaxed text-muted">
          <p>
            Knowledge base: {FAIRS.length} countries imported from your FAIRS spreadsheet ({FAIRS.filter((f) => f.status === 'own').length} with their own USDA FAIRS reports, linked via APEDA AgriExchange; the rest covered through a reporting hub), plus {COUNTRIES.length - FAIRS.length} added destinations.
            Seed, fertilizer, agrochemical and machinery rules come from published regulations, because FAIRS reports focus on food products. Each document cites its source. Confirm requirements with the competent authority and your importer before shipping.
          </p>
          <p className="mt-1">Generated documents are pre-filled drafts marked DRAFT. Official certificates are issued only by the authorities named on each card, through their own systems (e.g. PQIS, KenTrade, ICEGATE).
            {!storageAvailable && ' Browser storage is blocked here, so profiles and templates last only until you close this page.'}</p>
        </footer>
      </main>
      <PreviewModal items={items} country={country} onPdf={onPdf} />
      <Toasts />
    </div>
  );
}