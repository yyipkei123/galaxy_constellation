'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

const STAR_COUNT = 72;
const LINK_DISTANCE = 132;
const GOLD = '201, 164, 92';

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: STAR_COUNT }, (_, index) => {
    const seed = (index + 1) * 97;
    const x = (seed * 37) % Math.max(width, 1);
    const y = (seed * 53) % Math.max(height, 1);

    return {
      x,
      y,
      vx: ((seed % 7) - 3) * 0.018,
      vy: ((seed % 11) - 5) * 0.014,
      radius: 0.8 + (seed % 4) * 0.24,
      alpha: 0.24 + (seed % 6) * 0.06,
    };
  });
}

export function ConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    if (!reduceMotion && typeof IntersectionObserver === 'undefined') return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let stars: Star[] = [];
    let animationFrame: number | null = null;
    let isIntersecting = true;

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(rect.width, rect.height);
    }

    function paint(animate: boolean) {
      const rect = wrapper.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);
      context.fillStyle = 'rgba(11, 11, 14, 0.2)';
      context.fillRect(0, 0, rect.width, rect.height);

      if (animate) {
        stars.forEach((star) => {
          star.x += star.vx;
          star.y += star.vy;
          if (star.x < 0 || star.x > rect.width) star.vx *= -1;
          if (star.y < 0 || star.y > rect.height) star.vy *= -1;
        });
      }

      for (let i = 0; i < stars.length; i += 1) {
        for (let j = i + 1; j < stars.length; j += 1) {
          const first = stars[i];
          const second = stars[j];
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance < LINK_DISTANCE) {
            context.strokeStyle = `rgba(${GOLD}, ${0.12 * (1 - distance / LINK_DISTANCE)})`;
            context.lineWidth = 0.6;
            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);
            context.stroke();
          }
        }
      }

      stars.forEach((star) => {
        context.fillStyle = `rgba(${GOLD}, ${star.alpha})`;
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
      });
    }

    function cancelLoop() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    }

    function scheduleDraw() {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        draw();
      });
    }

    function draw() {
      paint(true);

      if (isIntersecting && document.visibilityState === 'visible') {
        scheduleDraw();
      }
    }

    function startLoop() {
      if (isIntersecting && document.visibilityState === 'visible') {
        scheduleDraw();
      }
    }

    function handleResize() {
      resize();
      if (reduceMotion) {
        paint(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        startLoop();
      } else {
        cancelLoop();
      }
    }

    resize();

    if (reduceMotion) {
      paint(false);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        startLoop();
      } else {
        cancelLoop();
      }
    });

    observer.observe(wrapper);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startLoop();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelLoop();
    };
  }, [reduceMotion]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        data-testid="constellation-canvas"
        className="h-full w-full opacity-90"
      />
      <span className="sr-only">Animated constellation background</span>
    </div>
  );
}
