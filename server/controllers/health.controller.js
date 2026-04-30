/**
 * Health Controller — Health check endpoint for monitoring.
 * @module controllers/health
 */
const { getPersonalizedGuidance } = require('../services/guidance.service');

/**
 * GET /api/health — Returns server status.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function healthCheck(req, res) {
  res.json({
    status: 'ok',
    service: 'VoteSathi API',
    timestamp: new Date().toISOString()
  });
}

/**
 * POST /api/guidance — Returns personalized election guidance.
 * @param {import('express').Request} req - Request with user profile.
 * @param {import('express').Response} res
 */
function getGuidance(req, res) {
  const profile = req.body || {};
  const guidance = getPersonalizedGuidance(profile);
  res.json(guidance);
}

module.exports = { healthCheck, getGuidance };
