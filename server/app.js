/**
 * Express App Configuration — VoteSathi API
 * Configures middleware, routes, and error handling.
 * Exported separately from server.js for testing with supertest.
 * @module app
 */
const express = require('express');
const path = require('path');
const securityMiddleware = require('./middlewares/security');
const createRateLimiter = require('./middlewares/rateLimiter');
const { sanitizeBody } = require('./middlewares/sanitizer');

// Route modules
const chatRoutes = require('./routes/chat.routes');
const quizRoutes = require('./routes/quiz.routes');
const pollingRoutes = require('./routes/polling.routes');
const healthRoutes = require('./routes/health.routes');

const app = express();

// ===== Security Middleware =====
securityMiddleware().forEach(mw => app.use(mw));

// ===== Body Parsing =====
app.use(express.json({ limit: '10kb' }));

// ===== Input Sanitization =====
app.use(sanitizeBody);

// ===== Rate Limiting =====
app.use('/api/', createRateLimiter());

// ===== Static Files =====
app.use(express.static(path.join(__dirname, '..'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('X-XSS-Protection', '1; mode=block');
    res.set('Permissions-Policy', 'geolocation=(self), camera=(), microphone=(self)');
  }
}));

// ===== API Routes =====
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/polling', pollingRoutes);
app.use('/api/health', healthRoutes);

// ===== Error Handler =====
app.use((err, req, res, _next) => {
  res.status(err.status || 500).json({ error: 'Internal server error.' });
});

module.exports = app;
