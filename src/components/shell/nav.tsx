'use client';

import clsx from 'clsx';
import {
  Activity,
  BarChart3,
  Gem,
  Map,
  Megaphone,
  Radar,
  ScanSearch,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/segments', label: 'Segments', icon: Gem },
  { href: '/leakage', label: 'Leakage', icon: Activity },
  { href: '/audience', label: 'Audience', icon: ScanSearch },
  { href: '/activation', label: 'Activation', icon: Megaphone },
  { href: '/market-scan', label: 'Market Scan', icon: Radar },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-galaxy-gold text-galaxy-ink'
                : 'text-galaxy-muted hover:bg-galaxy-slate hover:text-galaxy-cream',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <div className="mt-4 flex items-center gap-2 rounded-md border border-galaxy-border px-3 py-2 text-xs text-galaxy-muted">
        <Map aria-hidden="true" className="h-4 w-4 text-galaxy-gold" />
        Cotai wallet view
      </div>
    </nav>
  );
}
