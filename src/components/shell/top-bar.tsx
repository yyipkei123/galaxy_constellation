'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PresenterModeToggle } from '@/components/presentation/presenter-mode-toggle';
import { redesignNavItems, type RedesignPageId } from '@/components/redesign/constellation-redesign-model';
import { useAppState } from '@/store/app-store';
import { BrandPartnershipBadge } from './brand-partnership-badge';
import { CdeSignalGuide } from './cde-signal-guide';
import { LensSwitch } from './lens-switch';

const prototypePageTitles: Record<RedesignPageId, string> = {
  overview: 'Wallet intelligence cockpit',
  journey: 'Guest journey',
  wallet: 'Wallet split',
  segments: 'Segment rankings',
  guests: 'Matched guests',
  leakage: 'Wallet leakage',
  propensity: 'Propensity & audiences',
  activation: 'Campaign activation',
  simulate: 'Scenario simulator',
  measurement: 'Campaign measurement',
  marketscan: 'Market scan',
  governance: 'Governance & CDE rules',
};

function titleForPathname(pathname: string) {
  if (pathname.startsWith('/corridors')) return 'Source-market corridors';
  if (pathname.startsWith('/acquisition')) return 'Priority corridor acquisition';

  const navItem = redesignNavItems.find((item) => (
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  ));

  return navItem ? prototypePageTitles[navItem.pageId] : prototypePageTitles.overview;
}

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
  const pathname = usePathname();
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
  const pageTitle = titleForPathname(pathname);

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
    <header className="flex min-h-[52px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <h1 className="m-0 min-w-0 text-[17px] font-semibold leading-tight text-galaxy-cream md:text-[19px]">
          {pageTitle}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-label={`${methodology.activeMetricCount} active CDE metrics - Modelled`}
            className="inline-flex min-h-8 items-center rounded-full border border-galaxy-gold/30 bg-galaxy-gold/10 px-3 text-[11px] font-bold tracking-[0.04em] text-galaxy-gold"
          >
            {methodology.activeMetricCount} CDE metrics - Modelled
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
          className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-galaxy-gold/20 bg-white/[0.02] p-1"
        >
          {quarters.map((quarter) => {
            const selected = quarter.id === selectedQuarterId;

            return (
              <button
                key={quarter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedQuarterId(quarter.id)}
                className="min-h-8 shrink-0 rounded-full border border-transparent px-3 text-[11.5px] font-bold tracking-[0.03em] text-[#8B8598] transition hover:text-galaxy-cream aria-pressed:bg-galaxy-gold aria-pressed:text-[#14101F]"
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
