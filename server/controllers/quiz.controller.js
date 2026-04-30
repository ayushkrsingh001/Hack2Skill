/**
 * Quiz Controller — Handles quiz question retrieval and answer validation.
 * @module controllers/quiz
 */
const { getShuffledQuestions, validateAnswer } = require('../services/quiz.service');

/**
 * GET /api/quiz — Returns shuffled quiz questions.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function getQuiz(req, res) {
  const questions = getShuffledQuestions(10);
  res.json({ questions });
}

/**
 * POST /api/quiz/validate — Validates a quiz answer.
 * @param {import('express').Request} req - Request with { questionIndex, answerIndex }.
 * @param {import('express').Response} res
 */
function checkAnswer(req, res) {
  const { questionIndex, answerIndex } = req.body;
  if (typeof questionIndex !== 'number' || typeof answerIndex !== 'number') {
    return res.status(400).json({ error: 'questionIndex and answerIndex are required.' });
  }
  const result = validateAnswer(questionIndex, answerIndex);
  res.json(result);
}

module.exports = { getQuiz, checkAnswer };
