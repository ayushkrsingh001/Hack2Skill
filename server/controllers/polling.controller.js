/**
 * Polling Controller — Handles polling booth search and nearby queries.
 * @module controllers/polling
 */
const { searchBooths, findNearestBooths } = require('../services/polling.service');

/**
 * GET /api/polling — Search booths by query or return all.
 * @param {import('express').Request} req - Request with optional ?q= query.
 * @param {import('express').Response} res
 */
function getBooths(req, res) {
  const { q } = req.query;
  const results = searchBooths(q || '');
  res.json({ booths: results });
}

/**
 * GET /api/polling/nearby — Find nearest booths to coordinates.
 * @param {import('express').Request} req - Request with ?lat=&lng= query params.
 * @param {import('express').Response} res
 */
function getNearbyBooths(req, res) {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid lat and lng are required.' });
  }

  const results = findNearestBooths(lat, lng, 5);
  res.json({ booths: results });
}

module.exports = { getBooths, getNearbyBooths };
