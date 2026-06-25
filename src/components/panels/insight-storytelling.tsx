import Link from 'next/link';
import { CdeChip } from '@/components/ui/cde-chip';
import { Overline } from '@/components/ui/overline';
import { Panel } from '@/components/ui/panel';
import type { FusionStep, InsightFinding, InsightNarrative } from '@/lib/insights';

function severityLabel(severity: InsightFinding['severity']) {
  if (severity === 'critical') return 'Priority';
  if (severity === 'watch') return 'Watch';
  return 'Momentum';
}

function EvidenceChips({ evidence }: { evidence: InsightFinding['evidence'] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {evidence.map((item) => (
        <span
          key={`${item.label}-${item.value}`}
          className="inline-flex items-center gap-2 rounded border border-galaxy-border bg-galaxy-ink/45 px-2 py-1 text-xs font-semibold text-galaxy-muted"
        >
          <span className="text-galaxy-gold">{item.label}</span>
          <span className="text-galaxy-cream">{item.value}</span>
          <CdeChip />
        </span>
      ))}
    </div>
  );
}

export function ExecutiveSummaryPanel({ narrative }: { narrative: InsightNarrative }) {
  return (
    <Panel className="border-galaxy-gold/35 bg-[linear-gradient(135deg,rgba(205,164,92,0.14),rgba(12,23,35,0.76))]">
      <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <div>
          <Overline>{narrative.eyebrow}</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{narrative.title}</h2>
        </div>
        <p className="text-base leading-8 text-galaxy-muted">{narrative.summary}</p>
      </div>
    </Panel>
  );
}

export function HeadlineFindings({
  title,
  findings,
  emptyMessage = 'No active CDE segment insights available for this quarter.',
}: {
  title: string;
  findings: InsightFinding[];
  emptyMessage?: string;
}) {
  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Overline>Ranked findings</Overline>
          <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">{title}</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-galaxy-muted">
          Ranked findings translate the joined Galaxy and Mastercard CDE view into the next dashboard action.
        </p>
      </div>
      {findings.length > 0 ? (
        <div className="grid gap-4">
          {findings.map((finding, index) => (
            <Link
              key={finding.id}
              href={finding.href}
              className="block rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 transition hover:border-galaxy-gold/70 hover:bg-galaxy-gold/10 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
                    Finding {index + 1} · {severityLabel(finding.severity)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-galaxy-gold">{finding.segmentName}</p>
                  <h3 className="mt-2 text-lg font-semibold text-galaxy-cream">{finding.title}</h3>
                </div>
                <span className="rounded border border-galaxy-gold/35 bg-galaxy-gold/10 px-2 py-1 text-xs font-semibold text-galaxy-gold">
                  Rank {index + 1}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-galaxy-muted">{finding.summary}</p>
              <EvidenceChips evidence={finding.evidence} />
              <p className="mt-4 text-sm font-semibold text-galaxy-gold">{finding.action}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4 text-sm leading-6 text-galaxy-muted">
          {emptyMessage}
        </p>
      )}
    </Panel>
  );
}

export function EvidenceStrip({ steps }: { steps: FusionStep[] }) {
  return (
    <Panel>
      <div className="mb-5">
        <Overline>Galaxy + Mastercard data fusion</Overline>
        <h2 className="mt-3 font-serif text-3xl text-galaxy-cream">Insight engine</h2>
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">{step.label}</p>
            <h3 className="mt-3 text-lg font-semibold text-galaxy-cream">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">{step.description}</p>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-galaxy-cream">
              <span>{step.value}</span>
              <CdeChip />
            </p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ChartCallout({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-4 text-sm leading-6 text-galaxy-muted">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">Insight callout</p>
      <p className="mt-2">{children}</p>
    </div>
  );
}
