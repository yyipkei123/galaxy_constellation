import { CdeChip } from '@/components/ui/cde-chip';
import { BandValue, IndexValue, PercentValue } from '@/components/ui/formatted-values';
import { CORE_CATEGORIES, type CoreCategory, type Guest } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;
const nonFinitePattern = /NaN|Infinity/gi;
const modelledBandPattern = /^\d+(?:\.\d+)?-\d+(?:\.\d+)?k equiv\.\/mo$/i;

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finiteNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanText(value: unknown, fallback: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return fallback;

  const cleaned = String(value)
    .replace(bannedCurrencyPattern, '')
    .replace(nonFinitePattern, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned || fallback;
}

function safeBand(value: unknown) {
  const cleaned = cleanText(value, '0-0k equiv./mo');

  return modelledBandPattern.test(cleaned) ? cleaned : '0-0k equiv./mo';
}

function safeCategory(value: unknown) {
  return CORE_CATEGORIES.includes(value as CoreCategory) ? value as CoreCategory : 'hospitality';
}

function safeRecordValue(record: unknown, key: CoreCategory, fallback = 0) {
  if (!isRecord(record)) return fallback;

  return finiteNumber(record[key], fallback);
}

function safeProperties(value: unknown) {
  if (!Array.isArray(value)) return 'No property history';

  const properties = value
    .map((property) => cleanText(property, ''))
    .filter(Boolean);

  return properties.length > 0 ? properties.join(', ') : 'No property history';
}

export function FusionPanel({ guest }: { guest: Guest }) {
  const firstParty = isRecord(guest?.firstParty) ? guest.firstParty : {};
  const cde = isRecord(guest?.cde) ? guest.cde : {};
  const primaryOpportunity = safeCategory(guest?.primaryOpportunity);
  const leadScore = clamp(Math.round(finiteNumber(guest?.leadScore)), 0, 100);
  const stays = clamp(Math.round(finiteNumber(firstParty.staysL12m)), 0, 999);
  const diningVisits = clamp(Math.round(finiteNumber(firstParty.diningVisits)), 0, 999);
  const rewardsPoints = clamp(Math.round(finiteNumber(firstParty.rewardsPoints)), 0, 9999999);
  const leakagePct = clamp(
    Math.round(safeRecordValue(cde.categoryLeakagePct, primaryOpportunity)),
    0,
    100,
  );
  const walletIndex = Math.max(
    0,
    Math.round(safeRecordValue(cde.categoryWalletIndex, primaryOpportunity)),
  );

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem_minmax(0,1fr)]">
      <div className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">What Galaxy sees</p>
        <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">First-party behavior</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          <div>
            <dt className="text-galaxy-muted">Properties</dt>
            <dd className="break-words text-galaxy-cream">{safeProperties(firstParty.properties)}</dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Stays L12M</dt>
            <dd className="text-galaxy-cream">{stays}</dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Dining visits</dt>
            <dd className="text-galaxy-cream">{diningVisits}</dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Rewards points</dt>
            <dd className="text-galaxy-cream">{rewardsPoints.toLocaleString('en-US')}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-galaxy-gold/40 bg-galaxy-gold/10 p-5 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Fused opportunity</p>
        <p className="mt-4 font-mono text-4xl font-semibold text-galaxy-cream">{leadScore}</p>
        <p className="mt-3 text-sm text-galaxy-muted">Lead Score</p>
        <div className="mt-5 text-sm text-galaxy-cream">
          <BandValue value={safeBand(guest?.projectedUpsideBand)} />
        </div>
      </div>

      <div className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            What Mastercard CDE adds
          </p>
          <CdeChip />
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">Off-property signals</h2>
        <dl className="mt-5 grid gap-3 text-sm">
          <div>
            <dt className="text-galaxy-muted">Primary leak</dt>
            <dd className="text-galaxy-cream">{categoryLabels[primaryOpportunity]}</dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Leakage</dt>
            <dd className="text-galaxy-cream">
              <PercentValue value={leakagePct} />
            </dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Wallet index</dt>
            <dd className="text-galaxy-cream">
              <IndexValue value={walletIndex} />
            </dd>
          </div>
          <div>
            <dt className="text-galaxy-muted">Cross-property band</dt>
            <dd className="text-galaxy-cream">
              <BandValue value={safeBand(cde.crossPropertyCashBand)} />
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
