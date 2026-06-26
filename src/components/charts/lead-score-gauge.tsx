function clampScore(score: number) {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function LeadScoreGauge({ score }: { score: number }) {
  const safeScore = clampScore(score);
  const sweepDegrees = safeScore * 3.6;

  return (
    <div
      role="meter"
      aria-label="Lead Score"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeScore}
      aria-valuetext={`${safeScore} out of 100`}
      className="relative grid h-28 w-28 place-items-center rounded-full"
      style={{
        background: `conic-gradient(#c9a45c ${sweepDegrees}deg, rgba(44,44,54,0.9) 0deg)`,
      }}
    >
      <div className="grid h-20 w-20 place-items-center rounded-full bg-galaxy-charcoal">
        <span className="font-mono text-2xl font-semibold tabular-nums text-galaxy-cream">{safeScore}</span>
      </div>
    </div>
  );
}
