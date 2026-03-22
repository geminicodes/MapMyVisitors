export interface RateLimitOptions {
  windowMs: number;
  max: number;
  maxEntries?: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter (best-effort).
 *
 * NOTE: In serverless / multi-instance environments this is not durable and should
 * be replaced with a shared store (Redis/Upstash). This is still useful for basic
 * protection and local dev.
 */
export function createInMemoryRateLimiter(options: RateLimitOptions) {
  const maxEntries = options.maxEntries ?? 10_000;
  const store = new Map<string, Entry>();

  function prune(now: number) {
    if (store.size <= maxEntries) return;
    // Avoid `for..of` over Map to support TS `target: es5`.
    const expiredKeys: string[] = [];
    store.forEach((entry, key) => {
      if (now > entry.resetAt) expiredKeys.push(key);
    });
    for (const key of expiredKeys) {
      store.delete(key);
      if (store.size <= maxEntries) return;
    }

    if (store.size <= maxEntries) return;

    // Still too big: drop oldest keys by insertion order (best-effort).
    const keysInOrder: string[] = [];
    store.forEach((_entry, key) => {
      keysInOrder.push(key);
    });
    const overflow = store.size - maxEntries;
    for (let i = 0; i < overflow && i < keysInOrder.length; i++) {
      store.delete(keysInOrder[i]);
    }
  }

  return {
    /**
     * Returns `true` if request is allowed, `false` otherwise.
     */
    allow(key: string): boolean {
      const now = Date.now();
      prune(now);

      const existing = store.get(key);
      if (!existing || now > existing.resetAt) {
        store.set(key, { count: 1, resetAt: now + options.windowMs });
        return true;
      }

      if (existing.count >= options.max) return false;
      existing.count += 1;
      return true;
    },
  };
}

