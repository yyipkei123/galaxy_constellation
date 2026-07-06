'use client';

import { ChatAssistantLauncher } from '@/components/assistant/chat-assistant-launcher';
import { useAppState } from '@/store/app-store';
import { usePathname } from 'next/navigation';

const redesignedRoutes = new Set([
  '/',
  '/journey',
  '/wallet',
  '/segments',
  '/guests',
  '/leakage',
  '/propensity',
  '/activation',
  '/simulate',
  '/measurement',
  '/marketscan',
  '/governance',
]);

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/$/, '');
}

export function hasCompactCdeAiDock(pathname: string) {
  return redesignedRoutes.has(normalizePathname(pathname));
}

export function PresentationFloatingControls() {
  const { isPresenterMode } = useAppState();
  const pathname = usePathname();

  if (isPresenterMode) {
    return null;
  }

  const showLegacyFloatingControls = !hasCompactCdeAiDock(pathname);

  return (
    <>
      {showLegacyFloatingControls ? (
        <ChatAssistantLauncher />
      ) : null}
    </>
  );
}
