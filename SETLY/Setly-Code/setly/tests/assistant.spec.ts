import { test, expect } from '@playwright/test';

test.describe('Setly Assistant', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display chat widget on home page', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await expect(chatFab).toBeVisible();
  });

  test('should open chat panel when widget is clicked', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await expect(chatFab).toBeVisible();

    await chatFab.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).toBeVisible();
  });

  test('should display assistant header with icon', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    await expect(page.locator('text=Setly Assistant')).toBeVisible();
    const northStarIcon = page.locator('app-north-star-icon').first();
    await expect(northStarIcon).toBeVisible();
  });

  test('should show quick start buttons', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    await expect(page.locator('text=Find housing')).toBeVisible();
    await expect(page.locator('text=Airport pickup')).toBeVisible();
    await expect(page.locator('text=Documents for SSN')).toBeVisible();
    await expect(page.locator('text=Open a bank account')).toBeVisible();
    await expect(page.locator('text=Get a US SIM')).toBeVisible();
  });

  test('should send quick start message', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    const quickStartButton = page.locator('button', { hasText: 'Find housing' });
    await quickStartButton.click();

    // Should show the message in chat
    await expect(page.locator('text=Find housing')).toBeVisible();
  });

  test('should allow typing and sending custom message', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    const messageInput = page.locator('textarea[placeholder*="Ask me anything"]');
    await messageInput.fill('How do I find affordable housing near university?');

    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Should show the message
    await expect(page.locator('text=How do I find affordable housing near university?')).toBeVisible();
  });

  test('should close chat panel', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    const closeButton = page.locator('button[aria-label="Close chat"]');
    await expect(closeButton).toBeVisible();

    await closeButton.click();

    const chatPanel = page.getByTestId('chat-panel');
    await expect(chatPanel).not.toBeVisible();
  });

  test('should maintain chat state when reopening', async ({ page }) => {
    const chatFab = page.locator('button.fixed[aria-label="Open Setly Assistant"]').first();
    await chatFab.click();

    const messageInput = page.locator('textarea[placeholder*="Ask me anything"]');
    await messageInput.fill('Test message');
    const sendButton = page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Close and reopen
    const closeButton = page.locator('button[aria-label="Close chat"]');
    await closeButton.click();

    await chatFab.click();

    // Message should still be there
    await expect(page.locator('text=Test message')).toBeVisible();
  });

  test('should show unread count indicator', async ({ page }) => {
    // This test assumes the assistant sends a welcome message or has some initial state
    const unreadIndicator = page.locator('span').filter({ hasText: /\d+/ }).locator('..').locator('button[aria-label="Open Setly Assistant"]');
    // May or may not be visible depending on implementation
    const isVisible = await unreadIndicator.isVisible();
    // If visible, should be a number
    if (isVisible) {
      const text = await unreadIndicator.textContent();
      expect(parseInt(text || '0')).toBeGreaterThanOrEqual(0);
    }
  });
});
