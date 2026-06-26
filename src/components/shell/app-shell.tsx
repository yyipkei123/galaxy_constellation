import type { ReactNode } from 'react';
import { ChatAssistantLauncher } from '@/components/assistant/chat-assistant-launcher';
import { MethodologyNote } from '@/components/ui/methodology-note';
import { CoBrandLockup } from './co-brand-lockup';
import { Nav } from './nav';
import { TopBar } from './top-bar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-galaxy-ink text-galaxy-cream">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[17rem_1fr]">
        <aside className="min-w-0 border-b border-galaxy-border bg-galaxy-charcoal/88 px-4 py-4 sm:px-5 lg:border-b-0 lg:border-r lg:py-5">
          <CoBrandLockup />
          <div className="mt-4 min-w-0 lg:mt-8">
            <Nav />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
          <TopBar />
          <main className="min-w-0 flex-1 px-4 py-5 sm:px-5 md:px-8 md:py-6">{children}</main>
          <footer className="border-t border-galaxy-border px-5 py-4 md:px-8">
            <MethodologyNote />
          </footer>
        </div>
      </div>
      <ChatAssistantLauncher />
    </div>
  );
}
