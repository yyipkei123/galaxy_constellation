import type { ReactNode } from 'react';
import { PresentationFloatingControls } from '@/components/presentation/presentation-floating-controls';
import { StoryActionStrip } from '@/components/presentation/story-action-strip';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { CurrentRefreshCard } from './current-refresh-card';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-[1] min-h-screen text-galaxy-cream">
      <div className="mx-auto grid min-h-screen w-full max-w-[1680px] min-w-0 border-x border-white/10 bg-galaxy-ink/30 backdrop-blur-[6px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          data-testid="app-shell-side-rail"
          className="min-w-0 border-b border-white/10 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r"
        >
          <div className="galaxy-glass-panel min-h-full min-w-0 px-[18px] py-[18px] lg:h-full lg:px-[22px] lg:py-7">
            <CoBrandLockup />
            <div className="mt-[18px] min-w-0 lg:mt-9">
              <Nav />
            </div>
            <div className="hidden lg:block">
              <CurrentRefreshCard />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
          <div className="min-w-0 px-3 pt-3 sm:px-5 md:px-[26px] md:pt-[26px]">
            <TopBar />
          </div>
          <main className="min-w-0 flex-1 px-3 py-[18px] sm:px-5 md:px-[26px]">
            <div className="flex flex-col gap-[18px]">
              <div className="order-2 md:order-1">
                <StoryActionStrip />
              </div>
              <div className="order-1 md:order-2">
                {children}
              </div>
            </div>
          </main>
          <footer className="border-t border-white/10 px-5 py-4 md:px-[26px]">
            <MethodologyNote />
          </footer>
        </div>
      </div>
      <PresentationFloatingControls />
    </div>
  );
}
