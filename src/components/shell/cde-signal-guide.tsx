'use client';

import { HelpCircle, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { indexSignalBands } from '@/components/ui/formatted-values';

const focusableControlSelector =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function getFocusableControls(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableControlSelector));
}

export function CdeSignalGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [canPortal, setCanPortal] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCanPortal(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canPortal) {
      closeButtonRef.current?.focus();
    }
  }, [canPortal, isOpen]);

  function restoreLauncherFocus() {
    const focusLauncher = () => launcherRef.current?.focus();

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(focusLauncher);
      return;
    }

    window.setTimeout(focusLauncher, 0);
  }

  function closeGuide() {
    setIsOpen(false);
    restoreLauncherFocus();
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeGuide();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableControls = getFocusableControls(event.currentTarget);

    if (focusableControls.length === 0) {
      event.preventDefault();
      return;
    }

    const currentIndex = focusableControls.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex;

    if (event.shiftKey) {
      nextIndex = currentIndex <= 0 ? focusableControls.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex === -1 || currentIndex === focusableControls.length - 1 ? 0 : currentIndex + 1;
    }

    event.preventDefault();
    focusableControls[nextIndex]?.focus();
  }

  const guideDialog = (
    <div className="fixed inset-0 z-[70] flex min-h-dvh items-center justify-center overflow-y-auto bg-black/72 p-4 backdrop-blur-sm sm:p-6">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="CDE signal guide"
        onKeyDown={handleDialogKeyDown}
        className="galaxy-panel w-full max-w-xl p-5 shadow-2xl shadow-black/60 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-galaxy-gold">
              Mastercard CDE
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-galaxy-cream">CDE signal guide</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close CDE signal guide"
            onClick={closeGuide}
            className="rounded-[9px] border border-galaxy-gold/25 bg-white/[0.03] p-2 text-galaxy-muted transition hover:border-galaxy-gold/60 hover:text-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-6 text-galaxy-muted">
          <p>
            CDE index signal is a relative Mastercard Card Data Enrichment signal used to compare modelled demand,
            opportunity, or wallet intensity across matched cohorts.
          </p>
          <ul className="grid gap-2">
            <li>
              <span className="font-semibold text-galaxy-cream">
                100 = matched Galaxy x Mastercard cohort baseline.
              </span>
            </li>
            <li>Above 100 = stronger demand or opportunity than baseline.</li>
            <li>Below 100 = weaker than baseline.</li>
            <li>Not customer count, spend amount, match rate, or exact wallet value.</li>
          </ul>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {indexSignalBands.map((band) => (
            <div key={band.range} className={`rounded-[10px] border px-3 py-2 ${band.className}`}>
              <p className="text-sm font-semibold">{band.range}</p>
              <p className="mt-1 text-xs font-semibold">{band.label}</p>
              <p className="mt-1 text-xs opacity-80">{band.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-label="Open CDE signal guide"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] px-2.5 py-1 text-xs font-semibold text-galaxy-muted transition hover:border-galaxy-gold/50 hover:text-galaxy-cream focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
      >
        <HelpCircle aria-hidden="true" className="h-3.5 w-3.5 text-galaxy-gold" />
        <span>CDE Guide</span>
      </button>

      {isOpen && canPortal ? createPortal(guideDialog, document.body) : null}
    </>
  );
}
