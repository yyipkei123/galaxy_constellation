import { useId, type ReactNode } from 'react';
import clsx from 'clsx';
import { Overline } from './overline';

interface PageHeaderProps {
  title: string;
  description: ReactNode;
  eyebrow?: ReactNode;
  aside?: ReactNode;
  variant?: 'hero' | 'compact';
  className?: string;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  aside,
  variant = 'compact',
  className,
}: PageHeaderProps) {
  const isHero = variant === 'hero';
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      data-variant={variant}
      className={clsx(
        isHero ? 'galaxy-hero-panel' : 'galaxy-panel',
        isHero
          ? 'px-5 py-7 sm:px-6 md:px-8 md:py-8'
          : 'px-4 py-5 sm:px-5 md:px-6',
        className,
      )}
    >
      <div className={clsx('grid gap-4', aside ? 'lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end' : '')}>
        <div>
          {eyebrow ? <Overline>{eyebrow}</Overline> : null}
          <h1
            id={titleId}
            className={clsx(
              'mt-3 text-galaxy-cream',
              isHero
                ? 'font-display text-4xl leading-[1.02] sm:text-5xl md:text-6xl'
                : 'font-sans text-3xl font-semibold leading-tight tracking-normal sm:text-4xl',
            )}
          >
            {title}
          </h1>
          <div
            className={clsx(
              'mt-3 max-w-3xl text-galaxy-muted',
              isHero ? 'text-base leading-8 md:text-lg' : 'text-sm leading-6 md:text-base md:leading-7',
            )}
          >
            {description}
          </div>
        </div>
        {aside ? (
          <div className="galaxy-tile p-4 text-sm leading-6 text-galaxy-muted">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
