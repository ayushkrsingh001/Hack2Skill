/**
 * Server Entry Point — VoteSathi Smart Election Assistant
 * Loads environment variables and starts the Express server.
 * @module server
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  process.stdout.write(`VoteSathi server running at http://localhost:${PORT}\n`);
});

module.exports = app;
