'use client';

import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { redesignNavItems, type RedesignPageId } from '@/components/redesign/constellation-redesign-model';

interface ShellNavItem {
  section: string | null;
  href: string;
  label: string;
  shortLabel: string;
  num: string;
}

const shortLabels: Partial<Record<RedesignPageId, string>> = {
  activation: 'Activate',
  marketscan: 'Market',
  governance: 'Gov',
};

const walletNavItems: ShellNavItem[] = redesignNavItems.map((item) => ({
  section: item.section,
  href: item.href,
  label: item.label,
  shortLabel: shortLabels[item.pageId] ?? item.label,
  num: item.num,
}));

const acquisitionNavItems: ShellNavItem[] = [
  { section: 'Acquire', href: '/corridors', label: 'Source Markets', shortLabel: 'Markets', num: '01' },
  { section: null, href: '/acquisition', label: 'Acquisition', shortLabel: 'Acquire', num: '02' },
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
      className="relative flex w-full min-w-0 max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] lg:block lg:space-y-1.5 lg:overflow-visible lg:pb-0"
    >
      {navItems.map((item, index) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <div key={item.href} className="contents lg:block">
            {item.section ? (
              <div className={clsx(
                'hidden px-2 pb-1 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#6A6478] lg:block',
                index > 0 && 'pt-4',
              )}
              >
                {item.section}
              </div>
            ) : null}
            <Link
              href={item.href}
              ref={isActive ? activeLinkRef : undefined}
              aria-label={item.label}
              className={clsx(
                'group flex h-10 shrink-0 items-center gap-2.5 rounded-lg border px-3 text-left text-[13px] font-semibold transition lg:min-h-[38px] lg:w-full',
                isActive
                  ? 'border-galaxy-gold/55 bg-galaxy-gold/12 text-galaxy-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                  : 'border-transparent text-[#8B8598] hover:border-galaxy-gold/35 hover:bg-galaxy-gold/10 hover:text-galaxy-cream',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span aria-hidden="true" className="w-5 shrink-0 font-mono text-[10.5px] text-galaxy-gold/80">
                {item.num}
              </span>
              <span className="min-w-0 flex-1">
                <span aria-hidden="true" className="lg:hidden">{item.shortLabel}</span>
                <span className="hidden truncate lg:inline">{item.label}</span>
              </span>
            </Link>
          </div>
        );
      })}
      {isAcquisitionLens(pathname) ? (
        <div className="mt-5 hidden rounded-lg border border-[rgba(212,175,94,0.14)] bg-[rgba(255,255,255,0.025)] px-3 py-2 text-[11px] font-semibold text-[#8B8598] lg:block">
          Inbound corridor view
        </div>
      ) : null}
    </nav>
  );
}
