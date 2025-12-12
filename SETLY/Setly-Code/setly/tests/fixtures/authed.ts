import { test as base, expect } from '@playwright/test';

import { enableMockAuth } from '../utils/e2e';

// Auth-enabled test fixture: injects mock Firebase auth + E2E flags before any navigation.
export const test = base.extend({
  page: async ({ page }, use) => {
    await enableMockAuth(page);
    await use(page);
  },
});

export { expect };
