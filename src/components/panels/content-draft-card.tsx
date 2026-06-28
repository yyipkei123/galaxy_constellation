'use client';

import { useState } from 'react';
import { Panel } from '@/components/ui/panel';
import { SectionHeader } from '@/components/ui/section-header';
import type { CampaignCreativeLanguage } from '@/data';
import type { MeasurementReadyAcquisitionDraft } from '@/lib/acquisition-content';

interface ContentDraftCardProps {
  draft: MeasurementReadyAcquisitionDraft;
  onLaunch?: () => void;
}

function tabId(index: number) {
  return `content-draft-tab-${index}`;
}

function panelId(index: number) {
  return `content-draft-panel-${index}`;
}

export function ContentDraftCard({ draft, onLaunch }: ContentDraftCardProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<CampaignCreativeLanguage>(draft.languages[0] ?? 'EN');
  const activeLanguage = draft.languages.includes(selectedLanguage) ? selectedLanguage : draft.languages[0] ?? 'EN';
  const activeLanguageIndex = Math.max(draft.languages.indexOf(activeLanguage), 0);
  const selectedVariants = draft.variants.filter((variant) => variant.language === activeLanguage);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Deterministic template"
          title="Content draft"
          description="No live model call. This client-side draft is generated from corridor and persona data only."
        />
        {onLaunch ? (
          <button
            type="button"
            onClick={onLaunch}
            className="h-10 rounded-md bg-galaxy-gold px-4 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold/90 focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
          >
            Launch campaign
          </button>
        ) : null}
      </div>

      <div role="tablist" aria-label="Draft language" className="mt-4 flex flex-wrap gap-2">
        {draft.languages.map((language, index) => (
          <button
            key={language}
            id={tabId(index)}
            type="button"
            role="tab"
            aria-selected={activeLanguage === language}
            aria-controls={panelId(index)}
            onClick={() => setSelectedLanguage(language)}
            className={
              activeLanguage === language
                ? 'rounded border border-galaxy-gold bg-galaxy-gold px-3 py-1.5 text-xs font-semibold text-galaxy-ink'
                : 'rounded border border-galaxy-border bg-galaxy-ink/40 px-3 py-1.5 text-xs font-semibold text-galaxy-gold transition hover:border-galaxy-gold/60 focus:outline-none focus:ring-2 focus:ring-galaxy-gold'
            }
          >
            {language}
          </button>
        ))}
      </div>

      <div
        id={panelId(activeLanguageIndex)}
        role="tabpanel"
        aria-labelledby={tabId(activeLanguageIndex)}
        className="mt-5 grid gap-4 lg:grid-cols-2"
      >
        {selectedVariants.map((variant) => (
          <article key={variant.id} className="rounded-lg border border-galaxy-border bg-galaxy-ink/35 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Variant {variant.id}</p>
            <h3 className="mt-3 font-sans text-lg font-semibold text-galaxy-cream">{variant.subject}</h3>
            <p className="mt-3 text-sm leading-6 text-galaxy-muted">{variant.body}</p>
            <div className="mt-4 rounded-lg border border-galaxy-gold/30 bg-galaxy-gold/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">Guardrail</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-galaxy-cream">{variant.guardrail}</p>
            </div>
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
