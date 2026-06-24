import { formatEnriched, formatOfferMoney } from './format';

describe('formatEnriched', () => {
  it('formats legal CDE percentages, indices, and bands', () => {
    expect(formatEnriched(63, 'pct')).toBe('63%');
    expect(formatEnriched(176, 'index')).toBe('Index 176');
    expect(formatEnriched('8-12k equiv./mo', 'band')).toBe('8-12k equiv./mo');
  });

  it('rejects CDE bands that look like exact money values', () => {
    expect(() => formatEnriched('MOP 9000', 'band')).toThrow(/CDE bands must not include currency/);
    expect(() => formatEnriched('$9000', 'band')).toThrow(/CDE bands must not include currency/);
    expect(() => formatEnriched('9000', 'band')).toThrow(/equiv/);
  });

  it('rejects unsupported runtime format kinds', () => {
    expect(() => formatEnriched('8-12k equiv./mo', 'money' as never)).toThrow(/Unsupported CDE format kind/);
  });

  it('keeps Galaxy offer mechanics in a separate formatter', () => {
    expect(formatOfferMoney(200)).toBe('MOP 200');
  });
});
