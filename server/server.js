/**
 * Express Server — Serves static frontend + secure API endpoints
 * Security: Helmet, CORS, rate limiting, input sanitization
 * @module server
 */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Security Middleware =====
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://maps.googleapis.com", "https://www.gstatic.com", "https://apis.google.com", "https://*.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://fonts.googleapis.com"],
      fontSrc: ["https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "https://*.googleapis.com", "https://*.gstatic.com", "https://*.openstreetmap.org"],
      connectSrc: ["'self'", "https://*.googleapis.com", "https://*.firebaseio.com"]
    }
  },
  xXssProtection: true
}));

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '10kb' }));

// Rate limiting — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// ===== Input Sanitization Middleware =====

/**
 * Escapes HTML special characters in a string to prevent XSS attacks.
 * @param {string} str - The input string to sanitize.
 * @returns {string} The sanitized string with HTML entities escaped.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])).trim().slice(0, 500);
}

/**
 * Express middleware that sanitizes all string values in the request body.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    }
  }
  next();
}
app.use(sanitizeBody);

// ===== Serve Static Frontend =====
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

/**
 * POST /api/chat — Accepts a chat message and returns a response.
 * In production, this would connect to an AI service.
 */
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }
  res.json({
    reply: 'This endpoint is for future AI integration. The chatbot currently runs client-side.',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/quiz — Returns a shuffled subset of quiz questions.
 */
app.get('/api/quiz', (req, res) => {
  const questions = require('./data/quizQuestions');
  const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
  res.json({ questions: shuffled });
});

/**
 * GET /api/polling — Searches polling booths by name or area.
 * @query {string} q - Search query string.
 */
app.get('/api/polling', (req, res) => {
  const { q } = req.query;
  const query = sanitize(q || '');
  const booths = require('./data/pollingBooths');
  const results = query
    ? booths.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.area.toLowerCase().includes(query.toLowerCase()))
    : booths;
  res.json({ booths: results });
});

/**
 * GET /api/health — Health check endpoint for monitoring.
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Error Handler =====
app.use((err, req, res, _next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({ error: 'Internal server error.' });
});

// ===== Start Server =====
if (require.main === module) {
  app.listen(PORT, () => {
    process.stdout.write(`Election Assistant server running at http://localhost:${PORT}\n`);
  });
}

module.exports = app;
