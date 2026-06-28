import { ShieldCheck } from 'lucide-react';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { Methodology } from '@/data';

interface GovernanceSummaryPanelProps {
  methodology: Methodology;
}

const privacyControls = ['PIPL', 'HK PDPO', 'Macau PDPA'] as const;

export function GovernanceSummaryPanel({ methodology }: GovernanceSummaryPanelProps) {
  return (
    <Panel className="border-galaxy-gold/35 bg-galaxy-gold/10">
      <section aria-label="Data governance" className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionHeader
            eyebrow="Governed CDE layer"
            title="Data governance"
            description={(
              <>
                Mastercard CDE signals are modelled, aggregated, and exposed as indexed decision fields for Galaxy
                planning workflows.
              </>
            )}
          />
          <span className="inline-flex items-center gap-2 rounded-full border border-galaxy-gold/45 bg-galaxy-ink/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Governed
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Coverage</p>
            <p className="mt-2 text-2xl font-semibold text-galaxy-gold">{methodology.matchedCoveragePct}% matched</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Match rate is refreshed {methodology.refresh} and reported at aggregate cohort level.
            </p>
          </article>

          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Panel basis</p>
            <p className="mt-2 text-2xl font-semibold text-galaxy-gold">{methodology.panelSharePct} panel</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              The method uses {methodology.basis} cohorts across {methodology.dataYears.join(' and ')}.
            </p>
          </article>

          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-muted">Privacy guardrails</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {privacyControls.map((control) => (
                <span
                  key={control}
                  className="rounded-full border border-galaxy-border bg-galaxy-charcoal/80 px-3 py-1.5 text-sm font-semibold text-galaxy-cream"
                >
                  {control}
                </span>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{methodology.lensBNote}.</p>
          </article>
        </div>
      </section>
    </Panel>
  );
}
