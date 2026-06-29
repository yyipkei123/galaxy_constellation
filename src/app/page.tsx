'use client';

import { BoardroomBrief } from '@/components/dashboard/boardroom-brief';
import { DashboardHero } from '@/components/dashboard/dashboard-hero';
import { DecisionWorkspace } from '@/components/dashboard/decision-workspace';
import { ExecutiveMetrics } from '@/components/dashboard/executive-metrics';
import { getTopSegment, type DashboardTabId } from '@/components/dashboard/open-design-view-model';
import { ReadingGuide } from '@/components/dashboard/reading-guide';
import { useAppState } from '@/store/app-store';

export default function Home() {
  const {
    selectedQuarter,
    segments,
    selectedSegmentId,
    setSelectedSegmentId,
    methodology,
  } = useAppState();
  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? getTopSegment(segments);

  function jumpToWorkspace(tabId: DashboardTabId) {
    const tab = document.getElementById(`dashboard-tab-${tabId}`);
    const workspace = document.querySelector<HTMLElement>('[aria-label="Decision workspace"]');

    if (tab instanceof HTMLButtonElement) {
      tab.click();
    }

    workspace?.scrollIntoView?.({
      block: 'start',
      behavior: 'smooth',
    });
  }

  return (
    <div className="space-y-[18px] text-galaxy-cream">
      <DashboardHero methodology={methodology} quarter={selectedQuarter} />
      <ExecutiveMetrics methodology={methodology} segments={segments} />
      <BoardroomBrief quarter={selectedQuarter} segment={selectedSegment} />
      <ReadingGuide onJump={jumpToWorkspace} />
      <DecisionWorkspace
        methodology={methodology}
        quarter={selectedQuarter}
        segments={segments}
        selectedSegmentId={selectedSegment.id}
        onSelectedSegmentChange={setSelectedSegmentId}
      />
    </div>
  );
}
