import type { Page } from '@playwright/test';
import { enableMockApi } from './api-mocks';

export type MockUser = {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified?: boolean;
};

export async function enableMockAuth(page: Page, user?: Partial<MockUser>): Promise<MockUser> {
  const merged: MockUser = {
    uid: 'e2e-mock-uid',
    email: 'mock.user@setly.test',
    displayName: 'E2E Mock User',
    emailVerified: true,
    ...user,
  };

  if (process.env.E2E_MOCK_API === '1') {
    await enableMockApi(page, {
      authUid: merged.uid,
      email: merged.email,
      displayName: merged.displayName,
    });
  }

  await page.addInitScript((u) => {
    // @ts-ignore
    window.__e2eMockAuth = {
      enabled: true,
      user: {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        emailVerified: u.emailVerified,
      },
    };

    // @ts-ignore
    window.__e2eBypassTrustedActions = true;
  }, merged);

  return merged;
}

/**
 * Navigates to an AuthGuard-protected route with the in-app mock auth enabled.
 * The first navigation may redirect to /auth/sign-in before CurrentUserService hydrates;
 * this helper retries once.
 */
export async function gotoAuthed(page: Page, path: string) {
  await enableMockAuth(page);

  const withE2eParam = (() => {
    try {
      const u = new URL(path, 'http://local');
      if (!u.searchParams.has('e2eMockAuth')) u.searchParams.set('e2eMockAuth', '1');
      return u.pathname + u.search + u.hash;
    } catch {
      // Fallback for odd paths
      return path.includes('?') ? `${path}&e2eMockAuth=1` : `${path}?e2eMockAuth=1`;
    }
  })();

  await page.goto(withE2eParam);

  // Ensure the init script ran before app boot.
  // If not, force a reload so FirebaseAuthService constructor can see the flag.
  const hasMock = await page.evaluate(() => {
    // @ts-ignore
    return !!(window.__e2eMockAuth && window.__e2eMockAuth.enabled);
  });
  if (!hasMock) {
    await page.reload();
  }

  // If guard ran before mock auth hydration, retry once.
  if (/\/auth\/sign-in/.test(page.url())) {
    await page.waitForTimeout(50);
    await page.goto(withE2eParam);
  }
}
