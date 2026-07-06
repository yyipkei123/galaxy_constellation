'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isCorridorLens(pathname: string) {
  return pathname.startsWith('/corridors') || pathname.startsWith('/acquisition');
}

export function LensSwitch() {
  const pathname = usePathname();
  const acquisitionActive = isCorridorLens(pathname);

  const links = [
    { href: '/', label: 'Wallet Retention', active: !acquisitionActive },
    { href: '/corridors', label: 'Corridors Acquisition', active: acquisitionActive },
  ];

  return (
    <nav aria-label="Lens switch" className="inline-flex rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] p-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.active ? 'page' : undefined}
          className={clsx(
            'rounded-[7px] px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
            link.active
              ? 'bg-galaxy-gold text-galaxy-ink'
              : 'text-galaxy-muted hover:bg-white/[0.04] hover:text-galaxy-cream',
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
