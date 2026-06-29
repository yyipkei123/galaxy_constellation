'use client';

import { useEffect, useState } from 'react';
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
    setSelectedSegmentId,
    methodology,
  } = useAppState();
  const topSegment = getTopSegment(segments);
  const [dashboardSegmentId, setDashboardSegmentId] = useState(topSegment.id);
  const selectedSegment = segments.find((segment) => segment.id === dashboardSegmentId) ?? topSegment;

  useEffect(() => {
    setDashboardSegmentId(topSegment.id);
  }, [selectedQuarter.id, topSegment.id]);

  function selectDashboardSegment(segmentId: string) {
    setDashboardSegmentId(segmentId);
    setSelectedSegmentId(segmentId);
  }

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
        onSelectedSegmentChange={selectDashboardSegment}
      />
    </div>
  );
}
