import { render, screen } from '@testing-library/react';
import Home from './page';

describe('home route smoke test', () => {
  it('renders the Galaxy Constellation entry point', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Galaxy Constellation/i })).toBeInTheDocument();
  });

  it('does not render its own main landmark because the shell owns it', () => {
    render(<Home />);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
