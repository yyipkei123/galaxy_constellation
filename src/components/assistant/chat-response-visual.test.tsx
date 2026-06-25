import { render, screen } from '@testing-library/react';
import type { ChatAssistantVisual } from '@/lib/chat-assistant';
import { ChatResponseVisual } from './chat-response-visual';

describe('ChatResponseVisual', () => {
  it('renders a bar-list figure with proportional bars', () => {
    const visual: ChatAssistantVisual = {
      kind: 'bar-list',
      title: 'Leakage drivers',
      items: [
        {
          id: 'hospitality',
          label: 'Competitor hospitality',
          value: 64,
          formattedValue: '64%',
          description: 'Index 176 wallet intensity',
        },
        {
          id: 'retail',
          label: 'Luxury retail',
          value: 32,
          formattedValue: '32%',
          description: 'Index 124 wallet intensity',
        },
      ],
    };

    render(<ChatResponseVisual visual={visual} />);

    expect(screen.getByRole('figure', { name: /Leakage drivers/i })).toBeInTheDocument();
    expect(screen.getByText('Competitor hospitality')).toBeInTheDocument();
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByLabelText('Competitor hospitality bar value 64%')).toHaveStyle({ width: '100%' });
  });

  it('renders zero-value bars without implying nonzero progress', () => {
    const visual: ChatAssistantVisual = {
      kind: 'bar-list',
      title: 'Leakage drivers',
      items: [
        {
          id: 'empty',
          label: 'No leakage signal',
          value: 0,
          formattedValue: '0%',
          description: 'No measurable leakage',
        },
      ],
    };

    render(<ChatResponseVisual visual={visual} />);

    expect(screen.getByLabelText('No leakage signal bar value 0%')).toHaveStyle({ width: '0%' });
  });

  it('renders a metric-strip figure with compact metric text', () => {
    const visual: ChatAssistantVisual = {
      kind: 'metric-strip',
      title: 'Activation signals',
      items: [
        {
          id: 'priority',
          label: 'Activation priority',
          value: 184,
          formattedValue: 'Index 184',
          description: 'Persona evidence',
        },
      ],
    };

    render(<ChatResponseVisual visual={visual} />);

    expect(screen.getByRole('figure', { name: /Activation signals/i })).toBeInTheDocument();
    expect(screen.getByText('Activation priority')).toBeInTheDocument();
    expect(screen.getByText('Index 184')).toBeInTheDocument();
    expect(screen.getByText('Persona evidence')).toBeInTheDocument();
  });

  it('renders an empty state for visuals without items', () => {
    const visual: ChatAssistantVisual = {
      kind: 'metric-strip',
      title: 'Activation signals',
      items: [],
    };

    render(<ChatResponseVisual visual={visual} />);

    expect(screen.getByText('No visual data available for this answer.')).toBeInTheDocument();
  });
});
