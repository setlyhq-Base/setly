import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor() {
    // Default TTL: 10 minutes, check period: 2 minutes
    this.cache = new NodeCache({
      stdTTL: 600,
      checkperiod: 120,
      useClones: false
    });
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.cache.set(key, value, ttl || 600);
  }

  /**
   * Delete key from cache
   */
  del(key: string): number {
    return this.cache.del(key);
  }

  /**
   * Clear all cache
   */
  flush(): void {
    this.cache.flushAll();
  }

  /**
   * Generate cache key for explore data
   */
  static getExploreCacheKey(
    city: string,
    category: string,
    lat?: number,
    lng?: number
  ): string {
    const coords = lat && lng ? `_${lat.toFixed(2)}_${lng.toFixed(2)}` : '';
    return `explore_${city}_${category}${coords}`;
  }

  /**
   * Cache explore results for 10 minutes
   */
  cacheExploreResults(
    city: string,
    category: string,
    data: any,
    lat?: number,
    lng?: number
  ): void {
    const key = CacheService.getExploreCacheKey(city, category, lat, lng);
    this.set(key, data, 600); // 10 minutes
  }

  /**
   * Get cached explore results
   */
  getCachedExploreResults(
    city: string,
    category: string,
    lat?: number,
    lng?: number
  ): any | undefined {
    const key = CacheService.getExploreCacheKey(city, category, lat, lng);
    return this.get(key);
  }
}

export const cacheService = new CacheService();
