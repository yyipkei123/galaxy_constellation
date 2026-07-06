'use client';

import { useMemo, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { campaigns, corridors, guests, personaRecords } from '@/data';
import { useAppState } from '@/store/app-store';
import { CHAT_ASSISTANT_DIALOG_ID, ChatAssistantPanel } from './chat-assistant-panel';

export function ChatAssistantLauncher() {
  const { launchedCampaigns, methodology, segments, selectedPersonaId, selectedSegment } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const context = useMemo(() => ({
    campaigns: [...campaigns, ...launchedCampaigns],
    corridors,
    guests,
    methodology,
    personas: personaRecords,
    segments,
    selectedPersonaId,
    selectedSegment,
  }), [launchedCampaigns, methodology, segments, selectedPersonaId, selectedSegment]);
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
        data-testid="ai-assistant-launcher"
        aria-label={launcherLabel}
        aria-controls={CHAT_ASSISTANT_DIALOG_ID}
        aria-expanded={isOpen}
        onClick={toggleAssistant}
        className="galaxy-cta-primary fixed bottom-[calc(env(safe-area-inset-bottom)_+_0.875rem)] right-3 z-50 h-11 w-11 px-0 shadow-xl shadow-black/40 sm:right-5 lg:bottom-[calc(env(safe-area-inset-bottom)_+_1rem)] lg:w-auto lg:px-4"
      >
        <MessageCircle aria-hidden="true" size={22} />
        <span className="hidden text-sm font-semibold lg:inline">Ask CDE AI</span>
      </button>
    </>
  );
}
