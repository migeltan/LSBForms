const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json({ limit: '25mb' }));

let browserPromise = null;

function getBrowser() {
  if (!browserPromise) {
    // No hardcoded executablePath needed — Puppeteer automatically
    // resolves the Chrome binary from the cacheDirectory set in
    // .puppeteerrc.cjs, which is project-local and account-agnostic.
    browserPromise = puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browserPromise;
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/render-pdf', async (req, res) => {
  const { html, width = 380, height = 600 } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'html is required' });
  }

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    res.set('Content-Type', 'application/pdf');
    res.send(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close();
  }
});

const PORT = process.env.PORT || 4488;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`PDF render service listening on ${PORT}`);
});
