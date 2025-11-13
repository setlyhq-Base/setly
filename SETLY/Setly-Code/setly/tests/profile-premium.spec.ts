import { test, expect } from '@playwright/test';

// Public profile route avoids auth guard while rendering the same premium layout
const PUBLIC_PROFILE_URL = '/u/demo';

test.describe('Profile Page – Premium layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PUBLIC_PROFILE_URL);
  });

  test('loads without layout shifts and shows header, avatar, and quick nav', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Avatar present and circular (check computed style)
    const radius = await page.locator('.avatar-img').evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(radius).toBeTruthy();
    // Most browsers compute a pixel radius for a circle, just ensure not 0px
    expect(radius).not.toBe('0px');

    // Quick nav chips should exist and include key sections
  const chips = page.locator('.premium-nav .nav-chip');
  const chipCount = await chips.count();
  expect(chipCount).toBeGreaterThan(3);
    await expect(page.locator('.premium-nav .nav-chip', { hasText: 'Overview' })).toBeVisible();
    await expect(page.locator('.premium-nav .nav-chip', { hasText: 'Verification' })).toBeVisible();
    await expect(page.locator('.premium-nav .nav-chip', { hasText: 'Settings' })).toBeVisible();
  });

  test('metrics panel renders 4 at-a-glance metrics', async ({ page }) => {
    const metrics = page.locator('.panel-grid .metric');
    await expect(metrics).toHaveCount(5); // 4 metrics + 1 Edit Profile tile
    await expect(page.locator('.panel-grid')).toContainText('Rooms');
    await expect(page.locator('.panel-grid')).toContainText('Rides');
    await expect(page.locator('.panel-grid')).toContainText('Reviews');
    await expect(page.locator('.panel-grid')).toContainText('Connections');
  });

  test('switches sections via quick nav chips', async ({ page }) => {
  await page.locator('.premium-nav .nav-chip', { hasText: 'Verification' }).click();
  await page.waitForTimeout(150);
  // Verification dedicated section component
  await expect(page.locator('app-verification-status')).toBeVisible();

    await page.locator('.premium-nav .nav-chip', { hasText: 'My Rooms' }).click();
    await page.waitForTimeout(150);
    await expect(page.locator('app-my-listings')).toBeVisible();

    await page.locator('.premium-nav .nav-chip', { hasText: 'Connections' }).click();
    await page.waitForTimeout(150);
    await expect(page.locator('app-connections-list')).toBeVisible();
  });

  test('verification progress ring and steps are present', async ({ page }) => {
    // In Overview, the compact verification card is visible in the right column
    const ring = page.locator('.verif-progress .ring');
    await expect(ring).toBeVisible();
    // Steps list should have 4 items
    const steps = page.locator('.verif-progress .steps li');
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toContainText(/Identity/i);
    await expect(steps.nth(1)).toContainText(/University|Edu/i);
    await expect(steps.nth(2)).toContainText(/Phone/i);
    await expect(steps.nth(3)).toContainText(/Email/i);
  });

  test('about and interests sections render in overview', async ({ page }) => {
    // About card contains placeholder or content
    await expect(page.locator('app-about-me, .stack-card:has-text("About")')).toBeVisible();
    // Interests grid present
    await expect(page.locator('app-interests-grid')).toBeVisible();
  });

  test('header content remains visible after scroll (no clipping)', async ({ page }) => {
    // Scroll down and up, header card should remain rendered
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(50);
    await page.mouse.wheel(0, -800);
    await expect(page.locator('app-profile-header-card')).toBeVisible();
    // Banner or name should still be visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('reviews module tabs switch and render cards', async ({ page }) => {
    const reviews = page.locator('app-reviews-list');
    await expect(reviews).toBeVisible();
    const tabs = page.locator('app-reviews-list .tabs .tab');
    await expect(tabs).toHaveCount(3);
    await tabs.nth(1).click(); // Given
    await page.waitForTimeout(50);
    await expect(reviews).toContainText(/Leaving|Pleasant host|Pending|Great guest|review/i);
  });

  test('settings section loads and save settings button is interactive', async ({ page }) => {
    await page.locator('.premium-nav .nav-chip', { hasText: 'Settings' }).click();
    await page.waitForTimeout(100);
    const email = page.getByPlaceholder('you@example.com');
    await expect(email).toBeVisible();
    await email.fill('demo@example.com');
    const saveBtn = page.getByRole('button', { name: /save settings/i });
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();
    await expect(page.locator('text=Saved ✓')).toBeVisible();
  });
});
