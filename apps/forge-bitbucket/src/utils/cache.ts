/**
 * In-Memory Cache with TTL
 *
 * Simple cache implementation for storing temporary data with automatic expiration.
 * Used for caching diff analysis results to reduce API calls.
 */

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number;
}

/**
 * Generic memory cache with TTL support
 */
export class MemoryCache<T> {
	private cache = new Map<string, CacheEntry<T>>();

	/**
	 * Store data in cache with TTL
	 * @param key Cache key
	 * @param data Data to store
	 * @param ttl Time-to-live in milliseconds (default: 5 minutes)
	 */
	set(key: string, data: T, ttl: number = 300000): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl,
		});
	}

	/**
	 * Retrieve data from cache if not expired
	 * @param key Cache key
	 * @returns Cached data or null if expired/not found
	 */
	get(key: string): T | null {
		const entry = this.cache.get(key);

		if (!entry) {
			return null;
		}

		const age = Date.now() - entry.timestamp;
		if (age > entry.ttl) {
			this.cache.delete(key); // Remove expired entry
			return null;
		}

		return entry.data;
	}

	/**
	 * Check if key exists and is not expired
	 */
	has(key: string): boolean {
		return this.get(key) !== null;
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * Get cache size (excluding expired entries)
	 */
	size(): number {
		// Clean expired entries
		this.cache.forEach((entry, key) => {
			const age = Date.now() - entry.timestamp;
			if (age > entry.ttl) {
				this.cache.delete(key);
			}
		});
		return this.cache.size;
	}

	/**
	 * Delete specific key
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}
}

/**
 * Singleton cache instance for diff analysis results
 * Cache key format: diff:{repoUuid}:{commitHash}
 */
export const diffCache = new MemoryCache<{
	modifiedFiles: any[];
	totalLinesAdded: number;
	totalLinesRemoved: number;
}>();
