import { describe, expect, it } from 'vitest';
import {
  buildConstellationRedesignModel,
  redesignNavItems,
  redesignSegments,
  type RedesignPageId,
} from './constellation-redesign-model';

const bannedCdePattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend|NaN|Infinity/i;

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
    expect(redesignNavItems.map((item) => item.label)).toEqual([
      'Overview',
      'Journey',
      'Wallet',
      'Segments',
      'Guests',
      'Leakage',
      'Propensity',
      'Activation',
      'Simulator',
      'Measurement',
      'Market Scan',
      'Governance',
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
    expectDisplaySafe(model);
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
