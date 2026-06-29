import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import { latestQuarter, latestSegments, methodology } from '@/data';
import { DecisionWorkspace } from './decision-workspace';

const bannedCdeDisplayPattern = /\b(?:HKD|MOP)(?=\b|[\s\d$.,:;/-])|\$|元|澳門幣|raw[-\s]?spend|exact\s+spend/i;

function expectCdeSafeOutput(container: HTMLElement) {
  expect(container.textContent).not.toMatch(bannedCdeDisplayPattern);
  container.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      expect(attribute.value).not.toMatch(bannedCdeDisplayPattern);
    });
  });
}

function renderWorkspace(selectedSegmentId = 'cosmopolitan-connoisseurs') {
  const onSelectedSegmentChange = vi.fn();
  const result = render(
    <DecisionWorkspace
      methodology={methodology}
      quarter={latestQuarter}
      segments={latestSegments}
      selectedSegmentId={selectedSegmentId}
      onSelectedSegmentChange={onSelectedSegmentChange}
    />,
  );

  return { ...result, onSelectedSegmentChange };
}

describe('DecisionWorkspace', () => {
  it('renders the labelled workspace, accessible tabs, and tab panels without a nested main', () => {
    const { container } = renderWorkspace();

    expect(screen.getByRole('region', { name: 'Decision workspace' })).toBeInTheDocument();
    expect(screen.queryByRole('main')).not.toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: 'Dashboard workspace tabs' });
    const tabs = within(tablist).getAllByRole('tab');

    expect(tabs).toHaveLength(5);
    expect(screen.getByRole('tab', { name: /Opportunity/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Opportunity' })).toBeInTheDocument();

    for (const panelName of ['Opportunity map', 'Category capture', 'Audience ranking', 'Campaign action', 'Ranking evidence']) {
      const tab = tabs.find((item) => {
        const panel = document.getElementById(item.getAttribute('aria-controls') ?? '');

        return panel?.getAttribute('aria-label') === panelName;
      });
      const panel = document.getElementById(tab?.getAttribute('aria-controls') ?? '');

      expect(tab).toBeDefined();
      expect(panel).toHaveAttribute('role', 'tabpanel');
      expect(panel).toHaveAttribute('aria-labelledby', tab?.id);
    }

    fireEvent.click(screen.getByRole('tab', { name: /Workbench/i }));

    expect(screen.getByRole('tab', { name: /Workbench/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Workbench' })).toBeInTheDocument();
    expectCdeSafeOutput(container);
  });

  it('updates the selected finding and assistant state when a constellation star is selected', () => {
    const { container, onSelectedSegmentChange } = renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i }));

    expect(screen.getByRole('button', { name: /Select Aspiring Mass-Affluent/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText(/Selected audience: Aspiring Mass-Affluent/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Aspiring Mass-Affluent');
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Audience selection updated');
    expect(onSelectedSegmentChange).toHaveBeenCalledWith('aspiring-mass-affluent');
    expectCdeSafeOutput(container);
  });

  it('falls back to the top segment when the selected segment id is stale', () => {
    const { container } = renderWorkspace('missing-segment-id');

    expect(screen.getByRole('button', { name: /Select Cosmopolitan Connoisseurs/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getAllByText(/Selected audience: Cosmopolitan Connoisseurs/i).length).toBeGreaterThan(0);
    expectCdeSafeOutput(container);
  });

  it('filters segment priority board and announces the live status', () => {
    const { container } = renderWorkspace();

    fireEvent.click(screen.getByRole('tab', { name: /Segments/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Watch' }));

    expect(screen.getByRole('button', { name: 'Watch' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status', { name: 'Segment filter status' })).toHaveTextContent(/watch audience/i);
    expect(screen.getByRole('button', { name: 'All segments' })).toHaveAttribute('aria-pressed', 'false');
    expectCdeSafeOutput(container);
  });

  it('builds an audience brief and keeps generated assistant copy CDE-safe', () => {
    const { container } = renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: /Build audience brief/i }));

    expect(screen.getByRole('tab', { name: /Activation/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Activation' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Audience brief built');
    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Audience brief ready');
    expectCdeSafeOutput(container);
  });

  it('validates assistant prompts and supports deterministic quick prompts', () => {
    const { container } = renderWorkspace();
    const assistant = screen.getByLabelText('Ask CDE AI');
    const prompt = within(assistant).getByRole('textbox', { name: /CDE assistant prompt/i });

    fireEvent.change(prompt, { target: { value: '' } });
    fireEvent.click(within(assistant).getByRole('button', { name: /Generate answer/i }));

    expect(prompt).toHaveAttribute('aria-invalid', 'true');
    expect(assistant).toHaveTextContent('Prompt required');

    fireEvent.click(within(assistant).getByRole('button', { name: 'Why trust it?' }));

    expect(prompt).toHaveAttribute('aria-invalid', 'false');
    expect(prompt).toHaveValue('Why should Galaxy trust this CDE answer?');
    expect(assistant).toHaveTextContent('Trust rationale');
    expect(assistant).toHaveTextContent('Governance answer ready');
    expectCdeSafeOutput(container);
  });

  it('surfaces copy fallback status when clipboard access is unavailable', () => {
    const { container } = renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Copy answer' }));

    expect(screen.getByLabelText('Ask CDE AI')).toHaveTextContent('Copy unavailable');
    expectCdeSafeOutput(container);
  });
});
