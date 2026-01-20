import type { RateLimitEntry } from '@/lib/types/security';

/**
 * In-memory store for rate limit entries
 * Key format: "ip:endpoint"
 */
const store = new Map<string, RateLimitEntry>();

/**
 * Get an entry from the store
 * @param key - The store key (ip:endpoint)
 * @returns The rate limit entry or undefined
 */
export function getEntry(key: string): RateLimitEntry | undefined {
  return store.get(key);
}

/**
 * Set an entry in the store
 * @param key - The store key (ip:endpoint)
 * @param entry - The rate limit entry
 */
export function setEntry(key: string, entry: RateLimitEntry): void {
  store.set(key, entry);
}

/**
 * Delete an entry from the store
 * @param key - The store key (ip:endpoint)
 */
export function deleteEntry(key: string): void {
  store.delete(key);
}

/**
 * Clean up expired entries from the store
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

/**
 * Get the current size of the store (for debugging)
 */
export function getStoreSize(): number {
  return store.size;
}

/**
 * Clear all entries from the store (for testing)
 */
export function clearStore(): void {
  store.clear();
}
