import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { PresenterTour } from './presenter-tour';

describe('PresenterTour', () => {
  it('opens a deterministic presenter tour and advances through the required stops', () => {
    const expectedStops = [
      ['1 of 9', 'Journey', 'Route: /journey'],
      ['2 of 9', 'Overview', 'Route: /'],
      ['3 of 9', 'Wallet', 'Route: /wallet'],
      ['4 of 9', 'Segments', 'Route: /segments'],
      ['5 of 9', 'Guests', 'Route: /guests'],
      ['6 of 9', 'Audience', 'Route: /propensity'],
      ['7 of 9', 'Activation', 'Route: /activation'],
      ['8 of 9', 'Measurement', 'Route: /measurement'],
      ['9 of 9', 'Governance', 'Route: /governance'],
    ];

    render(<PresenterTour />);

    const launcher = screen.getByRole('button', { name: 'Open presenter tour' });
    expect(launcher).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(launcher);

    const dialog = screen.getByRole('dialog', { name: 'Presenter tour' });
    expect(launcher).toHaveAttribute('aria-expanded', 'true');

    expectedStops.forEach(([count, title, route], index) => {
      if (index > 0) {
        fireEvent.click(within(dialog).getByRole('button', { name: 'Next stop' }));
      }

      expect(within(dialog).getByText(count)).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { name: title })).toBeInTheDocument();
      expect(within(dialog).getByText(route)).toBeInTheDocument();
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
