import type { ReactNode } from 'react';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-galaxy-ink text-galaxy-cream">
      <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
        <aside className="border-b border-galaxy-border bg-galaxy-charcoal/88 px-5 py-5 lg:border-b-0 lg:border-r">
          <CoBrandLockup />
          <div className="mt-8">
            <Nav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <TopBar />
          <main className="min-w-0 flex-1 px-5 py-6 md:px-8">{children}</main>
          <footer className="border-t border-galaxy-border px-5 py-4 md:px-8">
            <MethodologyNote />
          </footer>
        </div>
      </div>
    </div>
  );
}
