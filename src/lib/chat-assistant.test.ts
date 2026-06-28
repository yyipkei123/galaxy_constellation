import {
  campaigns,
  corridors,
  guests,
  latestSegments,
  methodology,
  personaRecords,
  type Segment,
  type SegmentPersona,
} from '@/data';
import { buildLeakageDrivers } from './insights';
import {
  buildChatAssistantResponse,
  sanitizeChatAssistantText,
  type ChatAssistantContext,
  type ChatAssistantVisualKind,
  type ChatVisualItem,
} from './chat-assistant';

const bannedCurrencyPattern = /\b(?:MOP|HKD)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i;
const unsafeCurrencyFragmentPattern = /(?:MOP500|HKD500|HKD 5000|5000 leakage)/i;

const sprint3Context = {
  methodology,
  segments: latestSegments,
  selectedSegment: latestSegments[0],
  selectedSegmentId: latestSegments[0].id,
  personas: personaRecords,
  guests,
  corridors,
  campaigns,
} satisfies ChatAssistantContext;

function expectSortedDescending(values: number[]) {
  values.forEach((value, index) => {
    if (index === 0) return;
    expect(value).toBeLessThanOrEqual(values[index - 1]);
  });
}

function expectGovernedSafe(value: unknown) {
  const serialized = JSON.stringify(value);

  expect(serialized).not.toMatch(bannedCurrencyPattern);
  expect(serialized).not.toMatch(/NaN|Infinity/);
}

describe('buildChatAssistantResponse', () => {
  it('answers top lead questions from governed semantic facts with a lead-list visual', () => {
    const response = buildChatAssistantResponse('Who are my top 10 leads to pitch this quarter?', sprint3Context);

    expect(response.intent).toBe('topLeads');
    expect(response.governanceBadge).toBe('Grounded · Auditable');
    expect(response.auditFacts.length).toBeGreaterThanOrEqual(3);
    expect(response.visual.kind).toBe('lead-list');
    expect(response.visual.items).toHaveLength(10);
    expect(response.suggestedQuestions).toContain('Draft the pitch for guest MEM-••••3421');
    expect(response.evidence).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: expect.any(String),
          value: expect.any(String),
        }),
      ]),
    );
    expectGovernedSafe(response);
  });

  it('routes corridor and measurement questions through governed semantic intents and links', () => {
    const corridor = buildChatAssistantResponse('Which corridor should we prioritise and why?', sprint3Context);
    const measurement = buildChatAssistantResponse('Did the measurement campaign work and what was the lift?', sprint3Context);

    expect(corridor.intent).toBe('corridorPriority');
    expect(corridor.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/corridors' })]));
    expect(corridor.auditFacts.length).toBeGreaterThanOrEqual(3);
    expect(corridor.visual.kind).toBe('corridor-card');

    expect(measurement.intent).toBe('measurement');
    expect(measurement.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/measurement' })]));
    expect(measurement.auditFacts.length).toBeGreaterThanOrEqual(3);
    expect(measurement.visual.kind).toBe('line-series');
    expectGovernedSafe({ corridor, measurement });
  });

  it('keeps compact and exact currency prompts inside the governed CDE safety boundary', () => {
    const responses = [
      buildChatAssistantResponse('MOP500 campaign lift', sprint3Context),
      buildChatAssistantResponse('HKD500 luxury wallet leakage', sprint3Context),
      buildChatAssistantResponse('Show exact HKD 5000 leakage', sprint3Context),
    ];

    responses.forEach((response) => {
      expect(response.intent).toBe('governedFallback');
      expect(response.governanceBadge).toBe('Grounded · Auditable');
      expect(response.auditFacts.length).toBeGreaterThanOrEqual(3);
      expectGovernedSafe(response);
      expect(JSON.stringify(response)).not.toMatch(unsafeCurrencyFragmentPattern);
    });
  });

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

  it('keeps an explicitly selected persona first even when it has lower opportunity', () => {
    const selectedSegment = latestSegments[0];
    const selectedPersona = personaRecords.find((persona) => persona.name === 'Private Dining Hosts')!;
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      methodology,
      segments: latestSegments,
      selectedSegmentId: selectedSegment.id,
      selectedPersonaId: selectedPersona.id,
      personas: personaRecords,
    });

    expect(response.intent).toBe('persona');
    expect(response.answer).toMatch(/ranks Private Dining Hosts first/i);
    expect(response.visual.items[0]?.label).toBe('Private Dining Hosts');
  });

  it('ignores stale selectedPersonaId values outside the selected segment', () => {
    const selectedSegment = latestSegments[0];
    const scopedPersonas = personaRecords.filter((persona) => persona.segmentId === selectedSegment.id);
    const stalePersona = {
      ...personaRecords.find((persona) => persona.segmentId !== selectedSegment.id)!,
      id: 'stale-off-segment-persona',
      name: 'Off Segment Persona',
      opportunityIndex: 999,
    } as SegmentPersona;
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      methodology,
      segments: latestSegments,
      selectedSegment,
      selectedPersonaId: stalePersona.id,
      personas: [...scopedPersonas, stalePersona],
    });
    const scopedNames = scopedPersonas.map((persona) => persona.name);

    expect(response.intent).toBe('persona');
    expect(response.answer).not.toContain(stalePersona.name);
    expect(response.visual.items.map((item) => item.label)).not.toContain(stalePersona.name);
    expect(response.visual.items.every((item) => scopedNames.includes(item.label))).toBe(true);
  });

  it('routes spend leakage business questions to leakage instead of methodology', () => {
    const response = buildChatAssistantResponse('Where is spend leaking outside?', {
      methodology,
      segments: latestSegments,
      personas: personaRecords,
    });

    expect(response.intent).toBe('leakage');
    expect(response.links).toEqual(expect.arrayContaining([expect.objectContaining({ href: '/leakage' })]));
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
      expect.arrayContaining(['Which leakage driver is largest for the selected segment?']),
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

  it('redacts amount-first currency fragments from display text', () => {
    const unsafeInputs = [
      { value: '5000 HKD', unsafePattern: /\d/ },
      { value: '5,000 MOP', unsafePattern: /\d/ },
      { value: '5000 $', unsafePattern: /\d/ },
      { value: '6000 HKD per month', unsafePattern: /\d/ },
      { value: 'five thousand HKD', unsafePattern: /five|thousand/i },
      { value: 'HKD five thousand', unsafePattern: /five|thousand/i },
      { value: 'five thousand and twenty HKD', unsafePattern: /five|thousand|twenty/i },
      { value: 'HKD five thousand and twenty', unsafePattern: /five|thousand|twenty/i },
      { value: '五千元', unsafePattern: /五千/ },
    ];

    unsafeInputs.forEach(({ value, unsafePattern }) => {
      const sanitized = sanitizeChatAssistantText(value);

      expect(sanitized).not.toMatch(bannedCurrencyPattern);
      expect(sanitized).not.toMatch(unsafePattern);
    });
  });

  it('preserves safe words that contain currency-token letters', () => {
    expect(sanitizeChatAssistantText('Cosmopolitan Connoisseurs')).toBe('Cosmopolitan Connoisseurs');
    expect(sanitizeChatAssistantText('HKD500 Cosmopolitan')).toBe('CDE-safe value Cosmopolitan');
  });

  it('sanitizes amount-first currency fragments from malformed segment and persona data', () => {
    const malformedSegment = {
      ...latestSegments[0],
      id: 'amount-first-currency-segment',
      name: 'five thousand HKD segment',
      crossPropertyCashBand: '5,000 MOP monthly',
    } as Segment;
    const malformedPersona = {
      ...personaRecords[0],
      id: 'amount-first-currency-persona',
      name: '五千元 persona',
      segmentId: malformedSegment.id,
      crossPropertyCashBand: '5000 $',
    } as SegmentPersona;
    const response = buildChatAssistantResponse('Which persona should we target first?', {
      methodology,
      segments: [malformedSegment],
      selectedSegment: malformedSegment,
      personas: [malformedPersona],
    });
    const serialized = JSON.stringify(response);

    expect(serialized).not.toMatch(bannedCurrencyPattern);
    expect(serialized).not.toMatch(/5000|5,000|five|thousand|五千/i);
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

  it('redacts unsafe currency fragments while preserving safe overview answer context', () => {
    const maliciousSegment = {
      ...latestSegments[0],
      id: 'fragment-redaction-segment',
      name: 'HKD5000 overview segment',
      crossPropertyCashBand: 'MOP5000 monthly',
    } as Segment;
    const response = buildChatAssistantResponse('Give me the portfolio overview', {
      methodology,
      segments: [maliciousSegment],
      personas: [],
    });
    const serialized = JSON.stringify(response);

    expect(response.answer).toMatch(/overview/i);
    expect(response.answer).toMatch(/CDE/i);
    expect(serialized).not.toMatch(bannedCurrencyPattern);
    expect(serialized).not.toMatch(/5000/);
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
