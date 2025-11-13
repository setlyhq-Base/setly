import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AnalyticsService } from './analytics.service';

export interface University {
  id: string;
  name: string;
  city?: string;
  state?: string;
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
  private IDB_KEY = 'us';
  private LS_KEY = 'universities.us.cache.v1';
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
    if (query.length < 2) return [];
    // Prefer indexed fast path by first letter
    const candidates = this.indexedByName.get(query[0]) || this.list;
    const scored = candidates
      .map(u => ({ u, score: this.score(query, u) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
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
      // 1) IndexedDB
      let payload = await this.loadFromIDB();
      if (payload) { this.hydrate(payload, 'idb'); }
      // 2) localStorage
      if (!this.ready) {
        payload = this.loadFromLocalStorage();
        if (payload) { this.hydrate(payload, 'local'); }
      }
      // 3) bundled fallback
      if (!this.ready) {
        try {
          const res = await fetch('assets/data/universities.us.min.json');
          const list = await res.json();
          payload = { fetchedAt: Date.now(), list } as CachedPayload;
          this.hydrate(payload, 'bundled');
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
    this.list = payload.list;
    this.indexedByName = this.buildIndex(this.list);
    const firstWarm = !this.ready;
    this.ready = true;
    this.cacheSource = source;
    if (firstWarm) {
      this.analytics.fire('universities_cache_warmed', { count: this.list.length, source });
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
    const url = `${base.replace(/\/$/, '')}/search?country=United%20States`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('universities_api_failed');
    const raw = await res.json();
    const list: University[] = await Promise.all(
      (raw || []).map(async (u: any) => {
        const name = u.name as string;
        const state = u['state-province'] || '';
        const domain0 = Array.isArray(u.domains) && u.domains[0] ? u.domains[0] : '';
        const id = await this.hashId(`${name}|${state}|${domain0}`);
        return {
          id,
          name,
          state: state || undefined,
          city: undefined,
          domains: u.domains,
          webPages: u.web_pages,
        } as University;
      })
    );
    return { fetchedAt: Date.now(), list };
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
}
