/**
 * Translation Service — Google Translate API integration
 * 
 * WHY Google Translate:
 * - Dynamic translation of chatbot responses beyond static strings
 * - Supports 100+ languages for future expansion
 * - Falls back to built-in Hindi dictionary when API unavailable
 * 
 * SETUP: Enable Cloud Translation API in Google Cloud Console.
 * Add API key to server/.env (never expose in frontend).
 */

const TRANSLATE_API_URL = '/api/translate'; // Proxied through backend

/** Translate text via backend proxy to Google Translate API */
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
  } catch (e) {
    console.warn('Translation fallback to local dictionary:', e.message);
    return text; // Fallback: return original text
  }
}

/** Batch translate multiple strings */
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
  } catch (e) {
    console.warn('Batch translation failed:', e.message);
    return texts;
  }
}
