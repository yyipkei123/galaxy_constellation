import type { ReactNode } from 'react';
import clsx from 'clsx';

interface PanelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'hero';
}

const paddingClassPattern = /(?:^|\s)(?:[a-z0-9-]+:)*(?:p|px|py|pt|pr|pb|pl)-/;

const variantClasses = {
  default: 'galaxy-glass-panel rounded-[18px] border border-white/10 bg-galaxy-charcoal/70',
  glass: 'galaxy-glass-panel rounded-[20px] border border-white/10 bg-galaxy-charcoal/60 shadow-2xl shadow-black/30 backdrop-blur',
  hero: 'galaxy-glass-panel rounded-[20px] border border-galaxy-gold/30 bg-galaxy-charcoal/62 shadow-[0_0_44px_rgba(214,179,95,0.14)] backdrop-blur',
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
