'use client';

import { useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { personaRecords } from '@/data';
import { useAppState } from '@/store/app-store';
import { CHAT_ASSISTANT_DIALOG_ID, ChatAssistantPanel } from './chat-assistant-panel';

export function ChatAssistantLauncher() {
  const { methodology, segments, selectedPersonaId, selectedSegment } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const context = useMemo(() => ({
    methodology,
    personas: personaRecords,
    segments,
    selectedPersonaId,
    selectedSegment,
  }), [methodology, segments, selectedPersonaId, selectedSegment]);
  const launcherLabel = isOpen ? 'Close AI insight assistant' : 'Open AI insight assistant';

  function restoreLauncherFocus() {
    const focusLauncher = () => launcherRef.current?.focus();

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(focusLauncher);
      return;
    }

    window.setTimeout(focusLauncher, 0);
  }

  function closeAssistant() {
    setIsOpen(false);
    restoreLauncherFocus();
  }

  function toggleAssistant() {
    if (isOpen) {
      closeAssistant();
      return;
    }

    setIsOpen(true);
  }

  return (
    <>
      {isOpen ? <ChatAssistantPanel context={context} onClose={closeAssistant} /> : null}

      <button
        ref={launcherRef}
        type="button"
        aria-label={launcherLabel}
        aria-controls={CHAT_ASSISTANT_DIALOG_ID}
        aria-expanded={isOpen}
        onClick={toggleAssistant}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-galaxy-gold/50 bg-galaxy-gold text-galaxy-ink shadow-xl shadow-black/40 transition hover:bg-galaxy-gold-lite focus-visible:ring-2 focus-visible:ring-galaxy-gold focus-visible:ring-offset-2 focus-visible:ring-offset-galaxy-ink sm:right-6 lg:h-11 lg:w-auto lg:gap-2 lg:rounded-full lg:px-4"
      >
        <MessageCircle aria-hidden="true" size={22} />
        <span className="hidden text-sm font-semibold lg:inline">Ask CDE AI</span>
      </button>
    </>
  );
}
