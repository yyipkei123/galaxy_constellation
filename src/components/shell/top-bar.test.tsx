import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { AppStateProvider, useAppState } from '@/store/app-store';
import { AppShell } from './app-shell';
import { TopBar } from './top-bar';

let mockPathname = '/wallet';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

function StoreContractProbe() {
  const state = useAppState();

  return (
    <output aria-label="store contract">
      {[
        Array.isArray(state.filters.segmentIds),
        typeof state.setFilters,
        typeof state.pushCampaign,
        typeof state.clearCampaignToast,
      ].join('|')}
    </output>
  );
}

const externalSegmentIds = ['diamond-high-rollers'];

function StoreBehaviorProbe() {
  const {
    campaignToast,
    clearCampaignToast,
    filters,
    pushCampaign,
    saveAudience,
    savedAudiences,
    setFilters,
  } = useAppState();

  return (
    <div>
      <output aria-label="filters">{`${filters.channel}|${filters.minPropensity}|${filters.segmentIds.join(',')}`}</output>
      <output aria-label="saved audiences">{savedAudiences.map((audience) => (
        `${audience.id}:${audience.name}:${audience.segmentIds.join(',')}`
      )).join('|')}</output>
      <output aria-label="campaign toast">{campaignToast ? `${campaignToast.title}|${campaignToast.description}` : 'none'}</output>
      <button
        type="button"
        onClick={() => setFilters((current) => ({
          ...current,
          channel: 'online',
          minPropensity: 0.72,
        }))}
      >
        Update filters
      </button>
      <button type="button" onClick={() => setFilters({
        segmentIds: externalSegmentIds,
        channel: 'hybrid',
        minPropensity: 0.5,
      })}>
        Use external filters
      </button>
      <button type="button" onClick={() => saveAudience('Priority CDE Audience')}>
        Save audience
      </button>
      <button type="button" onClick={() => {
        externalSegmentIds.push('mutated-after-save');
        pushCampaign({ title: 'Audience pushed', description: 'Sent to activation queue' });
      }}>
        Mutate and push
      </button>
      <button type="button" onClick={clearCampaignToast}>
        Clear campaign
      </button>
    </div>
  );
}

describe('TopBar', () => {
  beforeEach(() => {
    mockPathname = '/wallet';
  });

  afterEach(() => {
    externalSegmentIds.splice(0, externalSegmentIds.length, 'diamond-high-rollers');
    vi.restoreAllMocks();
  });

  it('shows cockpit metadata and defaults the segmented quarter selector to Q2 2026', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Executive wallet intelligence cockpit');
    expect(screen.getByText('7 CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('Coverage 63%')).toBeInTheDocument();
    expect(screen.getByLabelText('Galaxy Macau and Mastercard data partnership')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open CDE signal guide/i })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /Quarter selector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens a global CDE signal guide from the top bar', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Open CDE signal guide/i }));

    const guide = screen.getByRole('dialog', { name: 'CDE signal guide' });
    expect(guide).toBeInTheDocument();
    expect(guide).toHaveTextContent('100 = matched Galaxy x Mastercard cohort baseline');
    expect(guide).toHaveTextContent('Above 100 = stronger demand or opportunity');
    expect(guide).toHaveTextContent('Below 100 = weaker than baseline');
    expect(guide).toHaveTextContent('Not customer count, spend amount, match rate, or exact wallet value');
    expect(guide).toHaveTextContent('Low signal');
    expect(guide).toHaveTextContent('High recapture priority');

    fireEvent.click(screen.getByRole('button', { name: /Close CDE signal guide/i }));
    expect(screen.queryByRole('dialog', { name: 'CDE signal guide' })).not.toBeInTheDocument();
  });

  it('mounts the CDE signal guide outside the header layout', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Open CDE signal guide/i }));

    const guide = screen.getByRole('dialog', { name: 'CDE signal guide' });
    expect(guide.closest('header')).toBeNull();
  });

  it('moves focus into the CDE signal guide and restores it when closed', async () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    const launcher = screen.getByRole('button', { name: /Open CDE signal guide/i });
    launcher.focus();
    expect(launcher).toHaveFocus();

    fireEvent.click(launcher);

    const guide = screen.getByRole('dialog', { name: 'CDE signal guide' });
    const closeButton = within(guide).getByRole('button', { name: /Close CDE signal guide/i });
    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(guide, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'CDE signal guide' })).not.toBeInTheDocument();
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it('keeps tab focus inside the CDE signal guide while open', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /Open CDE signal guide/i }));

    const guide = screen.getByRole('dialog', { name: 'CDE signal guide' });
    const closeButton = within(guide).getByRole('button', { name: /Close CDE signal guide/i });

    closeButton.focus();
    const tabEvent = fireEvent.keyDown(guide, { key: 'Tab' });
    expect(tabEvent).toBe(false);
    expect(closeButton).toHaveFocus();

    const shiftTabEvent = fireEvent.keyDown(guide, { key: 'Tab', shiftKey: true });
    expect(shiftTabEvent).toBe(false);
    expect(closeButton).toHaveFocus();
  });

  it('renders compact mobile metadata without losing the full accessible metric text', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByText('7 CDE metrics')).toBeInTheDocument();
    expect(screen.getByText('7 CDE metrics')).toHaveAttribute('aria-label', '7 active CDE metrics');
    expect(screen.getByText('Coverage 63%')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /quarter selector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates the selected reporting quarter from the accessible segmented selector', async () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: '2026 Q1' }));

    expect(screen.getByRole('button', { name: '2026 Q1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('copies a CDE-safe executive narrative for the selected segment', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('Galaxy Constellation combines Galaxy first-party behavior with Mastercard CDE');
    expect(writeText.mock.calls[0][0]).toContain('2026 Q2');
    expect(writeText.mock.calls[0][0]).not.toMatch(/\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i);
    expect(screen.getByRole('status')).toHaveTextContent('Narrative copied');
  });

  it('exposes the spec app-state action names for downstream tasks', () => {
    render(
      <AppStateProvider>
        <StoreContractProbe />
      </AppStateProvider>,
    );

    expect(screen.getByLabelText('store contract')).toHaveTextContent('true|function|function|function');
  });

  it('updates filters through a React-style setter callback', () => {
    render(
      <AppStateProvider>
        <StoreBehaviorProbe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Update filters' }));

    expect(screen.getByLabelText('filters')).toHaveTextContent('online|0.72|');
  });

  it('replaces duplicate saved audience ids and stores segment ids as a snapshot clone', () => {
    vi.spyOn(Date, 'now').mockReturnValue(2000);

    render(
      <AppStateProvider>
        <StoreBehaviorProbe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Use external filters' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save audience' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save audience' }));
    fireEvent.click(screen.getByRole('button', { name: 'Mutate and push' }));

    expect(screen.getByLabelText('saved audiences')).toHaveTextContent(
      '2000-priority-cde-audience:Priority CDE Audience:diamond-high-rollers',
    );
    expect(screen.getByLabelText('saved audiences').textContent?.split('|')).toHaveLength(1);
    expect(screen.getByLabelText('saved audiences')).not.toHaveTextContent('mutated-after-save');
  });

  it('pushes and clears campaign toast state', () => {
    render(
      <AppStateProvider>
        <StoreBehaviorProbe />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mutate and push' }));

    expect(screen.getByLabelText('campaign toast')).toHaveTextContent(
      'Audience pushed|Sent to activation queue',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear campaign' }));

    expect(screen.getByLabelText('campaign toast')).toHaveTextContent('none');
  });

  it('renders the lens switch beside methodology metadata', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('navigation', { name: /Lens switch/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Wallet Retention/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Corridors Acquisition/i })).toHaveAttribute('href', '/corridors');
  });

  it('describes the current CDE snapshot without adding currency text', () => {
    const { container } = render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Executive wallet intelligence cockpit');
    expect(screen.getByRole('button', { name: 'Copy narrative' })).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('keeps fixed assistant bottom clearance after the footer instead of inside main', () => {
    const { container } = render(
      <AppStateProvider>
        <AppShell>
          <section>Route content</section>
        </AppShell>
      </AppStateProvider>,
    );

    const main = screen.getByText('Route content').closest('main');
    const contentColumn = main?.parentElement;

    expect(contentColumn).toHaveClass('pb-24');
    expect(contentColumn).toHaveClass('lg:pb-0');
    expect(main).toHaveClass('min-w-0');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('px-3');
    expect(main).toHaveClass('py-[18px]');
    expect(main).toHaveClass('sm:px-5');
    expect(main).toHaveClass('md:px-[26px]');
    expect(main).not.toHaveClass('pb-24');
    expect(main).not.toHaveClass('lg:pb-6');
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
