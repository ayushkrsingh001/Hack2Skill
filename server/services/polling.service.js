/**
 * Polling Service — Searches and filters polling booth data.
 * @module services/polling
 */
const booths = require('../data/pollingBooths');
const { sanitize } = require('../middlewares/sanitizer');
const { getCache, setCache } = require('../utils/cache');

/**
 * Search polling booths by name, area, or constituency.
 * @param {string} [query=''] - Search query string.
 * @returns {object[]} Matching polling booths.
 */
function searchBooths(query = '') {
  const q = sanitize(query).toLowerCase();
  if (!q) return booths;

  const cacheKey = `booths:search:${q}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const results = booths.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.area.toLowerCase().includes(q) ||
    b.constituency.toLowerCase().includes(q)
  );

  setCache(cacheKey, results, 600); // Cache for 10 minutes
  return results;
}

/**
 * Find nearest booths to given coordinates.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @param {number} [limit=5] - Maximum results.
 * @returns {object[]} Nearest booths sorted by distance.
 */
function findNearestBooths(lat, lng, limit = 5) {
  // Round to ~111m precision for high cache hit rate without sacrificing much accuracy
  const roundedLat = lat.toFixed(3);
  const roundedLng = lng.toFixed(3);
  const cacheKey = `booths:nearby:${roundedLat},${roundedLng},${limit}`;
  
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const results = booths
    .map(b => ({
      ...b,
      // Omit expensive Math.sqrt during O(n) mapping and O(n log n) sorting
      distanceSq: Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2)
    }))
    .sort((a, b) => a.distanceSq - b.distanceSq)
    .slice(0, limit)
    .map(b => {
      // Only run Math.sqrt on the final subset (O(1) operation)
      b.distance = Math.sqrt(b.distanceSq);
      delete b.distanceSq;
      return b;
    });

  setCache(cacheKey, results, 600);
  return results;
}

module.exports = { searchBooths, findNearestBooths };
