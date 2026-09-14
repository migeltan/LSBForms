const { join } = require('path');

/**
 * By default Puppeteer downloads Chromium into the CURRENT USER's profile
 * (%USERPROFILE%\.cache\puppeteer). That's what caused "Could not find
 * Chrome" errors before: `npm install` was run as one Windows account,
 * but the background service later ran as a different account (e.g.
 * LocalSystem), which has its own separate, empty cache folder.
 *
 * Pointing cacheDirectory at a folder INSIDE the project instead makes
 * the Chrome install account-agnostic — `npm install` and the running
 * service both resolve to the same absolute path, no matter which
 * Windows account either one runs as.
 *
 * This applies automatically both when `npm install` downloads Chrome
 * AND when `puppeteer.launch()` looks for it at runtime — no need to
 * hardcode `executablePath` in server.js anymore.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.chrome-cache'),
};
