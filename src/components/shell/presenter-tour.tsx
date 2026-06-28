'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronRight, Presentation, X } from 'lucide-react';

const presenterStops = [
  {
    title: 'Overview',
    route: '/',
    summary: 'Start with the portfolio headline, current-quarter CDE coverage, and the top executive finding.',
  },
  {
    title: 'Segments',
    route: '/segments',
    summary: 'Move into the persona universe to show where wallet leakage and propensity create activation priority.',
  },
  {
    title: 'Guests',
    route: '/guests',
    summary: 'Use the priority lead board and Customer 360 route to connect segment strategy to host action.',
  },
  {
    title: 'Measurement',
    route: '/measurement',
    summary: 'Close with holdout proof, lift over time, and the test-versus-control method before scale-up.',
  },
  {
    title: 'Governance',
    route: '/governance',
    summary: 'Finish by showing the aggregate panel, privacy controls, and assistant audit trail.',
  },
] as const;

const stopCount = presenterStops.length;
const focusableControlSelector =
  'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function getFocusableControls(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableControlSelector));
}

export function PresenterTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const activeStop = presenterStops[activeIndex];

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  function openTour() {
    setActiveIndex(0);
    setIsOpen(true);
  }

  function closeTour() {
    setIsOpen(false);
    window.setTimeout(() => launcherRef.current?.focus(), 0);
  }

  function showNextStop() {
    setActiveIndex((current) => Math.min(current + 1, stopCount - 1));
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeTour();
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

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-[60] flex max-w-full items-end justify-center overflow-x-hidden bg-black/55 p-3 sm:items-center sm:p-5">
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Presenter tour"
            onKeyDown={handleDialogKeyDown}
            className="w-full max-w-lg rounded-lg border border-galaxy-gold/35 bg-galaxy-ink p-5 text-galaxy-cream shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-galaxy-gold">
                  {activeIndex + 1} of {stopCount}
                </p>
                <h2 className="mt-2 font-serif text-3xl leading-tight text-galaxy-cream">{activeStop.title}</h2>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close presenter tour"
                onClick={closeTour}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-galaxy-border text-galaxy-muted transition hover:border-galaxy-gold hover:text-galaxy-gold focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-galaxy-muted">{activeStop.summary}</p>
            <p className="mt-4 rounded-lg border border-galaxy-border bg-galaxy-charcoal/70 px-3 py-2 text-sm font-semibold text-galaxy-gold">
              Route: {activeStop.route}
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeTour}
                className="rounded-md border border-galaxy-border px-4 py-2 text-sm font-semibold text-galaxy-muted transition hover:border-galaxy-gold hover:text-galaxy-gold focus:outline-none focus:ring-2 focus:ring-galaxy-gold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={showNextStop}
                disabled={activeIndex === stopCount - 1}
                className="inline-flex items-center gap-2 rounded-md bg-galaxy-gold px-4 py-2 text-sm font-semibold text-galaxy-ink transition hover:bg-galaxy-gold-lite focus:outline-none focus:ring-2 focus:ring-galaxy-gold focus:ring-offset-2 focus:ring-offset-galaxy-ink disabled:cursor-not-allowed disabled:opacity-55"
              >
                Next stop
                <ChevronRight aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        aria-label="Open presenter tour"
        aria-expanded={isOpen}
        onClick={openTour}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.875rem)] right-[4.25rem] z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-galaxy-border bg-galaxy-charcoal text-galaxy-gold shadow-xl shadow-black/40 transition hover:border-galaxy-gold hover:bg-galaxy-slate focus-visible:ring-2 focus-visible:ring-galaxy-gold focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-ink sm:right-20 lg:bottom-[calc(env(safe-area-inset-bottom)+1rem)] lg:right-[10.25rem] lg:w-auto lg:gap-2 lg:px-4"
      >
        <Presentation aria-hidden="true" className="h-5 w-5" />
        <span className="hidden text-sm font-semibold lg:inline">Tour</span>
      </button>
    </>
  );
}
