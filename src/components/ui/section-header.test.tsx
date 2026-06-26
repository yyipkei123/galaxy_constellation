import { render, screen } from '@testing-library/react';
import { SectionHeader } from './section-header';

describe('SectionHeader', () => {
  it('renders a sans dashboard heading and optional description', () => {
    render(
      <SectionHeader
        eyebrow="Segment x category"
        title="Segment opportunity heatmap"
        description="Heat shows wallet-gap priority by segment and visible category."
      />,
    );

    expect(screen.getByText('Segment x category')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Segment opportunity heatmap', level: 2 })).toHaveClass('font-sans');
    expect(screen.getByText(/wallet-gap priority/i)).toBeInTheDocument();
  });

  it('supports h3 for nested analytical sections', () => {
    render(<SectionHeader as="h3" title="Channel mix" />);

    expect(screen.getByRole('heading', { name: 'Channel mix', level: 3 })).toBeInTheDocument();
  });
});
