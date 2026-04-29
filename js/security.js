/**
 * Security Module — Input sanitization & XSS prevention
 * Prevents injection attacks by escaping user input before rendering.
 */

/** Escapes HTML entities to prevent XSS */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/** Sanitizes user input: trims, limits length, escapes HTML */
export function sanitizeInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return escapeHTML(input.trim().slice(0, maxLength));
}

/** Validates age input */
export function validateAge(age) {
  const num = parseInt(age, 10);
  return !isNaN(num) && num >= 1 && num <= 150 ? num : null;
}

/** Validates name input (letters, spaces, common Indian name chars) */
export function validateName(name) {
  if (typeof name !== 'string') return '';
  const cleaned = name.trim().slice(0, 100);
  return /^[a-zA-Z\s\u0900-\u097F\u0980-\u09FF.'-]+$/.test(cleaned) ? cleaned : '';
}

/** Validates state selection against known list */
export function validateState(state, validStates) {
  return validStates.includes(state) ? state : '';
}

/** Creates safe HTML from template + data (data values are escaped) */
export function safeTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return data.hasOwnProperty(key) ? escapeHTML(data[key]) : '';
  });
}
