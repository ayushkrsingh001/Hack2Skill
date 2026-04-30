/**
 * Chat Routes — AI chat endpoint powered by Gemini.
 * @module routes/chat
 */
const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chat.controller');

router.post('/', handleChat);

module.exports = router;
