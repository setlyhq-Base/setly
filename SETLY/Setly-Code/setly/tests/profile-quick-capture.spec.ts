import { test, expect, Page } from '@playwright/test';

// Helper to enable E2E mock auth before app boot
const enableMockAuth = async (page: Page) => {
  await page.addInitScript(() => {
    // @ts-ignore
    window.__e2eMockAuth = {
      enabled: true,
      user: {
        uid: 'e2e-mock-uid',
        email: 'mock.user@setly.test',
        displayName: '', // force missing name so Quick Capture opens
        emailVerified: true
      }
    };
  });
};

test.describe('Quick Capture Modal – complete your profile', () => {
  test('fills required fields and saves profile (optimistic)', async ({ page }) => {
    await enableMockAuth(page);
    await page.goto('/auth/sign-in');

    // Trigger mocked Google sign-in
    const googleBtn = page.locator('[data-testid="btn-google"]');
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    // Quick Capture should open because name is missing
    const modal = page.locator('app-profile-quick-capture-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('#profileCaptureTitle')).toHaveText(/Complete Your Profile/i);

    // Fill Full Name
    await page.locator('input[name="displayName"]').fill('Jane Doe');

    // Ensure Student role (default), select a university
    const uniInput = modal.locator('app-university-search input[role="combobox"]');
    await uniInput.click();
    await uniInput.fill('Harvard');
    // Wait for suggestions and pick the first
    const firstSuggestion = modal.locator('#uni-listbox li').first();
    await firstSuggestion.waitFor({ state: 'visible' });
    await firstSuggestion.click();

    // Fill phone in intl input (local part; default dial +1)
    const phoneInput = modal.locator('app-intl-phone-input input[type="tel"]');
    await phoneInput.fill('4155552671');

    // Save button should appear now; click Save
    const saveBtn = modal.locator('button.primary', { hasText: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Modal closes and we navigate to home
    await expect(modal).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('Professional role: picks company and asserts payload via intercept', async ({ page }) => {
    await enableMockAuth(page);
    // Intercept PUT /api/users/me to assert payload and return a stubbed response
    await page.route('**/api/users/me', async (route) => {
      const req = route.request();
      expect(req.method()).toBe('PUT');
      const body: any = req.postDataJSON();
      expect(body.displayName).toBe('Jane Pro');
      expect(body.phone).toBe('+14155552671');
      expect(body.company).toBe('Apple');
      expect(body.companyId).toBe('apple');
      // Respond with merged profile snapshot
      const stub = {
        id: 'e2e-mock-uid',
        authUid: 'e2e-mock-uid',
        email: 'mock.user@setly.test',
        displayName: body.displayName,
        phone: body.phone,
        company: body.company,
        companyId: body.companyId,
        updatedAt: new Date().toISOString(),
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(stub) });
    });

    await page.goto('/auth/sign-in');
    const googleBtn = page.locator('[data-testid="btn-google"]');
    await expect(googleBtn).toBeVisible();
    await googleBtn.click();

    const modal = page.locator('app-profile-quick-capture-modal');
    await expect(modal).toBeVisible();

    // Switch to Professional role
    const professionalRadio = modal.locator('label', { hasText: 'Working professional' });
    await professionalRadio.click();

    // Fill Full Name
    await modal.locator('input[name="displayName"]').fill('Jane Pro');

    // Pick a company (Apple)
    const companyInput = modal.locator('app-company-search input[role="combobox"], app-company-search input[type="text"]');
    await companyInput.click();
    await companyInput.fill('Apple');
    const firstSuggestion = modal.locator('app-company-search ul li').first();
    await firstSuggestion.waitFor({ state: 'visible' });
    await firstSuggestion.click();

    // Phone
    const phoneInput = modal.locator('app-intl-phone-input input[type="tel"]');
    await phoneInput.fill('4155552671');

    // Save should now be visible and enabled
    const saveBtn = modal.locator('button.primary', { hasText: 'Save' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Modal closes; navigation proceeds
    await expect(modal).toBeHidden();
  });
});
