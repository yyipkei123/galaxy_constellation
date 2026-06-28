import { fireEvent, render, screen, within } from '@testing-library/react';
import { PresenterTour } from './presenter-tour';

describe('PresenterTour', () => {
  it('opens a deterministic presenter tour and advances through the required stops', () => {
    render(<PresenterTour />);

    const launcher = screen.getByRole('button', { name: 'Open presenter tour' });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(launcher);

    const dialog = screen.getByRole('dialog', { name: 'Presenter tour' });
    expect(launcher).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByText('1 of 5')).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Overview' })).toBeInTheDocument();

    [
      ['2 of 5', 'Segments'],
      ['3 of 5', 'Guests'],
      ['4 of 5', 'Measurement'],
      ['5 of 5', 'Governance'],
    ].forEach(([count, title]) => {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Next stop' }));
      expect(within(dialog).getByText(count)).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: title })).toBeInTheDocument();
    });

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));

    expect(screen.queryByRole('dialog', { name: 'Presenter tour' })).not.toBeInTheDocument();
    expect(launcher).toHaveAccessibleName('Open presenter tour');
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
  });
});
