import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConstellationCanvas } from './constellation-canvas';

const useReducedMotionMock = vi.hoisted(() => vi.fn(() => false));

vi.mock('framer-motion', () => ({
  useReducedMotion: useReducedMotionMock,
}));

function createMockContext() {
  return {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    set fillStyle(_value: string) {},
    set lineWidth(_value: number) {},
    set strokeStyle(_value: string) {},
  };
}

describe('ConstellationCanvas', () => {
  beforeEach(() => {
    useReducedMotionMock.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders an aria-hidden canvas and a text fallback for tests and reduced-motion contexts', () => {
    render(<ConstellationCanvas />);

    expect(screen.getByTestId('constellation-canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Animated constellation background')).toHaveClass('sr-only');
  });

  it('draws a static constellation when reduced motion is requested', () => {
    useReducedMotionMock.mockReturnValue(true);
    const context = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 300,
      top: 0,
      width: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    render(<ConstellationCanvas />);

    expect(context.fillRect).toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalled();
    expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
  });

  it('pauses and resumes the animation loop on document visibility changes', () => {
    const context = createMockContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      () => context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      bottom: 200,
      height: 200,
      left: 0,
      right: 300,
      top: 0,
      width: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation(() => 42);
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const visibilityStateSpy = vi.spyOn(document, 'visibilityState', 'get');

    class FakeIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];

      constructor(private readonly callback: IntersectionObserverCallback) {}

      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
      unobserve = vi.fn();
      observe = vi.fn(() => {
        this.callback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          this as IntersectionObserver,
        );
      });
    }

    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
    visibilityStateSpy.mockReturnValue('visible');

    render(<ConstellationCanvas />);

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

    visibilityStateSpy.mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));

    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(42);

    visibilityStateSpy.mockReturnValue('visible');
    document.dispatchEvent(new Event('visibilitychange'));
    document.dispatchEvent(new Event('visibilitychange'));

    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(2);
  });
});
