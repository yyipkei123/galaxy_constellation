import Image from 'next/image';
import clsx from 'clsx';

interface BrandPartnershipBadgeProps {
  className?: string;
}

export function BrandPartnershipBadge({ className }: BrandPartnershipBadgeProps) {
  return (
    <div
      aria-label="Galaxy Macau and Mastercard data partnership"
      role="group"
      className={clsx(
        'inline-flex min-h-8 shrink-0 items-center gap-2 rounded-[9px] border border-galaxy-gold/20 bg-white/[0.025] px-2 py-1',
        className,
      )}
    >
      <span className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-galaxy-muted sm:inline">
        Data partnership
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[7px] bg-white p-1">
        <Image
          src="/brand/galaxy-macau-logo.png"
          alt="Galaxy Macau"
          width={28}
          height={28}
          sizes="28px"
          className="h-full w-full object-contain"
        />
      </span>
      <span className="flex h-7 w-[4.8rem] shrink-0 items-center sm:w-[5.4rem]">
        <Image
          src="/brand/mastercard-logo.png"
          alt="Mastercard"
          width={96}
          height={18}
          sizes="96px"
          className="h-auto max-h-5 w-full object-contain"
        />
      </span>
    </div>
  );
}
