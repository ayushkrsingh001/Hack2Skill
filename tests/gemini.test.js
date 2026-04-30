/**
 * Gemini Service Tests — Validates AI response generation and fallback logic.
 */
const { getFallbackResponse } = require('../server/services/gemini.service');

describe('Gemini Fallback Responses', () => {
  test('returns registration response for "register"', () => {
    const reply = getFallbackResponse('How do I register?');
    expect(reply).toContain('Registration');
    expect(reply).toContain('voters.eci.gov.in');
  });

  test('returns document response for "document"', () => {
    const reply = getFallbackResponse('What documents do I need?');
    expect(reply).toContain('Documents');
    expect(reply).toContain('Aadhaar');
  });

  test('returns eligibility response for "eligible"', () => {
    const reply = getFallbackResponse('Am I eligible to vote?');
    expect(reply).toContain('Eligibility');
    expect(reply).toContain('18');
  });

  test('returns voting response for "vote"', () => {
    const reply = getFallbackResponse('How to vote?');
    expect(reply).toContain('Voting Day');
    expect(reply).toContain('EVM');
  });

  test('returns booth response for "booth"', () => {
    const reply = getFallbackResponse('Where is my polling booth?');
    expect(reply).toContain('Booth');
  });

  test('returns timeline response for "timeline"', () => {
    const reply = getFallbackResponse('Election timeline');
    expect(reply).toContain('Timeline');
  });

  test('returns NOTA response for "nota"', () => {
    const reply = getFallbackResponse('What is NOTA?');
    expect(reply).toContain('NOTA');
  });

  test('returns greeting for "hello"', () => {
    const reply = getFallbackResponse('hello');
    expect(reply).toContain('VoteSathi');
  });

  test('returns default response for unknown query', () => {
    const reply = getFallbackResponse('quantum physics theory');
    expect(reply).toContain('help you with');
  });

  test('handles Hindi keywords', () => {
    const reply = getFallbackResponse('पंजीकरण कैसे करें');
    expect(reply).toContain('Registration');
  });

  test('is case insensitive', () => {
    const reply = getFallbackResponse('HOW DO I REGISTER?');
    expect(reply).toContain('Registration');
  });

  test('handles empty string', () => {
    const reply = getFallbackResponse('');
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
  });
});
