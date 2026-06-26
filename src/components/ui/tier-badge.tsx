import clsx from 'clsx';
import type { GalaxyTier } from '@/data';

const tierClasses: Record<GalaxyTier, string> = {
  Privilege: 'border-galaxy-border bg-galaxy-slate text-galaxy-muted',
  Gold: 'border-galaxy-gold/30 bg-galaxy-gold/10 text-galaxy-gold',
  Platinum: 'border-galaxy-positive/40 bg-galaxy-positive/10 text-galaxy-positive',
  Diamond: 'border-galaxy-gold/50 bg-galaxy-gold/20 text-galaxy-gold-lite',
};

interface TierBadgeProps {
  tier: GalaxyTier;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  return (
    <span
      aria-label={`Galaxy tier ${tier}`}
      className={clsx(
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
        tierClasses[tier],
        className,
      )}
    >
      {tier}
    </span>
  );
}
