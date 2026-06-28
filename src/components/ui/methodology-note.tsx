'use client';

import { useAppState } from '@/store/app-store';

export function MethodologyNote() {
  const { methodology } = useAppState();

  return (
    <p className="text-xs leading-6 text-galaxy-muted">
      Enriched figures are modelled estimates expressed as indices / ranges / % per Mastercard CDE data-sharing rules.
      Mastercard CDE methodology: matched coverage {methodology.matchedCoveragePct}% across modelled guest wallet
      cohorts, refreshed {methodology.refresh}, with {methodology.activeMetricCount} active CDE metrics using{' '}
      {methodology.basis}. Use the CDE Guide in the top bar for signal interpretation.
    </p>
  );
}
