import { getCorridorById } from '@/data';
import { buildAcquisitionDraft } from './acquisition-content';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('buildAcquisitionDraft', () => {
  it('generates deterministic multilingual A/B variants without backend or currency', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');

    expect(draft.languages).toEqual(['EN', '繁中', '한국어']);
    expect(draft.variants).toHaveLength(2);
    expect(draft.variants[0].subject).toContain('Korea');
    expect(draft.variants[0].body).toContain('Merging to the World');
    expect(draft.variants[0].body).toContain('labelled Mastercard CDE indices');
    expect(draft.variants[0].body).toContain('100 baseline');
    expect(draft.variants[1].kvCaption).toContain('Arena-first Rewards package');
    expect(draft.versionHistory).toEqual(['v1 corridor signal', 'v2 persona offer', 'v3 compliance copy']);
    expect(JSON.stringify(draft)).not.toMatch(bannedCurrencyPattern);
  });

  it('de-dupes fallback Chinese language labels while preserving order', () => {
    const corridor = getCorridorById('taiwan');
    const draft = buildAcquisitionDraft(corridor, 'luxury_shopper');

    expect(draft.languages).toEqual(['EN', '繁中']);
  });

  it('falls back to the corridor top persona for invalid persona keys', () => {
    const corridor = getCorridorById('taiwan');
    const draft = buildAcquisitionDraft(corridor, 'not_a_persona');

    expect(draft.persona).toBe('luxury_shopper');
    expect(draft.variants[0].subject).toContain('Luxury Shopper');
  });

  it('rejects malformed or banned value bands before generating copy', () => {
    const corridor = {
      ...getCorridorById('korea'),
      projectedValueBand: 'HKD 22k',
    };

    expect(() => buildAcquisitionDraft(corridor, 'entertainment_lover')).toThrow(/currency/i);
  });
});
