/**
 * i18n Tests — Validates translation lookup, fallback, and language switching.
 */

// Mock state module
let mockState = { language: 'en' };

// Recreate i18n functions for testing
const translations = {
  en: {
    'app.title': 'Election Assistant',
    'nav.home': 'Home',
    'btn.next': 'Next',
    'quiz.shareText': 'I scored {{score}}/{{total}} on the quiz!',
    'home.hero': 'Understand Your Vote'
  },
  hi: {
    'app.title': 'चुनाव सहायक',
    'nav.home': 'होम',
    'btn.next': 'अगला',
    'quiz.shareText': 'मैंने क्विज़ में {{score}}/{{total}} अंक प्राप्त किए!',
    'home.hero': 'अपने वोट को समझें'
  }
};

function t(key, replacements = {}) {
  const lang = mockState.language || 'en';
  let text = translations[lang]?.[key] || translations['en']?.[key] || key;
  Object.entries(replacements).forEach(([k, v]) => {
    text = text.replace(`{{${k}}}`, v);
  });
  return text;
}

function getLanguage() { return mockState.language || 'en'; }
function setLanguage(lang) { if (translations[lang]) mockState.language = lang; }

beforeEach(() => {
  mockState = { language: 'en' };
});

describe('Translation lookup (t function)', () => {
  test('returns English translation by default', () => {
    expect(t('app.title')).toBe('Election Assistant');
  });

  test('returns Hindi translation when language is hi', () => {
    mockState.language = 'hi';
    expect(t('app.title')).toBe('चुनाव सहायक');
  });

  test('falls back to English when key missing in Hindi', () => {
    mockState.language = 'hi';
    // Add a key only in English
    translations.en['test.only.en'] = 'English Only';
    expect(t('test.only.en')).toBe('English Only');
    delete translations.en['test.only.en'];
  });

  test('returns key itself when not found in any language', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  test('handles template replacements', () => {
    const result = t('quiz.shareText', { score: '8', total: '10' });
    expect(result).toBe('I scored 8/10 on the quiz!');
  });

  test('handles Hindi template replacements', () => {
    mockState.language = 'hi';
    const result = t('quiz.shareText', { score: '8', total: '10' });
    expect(result).toBe('मैंने क्विज़ में 8/10 अंक प्राप्त किए!');
  });

  test('handles empty replacements object', () => {
    expect(t('app.title', {})).toBe('Election Assistant');
  });

  test('leaves unreplaced placeholders as-is', () => {
    const result = t('quiz.shareText', { score: '8' });
    expect(result).toContain('8');
    expect(result).toContain('{{total}}');
  });
});

describe('Language switching', () => {
  test('getLanguage returns current language', () => {
    expect(getLanguage()).toBe('en');
  });

  test('setLanguage changes language to Hindi', () => {
    setLanguage('hi');
    expect(getLanguage()).toBe('hi');
    expect(t('nav.home')).toBe('होम');
  });

  test('setLanguage ignores invalid language', () => {
    setLanguage('fr');
    expect(getLanguage()).toBe('en');
  });

  test('setLanguage changes back to English', () => {
    setLanguage('hi');
    setLanguage('en');
    expect(getLanguage()).toBe('en');
    expect(t('nav.home')).toBe('Home');
  });
});

describe('Translation completeness', () => {
  test('English and Hindi have matching keys', () => {
    const enKeys = Object.keys(translations.en);
    const hiKeys = Object.keys(translations.hi);
    enKeys.forEach(key => {
      expect(key in translations.hi).toBe(true);
    });
    hiKeys.forEach(key => {
      expect(key in translations.en).toBe(true);
    });
  });

  test('no empty translations', () => {
    Object.entries(translations.en).forEach(([key, val]) => {
      expect(val.length).toBeGreaterThan(0);
    });
    Object.entries(translations.hi).forEach(([key, val]) => {
      expect(val.length).toBeGreaterThan(0);
    });
  });
});
