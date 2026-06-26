import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'hero';
}

const paddingClassPattern = /(?:^|\s)(?:[a-z0-9-]+:)*(?:p|px|py|pt|pr|pb|pl)-/;

const variantClasses = {
  default: 'rounded-lg border border-galaxy-border bg-galaxy-charcoal/78',
  glass: 'rounded-2xl border border-white/10 bg-galaxy-charcoal/60 shadow-2xl shadow-black/30 backdrop-blur',
  hero: 'rounded-2xl border border-galaxy-gold/30 bg-galaxy-charcoal/62 shadow-[0_0_44px_rgba(201,164,92,0.15)] backdrop-blur',
};

export function Panel({ children, className, variant = 'default' }: PanelProps) {
  const hasPaddingOverride = paddingClassPattern.test(className ?? '');

  return (
    <section
      className={clsx(
        variantClasses[variant],
        'relative overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/20',
        hasPaddingOverride ? null : 'p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}
