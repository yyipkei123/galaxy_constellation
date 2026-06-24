export type EnrichedFormatKind = 'pct' | 'index' | 'band';

const currencyPattern = /(MOP|HKD|\$|元|澳門幣)/i;

export function formatEnriched(value: number | string, kind: EnrichedFormatKind): string {
  if (kind === 'pct') {
    if (typeof value !== 'number') throw new Error('CDE percentage values must be numeric');
    return `${Math.round(value)}%`;
  }

  if (kind === 'index') {
    if (typeof value !== 'number') throw new Error('CDE index values must be numeric');
    return `Index ${Math.round(value)}`;
  }

  if (typeof value !== 'string') throw new Error('CDE bands must be strings');
  if (currencyPattern.test(value)) throw new Error('CDE bands must not include currency symbols or codes');
  if (!value.includes('equiv.')) throw new Error('CDE bands must include equiv. to mark modelled ranges');
  return value;
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
