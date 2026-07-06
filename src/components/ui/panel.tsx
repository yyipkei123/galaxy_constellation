import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'hero';
}

const paddingClassPattern = /(?:^|\s)(?:[a-z0-9-]+:)*(?:p|px|py|pt|pr|pb|pl)-/;

const variantClasses = {
  default: 'galaxy-panel',
  glass: 'galaxy-panel backdrop-blur',
  hero: 'galaxy-hero-panel backdrop-blur',
};

export function Panel({ children, className, variant = 'default' }: PanelProps) {
  const hasPaddingOverride = paddingClassPattern.test(className ?? '');

  return (
    <section
      className={clsx(
        variantClasses[variant],
        hasPaddingOverride ? null : 'p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
