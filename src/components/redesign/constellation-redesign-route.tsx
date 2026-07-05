'use client';

import { useAppState } from '@/store/app-store';
import { ConstellationRedesignScreen } from './constellation-redesign-screen';
import type { RedesignPageId } from './constellation-redesign-model';

export function ConstellationRedesignRoute({ pageId }: { pageId: RedesignPageId }) {
  const { methodology, selectedQuarter } = useAppState();

  return (
    <ConstellationRedesignScreen
      pageId={pageId}
      quarterLabel={selectedQuarter.label}
      coveragePct={methodology.matchedCoveragePct}
      activeMetricCount={methodology.activeMetricCount}
    />
  );
}
