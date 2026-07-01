/**
 * @file src/lib/rate-limiter.ts
 * @description In-memory sliding window rate limiter for Next.js middleware.
 * Tracks request counts per key (IP or user ID) within a rolling time window.
 * No external dependencies.
 */

interface RateLimitEntry {
  /** Timestamps of requests within the current window */
  timestamps: number[];
  /** When to auto-clean this entry */
  expiresAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterSeconds?: number;
}

class SlidingWindowRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(options: { windowSeconds: number; maxRequests: number }) {
    this.windowMs = options.windowSeconds * 1000;
    this.maxRequests = options.maxRequests;

    // Cleanup expired entries every 60 seconds
    this.cleanupTimer = setInterval(() => this.cleanup(), 60_000);
    if (this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  /** Check if a request is allowed for the given key. */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let entry = this.store.get(key);
    if (!entry) {
      entry = { timestamps: [], expiresAt: now + this.windowMs * 2 };
      this.store.set(key, entry);
    }

    // Remove timestamps outside the current window
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart);
    entry.expiresAt = now + this.windowMs * 2;

    if (entry.timestamps.length >= this.maxRequests) {
      // Calculate when the oldest request in the window will expire
      const oldestInWindow = entry.timestamps[0];
      const retryAfterMs = oldestInWindow + this.windowMs - now;
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

      return {
        allowed: false,
        remaining: 0,
        limit: this.maxRequests,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    // Record this request
    entry.timestamps.push(now);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.timestamps.length,
      limit: this.maxRequests,
    };
  }

  /** Remove expired entries from the store. */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

// ── Pre-configured rate limiters ─────────────────────────────────────────────

/** Rate limiter for auth endpoints: 30 requests per minute per IP */
export const authRateLimiter = new SlidingWindowRateLimiter({
  windowSeconds: 60,
  maxRequests: 30,
});

/** Rate limiter for API endpoints: 120 requests per minute per user/IP */
export const apiRateLimiter = new SlidingWindowRateLimiter({
  windowSeconds: 60,
  maxRequests: 120,
});

/** Account lockout tracker: 5 failed login attempts = 15 min lockout */
export const loginAttemptTracker = new SlidingWindowRateLimiter({
  windowSeconds: 900, // 15 minutes
  maxRequests: 5,
});
