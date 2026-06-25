import Link from 'next/link';
import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { SegmentPersona } from '@/data';

export function PersonaDetailKit({ persona }: { persona: SegmentPersona }) {
  const primaryRecommendation = persona.recommendations[0];

  return (
    <Panel className="space-y-6 border-galaxy-gold/30 bg-[linear-gradient(135deg,rgba(205,164,92,0.12),rgba(12,23,35,0.78))]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="sr-only">Persona recommendation kit</h2>
          <Overline>Persona recommendation kit</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{persona.name}</h2>
          <p className="mt-2 text-sm font-semibold text-galaxy-muted">
            {persona.nameZh} · {persona.ageBand} · {persona.travelMode}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-muted">Audience</p>
            <p className="mt-2 text-xl font-semibold text-galaxy-gold">~{persona.audienceK}k matched guests</p>
          </div>
          <div className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-muted">Readiness</p>
            <p className="mt-2 text-xl font-semibold text-galaxy-gold">Readiness {persona.readinessScore}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            Galaxy first-party signal
          </p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.galaxyKnownSignal}</p>
        </article>
        <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
              Mastercard CDE reveal
            </p>
            <CdeChip />
          </div>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{persona.mastercardCdeReveal}</p>
          <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-galaxy-cream">
            <span>{persona.crossPropertyCashBand}</span>
            <CdeChip />
          </p>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h3 className="text-lg font-semibold text-galaxy-cream">Selling points for follow-up</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-muted">
              Host script
            </span>
          </div>
          <div className="grid gap-3">
            {persona.sellingPoints.map((point, index) => (
              <article key={point} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                  Point {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-galaxy-muted">{point}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
          <h3 className="text-lg font-semibold text-galaxy-cream">Recommended products</h3>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-galaxy-muted">
            {persona.recommendedProducts.map((product) => (
              <li key={product} className="rounded border border-galaxy-border bg-galaxy-charcoal/60 px-3 py-2">
                {product}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {primaryRecommendation ? (
        <section className="rounded-lg border border-galaxy-gold/35 bg-galaxy-gold/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
            {primaryRecommendation.channel} action
          </p>
          <h3 className="mt-3 font-serif text-2xl text-galaxy-cream">{primaryRecommendation.title}</h3>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{primaryRecommendation.action}</p>
          <p className="mt-3 text-sm leading-6 text-galaxy-muted">{primaryRecommendation.rationale}</p>
          <Link
            href="/activation"
            className="mt-5 inline-flex rounded border border-galaxy-gold/60 bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
          >
            Build activation audience
          </Link>
        </section>
      ) : null}
    </Panel>
  );
}
