import { campaigns, createLaunchedCampaign, getCampaignById } from './campaigns';

const bannedCurrencyPattern = /\b(?:mop|hkd)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;

describe('campaign seed data', () => {
  it('ships deterministic seed campaigns with weekly test/control readouts', () => {
    expect(campaigns.length).toBeGreaterThanOrEqual(4);

    const campaign = getCampaignById('promenade-luxury-play');

    expect(campaign).toBeDefined();
    expect(campaign?.segmentIds).toContain('cosmopolitan-connoisseurs');
    expect(campaign?.weeklySeries).toHaveLength(8);
    expect(campaign?.weeklySeries[0]).toEqual({
      week: expect.any(String),
      testIndex: expect.any(Number),
      controlIndex: expect.any(Number),
    });
  });

  it('keeps CDE campaign data free of banned currency tokens', () => {
    expect(JSON.stringify(campaigns)).not.toMatch(bannedCurrencyPattern);
  });

  it('creates deterministic launched activation campaigns from audience input', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Top leakage segments',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });

    expect(campaign.id).toBe('launched-activation-top-leakage-segments');
    expect(campaign.segmentIds).toEqual(['cosmopolitan-connoisseurs']);
    expect(campaign.testDesign.holdoutPct).toBeGreaterThanOrEqual(10);
    expect(campaign.testDesign.durationWeeks).toBe(8);
    expect(campaign.weeklySeries).toHaveLength(8);
    expect(JSON.stringify(campaign)).not.toMatch(bannedCurrencyPattern);
  });

  it('aligns launched host-lift campaigns to the seed hospitality semantics', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Host priority guests',
      segmentIds: ['diamond-high-rollers'],
      lever: 'hostLift',
    });

    expect(campaign.category).toBe('hospitality');
  });

  it('aligns launched channel-shift campaigns to the seed entertainment semantics', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Mobile planners',
      segmentIds: ['gba-cross-border-explorers'],
      lever: 'channelShift',
    });

    expect(campaign.category).toBe('entertainment');
  });

  it('disambiguates launched campaign ids when the same audience uses different levers', () => {
    const recaptureCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Top leakage segments',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });
    const hostLiftCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Top leakage segments',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'hostLift',
    });

    expect(recaptureCampaign.id).toBe('launched-activation-top-leakage-segments');
    expect(hostLiftCampaign.id).not.toBe(recaptureCampaign.id);
  });

  it('disambiguates launched campaign ids when the same audience uses different single segments', () => {
    const firstCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Shared audience',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });
    const secondCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'Shared audience',
      segmentIds: ['diamond-high-rollers'],
      lever: 'recapture',
    });

    expect(firstCampaign.id).not.toBe(secondCampaign.id);
    expect(firstCampaign.id).not.toMatch(bannedCurrencyPattern);
    expect(secondCampaign.id).not.toMatch(bannedCurrencyPattern);
  });

  it('keeps non-Latin launched campaign ids deterministic and distinct', () => {
    const firstCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: '高端客群',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });
    const secondCampaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: '高價值客群',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });

    expect(firstCampaign.id).not.toBe(secondCampaign.id);
    expect([firstCampaign.id, secondCampaign.id]).not.toEqual([
      'launched-activation-campaign',
      'launched-activation-campaign',
    ]);
  });

  it('keeps non-Latin fallback hashes free of banned currency tokens', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: '狙',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'recapture',
    });

    expect(campaign.id).not.toMatch(bannedCurrencyPattern);
    expect(JSON.stringify(campaign)).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes unsafe launched campaign text before deriving CDE campaign data', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'HKD VIP $ leakage 元',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'MOP 500 rebate $',
    });

    expect(campaign.id).not.toMatch(bannedCurrencyPattern);
    expect(JSON.stringify(campaign)).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes compact currency tokens without mutating canonical segment ids', () => {
    const campaign = createLaunchedCampaign({
      source: 'activation',
      audienceName: 'HKD500 compact',
      segmentIds: ['cosmopolitan-connoisseurs'],
      lever: 'MOP500 rebate',
    });

    expect(campaign.segmentIds).toEqual(['cosmopolitan-connoisseurs']);
    expect(JSON.stringify(campaign)).not.toMatch(bannedCurrencyPattern);
  });
});
