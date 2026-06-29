import clsx from 'clsx';

export interface SectionJumpNavItem {
  id: string;
  label: string;
}

interface SectionJumpNavProps {
  label: string;
  items: SectionJumpNavItem[];
  currentId?: string;
  className?: string;
}

export function SectionJumpNav({
  label,
  items,
  currentId,
  className,
}: SectionJumpNavProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className={clsx(
        'sticky top-0 z-30 -mx-3 border-y border-galaxy-border bg-galaxy-ink/95 px-3 py-2 backdrop-blur sm:-mx-5 sm:px-5 md:top-0 md:-mx-[26px] md:px-[26px] lg:static lg:mx-0 lg:rounded-lg lg:border lg:bg-galaxy-charcoal/60 lg:px-3',
        className,
      )}
    >
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {items.map((item) => {
          const isCurrent = item.id === currentId;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={isCurrent ? 'true' : undefined}
              className={clsx(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-galaxy-gold',
                isCurrent
                  ? 'border-galaxy-gold bg-galaxy-gold text-galaxy-ink'
                  : 'border-galaxy-border bg-galaxy-charcoal/80 text-galaxy-muted hover:border-galaxy-gold/70 hover:text-galaxy-cream',
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
