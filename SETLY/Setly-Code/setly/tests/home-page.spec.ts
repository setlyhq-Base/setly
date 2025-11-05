import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toContainText('Find Your Perfect Room');
  });

  test('should display hero section', async ({ page }) => {
    await expect(page.locator('text=Find Your Perfect Room')).toBeVisible();
    await expect(page.locator('text=Connect with students and find housing')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="university"]');
    await expect(searchInput).toBeVisible();
  });

  test('should display room listings', async ({ page }) => {
    await expect(page.locator('text=Featured Rooms')).toBeVisible();
    const roomCards = page.locator('[data-testid="room-card"]');
    await expect(roomCards.first()).toBeVisible();
  });

  test('should have navigation links', async ({ page }) => {
    await expect(page.locator('text=Browse')).toBeVisible();
    await expect(page.locator('text=Post Room')).toBeVisible();
    await expect(page.locator('text=Messages')).toBeVisible();
  });

  test('should display chat widget', async ({ page }) => {
    const chatWidget = page.locator('app-chat-widget').first();
    await expect(chatWidget).toBeVisible();
  });

  test('should open chat panel when chat widget is clicked', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open Setly Assistant"]').first();
    await expect(chatButton).toBeVisible();

    await chatButton.click();

    const chatPanel = page.locator('app-chat-panel');
    await expect(chatPanel).toBeVisible();
    await expect(page.locator('text=Setly Assistant')).toBeVisible();
  });

  test('should display quick start buttons in chat', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open Setly Assistant"]').first();
    await chatButton.click();

    await expect(page.locator('text=Find housing')).toBeVisible();
    await expect(page.locator('text=Airport pickup')).toBeVisible();
    await expect(page.locator('text=Documents for SSN')).toBeVisible();
  });

  test('should close chat panel', async ({ page }) => {
    const chatButton = page.locator('button[aria-label="Open Setly Assistant"]').first();
    await chatButton.click();

    const closeButton = page.locator('button[aria-label="Close chat"]');
    await expect(closeButton).toBeVisible();

    await closeButton.click();

    const chatPanel = page.locator('app-chat-panel');
    await expect(chatPanel).not.toBeVisible();
  });
});
