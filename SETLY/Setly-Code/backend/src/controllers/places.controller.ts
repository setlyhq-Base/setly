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