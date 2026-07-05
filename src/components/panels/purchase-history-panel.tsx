import type { CoreCategory, Guest, GuestPurchaseHistoryItem, GuestStayHistoryItem } from '@/data';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;
const directContactPattern = /@|\+\d{6,}|(?:\d[\s-]?){8,}/;
const nonFinitePattern = /NaN|Infinity/i;
const generatedPurchaseIdPattern = /^\d{4}-purchase-\d+$/;
const generatedStayIdPattern = /^\d{4}-stay-\d+$/;
const maxSafeTextLength = 80;

const categoryLabels: Record<CoreCategory, string> = {
  hospitality: 'Hospitality',
  fnb: 'F&B',
  entertainment: 'Entertainment',
  retailLuxury: 'Retail-Luxury',
};

function normalizedText(value: unknown) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'number' && !Number.isFinite(value)) return null;

  const rawValue = String(value);
  if (
    bannedCurrencyPattern.test(rawValue)
    || directContactPattern.test(rawValue)
    || nonFinitePattern.test(rawValue)
  ) {
    return null;
  }

  const cleaned = rawValue.replace(/\s+/g, ' ').trim();
  if (!cleaned || cleaned.length > maxSafeTextLength) return null;

  return cleaned;
}

function safeText(value: unknown, fallback: string) {
  return normalizedText(value) ?? fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCoreCategory(value: unknown): value is CoreCategory {
  return value === 'hospitality' || value === 'fnb' || value === 'entertainment' || value === 'retailLuxury';
}

function hasGeneratedStayId(value: unknown) {
  return typeof value === 'string' && generatedStayIdPattern.test(value);
}

function hasGeneratedPurchaseId(value: unknown) {
  return typeof value === 'string' && generatedPurchaseIdPattern.test(value);
}

function hasUsableStayFields(stay: Record<string, unknown>) {
  return Boolean(normalizedText(stay.periodLabel) && normalizedText(stay.property) && normalizedText(stay.roomType));
}

function hasUsablePurchaseFields(purchase: Record<string, unknown>) {
  return Boolean(
    normalizedText(purchase.itemLabel)
    && normalizedText(purchase.merchantArea)
    && normalizedText(purchase.periodLabel),
  );
}

function isValidStay(value: unknown): value is GuestStayHistoryItem {
  if (!isRecord(value)) return false;

  return hasGeneratedStayId(value.id) && hasUsableStayFields(value);
}

function isValidPurchase(value: unknown): value is GuestPurchaseHistoryItem {
  if (!isRecord(value) || !isCoreCategory(value.category)) return false;

  return hasGeneratedPurchaseId(value.id) && hasUsablePurchaseFields(value);
}

function safeStays(value: unknown): GuestStayHistoryItem[] {
  return Array.isArray(value) ? value.filter(isValidStay).slice(0, 3) : [];
}

function safePurchases(value: unknown): GuestPurchaseHistoryItem[] {
  return Array.isArray(value) ? value.filter(isValidPurchase).slice(0, 5) : [];
}

function categoryLabel(value: unknown) {
  return isCoreCategory(value)
    ? categoryLabels[value]
    : 'Category signal';
}

function ticketBandLabel(value: unknown) {
  return value === 'entry' || value === 'premium' || value === 'ultra' ? value : 'band';
}

export function PurchaseHistoryPanel({ guest }: { guest: Guest }) {
  const stayHistory = safeStays(guest?.stayHistory);
  const purchaseHistory = safePurchases(guest?.purchaseHistory);

  return (
    <section className="rounded-2xl border border-galaxy-border bg-galaxy-charcoal/65 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            First-party history
          </p>
          <h2 className="mt-2 break-words text-2xl font-semibold text-galaxy-cream">
            Galaxy purchase and stay history
          </h2>
          <p className="mt-2 break-words text-sm leading-6 text-galaxy-muted">
            Internal Galaxy history is shown as categories, bands, service signals, and dates without itemized amounts.
          </p>
        </div>
        <span className="rounded border border-galaxy-border px-2 py-1 text-xs font-semibold text-galaxy-muted">
          Galaxy first-party
        </span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Stay history</h3>
          {stayHistory.length > 0 ? (
            <ol className="mt-3 space-y-3" aria-label="Stay history">
              {stayHistory.map((stay, index) => (
                <li
                  key={`${index}-${safeText(stay.id, safeText(stay.periodLabel, 'stay'))}`}
                  className="min-w-0 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm"
                >
                  <p className="break-words font-semibold text-galaxy-cream">
                    {safeText(stay.periodLabel, 'Stay period')}
                  </p>
                  <p className="mt-1 break-words text-galaxy-muted">{safeText(stay.property, 'Galaxy property')}</p>
                  <p className="mt-2 break-words text-galaxy-muted">
                    {safeText(stay.roomType, 'Room')} / {safeText(stay.nightsBand, 'Banded nights')} /{' '}
                    {safeText(stay.occasion, 'Occasion')}
                  </p>
                  <p className="mt-2 break-words text-xs font-semibold text-galaxy-gold">
                    {safeText(stay.satisfactionSignal, 'Service signal')}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 break-words rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm text-galaxy-muted">
              No stay history available
            </p>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Purchase history</h3>
          {purchaseHistory.length > 0 ? (
            <ul className="mt-3 grid gap-3 lg:grid-cols-2" aria-label="Purchase history">
              {purchaseHistory.map((purchase, index) => (
                <li
                  key={`${index}-${safeText(purchase.id, safeText(purchase.periodLabel, 'purchase'))}`}
                  className="min-w-0 rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 break-words font-semibold text-galaxy-cream">
                      {safeText(purchase.itemLabel, 'Purchase signal')}
                    </p>
                    <span className="rounded border border-galaxy-border px-2 py-0.5 text-xs text-galaxy-muted">
                      {ticketBandLabel(purchase.ticketBand)}
                    </span>
                  </div>
                  <p className="mt-1 break-words text-galaxy-muted">
                    {safeText(purchase.periodLabel, 'History period')}
                  </p>
                  <p className="mt-2 break-words text-galaxy-muted">
                    {categoryLabel(purchase.category)} / {safeText(purchase.merchantArea, 'Galaxy area')}
                  </p>
                  <p className="mt-2 break-words text-xs font-semibold text-galaxy-gold">
                    {safeText(purchase.channel, 'Galaxy channel')}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 break-words rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-3 text-sm text-galaxy-muted">
              No purchase history available
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
