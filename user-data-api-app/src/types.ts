
/**
 * User entity definition.
 */
export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Statistics for the LRU Cache.
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastClear: number;
}
