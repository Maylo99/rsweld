/**
 * Minimal in-memory fixed-window rate limiter, used to slow down brute-force
 * attempts against the single admin password.
 *
 * Deliberately not distributed: this site runs as a single small deployment and
 * the limiter is a speed bump, not the security boundary (that is the password
 * plus the signed session cookie). Counters reset on redeploy.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the window resets - for the "try again later" message. */
  retryAfterSeconds: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > 500) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) {
        buckets.delete(entryKey);
      }
    }
  }

  return {
    allowed: bucket.count <= limit,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

/** Clears the bucket after a successful attempt. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}
