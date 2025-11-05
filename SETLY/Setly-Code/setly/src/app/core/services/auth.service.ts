import { Injectable, signal } from '@angular/core';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { CurrentUserService } from '../user/current-user.service';
import { User } from '../models/user.model';
import { connectFunctionsEmulator, getFunctions, httpsCallable } from '@angular/fire/functions';

export interface SignupDraft {
  name: string;
  role: 'student' | 'professional';
  organizationId: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export interface VerificationState {
  email: string;
  code: string;
  attempts: number;
  maxAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly DRAFT_KEY = 'setly_signup_draft';
  private readonly VERIFICATION_KEY = 'setly_verification';

  private _signupDraft = signal<SignupDraft | null>(this.loadDraft());
  private _verificationState = signal<VerificationState | null>(this.loadVerificationState());

  constructor(
    private firebaseAuth: FirebaseAuthService,
    private currentUserService: CurrentUserService
  ) {
    // Initialize functions emulator in dev
    if (location.hostname === 'localhost') {
      const functions = getFunctions();
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  }

  get currentUser() {
    return this.currentUserService.currentUser;
  }

  get signupDraft() {
    return this._signupDraft.asReadonly();
  }

  get verificationState() {
    return this._verificationState.asReadonly();
  }

  // Social Login Methods
  async signInWithGoogle(): Promise<void> {
    await this.firebaseAuth.signInWithGoogle();
  }

  async signInWithFacebook(): Promise<void> {
    await this.firebaseAuth.signInWithFacebook();
  }

  // Email/Password Methods
  async signIn(email: string, password: string): Promise<void> {
    await this.firebaseAuth.signInWithEmailAndPassword(email, password);
  }

  async signUp(email: string, password: string): Promise<void> {
    await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
  }

  // Passwordless
  async sendSignInLinkToEmail(email: string): Promise<void> {
    await this.firebaseAuth.sendSignInLinkToEmail(email);
  }

  async signInWithEmailLink(email: string, emailLink: string): Promise<void> {
    await this.firebaseAuth.signInWithEmailLink(email, emailLink);
  }

  isSignInWithEmailLink(url: string): boolean {
    return this.firebaseAuth.isSignInWithEmailLink(url);
  }

  getEmailForSignIn(): string | null {
    return this.firebaseAuth.getEmailForSignIn();
  }

  // Phone OTP Methods
  async initializeRecaptcha(containerId: string = 'recaptcha-container'): Promise<void> {
    await this.firebaseAuth.initializeRecaptcha(containerId);
  }

  async signInWithPhone(phoneNumber: string): Promise<void> {
    await this.firebaseAuth.signInWithPhone(phoneNumber);
  }

  async verifyPhoneCode(code: string): Promise<void> {
    await this.firebaseAuth.verifyPhoneCode(code);
  }

  async signOut(): Promise<void> {
    await this.firebaseAuth.signOut();
  }

  // Cloud Functions for verification
  async startEmailVerification(email: string): Promise<void> {
    const functions = getFunctions();
    const startVerification = httpsCallable(functions, 'startEmailVerification');
    await startVerification({ email });
  }

  async confirmEmailVerification(code: string): Promise<void> {
    const functions = getFunctions();
    const confirmVerification = httpsCallable(functions, 'confirmEmailVerification');
    await confirmVerification({ code });
  }

  async upsertUserProfile(profileData: Partial<User>): Promise<void> {
    await this.currentUserService.upsertProfile(profileData);
  }

  // Legacy methods for backward compatibility (can be removed if not needed)
  initiateSignup(draft: SignupDraft): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._signupDraft.set(draft);
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const verification: VerificationState = {
          email: draft.email,
          code,
          attempts: 0,
          maxAttempts: 3
        };
        this._verificationState.set(verification);
        localStorage.setItem(this.VERIFICATION_KEY, JSON.stringify(verification));

        console.log(`Verification code for ${draft.email}: ${code}`);
        resolve({ success: true });
      }, 1000);
    });
  }

  verifyCode(inputCode: string): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve, reject) => {
      const state = this._verificationState();
      if (!state) {
        reject(new Error('No verification in progress'));
        return;
      }

      if (state.attempts >= state.maxAttempts) {
        reject(new Error('Too many attempts. Please request a new code.'));
        return;
      }

      setTimeout(() => {
        state.attempts++;
        this._verificationState.set(state);
        localStorage.setItem(this.VERIFICATION_KEY, JSON.stringify(state));

        if (inputCode === state.code) {
          resolve({ success: true });
        } else if (state.attempts >= state.maxAttempts) {
          reject(new Error('Too many failed attempts. Please request a new code.'));
        } else {
          reject(new Error(`Invalid code. ${state.maxAttempts - state.attempts} attempts remaining.`));
        }
      }, 500);
    });
  }

  resendCode(): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      const draft = this._signupDraft();
      if (!draft) {
        resolve({ success: false, message: 'No signup in progress' });
        return;
      }

      setTimeout(() => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const verification: VerificationState = {
          email: draft.email,
          code,
          attempts: 0,
          maxAttempts: 3
        };
        this._verificationState.set(verification);
        localStorage.setItem(this.VERIFICATION_KEY, JSON.stringify(verification));

        console.log(`New verification code for ${draft.email}: ${code}`);
        resolve({ success: true });
      }, 1000);
    });
  }

  completeProfile(profileData: Partial<User>): Promise<User> {
    return new Promise((resolve) => {
      const draft = this._signupDraft();
      if (!draft) {
        throw new Error('No signup draft found');
      }

      setTimeout(() => {
        const user: User = {
          id: Date.now().toString(),
          name: draft.name,
          primaryEmail: draft.email,
          emailVerified: true,
          role: draft.role,
          domainVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...profileData,
          preferences: {
            budgetMin: 500,
            budgetMax: 1500,
            vegetarian: false,
            smoking: false,
            petsOk: false,
            furnished: false,
            roomType: 'private' as const,
            ...profileData.preferences
          }
        };

        // Use new service
        this.upsertUserProfile(user);

        // Clear draft and verification state
        this._signupDraft.set(null);
        this._verificationState.set(null);
        localStorage.removeItem(this.DRAFT_KEY);
        localStorage.removeItem(this.VERIFICATION_KEY);

        resolve(user);
      }, 1000);
    });
  }

  clearSignupState(): void {
    this._signupDraft.set(null);
    this._verificationState.set(null);
    localStorage.removeItem(this.DRAFT_KEY);
    localStorage.removeItem(this.VERIFICATION_KEY);
  }



  private loadDraft(): SignupDraft | null {
    const stored = localStorage.getItem(this.DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private loadVerificationState(): VerificationState | null {
    const stored = localStorage.getItem(this.VERIFICATION_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
