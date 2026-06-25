import {
  CORRIDOR_YEARS,
  corridors,
  getCorridorById,
  priorityCorridor,
} from './corridors';
import { methodology } from './generate';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/i;

describe('corridor acquisition data', () => {
  it('generates ten aggregate corridors across 2020 and 2024', () => {
    expect(corridors).toHaveLength(10);
    expect(CORRIDOR_YEARS).toEqual(['2020', '2024']);

    for (const corridor of corridors) {
      expect(corridor.seasonality).toHaveLength(12);
      expect(corridor.gamingSharePct + corridor.nonGamingSharePct).toBe(100);
      expect(corridor.priorityRank).toBeGreaterThanOrEqual(1);
      expect(corridor.priorityRank).toBeLessThanOrEqual(10);
      expect(JSON.stringify(corridor)).not.toMatch(bannedCurrencyPattern);
    }

    const priorityRankSet = Array.from(new Set(corridors.map((corridor) => corridor.priorityRank))).sort(
      (a, b) => a - b,
    );
    expect(priorityRankSet).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('computes Korea as the priority corridor while marking it as refresh pending', () => {
    expect(priorityCorridor.id).toBe('korea');
    expect(priorityCorridor.priorityRank).toBe(1);
    expect(priorityCorridor.dataVintage).toBe('2020');
    expect(priorityCorridor.note).toBe('Merging to the World');
  });

  it('falls back to the priority corridor for unknown corridor ids', () => {
    expect(getCorridorById('unknown').id).toBe(priorityCorridor.id);
  });

  it('keeps deterministic priority order for equal priority-index ties', () => {
    expect(corridors.map((corridor) => corridor.id)).toEqual([
      'korea',
      'singapore',
      'japan',
      'taiwan',
      'gba_mainland',
      'malaysia',
      'thailand',
      'indonesia',
      'philippines',
      'hongkong',
    ]);
  });

  it('bakes in the required corridor contrasts', () => {
    const taiwan = getCorridorById('taiwan');
    const singapore = getCorridorById('singapore');
    const japan = getCorridorById('japan');
    const hongKong = getCorridorById('hongkong');
    const malaysia = getCorridorById('malaysia');
    const thailand = getCorridorById('thailand');

    expect(taiwan.gamingSharePct).toBeGreaterThan(taiwan.nonGamingSharePct);
    expect(singapore.nonGamingMix.hospitality).toBeGreaterThan(singapore.nonGamingMix.retail);
    expect(Math.max(japan.seasonality[2], japan.seasonality[3])).toBeGreaterThan(130);
    expect(Math.max(japan.seasonality[9], japan.seasonality[10])).toBeGreaterThan(130);
    expect(hongKong.arrivalsIndex['2024']).toBeLessThan(hongKong.arrivalsIndex['2020']);
    expect(malaysia.seasonality[4]).toBeGreaterThanOrEqual(118);
    expect(thailand.seasonality[11]).toBeGreaterThanOrEqual(120);
  });

  it('extends methodology with Lens B aggregate-panel disclosure', () => {
    expect(methodology.panelSharePct).toBe('10–20%');
    expect(methodology.dataYears).toEqual(['2020', '2024']);
    expect(methodology.lensBNote).toBe('aggregate inbound panel, no PII');
  });
});
