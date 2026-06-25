import { render, screen } from '@testing-library/react';
import AcquisitionPage from './page';

describe('acquisition route stub', () => {
  it('renders the priority recommendation route header', () => {
    render(<AcquisitionPage />);

    expect(screen.getByRole('heading', { name: 'Priority Corridor Acquisition', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/Korea/i)).toBeInTheDocument();
    expect(screen.getByText(/2020 base · refresh pending/i)).toBeInTheDocument();
  });
});
