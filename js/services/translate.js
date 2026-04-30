/**
 * Translation Service — Google Translate API integration.
 *
 * WHY Google Translate:
 * - Dynamic translation of chatbot responses beyond static strings
 * - Supports 100+ languages for future expansion
 * - Falls back to built-in Hindi dictionary when API unavailable
 *
 * SETUP: Enable Cloud Translation API in Google Cloud Console.
 * Add API key to server/.env (never expose in frontend).
 *
 * @module translate
 */

/** @constant {string} TRANSLATE_API_URL - Backend proxy endpoint for Google Translate API */
const TRANSLATE_API_URL = '/api/translate';

/**
 * Translate a single text string via the backend proxy to Google Translate API.
 * Falls back to the original text if translation fails.
 * @param {string} text - The text to translate.
 * @param {string} [targetLang='hi'] - Target language code (e.g., 'hi' for Hindi).
 * @returns {Promise<string>} The translated text or the original text on failure.
 */
export async function translateText(text, targetLang = 'hi') {
  if (!text || targetLang === 'en') return text;

  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang })
    });

    if (!response.ok) throw new Error('Translation API error');
    const data = await response.json();
    return data.translatedText || text;
  } catch (_e) {
    return text;
  }
}

/**
 * Batch translate multiple strings via the backend proxy.
 * Falls back to the original texts array if translation fails.
 * @param {string[]} texts - Array of text strings to translate.
 * @param {string} [targetLang='hi'] - Target language code.
 * @returns {Promise<string[]>} Array of translated strings or originals on failure.
 */
export async function translateBatch(texts, targetLang = 'hi') {
  if (!Array.isArray(texts) || targetLang === 'en') return texts;

  try {
    const response = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, targetLang })
    });

    if (!response.ok) throw new Error('Batch translation error');
    const data = await response.json();
    return data.translations || texts;
  } catch (_e) {
    return texts;
  }
}
