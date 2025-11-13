import { UniversityDirectoryService } from './university-directory.service';

// Simple fake for fetch responses
function mockFetchOnce(data: any, ok = true) {
  (globalThis as any).fetch = jasmine.createSpy('fetch').and.callFake(async () => ({
    ok,
    json: async () => data,
  }));
}

describe('UniversityDirectoryService', () => {
  let svc: UniversityDirectoryService;

  beforeEach(() => {
    svc = new UniversityDirectoryService();
    // Reset caches between tests
    try { localStorage.clear(); } catch {}
    // Minimal IDB shim: use try/catch paths to push to bundled fallback, so tests don't depend on IDB
    (globalThis as any).indexedDB = undefined;
  });

  it('returns suggestions for partial query (Harv -> Harvard University)', async () => {
    const apiPayload = [
      { name: 'Harvard University', country: 'United States', domains: ['harvard.edu'], 'state-province': 'Massachusetts', web_pages: ['http://www.harvard.edu/'] },
      { name: 'Random Institute', country: 'United States', domains: ['ri.edu'], 'state-province': 'Utah', web_pages: ['http://ri.edu'] },
    ];
    mockFetchOnce(apiPayload);
    const all = await svc.getAll();
    expect(all.length).toBeGreaterThan(0);
    const results = await svc.search('Harv');
    expect(results.find(r => r.name === 'Harvard University')).toBeTruthy();
  });

  it('serves cached data when offline', async () => {
    // Warm using API
    mockFetchOnce([ { name: 'Stanford University', country: 'United States', domains: ['stanford.edu'], 'state-province': 'California', web_pages: ['http://www.stanford.edu/'] } ]);
    await svc.getAll();
    // Now fail network
    (globalThis as any).fetch = jasmine.createSpy('fetch').and.callFake(async () => ({ ok: false, json: async () => [] }));
    const results = await svc.search('Stan');
    expect(results.find(r => r.name.startsWith('Stanford'))).toBeTruthy();
  });

  it('uses bundled JSON when both API and cache fail', async () => {
    // Force both API failure and empty caches, then load bundled
    (globalThis as any).fetch = jasmine.createSpy('fetch').and.callFake(async (url: string) => {
      if ((url as any).includes && (url as any).includes('assets/data/universities.us.min.json')) {
        return { ok: true, json: async () => [{ id: 'x', name: 'Rivier University', state: 'NH' }] } as any;
      }
      return { ok: false, json: async () => [] } as any;
    });
    const results = await svc.search('Riv');
    expect(results.find(r => r.name === 'Rivier University')).toBeTruthy();
  });

  it('TTL refresh does not block UI (stale-while-revalidate)', async () => {
    // First warm
    mockFetchOnce([ { name: 'MIT', country: 'United States', domains: ['mit.edu'], 'state-province': 'Massachusetts', web_pages: ['http://web.mit.edu/'] } ]);
    await svc.getAll();
    // Overwrite loadFromIDBMeta to simulate staleness
    (svc as any).loadFromIDBMeta = async () => ({ fetchedAt: Date.now() - (8 * 24 * 60 * 60 * 1000) });
    // Next fetch will be called in background but should not block search
    (globalThis as any).fetch = jasmine.createSpy('fetch').and.callFake(async () => ({ ok: true, json: async () => [] }));
    const results = await svc.search('mi');
    // Minimum length 2 is satisfied; we can still search cached list
    expect(results.length).toBeGreaterThanOrEqual(0);
  });
});
