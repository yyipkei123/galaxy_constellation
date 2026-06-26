import clsx from 'clsx';

interface ScorePillProps {
  score: number;
  label?: string;
  className?: string;
}

function clampScore(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function scoreTone(score: number) {
  if (score >= 85) return 'border-galaxy-gold/50 bg-galaxy-gold/15 text-galaxy-gold';
  if (score >= 70) return 'border-galaxy-positive/40 bg-galaxy-positive/10 text-galaxy-positive';
  return 'border-galaxy-border bg-galaxy-slate text-galaxy-muted';
}

export function ScorePill({ score, label = 'Lead Score', className }: ScorePillProps) {
  const safeScore = clampScore(score);

  return (
    <span
      aria-label={`${label} ${safeScore} out of 100`}
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 font-mono text-sm font-semibold tabular-nums',
        scoreTone(safeScore),
        className,
      )}
    >
      {safeScore}
    </span>
  );
}
