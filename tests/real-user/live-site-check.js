const config = require(`./configs/${process.env.PRODUCT || 'snapclaps'}`);
const env = process.env.ENV || 'production';
const url = config.urls[env];

const { chromium } = require('playwright');

async function runAllTests() {
  console.log(`\n🧪 REAL USER TESTING: ${config.productName} on ${url}\n`);

  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/sessions/affectionate-pensive-ride/.cache/ms-playwright/chromium-1217/chrome-linux/chrome', args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('pageerror', err => consoleErrors.push(`PAGE ERROR: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`CONSOLE: ${msg.text()}`);
  });

  let failed = 0;
  const failures = [];

  try {
    // TEST 1: Site loads
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response.ok()) throw new Error(`Site returned ${response.status()}`);
    await page.waitForTimeout(3000);
    console.log('✅ Test 1: Site loads');

    // TEST 2: No broken indicators
    const bodyText = await page.textContent('body');
    const broken = [
      { pattern: /\$0\b/g, name: '$0 prices' },
      { pattern: /NaN/g, name: 'NaN values' },
      { pattern: /\bundefined\b/g, name: 'undefined values' },
      { pattern: /\[object Object\]/g, name: 'unstringified objects' },
      { pattern: /Error: /g, name: 'error messages' },
    ];
    // Exclude known-intentional $0 (Free tier pricing)
    const cleanText = bodyText.replace(/\$0\s*\/\s*month/gi, '').replace(/\$0\/mo/gi, '');
    const brokenFound = broken.filter(b => (cleanText.match(b.pattern) || []).length > 0);
    if (brokenFound.length > 0) {
      const screenshot = `tests/real-user/screenshots/FAIL-broken-${Date.now()}.png`;
      await page.screenshot({ path: screenshot, fullPage: true });
      throw new Error(`Broken indicators: ${brokenFound.map(b => b.name).join(', ')}\nScreenshot: ${screenshot}`);
    }
    console.log('✅ Test 2: No broken indicators');

    // TEST 3: Expected data patterns
    if (config.expectedPatterns) {
      const missing = config.expectedPatterns.filter(p => {
        const matches = bodyText.match(p.pattern) || [];
        return matches.length < p.minCount;
      });
      if (missing.length > 0) {
        throw new Error(`Missing data: ${missing.map(m => m.name).join(', ')}`);
      }
      console.log('✅ Test 3: Real data renders');
    }

    // TEST 4: Critical pages load
    for (const path of (config.criticalPages || [])) {
      const pageResponse = await page.goto(url + path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (!pageResponse || !pageResponse.ok()) {
        throw new Error(`${path} returned ${pageResponse ? pageResponse.status() : 'no response'}`);
      }
      process.stdout.write(`  ✓ ${path}\n`);
    }
    console.log('✅ Test 4: Critical pages load');

    // TEST 5: No console errors (ignoring known 3rd party noise)
    const ignored = [/favicon/, /google-analytics/, /ERR_BLOCKED/, /gtag/, /skimlinks/i, /quantserve/i];
    const realErrors = consoleErrors.filter(e => !ignored.some(p => p.test(e)));
    if (realErrors.length > 0) {
      console.warn(`⚠️  Console errors (non-blocking):\n${realErrors.slice(0, 5).join('\n')}`);
    } else {
      console.log('✅ Test 5: No console errors');
    }

    // PASS screenshot
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    const passShot = `tests/real-user/screenshots/PASS-${Date.now()}.png`;
    await page.screenshot({ path: passShot, fullPage: false });
    console.log(`\n📸 PASS screenshot: ${passShot}`);

  } catch (e) {
    failed++;
    failures.push(e.message);
    console.error(`\n❌ FAILED: ${e.message}`);
    try {
      const failShot = `tests/real-user/screenshots/FAIL-${Date.now()}.png`;
      await page.screenshot({ path: failShot, fullPage: true });
      console.error(`📸 FAIL screenshot: ${failShot}`);
    } catch (_) {}
  }

  await browser.close();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED — site actually works for real users');
    process.exit(0);
  } else {
    console.log(`❌ FAILED (${failed} issue(s)) — site is broken`);
    failures.forEach(f => console.log(`  • ${f}`));
    process.exit(1);
  }
}

runAllTests().catch(e => { console.error(e); process.exit(1); });
