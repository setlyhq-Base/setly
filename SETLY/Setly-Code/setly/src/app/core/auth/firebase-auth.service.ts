import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
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

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private recaptchaVerifier?: RecaptchaVerifier;
  private confirmationResult?: ConfirmationResult;

  constructor(private auth: Auth) {}

  // Social Login Methods
  async signInWithGoogle(): Promise<FirebaseUser> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  async signInWithFacebook(): Promise<FirebaseUser> {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
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
    if (!this.confirmationResult) {
      throw new Error('No phone verification in progress');
    }

    const result = await this.confirmationResult.confirm(code);
    return result.user;
  }

  // Auth State
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback);
  }

  // Sign Out
  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  // Token
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? await getIdToken(user) : null;
  }
}
