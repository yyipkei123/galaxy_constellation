import type { AcquisitionDraft } from '@/data';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';

export function ContentDraftCard({ draft }: { draft: AcquisitionDraft }) {
  return (
    <Panel>
      <SectionHeader
        eyebrow="Deterministic template"
        title="Content draft"
        description="No live model call. This client-side draft is generated from corridor and persona data only."
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {draft.languages.map((language) => (
          <span
            key={language}
            className="rounded border border-galaxy-border bg-galaxy-ink/40 px-2 py-1 text-xs font-semibold text-galaxy-gold"
          >
            {language}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {draft.variants.map((variant) => (
          <article key={variant.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Variant {variant.id}</p>
            <h3 className="mt-3 font-sans text-lg font-semibold text-galaxy-cream">{variant.subject}</h3>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{variant.body}</p>
            <p className="mt-4 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3 text-sm font-semibold leading-6 text-galaxy-cream">
              {variant.kvCaption}
            </p>
          </article>
        ))}
      </div>
      <ol className="mt-5 flex flex-wrap gap-2 text-xs text-galaxy-muted">
        {draft.versionHistory.map((item) => (
          <li key={item} className="rounded border border-galaxy-border px-2 py-1">
            {item}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
