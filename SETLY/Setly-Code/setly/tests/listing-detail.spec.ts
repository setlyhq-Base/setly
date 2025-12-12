import { test, expect, type Page } from '@playwright/test';
import { enableMockAuth } from './utils/e2e';

const viewports = [
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
] as const;

async function assertNoHorizontalOverflow(page: Page) {
  const ok = await page.evaluate(() => {
    const el = document.documentElement;
    return el.scrollWidth <= el.clientWidth + 1;
  });
  expect(ok).toBeTruthy();
}

test.describe('Listing Detail Page (Premium)', () => {
  test.beforeEach(async ({ page }) => {
    await enableMockAuth(page);
  });

  for (const vp of viewports) {
    test(`renders cleanly at ${vp.width}px`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', (msg: any) => {
        if (msg.type() !== 'error') return;
        const text = msg.text() || '';
        if (/favicon\.ico/i.test(text)) return;
        consoleErrors.push(text);
      });

      await page.setViewportSize(vp);
      await page.goto('/listing/2?e2eMockAuth=1'); // room id=2 is seeded with 1 photo

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Amenities' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Roommates' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Memories' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Things to know' })).toBeVisible();
      await assertNoHorizontalOverflow(page);

      // Single-photo edge case: no dot indicators
      await expect(page.locator('div[aria-label="Photo position"] span')).toHaveCount(0);

      // Amenities sheet
      await page.getByRole('button', { name: /show all amenities/i }).click();
      await expect(page.getByRole('heading', { name: 'All amenities' })).toBeVisible();
      await page.getByRole('button', { name: 'Close' }).click();
      await expect(page.getByRole('heading', { name: 'All amenities' })).toHaveCount(0);

      // Host -> Messages navigation
      await page.getByRole('button', { name: /message host to apply/i }).click();
      await expect(page).toHaveURL(/\/messages\?/);
      await expect(page).toHaveURL(/with=/);

      expect(consoleErrors).toEqual([]);
    });
  }
});
