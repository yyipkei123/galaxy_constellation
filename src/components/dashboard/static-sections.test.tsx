import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology } from '@/data';
import { BoardroomBrief } from './boardroom-brief';
import { DashboardHero } from './dashboard-hero';
import { ExecutiveMetrics } from './executive-metrics';
import { buildBoardroomBrief, buildExecutiveMetrics, getTopSegment } from './open-design-view-model';
import { ReadingGuide } from './reading-guide';

const bannedDisplayCopy = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|NaN|Infinity|raw[-\s]?spend|exact\s+spend/i;

function expectCdeSafeOutput(container: HTMLElement) {
  expect(container.textContent).not.toMatch(bannedDisplayCopy);
}

describe('Open Design static overview sections', () => {
  it('renders the reading guide strip and calls the requested jump targets', () => {
    const onJump = vi.fn();

    render(<ReadingGuide onJump={onJump} />);

    const guide = screen.getByRole('region', { name: 'How to read Galaxy Constellation' });
    expect(guide).toHaveClass('galaxy-glass-panel');
    expect(within(guide).getByRole('heading', {
      name: /Start with the ranking, then prove the reason, then build the campaign/i,
    })).toBeInTheDocument();

    fireEvent.click(within(guide).getByRole('button', { name: /Open analytics workbench/i }));
    fireEvent.click(within(guide).getByRole('button', { name: /Jump to campaign action/i }));

    expect(onJump).toHaveBeenNthCalledWith(1, 'workbench');
    expect(onJump).toHaveBeenNthCalledWith(2, 'activation');
  });

  it('renders a derived boardroom answer with the audience proof move stack', () => {
    const topSegment = getTopSegment(latestSegments);
    const brief = buildBoardroomBrief(latestQuarter, topSegment);

    const { container } = render(<BoardroomBrief quarter={latestQuarter} segment={topSegment} />);

    const region = screen.getByRole('region', { name: 'Boardroom answer' });
    expect(region).toHaveClass('galaxy-glass-panel');
    expect(within(region).getByText('Boardroom answer')).toBeInTheDocument();
    expect(within(region).getByRole('heading', { name: brief.headline })).toBeInTheDocument();
    expect(within(region).getByText(brief.description)).toBeInTheDocument();
    expect(within(region).getByText('Audience')).toBeInTheDocument();
    expect(within(region).getByText(brief.audience)).toBeInTheDocument();
    expect(within(region).getByText('Proof')).toBeInTheDocument();
    expect(within(region).getByText(brief.proof)).toBeInTheDocument();
    expect(within(region).getByText('Move')).toBeInTheDocument();
    expect(within(region).getByText(brief.move)).toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('keeps the boardroom answer finite when inputs are missing', () => {
    const { container } = render(<BoardroomBrief quarter={null} segment={undefined} />);

    expect(screen.getByRole('heading', {
      name: 'No active quarter: hold activation until CDE segment coverage is ready.',
    })).toBeInTheDocument();
    expect(screen.getByText('Governed audience activation')).toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('renders the hero and Mastercard CDE refresh ring without a nested main landmark', () => {
    const { container } = render(<DashboardHero methodology={methodology} quarter={latestQuarter} />);

    expect(screen.getByRole('region', { name: 'Guest wallet intelligence hero' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Mastercard CDE refresh' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: `${latestQuarter.label} snapshot` })).toBeInTheDocument();
    expect(screen.getByLabelText(`${methodology.matchedCoveragePct} percent matched CDE coverage`)).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('renders the four derived executive metric cards', () => {
    const metrics = buildExecutiveMetrics(latestSegments, methodology);
    const { container } = render(<ExecutiveMetrics methodology={methodology} segments={latestSegments} />);

    const summary = screen.getByRole('region', { name: 'Executive summary' });
    expect(summary).toHaveClass('grid');
    expect(within(summary).getAllByRole('article')).toHaveLength(4);

    metrics.forEach((metric) => {
      const card = within(summary).getByText(metric.label).closest('article');
      expect(card).not.toBeNull();
      expect(card).toHaveClass('galaxy-glass-panel');
      expect(within(card as HTMLElement).getByText(metric.value)).toBeInTheDocument();
      expect(within(card as HTMLElement).getByText(metric.detail)).toBeInTheDocument();
      expect(within(card as HTMLElement).getByText(metric.delta)).toBeInTheDocument();
    });
    expectCdeSafeOutput(container);
  });
});
