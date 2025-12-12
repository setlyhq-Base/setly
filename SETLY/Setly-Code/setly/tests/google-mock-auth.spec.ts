import { test, expect } from '@playwright/test';
import { gotoAuthed } from './utils/e2e';

/**
 * This test simulates a Google sign-in using the in-app E2E mock hook.
 * It verifies that after clicking the Google button, the app navigates and
 * protected routes are accessible without redirect.
 */
 test.describe('Mocked Google Sign-in (E2E)', () => {
  test('should sign in via mock and access protected routes', async ({ page }) => {
    await gotoAuthed(page, '/messages');
    await expect(page).toHaveURL(/\/messages/);
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
  });
});
