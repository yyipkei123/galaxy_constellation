import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { AppStateProvider, useAppState } from '@/store/app-store';
import { AppShell } from './app-shell';
import { TopBar } from './top-bar';

let mockPathname = '/';

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

function QuarterProbe() {
  const { selectedQuarterId } = useAppState();

  return <output aria-label="selected quarter">{selectedQuarterId}</output>;
}

function setClipboard(value: { writeText: ReturnType<typeof vi.fn> } | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value,
  });
}

function installExecCommand() {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: vi.fn(),
  });
}

describe('TopBar', () => {
  beforeEach(() => {
    mockPathname = '/';
    setClipboard(undefined);
    installExecCommand();
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

    expect(screen.getByText('Wallet intelligence cockpit')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Wallet intelligence cockpit' })).not.toBeInTheDocument();
    expect(screen.getByRole('banner')).not.toHaveTextContent(/Galaxy first-party/i);
    expect(screen.getByText('7 CDE metrics - Modelled')).toBeInTheDocument();
    expect(screen.queryByLabelText('Galaxy Macau and Mastercard data partnership')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Open CDE signal guide/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: /Lens switch/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Presenter mode' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy narrative' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Quarter selector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'true');
  });

  it.each([
    ['/', 'Wallet intelligence cockpit'],
    ['/journey', 'Guest journey'],
    ['/wallet', 'Wallet split'],
    ['/marketscan', 'Market scan'],
    ['/corridors', 'Source-market corridors'],
    ['/acquisition', 'Priority corridor acquisition'],
  ])('maps %s to the prototype shell title %s', (pathname, expectedTitle) => {
    mockPathname = pathname;

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent(expectedTitle);
    expect(screen.getByText(expectedTitle)).toBeInTheDocument();
  });

  it('opens a global CDE signal guide from the top bar', () => {
    mockPathname = '/corridors';

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
    mockPathname = '/corridors';

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
    mockPathname = '/corridors';

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
    mockPathname = '/corridors';

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

    expect(screen.getByText('7 CDE metrics - Modelled')).toHaveAttribute('aria-label', '7 active CDE metrics - Modelled');
    expect(screen.getByRole('group', { name: /quarter selector/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('updates the selected reporting quarter from the accessible segmented selector', async () => {
    render(
      <AppStateProvider>
        <TopBar />
        <QuarterProbe />
      </AppStateProvider>,
    );

    expect(screen.getByLabelText('selected quarter')).toHaveTextContent('2026-q2');

    fireEvent.click(screen.getByRole('button', { name: '2026 Q1' }));

    expect(screen.getByRole('button', { name: '2026 Q1' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '2026 Q2' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('selected quarter')).toHaveTextContent('2026-q1');
  });

  it('copies a CDE-safe executive narrative with the Clipboard API', async () => {
    mockPathname = '/corridors';
    const writeText = vi.fn().mockResolvedValue(undefined);
    const execCommand = vi.spyOn(document, 'execCommand');
    setClipboard({ writeText });

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
    expect(execCommand).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent('Narrative copied');
  });

  it('falls back to a temporary textarea when the Clipboard API rejects', async () => {
    mockPathname = '/corridors';
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const execCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    setClipboard({ writeText });

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
    expect(document.querySelector('textarea')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Narrative copied');
  });

  it('falls back to a temporary textarea when the Clipboard API is missing', async () => {
    mockPathname = '/corridors';
    const execCommand = vi.spyOn(document, 'execCommand').mockReturnValue(true);
    setClipboard(undefined);

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
    expect(document.querySelector('textarea')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Narrative copied');
  });

  it('reports copy unavailable when Clipboard API and fallback copy both fail', async () => {
    mockPathname = '/corridors';
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.spyOn(document, 'execCommand').mockReturnValue(false);
    setClipboard({ writeText });

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status')).toHaveTextContent('Copy unavailable in this preview');
  });

  it('reports copy unavailable when textarea fallback throws', async () => {
    mockPathname = '/corridors';
    vi.spyOn(document, 'execCommand').mockImplementation(() => {
      throw new Error('blocked');
    });
    setClipboard(undefined);

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy unavailable in this preview'));
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('keeps copied narrative CDE-safe when falling back after Clipboard API rejection', async () => {
    mockPathname = '/corridors';
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const execCommand = vi.spyOn(document, 'execCommand').mockImplementation(() => {
      const activeElement = document.activeElement;
      expect(activeElement).toBeInstanceOf(HTMLTextAreaElement);
      expect((activeElement as HTMLTextAreaElement).value).toContain('Galaxy Constellation combines Galaxy first-party behavior with Mastercard CDE');
      expect((activeElement as HTMLTextAreaElement).value).not.toMatch(/\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣/i);
      return true;
    });
    setClipboard({ writeText });

    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Copy narrative' }));

    await waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
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
    mockPathname = '/corridors';

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

    expect(screen.getByRole('banner')).toHaveTextContent('Wallet intelligence cockpit');
    expect(screen.queryByRole('button', { name: 'Copy narrative' })).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });

  it('uses a non-heading prototype title without hybrid presenter controls', () => {
    render(
      <AppStateProvider>
        <TopBar />
      </AppStateProvider>,
    );

    expect(screen.getByRole('banner')).toHaveTextContent('Wallet intelligence cockpit');
    expect(screen.getByText('Wallet intelligence cockpit')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Wallet intelligence cockpit' })).not.toBeInTheDocument();

    expect(screen.queryByRole('button', { name: 'Presenter mode' })).not.toBeInTheDocument();
    expect(screen.queryByText('Presenter')).not.toBeInTheDocument();
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

    expect(contentColumn).toHaveClass('pb-0');
    expect(main).toHaveClass('min-w-0');
    expect(main).toHaveClass('flex-1');
    expect(main).toHaveClass('px-3');
    expect(main).toHaveClass('py-[26px]');
    expect(main).toHaveClass('md:px-[28px]');
    expect(main).toHaveClass('pb-[120px]');
    expect(main).not.toHaveClass('pb-24');
    expect(main).not.toHaveClass('lg:pb-6');
    expect(container.textContent).not.toMatch(/HKD|MOP|\$|元|澳門幣/i);
  });
});
