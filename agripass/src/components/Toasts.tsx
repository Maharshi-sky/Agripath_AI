import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useStore } from '../store';

export function Toasts() {
  const { toasts, dismiss } = useStore();
  return (
    <div className="no-print pointer-events-none fixed z-[60] flex flex-col gap-2" aria-live="polite"
      style={{ right: 'max(16px, env(safe-area-inset-right, 0px))', bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', left: 'max(16px, env(safe-area-inset-left, 0px))', alignItems: 'flex-end' }}>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] shadow-xl animate-rise">
          {t.tone === 'ok' ? <CircleCheck size={16} className="mt-0.5 shrink-0 text-auto" aria-hidden /> : t.tone === 'warn' ? <TriangleAlert size={16} className="mt-0.5 shrink-0 text-manual" aria-hidden /> : <Info size={16} className="mt-0.5 shrink-0 text-info" aria-hidden />}
          <span className="min-w-0 flex-1">{t.text}</span>
          <button className="text-muted hover:text-ink" onClick={() => dismiss(t.id)} aria-label="Dismiss"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
