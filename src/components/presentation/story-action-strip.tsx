'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { resolvePresentationStep } from '@/lib/presentation-story';
import { useAppState } from '@/store/app-store';

export function StoryActionStrip() {
  const pathname = usePathname();
  const step = resolvePresentationStep(pathname ?? '/');
  const {
    isPresenterMode,
    selectedQuarter,
    selectedSegment,
  } = useAppState();

  return (
    <section
      aria-label="Client presentation guidance"
      data-presenter-mode={isPresenterMode ? 'on' : 'off'}
      className="rounded-[16px] border border-galaxy-gold/25 bg-galaxy-charcoal/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:px-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="min-w-0 lg:max-w-[17rem]">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-galaxy-gold">
            {step.presentationRole}
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-tight text-galaxy-cream">
            {step.title}
          </h2>
          <p className="mt-2 text-xs leading-5 text-galaxy-muted">
            {selectedQuarter.label} · {selectedSegment.name}
          </p>
        </div>

        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-white/10 bg-galaxy-ink/35 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
              Observation
            </h3>
            <p className="mt-2 text-sm leading-6 text-galaxy-cream">
              {step.observation}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-white/10 bg-galaxy-ink/35 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-galaxy-muted">
              Recommended action
            </h3>
            <p className="mt-2 text-sm leading-6 text-galaxy-cream">
              {step.recommendedAction}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center lg:justify-end">
          <Link
            href={step.nextHref}
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-galaxy-gold/35 bg-galaxy-gold/12 px-3 text-[13px] font-semibold tracking-normal text-galaxy-gold transition hover:border-galaxy-gold hover:bg-galaxy-gold/18 active:translate-y-px"
          >
            {step.nextLabel}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
