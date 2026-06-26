'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Activity,
  BarChart3,
  Gem,
  Map,
  Megaphone,
  PlaneTakeoff,
  Radar,
  Route,
  ScanSearch,
  UsersRound,
  WalletCards,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const walletNavItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/', label: 'Overview', icon: BarChart3 },
  { href: '/wallet', label: 'Wallet', icon: WalletCards },
  { href: '/segments', label: 'Segments', icon: Gem },
  { href: '/guests', label: 'Guests', icon: UsersRound },
  { href: '/leakage', label: 'Leakage', icon: Activity },
  { href: '/propensity', label: 'Audience', icon: ScanSearch },
  { href: '/activation', label: 'Activation', icon: Megaphone },
  { href: '/marketscan', label: 'Market Scan', icon: Radar },
];

const acquisitionNavItems: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/corridors', label: 'Source Markets', icon: Route },
  { href: '/acquisition', label: 'Acquisition', icon: PlaneTakeoff },
];

function isAcquisitionLens(pathname: string) {
  return pathname.startsWith('/corridors') || pathname.startsWith('/acquisition');
}

export function Nav() {
  const pathname = usePathname();
  const navItems = isAcquisitionLens(pathname) ? acquisitionNavItems : walletNavItems;
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const activeLink = activeLinkRef.current;

    if (typeof activeLink?.scrollIntoView === 'function') {
      activeLink.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }, [pathname]);

  return (
    <nav aria-label="Primary navigation" className="flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            ref={isActive ? activeLinkRef : undefined}
            className={clsx(
              'flex h-10 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors sm:text-sm lg:h-11 lg:gap-3',
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
      <div className="mt-4 hidden items-center gap-2 rounded-md border border-galaxy-border px-3 py-2 text-xs text-galaxy-muted lg:flex">
        <Map aria-hidden="true" className="h-4 w-4 text-galaxy-gold" />
        {isAcquisitionLens(pathname) ? 'Inbound corridor view' : 'Cotai wallet view'}
      </div>
    </nav>
  );
}
