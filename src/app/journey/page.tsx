import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { corridors, latestSegments } from '@/data';
import { buildCrossLensJourney } from '@/lib/journey';

export default function JourneyPage() {
  const journey = buildCrossLensJourney({ corridors, segments: latestSegments });

  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Cross-lens journey"
        title="Acquire, Convert, Grow"
        description={journey.headline}
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">Decision loop</p>
            <p className="mt-2">
              Corridor, segment, leakage, activation, and measurement signals stay connected through CDE readouts.
            </p>
          </>
        )}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        {journey.stages.map((stage, index) => (
          <Link
            key={stage.key}
            href={stage.href}
            aria-label={`${stage.title} stage: ${stage.description}`}
            className="group flex min-h-64 flex-col rounded-lg border border-galaxy-border bg-galaxy-charcoal/78 p-5 transition hover:border-galaxy-gold/70 hover:bg-galaxy-slate/80 focus:outline-none focus:ring-2 focus:ring-galaxy-gold focus:ring-offset-2 focus:ring-offset-galaxy-charcoal"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted group-hover:text-galaxy-gold">
                Open lens
              </span>
            </div>
            <h2 className="mt-5 font-serif text-3xl text-galaxy-cream">{stage.title}</h2>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">
              {stage.metricLabel}
            </p>
            <p className="mt-2 text-2xl font-semibold text-galaxy-gold">{stage.metricValue}</p>
            <p className="mt-4 text-sm leading-6 text-galaxy-muted">{stage.description}</p>
            {stage.secondaryCopy ? (
              <p className="mt-auto pt-5 text-xs leading-5 text-galaxy-muted">{stage.secondaryCopy}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
