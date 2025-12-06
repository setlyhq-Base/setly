import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type GeoSuggestionKind = 'city' | 'university' | 'fallback';

export interface GeoSuggestion {
  id: string;
  label: string;
  city?: string;
  state?: string;
  country?: string;
  lat?: number;
  lon?: number;
  description?: string;
  kind: GeoSuggestionKind;
  source: 'google_places' | 'universities' | 'open_meteo';
  name?: string;
  meta?: Record<string, unknown>;
}

export interface AddressSuggestion {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  postcode?: string;
  country: string;
  lat?: number;
  lon?: number;
  description?: string;
  source: 'google_places' | 'nominatim';
  meta?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private http = inject(HttpClient);
  search(query: string): Observable<GeoSuggestion[]> {
    if (!query || query.trim().length < 2) return new Observable(sub => { sub.next([]); sub.complete(); });
    const q = query.trim();
    return this.http.get<{ items: any[] }>(`/api/geo/search?q=${encodeURIComponent(q)}`).pipe(
      map(res => {
        let items = (res.items || []).map(r => normalizeSuggestion(r));
        if (needsUniversityFuzzy(q) && items.filter(i => i.kind==='university').length < 1) {
          const fuzzy = fuzzyUniversityMatches(q).map(name => ({
            id: 'fuzzy_uni:' + name,
            label: name,
            name,
            kind: 'university' as GeoSuggestionKind,
            source: 'universities',
            country: 'United States'
          }));
          // Merge de-duplicating by label
          const existing = new Set(items.map(i => i.label.toLowerCase()));
            for (const f of fuzzy) if (!existing.has(f.label.toLowerCase())) items.push(f as any);
        }
        return items;
      })
    );
  }

  addressLookup(query: string, opts?: { city?: string; state?: string; lat?: number; lon?: number }): Observable<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) return new Observable(sub => { sub.next([]); sub.complete(); });
    const params = new URLSearchParams({ q: query.trim() });
    if (opts?.city) params.set('city', opts.city);
    if (opts?.state) params.set('state', opts.state);
    if (typeof opts?.lat === 'number') params.set('lat', String(opts.lat));
    if (typeof opts?.lon === 'number') params.set('lon', String(opts.lon));
    return this.http.get<{ items: any[] }>(`/api/geo/address?${params.toString()}`).pipe(
      map(res => (res.items || []).map(r => normalizeAddressSuggestion(r)))
    );
  }
}

function normalizeSuggestion(raw: any): GeoSuggestion {
  const labelParts = [raw?.label, raw?.name, [raw?.city, raw?.state, raw?.country].filter(Boolean).join(', '), raw?.city, raw?.state, raw?.country]
    .map((v: any) => typeof v === 'string' ? v.trim() : '')
    .filter(Boolean);
  const label = labelParts[0] || 'Unknown location';
  const kind: GeoSuggestionKind = raw?.kind && ['city', 'university', 'fallback'].includes(raw.kind)
    ? raw.kind
    : 'city';
  const source = (raw?.source === 'google_places' || raw?.source === 'universities' || raw?.source === 'open_meteo')
    ? raw.source
    : 'open_meteo';
  const toNumber = (value: any): number | undefined => (typeof value === 'number' ? value : undefined);
  return {
    id: String(raw?.id ?? `suggestion:${label}:${Math.random().toString(36).slice(2)}`),
    label,
    city: raw?.city || undefined,
    state: raw?.state || undefined,
    country: raw?.country || undefined,
    lat: toNumber(raw?.lat),
    lon: toNumber(raw?.lon),
    description: raw?.description || undefined,
    kind,
    source,
    name: raw?.name || label,
    meta: raw?.meta && typeof raw.meta === 'object' ? raw.meta : undefined
  };
}

function normalizeAddressSuggestion(raw: any): AddressSuggestion {
  const label = typeof raw?.label === 'string' && raw.label.trim()
    ? raw.label.trim()
    : (typeof raw?.address === 'string' ? raw.address.trim() : 'Unknown address');
  const source = raw?.source === 'google_places' ? 'google_places' : 'nominatim';
  const toNumber = (value: any): number | undefined => (typeof value === 'number' ? value : undefined);
  return {
    id: String(raw?.id ?? `addr:${label}:${Math.random().toString(36).slice(2)}`),
    label,
    address: typeof raw?.address === 'string' ? raw.address : label,
    city: typeof raw?.city === 'string' ? raw.city : '',
    state: typeof raw?.state === 'string' ? raw.state : '',
    postcode: typeof raw?.postcode === 'string' ? raw.postcode : undefined,
    country: typeof raw?.country === 'string' ? raw.country : '',
    lat: toNumber(raw?.lat),
    lon: toNumber(raw?.lon),
    description: typeof raw?.description === 'string' ? raw.description : undefined,
    source,
    meta: raw?.meta && typeof raw.meta === 'object' ? raw.meta : undefined
  };
}

// --- Fuzzy University Matching (client-side assist) ---
let universityList: string[] | null = null;
function loadUniversityList(): string[] {
  if (universityList) return universityList;
  // Lazy fetch from backend static dataset endpoint or embedded subset for speed.
  // For simplicity, embed minimal list placeholder; backend sources full dataset when needed.
  universityList = [
    'University of New Haven', 'Yale University', 'Harvard University', 'Stanford University', 'Massachusetts Institute of Technology',
    'Princeton University', 'Columbia University', 'Cornell University', 'University of California Berkeley', 'University of California Los Angeles'
  ];
  return universityList;
}

function needsUniversityFuzzy(q: string): boolean {
  const lower = q.toLowerCase();
  return /(univer|college|institute|academy)/.test(lower);
}

function fuzzyUniversityMatches(q: string): string[] {
  const list = loadUniversityList();
  const lowerQ = q.toLowerCase();
  const normQ = lowerQ.replace(/univerisy|univeristy|unversity|unviersity/g, 'university');
  const scored: { name: string; score: number }[] = [];
  for (const name of list) {
    const lname = name.toLowerCase();
    let score = 0;
    // Token based scoring
    const tokens = normQ.split(/[^a-z0-9]+/).filter(t => t.length > 2);
    for (const t of tokens) {
      if (lname.includes(t)) score += 3;
      else {
        const dist = levenshtein(t, closestWord(lname, t));
        if (dist <= Math.min(2, Math.floor(t.length/2))) score += 2 - dist * 0.5;
      }
    }
    if (score > 0) scored.push({ name, score });
  }
  scored.sort((a,b) => b.score - a.score);
  return scored.slice(0,5).map(s => s.name);
}

function closestWord(haystack: string, token: string): string {
  let best = ''; let bestDist = Infinity;
  for (const w of haystack.split(/[^a-z0-9]+/)) {
    if (!w) continue;
    const d = levenshtein(token, w);
    if (d < bestDist) { bestDist = d; best = w; }
  }
  return best || token;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1));
  for (let i=0;i<=m;i++) dp[i][0]=i;
  for (let j=0;j<=n;j++) dp[0][j]=j;
  for (let i=1;i<=m;i++) {
    for (let j=1;j<=n;j++) {
      const cost = a[i-1]===b[j-1]?0:1;
      dp[i][j] = Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost);
    }
  }
  return dp[m][n];
}
