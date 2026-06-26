import Link from 'next/link';
import type { Guest } from '@/data';

interface NormalizedGuest {
  id: string;
  leadScore: number;
  propensityPct: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function clampScore(value: unknown) {
  return clamp(Math.round(finiteNumber(value)), 0, 100);
}

function clampPropensity(value: unknown) {
  return clamp(finiteNumber(value), 0, 1);
}

function normalizeGuest(value: unknown): NormalizedGuest | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  if (!id.startsWith('MEM-')) return null;

  const cde = isRecord(value.cde) ? value.cde : {};
  const propensities = isRecord(cde.propensities) ? cde.propensities : {};
  const propensityPct = Math.round((
    clampPropensity(propensities.luxuryHotelSpender)
    + clampPropensity(propensities.topTierRewards)
    + clampPropensity(propensities.coBrandLookAlike)
  ) / 3 * 92);

  return {
    id,
    leadScore: clampScore(value.leadScore),
    propensityPct: clamp(propensityPct, 0, 92),
  };
}

export function PriorityQuadrant({ guests }: { guests: Guest[] }) {
  const safeGuests = (Array.isArray(guests) ? guests : [])
    .map((guest) => normalizeGuest(guest))
    .filter((guest): guest is NormalizedGuest => guest !== null);

  return (
    <figure
      aria-label="Priority quadrant"
      className="relative min-h-[24rem] rounded-2xl border border-galaxy-border bg-galaxy-ink/60 p-5"
    >
      <figcaption>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Value x propensity</p>
        <h2 className="mt-2 font-serif text-3xl text-galaxy-cream">Priority quadrant</h2>
      </figcaption>

      <div className="relative mt-5 h-72 rounded-xl border border-galaxy-border bg-[linear-gradient(90deg,transparent_49%,rgba(201,164,92,0.18)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(201,164,92,0.18)_50%,transparent_51%)]">
        <div className="absolute right-3 top-3 rounded-full bg-galaxy-gold px-3 py-1 text-xs font-semibold text-galaxy-ink">
          Pitch now
        </div>

        {safeGuests.length === 0 ? (
          <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-sm text-galaxy-muted">
            No priority guests to plot
          </p>
        ) : null}

        {safeGuests.map((guest) => {
          const x = clamp(guest.leadScore, 8, 96);
          const y = clamp(guest.propensityPct, 0, 92);
          const size = 0.95 + guest.leadScore / 100;

          return (
            <Link
              key={guest.id}
              href={`/guests/${encodeURIComponent(guest.id)}`}
              aria-label={`${guest.id} guest priority bubble`}
              className="absolute rounded-full bg-galaxy-gold/75 shadow-[0_0_18px_rgba(201,164,92,0.48)] transition hover:scale-110"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
                width: `${size}rem`,
                height: `${size}rem`,
              }}
            />
          );
        })}
      </div>
    </figure>
  );
}
