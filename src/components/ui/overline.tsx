import type { ReactNode } from 'react';

export function Overline({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-galaxy-gold">
      {children}
    </p>
  );
}
