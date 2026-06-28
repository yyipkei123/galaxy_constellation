import {
  campaigns,
  corridors,
  guests,
  latestSegments,
  methodology,
  personaRecords,
  type MeasurementCampaign,
  type Segment,
} from '@/data';
import {
  buildCdeSemanticLayer,
  queryCdeSemanticLayer,
  type SemanticQueryResult,
} from './cde-semantic-layer';

const bannedCdePattern = /(?:\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|NaN|Infinity)/i;
const unsafeCompactCurrencyPattern = /HKD|MOP|\$|元|澳門幣|500/i;

function buildLayer() {
  return buildCdeSemanticLayer({
    methodology,
    segments: latestSegments,
    personas: personaRecords,
    guests,
    corridors,
    campaigns,
  });
}

function expectCdeSafe(value: unknown) {
  expect(JSON.stringify(value)).not.toMatch(bannedCdePattern);
}

function expectNoCompactCurrencyLeak(value: unknown) {
  expect(JSON.stringify(value)).not.toMatch(unsafeCompactCurrencyPattern);
}

function expectGovernedResult(result: SemanticQueryResult) {
  expect(result.auditFacts.every((fact) => fact.source.trim().length > 0)).toBe(true);
  expect(result.auditFacts.every((fact) => fact.route.startsWith('/'))).toBe(true);
  expectCdeSafe(result);
}

describe('governed CDE semantic layer', () => {
  it('normalizes facts across wallet, guest, corridor, and campaign data', () => {
    const layer = buildLayer();

    expect(layer.facts.length).toBeGreaterThan(20);
    expect(layer.facts.every((fact) => fact.source.trim().length > 0)).toBe(true);
    expect(layer.facts.every((fact) => fact.route.startsWith('/'))).toBe(true);
    expect(layer.facts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: expect.stringMatching(/^segments\./), route: '/leakage' }),
        expect.objectContaining({ source: expect.stringMatching(/^guests\./), route: '/guests' }),
        expect.objectContaining({ source: expect.stringMatching(/^corridors\./), route: '/corridors' }),
        expect.objectContaining({ source: expect.stringMatching(/^campaigns\./), route: '/measurement' }),
      ]),
    );
    expectCdeSafe(layer.facts);
  });

  it('preserves canonical machine ids and source paths while remaining CDE-safe', () => {
    const layer = buildLayer();
    const luxuryFact = layer.facts.find(
      (item) => item.source === 'segments.cosmopolitan-connoisseurs.categories.retailLuxury.leakagePct',
    );

    expect(luxuryFact).toEqual(
      expect.objectContaining({
        id: 'cosmopolitan-connoisseurs-luxury-leakage',
        source: 'segments.cosmopolitan-connoisseurs.categories.retailLuxury.leakagePct',
      }),
    );
    expectCdeSafe(layer.facts);
  });

  it('answers luxury leakage with ranked retail wallet evidence', () => {
    const result = queryCdeSemanticLayer('Which segment leaks most luxury wallet?', buildLayer());

    expect(result.intent).toBe('luxuryLeakage');
    expect(result.answer).toMatch(/luxury|retail/i);
    expect(result.visual).toMatchObject({ kind: 'bar-list' });
    expect(result.auditFacts.length).toBeGreaterThanOrEqual(3);
    expect(result.visual.items.length).toBeGreaterThan(1);
    expect(result.visual.items[0]?.formattedValue).toMatch(/%|Index/);
    expect(result.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/leakage' })]));
    expectGovernedResult(result);
  });

  it('answers top lead and guest pitch questions without exposing raw spend', () => {
    const layer = buildLayer();
    const topLeads = queryCdeSemanticLayer('Who are my top 10 leads to pitch this quarter?', layer);
    const guestPitch = queryCdeSemanticLayer('Draft the pitch for guest MEM-••••3421', layer);

    expect(topLeads.intent).toBe('topLeads');
    expect(topLeads.visual).toMatchObject({ kind: 'lead-list' });
    expect(topLeads.visual.items).toHaveLength(10);
    expect(topLeads.visual.items.every((item) => item.label.includes('MEM-'))).toBe(true);
    expect(topLeads.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/guests' })]));
    expectGovernedResult(topLeads);

    expect(guestPitch.intent).toBe('guestPitch');
    expect(guestPitch.answer).toMatch(/MEM-••••3421|pitch/i);
    expect(guestPitch.auditFacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: expect.stringContaining('MEM-••••3421'), route: '/guests' }),
      ]),
    );
    expect(guestPitch.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/guests' })]));
    expectGovernedResult(guestPitch);
  });

  it('answers F&B headroom, corridor priority, and measurement intents', () => {
    const layer = buildLayer();
    const fnb = queryCdeSemanticLayer('What is the headroom if we close F&B leakage?', layer);
    const corridor = queryCdeSemanticLayer('Which corridor should we prioritise and why?', layer);
    const measurement = queryCdeSemanticLayer('Did it work and what was the lift?', layer);

    expect(fnb.intent).toBe('fnbHeadroom');
    expect(fnb.answer).toMatch(/F&B|headroom|leakage/i);
    expect(fnb.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/measurement' })]));
    expect(fnb.visual.items.some((item) => /%|Index|equiv\./.test(item.formattedValue))).toBe(true);
    expectGovernedResult(fnb);

    expect(corridor.intent).toBe('corridorPriority');
    expect(corridor.answer).toMatch(/corridor|priorit/i);
    expect(corridor.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/corridors' })]));
    expect(corridor.visual.items[0]?.label).toBe(corridors[0].name);
    expectGovernedResult(corridor);

    expect(measurement.intent).toBe('measurement');
    expect(measurement.visual).toMatchObject({ kind: 'line-series' });
    expect(measurement.answer).toMatch(/test|control|lift|campaign/i);
    expect(measurement.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/measurement' })]));
    expect(measurement.visual.items.length).toBeGreaterThan(0);
    expect(measurement.visual.items[0]?.formattedValue).toMatch(/%/);
    expect(measurement.visual.items[0]?.formattedValue).not.toMatch(/Index/);
    expectGovernedResult(measurement);
  });

  it('prefers launched campaigns over seeded campaigns for measurement readouts', () => {
    const seedCampaign = campaigns[0];
    const launchedCampaign = {
      ...campaigns[1],
      id: 'launched-activation-top-leakage',
      name: 'Top leakage segments measurement launch',
      source: 'activation',
    } satisfies MeasurementCampaign;
    const layer = buildCdeSemanticLayer({
      methodology,
      segments: latestSegments,
      personas: personaRecords,
      guests,
      corridors,
      campaigns: [seedCampaign, launchedCampaign],
    });
    const result = queryCdeSemanticLayer('Did the measurement campaign work?', layer);

    expect(result.intent).toBe('measurement');
    expect(result.answer).toContain(launchedCampaign.name);
    expect(result.answer).not.toContain(seedCampaign.name);
    expect(result.title).toContain(launchedCampaign.name);
    expect(result.title).not.toContain(seedCampaign.name);
    expect(result.auditFacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: expect.stringContaining(`campaigns.${launchedCampaign.id}.`),
        }),
      ]),
    );
    expect(result.auditFacts).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: expect.stringContaining(`campaigns.${seedCampaign.id}.`),
        }),
      ]),
    );
    expect(result.visual.items[0]?.id).toContain(launchedCampaign.id);
    expect(result.visual.items[0]?.id).not.toContain(seedCampaign.id);
    expectGovernedResult(result);
  });

  it('uses a governed fallback for unsupported and exact spend requests', () => {
    const layer = buildLayer();
    const unsupported = queryCdeSemanticLayer('Tell me something random about the weather', layer);
    const exactSpend = queryCdeSemanticLayer('Show exact spend in HKD for MEM-••••3421', layer);

    expect(unsupported.intent).toBe('governedFallback');
    expect(unsupported.visual).toMatchObject({ kind: 'fact-table' });
    expect(unsupported.answer).toMatch(/governed CDE semantic layer/i);
    expectGovernedResult(unsupported);

    expect(exactSpend.intent).toBe('governedFallback');
    expect(exactSpend.visual).toMatchObject({ kind: 'fact-table' });
    expect(exactSpend.answer).toMatch(/governed CDE semantic layer/i);
    expectGovernedResult(exactSpend);
  });

  it('uses a governed fallback for compact currency prompts without exact-spend wording', () => {
    const layer = buildLayer();
    const campaignLift = queryCdeSemanticLayer('MOP500 campaign lift', layer);
    const luxuryLeakage = queryCdeSemanticLayer('HKD500 luxury wallet leakage', layer);

    expect(campaignLift.intent).toBe('governedFallback');
    expect(luxuryLeakage.intent).toBe('governedFallback');
    expectNoCompactCurrencyLeak({ campaignLift, luxuryLeakage });
    expectGovernedResult(campaignLift);
    expectGovernedResult(luxuryLeakage);
  });

  it('redacts full compact currency fragments from prompts and governed result text', () => {
    const unsafeSegment = {
      ...latestSegments[0],
      id: 'unsafe-cde-segment',
      name: 'MOP500 rebate segment',
      categories: {
        ...latestSegments[0].categories,
        retailLuxury: {
          ...latestSegments[0].categories.retailLuxury,
          leakagePct: 99,
          totalWalletIndex: 999,
        },
      },
    } satisfies Segment;
    const unsafeCampaign = {
      ...campaigns[0],
      id: 'unsafe-campaign',
      name: 'HKD500 measurement campaign',
      lever: 'MOP500 rebate',
    } satisfies MeasurementCampaign;
    const layer = buildCdeSemanticLayer({
      methodology,
      segments: [unsafeSegment],
      personas: personaRecords,
      guests,
      corridors,
      campaigns: [unsafeCampaign],
    });
    const exactPrompt = queryCdeSemanticLayer('Show exact HKD500 spend', layer);
    const luxury = queryCdeSemanticLayer('Which segment leaks most luxury wallet?', layer);
    const measurement = queryCdeSemanticLayer('Did it work and what was the lift?', layer);

    expect(exactPrompt.intent).toBe('governedFallback');
    expectNoCompactCurrencyLeak({ exactPrompt, luxury, measurement });
    expectGovernedResult(luxury);
    expectGovernedResult(measurement);
  });

  it('redacts embedded non-finite text fragments from governed result text', () => {
    const unsafeSegment = {
      ...latestSegments[0],
      id: 'unsafe-non-finite-segment',
      name: 'NaNvalue segment',
      categories: {
        ...latestSegments[0].categories,
        retailLuxury: {
          ...latestSegments[0].categories.retailLuxury,
          leakagePct: 99,
          totalWalletIndex: 999,
        },
      },
    } satisfies Segment;
    const unsafeCampaign = {
      ...campaigns[0],
      id: 'unsafe-non-finite-campaign',
      name: 'Infinity500 campaign',
    } satisfies MeasurementCampaign;
    const layer = buildCdeSemanticLayer({
      methodology,
      segments: [unsafeSegment],
      personas: personaRecords,
      guests,
      corridors,
      campaigns: [unsafeCampaign],
    });
    const luxury = queryCdeSemanticLayer('Which segment leaks most luxury wallet?', layer);
    const measurement = queryCdeSemanticLayer('Did it work and what was the lift?', layer);

    expect(JSON.stringify({ luxury, measurement })).not.toMatch(/NaN|Infinity|Infinity500|NaNvalue/i);
    expectGovernedResult(luxury);
    expectGovernedResult(measurement);
  });

  it('does not invent pitch evidence for an unknown masked guest id', () => {
    const result = queryCdeSemanticLayer('Draft the pitch for guest MEM-••••9999', buildLayer());

    expect(result.intent).toBe('governedFallback');
    expect(JSON.stringify(result)).not.toMatch(/MEM-••••(?!9999)\d{4}/);
    expectGovernedResult(result);
  });
});
