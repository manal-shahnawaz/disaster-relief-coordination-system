const fs = require('fs/promises');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'log.txt');

function safeJson(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '"[unserializable]"';
  }
}

async function appendLine(line) {
  await fs.appendFile(LOG_PATH, line + '\n', { encoding: 'utf8' });
}

/**
 * Write a durable audit-style log line to backend/log.txt.
 *
 * @param {string} event  e.g. "START", "INSERT", "UPDATE", "DELETE", "REQUEST"
 * @param {object} meta   small JSON payload (table/id/path/etc)
 */
async function logEvent(event, meta = {}) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${event} ${safeJson(meta)}`;
  try {
    await appendLine(line);
  } catch (e) {
    // Avoid crashing the API if the filesystem is read-only / locked.
    console.error('logEvent failed:', e.message);
  }
}

module.exports = { LOG_PATH, logEvent };

