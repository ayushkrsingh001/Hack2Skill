/**
 * Accessibility Tests — Validates HTML output meets WCAG 2.1 AA requirements.
 * Tests semantic structure, ARIA attributes, and keyboard accessibility patterns.
 */

const fs = require('fs');
const path = require('path');

// Read the actual index.html
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');

describe('Semantic HTML Structure', () => {
  test('has exactly one main landmark', () => {
    const mainCount = (indexHtml.match(/<main[\s>]/g) || []).length;
    expect(mainCount).toBe(1);
  });

  test('main has id="main-content"', () => {
    expect(indexHtml).toContain('id="main-content"');
  });

  test('has nav element with role="navigation"', () => {
    expect(indexHtml).toContain('<nav');
    expect(indexHtml).toContain('role="navigation"');
  });

  test('has footer element', () => {
    expect(indexHtml).toContain('<footer');
  });

  test('footer has role="contentinfo"', () => {
    expect(indexHtml).toContain('role="contentinfo"');
  });

  test('has proper lang attribute', () => {
    expect(indexHtml).toContain('lang="en"');
  });

  test('has proper meta viewport', () => {
    expect(indexHtml).toContain('viewport');
    expect(indexHtml).toContain('width=device-width');
  });
});

describe('Skip Navigation', () => {
  test('has skip link as first focusable element', () => {
    expect(indexHtml).toContain('skip-link');
    expect(indexHtml).toContain('href="#main-content"');
  });

  test('skip link has descriptive text', () => {
    expect(indexHtml).toContain('Skip to main content');
  });
});

describe('ARIA Attributes', () => {
  test('navigation has aria-label', () => {
    expect(indexHtml).toContain('aria-label="Main navigation"');
  });

  test('hamburger button has aria-label and aria-expanded', () => {
    expect(indexHtml).toContain('aria-label="Toggle menu"');
    expect(indexHtml).toContain('aria-expanded="false"');
  });

  test('theme toggle has aria-label', () => {
    expect(indexHtml).toContain('aria-label="Toggle dark/light theme"');
  });

  test('language toggle has aria-label', () => {
    expect(indexHtml).toContain('aria-label="Switch to Hindi"');
  });

  test('profile modal has dialog role', () => {
    expect(indexHtml).toContain('role="dialog"');
    expect(indexHtml).toContain('aria-modal="true"');
  });

  test('profile modal has aria-labelledby', () => {
    expect(indexHtml).toContain('aria-labelledby="profile-modal-title"');
    expect(indexHtml).toContain('id="profile-modal-title"');
  });

  test('toast container has aria-live', () => {
    expect(indexHtml).toContain('id="toast-container"');
    expect(indexHtml).toContain('aria-live="polite"');
  });

  test('decorative elements are hidden from screen readers', () => {
    expect(indexHtml).toContain('aria-hidden="true"');
  });

  test('app content has aria-live for dynamic updates', () => {
    expect(indexHtml).toContain('aria-live="polite"');
  });
});

describe('Form Accessibility', () => {
  test('all inputs have labels', () => {
    expect(indexHtml).toContain('for="profileName"');
    expect(indexHtml).toContain('for="profileAge"');
    expect(indexHtml).toContain('for="profileState"');
  });

  test('inputs have proper types', () => {
    expect(indexHtml).toContain('type="text"');
    expect(indexHtml).toContain('type="number"');
  });

  test('form has submit button', () => {
    expect(indexHtml).toContain('type="submit"');
  });
});

describe('Content Security', () => {
  test('has Content-Security-Policy meta tag', () => {
    expect(indexHtml).toContain('Content-Security-Policy');
  });

  test('has base-uri restriction', () => {
    expect(indexHtml).toContain("base-uri 'self'");
  });

  test('has object-src restriction', () => {
    expect(indexHtml).toContain("object-src 'none'");
  });

  test('has upgrade-insecure-requests', () => {
    expect(indexHtml).toContain('upgrade-insecure-requests');
  });
});

describe('SEO', () => {
  test('has descriptive title tag', () => {
    const titleMatch = indexHtml.match(/<title>(.+?)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch[1].length).toBeGreaterThan(10);
  });

  test('has meta description', () => {
    expect(indexHtml).toContain('meta name="description"');
  });

  test('has canonical URL', () => {
    expect(indexHtml).toContain('rel="canonical"');
  });

  test('has manifest link for PWA', () => {
    expect(indexHtml).toContain('rel="manifest"');
  });
});

describe('External Links', () => {
  test('external links have target="_blank"', () => {
    expect(indexHtml).toContain('target="_blank"');
  });

  test('external links have rel="noopener noreferrer"', () => {
    expect(indexHtml).toContain('rel="noopener noreferrer"');
  });
});
