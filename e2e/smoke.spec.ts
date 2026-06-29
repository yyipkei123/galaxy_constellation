import { expect, test } from '@playwright/test';

test('renders the Open Design overview dashboard', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Find the wallet gap Galaxy can win next/i })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Decision workspace' })).toBeVisible();
});
