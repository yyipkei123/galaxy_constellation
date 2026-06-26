import { IndexValue, PercentValue } from '@/components/ui/formatted-values';
import type { Segment } from '@/data';

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

export function WalletConstellation({ segments }: { segments: Segment[] }) {
  const safeSegments = segments.filter((segment) => Number.isFinite(segment.opportunityIndex));
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
          const averageLeakage = Math.round(
            Object.values(segment.categories).reduce((sum, category) => sum + category.leakagePct, 0)
            / Object.values(segment.categories).length,
          );
          const position = starPosition(index, safeSegments.length, averageLeakage);
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
          <p className="text-galaxy-muted">Index score</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <IndexValue value={topSegment?.opportunityIndex ?? 0} />
          </p>
        </div>
        <div className="rounded-lg border border-galaxy-border bg-galaxy-charcoal/60 p-3">
          <p className="text-galaxy-muted">Wallet capture</p>
          <p className="mt-1 font-semibold text-galaxy-cream">
            <PercentValue value={topSegment?.metrics.shareOfWallet ?? 0} />
          </p>
        </div>
      </div>
    </figure>
  );
}
