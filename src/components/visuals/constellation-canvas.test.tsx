import { render, screen } from '@testing-library/react';
import { ConstellationCanvas } from './constellation-canvas';

describe('ConstellationCanvas', () => {
  it('renders an aria-hidden canvas and a text fallback for tests and reduced-motion contexts', () => {
    render(<ConstellationCanvas />);

    expect(screen.getByTestId('constellation-canvas')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Animated constellation background')).toHaveClass('sr-only');
  });
});
