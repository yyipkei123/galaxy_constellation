'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

interface AnimatedCountProps {
  value: number;
  prefix?: string;
  suffix?: string;
  ariaLabel: string;
  durationMs?: number;
  className?: string;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function formatCount(value: number, prefix = '', suffix = '') {
  return `${prefix}${Math.round(value)}${suffix}`;
}

export function AnimatedCount({
  value,
  prefix = '',
  suffix = '',
  ariaLabel,
  durationMs = 900,
  className,
}: AnimatedCountProps) {
  const shouldReduceMotion = useReducedMotion();
  const safeValue = Number.isFinite(value) ? value : 0;
  const [displayValue, setDisplayValue] = useState(safeValue);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion || typeof window === 'undefined') {
      setDisplayValue(safeValue);
      return;
    }

    const start = performance.now();
    setDisplayValue(0);

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplayValue(safeValue * easeOutCubic(progress));

      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick);
      }
    }

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [durationMs, safeValue, shouldReduceMotion]);

  const accessibleText = useMemo(
    () => formatCount(safeValue, prefix, suffix),
    [prefix, safeValue, suffix],
  );

  return (
    <span aria-label={ariaLabel} className={className}>
      <span aria-hidden="true">{formatCount(displayValue, prefix, suffix)}</span>
      <span className="sr-only">{accessibleText}</span>
    </span>
  );
}
