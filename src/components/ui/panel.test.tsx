import { render, screen } from '@testing-library/react';
import { Panel } from './panel';

describe('Panel', () => {
  it('renders default panel content', () => {
    render(<Panel>Wallet panel</Panel>);

    expect(screen.getByText('Wallet panel')).toBeInTheDocument();
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
});
