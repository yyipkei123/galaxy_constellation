import { CdeChip } from '@/components/ui/cde-chip';

export function WalletGauge({ label, capturedPct }: { label: string; capturedPct: number }) {
  const leakPct = 100 - capturedPct;

  return (
    <div className="rounded-xl border border-galaxy-border bg-galaxy-slate/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-galaxy-cream">{label}</p>
        <CdeChip />
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-galaxy-market">
        <div className="h-full bg-galaxy-capture" style={{ width: `${capturedPct}%` }} />
      </div>
      <div className="mt-3 flex justify-between text-xs text-galaxy-muted">
        <span>{capturedPct}% captured</span>
        <span>{leakPct}% leakage</span>
      </div>
    </div>
  );
}
