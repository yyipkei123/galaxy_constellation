'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { PresenterModeToggle } from '@/components/presentation/presenter-mode-toggle';
import { hasCompactCdeAiDock } from '@/components/presentation/presentation-floating-controls';
import { getRedesignPageTitle, redesignNavItems } from '@/components/redesign/constellation-redesign-model';
import { useAppState } from '@/store/app-store';
import { BrandPartnershipBadge } from './brand-partnership-badge';
import { CdeSignalGuide } from './cde-signal-guide';
import { LensSwitch } from './lens-switch';

function titleForPathname(pathname: string) {
  if (pathname.startsWith('/corridors')) return 'Source-market corridors';
  if (pathname.startsWith('/acquisition')) return 'Priority corridor acquisition';

  const navItem = redesignNavItems.find((item) => (
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  ));

  return getRedesignPageTitle(navItem?.pageId ?? 'overview');
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
  const usePrototypeChrome = hasCompactCdeAiDock(pathname);

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

  if (usePrototypeChrome) {
    return (
      <header className="flex min-h-[52px] flex-col gap-3 md:flex-row md:items-center">
        <p className="m-0 min-w-0 flex-1 font-serif text-2xl font-semibold leading-tight tracking-[0.02em] text-galaxy-cream">
          {pageTitle}
        </p>
        <div
          role="group"
          aria-label="Quarter selector"
          className="flex max-w-full gap-1 overflow-x-auto rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] p-1"
        >
          {quarters.map((quarter) => {
            const selected = quarter.id === selectedQuarterId;

            return (
              <button
                key={quarter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedQuarterId(quarter.id)}
                className="min-h-8 shrink-0 rounded-[7px] border border-transparent px-3 text-[11.5px] font-bold tracking-[0.03em] text-[#8B8598] transition hover:text-galaxy-cream aria-pressed:bg-galaxy-gold aria-pressed:text-[#14101F]"
              >
                {quarter.label}
              </button>
            );
          })}
        </div>
        <span
          aria-label={`${methodology.activeMetricCount} active CDE metrics - Modelled`}
          className="inline-flex min-h-8 items-center rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] px-3 text-[11px] font-bold tracking-[0.04em] text-galaxy-gold"
        >
          {methodology.activeMetricCount} CDE metrics - Modelled
        </span>
      </header>
    );
  }

  return (
    <header className="flex min-h-[52px] flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <p className="m-0 min-w-0 text-[17px] font-semibold leading-tight text-galaxy-cream md:text-[19px]">
          {pageTitle}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-label={`${methodology.activeMetricCount} active CDE metrics - Modelled`}
            className="inline-flex min-h-8 items-center rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] px-3 text-[11px] font-bold tracking-[0.04em] text-galaxy-gold"
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
          className="flex max-w-full gap-1 overflow-x-auto rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] p-1"
        >
          {quarters.map((quarter) => {
            const selected = quarter.id === selectedQuarterId;

            return (
              <button
                key={quarter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedQuarterId(quarter.id)}
                className="min-h-8 shrink-0 rounded-[7px] border border-transparent px-3 text-[11.5px] font-bold tracking-[0.03em] text-[#8B8598] transition hover:text-galaxy-cream aria-pressed:bg-galaxy-gold aria-pressed:text-[#14101F]"
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
          className="galaxy-cta-ghost"
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
