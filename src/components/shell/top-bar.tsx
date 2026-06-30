'use client';

import { useState } from 'react';
import { PresenterModeToggle } from '@/components/presentation/presenter-mode-toggle';
import { useAppState } from '@/store/app-store';
import { BrandPartnershipBadge } from './brand-partnership-badge';
import { CdeSignalGuide } from './cde-signal-guide';
import { LensSwitch } from './lens-switch';

function segmentNarrative(
  quarterLabel: string,
  segmentName: string,
  opportunityIndex: number,
  leakagePct: number,
  cashBand: string,
) {
  return `Galaxy Constellation combines Galaxy first-party behavior with Mastercard CDE to rank wallet headroom by segment. For ${quarterLabel}, ${segmentName} leads the current briefing with Index ${Math.round(opportunityIndex)} opportunity headroom, ${Math.round(leakagePct)}% leakage, and ${cashBand} cross-property cash.`;
}

async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to the legacy textarea path below.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';

  try {
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

export function TopBar() {
  const {
    methodology,
    quarters,
    selectedQuarter,
    selectedQuarterId,
    selectedSegment,
    setSelectedQuarterId,
  } = useAppState();
  const [copyStatus, setCopyStatus] = useState('');
  const primaryLeakagePct = selectedSegment.categories.retailLuxury.leakagePct;

  async function copyNarrative() {
    const narrative = segmentNarrative(
      selectedQuarter.label,
      selectedSegment.name,
      selectedSegment.opportunityIndex,
      primaryLeakagePct,
      selectedSegment.crossPropertyCashBand,
    );

    const copied = await copyText(narrative);
    setCopyStatus(copied ? 'Narrative copied' : 'Copy unavailable in this preview');
  }

  return (
    <header className="galaxy-glass-panel flex min-h-16 flex-col gap-4 rounded-[18px] border border-white/10 px-[18px] py-3.5 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold leading-tight text-galaxy-cream">
          Executive wallet intelligence cockpit
        </p>
        <p className="mt-1 max-w-[62ch] text-[13px] leading-5 text-galaxy-muted">
          Turn Galaxy behavioral signals plus Mastercard CDE into a ranked marketing action plan for each quarter.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span
            aria-label={`${methodology.activeMetricCount} active CDE metrics`}
            className="rounded border border-galaxy-gold/40 bg-galaxy-gold/10 px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-galaxy-gold"
          >
            {methodology.activeMetricCount} CDE metrics
          </span>
          <span className="text-sm font-medium text-galaxy-cream">
            Coverage {methodology.matchedCoveragePct}%
          </span>
          <BrandPartnershipBadge />
          <CdeSignalGuide />
          <LensSwitch />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <div
          role="group"
          aria-label="Quarter selector"
          className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] border border-white/10 bg-galaxy-ink/50 p-1"
        >
          {quarters.map((quarter) => {
            const selected = quarter.id === selectedQuarterId;

            return (
              <button
                key={quarter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedQuarterId(quarter.id)}
                className="min-h-[34px] shrink-0 rounded-xl border border-transparent px-3 text-xs font-semibold tracking-normal text-galaxy-muted transition hover:border-galaxy-gold/40 hover:text-galaxy-cream aria-pressed:border-galaxy-gold/40 aria-pressed:bg-galaxy-gold/10 aria-pressed:text-galaxy-cream"
              >
                {quarter.label}
              </button>
            );
          })}
        </div>
        <PresenterModeToggle />
        <button
          type="button"
          onClick={copyNarrative}
          className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-galaxy-ink/45 px-4 text-[13px] font-semibold tracking-normal text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px"
        >
          Copy narrative
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copyStatus}
        </span>
      </div>
    </header>
  );
}
