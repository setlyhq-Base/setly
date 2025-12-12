import { test, expect } from '@playwright/test';
import { gotoAuthed } from './utils/e2e';

test.describe('Messages Page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, '/messages');
  });

  test('should load messages page', async ({ page }) => {
    await expect(page).toHaveTitle(/Setly/);
    await expect(page.locator('[data-testid="messages-page"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
  });

  test('should display conversations list', async ({ page }) => {
    // Left pane should exist (desktop) or be visible on mobile by default.
    await expect(page.getByRole('heading', { name: 'Chats' })).toBeVisible();
    // Either demo conversations render, or the explicit empty text appears.
    await expect(page.locator('text=No conversations').or(page.locator('button', { hasText: /Chats/i }))).toBeVisible();
  });

  test('should have message input area', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder="Type a message"]');
    await expect(messageInput).toBeVisible();
  });

  test('should have send button', async ({ page }) => {
    const sendButton = page.locator('button', { hasText: 'Send' });
    await expect(sendButton).toBeVisible();
  });

  test('should show empty state when no conversation selected', async ({ page }) => {
    await expect(page.locator('text=Select a conversation to start chatting.')).toBeVisible();
  });

  test('should allow typing a message', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder="Type a message"]');
    await messageInput.fill('Hello, I am interested in your room!');
    await expect(messageInput).toHaveValue('Hello, I am interested in your room!');
  });

  test('should show message in conversation when sent', async ({ page }) => {
    // Select first conversation if present; otherwise skip (demo data can vary)
    const firstConversation = page.locator('aside button').first();
    if (await firstConversation.isVisible().catch(() => false)) {
      await firstConversation.click();
    }

    const messageInput = page.locator('textarea[placeholder="Type a message"]');
    const sendButton = page.locator('button', { hasText: 'Send' });

    await messageInput.fill('Test message');
    await sendButton.click();
    await expect(page.locator('text=Test message')).toBeVisible();
  });
});
