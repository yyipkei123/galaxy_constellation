import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders default panel content', () => {
    render(<Panel>Wallet panel</Panel>);

    expect(screen.getByText('Wallet panel')).toBeInTheDocument();
  });

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

  it('does not clip default panel content', () => {
    render(<Panel>Tooltip-safe panel</Panel>);

    expect(screen.getByText('Tooltip-safe panel').closest('section')).not.toHaveClass(
      'overflow-hidden',
    );
  });

  it('supports glass depth without removing caller classes', () => {
    render(
      <Panel variant="glass" className="border-galaxy-gold/40">
        Glass panel
      </Panel>,
    );

    const panel = screen.getByText('Glass panel').closest('section');
    expect(panel).toHaveClass('backdrop-blur');
    expect(panel).toHaveClass('border-galaxy-gold/40');
  });

  it('renders the Open Design glass material classes without changing the section contract', () => {
    render(
      <Panel variant="glass" className="px-4">
        <h2>Glass surface</h2>
      </Panel>,
    );

    const panel = screen.getByText('Glass surface').closest('section');

    expect(panel).not.toBeNull();
    expect(panel).toHaveClass('galaxy-glass-panel');
    expect(panel).toHaveClass('rounded-[20px]');
    expect(panel).toHaveClass('border-white/10');
    expect(panel).not.toHaveClass('p-6');
  });
});
