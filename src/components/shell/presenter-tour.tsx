'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronRight, Presentation, X } from 'lucide-react';
import { mainPresenterTourStops } from '@/lib/presentation-story';

const presenterStops = mainPresenterTourStops.map((step) => ({
  title: step.title,
  route: step.href,
  summary: step.tourSummary,
}));

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
            className="galaxy-panel w-full max-w-lg p-5 text-galaxy-cream"
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
            <p className="galaxy-tile mt-4 px-3 py-2 text-sm font-semibold text-galaxy-gold">
              Route: {activeStop.route}
            </p>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeTour}
                className="galaxy-cta-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={showNextStop}
                disabled={activeIndex === stopCount - 1}
                className="galaxy-cta-primary disabled:cursor-not-allowed disabled:opacity-55"
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
        className="galaxy-cta-secondary fixed bottom-[calc(env(safe-area-inset-bottom)_+_0.875rem)] right-[4.25rem] z-50 h-11 w-11 px-0 shadow-xl shadow-black/40 sm:right-20 lg:bottom-[calc(env(safe-area-inset-bottom)_+_1rem)] lg:right-[10.25rem] lg:w-auto lg:px-4"
      >
        <Presentation aria-hidden="true" className="h-5 w-5" />
        <span className="hidden text-sm font-semibold lg:inline">Tour</span>
      </button>
    </>
  );
}
