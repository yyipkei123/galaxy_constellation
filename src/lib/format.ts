export type EnrichedFormatKind = 'pct' | 'index' | 'band';

const currencyPattern = /(MOP|HKD|\$|元|澳門幣)/i;
const modelledBandPattern = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)k equiv\.\/mo$/i;

export function formatEnriched(value: number | string, kind: EnrichedFormatKind): string {
  if (kind === 'pct') {
    if (typeof value !== 'number') throw new Error('CDE percentage values must be numeric');
    if (!Number.isFinite(value)) throw new Error('CDE percentage values must be finite');
    return `${Math.round(value)}%`;
  }

  if (kind === 'index') {
    if (typeof value !== 'number') throw new Error('CDE index values must be numeric');
    if (!Number.isFinite(value)) throw new Error('CDE index values must be finite');
    return `Index ${Math.round(value)}`;
  }

  if (kind !== 'band') throw new Error(`Unsupported CDE format kind: ${kind}`);

  if (typeof value !== 'string') throw new Error('CDE bands must be strings');

  const normalizedValue = value.trim();
  if (currencyPattern.test(normalizedValue)) throw new Error('CDE bands must not include currency symbols or codes');
  if (!normalizedValue.includes('equiv.')) throw new Error('CDE bands must include equiv. to mark modelled ranges');
  const modelledBandMatch = normalizedValue.match(modelledBandPattern);
  if (!modelledBandMatch) {
    throw new Error('CDE bands must be a modelled range such as 8-12k equiv./mo');
  }
  const low = Number(modelledBandMatch[1]);
  const high = Number(modelledBandMatch[2]);
  if (!Number.isFinite(low) || !Number.isFinite(high) || low > high || (low === high && low !== 0)) {
    throw new Error('CDE bands must be an ascending modelled range such as 8-12k equiv./mo');
  }
  return normalizedValue;
}

export function formatPropensity(value: number): string {
  return value.toFixed(2);
}

export function formatOfferMoney(value: number): string {
  return `MOP ${Math.round(value).toLocaleString('en-US')}`;
}

export function formatGuestBand(low: number, high: number): string {
  return `~${low}-${high}k matched guests`;
}
