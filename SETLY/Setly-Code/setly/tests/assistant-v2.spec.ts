import { test, expect } from '@playwright/test';

// V2 housing flow E2E

test.describe('Assistant V2 Housing Playbook', () => {
  test('housing playbook end-to-end emits room cards', async ({ page }) => {
    await page.goto('/');

    // Open widget (may auto-open after idle; force open if closed)
    const launcher = page.getByTestId('assistant-launcher');
    if (await launcher.isVisible()) {
      await launcher.click();
    } else {
      // wait for possible auto-open
      await page.waitForSelector('[data-testid="assistant-modal"]', { timeout: 12000 });
    }

    // Start housing playbook
    const playbookStart = page.getByTestId('assistant-playbook-housing');
    await expect(playbookStart).toBeVisible();
    await playbookStart.click();

    // Step 1 university chips
    await expect(page.getByTestId('assistant-quick-replies')).toBeVisible();
    await page.getByTestId('assistant-chip-uni-usc').click();

    // Step 2 budget
    await page.getByTestId('assistant-chip-budget-1200').click();

    // Step 3 room type
    await page.getByTestId('assistant-chip-room-private').click();

    // Expect room cards
    const roomCards = page.getByTestId('assistant-room-card');
    await expect(roomCards.first()).toBeVisible();
    await expect(roomCards.nth(1)).toBeVisible();
  });
});
