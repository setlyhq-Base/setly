import { test, expect, Page } from '@playwright/test';

async function expectAnySelector(page: Page, selectors: string[], timeout = 20000) {
  const start = Date.now();
  let lastError: any;
  for (;;) {
    for (const sel of selectors) {
      try {
        const el = await page.$(sel);
        if (el) return; // found one
      } catch (e) { lastError = e; }
    }
    if (Date.now() - start > timeout) {
      throw new Error(`Timed out waiting for any of selectors: ${selectors.join(', ')}. Last error: ${lastError?.message || lastError}`);
    }
    await page.waitForTimeout(200);
  }
}

async function waitForNonZeroResults(page: Page, timeout = 20000) {
  const start = Date.now();
  for (;;) {
    const texts = await page.getByText(/results/).allTextContents().catch(() => [] as string[]);
    const counts = texts
      .map(t => (t.match(/(\d+)\s+results/i)?.[1]))
      .filter(Boolean)
      .map(v => parseInt(v as string, 10));
    if (counts.some(n => n > 0)) return;
    if (Date.now() - start > timeout) throw new Error(`Timed out waiting for non-zero results. Seen: ${JSON.stringify(texts)}`);
    await page.waitForTimeout(250);
  }
}

test.describe('Connect page data across tabs', () => {
  test.skip('All tabs show populated posts', async ({ page, browserName }) => {
    // NOTE: /connect is currently disabled in app routing.
    // Keep this smoke check on Chromium to avoid cross-engine flake in CI/dev
    if (browserName !== 'chromium') test.skip();
    await page.goto('/connect');
    // Hero renders
    await expect(page.getByRole('heading', { name: 'Setly Connect' })).toBeVisible();

    // Wait until results show a non-zero count, then expect any concrete card to exist
    await waitForNonZeroResults(page);
    await expectAnySelector(page, [
      'app-post-person-card',
      'app-post-room-card',
      'app-post-ride-card',
      'app-post-market-card',
      'app-post-event-card',
      'app-post-thread-card',
      'app-post-update-card'
    ]);

    // People tab
    const peopleTab = page.getByRole('tab', { name: 'People' });
    if (await peopleTab.isVisible().catch(() => false)) {
      await peopleTab.click();
      await page.waitForURL(/\/connect(?!\/map)/);
      await waitForNonZeroResults(page);
    }

    // Rooms tab
    const roomsTab = page.getByRole('tab', { name: 'Rooms' });
    if (await roomsTab.isVisible().catch(() => false)) {
      await roomsTab.click();
      await page.waitForURL(/\/connect(\/rooms)?/);
      await waitForNonZeroResults(page);
    }

    // Rides tab
    const ridesTab = page.getByRole('tab', { name: 'Rides' });
    if (await ridesTab.isVisible().catch(() => false)) {
      await ridesTab.click();
      await page.waitForURL(/\/connect(\/rides)?/);
      await waitForNonZeroResults(page);
    }

    // Marketplace tab
    const marketTab = page.getByRole('tab', { name: 'Marketplace' });
    if (await marketTab.isVisible().catch(() => false)) {
      await marketTab.click();
      await page.waitForURL(/\/connect(\/marketplace)?/);
      await waitForNonZeroResults(page);
    }

    // Topics tab (threads, events, updates)
    const topicsTab = page.getByRole('tab', { name: 'Topics' });
    if (await topicsTab.isVisible().catch(() => false)) {
      await topicsTab.click();
      await page.waitForURL(/\/connect(?!\/map)/);
      await waitForNonZeroResults(page);
    }
  });
});
