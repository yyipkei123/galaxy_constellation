import type { ReactNode } from 'react';
import clsx from 'clsx';

interface InsightTooltipProps {
  title: string;
  lines: string[];
  children: ReactNode;
  block?: boolean;
  className?: string;
  triggerClassName?: string;
}

export function InsightTooltip({
  title,
  lines,
  children,
  block = false,
  className,
  triggerClassName,
}: InsightTooltipProps) {
  const Wrapper = block ? 'div' : 'span';
  const Trigger = block ? 'div' : 'span';
  const ariaLabel = [title, ...lines.map((line) => line.replace(/\.+$/, ''))].join('. ');

  return (
    <Wrapper
      className={clsx(
        'group relative max-w-full',
        block ? 'block' : 'inline-flex align-middle',
        className,
      )}
    >
      <Trigger
        tabIndex={0}
        title={ariaLabel}
        aria-label={ariaLabel}
        className={clsx(
          'cursor-help rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-galaxy-gold',
          block ? 'block max-w-full' : 'inline-flex max-w-full items-center',
          triggerClassName,
        )}
      >
        {children}
      </Trigger>
      <span
        role="tooltip"
        className="absolute left-0 top-full z-50 mt-2 hidden w-72 max-w-[calc(100vw-2rem)] rounded-md border border-galaxy-gold/40 bg-galaxy-charcoal p-3 text-left text-xs leading-5 text-galaxy-muted shadow-xl shadow-black/35 group-focus-within:block group-hover:block"
      >
        <span className="block font-semibold text-galaxy-cream">{title}</span>
        {lines.map((line) => (
          <span key={line} className="mt-1 block">
            {line}
          </span>
        ))}
      </span>
    </Wrapper>
  );
}
