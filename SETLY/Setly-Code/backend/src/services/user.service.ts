import { db } from '../config/firebase';
import { firestore } from 'firebase-admin';

export interface StoredUser {
  id: string; // same as auth uid
  authUid: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  universityId?: string;
  languages?: string[];
  interests?: string[];
  socials?: { linkedin?: string; instagram?: string };
  avatarKey?: string; // S3 key
  profileVisibility?: {
    about?: boolean;
    travelHistory?: boolean;
    reviews?: boolean;
    interests?: boolean;
    connections?: boolean;
    verification?: boolean;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

const COLLECTION = 'users';

export class UserService {
  static async upsertAuthUser(authUid: string, email: string, displayName?: string, photoUrl?: string): Promise<StoredUser> {
    // Dev fallback when Firestore is not configured
    if (!db) {
      const now: any = new Date();
      return {
        id: authUid,
        authUid,
        email: email || 'dev@example.com',
        displayName: displayName || 'Dev User',
        photoUrl: photoUrl || '',
        bio: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        createdAt: now,
        updatedAt: now
      } as any as StoredUser;
    }
    const ref = db.collection(COLLECTION).doc(authUid);
    const snap = await ref.get();
    const now = firestore.Timestamp.now();
    if (!snap.exists) {
      const newUser: StoredUser = {
        id: authUid,
        authUid,
        email,
        displayName: displayName || '',
        photoUrl: photoUrl || '',
        createdAt: now,
        updatedAt: now,
        bio: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: {
          about: true,
          travelHistory: true,
          reviews: true,
          interests: true,
          connections: true,
          verification: true,
        }
      } as StoredUser;
      await ref.set(newUser, { merge: true });
      return newUser;
    } else {
      const data = snap.data() as StoredUser;
      const updated: Partial<StoredUser> = {};
      if (data.email !== email) updated.email = email;
      if (displayName && data.displayName !== displayName) updated.displayName = displayName;
      if (photoUrl && data.photoUrl !== photoUrl) updated.photoUrl = photoUrl;
      if (Object.keys(updated).length) {
        updated.updatedAt = now;
        await ref.set(updated, { merge: true });
      }
      const latest = (await ref.get()).data() as StoredUser;
      return latest;
    }
  }

  static async getByAuthUid(authUid: string): Promise<StoredUser | null> {
    if (!db) {
      // Provide a predictable stub in dev when DB is unavailable
      const now: any = new Date();
      return {
        id: authUid,
        authUid,
        email: 'dev@example.com',
        displayName: 'Dev User',
        photoUrl: '',
        bio: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        createdAt: now,
        updatedAt: now
      } as any as StoredUser;
    }
    const ref = db.collection(COLLECTION).doc(authUid);
    const snap = await ref.get();
    return snap.exists ? (snap.data() as StoredUser) : null;
  }

  static async updateProfile(authUid: string, patch: Partial<StoredUser>): Promise<StoredUser> {
    if (!db) {
      // Echo back a merged stub profile when DB is unavailable
      const base = await this.getByAuthUid(authUid) as StoredUser;
      return { ...base, ...patch } as any as StoredUser;
    }
    const allowed: (keyof StoredUser)[] = [
      'displayName','bio','phone','city','state','universityId','languages','interests','socials','avatarKey','profileVisibility','photoUrl'
    ];
    const safe: Partial<StoredUser> = {};
    for (const key of allowed) {
      if (key in patch) (safe as any)[key] = (patch as any)[key];
    }
    safe.updatedAt = firestore.Timestamp.now();
    const ref = db.collection(COLLECTION).doc(authUid);
    await ref.set(safe, { merge: true });
    return (await ref.get()).data() as StoredUser;
  }
}
