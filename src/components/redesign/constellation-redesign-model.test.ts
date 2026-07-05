import { describe, expect, it } from 'vitest';
import {
  buildConstellationRedesignModel,
  redesignNavItems,
  redesignSegments,
  type ConstellationRedesignModel,
  type RedesignPageId,
} from './constellation-redesign-model';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|\b(?:NaN|Infinity)\b/i;

function expectDisplaySafe(value: unknown) {
  if (typeof value === 'number') {
    expect(Number.isFinite(value)).toBe(true);
    return;
  }

  if (typeof value === 'string') {
    expect(value).not.toMatch(bannedCdePattern);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach(expectDisplaySafe);
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach(expectDisplaySafe);
  }
}

describe('constellation redesign model', () => {
  it('ports the prototype navigation and segment universe', () => {
    expect(redesignNavItems).toEqual([
      { section: 'Plan', label: 'Overview', num: '01', pageId: 'overview', href: '/' },
      { section: null, label: 'Journey', num: '02', pageId: 'journey', href: '/journey' },
      { section: null, label: 'Wallet', num: '03', pageId: 'wallet', href: '/wallet' },
      { section: 'Audience', label: 'Segments', num: '04', pageId: 'segments', href: '/segments' },
      { section: null, label: 'Guests', num: '05', pageId: 'guests', href: '/guests' },
      { section: null, label: 'Leakage', num: '06', pageId: 'leakage', href: '/leakage' },
      { section: null, label: 'Propensity', num: '07', pageId: 'propensity', href: '/propensity' },
      { section: 'Act', label: 'Activation', num: '08', pageId: 'activation', href: '/activation' },
      { section: null, label: 'Simulator', num: '09', pageId: 'simulate', href: '/simulate' },
      { section: 'Measure', label: 'Measurement', num: '10', pageId: 'measurement', href: '/measurement' },
      { section: null, label: 'Market Scan', num: '11', pageId: 'marketscan', href: '/marketscan' },
      { section: 'Govern', label: 'Governance', num: '12', pageId: 'governance', href: '/governance' },
    ]);
    expect(redesignSegments.map((segment) => segment.name)).toEqual([
      'Cosmopolitan Connoisseurs',
      'Premium Mass Weekenders',
      'Family Resort Loyalists',
      'Regional Gaming Regulars',
      'MICE & Business Blend',
      'Transit Samplers',
    ]);
  });

  it('builds the 2026 Q2 overview model from the prototype controller', () => {
    const model = buildConstellationRedesignModel({
      pageId: 'overview',
      quarterLabel: '2026 Q2',
      selectedSegmentId: 'cc',
      channels: {
        'App push': true,
        'CRM email': true,
        'Paid social': false,
        'Concierge / VIP host': false,
      },
      windowWeeks: 6,
      reachPct: 40,
      depthPct: 15,
      exported: false,
    });

    expect(model.pageTitle).toBe('Wallet intelligence cockpit');
    const typedModel: ConstellationRedesignModel = model;
    expect(typedModel.pageId).toBe('overview');
    expect(typedModel.screenLabel).toBe('Overview');
    expect(model.quarter.label).toBe('2026 Q2');
    expect(model.quarter.coverage).toBe(63);
    expect(model.selectedSegment.name).toBe('Cosmopolitan Connoisseurs');
    expect(model.topSegment.name).toBe('Cosmopolitan Connoisseurs');
    expect(model.kpis.map((kpi) => kpi.label)).toEqual([
      'Wallet headroom',
      'Matched guest band',
      'Galaxy wallet capture',
      'Top opportunity index',
    ]);
    expect(model.kpis[0].value).toBe('53%');
    expect(model.kpis[1].value).toBe('150-222k');
    expect(model.kpis[2].value).toBe('52%');
    expect(model.kpis[3].value).toBe('118');
    expect(model.constellationNodes).toHaveLength(6);
    expect(model.legend.map((item) => item.band)).toEqual(['<90', '90-109', '110-129', '130+']);
    expect(model.navItems.find((item) => item.pageId === 'governance')).toMatchObject({
      label: 'Governance',
      href: '/governance',
    });
    Object.values(model.aiAnswers).forEach((answer) => {
      expect(answer).not.toMatch(/\b0\.\d+\b/);
      expect(answer).not.toMatch(/\b\d+\s+active metrics\b/i);
    });
    expect(model.leakageCategories).toHaveLength(4);
    expect(model.propensityRows).toHaveLength(6);
    ['segRows', 'segChips', 'selName', 'selProp', 'propRows', 'selectedPropensity', 'liftBand'].forEach((aliasKey) => {
      expect(Object.hasOwn(model, aliasKey)).toBe(false);
    });
    expect(model.briefCopy).not.toContain('propensity 0.86');
    expect(JSON.stringify(model)).not.toMatch(/"(?:prop|selectedPropensity|selProp)"\s*:\s*"0\.\d+"/);
    expect(JSON.stringify(model)).not.toContain('propensityPct');
    expect(model.segmentRows[0]).toHaveProperty('propensityBand');
    expect(model.segmentRows[0]).not.toHaveProperty('propensityPct');
    expect(model.propensityRows[0]).toHaveProperty('propensityBand');
    expect(model.propensityRows[0]).toHaveProperty('barWidthPct');
    expect(model.propensityRows[0]).not.toHaveProperty('propensityPct');
    expect(model.propensityRows[0]).not.toHaveProperty('w');
    expectDisplaySafe(model);
  });

  it('isolates returned mutable collections between builds', () => {
    const first = buildConstellationRedesignModel({
      pageId: 'overview',
      quarterLabel: '2026 Q2',
      selectedSegmentId: 'cc',
      channels: {
        'App push': true,
        'CRM email': true,
        'Paid social': false,
        'Concierge / VIP host': false,
      },
      windowWeeks: 6,
      reachPct: 40,
      depthPct: 15,
      exported: false,
    });

    (first.quarterKeys as string[]).push('2099 Q4');
    (first.categoryBase as Record<string, number>).Dining = 999;

    const second = buildConstellationRedesignModel({
      pageId: 'overview',
      quarterLabel: '2026 Q2',
      selectedSegmentId: 'cc',
      channels: {
        'App push': true,
        'CRM email': true,
        'Paid social': false,
        'Concierge / VIP host': false,
      },
      windowWeeks: 6,
      reachPct: 40,
      depthPct: 15,
      exported: false,
    });

    expect(second.quarterKeys).toEqual(['2025 Q3', '2025 Q4', '2026 Q1', '2026 Q2']);
    expect(second.categoryBase).toEqual({
      Hospitality: 50,
      Dining: 53,
      Entertainment: 52,
      'Retail/Luxury': 57,
    });
  });

  it('derives quarter deltas and selected segment state deterministically', () => {
    const model = buildConstellationRedesignModel({
      pageId: 'segments',
      quarterLabel: '2025 Q3',
      selectedSegmentId: 'pm',
      channels: {
        'App push': true,
        'CRM email': true,
        'Paid social': false,
        'Concierge / VIP host': false,
      },
      windowWeeks: 4,
      reachPct: 70,
      depthPct: 22,
      exported: true,
    });

    expect(model.pageTitle).toBe('Segment rankings');
    expect(model.quarter.coverage).toBe(58);
    expect(model.selectedSegment.name).toBe('Premium Mass Weekenders');
    expect(model.selectedStats).toEqual([
      { label: 'Opportunity', value: 'Index 96' },
      { label: 'Top leakage', value: '48% Dining' },
      { label: 'Wallet band', value: '8-14k /mo' },
      { label: 'Matched guests', value: '28-41k' },
    ]);
    expect(model.exportLabel).toBe('Brief handed to Marketing');
    expect(model.windowNote).toBe('A 4-week window fits arrival-triggered offers.');
    expect(model.walletTrend.map((item) => item.band)).toEqual(['8-14k', '8-14k', '8-14k', '8-14k']);
    expect(model.readouts[3].note).toBe('Launches after governance sign-off.');
    expect(model.measureCounts[2].sub).toBe('Awaiting governance sign-off');
    expect(model.rules[0]).toEqual({
      t: 'Ranges & indices only',
      d: 'Enriched figures never surface raw counts or spend amounts.',
    });
    expect(model.simulation.liftBand).toMatch(/^\+\d+ to \+\d+$/);
    expectDisplaySafe(model);
  });

  it.each<RedesignPageId>([
    'overview',
    'journey',
    'wallet',
    'segments',
    'guests',
    'leakage',
    'propensity',
    'activation',
    'simulate',
    'measurement',
    'marketscan',
    'governance',
  ])('builds a display-safe model for %s', (pageId) => {
    const model = buildConstellationRedesignModel({
      pageId,
      quarterLabel: '2026 Q2',
      selectedSegmentId: 'missing',
      channels: {
        'App push': false,
        'CRM email': false,
        'Paid social': false,
        'Concierge / VIP host': false,
      },
      windowWeeks: 8,
      reachPct: 10,
      depthPct: 5,
      exported: false,
    });

    expect(model.selectedSegment.id).toBe('cc');
    expect(model.pageTitle.length).toBeGreaterThan(0);
    expectDisplaySafe(model);
  });
});
