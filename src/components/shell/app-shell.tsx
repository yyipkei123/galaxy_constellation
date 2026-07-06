'use client';

import type { ReactNode } from 'react';
import { hasCompactCdeAiDock, PresentationFloatingControls } from '@/components/presentation/presentation-floating-controls';
import { StoryActionStrip } from '@/components/presentation/story-action-strip';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { usePathname } from 'next/navigation';
import { CoBrandLockup } from './co-brand-lockup';
import { CurrentRefreshCard } from './current-refresh-card';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const usePrototypeChrome = hasCompactCdeAiDock(pathname);

  return (
    <div className="relative z-[1] min-h-[100dvh] text-galaxy-cream">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1680px] min-w-0 flex-col lg:flex-row">
        <aside
          data-testid="app-shell-side-rail"
          className="min-w-0 border-b border-[rgba(212,175,94,0.14)] bg-[#0A0812]/60 lg:sticky lg:top-0 lg:h-screen lg:w-[236px] lg:shrink-0 lg:border-b-0 lg:border-r"
        >
          <div className="flex min-h-full min-w-0 flex-col px-[14px] py-5 lg:h-full lg:pb-4">
            <CoBrandLockup />
            <div className="mt-[18px] min-w-0 lg:mt-7">
              <Nav />
            </div>
            <div className="hidden lg:mt-auto lg:block">
              <CurrentRefreshCard />
            </div>
          </div>
        </aside>

        <div className={usePrototypeChrome ? 'flex min-w-0 flex-1 flex-col pb-0' : 'flex min-w-0 flex-1 flex-col pb-24 lg:pb-0'}>
          <div className="min-w-0 border-b border-[rgba(212,175,94,0.12)] bg-[#0A0812]/50 px-3 py-3 sm:px-5 md:px-7">
            <TopBar />
          </div>
          <main
            className={
              usePrototypeChrome
                ? 'min-w-0 flex-1 overflow-y-auto px-3 py-[26px] pb-[120px] md:px-[28px]'
                : 'min-w-0 flex-1 px-3 py-[18px] sm:px-5 md:px-[26px]'
            }
          >
            {usePrototypeChrome ? (
              children
            ) : (
              <div className="flex flex-col gap-[18px]">
                <div className="order-2 md:order-1">
                  <StoryActionStrip />
                </div>
                <div className="order-1 md:order-2">
                  {children}
                </div>
              </div>
            )}
          </main>
          {usePrototypeChrome ? null : (
            <footer className="border-t border-white/10 px-5 py-4 md:px-[26px]">
              <MethodologyNote />
            </footer>
          )}
        </div>
      </div>
      <PresentationFloatingControls />
    </div>
  );
}
