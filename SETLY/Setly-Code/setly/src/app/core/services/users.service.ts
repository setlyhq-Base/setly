import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PublicUserProfile {
  id: string;
  displayName: string;
  photoUrl?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  city?: string;
  state?: string;
  universityId?: string;
  phone?: string;
  email?: string;
  country?: string;
  organization?: string;
  company?: string;
  role?: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  socials?: { linkedin?: string; instagram?: string; website?: string; whatsapp?: string };
  preferences?: Record<string, unknown>;
  travelHistory?: Array<Record<string, unknown>>;
  lastLoginAt?: { seconds: number; nanoseconds: number } | string;
  updatedAt?: { seconds: number; nanoseconds: number } | string;
  isProfileComplete?: boolean;
  connectionsCount?: number;
}

export interface RoommatePreferences {
  wakeSchedule?: string;
  cleanliness?: string;
  noiseTolerance?: string;
  pets?: string;
  overnightGuests?: string;
  cookingHabits?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredRoommateGender?: string;
  moveInDate?: string;
}

export interface LocationHistoryItem {
  city: string;
  state?: string;
  university?: string;
  startDate?: string;
  endDate?: string;
  label?: string;
}

export interface PublicUserDetail {
  id: string;
  name: string;
  avatarUrl?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: string;
  universityId?: string;
  role: 'Student' | 'Working professional';
  badges: { email: boolean; phone: boolean; university: boolean; photo: boolean };
  trustScore: number;
  joinedAt?: string;
  lastActiveAt?: string;
  bio?: string;
  interests: string[];
  languages: string[];
  socials?: { linkedin?: string; instagram?: string; website?: string; whatsapp?: string };
  isProfileComplete: boolean;
  preferences?: RoommatePreferences;
  travelHistory: LocationHistoryItem[];
  connectionsCount: number;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);

  getUserById(id: string): Observable<{ name: string; avatarUrl?: string; joinedYear?: number } | null> {
    return this.http.get<PublicUserProfile>(`/api/users/${id}`).pipe(
      map((dto: any) => {
        if (!dto || !dto.id) return null;
        let joinedYear: number | undefined;
        const created = dto.createdAt as any;
        if (created) {
          if (typeof created === 'string') {
            const d = new Date(created);
            if (!isNaN(d.getTime())) joinedYear = d.getFullYear();
          } else if (typeof created === 'object' && typeof created.seconds === 'number') {
            const d = new Date(created.seconds * 1000);
            joinedYear = d.getFullYear();
          } else if (created instanceof Date) {
            const d = created as Date;
            if (!isNaN(d.getTime())) joinedYear = d.getFullYear();
          }
        }
        return {
          name: dto.displayName || 'Host',
          avatarUrl: dto.photoUrl,
          joinedYear,
        };
      })
    );
  }

  // Richer profile info for public profile page
  getUserDetail(id: string): Observable<PublicUserDetail | null> {
    return this.http.get<PublicUserProfile>(`/api/users/${id}`).pipe(
      map((dto: any) => {
        if (!dto || !dto.id) return null;
        const locationParts = [dto.city, dto.state, dto.country]
          .map((part: unknown) => typeof part === 'string' ? part.trim() : '')
          .filter(Boolean);
        const location = locationParts.join(', ');
        const rawRole = typeof dto.role === 'string' ? dto.role.toLowerCase() : '';
        const role: 'Student' | 'Working professional' = rawRole === 'professional'
          ? 'Working professional'
          : 'Student';
        const badges = {
          email: !!dto.email,
          phone: !!dto.phone,
          university: !!dto.universityId,
          photo: !!dto.photoUrl
        };
        const trustScore = computeTrustScore(dto, badges);
        const organization = [dto.universityId, dto.organization, dto.company]
          .map((part: unknown) => typeof part === 'string' ? part.trim() : '')
          .find(Boolean);
        const interests = Array.isArray(dto.interests)
          ? dto.interests.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : [];
        const languages = Array.isArray(dto.languages)
          ? dto.languages.filter((item: unknown): item is string => typeof item === 'string' && item.trim().length > 0)
          : [];
        const travelHistory = mapTravelHistory(dto.travelHistory);
        return {
          id: dto.id,
          name: dto.displayName || 'User',
          avatarUrl: dto.photoUrl,
          location: location || undefined,
          city: typeof dto.city === 'string' ? dto.city : undefined,
          state: typeof dto.state === 'string' ? dto.state : undefined,
          country: typeof dto.country === 'string' ? dto.country : undefined,
          organization: organization || undefined,
          universityId: typeof dto.universityId === 'string' && dto.universityId.trim().length ? dto.universityId : undefined,
          role,
          badges,
          trustScore,
          joinedAt: toIso(dto.createdAt),
          lastActiveAt: toIso(dto.lastLoginAt) || toIso(dto.updatedAt),
          bio: typeof dto.bio === 'string' ? dto.bio : undefined,
          interests,
          languages,
          socials: typeof dto.socials === 'object' ? dto.socials : undefined,
          isProfileComplete: !!dto.isProfileComplete,
          preferences: mapPreferences(dto.preferences),
          travelHistory,
          connectionsCount: typeof dto.connectionsCount === 'number' ? dto.connectionsCount : 0,
        } as PublicUserDetail;
      })
    );
  }
}

function toIso(raw: unknown): string | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'string') {
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? undefined : raw.toISOString();
  }
  if (typeof raw === 'number') {
    const parsed = new Date(raw);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  }
  if (typeof raw === 'object') {
    const obj = raw as any;
    if (typeof obj?.toDate === 'function') {
      const d = obj.toDate();
      return d instanceof Date && !isNaN(d.getTime()) ? d.toISOString() : undefined;
    }
    if (typeof obj?.seconds === 'number') {
      const d = new Date(obj.seconds * 1000);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    }
  }
  return undefined;
}

function computeTrustScore(payload: any, badges: { email: boolean; phone: boolean; university: boolean; photo: boolean }): number {
  let score = 40;
  const badgeBonus = Object.values(badges).filter(Boolean).length * 12;
  score += badgeBonus;
  if (typeof payload?.bio === 'string') {
    const len = payload.bio.trim().length;
    if (len >= 160) score += 12;
    else if (len >= 80) score += 8;
    else if (len >= 20) score += 4;
  }
  if (Array.isArray(payload?.interests) && payload.interests.length >= 3) score += 8;
  if (payload?.isProfileComplete) score += 10;
  return Math.max(30, Math.min(100, Math.round(score)));
}

function mapPreferences(raw: unknown): RoommatePreferences | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const src = raw as any;
  const prefs: RoommatePreferences = {};
  if (typeof src.wakeSchedule === 'string') prefs.wakeSchedule = src.wakeSchedule;
  if (typeof src.cleanliness === 'string') prefs.cleanliness = src.cleanliness;
  if (typeof src.noiseTolerance === 'string') prefs.noiseTolerance = src.noiseTolerance;
  if (typeof src.pets === 'string') prefs.pets = src.pets;
  if (typeof src.overnightGuests === 'string') prefs.overnightGuests = src.overnightGuests;
  if (typeof src.cookingHabits === 'string') prefs.cookingHabits = src.cookingHabits;
  if (typeof src.budgetMin === 'number') prefs.budgetMin = src.budgetMin;
  if (typeof src.budgetMax === 'number') prefs.budgetMax = src.budgetMax;
  if (typeof src.preferredRoommateGender === 'string') prefs.preferredRoommateGender = src.preferredRoommateGender;
  const moveIn = toIso(src.moveInDate);
  if (moveIn) prefs.moveInDate = moveIn;
  return Object.keys(prefs).length ? prefs : undefined;
}

function mapTravelHistory(raw: unknown): LocationHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry: any) => {
      if (!entry || typeof entry !== 'object') return null;
      const city = typeof entry.city === 'string' ? entry.city : undefined;
      const state = typeof entry.state === 'string' ? entry.state : undefined;
      if (!city && !state && typeof entry.label !== 'string') return null;
      return {
        city: city || '',
        state,
        university: typeof entry.university === 'string' ? entry.university : undefined,
        startDate: toIso(entry.startDate),
        endDate: toIso(entry.endDate),
        label: typeof entry.label === 'string' ? entry.label : undefined,
      } as LocationHistoryItem;
    })
    .filter((item): item is LocationHistoryItem => !!item);
}
