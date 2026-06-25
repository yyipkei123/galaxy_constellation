import { render, screen } from '@testing-library/react';
import { getCorridorById } from '@/data';
import { buildAcquisitionDraft } from '@/lib/acquisition-content';
import { ContentDraftCard } from './content-draft-card';

describe('ContentDraftCard', () => {
  it('renders deterministic multilingual campaign draft variants', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');

    render(<ContentDraftCard draft={draft} />);

    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('繁中')).toBeInTheDocument();
    expect(screen.getByText('한국어')).toBeInTheDocument();
    expect(screen.getByText(/Variant A/i)).toBeInTheDocument();
    expect(screen.getByText(/Variant B/i)).toBeInTheDocument();
    expect(screen.getByText(/v3 compliance copy/i)).toBeInTheDocument();
  });
});
