import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';

const bannedCurrencyPattern = /HKD|MOP|\$|元|澳門幣/gi;

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

  if (isValidElement<{ children?: ReactNode }>(value)) {
    if (!('children' in value.props)) return value;

    return cloneElement(
      value as ReactElement<{ children?: ReactNode }>,
      undefined,
      sanitizeDriverNode(value.props.children),
    );
  }

  return Children.map(value, (child) => sanitizeDriverNode(child));
}

function driverText(value: ReactNode): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return sanitizeDriverText(String(value));
  }

  if (isValidElement<{ children?: ReactNode }>(value)) {
    return driverText(value.props.children);
  }

  return Children.toArray(value)
    .map((child) => driverText(child))
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function driverLabel(value: ReactNode) {
  const text = driverText(value);

  return text ? `Driver: ${text}` : 'Driver insight';
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
