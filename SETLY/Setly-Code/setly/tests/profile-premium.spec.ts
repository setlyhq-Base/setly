import { test, expect } from '@playwright/test';

// Public profile route renders ProfileV2 in public-view mode.
const PUBLIC_PROFILE_URL = '/u/demo';

test.describe('Profile (Public View)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PUBLIC_PROFILE_URL);
  });

  test('shows header and navigation tabs', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /exit public view|public view/i })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Verification/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Your Data' })).toBeVisible();
  });

  test('switches sections via tabs', async ({ page }) => {
    await page.getByRole('button', { name: /Verification/i }).click();
    await expect(page.locator('app-verification-status')).toBeVisible();

    await page.getByRole('button', { name: 'Connections' }).click();
    await expect(page.locator('app-connections-list')).toBeVisible();
  });
});
