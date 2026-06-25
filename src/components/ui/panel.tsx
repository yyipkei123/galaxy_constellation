import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

const paddingClassPattern = /(?:^|\s)(?:[a-z0-9-]+:)*(?:p|px|py|pt|pr|pb|pl)-/;

export function Panel({ children, className }: PanelProps) {
  const hasPaddingOverride = paddingClassPattern.test(className ?? '');

  return (
    <section
      className={clsx(
        'rounded-lg border border-galaxy-border bg-galaxy-charcoal/78',
        hasPaddingOverride ? null : 'p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
