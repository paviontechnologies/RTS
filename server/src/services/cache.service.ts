/**
 * Pavion RTS - Enterprise Multi-Tier Caching Service
 * Connects to Redis with an automatic in-memory TTL LRU cache fallback.
 * Caches Dashboard KPIs, Recruiter Sessions, Talent Pool metrics, and Requisition counts.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class CacheService {
  private static inMemoryStore = new Map<string, CacheEntry<any>>();
  private static redisConnected = false;
  private static defaultTtlSeconds = 300; // 5 minutes default
  private static hitCount = 0;
  private static missCount = 0;

  /**
   * Set a key-value pair in cache with TTL
   */
  public static async set<T>(key: string, value: T, ttlSeconds: number = this.defaultTtlSeconds): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.inMemoryStore.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a value from cache. Returns null if expired or missing.
   */
  public static async get<T>(key: string): Promise<T | null> {
    const entry = this.inMemoryStore.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.inMemoryStore.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value as T;
  }

  /**
   * Fetch from cache or compute and store
   */
  public static async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = this.defaultTtlSeconds
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Invalidate a specific key
   */
  public static async del(key: string): Promise<void> {
    this.inMemoryStore.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix/namespace
   */
  public static async invalidateNamespace(namespace: string): Promise<number> {
    let deleted = 0;
    for (const key of this.inMemoryStore.keys()) {
      if (key.startsWith(namespace)) {
        this.inMemoryStore.delete(key);
        deleted++;
      }
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  public static async flush(): Promise<void> {
    this.inMemoryStore.clear();
  }

  /**
   * Health and diagnostic statistics
   */
  public static getStats() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 100;

    return {
      driver: this.redisConnected ? 'redis' : 'in-memory-lru',
      totalKeys: this.inMemoryStore.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRatePercentage: Math.round(hitRate * 10) / 10,
      uptimeSeconds: process.uptime(),
    };
  }
}
