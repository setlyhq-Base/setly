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
  country?: string;
  universityId?: string;
  organization?: string;
  company?: string;
  role?: 'student' | 'professional' | string;
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
  isProfileComplete?: boolean;
  lastLoginAt?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  preferences?: {
    wakeSchedule?: string;
    cleanliness?: string;
    noiseTolerance?: string;
    pets?: string;
    overnightGuests?: string;
    cookingHabits?: string;
    budgetMin?: number;
    budgetMax?: number;
    preferredRoommateGender?: string;
    moveInDate?: FirebaseFirestore.Timestamp | string;
  };
  travelHistory?: Array<{
    city?: string;
    state?: string;
    country?: string;
    university?: string;
    startDate?: FirebaseFirestore.Timestamp | string;
    endDate?: FirebaseFirestore.Timestamp | string;
    label?: string;
  }>;
  connectionsCount?: number;
}

const COLLECTION = 'users';

export class UserService {
  static async upsertAuthUser(authUid: string, email: string, displayName?: string, photoUrl?: string): Promise<StoredUser> {
    let safeEmail = (email || '').trim();
    let incomingName = (displayName || '').trim();
    let safePhoto = (photoUrl || '').trim();

    const deriveName = (primary: string, emailValue: string, fallback: string): string => {
      if (primary) return primary;
      if (emailValue) return emailValue.includes('@') ? emailValue.split('@')[0] : emailValue;
      return fallback;
    };

    // Dev fallback when Firestore is not configured
    if (!db) {
      const now: any = new Date();
      const resolvedEmail = safeEmail || 'dev@example.com';
      const resolvedName = deriveName(incomingName, resolvedEmail, 'Dev User');
      return {
        id: authUid,
        authUid,
        email: resolvedEmail,
        displayName: resolvedName,
        photoUrl: safePhoto,
        bio: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        organization: '',
        company: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        isProfileComplete: false,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        preferences: {},
        travelHistory: [],
        connectionsCount: 0,
      } as any as StoredUser;
    }

    try {
      const ref = db.collection(COLLECTION).doc(authUid);
      const snap = await ref.get();
      const now = firestore.Timestamp.now();
      const resolvedName = deriveName(incomingName, safeEmail, 'Setly member');

      if (!snap.exists) {
        const newUser: StoredUser = {
          id: authUid,
          authUid,
          email: safeEmail,
          displayName: resolvedName,
          photoUrl: safePhoto,
          phone: '',
          city: '',
          state: '',
          country: '',
          organization: '',
          company: '',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
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
          },
          isProfileComplete: false,
          preferences: {},
          travelHistory: [],
          connectionsCount: 0,
        } as StoredUser;
        await ref.set(newUser, { merge: true });
        return newUser;
      }

      const data = snap.data() as StoredUser;
      const updated: Partial<StoredUser> = { updatedAt: now, lastLoginAt: now };
      if (data.email !== safeEmail) updated.email = safeEmail;
      if (incomingName && data.displayName !== incomingName) {
        updated.displayName = incomingName;
      } else if (!data.displayName && resolvedName && data.displayName !== resolvedName) {
        updated.displayName = resolvedName;
      }
      if (safePhoto && data.photoUrl !== safePhoto) updated.photoUrl = safePhoto;

      await ref.set(updated, { merge: true });
      const latest = (await ref.get()).data() as StoredUser;
      return latest;
    } catch (e) {
      // Firestore is initialized but not reachable/authorized; fall back to Auth info or stub
      logger.warnRate('user_upsert_firestore_fail', 30_000, '[UserService.upsertAuthUser] Firestore write failed, falling back:', (e as any)?.message || e);
      const now: any = new Date();
      let resolvedEmail = safeEmail;
      let resolvedName = incomingName;
      let resolvedPhoto = safePhoto;
      try {
        if (auth) {
          const au = await auth.getUser(authUid);
          resolvedName = resolvedName || au.displayName || '';
          resolvedPhoto = resolvedPhoto || au.photoURL || '';
          resolvedEmail = resolvedEmail || au.email || '';
        }
      } catch {}
      resolvedEmail = resolvedEmail || 'dev@example.com';
      const finalName = deriveName(resolvedName, resolvedEmail, 'User');
      return {
        id: authUid,
        authUid,
        email: resolvedEmail,
        displayName: finalName,
        photoUrl: resolvedPhoto,
        bio: '',
        phone: '',
        city: '',
        state: '',
        country: '',
        organization: '',
        company: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        isProfileComplete: false,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        preferences: {},
        travelHistory: [],
        connectionsCount: 0,
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
        phone: '',
        city: '',
        state: '',
        country: '',
        organization: '',
        company: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        isProfileComplete: false,
        lastLoginAt: now,
        createdAt: now,
        updatedAt: now,
        preferences: {},
        travelHistory: [],
        connectionsCount: 0,
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
            phone: au.phoneNumber || '',
            city: '',
            state: '',
            country: '',
            organization: '',
            company: '',
            languages: [],
            interests: [],
            socials: {},
            profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
            isProfileComplete: false,
            lastLoginAt: now,
            createdAt: now,
            updatedAt: now,
            preferences: {},
            travelHistory: [],
            connectionsCount: 0,
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
        'displayName','bio','phone','city','state','country','universityId','organization','company','role','languages','interests','socials','avatarKey','profileVisibility','photoUrl','isProfileComplete','preferences','travelHistory','connectionsCount'
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

    if (!db) {
      return this.listUsersFromAuth(limit, completeOnly);
    }

    try {
      const store = db!;
      const buildQuery = (field: 'lastLoginAt' | 'updatedAt'): FirebaseFirestore.Query => {
        let q: FirebaseFirestore.Query = store.collection(COLLECTION).orderBy(field, 'desc').limit(limit);
        if (cursorIso) {
          const ts = firestore.Timestamp.fromDate(new Date(cursorIso));
          q = q.startAfter(ts);
        }
        return q;
      };

      let cursorField: 'lastLoginAt' | 'updatedAt' = 'lastLoginAt';
      let snapshot: FirebaseFirestore.QuerySnapshot;
      try {
        snapshot = await buildQuery('lastLoginAt').get();
      } catch (err) {
        logger.warnRate('user_list_lastlogin_order_fail', 30_000, '[UserService.listUsers] ordering by lastLoginAt failed, falling back to updatedAt:', (err as any)?.message || err);
        snapshot = await buildQuery('updatedAt').get();
        cursorField = 'updatedAt';
      }

      if (snapshot.empty && cursorIso && cursorField === 'lastLoginAt') {
        // Some legacy documents might not have lastLoginAt yet; fall back when paging.
        snapshot = await buildQuery('updatedAt').get();
        cursorField = 'updatedAt';
      }

      const docs = snapshot.docs;
      const usersRaw = docs.map(d => d.data() as StoredUser);
      let users = completeOnly ? usersRaw.filter(u => this.isProfileComplete(u)) : usersRaw;

  if (auth && users.length < limit) {
        try {
          const existing = new Set(users.map(u => u.id));
          const authRes = await auth.listUsers(1000);
          for (const u of authRes.users) {
            if (existing.has(u.uid)) continue;
            const authUser: StoredUser = {
              id: u.uid,
              authUid: u.uid,
              email: u.email || '',
              displayName: u.displayName || (u.email || u.uid),
              photoUrl: u.photoURL || undefined,
              bio: '',
              phone: u.phoneNumber || '',
              city: '',
              state: '',
              country: '',
              organization: '',
              company: '',
              languages: [],
              interests: [],
              socials: {},
              profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
              isProfileComplete: false,
              createdAt: firestore.Timestamp.fromDate(new Date(u.metadata.creationTime || Date.now())),
              updatedAt: firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime || u.metadata.creationTime || Date.now())),
              lastLoginAt: firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime || u.metadata.creationTime || Date.now())),
              preferences: {},
              travelHistory: [],
              connectionsCount: 0,
            } as any;
            if (!completeOnly || this.isProfileComplete(authUser)) {
              users.push(authUser);
            }
            if (users.length >= limit) break;
          }
        } catch (mergeErr) {
          logger.warnRate('user_list_merge_auth_fail', 60_000, '[UserService.listUsers] unable to merge Auth users:', (mergeErr as any)?.message || mergeErr);
        }
      }

  const toMillis = (ts?: FirebaseFirestore.Timestamp) => ts?.toMillis?.() ?? ts?.toDate?.()?.getTime?.() ?? 0;
  users.sort((a, b) => toMillis(b.lastLoginAt || b.updatedAt) - toMillis(a.lastLoginAt || a.updatedAt));

      const last = snapshot.docs[snapshot.docs.length - 1]?.data() as StoredUser | undefined;
      let nextCursor: string | undefined = undefined;
      if (last) {
        const ts = cursorField === 'lastLoginAt' ? (last.lastLoginAt || last.updatedAt) : (last.updatedAt || last.lastLoginAt);
        nextCursor = ts?.toDate?.().toISOString?.();
      }
      return { users, nextCursor };
    } catch (e) {
      logger.warnRate('user_list_firestore_fail', 30_000, '[UserService.listUsers] Firestore unavailable, attempting Auth fallback:', (e as any)?.message || e);
      return this.listUsersFromAuth(limit, completeOnly);
    }
  }

  private static async listUsersFromAuth(limit: number, completeOnly: boolean): Promise<{ users: StoredUser[]; nextCursor?: string }> {
    if (!auth) {
      return { users: [], nextCursor: undefined };
    }
    try {
      const res = await auth.listUsers(1000);
      const mapped: StoredUser[] = res.users.slice(0, limit).map((u) => ({
        id: u.uid,
        authUid: u.uid,
        email: u.email || '',
        displayName: u.displayName || (u.email || u.uid),
        photoUrl: u.photoURL || undefined,
        bio: '',
        phone: u.phoneNumber || '',
        city: '',
        state: '',
        country: '',
        organization: '',
        company: '',
        languages: [],
        interests: [],
        socials: {},
        profileVisibility: { about: true, travelHistory: true, reviews: true, interests: true, connections: true, verification: true },
        isProfileComplete: false,
        createdAt: firestore.Timestamp.fromDate(new Date(u.metadata.creationTime || Date.now())),
        updatedAt: firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime || u.metadata.creationTime || Date.now())),
        lastLoginAt: firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime || u.metadata.creationTime || Date.now())),
        preferences: {},
        travelHistory: [],
        connectionsCount: 0,
      } as any));
      const filtered = completeOnly ? mapped.filter(u => this.isProfileComplete(u)) : mapped;
      return { users: filtered, nextCursor: undefined };
    } catch (authErr) {
      logger.error('[UserService.listUsersFromAuth] Auth fallback failed:', (authErr as any)?.message || authErr);
      return { users: [], nextCursor: undefined };
    }
  }

  static isProfileComplete(u: StoredUser): boolean {
    if (typeof u.isProfileComplete === 'boolean') return u.isProfileComplete;
    // Heuristic: has displayName and at least a location or a university
    const hasName = !!(u.displayName && u.displayName.trim().length);
    const hasLoc = !!(u.city || u.state || u.country);
    const hasSchool = !!(u.universityId || u.organization);
    return !!(hasName && (hasLoc || hasSchool));
  }
}
