'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  Activity,
  BarChart3,
  Gem,
  LineChart,
  Map,
  Megaphone,
  PlaneTakeoff,
  Radar,
  Route,
  ScanSearch,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  WalletCards,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const walletNavItems: Array<{ href: string; label: string; shortLabel: string; icon: LucideIcon }> = [
  { href: '/', label: 'Overview', shortLabel: 'Overview', icon: BarChart3 },
  { href: '/journey', label: 'Journey', shortLabel: 'Journey', icon: Workflow },
  { href: '/wallet', label: 'Wallet', shortLabel: 'Wallet', icon: WalletCards },
  { href: '/segments', label: 'Segments', shortLabel: 'Segments', icon: Gem },
  { href: '/guests', label: 'Guests', shortLabel: 'Guests', icon: UsersRound },
  { href: '/leakage', label: 'Leakage', shortLabel: 'Leakage', icon: Activity },
  { href: '/propensity', label: 'Audience', shortLabel: 'Audience', icon: ScanSearch },
  { href: '/activation', label: 'Activation', shortLabel: 'Activate', icon: Megaphone },
  { href: '/measurement', label: 'Measurement', shortLabel: 'Measure', icon: LineChart },
  { href: '/simulate', label: 'Simulator', shortLabel: 'Simulate', icon: SlidersHorizontal },
  { href: '/marketscan', label: 'Market Scan', shortLabel: 'Market', icon: Radar },
  { href: '/governance', label: 'Governance', shortLabel: 'Gov', icon: ShieldCheck },
];

const acquisitionNavItems: Array<{ href: string; label: string; shortLabel: string; icon: LucideIcon }> = [
  { href: '/corridors', label: 'Source Markets', shortLabel: 'Markets', icon: Route },
  { href: '/acquisition', label: 'Acquisition', shortLabel: 'Acquire', icon: PlaneTakeoff },
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
    <nav
      aria-label="Primary navigation"
      className="relative flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:grid lg:gap-2 lg:overflow-visible lg:pb-0"
    >
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const navIndex = String(index + 1).padStart(2, '0');

        return (
          <Link
            key={item.href}
            href={item.href}
            ref={isActive ? activeLinkRef : undefined}
            aria-label={item.label}
            className={clsx(
              'group flex h-11 shrink-0 items-center justify-between gap-3 rounded-xl border px-3 text-left text-xs font-semibold transition sm:text-sm lg:w-full',
              isActive
                ? 'border-galaxy-gold/40 bg-galaxy-gold/12 text-galaxy-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                : 'border-transparent text-galaxy-muted hover:border-galaxy-gold/40 hover:bg-galaxy-slate/60 hover:text-galaxy-cream',
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="flex min-w-0 items-center gap-2">
              <Icon aria-hidden="true" className="h-4 w-4 shrink-0 lg:hidden" />
              <span aria-hidden="true" className="lg:hidden">{item.shortLabel}</span>
              <span className="hidden truncate lg:inline">{item.label}</span>
            </span>
            <span aria-hidden="true" className="hidden font-mono text-[11px] text-galaxy-muted/70 lg:inline">
              {navIndex}
            </span>
          </Link>
        );
      })}
      <div className="mt-4 hidden items-center gap-2 rounded-xl border border-white/10 bg-galaxy-charcoal/50 px-3 py-2 text-xs text-galaxy-muted lg:flex">
        <Map aria-hidden="true" className="h-4 w-4 text-galaxy-gold" />
        {isAcquisitionLens(pathname) ? 'Inbound corridor view' : 'Cotai wallet view'}
      </div>
    </nav>
  );
}
