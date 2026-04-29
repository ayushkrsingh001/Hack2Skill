/**
 * Express Server — Serves static frontend + secure API endpoints
 * Security: Helmet, CORS, rate limiting, input sanitization
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
      scriptSrc: ["'self'", "https://maps.googleapis.com", "https://www.gstatic.com", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.googleapis.com", "https://*.gstatic.com"],
      connectSrc: ["'self'", "https://*.googleapis.com"]
    }
  }
}));

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '10kb' })); // Limit body size

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
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'&]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c])).trim().slice(0, 500);
}

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
  }
}));

// ===== API Routes =====

// Chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }
  // In production, this would connect to an AI service
  res.json({ reply: 'This endpoint is for future AI integration. The chatbot currently runs client-side.', timestamp: new Date().toISOString() });
});

// Quiz endpoint — returns questions
app.get('/api/quiz', (req, res) => {
  const questions = require('./data/quizQuestions');
  // Shuffle and return subset
  const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
  res.json({ questions: shuffled });
});

// Polling booth search (mock)
app.get('/api/polling', (req, res) => {
  const { q } = req.query;
  const query = sanitize(q || '');
  const booths = require('./data/pollingBooths');
  const results = query
    ? booths.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.area.toLowerCase().includes(query.toLowerCase()))
    : booths;
  res.json({ booths: results });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Election Assistant server running at http://localhost:${PORT}`);
});

module.exports = app; // Export for testing
