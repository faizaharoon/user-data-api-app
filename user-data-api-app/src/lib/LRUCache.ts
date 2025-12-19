import { CacheStats } from '../types';


interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Least Recently Used (LRU) Cache Implementation.
 * Stores items with a maximum age (TTL).
 * Evicts expired items proactively and on access.
 */
export class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private readonly maxAge: number; // in milliseconds
  private readonly cleanupInterval: NodeJS.Timeout;
  private stats: CacheStats;

  /**
   * @param maxAgeSeconds Time-to-live for cache entries in seconds. Default: 60s.
   */
  constructor(maxAgeSeconds: number = 60) {
    this.cache = new Map();
    this.maxAge = maxAgeSeconds * 1000;
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      lastClear: Date.now(),
    };

    // Background task to clear stale cache entries
    this.cleanupInterval = setInterval(() => {
      this.prune();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Retrieves an item from the cache.
   * Updates the "Recently Used" status.
   * Returns null if item is missing or expired.
   */
  public get(key: string): T | null {
    if (!this.cache.has(key)) {
      this.stats.misses++;
      return null;
    }

    const entry = this.cache.get(key)!;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.size = this.cache.size;
      return null;
    }

    // Refresh LRU status by deleting and re-inserting
    // Map in JS maintains insertion order, so re-inserting moves it to the "end" (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Adds or updates an item in the cache.
   */
  public set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    
    // Create new entry
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + this.maxAge,
    };
    
    this.cache.set(key, entry); // Insert at the end (most recent)
    this.stats.size = this.cache.size;
  }

  /**
   * Clears all items from the cache.
   */
  public clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.lastClear = Date.now();
  }

  /**
   * Returns copy of current cache statistics.
   */
  public getStats(): CacheStats {
    return { ...this.stats }; // Return copy
  }

  /**
   * Removes expired items from the cache.
   * Called periodically by the background interval.
   */
  private prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      } else {
        // Optimization: Since maps preserve insertion order (LRU), and we usually 
        // add items with uniform TTL, we might not always be able to break early locally
        // if we refresh on access. But for pure expiration, we scan. 
        // For performance in huge caches, we might want to optimize this, 
        // but for this assignment, iterating is safe.
      }
    }
    this.stats.size = this.cache.size;
  }

  /**
   * Stops the background cleanup interval.
   * Should be called when cache is no longer needed to prevent open handles.
   */
  public destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}
