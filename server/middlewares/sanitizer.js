/**
 * Input Sanitization Middleware — Prevents XSS by escaping HTML entities.
 * @module middlewares/sanitizer
 */

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param {string} str - The input string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>"'&]/g, c => ({
      '<': '&lt;', '>': '&gt;', '"': '&quot;',
      "'": '&#39;', '&': '&amp;'
    }[c]))
    .trim()
    .slice(0, 500);
}

/**
 * Express middleware that sanitizes all string fields in request body.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
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

module.exports = { sanitize, sanitizeBody };
