'use client';

import { ChatAssistantLauncher } from '@/components/assistant/chat-assistant-launcher';
import { PresenterTour } from '@/components/shell/presenter-tour';
import { useAppState } from '@/store/app-store';

export function PresentationFloatingControls() {
  const { isPresenterMode } = useAppState();

  if (isPresenterMode) {
    return null;
  }

  return (
    <>
      <PresenterTour />
      <ChatAssistantLauncher />
    </>
  );
}
