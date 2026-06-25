'use client';

import { useMemo, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { personaRecords } from '@/data';
import { useAppState } from '@/store/app-store';
import { CHAT_ASSISTANT_DIALOG_ID, ChatAssistantPanel } from './chat-assistant-panel';

export function ChatAssistantLauncher() {
  const { methodology, segments, selectedSegment } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const context = useMemo(() => ({
    methodology,
    personas: personaRecords,
    segments,
    selectedSegment,
  }), [methodology, segments, selectedSegment]);
  const launcherLabel = isOpen ? 'Close AI insight assistant' : 'Open AI insight assistant';

  return (
    <>
      {isOpen ? <ChatAssistantPanel context={context} onClose={() => setIsOpen(false)} /> : null}

      <button
        type="button"
        aria-label={launcherLabel}
        aria-controls={CHAT_ASSISTANT_DIALOG_ID}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink shadow-xl shadow-black/40 transition hover:bg-galaxy-gold-lite focus-visible:ring-2 focus-visible:ring-galaxy-gold focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-ink sm:right-6"
      >
        <MessageCircle aria-hidden="true" size={24} />
      </button>
    </>
  );
}
