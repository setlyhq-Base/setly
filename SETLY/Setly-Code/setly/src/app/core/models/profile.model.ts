export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  /** Optional banner / cover image shown behind avatar */
  coverImageUrl?: string;
  /** Short personal headline or tagline (e.g. "CS student | Traveler") */
  headline?: string;
  location?: string; // e.g., "Boston, MA"
  about?: string;
  profession?: string;
  languages?: string[];
  interests?: string[]; // keys matching interest chips
  socials?: { linkedin?: string; instagram?: string; twitter?: string; website?: string; whatsapp?: string };
  stats: ProfileStats;
  verifications: VerificationState;
  /** Cached completion percentage (0-100) optionally supplied by backend; if absent compute on client */
  completionPercent?: number;
}

export interface ProfileStats {
  roomsPosted: number;
  ridesShared: number;
  connectionsCount: number;
  marketplaceItems?: number;
}

export interface TravelHistoryEntry {
  id: string;
  city: string;
  state: string;
  university?: string;
  startDate: string; // ISO
  endDate: string; // ISO
  coverImage?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  fromUserLocation?: string;
  toUserId: string;
  city?: string;
  createdAt: string; // ISO
  rating?: number;
  comment: string;
  type: 'received' | 'given' | 'pending';
}

export interface VerificationState {
  identity: boolean;
  university: boolean;
  phone: boolean;
  email: boolean;
}

export interface Connection {
  id: string;
  name: string;
  avatarUrl?: string;
  university?: string;
  location?: string;
  tags?: string[];
  mutualUniversities?: number;
  sharedTrips?: number;
}

export interface InterestChip {
  key: string;
  label: string;
  icon?: string; // emoji or icon text
}

/** Keys controlling which sections appear publicly */
export interface ProfileVisibility {
  about?: boolean;
  travelHistory?: boolean;
  reviews?: boolean;
  interests?: boolean;
  connections?: boolean;
  verification?: boolean;
}

// ----- Completion Logic Helper ------------------------------------------------
// Lightweight heuristic assigning weights to profile fields to derive a % used
// for motivating users to finish their profile. Safe to tweak later or replace
// with backend-provided score.
// We deliberately keep logic deterministic & side‑effect free for easy testing.
export function computeProfileCompletion(p: UserProfile): number {
  if (!p) return 0;
  const checks: boolean[] = [];
  // Identity basics
  checks.push(!!p.avatarUrl);
  checks.push(!!p.headline);
  checks.push(!!p.location);
  // Rich info
  checks.push(!!p.about && p.about.trim().length >= 40); // encourage substantive bio
  checks.push(!!p.profession);
  checks.push(!!(p.languages && p.languages.length));
  checks.push(!!(p.interests && p.interests.length >= 3));
  // Socials (count each present)
  const socials = p.socials || {};
  ['linkedin','instagram','website'].forEach(k => checks.push(!!(socials as any)[k]));
  // Verifications (each counts)
  Object.values(p.verifications || {}).forEach(v => checks.push(!!v));

  const score = checks.filter(Boolean).length;
  const total = checks.length;
  return Math.round((score / total) * 100);
}

// ----- Spec-aligned minimal types and completion calculator -----------------
// These mirror the build spec contract for API/store wiring while keeping
// backward compatibility with existing UserProfile above.

export interface ProfileSpec {
  userId: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  headline?: string;
  about?: string;
  location?: string;
  university?: string;
  program?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  company?: string;
  title?: string;
  languages?: string[];
  interests?: string[];
  socials?: { linkedin?: string; instagram?: string; website?: string; whatsapp?: string };
  visibility?: { publicProfile?: boolean; showCity?: boolean; showSchool?: boolean };
  completion?: number;
}

export interface VerificationsSpec {
  emailVerified: boolean;
  phoneVerified: boolean;
  eduVerified: boolean;
  idVerified: boolean;
}

/** Spec-compliant completion calculator used by guards and banners */
export function computeCompletion(p: ProfileSpec, v: VerificationsSpec): number {
  let score = 0;
  if (p.avatarUrl && p.displayName) score += 20;
  if (p.about && (p.interests?.length ?? 0) >= 3) score += 15;
  if ((p.location && (p.university || p.company))) score += 15;
  if (v.phoneVerified || v.emailVerified) score += 20;
  if (v.eduVerified || v.idVerified) score += 20;
  if (p.visibility && ('showCity' in p.visibility)) score += 10; // safety prefs saved
  return Math.min(100, score);
}
