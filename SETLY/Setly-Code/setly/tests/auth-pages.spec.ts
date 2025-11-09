import { test, expect } from '@playwright/test';

// NOTE: Real Google OAuth popup flows are not executed in E2E due to cross-origin + manual interaction.
// We limit tests to UI presence, navigation, and guard redirect behavior.

test.describe('Auth Pages', () => {
  test('sign-in page renders provider buttons', async ({ page }) => {
    await page.goto('/auth/sign-in');
    await expect(page.locator('[data-testid="auth-title"]')).toHaveText(/Sign in/i);
    await expect(page.locator('[data-testid="btn-google"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-microsoft"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-facebook"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-phone"]')).toBeVisible();
  });

  test('navigate from sign in to sign up', async ({ page }) => {
    await page.goto('/auth/sign-in');
    const link = page.locator('a', { hasText: 'Sign Up' });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/auth\/sign-up/);
  });

  test('sign-up page shows create account affordances', async ({ page }) => {
    await page.goto('/auth/sign-up');
    await expect(page.locator('h2')).toContainText(/Create/i);
    // Social buttons reused
    await expect(page.locator('[data-testid="btn-google"]')).toBeVisible();
  });

  test('unauthenticated guard redirect preserves next param', async ({ page }) => {
    await page.goto('/messages');
    await expect(page).toHaveURL(/auth\/sign-in\?next=%2Fmessages/);
  });

  test('browse requires auth (redirect)', async ({ page }) => {
    await page.goto('/browse');
    await expect(page).toHaveURL(/auth\/sign-in/);
  });
});

// Placeholder skipped test for future mocked Google sign-in flow.
test.skip('mocked Google sign-in flow (to be implemented with Firebase emulator)', async ({ page }) => {
  await page.goto('/auth/sign-in');
  // Implementation will inject a stub for window.open / firebase auth provider.
});
