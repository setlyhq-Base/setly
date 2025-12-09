import { Request, Response } from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Simple rate limiting memory bucket (dev only safeguard)
const WINDOW_MS = 60_000;
const MAX_REQ = 300; // generous for dev; tune for prod
let bucket: { windowStart: number; count: number } = { windowStart: Date.now(), count: 0 };

function allow(): boolean {
  const now = Date.now();
  if (now - bucket.windowStart > WINDOW_MS) { bucket = { windowStart: now, count: 0 }; }
  bucket.count++; return bucket.count <= MAX_REQ;
}

function mapsKey(): string | null {
  const k = process.env.GOOGLE_MAPS_API_KEY || '';
  return k || null;
}

function sessionToken(req: Request): string | null {
  return typeof req.query.session === 'string' ? req.query.session : null;
}

// Lightweight dev fallback suggestions if key missing (keeps UX usable in local dev)
const DEV_CITIES = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
  'San Francisco, CA', 'Seattle, WA', 'Boston, MA', 'Austin, TX', 'Miami, FL',
  'Denver, CO', 'Atlanta, GA', 'Portland, OR', 'Dallas, TX', 'Philadelphia, PA'
];

export class PlacesController {
  static async autocomplete(req: Request, res: Response) {
    try {
      if (!allow()) return res.status(429).json({ error: 'rate_limited' });
      const input = String(req.query.input || '').trim();
      if (!input) return res.json({ predictions: [] });
      const token = sessionToken(req);
      const key = mapsKey();
      if (!key) {
        // Dev fallback (no key configured): basic substring match on DEV_CITIES list
        const lower = input.toLowerCase();
        const predictions = DEV_CITIES.filter(c => c.toLowerCase().includes(lower)).slice(0, 5).map(c => ({
          description: c,
          place_id: 'dev:' + c,
          structured_formatting: { main_text: c.split(',')[0], secondary_text: c.split(',').slice(1).join(', ').trim() }
        }));
        return res.json({ predictions, warning: 'maps_key_missing_dev_fallback' });
      }
  const params = new URLSearchParams({ input, key, types: 'geocode|address|establishment', components: 'country:us' });
      if (token) params.set('sessiontoken', token);
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
      const resp = await fetch(url);
      const data: any = await resp.json();
      if (!resp.ok) {
        return res.status(resp.status).json({ error: 'autocomplete_upstream', status: resp.status, message: data?.error_message || 'upstream_error' });
      }
      let predictions = Array.isArray(data?.predictions) ? data.predictions : [];
      // Augment with fuzzy institution matches if predictions sparse (<3) or tokens suggest university
      if (predictions.length < 3) {
        const fuzzy = fuzzyInstitutionPredictions(input).slice(0, 5);
        // Avoid duplicates by description
        const existing = new Set(predictions.map((p: any) => p.description));
        for (const f of fuzzy) { if (!existing.has(f.description)) predictions.push(f); }
      }
      res.json({ predictions });
    } catch (e: any) {
      res.status(500).json({ error: 'autocomplete_failed', message: e?.message });
    }
  }

  static async details(req: Request, res: Response) {
    try {
      if (!allow()) return res.status(429).json({ error: 'rate_limited' });
      const placeId = String(req.query.placeId || '').trim();
      if (!placeId) return res.status(400).json({ error: 'missing_placeId' });
      const token = sessionToken(req);
      const key = mapsKey();
      if (!key || placeId.startsWith('dev:')) {
        // Dev fallback: fabricate details
        return res.json({ result: {
          formatted_address: placeId.replace(/^dev:/,'') || 'Unknown',
          geometry: { location: { lat: 0, lng: 0 } },
          address_components: [],
          name: placeId.replace(/^dev:/,'')
        }});
      }
      const params = new URLSearchParams({ place_id: placeId, key, fields: 'formatted_address,geometry,address_components,name' });
      if (token) params.set('sessiontoken', token);
      const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
      const resp = await fetch(url);
      const data: any = await resp.json();
      if (!resp.ok) {
        return res.status(resp.status).json({ error: 'details_upstream', status: resp.status, message: data?.error_message || 'upstream_error' });
      }
      res.json({ result: data?.result || null });
    } catch (e: any) {
      res.status(500).json({ error: 'details_failed', message: e?.message });
    }
  }

  static async textSearch(req: Request, res: Response) {
    try {
      if (!allow()) return res.status(429).json({ error: 'rate_limited' });
      const query = String(req.query.query || '').trim();
      if (!query) return res.json({ results: [] });
      const key = mapsKey();
      if (!key) {
        // Dev fallback: reuse autocomplete list as broad "search" results
        const lower = query.toLowerCase();
        const results = DEV_CITIES.filter(c => c.toLowerCase().includes(lower)).slice(0,3).map(c => ({
          formatted_address: c,
          geometry: { location: { lat: 0, lng: 0 } },
          name: c.split(',')[0]
        }));
        return res.json({ results, warning: 'maps_key_missing_dev_fallback' });
      }
      const params = new URLSearchParams({ query, key });
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
      const resp = await fetch(url);
      const data: any = await resp.json();
      if (!resp.ok) {
        return res.status(resp.status).json({ error: 'textsearch_upstream', status: resp.status, message: data?.error_message || 'upstream_error' });
      }
      const results = Array.isArray(data?.results) ? data.results.slice(0, 3) : [];
      res.json({ results });
    } catch (e: any) {
      res.status(500).json({ error: 'textsearch_failed', message: e?.message });
    }
  }

  // GET /api/places/institution?name=...
  // Attempts: (1) fuzzy exact dataset match, (2) Google Text Search for broader place, (3) synthetic placeholder.
  static async institution(req: Request, res: Response) {
    try {
      if (!allow()) return res.status(429).json({ error: 'rate_limited' });
      const raw = String(req.query.name || '').trim();
      if (!raw) return res.status(400).json({ error: 'missing-name' });
      const names = loadInstitutionNames();
      const lower = raw.toLowerCase();
      // Direct exact case-insensitive match first
      const exact = names.find(n => n.toLowerCase() === lower);
      if (exact) {
        // Synthetic deterministic pseudo coordinates for now (since dataset lacks lat/lng); hash to lat/lng range
        const hash = [...exact].reduce((a,c) => a + c.charCodeAt(0), 0);
        const lat = 25 + (hash % 25); // 25..49
        const lng = -125 + (hash % 60); // -125..-65
        return res.json({ result: { name: exact, formatted_address: exact, geometry: { location: { lat, lng } }, source: 'institution-exact' } });
      }
      // Fuzzy candidate (top from fuzzyInstitutionPredictions)
      const fuzzy = fuzzyInstitutionPredictions(raw).shift();
      if (fuzzy) {
        const fname = fuzzy.description;
        const hash = [...fname].reduce((a,c) => a + c.charCodeAt(0), 0);
        const lat = 25 + (hash % 25);
        const lng = -125 + (hash % 60);
        return res.json({ result: { name: fname, formatted_address: fname, geometry: { location: { lat, lng } }, source: 'institution-fuzzy' } });
      }
      // Try Google Text Search for enrichment if key present
      const key = mapsKey();
      if (key) {
        const params = new URLSearchParams({ query: raw, key });
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`;
        const resp = await fetch(url);
        const data: any = await resp.json();
        const first = Array.isArray(data?.results) ? data.results[0] : null;
        if (first) {
          return res.json({ result: { name: first.name || raw, formatted_address: first.formatted_address || first.name || raw, geometry: first.geometry, source: 'google-textsearch' } });
        }
      }
      // Final synthetic fallback
      return res.json({ result: { name: raw, formatted_address: raw, geometry: { location: { lat: 0, lng: 0 } }, source: 'synthetic' } });
    } catch (e: any) {
      res.status(500).json({ error: 'institution_failed', message: e?.message });
    }
  }

  // GET /api/places/nearby - Get nearby places for Explore page
  static async nearby(req: Request, res: Response) {
    try {
      if (!allow()) return res.status(429).json({ error: 'rate_limited' });
      
      const locationStr = String(req.query.location || '');
      const category = String(req.query.type || '');
      const radius = Number(req.query.radius || 5000);
      
      if (!locationStr) {
        return res.status(400).json({ error: 'missing_location' });
      }

      // Parse location "lat,lng"
      const [latStr, lngStr] = locationStr.split(',');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: 'invalid_location' });
      }

      const location = { lat, lng };
      const key = mapsKey();
      
      // If no API key, return mock data for development
      if (!key) {
        return res.json({ 
          results: generateMockPlaces(category, location),
          warning: 'maps_key_missing_dev_fallback' 
        });
      }

      const type = category || 'point_of_interest';

      const params = new URLSearchParams({
        location: locationStr,
        radius: radius.toString(),
        type: type,
        key: key
      });

      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
      const resp = await fetch(url);
      const data: any = await resp.json();

      if (!resp.ok) {
        return res.status(resp.status).json({ 
          error: 'nearby_upstream', 
          status: resp.status, 
          message: data?.error_message || 'upstream_error' 
        });
      }

      const results = Array.isArray(data?.results) ? data.results : [];
      res.json({ results });
      
    } catch (e: any) {
      res.status(500).json({ error: 'nearby_failed', message: e?.message });
    }
  }
}

// --- Institution fuzzy matching helpers ---
let institutionNames: string[] | null = null;
function loadInstitutionNames(): string[] {
  if (institutionNames) return institutionNames;
  try {
    const file = path.join(process.cwd(), 'backend', 'data', 'us_institutions.json');
    const raw = fs.readFileSync(file, 'utf-8');
    const arr = JSON.parse(raw);
    institutionNames = Array.isArray(arr) ? arr.map(x => String(x.institution || '').trim()).filter(Boolean) : [];
  } catch {
    institutionNames = [];
  }
  return institutionNames;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
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

function fuzzyInstitutionPredictions(input: string) {
  const names = loadInstitutionNames();
  if (!input || names.length === 0) return [] as any[];
  const cleaned = input.toLowerCase();
  const tokens = cleaned.split(/[^a-z0-9]+/).filter(t => t.length > 2);
  // Heuristic: if user typed a misspelled "univer" token, treat it as "university"
  const normalizedTokens = tokens.map(t => t.startsWith('univer') ? 'university' : t);
  const scores: { name: string; score: number }[] = [];
  for (const name of names) {
    const lname = name.toLowerCase();
    let matched = 0; let penalty = 0;
    for (const t of normalizedTokens) {
      if (!t) continue;
      if (lname.includes(t)) { matched++; continue; }
      // Try word-level fuzzy
      const words = lname.split(/[^a-z0-9]+/);
      let best = Infinity;
      for (const w of words) {
        if (w.length < 3) continue;
        const dist = levenshtein(t, w);
        if (dist < best) best = dist;
        if (best === 0) break;
      }
      if (best <= Math.min(2, Math.floor(t.length/2))) { matched++; penalty += best * 0.5; }
    }
    if (matched === 0) continue;
    const score = matched - penalty - lname.length * 0.0005; // light length penalty
    if (score > 0) scores.push({ name, score });
  }
  scores.sort((a,b) => b.score - a.score);
  return scores.slice(0,5).map(s => ({
    description: s.name,
    place_id: 'uni:' + s.name,
    structured_formatting: { main_text: s.name, secondary_text: 'University' }
  }));
}

// Generate mock places for development when API key not available
function generateMockPlaces(type: string, location: { lat: number; lng: number }) {
  // Map Google Places type to mock category
  const categoryMap: Record<string, string> = {
    'restaurant': 'restaurants',
    'tourist_attraction': 'places',
    'point_of_interest': 'places',
    'gym': 'activities',
    'spa': 'activities',
    'bowling_alley': 'activities',
    'amusement_park': 'activities',
    'night_club': 'nightlife',
    'bar': 'nightlife',
    'park': 'outdoor',
    'campground': 'outdoor'
  };

  const category = categoryMap[type] || 'places';

  const mockData: Record<string, any[]> = {
    'restaurants': [
      { name: 'Campus Cafe', rating: 4.5, price_level: 2, vicinity: '123 College Ave' },
      { name: 'Pizza Palace', rating: 4.2, price_level: 1, vicinity: '456 Main St' },
      { name: 'Sushi Bar', rating: 4.7, price_level: 3, vicinity: '789 University Blvd' },
      { name: 'Burger Joint', rating: 4.0, price_level: 1, vicinity: '321 Campus Dr' },
      { name: 'Thai Garden', rating: 4.6, price_level: 2, vicinity: '654 Student Way' },
      { name: 'Italian Bistro', rating: 4.4, price_level: 2, vicinity: '111 Food St' },
      { name: 'Mexican Grill', rating: 4.3, price_level: 2, vicinity: '222 Taco Ave' },
      { name: 'Chinese Restaurant', rating: 4.5, price_level: 2, vicinity: '333 Wok Way' },
      { name: 'Steakhouse', rating: 4.8, price_level: 4, vicinity: '444 Meat Ln' },
      { name: 'Vegetarian Cafe', rating: 4.6, price_level: 2, vicinity: '555 Green St' }
    ],
    'places': [
      { name: 'City Museum', rating: 4.8, vicinity: '100 Museum Ln' },
      { name: 'Historic Downtown', rating: 4.5, vicinity: 'Downtown Area' },
      { name: 'Art Gallery', rating: 4.3, vicinity: '200 Art St' },
      { name: 'Science Center', rating: 4.6, vicinity: '300 Discovery Ave' },
      { name: 'Local Theater', rating: 4.4, vicinity: '400 Broadway' },
      { name: 'Public Library', rating: 4.7, vicinity: '500 Book St' },
      { name: 'City Park', rating: 4.5, vicinity: '600 Park Ave' },
      { name: 'Shopping District', rating: 4.2, vicinity: '700 Mall Rd' },
      { name: 'Historic Monument', rating: 4.4, vicinity: '800 History Blvd' },
      { name: 'Observation Deck', rating: 4.9, vicinity: '900 View Point' }
    ],
    'activities': [
      { name: 'Campus Gym', rating: 4.2, vicinity: 'Student Recreation Center' },
      { name: 'Rock Climbing Wall', rating: 4.5, vicinity: '500 Adventure Rd' },
      { name: 'Bowling Alley', rating: 4.0, vicinity: '600 Bowling Ln' },
      { name: 'Escape Room', rating: 4.7, vicinity: '700 Puzzle St' },
      { name: 'Arcade', rating: 4.3, vicinity: '800 Game Ave' },
      { name: 'Ice Skating Rink', rating: 4.6, vicinity: '900 Ice Dr' },
      { name: 'Trampoline Park', rating: 4.4, vicinity: '1000 Jump St' },
      { name: 'Mini Golf', rating: 4.1, vicinity: '1100 Putt Way' },
      { name: 'Laser Tag', rating: 4.5, vicinity: '1200 Laser Ln' },
      { name: 'Go Karts', rating: 4.7, vicinity: '1300 Speed Ave' }
    ],
    'nightlife': [
      { name: 'College Bar', rating: 4.1, vicinity: '900 Party Ln' },
      { name: 'Dance Club', rating: 4.4, vicinity: '1000 Club St' },
      { name: 'Live Music Venue', rating: 4.6, vicinity: '1100 Concert Ave' },
      { name: 'Karaoke Lounge', rating: 4.2, vicinity: '1200 Sing Way' },
      { name: 'Sports Bar', rating: 4.3, vicinity: '1300 Fan Blvd' },
      { name: 'Cocktail Bar', rating: 4.7, vicinity: '1400 Mix Dr' },
      { name: 'Rooftop Lounge', rating: 4.8, vicinity: '1500 Sky Terrace' },
      { name: 'Jazz Club', rating: 4.5, vicinity: '1600 Jazz St' },
      { name: 'Wine Bar', rating: 4.4, vicinity: '1700 Vine Way' },
      { name: 'Pub', rating: 4.2, vicinity: '1800 Brew Ave' }
    ],
    'outdoor': [
      { name: 'Campus Park', rating: 4.5, vicinity: 'University Grounds' },
      { name: 'Nature Trail', rating: 4.7, vicinity: 'Green Valley' },
      { name: 'Lake View', rating: 4.8, vicinity: 'Waterfront Dr' },
      { name: 'Botanical Garden', rating: 4.6, vicinity: '1400 Garden Way' },
      { name: 'Bike Path', rating: 4.4, vicinity: 'Riverside Trail' },
      { name: 'Dog Park', rating: 4.3, vicinity: '1900 Pup Pl' },
      { name: 'Picnic Area', rating: 4.5, vicinity: '2000 Blanket Blvd' },
      { name: 'Hiking Trail', rating: 4.7, vicinity: '2100 Trek Way' },
      { name: 'Beach', rating: 4.9, vicinity: '2200 Sand St' },
      { name: 'Campground', rating: 4.6, vicinity: '2300 Camp Rd' }
    ],
    'events': [
      { name: 'Event Center', rating: 4.5, vicinity: '1500 Event Plaza' },
      { name: 'Conference Hall', rating: 4.3, vicinity: '1600 Meeting St' },
      { name: 'Community Center', rating: 4.4, vicinity: '1700 Community Ave' },
      { name: 'Student Union', rating: 4.6, vicinity: 'Campus Center' },
      { name: 'Convention Center', rating: 4.7, vicinity: '1800 Convention Blvd' },
      { name: 'Amphitheater', rating: 4.8, vicinity: '2400 Stage Dr' },
      { name: 'Exhibition Hall', rating: 4.4, vicinity: '2500 Expo Way' },
      { name: 'Auditorium', rating: 4.6, vicinity: '2600 Performance St' },
      { name: 'Arena', rating: 4.7, vicinity: '2700 Sports Complex' },
      { name: 'Fairgrounds', rating: 4.5, vicinity: '2800 Fair Ln' }
    ]
  };

  const categoryData = mockData[category] || mockData['places'];
  
  return categoryData.map((place, index) => ({
    place_id: `mock_${type}_${index}`,
    name: place.name,
    rating: place.rating,
    price_level: place.price_level || undefined,
    vicinity: place.vicinity,
    geometry: {
      location: {
        lat: location.lat + (Math.random() - 0.5) * 0.05,
        lng: location.lng + (Math.random() - 0.5) * 0.05
      }
    },
    photos: [
      { photo_reference: 'mock_photo', height: 400, width: 600 }
    ],
    opening_hours: {
      open_now: Math.random() > 0.3
    },
    types: [type]
  }));
}