'use client';

import { useMemo } from 'react';
import { NbaCard } from '@/components/panels/nba-card';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { RecommendedPlay, Segment } from '@/data';
import { useAppState, type SavedAudience } from '@/store/app-store';

const GALAXY_REWARDS_TERM = 'MOP 200 rebate on MOP 500 spend';
const EXPORT_TOAST = 'Audience exported to Galaxy Rewards CRM / activation platform';

interface ActivationAudience {
  id: string;
  name: string;
  segmentIds: string[];
  source: 'saved' | 'fallback';
}

function finiteValue(value: number | undefined, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function safeText(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function audienceBand(segments: Segment[]) {
  const low = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeLowK), 0);
  const high = segments.reduce((sum, segment) => sum + finiteValue(segment.sizeHighK), 0);

  return `~${Math.round(low)}-${Math.round(Math.max(low, high))}k matched guests`;
}

function averageIndex(segments: Segment[]) {
  const values = segments.map((segment) => finiteValue(segment.opportunityIndex)).filter(Number.isFinite);

  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function segmentByIds(segments: Segment[], segmentIds: string[]) {
  const segmentIdSet = new Set(segmentIds);

  return segments.filter((segment) => segmentIdSet.has(segment.id));
}

function fallbackAudiences(segments: Segment[]): ActivationAudience[] {
  const topSegments = [...segments]
    .sort((first, second) => finiteValue(second.opportunityIndex) - finiteValue(first.opportunityIndex))
    .slice(0, 2);

  return [{
    id: 'top-leakage-segments',
    name: 'Top leakage segments',
    segmentIds: topSegments.map((segment) => segment.id),
    source: 'fallback',
  }];
}

function savedActivationAudience(audience: SavedAudience): ActivationAudience {
  return {
    id: audience.id,
    name: safeText(audience.name, 'Saved Galaxy Rewards audience'),
    segmentIds: Array.isArray(audience.segmentIds) ? audience.segmentIds : [],
    source: 'saved',
  };
}

function playableCards(segments: Segment[]): Array<{ key: string; play: Partial<RecommendedPlay>; segment: Segment }> {
  return segments.flatMap((segment) => {
    const plays = Array.isArray(segment.recommendedPlays) ? segment.recommendedPlays : [];

    if (plays.length === 0) {
      return [{
        key: `${segment.id}-fallback-play`,
        segment,
        play: {
          title: `${safeText(segment.name, 'Segment')} Galaxy Rewards win-back`,
          lever: 'Galaxy Rewards',
          rationale: safeText(segment.signatureTrait, 'Segment is ready for a CDE-compliant activation test.'),
          channel: 'Hybrid',
        },
      }];
    }

    return plays.map((play, index) => ({
      key: `${segment.id}-${safeText(play.title, `play-${index + 1}`)}`,
      segment,
      play: {
        ...play,
        lever: safeText(play.lever, 'Galaxy Rewards'),
      },
    }));
  });
}

export default function ActivationPage() {
  const { segments, savedAudiences, campaignToast, pushCampaign } = useAppState();
  const safeSegments = useMemo(
    () => (segments ?? []).filter((segment): segment is Segment => Boolean(segment)),
    [segments],
  );
  const hasSavedAudiences = savedAudiences.length > 0;
  const audiences = useMemo(
    () => (hasSavedAudiences ? savedAudiences.map(savedActivationAudience) : fallbackAudiences(safeSegments)),
    [hasSavedAudiences, safeSegments, savedAudiences],
  );
  const activeAudience = audiences[0] ?? {
    id: 'empty-audience',
    name: 'Top leakage segments',
    segmentIds: [],
    source: 'fallback' as const,
  };
  const activeSegments = segmentByIds(safeSegments, activeAudience.segmentIds);
  const cardSegments = activeSegments.length > 0 || hasSavedAudiences ? activeSegments : safeSegments.slice(0, 2);
  const cards = playableCards(cardSegments)
    .slice(0, 4)
    .map((card, index) => (
      index === 0
        ? { ...card, play: { ...card.play, offerTerm: GALAXY_REWARDS_TERM } }
        : card
    ));
  const activeAudienceBand = audienceBand(cardSegments);
  const activeRecaptureIndex = averageIndex(cardSegments);

  function pushAudienceCampaign() {
    pushCampaign({
      title: 'Galaxy Rewards export ready',
      description: EXPORT_TOAST,
    });
  }

  return (
    <div className="space-y-6 text-galaxy-cream">
      <section className="rounded-lg border border-galaxy-border bg-[radial-gradient(circle_at_top_left,rgba(205,164,92,0.2),transparent_34%),linear-gradient(135deg,rgba(31,27,24,0.96),rgba(8,18,30,0.92))] px-4 py-7 shadow-2xl shadow-black/25 sm:px-6 md:px-8 md:py-8">
        <Overline>Act</Overline>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h1 className="break-words font-serif text-4xl text-galaxy-cream sm:text-5xl md:text-6xl">Next-Best-Action</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-galaxy-muted md:text-lg">
              Move saved propensity audiences into Galaxy Rewards activation with segment-level rationale, compliant
              CDE sizing, and a suggested campaign channel.
            </p>
          </div>
          <Panel className="bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Galaxy Rewards</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Campaign mechanics can include offer terms while CDE estimates remain indexed or banded.
            </p>
          </Panel>
        </div>
      </section>

      {campaignToast ? (
        <div role="status" className="rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm font-semibold text-galaxy-cream">
          <p>{campaignToast.title}</p>
          <p className="mt-1 text-galaxy-muted">{campaignToast.description}</p>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Panel>
          <Overline>Saved audiences</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">
            {savedAudiences.length > 0 ? 'Saved audiences' : 'Top leakage segments'}
          </h2>
          <div className="mt-5 space-y-3">
            {audiences.map((audience, index) => (
              <div key={audience.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-galaxy-cream">{audience.name}</p>
                  {index === 0 && audience.source === 'saved' ? (
                    <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                      Active audience
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-galaxy-muted">
                  {audience.segmentIds.length} segment{audience.segmentIds.length === 1 ? '' : 's'} ready for activation
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          {cards.length > 0 ? cards.map(({ key, play, segment }) => (
            <NbaCard
              key={key}
              play={play}
              audienceName={activeAudience.name}
              audienceSizeBand={activeAudienceBand}
              recaptureIndex={activeRecaptureIndex || finiteValue(segment.opportunityIndex)}
              onPush={pushAudienceCampaign}
            />
          )) : (
            <Panel>
              <Overline>Next-best-action</Overline>
              <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">No activation plays available.</h2>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">
                Save a propensity audience when CDE segment plays are available.
              </p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
