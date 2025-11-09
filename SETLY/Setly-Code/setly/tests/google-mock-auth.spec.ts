import { test, expect, Page } from '@playwright/test';

// Inject mock auth flag before any app scripts run
const enableMockAuth = async (page: Page) => {
  await page.addInitScript(() => {
    // @ts-ignore
    window.__e2eMockAuth = {
      enabled: true,
      user: {
        uid: 'e2e-mock-uid',
        email: 'mock.user@setly.test',
        displayName: 'E2E Mock User',
        emailVerified: true
      }
    };
  });
};

/**
 * This test simulates a Google sign-in using the in-app E2E mock hook.
 * It verifies that after clicking the Google button, the app navigates and
 * protected routes are accessible without redirect.
 */
 test.describe('Mocked Google Sign-in (E2E)', () => {
  test('should sign in via mock and access protected routes', async ({ page }) => {
    await enableMockAuth(page);
    await page.goto('/auth/sign-in');

    // Click the Google provider button
    const googleBtn = page.locator('[data-testid="btn-google"]');
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    // After sign-in handler, the page should navigate to home
    await expect(page).toHaveURL(/\/$/);

    // Protected route should be accessible without redirect to auth
    await page.goto('/browse');
    await expect(page).not.toHaveURL(/auth\/sign-in/);
  });
});
