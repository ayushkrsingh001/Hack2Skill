/**
 * Guidance Service Tests — Validates personalized election guidance logic.
 */
const { getPersonalizedGuidance } = require('../server/services/guidance.service');

describe('Personalized Guidance', () => {
  test('returns ineligible for under-18 user', () => {
    const result = getPersonalizedGuidance({ age: 16 });
    expect(result.eligible).toBe(false);
    expect(result.message).toContain('16');
    expect(result.steps.length).toBeGreaterThan(0);
  });

  test('returns eligible for 18+ user', () => {
    const result = getPersonalizedGuidance({ age: 21 });
    expect(result.eligible).toBe(true);
    expect(result.message).toContain('21');
  });

  test('provides registration steps for unregistered user', () => {
    const result = getPersonalizedGuidance({ age: 25, registered: 'no' });
    expect(result.urgentActions.length).toBeGreaterThan(0);
    expect(result.steps.some(s => s.includes('Form 6'))).toBe(true);
  });

  test('provides voting steps for registered user', () => {
    const result = getPersonalizedGuidance({ age: 30, registered: 'yes' });
    expect(result.urgentActions.length).toBe(0);
    expect(result.steps.some(s => s.includes('Voter ID'))).toBe(true);
  });

  test('gives first-time voter extra tips', () => {
    const result = getPersonalizedGuidance({ age: 18, firstTimeVoter: 'yes' });
    expect(result.tips.some(t => t.includes('first vote'))).toBe(true);
    expect(result.tips.some(t => t.includes('EVM'))).toBe(true);
  });

  test('gives returning voter different tips', () => {
    const result = getPersonalizedGuidance({ age: 35, firstTimeVoter: 'no' });
    expect(result.tips.some(t => t.includes('Verify'))).toBe(true);
  });

  test('includes state-specific tips', () => {
    const result = getPersonalizedGuidance({ age: 25, state: 'Delhi' });
    expect(result.tips.some(t => t.includes('Delhi'))).toBe(true);
  });

  test('handles empty profile gracefully', () => {
    const result = getPersonalizedGuidance({});
    expect(result.eligible).toBe(true);
    expect(result.steps.length).toBeGreaterThan(0);
  });

  test('handles no arguments', () => {
    const result = getPersonalizedGuidance();
    expect(result.eligible).toBe(true);
    expect(result.message).toBeDefined();
  });

  test('returns object with all required fields', () => {
    const result = getPersonalizedGuidance({ age: 20, state: 'Bihar' });
    expect(result).toHaveProperty('eligible');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('tips');
    expect(result).toHaveProperty('urgentActions');
    expect(Array.isArray(result.steps)).toBe(true);
    expect(Array.isArray(result.tips)).toBe(true);
  });
});
