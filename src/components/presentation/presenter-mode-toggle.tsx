'use client';

import { Presentation } from 'lucide-react';
import { useAppState } from '@/store/app-store';

export function PresenterModeToggle() {
  const { isPresenterMode, togglePresenterMode } = useAppState();

  return (
    <button
      type="button"
      aria-label={isPresenterMode ? 'Turn presenter mode off' : 'Turn presenter mode on'}
      aria-pressed={isPresenterMode}
      onClick={togglePresenterMode}
      className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-galaxy-ink/45 px-3 text-[13px] font-semibold tracking-normal text-galaxy-cream transition hover:border-galaxy-gold/40 hover:text-galaxy-gold active:translate-y-px aria-pressed:border-galaxy-gold/50 aria-pressed:bg-galaxy-gold/15 aria-pressed:text-galaxy-gold"
    >
      <Presentation aria-hidden="true" className="h-4 w-4" />
      <span>Presenter</span>
    </button>
  );
}
