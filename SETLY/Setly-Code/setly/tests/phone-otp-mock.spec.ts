import { test, expect, Page } from '@playwright/test';

// This test relies on the dev feature flag environment.featureFlags.mockPhoneAuth = true
// It exercises the in-app mocked phone auth flow (code 123456)

test.describe('Mocked Phone OTP (dev only)', () => {
  test('should verify phone via mock and proceed to profile wizard', async ({ page }) => {
    await page.goto('/auth/sign-in');

    // Open the phone modal
    const phoneBtn = page.locator('[data-testid="btn-phone"]');
    await expect(phoneBtn).toBeVisible();
    await phoneBtn.click();

    // Enter a phone (format can be freeform, service normalizes to E.164)
    const phoneInput = page.getByRole('textbox', { name: /phone number/i });
    await expect(phoneInput).toBeVisible();
    await phoneInput.fill('5550001234');

    // Send code
    const sendBtn = page.locator('[data-testid="btn-phone"]');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Wait until code step appears (look for one otp input)
    const firstOtp = page.locator('[data-testid="otp-input-1"]');
    await expect(firstOtp).toBeVisible();

    // Fill 6-digit mock code: 123456
    for (let i = 1; i <= 6; i++) {
      const box = page.locator(`[data-testid="otp-input-${i}"]`);
      await box.fill(String(i % 10));
    }

    // Click Verify
    const verifyBtn = page.getByRole('button', { name: /verify/i });
    await verifyBtn.click();

    // After success, we navigate to profile wizard
    await expect(page).toHaveURL(/\/profile\/wizard/);
  });
});
