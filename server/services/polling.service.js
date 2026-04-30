/**
 * Polling Service — Searches and filters polling booth data.
 * @module services/polling
 */
const booths = require('../data/pollingBooths');
const { sanitize } = require('../middlewares/sanitizer');

/**
 * Search polling booths by name, area, or constituency.
 * @param {string} [query=''] - Search query string.
 * @returns {object[]} Matching polling booths.
 */
function searchBooths(query = '') {
  const q = sanitize(query).toLowerCase();
  if (!q) return booths;

  return booths.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.area.toLowerCase().includes(q) ||
    b.constituency.toLowerCase().includes(q)
  );
}

/**
 * Find nearest booths to given coordinates.
 * @param {number} lat - Latitude.
 * @param {number} lng - Longitude.
 * @param {number} [limit=5] - Maximum results.
 * @returns {object[]} Nearest booths sorted by distance.
 */
function findNearestBooths(lat, lng, limit = 5) {
  return booths
    .map(b => ({
      ...b,
      distance: Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

module.exports = { searchBooths, findNearestBooths };
