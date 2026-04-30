/**
 * Security Middleware — Helmet, CORS, and security headers.
 * Provides production-grade HTTP security configuration.
 * @module middlewares/security
 */
const helmet = require('helmet');
const cors = require('cors');

/**
 * Configures and returns an array of security middleware.
 * @returns {Function[]} Array of Express middleware functions.
 */
function securityMiddleware() {
  return [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://maps.googleapis.com", "https://www.gstatic.com", "https://apis.google.com", "https://*.googleapis.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
          fontSrc: ["https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.openstreetmap.org"],
          connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com", "https://generativelanguage.googleapis.com"]
        }
      },
      xXssProtection: true
    }),
    cors({
      origin: process.env.ALLOWED_ORIGIN || '*',
      methods: ['GET', 'POST']
    })
  ];
}

module.exports = securityMiddleware;
