'use client';

import { Presentation } from 'lucide-react';
import { useAppState } from '@/store/app-store';

export function PresenterModeToggle() {
  const { isPresenterMode, togglePresenterMode } = useAppState();

  return (
    <button
      type="button"
      aria-label="Presenter mode"
      aria-pressed={isPresenterMode}
      onClick={togglePresenterMode}
      className="galaxy-cta-ghost aria-pressed:border-galaxy-gold/50 aria-pressed:bg-galaxy-gold/15 aria-pressed:text-galaxy-gold"
    >
      <Presentation aria-hidden="true" className="h-4 w-4" />
      <span>Presenter</span>
    </button>
  );
}
