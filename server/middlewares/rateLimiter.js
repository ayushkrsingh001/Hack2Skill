/**
 * Rate Limiter Middleware — Prevents API abuse with per-IP request limits.
 * @module middlewares/rateLimiter
 */
const rateLimit = require('express-rate-limit');

/**
 * Creates a rate limiter for API routes.
 * @param {object} [options] - Override default rate limit options.
 * @returns {Function} Express rate limiting middleware.
 */
function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: { error: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    ...options
  });
}

module.exports = createRateLimiter;
