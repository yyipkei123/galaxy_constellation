import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className }: PanelProps) {
  return (
    <section className={clsx('rounded-lg border border-galaxy-border bg-galaxy-charcoal/78 p-6', className)}>
      {children}
    </section>
  );
}
