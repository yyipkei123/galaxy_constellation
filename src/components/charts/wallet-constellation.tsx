import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import type { Segment } from '@/data';

interface NormalizedSegment {
  id: string;
  name: string;
  opportunityIndex: number;
  sizeHighK: number;
  shareOfWallet: number;
  averageLeakage: number;
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function starPosition(index: number, total: number, leakagePct: number) {
  const angle = (index / Math.max(total, 1)) * Math.PI * 2 - Math.PI / 2;
  const distance = 22 + Math.min(42, leakagePct * 0.55);

  return {
    left: 50 + Math.cos(angle) * distance,
    top: 50 + Math.sin(angle) * distance,
  };
}

function opportunityTone(value: number) {
  if (value >= 150) return 'bg-galaxy-gold shadow-[0_0_28px_rgba(201,164,92,0.62)]';
  if (value >= 125) return 'bg-galaxy-gold-lite shadow-[0_0_18px_rgba(228,201,136,0.42)]';
  return 'bg-galaxy-positive shadow-[0_0_14px_rgba(111,169,140,0.28)]';
}

function averageLeakageFromCategories(categories: unknown) {
  if (!isObjectLike(categories)) return 0;

  const leakageValues = Object.values(categories)
    .map((category) => (isObjectLike(category) ? finiteNumber(category.leakagePct, Number.NaN) : Number.NaN))
    .filter(Number.isFinite);

  if (leakageValues.length === 0) return 0;

  return Math.round(leakageValues.reduce((sum, leakagePct) => sum + leakagePct, 0) / leakageValues.length);
}

function normalizeSegment(segment: unknown): NormalizedSegment | null {
  if (!isObjectLike(segment)) return null;

  const opportunityIndex = finiteNumber(segment.opportunityIndex, Number.NaN);
  if (!Number.isFinite(opportunityIndex)) return null;

  const metrics = segment.metrics;

  return {
    id: typeof segment.id === 'string' ? segment.id : `segment-${opportunityIndex}`,
    name: typeof segment.name === 'string' ? segment.name : 'Unnamed segment',
    opportunityIndex,
    sizeHighK: finiteNumber(segment.sizeHighK),
    shareOfWallet: isObjectLike(metrics) ? finiteNumber(metrics.shareOfWallet) : 0,
    averageLeakage: averageLeakageFromCategories(segment.categories),
  };
}

export function WalletConstellation({ segments }: { segments: Segment[] }) {
  const safeSegments = segments
    .map((segment) => normalizeSegment(segment))
    .filter((segment): segment is NormalizedSegment => segment !== null);
  const topSegment = [...safeSegments].sort((a, b) => b.opportunityIndex - a.opportunityIndex)[0];

  return (
    <figure
      aria-label="Wallet constellation"
      className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-galaxy-border bg-[radial-gradient(circle_at_center,rgba(201,164,92,0.14),transparent_58%),linear-gradient(135deg,rgba(11,11,14,0.94),rgba(21,21,27,0.92))] p-5"
    >
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Signature visual</p>
        <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Wallet headroom constellation</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-galaxy-muted">
          Size signals value, glow signals priority, and distance from centre signals leakage.
        </p>
      </figcaption>

      <div className="relative mt-5 h-64 rounded-xl border border-galaxy-border/70 bg-galaxy-ink/50">
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[0.65rem] uppercase tracking-[0.16em] text-galaxy-muted">
          Galaxy capture
        </div>
        {safeSegments.map((segment, index) => {
          const position = starPosition(index, safeSegments.length, segment.averageLeakage);
          const size = 14 + Math.min(26, segment.sizeHighK / 2);

          return (
            <div
              key={segment.id}
              aria-label={`${segment.name} opportunity star`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.left}%`, top: `${position.top}%` }}
            >
              <span
                className={`block rounded-full ${opportunityTone(segment.opportunityIndex)}`}
                style={{ width: size, height: size }}
              />
              <span className="sr-only">{segment.name}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Pitch-now cluster</p>
          <p className="mt-1 font-semibold text-galaxy-cream">{topSegment?.name ?? 'No segment'}</p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">CDE opportunity signal</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <IndexValue value={topSegment?.opportunityIndex ?? 0} label="CDE opportunity signal" />
          </p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Wallet capture</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <PercentValue value={topSegment?.shareOfWallet ?? 0} />
          </p>
        </div>
      </div>
    </figure>
  );
}
