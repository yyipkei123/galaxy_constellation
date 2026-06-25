import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('keeps default padding when no padding override is provided', () => {
    render(<Panel>Default panel</Panel>);

    expect(screen.getByText('Default panel').closest('section')).toHaveClass('p-6');
  });

  it('allows responsive padding overrides without also emitting the default padding class', () => {
    render(<Panel className="p-4 sm:p-6">Compact panel</Panel>);

    const panel = screen.getByText('Compact panel').closest('section');

    expect(panel).toHaveClass('p-4');
    expect(panel).toHaveClass('sm:p-6');
    expect(panel).not.toHaveClass('p-6');
  });
});
