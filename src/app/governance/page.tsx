import { GovernanceSummaryPanel } from '@/components/panels/governance-summary-panel';
import { PageHeader } from '@/components/ui/page-header';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import { methodology } from '@/data';

export default function GovernancePage() {
  return (
    <div className="space-y-6 text-galaxy-cream">
      <PageHeader
        variant="compact"
        eyebrow="Decision intelligence controls"
        title="Data Governance"
        description="Show how the demo keeps Mastercard CDE enrichment modelled, auditable, and safe for presenter-led decisions."
        aside={(
          <>
            <p className="font-semibold text-galaxy-gold">Governed inputs</p>
            <p className="mt-2">{methodology.panelSharePct} aggregate panel, {methodology.matchedCoveragePct}% matched.</p>
          </>
        )}
      />

      <GovernanceSummaryPanel methodology={methodology} />

      <Panel>
        <SectionHeader
          eyebrow="Assistant controls"
          title="Assistant grounding"
          description={(
            <>
              Ask CDE AI is grounded in the governed semantic layer. Every answer can expose an audit expander with
              a Source field and Route field, so presenters can trace which route and source backed the response.
            </>
          )}
        />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Evidence drawer</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Response cards reveal governed facts only after the presenter opens the evidence drawer.
            </p>
          </article>
          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Semantic source</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Fact rows name the semantic source used for the displayed indexed metric.
            </p>
          </article>
          <article className="rounded-lg border border-galaxy-border bg-galaxy-ink/45 p-4">
            <p className="text-sm font-semibold text-galaxy-gold">Route trace</p>
            <p className="mt-2 text-sm leading-6 text-galaxy-muted">
              Each cited fact points back to the route where the same governed signal is visible.
            </p>
          </article>
        </div>
      </Panel>
    </div>
  );
}
