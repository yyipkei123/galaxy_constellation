import type { ReactNode } from 'react';
import clsx from 'clsx';
import { Overline } from './overline';

interface SectionHeaderProps {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  as?: 'h2' | 'h3';
  className?: string;
}

export function SectionHeader({
  title,
  description,
  eyebrow,
  as: Heading = 'h2',
  className,
}: SectionHeaderProps) {
  return (
    <div className={clsx('min-w-0', className)}>
      {eyebrow ? <Overline>{eyebrow}</Overline> : null}
      <Heading className="mt-2 font-sans text-2xl font-semibold leading-tight tracking-normal text-galaxy-cream md:text-3xl">
        {title}
      </Heading>
      {description ? (
        <p className="mt-3 max-w-3xl text-sm leading-6 text-galaxy-muted md:text-base md:leading-7">
          {description}
        </p>
      ) : null}
    </div>
  );
}
