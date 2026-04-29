/**
 * Quiz Logic Tests — Validates quiz scoring, answer checking, badge assignment
 */

// Import quiz data directly for testing
const questions = require('../server/data/quizQuestions');

describe('Quiz Questions', () => {
  test('should have at least 10 questions', () => {
    expect(questions.length).toBeGreaterThanOrEqual(10);
  });

  test('each question should have required fields', () => {
    questions.forEach((q, i) => {
      expect(q).toHaveProperty('q');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('answer');
      expect(typeof q.q).toBe('string');
      expect(Array.isArray(q.options)).toBe(true);
      expect(q.options.length).toBe(4);
      expect(typeof q.answer).toBe('number');
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    });
  });

  test('answer index should be valid for each question', () => {
    questions.forEach(q => {
      expect(q.options[q.answer]).toBeDefined();
      expect(typeof q.options[q.answer]).toBe('string');
    });
  });
});

describe('Quiz Scoring Logic', () => {
  function calculateScore(answers, questions) {
    let score = 0;
    answers.forEach((ans, i) => {
      if (i < questions.length && ans === questions[i].answer) score++;
    });
    return score;
  }

  function getBadge(score, total) {
    const pct = (score / total) * 100;
    if (pct >= 80) return 'expert';
    if (pct >= 50) return 'intermediate';
    return 'beginner';
  }

  test('should return 0 for all wrong answers', () => {
    const wrongAnswers = questions.map(q => (q.answer + 1) % 4);
    expect(calculateScore(wrongAnswers, questions)).toBe(0);
  });

  test('should return full score for all correct answers', () => {
    const correctAnswers = questions.map(q => q.answer);
    expect(calculateScore(correctAnswers, questions)).toBe(questions.length);
  });

  test('should return partial score', () => {
    const answers = questions.map((q, i) => i < 5 ? q.answer : (q.answer + 1) % 4);
    expect(calculateScore(answers, questions)).toBe(5);
  });

  test('badge assignment: expert for 80%+', () => {
    expect(getBadge(9, 10)).toBe('expert');
    expect(getBadge(10, 10)).toBe('expert');
  });

  test('badge assignment: intermediate for 50-79%', () => {
    expect(getBadge(5, 10)).toBe('intermediate');
    expect(getBadge(7, 10)).toBe('intermediate');
  });

  test('badge assignment: beginner for <50%', () => {
    expect(getBadge(2, 10)).toBe('beginner');
    expect(getBadge(4, 10)).toBe('beginner');
  });
});
