import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { getCorridorById, type CampaignCreativeVariant } from '@/data';
import { buildAcquisitionDraft } from '@/lib/acquisition-content';
import { ContentDraftCard } from './content-draft-card';

describe('ContentDraftCard', () => {
  it('renders language tabs, selected-language variants, guardrails, and version history', () => {
    const corridor = getCorridorById('korea');
    const draft = buildAcquisitionDraft(corridor, 'entertainment_lover');
    const variants = draft.variants as CampaignCreativeVariant[];
    const englishVariant = variants.find((variant) => variant.language === 'EN' && variant.id === 'A');
    const koreanVariant = variants.find((variant) => variant.language === '한국어' && variant.id === 'A');

    if (!englishVariant || !koreanVariant) {
      throw new Error('Expected EN and Korean variant A drafts');
    }

    render(<ContentDraftCard draft={draft} />);

    expect(screen.getByRole('heading', { name: /Content draft/i })).toBeInTheDocument();
    expect(screen.getByText(/No live model call/i)).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: /Draft language/i });
    expect(within(tablist).getAllByRole('tab')).toHaveLength(3);
    expect(within(tablist).getByRole('tab', { name: 'EN' })).toHaveAttribute('aria-selected', 'true');
    expect(within(tablist).getByRole('tab', { name: '繁中' })).toHaveAttribute('aria-selected', 'false');
    expect(within(tablist).getByRole('tab', { name: '한국어' })).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByRole('heading', { name: englishVariant.subject })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: koreanVariant.subject })).not.toBeInTheDocument();
    expect(screen.getByText(/Variant A/i)).toBeInTheDocument();
    expect(screen.getByText(/Variant B/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Brand voice/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/v4 measurement-ready launch/i)).toBeInTheDocument();

    fireEvent.click(within(tablist).getByRole('tab', { name: '한국어' }));

    expect(within(tablist).getByRole('tab', { name: 'EN' })).toHaveAttribute('aria-selected', 'false');
    expect(within(tablist).getByRole('tab', { name: '한국어' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: koreanVariant.subject })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: englishVariant.subject })).not.toBeInTheDocument();
  });

  it('shows launch action only when supplied and calls it once per click', () => {
    const draft = buildAcquisitionDraft(getCorridorById('korea'), 'entertainment_lover');
    const onLaunch = vi.fn();
    const { rerender } = render(<ContentDraftCard draft={draft} />);

    expect(screen.queryByRole('button', { name: /Launch campaign/i })).not.toBeInTheDocument();

    rerender(<ContentDraftCard draft={draft} onLaunch={onLaunch} />);
    fireEvent.click(screen.getByRole('button', { name: /Launch campaign/i }));

    expect(onLaunch).toHaveBeenCalledTimes(1);
  });
});
