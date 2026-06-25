import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { PersonaAffinityChart } from './persona-affinity-chart';

describe('PersonaAffinityChart', () => {
  it('renders persona shares and co-spend themes', () => {
    render(<PersonaAffinityChart corridor={getCorridorById('korea')} />);

    expect(screen.getByText('Entertainment Lover')).toBeInTheDocument();
    expect(screen.getByText('28%')).toBeInTheDocument();
    expect(screen.getByText(/K-pop adjacent events/i)).toBeInTheDocument();
    expect(screen.getByText(/arena shows/i)).toBeInTheDocument();
  });

  it('clamps persona share bar widths to valid percentages', () => {
    const corridor = getCorridorById('korea');
    render(
      <PersonaAffinityChart
        corridor={{
          ...corridor,
          personas: [{ ...corridor.personas[0], sharePct: 145 }, ...corridor.personas.slice(1)],
        }}
      />,
    );

    const personaCard = screen.getByText('Entertainment Lover').closest('article');
    expect(personaCard).not.toBeNull();
    const shareBar = personaCard?.querySelector<HTMLElement>('.h-2.rounded-full.bg-galaxy-gold');
    expect(shareBar).toHaveStyle({ width: '100%' });
  });
});
