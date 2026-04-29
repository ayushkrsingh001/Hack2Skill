/**
 * Chatbot Response Tests — Validates keyword matching and response generation
 */

// Recreate the matching function for testing
function match(q, keywords) {
  return keywords.some(k => q.toLowerCase().includes(k));
}

// Simplified response engine for testing
function getResponseCategory(input) {
  const q = input.toLowerCase();
  if (match(q, ['how can i vote', 'how do i vote', 'how to vote', 'voting process'])) return 'voting';
  if (match(q, ['register', 'registration', 'enroll', 'form 6', 'nvsp'])) return 'registration';
  if (match(q, ['document', 'papers', 'id proof', 'what do i need'])) return 'documents';
  if (match(q, ['eligible', 'eligibility', 'who can vote', 'can i vote'])) return 'eligibility';
  if (match(q, ['voting day', 'election day', 'polling day', 'booth'])) return 'votingday';
  if (match(q, ['timeline', 'stages', 'phases', 'schedule'])) return 'timeline';
  if (match(q, ['evm', 'electronic voting', 'vvpat'])) return 'evm';
  if (match(q, ['hello', 'hi', 'hey', 'namaste'])) return 'greeting';
  if (match(q, ['thank', 'thanks', 'helpful'])) return 'thanks';
  return 'fallback';
}

describe('Keyword Matching', () => {
  test('matches single keyword', () => {
    expect(match('hello there', ['hello'])).toBe(true);
  });
  test('matches any keyword in list', () => {
    expect(match('how can i vote', ['vote', 'register'])).toBe(true);
  });
  test('case insensitive', () => {
    expect(match('How To Vote', ['how to vote'])).toBe(true);
  });
  test('returns false for no match', () => {
    expect(match('random text', ['vote', 'register'])).toBe(false);
  });
});

describe('Response Categorization', () => {
  test('voting queries', () => {
    expect(getResponseCategory('How can I vote?')).toBe('voting');
    expect(getResponseCategory('What is the voting process?')).toBe('voting');
  });
  test('registration queries', () => {
    expect(getResponseCategory('How to register?')).toBe('registration');
    expect(getResponseCategory('Tell me about Form 6')).toBe('registration');
  });
  test('document queries', () => {
    expect(getResponseCategory('What documents do I need?')).toBe('documents');
    expect(getResponseCategory('What ID proof is required?')).toBe('documents');
  });
  test('eligibility queries', () => {
    expect(getResponseCategory('Am I eligible to vote?')).toBe('eligibility');
    expect(getResponseCategory('Who can vote in India?')).toBe('eligibility');
  });
  test('timeline queries', () => {
    expect(getResponseCategory('What are the election stages?')).toBe('timeline');
  });
  test('greeting queries', () => {
    expect(getResponseCategory('Hello!')).toBe('greeting');
    expect(getResponseCategory('Namaste')).toBe('greeting');
  });
  test('fallback for unknown queries', () => {
    expect(getResponseCategory('What is quantum physics?')).toBe('fallback');
  });
});

describe('Wizard Step Flow', () => {
  const TOTAL_STEPS = 5;
  let currentStep = 0;

  function goNext() {
    if (currentStep < TOTAL_STEPS - 1) currentStep++;
    return currentStep;
  }
  function goBack() {
    if (currentStep > 0) currentStep--;
    return currentStep;
  }

  beforeEach(() => { currentStep = 0; });

  test('starts at step 0', () => {
    expect(currentStep).toBe(0);
  });
  test('goes forward', () => {
    expect(goNext()).toBe(1);
    expect(goNext()).toBe(2);
  });
  test('goes backward', () => {
    currentStep = 3;
    expect(goBack()).toBe(2);
    expect(goBack()).toBe(1);
  });
  test('cannot go below 0', () => {
    expect(goBack()).toBe(0);
    expect(goBack()).toBe(0);
  });
  test('cannot exceed max steps', () => {
    for (let i = 0; i < 10; i++) goNext();
    expect(currentStep).toBe(TOTAL_STEPS - 1);
  });
  test('completes all steps in sequence', () => {
    for (let i = 0; i < TOTAL_STEPS - 1; i++) goNext();
    expect(currentStep).toBe(TOTAL_STEPS - 1);
  });
});
