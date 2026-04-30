/**
 * Health & Guidance Routes — Server status and personalized guidance.
 * @module routes/health
 */
const express = require('express');
const router = express.Router();
const { healthCheck, getGuidance } = require('../controllers/health.controller');

router.get('/', healthCheck);
router.post('/guidance', getGuidance);

module.exports = router;
