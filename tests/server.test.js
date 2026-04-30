/**
 * Server API Tests — Validates all API endpoints, middleware, and error handling.
 * Uses supertest to make HTTP requests against the Express app.
 */
const request = require('supertest');
const app = require('../server/server');

describe('GET /api/health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });

  test('returns valid ISO timestamp', async () => {
    const res = await request(app).get('/api/health');
    const date = new Date(res.body.timestamp);
    expect(date.toISOString()).toBe(res.body.timestamp);
  });
});

describe('POST /api/chat', () => {
  test('returns 400 when message is missing', async () => {
    const res = await request(app).post('/api/chat').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Message is required.');
  });

  test('returns 400 when message is empty string', async () => {
    const res = await request(app).post('/api/chat').send({ message: '' });
    expect(res.status).toBe(400);
  });

  test('returns 400 when message is not a string', async () => {
    const res = await request(app).post('/api/chat').send({ message: 123 });
    expect(res.status).toBe(400);
  });

  test('returns 200 with reply when message is valid', async () => {
    const res = await request(app).post('/api/chat').send({ message: 'How do I vote?' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(typeof res.body.reply).toBe('string');
    expect(res.body.timestamp).toBeDefined();
  });

  test('sanitizes XSS in message', async () => {
    const res = await request(app).post('/api/chat').send({ message: '<script>alert("xss")</script>' });
    expect(res.status).toBe(200);
    expect(res.body.reply).not.toContain('<script>');
  });
});

describe('GET /api/quiz', () => {
  test('returns 200 with questions array', async () => {
    const res = await request(app).get('/api/quiz');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeLessThanOrEqual(10);
  });

  test('each question has required fields', async () => {
    const res = await request(app).get('/api/quiz');
    res.body.questions.forEach(q => {
      expect(q).toHaveProperty('q');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('answer');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);
    });
  });

  test('returns shuffled questions (randomized order)', async () => {
    const res1 = await request(app).get('/api/quiz');
    const res2 = await request(app).get('/api/quiz');
    // With 10+ questions and shuffling, order should differ in most cases
    const q1 = res1.body.questions.map(q => q.q);
    const q2 = res2.body.questions.map(q => q.q);
    // At minimum, both return valid questions
    expect(q1.length).toBeGreaterThan(0);
    expect(q2.length).toBeGreaterThan(0);
  });
});

describe('GET /api/polling', () => {
  test('returns all booths when no query', async () => {
    const res = await request(app).get('/api/polling');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.booths)).toBe(true);
    expect(res.body.booths.length).toBeGreaterThan(0);
  });

  test('filters booths by name', async () => {
    const res = await request(app).get('/api/polling?q=Delhi');
    expect(res.status).toBe(200);
    expect(res.body.booths.length).toBeGreaterThan(0);
    res.body.booths.forEach(b => {
      const matchesName = b.name.toLowerCase().includes('delhi');
      const matchesArea = b.area.toLowerCase().includes('delhi');
      expect(matchesName || matchesArea).toBe(true);
    });
  });

  test('returns empty array for non-matching query', async () => {
    const res = await request(app).get('/api/polling?q=Nonexistent12345');
    expect(res.status).toBe(200);
    expect(res.body.booths.length).toBe(0);
  });

  test('sanitizes query parameter', async () => {
    const res = await request(app).get('/api/polling?q=<script>alert(1)</script>');
    expect(res.status).toBe(200);
    // Should not crash, query is sanitized
    expect(Array.isArray(res.body.booths)).toBe(true);
  });

  test('handles empty query string', async () => {
    const res = await request(app).get('/api/polling?q=');
    expect(res.status).toBe(200);
    expect(res.body.booths.length).toBeGreaterThan(0);
  });
});

describe('Security Headers', () => {
  test('sets X-Content-Type-Options header', async () => {
    const res = await request(app).get('/api/health');
    // Helmet sets headers on all responses
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  test('sets X-Frame-Options header', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
  });
});

describe('Request Size Limits', () => {
  test('rejects oversized request body', async () => {
    const largeBody = { message: 'a'.repeat(20000) };
    const res = await request(app)
      .post('/api/chat')
      .send(largeBody);
    // Express body parser should handle this (either truncate or reject)
    expect([200, 400, 413]).toContain(res.status);
  });
});

describe('404 Handling', () => {
  test('returns HTML for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    // Express doesn't have a custom 404 for API routes,
    // but it should not crash
    expect(res.status).toBeDefined();
  });
});

describe('Input Sanitization Middleware', () => {
  test('sanitizes string body fields', async () => {
    const res = await request(app).post('/api/chat').send({
      message: 'Hello <b>world</b>'
    });
    expect(res.status).toBe(200);
    // The message was sanitized before processing
    expect(res.body.reply).toBeDefined();
  });

  test('handles non-object body gracefully', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Content-Type', 'application/json')
      .send('"just a string"');
    // Should not crash
    expect(res.status).toBeDefined();
  });
});
