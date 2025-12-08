import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
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
    console.log('🔐 [Firebase Auth] Starting Google sign-in...');
    
    if (this.mockEnabled && this.mockUser) {
      console.log('🎭 [Firebase Auth] Using mock user for testing');
      return this.mockUser as FirebaseUser;
    }

    // Validate Firebase config
    if (!this.auth?.app?.options?.authDomain) {
      console.error('❌ [Firebase Auth] Missing Firebase authDomain configuration');
      throw new Error('Firebase authentication is not properly configured');
    }

    console.log('📝 [Firebase Auth] Auth domain:', this.auth.app.options.authDomain);
    
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    // Hint Google to show account chooser consistently
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      console.log('🚀 [Firebase Auth] Opening Google sign-in popup...');
      // Always use popup for mobile-app experience - no redirects
      const result = await signInWithPopup(this.auth, provider);
      console.log('✅ [Firebase Auth] Sign-in successful:', result.user.email);
      return result.user;
    } catch (err: any) {
      const code = err?.code || '';
      console.error('❌ [Firebase Auth] Sign-in failed:', code, err.message);
      
      // Handle popup blocker with clear user-facing error
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        throw new Error('POPUP_BLOCKED: Please allow popups for setly.in to sign in with Google');
      }
      
      // Handle popup closed by user
      if (code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled');
      }
      
      // Handle network errors
      if (code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your connection and try again');
      }

      // Handle unauthorized domain
      if (code === 'auth/unauthorized-domain') {
        console.error('❌ [Firebase Auth] Domain not authorized in Firebase console');
        throw new Error('This domain is not authorized for OAuth sign-in. Please contact support');
      }

      // Handle internal errors (often config issues)
      if (code === 'auth/internal-error') {
        console.error('❌ [Firebase Auth] Internal error - likely configuration issue');
        throw new Error('Authentication configuration error. Please contact support');
      }
      
      // Other errors - preserve original message
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
    return user ? await user.getIdToken() : null;
  }
}
