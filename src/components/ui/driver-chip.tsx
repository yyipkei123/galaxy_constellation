import type { ReactNode } from 'react';

const bannedCurrencyPattern = /\b(?:HKD|MOP)\b|\$|元|澳門幣/gi;

interface DriverChipProps {
  children: ReactNode;
  className?: string;
}

function sanitizeDriverText(value: string) {
  return value.replace(bannedCurrencyPattern, '').replace(/\s+/g, ' ').trim();
}

function sanitizeDriverNode(value: ReactNode): ReactNode {
  if (typeof value === 'string' || typeof value === 'number') {
    return sanitizeDriverText(String(value));
  }

  if (Array.isArray(value)) {
    return value.map((child) => sanitizeDriverNode(child));
  }

  return value;
}

function driverLabel(value: ReactNode) {
  if (typeof value === 'string' || typeof value === 'number') {
    return `Driver: ${sanitizeDriverText(String(value))}`;
  }

  if (Array.isArray(value)) {
    const text = value
      .filter((child) => typeof child === 'string' || typeof child === 'number')
      .map((child) => sanitizeDriverText(String(child)))
      .join(' ')
      .trim();

    if (text) return `Driver: ${text}`;
  }

  return 'Driver insight';
}

export function DriverChip({ children, className }: DriverChipProps) {
  return (
    <span
      aria-label={driverLabel(children)}
      className={`inline-flex rounded-full border border-galaxy-border bg-galaxy-ink/55 px-2.5 py-1 text-xs text-galaxy-muted ${className ?? ''}`}
    >
      {sanitizeDriverNode(children)}
    </span>
  );
}
