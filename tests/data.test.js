/**
 * Data Integrity Tests — Validates polling booth and quiz question data.
 */

const pollingBooths = require('../server/data/pollingBooths');
const quizQuestions = require('../server/data/quizQuestions');

describe('Polling Booth Data', () => {
  test('has at least 5 booths', () => {
    expect(pollingBooths.length).toBeGreaterThanOrEqual(5);
  });

  test('each booth has required coordinates', () => {
    pollingBooths.forEach(booth => {
      expect(typeof booth.lat).toBe('number');
      expect(typeof booth.lng).toBe('number');
      expect(booth.lat).toBeGreaterThanOrEqual(-90);
      expect(booth.lat).toBeLessThanOrEqual(90);
      expect(booth.lng).toBeGreaterThanOrEqual(-180);
      expect(booth.lng).toBeLessThanOrEqual(180);
    });
  });

  test('each booth has name, area, and constituency', () => {
    pollingBooths.forEach(booth => {
      expect(typeof booth.name).toBe('string');
      expect(booth.name.length).toBeGreaterThan(0);
      expect(typeof booth.area).toBe('string');
      expect(booth.area.length).toBeGreaterThan(0);
      expect(typeof booth.constituency).toBe('string');
      expect(booth.constituency.length).toBeGreaterThan(0);
    });
  });

  test('booths are located within India', () => {
    pollingBooths.forEach(booth => {
      expect(booth.lat).toBeGreaterThan(6);
      expect(booth.lat).toBeLessThan(37);
      expect(booth.lng).toBeGreaterThan(68);
      expect(booth.lng).toBeLessThan(98);
    });
  });

  test('no duplicate booth names', () => {
    const names = pollingBooths.map(b => b.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});

describe('Quiz Question Data', () => {
  test('has at least 10 questions', () => {
    expect(quizQuestions.length).toBeGreaterThanOrEqual(10);
  });

  test('each question has exactly 4 options', () => {
    quizQuestions.forEach(q => {
      expect(q.options.length).toBe(4);
    });
  });

  test('each question has a valid answer index', () => {
    quizQuestions.forEach(q => {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    });
  });

  test('no duplicate questions', () => {
    const questions = quizQuestions.map(q => q.q);
    const unique = new Set(questions);
    expect(unique.size).toBe(questions.length);
  });

  test('all options are non-empty strings', () => {
    quizQuestions.forEach(q => {
      q.options.forEach(opt => {
        expect(typeof opt).toBe('string');
        expect(opt.length).toBeGreaterThan(0);
      });
    });
  });

  test('correct answer option is a non-empty string', () => {
    quizQuestions.forEach(q => {
      const correctOption = q.options[q.answer];
      expect(typeof correctOption).toBe('string');
      expect(correctOption.length).toBeGreaterThan(0);
    });
  });
});
