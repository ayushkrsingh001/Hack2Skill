/**
 * Security Module Tests — Validates input sanitization and XSS prevention
 */

// Recreate security functions for Node.js testing
function escapeHTML(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(str).replace(/[&<>"']/g, c => map[c]);
}

function sanitizeInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return escapeHTML(input.trim().slice(0, maxLength));
}

function validateAge(age) {
  const num = parseInt(age, 10);
  return !isNaN(num) && num >= 1 && num <= 150 ? num : null;
}

function validateName(name) {
  if (typeof name !== 'string') return '';
  const cleaned = name.trim().slice(0, 100);
  return /^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.'-]+$/.test(cleaned) ? cleaned : '';
}

describe('escapeHTML', () => {
  test('escapes < and >', () => {
    expect(escapeHTML('<script>')).toBe('&lt;script&gt;');
  });
  test('escapes quotes', () => {
    expect(escapeHTML('"hello" & \'world\'')).toBe('&quot;hello&quot; &amp; &#39;world&#39;');
  });
  test('handles non-string input', () => {
    expect(escapeHTML(123)).toBe('123');
    expect(escapeHTML(null)).toBe('null');
  });
  test('passes through safe strings', () => {
    expect(escapeHTML('hello world')).toBe('hello world');
  });
});

describe('sanitizeInput', () => {
  test('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });
  test('limits length', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeInput(long).length).toBeLessThanOrEqual(500);
  });
  test('returns empty for non-string', () => {
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
    expect(sanitizeInput(42)).toBe('');
  });
  test('escapes XSS payloads', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).not.toContain('<script>');
    expect(sanitizeInput('<img onerror=alert(1)>')).not.toContain('<img');
  });
});

describe('validateAge', () => {
  test('accepts valid ages', () => {
    expect(validateAge('18')).toBe(18);
    expect(validateAge('25')).toBe(25);
    expect(validateAge(65)).toBe(65);
  });
  test('rejects invalid ages', () => {
    expect(validateAge('0')).toBeNull();
    expect(validateAge('-5')).toBeNull();
    expect(validateAge('200')).toBeNull();
    expect(validateAge('abc')).toBeNull();
    expect(validateAge('')).toBeNull();
  });
});

describe('validateName', () => {
  test('accepts valid names', () => {
    expect(validateName('Priya')).toBe('Priya');
    expect(validateName('Rahul Kumar')).toBe('Rahul Kumar');
    expect(validateName('प्रिया')).toBe('प्रिया');
  });
  test('rejects names with special characters', () => {
    expect(validateName('<script>')).toBe('');
    expect(validateName('user@123')).toBe('');
  });
  test('rejects non-string input', () => {
    expect(validateName(null)).toBe('');
    expect(validateName(123)).toBe('');
  });
  test('limits name length', () => {
    const longName = 'A'.repeat(150);
    const result = validateName(longName);
    expect(result.length).toBeLessThanOrEqual(100);
  });
});
