import { Injectable, signal, computed } from '@angular/core';
import { FirebaseAuthService } from '../auth/firebase-auth.service';
import { Firestore, doc, onSnapshot, setDoc, serverTimestamp, getDoc } from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private _firebaseUser = signal<any>(null);
  private _profile = signal<User | null>(null);

  // Computed signals
  currentUser = computed(() => {
    const firebaseUser = this._firebaseUser();
    const profile = this._profile();
    if (!firebaseUser) return null;

    return {
      ...firebaseUser,
      ...profile,
      isVerified: profile?.domainVerified || false,
      hasCompleteProfile: this.hasCompleteProfile(profile),
    };
  });

  isAuthenticated = computed(() => !!this._firebaseUser());
  isProfileComplete = computed(() => this.hasCompleteProfile(this._profile()));

  constructor(
    private firebaseAuth: FirebaseAuthService,
    private firestore: Firestore
  ) {
    // Listen to Firebase auth state
    this.firebaseAuth.onAuthStateChanged(async (user) => {
      this._firebaseUser.set(user);
      if (user) {
        await this.ensureUserDocument(user);
        this.subscribeToProfile(user.uid);
      } else {
        this._profile.set(null);
      }
    });
  }

  private subscribeToProfile(uid: string): void {
    const userDoc = doc(this.firestore, 'users', uid);
    onSnapshot(userDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        this._profile.set({
          ...data,
          createdAt: data['createdAt']?.toDate() || new Date(),
          updatedAt: data['updatedAt']?.toDate() || new Date(),
        } as User);
      } else {
        this._profile.set(null);
      }
    });
  }

  async upsertProfile(profileData: Partial<User>): Promise<void> {
    const user = this._firebaseUser();
    if (!user) throw new Error('No authenticated user');

    const userDoc = doc(this.firestore, 'users', user.uid);
    await setDoc(userDoc, {
      ...profileData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  private async ensureUserDocument(user: any): Promise<void> {
    try {
      const userDocRef = doc(this.firestore, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);
      if (!snapshot.exists()) {
        await setDoc(userDocRef, {
          primaryEmail: user.email,
          name: user.displayName || 'New User',
          role: 'student', // default placeholder; will be updated during profile completion
          emailVerified: user.emailVerified || false,
          domainVerified: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
    } catch (err) {
      console.warn('[CurrentUserService] Failed ensuring user document', err);
    }
  }

  private hasCompleteProfile(profile: User | null): boolean {
    if (!profile) return false;
    if (profile.role === 'student') {
      return !!(profile.university && profile.program && profile.startDate && profile.endDate);
    } else if (profile.role === 'professional') {
      return !!(profile.company && profile.title);
    }
    return false;
  }
}
