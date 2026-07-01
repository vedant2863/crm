/**
 * @file src/lib/cache.ts
 * @description Generic in-memory TTL cache for reducing redundant DB queries at scale.
 * Supports configurable TTL, max entries with LRU eviction, and pattern-based invalidation.
 * No external dependencies — pure Node.js implementation.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly defaultTTLMs: number;
  private readonly maxEntries: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: { defaultTTLSeconds?: number; maxEntries?: number } = {}) {
    this.defaultTTLMs = (options.defaultTTLSeconds ?? 60) * 1000;
    this.maxEntries = options.maxEntries ?? 10_000;

    // Periodic cleanup every 60 seconds
    this.cleanupTimer = setInterval(() => this.evictExpired(), 60_000);
    // Allow the process to exit even if the timer is still running
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /** Get a value from cache. Returns undefined if missing or expired. */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    entry.lastAccessed = Date.now();
    return entry.value;
  }

  /** Set a value in cache with optional custom TTL (in seconds). */
  set(key: string, value: T, ttlSeconds?: number): void {
    // Evict LRU entries if at capacity
    if (this.cache.size >= this.maxEntries && !this.cache.has(key)) {
      this.evictLRU();
    }

    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : this.defaultTTLMs;
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      lastAccessed: Date.now(),
    });
  }

  /** Delete a specific key from cache. */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /** Invalidate all keys matching a prefix. */
  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /** Clear all entries from cache. */
  clear(): void {
    this.cache.clear();
  }

  /** Get current cache size. */
  get size(): number {
    return this.cache.size;
  }

  /** Get or set: if key exists and is valid, return cached value. Otherwise, call factory, cache result, and return it. */
  async getOrSet(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const value = await factory();
    this.set(key, value, ttlSeconds);
    return value;
  }

  /** Remove all expired entries. */
  private evictExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /** Remove the least recently accessed entry. */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /** Stop the cleanup timer (for graceful shutdown). */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.cache.clear();
  }
}

// ── Singleton cache instances ────────────────────────────────────────────────

/** Cache for organization user ID lookups (60s TTL) */
export const orgCache = new TTLCache<string[]>({ defaultTTLSeconds: 60, maxEntries: 5_000 });

/** Cache for dashboard data per user (30s TTL) */
export const dashboardCache = new TTLCache<unknown>({ defaultTTLSeconds: 30, maxEntries: 2_000 });

/** Cache for notification scan timestamps (5 min TTL) */
export const notificationScanCache = new TTLCache<boolean>({ defaultTTLSeconds: 300, maxEntries: 5_000 });
