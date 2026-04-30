/**
 * Polling Routes — Polling booth search and nearby endpoints.
 * @module routes/polling
 */
const express = require('express');
const router = express.Router();
const { getBooths, getNearbyBooths } = require('../controllers/polling.controller');

router.get('/', getBooths);
router.get('/nearby', getNearbyBooths);

module.exports = router;
