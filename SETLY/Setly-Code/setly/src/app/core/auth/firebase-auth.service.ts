import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  onAuthStateChanged,
  getIdToken,
  ActionCodeSettings
} from '@angular/fire/auth';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private recaptchaVerifier?: RecaptchaVerifier;
  private confirmationResult?: ConfirmationResult;
  // E2E mock support
  private mockEnabled = false;
  private mockUser: Partial<FirebaseUser> | null = null;
  private phoneMockEnabled = !!environment?.featureFlags?.mockPhoneAuth;
  private phoneMockCode = '123456';

  constructor(private auth: Auth) {
    // Check for E2E mock flag injected by Playwright before app boot
    try {
      const w = window as any;
      if (w && w.__e2eMockAuth && w.__e2eMockAuth.enabled) {
        this.mockEnabled = true;
        this.mockUser = w.__e2eMockAuth.user || {
          uid: 'e2e-mock-uid',
          email: 'mock.user@setly.test',
          displayName: 'E2E Mock User',
          emailVerified: true
        } as Partial<FirebaseUser>;
      }
    } catch {}
  }

  // Social Login Methods
  async signInWithGoogle(): Promise<FirebaseUser> {
    if (this.mockEnabled && this.mockUser) {
      // Immediately resolve with mock user for tests
      return this.mockUser as FirebaseUser;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    // Hint Google to show account chooser consistently
    provider.setCustomParameters({ prompt: 'select_account' });

    // Heuristic: prefer redirect on iOS/Safari and in embedded browsers
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    const isEmbedded = (window as any).navigator?.standalone === true || /FBAN|FBAV|Instagram|Line|Twitter/i.test(ua);

    if (isIOS || isSafari || isEmbedded) {
      // Use redirect to avoid popup/cookie restrictions
      await signInWithRedirect(this.auth, provider);
      // The page will reload; onAuthStateChanged will handle post-login
      // Return a never-resolving Promise to satisfy the signature but avoid further UI handling
      return new Promise<FirebaseUser>(() => {});
    }

    try {
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (err: any) {
      const code = err?.code || '';
      // Known cases where popup fails due to environment restrictions -> fallback to redirect
      const shouldRedirect = [
        'auth/popup-blocked',
        'auth/operation-not-supported-in-this-environment',
        'auth/cookie-not-supported',
        'auth/internal-error'
      ].some(c => code.includes(c));
      if (shouldRedirect) {
        try {
          await signInWithRedirect(this.auth, provider);
          return new Promise<FirebaseUser>(() => {});
        } catch (e) {
          throw e;
        }
      }
      throw err;
    }
  }

  async signInWithFacebook(): Promise<FirebaseUser> {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async signInWithMicrosoft(): Promise<FirebaseUser> {
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  // Email/Password Methods
  async signInWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  async createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(this.auth, email, password);
    return result.user;
  }

  // Passwordless (Magic Link)
  async sendSignInLinkToEmail(email: string): Promise<void> {
    const actionCodeSettings: ActionCodeSettings = {
      url: `${window.location.origin}/auth/sign-in?email=${encodeURIComponent(email)}`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
    localStorage.setItem('emailForSignIn', email);
  }

  async signInWithEmailLink(email: string, emailLink: string): Promise<FirebaseUser> {
    const result = await signInWithEmailLink(this.auth, email, emailLink);
    localStorage.removeItem('emailForSignIn');
    return result.user;
  }

  isSignInWithEmailLink(url: string): boolean {
    return isSignInWithEmailLink(this.auth, url);
  }

  getEmailForSignIn(): string | null {
    return localStorage.getItem('emailForSignIn');
  }

  // Phone OTP Methods
  async initializeRecaptcha(containerId: string = 'recaptcha-container'): Promise<void> {
    // If enterprise is configured and not disabled by feature flag, inject script once.
    if (!environment?.featureFlags?.disableRecaptchaEnterprise && environment?.recaptcha?.siteKey && !(window as any).__recaptchaEnterpriseLoaded) {
      const scriptId = 'recaptcha-enterprise-script';
      if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        s.src = `https://www.google.com/recaptcha/enterprise.js?render=${environment.recaptcha.siteKey}`;
        s.async = true;
        s.onload = () => {
          (window as any).__recaptchaEnterpriseLoaded = true;
          // Preload an enterprise token (optional – action label can be adjusted later)
          try {
            // @ts-ignore
            grecaptcha.enterprise.ready(() => {
              // @ts-ignore
              grecaptcha.enterprise.execute(environment.recaptcha.siteKey, { action: 'PHONE_AUTH_INIT' })
                .then((token: string) => {
                  // Store for potential backend risk assessment call – not yet sent
                  (window as any).__recaptchaLastToken = token;
                  console.log('[reCAPTCHA] enterprise token acquired');
                })
                .catch((err: any) => console.warn('[reCAPTCHA] enterprise execute failed', err));
            });
          } catch (e) {
            console.warn('[reCAPTCHA] enterprise ready failed', e);
          }
        };
        document.head.appendChild(s);
      }
    }

    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
  }

  async signInWithPhone(phoneNumber: string): Promise<void> {
    if (this.phoneMockEnabled) {
      // Simulate an async send SMS
      await new Promise(r => setTimeout(r, 300));
      // Store a pseudo confirmationResult for verify
      this.confirmationResult = {
        confirm: async (code: string) => {
          // Accept ANY 6-digit code in mock mode to reduce friction
          if (code && code.length === 6) {
            return { user: (this.mockUser || { uid: 'phone-mock', phoneNumber }) as FirebaseUser };
          }
          const err: any = new Error('Enter 6 digits');
          err.code = 'auth/invalid-verification-code';
          throw err;
        }
      } as unknown as ConfirmationResult;
      return;
    }
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    this.confirmationResult = await signInWithPhoneNumber(
      this.auth,
      phoneNumber,
      this.recaptchaVerifier
    );
  }

  async verifyPhoneCode(code: string): Promise<FirebaseUser> {
    if (this.phoneMockEnabled) {
      // Use the mocked confirmationResult path above
      if (!this.confirmationResult) {
        const err: any = new Error('No phone verification in progress');
        err.code = 'auth/missing-verification';
        throw err;
      }
      const result: any = await this.confirmationResult.confirm(code);
      return result.user as FirebaseUser;
    }
    if (!this.confirmationResult) {
      throw new Error('No phone verification in progress');
    }

    const result = await this.confirmationResult.confirm(code);
    return result.user;
  }

  // Auth State
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (this.mockEnabled) {
      // Invoke immediately with mock user; return no-op unsubscribe
      setTimeout(() => callback(this.mockUser as FirebaseUser), 0);
      return () => {};
    }
    return onAuthStateChanged(this.auth, callback);
  }

  // Sign Out
  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  // Token
  async getIdToken(): Promise<string | null> {
    // Only return a mock token in full E2E mock mode; do NOT use phone mock here
    // so that real Firebase tokens are sent to the backend for verification.
    if (this.mockEnabled) return 'e2e-mock-token';
    const user = this.auth.currentUser;
    return user ? await getIdToken(user) : null;
  }
}
