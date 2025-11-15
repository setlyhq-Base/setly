import { test, expect } from '@playwright/test';

// Smoke test: per-thread draft persistence using deep link params to create conversations.
// Steps:
// - Open /messages?with=alice&name=Alice and type a draft
// - Navigate to /messages?with=bob&name=Bob
// - Navigate back to Alice thread and ensure the draft persists

test.describe('Messages drafts', () => {
  test('should persist draft per conversation', async ({ page }) => {
    await page.goto('/messages?with=alice&name=Alice');

    const input = page.locator('textarea[placeholder*="Type a message"], textarea');
    await input.fill('Draft for Alice');
    await expect(input).toHaveValue('Draft for Alice');

    // Switch to another thread
    await page.goto('/messages?with=bob&name=Bob');
    await expect(page).toHaveURL(/with=bob/);

    // Go back to Alice thread
    await page.goto('/messages?with=alice&name=Alice');
    await expect(input).toHaveValue('Draft for Alice');
  });
});
