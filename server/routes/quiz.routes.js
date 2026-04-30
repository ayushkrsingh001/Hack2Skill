/**
 * Quiz Routes — Quiz question and answer validation endpoints.
 * @module routes/quiz
 */
const express = require('express');
const router = express.Router();
const { getQuiz, checkAnswer } = require('../controllers/quiz.controller');

router.get('/', getQuiz);
router.post('/validate', checkAnswer);

module.exports = router;
