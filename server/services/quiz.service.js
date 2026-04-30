/**
 * Quiz Service — Shuffles and serves quiz questions.
 * @module services/quiz
 */
const questions = require('../data/quizQuestions');

/**
 * Get a shuffled subset of quiz questions.
 * @param {number} [count=10] - Number of questions to return.
 * @returns {object[]} Array of shuffled quiz question objects.
 */
function getShuffledQuestions(count = 10) {
  // O(n) Fisher-Yates shuffle (more efficient and truly random than Array.sort)
  const array = [...questions];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.slice(0, count);
}

/**
 * Validate a quiz answer.
 * @param {number} questionIndex - Index of the question in the full set.
 * @param {number} answerIndex - User's selected answer index.
 * @returns {{ correct: boolean, correctAnswer: number }}
 */
function validateAnswer(questionIndex, answerIndex) {
  const question = questions[questionIndex];
  if (!question) return { correct: false, correctAnswer: -1 };
  return {
    correct: question.answer === answerIndex,
    correctAnswer: question.answer
  };
}

module.exports = { getShuffledQuestions, validateAnswer };
