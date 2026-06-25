import { latestSegments, methodology, personaRecords, type Segment, type SegmentPersona } from '@/data';
import { buildLeakageDrivers } from './insights';
import { buildChatAssistantResponse } from './chat-assistant';

const bannedCurrencyPattern = /\b(?:MOP|HKD)\b|\$|元|澳門幣/i;

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
});
