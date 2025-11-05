import { test, expect } from '@playwright/test';

test.describe('Messages Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/messages');
  });

  test('should load messages page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('h1')).toContainText('Messages');
  });

  test('should display conversations list', async ({ page }) => {
    const conversations = page.locator('[data-testid="conversation-item"]');
    // May be empty if no messages, but the container should exist
    const conversationsContainer = page.locator('text=Conversations').or(page.locator('[data-testid="conversations-list"]'));
    await expect(conversationsContainer).toBeVisible();
  });

  test('should have message input area', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Ask me anything"]').or(page.locator('textarea[placeholder*="message"]'));
    await expect(messageInput).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    const sendButton = page.locator('button[aria-label="Send message"]').or(page.locator('button', { hasText: 'Send' }));
    await expect(sendButton).toBeVisible();
  });

  test('should display empty state when no conversations', async ({ page }) => {
    const emptyState = page.locator('text=No messages yet').or(page.locator('text=Start a conversation'));
    await expect(emptyState).toBeVisible();
  });

  test('should allow typing a message', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Ask me anything"]').or(page.locator('textarea[placeholder*="message"]'));
    await messageInput.fill('Hello, I am interested in your room!');
    await expect(messageInput).toHaveValue('Hello, I am interested in your room!');
  });

  test('should show message in conversation when sent', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Ask me anything"]').or(page.locator('textarea[placeholder*="message"]'));
    const sendButton = page.locator('button[aria-label="Send message"]').or(page.locator('button', { hasText: 'Send' }));

    await messageInput.fill('Test message');
    await sendButton.click();

    // Should show the message in the conversation
    await expect(page.locator('text=Test message')).toBeVisible();
  });
});
