import { latestSegments, methodology, personaRecords, type Segment, type SegmentPersona } from '@/data';
import { buildLeakageDrivers } from './insights';
import {
  buildChatAssistantResponse,
  type ChatAssistantContext,
  type ChatAssistantVisualKind,
  type ChatVisualItem,
} from './chat-assistant';

const bannedCurrencyPattern = /MOP|HKD|\$|元|澳門幣/i;

function expectSortedDescending(values: number[]) {
  values.forEach((value, index) => {
    if (index === 0) return;
    expect(value).toBeLessThanOrEqual(values[index - 1]);
  });
}

describe('buildChatAssistantResponse', () => {
  it('answers leakage questions with ranked CDE driver data and a leakage route link', () => {
    const selectedSegment = latestSegments[0];
    const response = buildChatAssistantResponse('Which segment has the largest leakage gap?', {
      methodology,
      segments: latestSegments,
      selectedSegmentId: selectedSegment.id,
      personas: personaRecords,
    });
    const expectedDrivers = buildLeakageDrivers(selectedSegment).slice(0, 4);

    expect(response.intent).toBe('leakage');
    expect(response.visual?.kind).toBe('bar-list');
    expect(response.visual?.items).toHaveLength(expectedDrivers.length);
    expect(response.visual?.items.map((item) => item.label)).toEqual(expectedDrivers.map((driver) => driver.label));
    expectSortedDescending(response.visual?.items.map((item) => item.value) ?? []);
    expect(response.visual.items[0]).toHaveProperty('description');
    expect(response.visual.items[0]).not.toHaveProperty('detail');
    expect(response.answer).toMatch(/Mastercard CDE/i);
    expect(response.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/leakage' })]));
    expect(JSON.stringify(response)).not.toMatch(bannedCurrencyPattern);
  });

  it('answers persona questions with top persona evidence and an activation route link', () => {
    const selectedSegment = latestSegments[0];
    const expectedPersonas = personaRecords
      .filter((persona) => persona.segmentId === selectedSegment.id)
      .sort((first, second) => second.opportunityIndex - first.opportunityIndex)
      .slice(0, 3);
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      methodology,
      segments: latestSegments,
      selectedSegmentId: selectedSegment.id,
      personas: personaRecords,
    });

    expect(response.intent).toBe('persona');
    expect(response.visual?.kind).toBe('bar-list');
    expect(response.visual?.items.map((item) => item.label)).toEqual(expectedPersonas.map((persona) => persona.name));
    expectSortedDescending(response.visual?.items.map((item) => item.value) ?? []);
    expect(response.evidence).toEqual(expect.arrayContaining([expect.objectContaining({ label: 'Persona evidence' })]));
    expect(response.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/activation' })]));
    expect(JSON.stringify(response)).not.toMatch(bannedCurrencyPattern);
  });

  it('answers methodology and raw-spend questions without route links or exact money values', () => {
    const response = buildChatAssistantResponse('Can you show the raw spend methodology?', {
      methodology,
      segments: latestSegments,
      personas: personaRecords,
    });

    expect(response.intent).toBe('methodology');
    expect(response.answer).toMatch(/indices/i);
    expect(response.answer).toMatch(/percentages/i);
    expect(response.answer).toMatch(/modelled bands/i);
    expect(response.visual.kind).toBe('metric-strip');
    expect(response.links).toEqual([]);
    expect(JSON.stringify(response)).not.toMatch(bannedCurrencyPattern);
  });

  it('falls back with default suggestions for unclear questions', () => {
    const response = buildChatAssistantResponse('Tell me something random', {
      methodology,
      segments: latestSegments,
      personas: personaRecords,
    });

    expect(response.intent).toBe('fallback');
    expect(response.visual.kind).toBe('metric-strip');
    expect(response.suggestedQuestions).toEqual(
      expect.arrayContaining(['Which segment has the largest leakage gap?']),
    );
  });

  it('handles empty segment and persona inputs without non-finite output', () => {
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      methodology,
      segments: [],
      personas: [],
    });
    const serialized = JSON.stringify(response);

    expect(response.intent).toBe('persona');
    expect(response.visual?.kind).toBe('bar-list');
    expect(response.visual?.items).toEqual([]);
    expect(serialized).not.toMatch(/NaN|Infinity/);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes malformed CDE bands before serializing assistant responses', () => {
    const malformedSegment = {
      ...latestSegments[0],
      id: 'bad-segment',
      name: 'Bad Segment',
      crossPropertyCashBand: 'HKD $5000 monthly',
    } as Segment;
    const malformedPersona = {
      ...personaRecords[0],
      id: 'bad-persona',
      segmentId: malformedSegment.id,
      crossPropertyCashBand: 'HKD $5000 monthly',
    } as SegmentPersona;
    const response = buildChatAssistantResponse('Explain the segment opportunity', {
      methodology,
      segments: [malformedSegment],
      selectedSegmentId: malformedSegment.id,
      personas: [malformedPersona],
    });
    const serialized = JSON.stringify(response);

    expect(serialized).toContain('Indexed band equiv./mo');
    expect(serialized).not.toMatch(bannedCurrencyPattern);
  });

  it('sanitizes adjacent currency tokens from caller-provided text and bands', () => {
    const malformedSegment = {
      ...latestSegments[0],
      id: 'adjacent-currency-segment',
      name: 'HKD5000 segment',
      crossPropertyCashBand: 'HKD5000 monthly',
    } as Segment;
    const malformedPersona = {
      ...personaRecords[0],
      id: 'adjacent-currency-persona',
      name: 'MOP5000 persona',
      segmentId: malformedSegment.id,
      crossPropertyCashBand: 'MOP5000 monthly',
    } as SegmentPersona;
    const responses = [
      buildChatAssistantResponse('Give me the portfolio overview', {
        methodology,
        segments: [malformedSegment],
        personas: [malformedPersona],
      }),
      buildChatAssistantResponse('Which persona should we target first?', {
        methodology,
        segments: [malformedSegment],
        selectedSegment: malformedSegment,
        personas: [malformedPersona],
      }),
    ];
    const serialized = JSON.stringify(responses);

    expect(serialized).toContain('Indexed band equiv./mo');
    expect(serialized).not.toMatch(bannedCurrencyPattern);
    expect(serialized).not.toMatch(/NaN|Infinity/);
  });

  it('sanitizes overview responses at the final output boundary', () => {
    const maliciousSegment = {
      ...latestSegments[0],
      id: 'malicious-segment',
      name: 'HKD5000 segment',
      opportunityIndex: Number.POSITIVE_INFINITY,
      metrics: {
        ...latestSegments[0].metrics,
        shareOfWallet: Number.NaN,
      },
    } as Segment;
    const response = buildChatAssistantResponse('Give me the portfolio overview', {
      methodology,
      segments: [maliciousSegment],
      personas: [],
    });
    const serialized = JSON.stringify(response);

    expect(response.intent).toBe('overview');
    expect(serialized).not.toMatch(bannedCurrencyPattern);
    expect(serialized).not.toMatch(/NaN|Infinity/);
  });

  it('accepts the planned selectedSegment context shape and emits visual descriptions', () => {
    const selectedSegment = {
      ...latestSegments[1],
      id: 'direct-selected-segment',
      name: 'Direct Selected Segment',
    } as Segment;
    const context = {
      methodology,
      segments: [],
      selectedSegment,
      personas: [],
    } satisfies ChatAssistantContext;
    const response = buildChatAssistantResponse('Explain the selected segment opportunity', context);
    const validVisualKinds = ['bar-list', 'metric-strip'] satisfies ChatAssistantVisualKind[];
    const firstItem = response.visual.items[0] satisfies ChatVisualItem | undefined;

    expect(response.intent).toBe('segment');
    expect(response.answer).toContain('Direct Selected Segment');
    expect(validVisualKinds).toContain(response.visual.kind);
    expect(firstItem?.description).toEqual(expect.any(String));
    expect(firstItem).not.toHaveProperty('detail');
  });
});
