import { db, auth } from '../config/firebase';
import { firestore } from 'firebase-admin';
import { logger } from '../utils/logger';

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
    try {
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
    } catch (e) {
      // Firestore is initialized but not reachable/authorized; fall back to Auth info or stub
      logger.warnRate('user_upsert_firestore_fail', 30_000, '[UserService.upsertAuthUser] Firestore write failed, falling back:', (e as any)?.message || e);
      const now: any = new Date();
      let dn = displayName;
      let pu = photoUrl;
      try {
        if (auth) {
          const au = await auth.getUser(authUid);
          dn = dn || au.displayName || undefined;
          pu = pu || au.photoURL || undefined;
          email = email || au.email || '';
        }
      } catch {}
      return {
        id: authUid,
        authUid,
        email: email || 'dev@example.com',
        displayName: dn || 'User',
        photoUrl: pu || '',
        bio: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        createdAt: now,
        updatedAt: now
      } as any as StoredUser;
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
    try {
      const ref = db.collection(COLLECTION).doc(authUid);
      const snap = await ref.get();
      return snap.exists ? (snap.data() as StoredUser) : null;
    } catch (e) {
      logger.warnRate('user_get_firestore_fail', 30_000, '[UserService.getByAuthUid] Firestore read failed, falling back:', (e as any)?.message || e);
      // Fallback to Auth for minimal user info
      try {
        if (auth) {
          const au = await auth.getUser(authUid);
          const now: any = new Date();
          return {
            id: au.uid,
            authUid: au.uid,
            email: au.email || '',
            displayName: au.displayName || au.email || au.uid,
            photoUrl: au.photoURL || '',
            bio: '',
            languages: [],
            interests: [],
            socials: {},
            profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
            createdAt: now,
            updatedAt: now
          } as any as StoredUser;
        }
      } catch (authErr) {
        logger.error('[UserService.getByAuthUid] Auth fallback failed:', (authErr as any)?.message || authErr);
      }
      return null;
    }
  }

  static async updateProfile(authUid: string, patch: Partial<StoredUser>): Promise<StoredUser> {
    if (!db) {
      // Echo back a merged stub profile when DB is unavailable
      const base = await this.getByAuthUid(authUid) as StoredUser;
      return { ...base, ...patch } as any as StoredUser;
    }
    try {
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
    } catch (e) {
      logger.warnRate('user_update_firestore_fail', 30_000, '[UserService.updateProfile] Firestore write failed, echoing merge:', (e as any)?.message || e);
      const base = await this.getByAuthUid(authUid) as StoredUser | null;
      return { ...(base || ({} as any)), ...patch } as any as StoredUser;
    }
  }

  /**
   * List users for global directory.
   * Params:
   * - limit: number of users to return (default 24)
   * - cursor: ISO string timestamp to page by updatedAt (exclusive)
   * - completeOnly: if true, filter to users with a reasonably complete profile
   */
  static async listUsers(params?: { limit?: number; cursor?: string; completeOnly?: boolean }): Promise<{ users: StoredUser[]; nextCursor?: string }>{
    const limit = Math.max(1, Math.min(100, params?.limit ?? 24));
    const completeOnly = !!params?.completeOnly;
    const cursorIso = params?.cursor;

    const mockUsers = (): { users: StoredUser[]; nextCursor?: string } => {
      const now: any = new Date();
      const mock: StoredUser[] = Array.from({ length: limit }).map((_, i) => ({
        id: `dev-user-${i+1}`,
        authUid: `dev-user-${i+1}`,
        email: `dev${i+1}@example.com`,
        displayName: `Dev User ${i+1}`,
        photoUrl: '',
        bio: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        city: ['Boston','NYC','Austin'][i % 3],
        state: ['MA','NY','TX'][i % 3],
        universityId: ['neu','mit','harvard'][i % 3],
        createdAt: now,
        updatedAt: now
      } as any));
      const filtered = completeOnly ? mock.filter(u => this.isProfileComplete(u)) : mock;
      return { users: filtered, nextCursor: undefined };
    };

    if (!db) {
      // Dev fallback when Firestore is not configured
      return mockUsers();
    }

    try {
      let q: FirebaseFirestore.Query = db.collection(COLLECTION).orderBy('updatedAt', 'desc').limit(limit);
      if (cursorIso) {
        const ts = firestore.Timestamp.fromDate(new Date(cursorIso));
        q = q.startAfter(ts);
      }
      const snapshot = await q.get();
      let users = snapshot.docs.map(d => d.data() as StoredUser);
      if (completeOnly) users = users.filter(u => this.isProfileComplete(u));
      const last = snapshot.docs[snapshot.docs.length - 1]?.data() as StoredUser | undefined;
      const nextCursor = last?.updatedAt ? (last.updatedAt.toDate?.().toISOString?.() || undefined) : undefined;
      return { users, nextCursor };
    } catch (e) {
      logger.warnRate('user_list_firestore_fail', 30_000, '[UserService.listUsers] Firestore unavailable, attempting Auth fallback:', (e as any)?.message || e);
      // Fallback to Firebase Auth directory (real signed-in users), minimal fields
      if (auth) {
        try {
          const res = await auth.listUsers(1000);
          const mapped: StoredUser[] = res.users.slice(0, limit).map((u) => ({
            id: u.uid,
            authUid: u.uid,
            email: u.email || '',
            displayName: u.displayName || (u.email || u.uid),
            photoUrl: undefined,
            bio: '',
            languages: [],
            interests: [],
            socials: {},
            profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
            createdAt: firestore.Timestamp.fromDate(new Date(u.metadata.creationTime || Date.now())),
            updatedAt: firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime || u.metadata.creationTime || Date.now()))
          } as any));
          const filtered = completeOnly ? mapped.filter(u => this.isProfileComplete(u)) : mapped;
          return { users: filtered, nextCursor: undefined };
        } catch (authErr) {
          logger.error('[UserService.listUsers] Auth fallback failed:', (authErr as any)?.message || authErr);
        }
      }
      // If all else fails, return empty (no mock)
      return { users: [], nextCursor: undefined };
    }
  }

  private static isProfileComplete(u: StoredUser): boolean {
    // Heuristic: has displayName and at least a location or a university
    const hasName = !!(u.displayName && u.displayName.trim().length);
    const hasLoc = !!(u.city || u.state);
    const hasSchool = !!u.universityId;
    return !!(hasName && (hasLoc || hasSchool));
  }
}
