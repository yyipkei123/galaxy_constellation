import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

  it('uses valid safe-area calc syntax for the fixed launcher position', () => {
    render(<PresenterTour />);

    const launcher = screen.getByRole('button', { name: 'Open presenter tour' });
    expect(launcher).toHaveClass('bottom-[calc(env(safe-area-inset-bottom)_+_0.875rem)]');
    expect(launcher).toHaveClass('lg:bottom-[calc(env(safe-area-inset-bottom)_+_1rem)]');
  });

  it('moves focus inside the dialog when opened', () => {
    render(<PresenterTour />);

    const launcher = screen.getByRole('button', { name: 'Open presenter tour' });
    launcher.focus();
    expect(launcher).toHaveFocus();

    fireEvent.click(launcher);

    const dialog = screen.getByRole('dialog', { name: 'Presenter tour' });
    const closeButton = within(dialog).getByRole('button', { name: 'Close presenter tour' });

    expect(dialog).toContainElement(document.activeElement);
    expect(closeButton).toHaveFocus();
  });

  it('closes with Escape and restores focus to the launcher', async () => {
    render(<PresenterTour />);

    const launcher = screen.getByRole('button', { name: 'Open presenter tour' });
    launcher.focus();

    fireEvent.click(launcher);

    const dialog = screen.getByRole('dialog', { name: 'Presenter tour' });
    fireEvent.keyDown(dialog, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Presenter tour' })).not.toBeInTheDocument();
    expect(launcher).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(launcher).toHaveFocus());
  });

  it('cycles Tab and Shift+Tab within dialog controls', () => {
    render(<PresenterTour />);

    fireEvent.click(screen.getByRole('button', { name: 'Open presenter tour' }));

    const dialog = screen.getByRole('dialog', { name: 'Presenter tour' });
    const iconCloseButton = within(dialog).getByRole('button', { name: 'Close presenter tour' });
    const nextButton = within(dialog).getByRole('button', { name: 'Next stop' });

    iconCloseButton.focus();
    const shiftTabEvent = fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(shiftTabEvent).toBe(false);
    expect(nextButton).toHaveFocus();

    const tabEvent = fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(tabEvent).toBe(false);
    expect(iconCloseButton).toHaveFocus();
  });
});
