import { getCorridorById, type CampaignCreativeLanguage, type CampaignCreativeVariant } from '@/data';
import { buildAcquisitionDraft } from './acquisition-content';

const requiredLanguages = ['EN', '繁中', '한국어'] satisfies CampaignCreativeLanguage[];
const bannedCdePattern = /HKD|MOP|\$|元|澳門幣|NaN|Infinity/i;

function campaignVariants(draft: ReturnType<typeof buildAcquisitionDraft>) {
  return draft.variants as CampaignCreativeVariant[];
}

describe('buildAcquisitionDraft', () => {
  it('generates deterministic measurement-ready multilingual A/B variants with guardrails', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');
    const variants = campaignVariants(draft);

    expect(draft.languages).toEqual(requiredLanguages);
    expect(variants).toHaveLength(requiredLanguages.length * 2);
    expect(variants[0].subject).toContain('Korea');
    expect(variants[0].body).toContain('Merging to the World');
    expect(variants[0].body).toContain('labelled Mastercard CDE indices');
    expect(variants[0].body).toContain('100 baseline');
    expect(variants[1].body).toContain('Arena-first Rewards package');

    for (const language of requiredLanguages) {
      const variantsForLanguage = variants.filter((variant) => variant.language === language);

      expect(variantsForLanguage.map((variant) => variant.id).sort()).toEqual(['A', 'B']);
      for (const variant of variantsForLanguage) {
        expect(variant.subject).toEqual(expect.any(String));
        expect(variant.body).toEqual(expect.any(String));
        expect(variant.guardrail).toMatch(/brand voice/i);
        expect(variant.guardrail).toMatch(/compliance/i);
        expect(variant.guardrail).toMatch(/no unbanded amounts/i);
        expect(variant.guardrail).toMatch(/PII/i);
        expect(variant.guardrail).toMatch(/CDE-safe/i);
      }
    }

    expect(draft.versionHistory).toEqual(expect.arrayContaining([
      expect.stringMatching(/measurement-ready launch/i),
    ]));
    expect(JSON.stringify(draft)).not.toMatch(bannedCdePattern);
  });

  it('keeps the required measurement language set for Chinese corridors', () => {
    const corridor = getCorridorById('taiwan');
    const draft = buildAcquisitionDraft(corridor, 'luxury_shopper');

    expect(draft.languages).toEqual(requiredLanguages);
    expect(campaignVariants(draft).filter((variant) => variant.language === '繁中')).toHaveLength(2);
    expect(JSON.stringify(draft)).not.toMatch(bannedCdePattern);
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
