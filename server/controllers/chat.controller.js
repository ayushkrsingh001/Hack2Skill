/**
 * Chat Controller — Handles AI chat requests via Gemini API.
 * @module controllers/chat
 */
const { generateResponse } = require('../services/gemini.service');

/**
 * POST /api/chat — Process a chat message and return AI response.
 * @param {import('express').Request} req - Request with { message, userContext }.
 * @param {import('express').Response} res - Express response.
 */
async function handleChat(req, res) {
  const { message, userContext } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const result = await generateResponse(message, userContext || {});

  res.json({
    reply: result.reply,
    source: result.source,
    timestamp: new Date().toISOString()
  });
}

module.exports = { handleChat };
