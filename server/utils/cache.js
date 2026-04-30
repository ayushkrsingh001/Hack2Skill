/**
 * Lightweight in-memory cache with TTL.
 * Improves efficiency by preventing redundant computations and API calls.
 * @module utils/cache
 */

const cache = new Map();

/**
 * Get a value from the cache.
 * @param {string} key - Cache key.
 * @returns {any|null} The cached value, or null if expired/missing.
 */
function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

/**
 * Set a value in the cache with a Time-To-Live.
 * @param {string} key - Cache key.
 * @param {any} value - Value to store.
 * @param {number} [ttlSeconds=300] - TTL in seconds (default: 5 mins).
 */
function setCache(key, value, ttlSeconds = 300) {
  cache.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000
  });
}

/**
 * Clear all cached items.
 */
function clearCache() {
  cache.clear();
}

module.exports = { getCache, setCache, clearCache };
