import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from './analytics.service';

export interface University {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  domains?: string[];
  webPages?: string[];
}

interface CachedPayload {
  fetchedAt: number; // epoch ms
  list: University[];
}

@Injectable({ providedIn: 'root' })
export class UniversityDirectoryService {
  private analytics = inject(AnalyticsService);
  private TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private IDB_DB = 'setly-directory';
  private IDB_STORE = 'universities';
  // Combined cache for US + IN dataset
  private IDB_KEY = 'us-in-v2';
  private LS_KEY = 'universities.usin.cache.v2';
  // Optional full US dataset filename (user can add this large file for comprehensive offline coverage)
  private FULL_US_FILE = 'assets/data/universities.us.full.json';
  // Remote pre-built dataset (S3). If defined in environment we fetch this once and hydrate.
  private REMOTE_URL = (environment as any).universitiesDataUrl || null;
  private initializing: Promise<void> | null = null;
  private ready = false;
  private list: University[] = [];
  private indexedByName: Map<string, University[]> = new Map();
  private cacheSource: 'api' | 'idb' | 'local' | 'bundled' | null = null;

  // Public API ---------------------------------------------------------------
  async getAll(): Promise<University[]> {
    if (!this.ready) await this.ensureInitialized();
    this.revalidateIfStale();
    return this.list;
  }

  async search(q: string): Promise<University[]> {
    if (!this.ready) await this.ensureInitialized();
    const query = (q || '').trim().toLowerCase();
    if (query.length < 1) return [];
    // Candidate selection strategy:
    // - For very short queries (<=2 chars), use first-letter bucket to keep things snappy
    // - For longer queries, search the full list for better recall (users expect broad matches like "university")
    // - If the first-letter bucket is unexpectedly tiny, fall back to full list as a safety
    const firstBucket = this.indexedByName.get(query[0]) || [];
    const useFullList = query.length >= 3 || firstBucket.length < 10;
    const candidates = useFullList ? this.list : firstBucket;
    const limit = useFullList ? 25 : 15;
    const scored = candidates
      .map(u => ({ u, score: this.score(query, u) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(x => x.u);
    return scored;
  }

  async refresh(): Promise<void> {
    const payload = await this.fetchFromApi();
    if (payload.list.length) {
      await this.saveToCaches(payload);
      this.hydrate(payload, 'api');
    }
  }

  // Initialization & caching ------------------------------------------------
  private async ensureInitialized(): Promise<void> {
    if (this.ready) return;
    if (this.initializing) return this.initializing;
    this.initializing = (async () => {
      // 0) Remote S3 dataset
      if (!this.ready && this.REMOTE_URL) {
        try {
          const res = await fetch(this.REMOTE_URL, { cache: 'force-cache' });
          if (res.ok) {
            const raw = await res.json();
            const normalized = this.normalizeRemote(raw);
            if (normalized.length > 0) {
              const payload: CachedPayload = { fetchedAt: Date.now(), list: normalized };
              this.hydrate(payload, 'api');
              // Save to caches for offline reuse
              await this.saveToCaches(payload);
            }
          }
        } catch {/* ignore remote fetch errors */}
      }
      // 0b) Backend dataset endpoint as a fallback (if configured)
      if (!this.ready) {
        const apiBase = (environment as any).apiBaseUrl || '';
        if (apiBase) {
          try {
            const res = await fetch(`${apiBase.replace(/\/$/, '')}/universities`, { cache: 'force-cache' });
            if (res.ok) {
              const data = await res.json();
              const list = Array.isArray(data?.list) ? this.normalizeRemote(data.list) : [];
              if (list.length) {
                const payload: CachedPayload = { fetchedAt: Date.now(), list };
                this.hydrate(payload, 'bundled');
                await this.saveToCaches(payload);
              }
            }
          } catch {/* ignore backend fetch errors */}
        }
      }
      // 1) IndexedDB
      let payload = await this.loadFromIDB();
      if (payload && Array.isArray(payload.list) && payload.list.length > 0) { this.hydrate(payload, 'idb'); }
      // 2) localStorage
      if (!this.ready) {
        payload = this.loadFromLocalStorage();
        if (payload && Array.isArray(payload.list) && payload.list.length > 0) { this.hydrate(payload, 'local'); }
      }
      // 3) bundled fallback (single combined dataset if available)
      if (!this.ready) {
        try {
          // Prefer a single merged dataset if present in assets
          const combinedRes = await fetch('assets/data/us_in_universities.json');
          if (combinedRes.ok) {
            const combined = await combinedRes.json();
            const list = this.normalizeRemote(combined);
            if (list.length > 0) {
              payload = { fetchedAt: Date.now(), list } as CachedPayload;
              this.hydrate(payload, 'bundled');
            }
          } else {
            // Legacy fallback paths (kept for dev resilience if file lingers locally)
            const [fullUsRes, usRes, inRes] = await Promise.allSettled([
              fetch(this.FULL_US_FILE), // may 404 if not present
              fetch('assets/data/universities.us.min.json'),
              fetch('assets/data/universities.in.min.json')
            ]);
            let us: any[] = [];
            if (fullUsRes.status === 'fulfilled' && fullUsRes.value.ok) {
              try { us = await fullUsRes.value.json(); } catch { us = []; }
            }
            if (!us.length && usRes.status === 'fulfilled') {
              try { us = await usRes.value.json(); } catch { us = []; }
            }
            const ind = inRes.status === 'fulfilled' ? await inRes.value.json() : [];
            const list = this.mergeAndDedup(us, ind);
            if (list.length > 0) {
              payload = { fetchedAt: Date.now(), list } as CachedPayload;
              this.hydrate(payload, 'bundled');
            }
          }
        } catch {}
      }
      // 4) As a last resort, fetch live (may take time); do not block UI once we already hydrated
      if (!this.ready) {
        try {
          payload = await this.fetchFromApi();
          if (payload.list.length) {
            await this.saveToCaches(payload);
            this.hydrate(payload, 'api');
          }
        } catch {}
      } else {
        // We have some data; if TTL expired, refresh in background
        this.revalidateIfStale();
      }
    })();
    await this.initializing;
  }

  private hydrate(payload: CachedPayload, source: 'api' | 'idb' | 'local' | 'bundled') {
    // Normalize: ensure id + camelCase webPages for any raw bundled entries
    const normalized = payload.list.map((u: any) => {
      const id: string = u.id || this.simpleId(u);
      const webPages = u.webPages || u.web_pages || undefined;
      return { ...u, id, webPages } as University;
    });
    this.list = normalized;
    this.indexedByName = this.buildIndex(this.list);
    const firstWarm = !this.ready;
    this.ready = true;
    this.cacheSource = source;
    if (firstWarm) {
      this.analytics.fire('universities_cache_warmed', { count: this.list.length, source });
      try { console.info('[UniversityDirectory] cache warmed', { count: this.list.length, source }); } catch {}
    }
  }

  private async revalidateIfStale() {
    // If not yet loaded, skip; if stale, refresh without awaiting
    if (!this.ready) return;
    const now = Date.now();
    const meta = await this.loadFromIDBMeta();
    const fetchedAt = meta?.fetchedAt || 0;
    if (now - fetchedAt > this.TTL_MS) {
      this.refresh().catch(() => {/* ignore */});
    }
  }

  // Fetch & normalize --------------------------------------------------------
  private async fetchFromApi(): Promise<CachedPayload> {
    const base = (environment as any).universityApiBase || 'https://universities.hipolabs.com';
    const normBase = base.replace(/\/$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      // Avoid heavy fetches when offline
      const canFetch = typeof navigator === 'undefined' ? true : (navigator.onLine !== false);
      const conn: any = (navigator as any)['connection'];
      const saveData = !!conn?.saveData;
      const badNet = conn?.effectiveType && /2g/.test(conn.effectiveType);
      if (!canFetch || saveData || badNet) throw new Error('net_unavailable');

      const [usRes, inRes] = await Promise.allSettled([
        fetch(`${normBase}/search?country=${encodeURIComponent('United States')}`, { signal: controller.signal }),
        fetch(`${normBase}/search?country=${encodeURIComponent('India')}`, { signal: controller.signal })
      ]);
      const us = usRes.status === 'fulfilled' && usRes.value.ok ? await usRes.value.json() : [];
      let ind: any[] = [];
      if (inRes.status === 'fulfilled' && inRes.value.ok) {
        ind = await inRes.value.json();
      } else {
        // Fallback to bundled IN list if network fails
        try { ind = await (await fetch('assets/data/universities.in.min.json')).json(); } catch {}
      }
      const merged = this.mergeAndDedup(us, ind);
      const list: University[] = await Promise.all(
        merged.map(async (u: any) => {
          const name = u.name as string;
          const state = u['state-province'] || '';
          const domain0 = Array.isArray(u.domains) && u.domains[0] ? u.domains[0] : '';
          const country = (u.country || '').toString();
          const id = await this.hashId(`${name}|${state}|${domain0}|${country}`);
          return {
            id,
            name,
            state: state || undefined,
            city: undefined,
            country: country || undefined,
            domains: u.domains,
            webPages: u.web_pages,
          } as University;
        })
      );
      if (!list.length) throw new Error('universities_api_empty');
      return { fetchedAt: Date.now(), list };
    } finally {
      clearTimeout(timeout);
    }
  }

  private mergeAndDedup(us: any[], ind: any[]): any[] {
    const merged = ([] as any[]).concat(us || [], ind || []);
    const byKey = new Map<string, any>();
    for (const u of merged) {
      const key = `${(u.name||'').toLowerCase()}|${(u.country||'').toLowerCase()}|${(Array.isArray(u.domains)&&u.domains[0]||'').toLowerCase()}`;
      if (!byKey.has(key)) byKey.set(key, u);
    }
    return Array.from(byKey.values());
  }

  // Normalizes remote dataset entries which may be simple { institution: "Name" } or already in our shape.
  private normalizeRemote(raw: any): University[] {
    if (!Array.isArray(raw)) return [];
    return raw.map((r: any) => {
      if (r && r.name) {
        return {
          id: r.id || this.simpleHash(r.name + '|' + (r.country||'')),
          name: r.name,
          city: r.city,
          state: r.state,
          country: r.country || (r.name && /university/i.test(r.name) ? 'United States' : undefined),
          domains: r.domains,
          webPages: r.webPages || r.web_pages
        } as University;
      }
      if (r && r.institution) {
        return {
          id: this.simpleHash(r.institution),
          name: r.institution,
          country: 'United States'
        } as University;
      }
      return null;
    }).filter(Boolean) as University[];
  }

  private simpleHash(str: string): string {
    let h = 0;
    for (let i=0;i<str.length;i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return 'r' + (h >>> 0).toString(16);
  }

  private buildIndex(list: University[]): Map<string, University[]> {
    const idx = new Map<string, University[]>();
    for (const u of list) {
      const first = (u.name?.[0] || '').toLowerCase();
      if (!idx.has(first)) idx.set(first, []);
      idx.get(first)!.push(u);
    }
    return idx;
  }

  // Scoring: startsWith > includes > fuzzy subsequence
  private score(q: string, u: University): number {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]+/g, '');
    const n = norm(u.name || '');
    const qq = norm(q);
    if (!n) return 0;
    if (n.startsWith(qq)) return 300 - Math.abs(n.length - qq.length); // prefer tight matches
    if (n.includes(qq)) return 200 - (n.indexOf(qq));
    // fuzzy subsequence
    let qi = 0;
    for (let i = 0; i < n.length && qi < qq.length; i++) {
      if (n[i] === qq[qi]) qi++;
    }
    return qi === qq.length ? 100 - (n.length - qq.length) : 0;
  }

  // Caching helpers ----------------------------------------------------------
  private async loadFromIDB(): Promise<CachedPayload | null> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.IDB_STORE, 'readonly');
      const store = tx.objectStore(this.IDB_STORE);
      const result: any = await new Promise((resolve, reject) => {
        const req = store.get(this.IDB_KEY);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      return result;
    } catch { return null; }
  }

  private async loadFromIDBMeta(): Promise<{ fetchedAt: number } | null> {
    const payload = await this.loadFromIDB();
    return payload ? { fetchedAt: payload.fetchedAt } : null;
  }

  private async saveToCaches(payload: CachedPayload): Promise<void> {
    await this.saveToIDB(payload);
    this.saveToLocalStorage(payload);
  }

  private async saveToIDB(payload: CachedPayload): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.IDB_STORE, 'readwrite');
      const store = tx.objectStore(this.IDB_STORE);
      await new Promise<void>((resolve, reject) => {
        const req = store.put(payload, this.IDB_KEY);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      db.close();
    } catch {}
  }

  private loadFromLocalStorage(): CachedPayload | null {
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.list)) return null;
      return parsed as CachedPayload;
    } catch { return null; }
  }

  private saveToLocalStorage(payload: CachedPayload): void {
    try { localStorage.setItem(this.LS_KEY, JSON.stringify(payload)); } catch {}
  }

  private async openDB(): Promise<IDBDatabase> {
    return await new Promise((resolve, reject) => {
      const req = indexedDB.open(this.IDB_DB, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.IDB_STORE)) db.createObjectStore(this.IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  private async hashId(input: string): Promise<string> {
    const enc = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest('SHA-1', enc);
    const bytes = Array.from(new Uint8Array(buf));
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback deterministic id builder when we don't have hashed ids (sync for hydrate)
  private simpleId(u: any): string {
    const name = (u.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    const domain = Array.isArray(u.domains) && u.domains[0] ? (u.domains[0] || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'nodomain';
    const country = (u.country || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 6) || 'xx';
    return `f-${name}-${country}-${domain}`.slice(0, 80);
  }
}
