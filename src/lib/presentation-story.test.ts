import { topPriorityGuests } from '@/data';

import {
  mainPresenterTourStops,
  presentationSteps,
  resolvePresentationStep,
} from './presentation-story';

describe('presentation story model', () => {
  it('resolves exact routes to client-facing observation and action copy', () => {
    const overview = resolvePresentationStep('/');

    expect(overview.id).toBe('overview');
    expect(overview.title).toBe('Overview');
    expect(overview.observation).toContain('wallet gap');
    expect(overview.recommendedAction).toContain('Open with');
    expect(overview.nextHref).toBe('/wallet');
    expect(overview.nextLabel).toBe('Open wallet gap proof');
  });

  it('resolves dynamic guest and corridor routes before generic routes', () => {
    expect(resolvePresentationStep('/guests/MEM-%E2%80%A2%E2%80%A2%E2%80%A2%E2%80%A23421').id).toBe('guest360');
    expect(resolvePresentationStep('/corridors/korea').id).toBe('corridorDetail');
    expect(resolvePresentationStep('/corridors').id).toBe('sourceMarkets');
  });

  it('keeps corridor detail presentation next action distinct from page CTAs', () => {
    const corridorDetail = resolvePresentationStep('/corridors/korea');

    expect(corridorDetail.nextHref).toBe('/acquisition?corridor=korea');
    expect(corridorDetail.nextLabel).toBe('Open acquisition hand-off');
    expect(corridorDetail.nextLabel).not.toBe('Generate campaign content');
  });

  it('keeps the recommended presenter tour focused on the Lens A decision story', () => {
    expect(mainPresenterTourStops.map((step) => step.id)).toEqual([
      'journey',
      'overview',
      'wallet',
      'segments',
      'guests',
      'audience',
      'activation',
      'measurement',
      'governance',
    ]);
    expect(mainPresenterTourStops.map((step) => step.href)).toEqual([
      '/journey',
      '/',
      '/wallet',
      '/segments',
      '/guests',
      '/propensity',
      '/activation',
      '/measurement',
      '/governance',
    ]);
  });

  it('links the guest priority step to the current top Customer 360', () => {
    const guests = resolvePresentationStep('/guests');

    expect(guests.nextHref).toBe(`/guests/${encodeURIComponent(topPriorityGuests[0].id)}`);
    expect(guests.nextLabel).toBe('Open top Customer 360');
  });

  it('has complete copy and next actions for every route step', () => {
    presentationSteps.forEach((step) => {
      expect(step.title).toMatch(/\S/);
      expect(step.presentationRole).toMatch(/\S/);
      expect(step.observation).toMatch(/\S/);
      expect(step.recommendedAction).toMatch(/\S/);
      expect(step.nextHref).toMatch(/^\/|^#/);
      expect(step.nextLabel).toMatch(/\S/);
    });
  });
});
