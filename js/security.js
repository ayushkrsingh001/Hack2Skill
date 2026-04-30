/**
 * Security Module — Input sanitization & XSS prevention.
 * Prevents injection attacks by escaping user input before rendering.
 * @module security
 */

/**
 * Escapes HTML entities to prevent XSS attacks.
 * Uses DOM-based escaping for reliable entity conversion.
 * @param {*} str - The value to escape (coerced to string).
 * @returns {string} The HTML-escaped string.
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Sanitizes user input by trimming, limiting length, and escaping HTML.
 * @param {*} input - The input to sanitize.
 * @param {number} [maxLength=500] - Maximum allowed length.
 * @returns {string} The sanitized string.
 */
export function sanitizeInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return escapeHTML(input.trim().slice(0, maxLength));
}

/**
 * Validates an age value. Returns the parsed integer if valid, null otherwise.
 * @param {*} age - The age value to validate.
 * @returns {number|null} The validated age or null if invalid.
 */
export function validateAge(age) {
  const num = parseInt(age, 10);
  return !isNaN(num) && num >= 1 && num <= 150 ? num : null;
}

/**
 * Validates a name string. Accepts letters, spaces, and common Indian name characters.
 * Rejects names with special characters that could be used for injection.
 * @param {*} name - The name to validate.
 * @returns {string} The validated name or empty string if invalid.
 */
export function validateName(name) {
  if (typeof name !== 'string') return '';
  const cleaned = name.trim().slice(0, 100);
  return /^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.'-]+$/.test(cleaned) ? cleaned : '';
}

/**
 * Validates a state selection against a known list of valid states.
 * @param {string} state - The state to validate.
 * @param {string[]} validStates - Array of valid state names.
 * @returns {string} The validated state or empty string if invalid.
 */
export function validateState(state, validStates) {
  return validStates.includes(state) ? state : '';
}

/**
 * Creates safe HTML from a template string by escaping all data values.
 * Template placeholders use {{key}} syntax.
 * @param {string} template - The HTML template with {{key}} placeholders.
 * @param {object} data - Key-value pairs to substitute into the template.
 * @returns {string} The rendered HTML with escaped data values.
 */
export function safeTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data.hasOwnProperty(key) ? escapeHTML(data[key]) : '';
  });
}
