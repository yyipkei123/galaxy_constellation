import { CdeChip } from '@/components/ui/cde-chip';
import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { CORE_CATEGORIES, type CoreCategory, type Guest } from '@/data';

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail luxury',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clampPct(value: unknown) {
  return Math.min(100, Math.max(0, Math.round(finiteNumber(value))));
}

function safeIndex(value: unknown) {
  return Math.max(0, Math.round(finiteNumber(value)));
}

function categoryValue(record: unknown, category: CoreCategory) {
  return isRecord(record) ? record[category] : undefined;
}

export function WalletOrbit({ guest }: { guest: Guest }) {
  const cde = isRecord(guest?.cde) ? guest.cde : {};
  const captureByCategory = isRecord(cde.categoryCapturePct) ? cde.categoryCapturePct : {};
  const leakageByCategory = isRecord(cde.categoryLeakagePct) ? cde.categoryLeakagePct : {};
  const indexByCategory = isRecord(cde.categoryWalletIndex) ? cde.categoryWalletIndex : {};

  return (
    <figure aria-label="Wallet orbit" className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/60 p-5">
      <figcaption className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Wallet orbit</p>
          <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Capture vs leakage</h2>
        </div>
        <CdeChip />
      </figcaption>

      <div className="mt-5 grid gap-3">
        {CORE_CATEGORIES.map((category) => {
          const capturePct = clampPct(categoryValue(captureByCategory, category));
          const leakagePct = clampPct(categoryValue(leakageByCategory, category));
          const walletIndex = safeIndex(categoryValue(indexByCategory, category));

          return (
            <div key={category} className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-galaxy-cream">{categoryLabels[category]}</span>
                <span className="text-galaxy-muted">
                  <IndexValue value={walletIndex} />
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-galaxy-slate">
                <div
                  aria-label={`${categoryLabels[category]} capture ${capturePct}%`}
                  className="h-full rounded-full bg-galaxy-gold"
                  style={{ width: `${capturePct}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-galaxy-muted">
                <span>
                  Capture <PercentValue value={capturePct} />
                </span>
                <span>
                  Leakage <PercentValue value={leakagePct} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
