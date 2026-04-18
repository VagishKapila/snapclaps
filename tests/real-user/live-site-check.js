const config = require(`./configs/${process.env.PRODUCT || 'snapclaps'}`);
const env = process.env.ENV || 'production';
const url = config.urls[env];

const { chromium } = require('playwright');

async function runAllTests() {
  console.log(`\n🧪 REAL USER TESTING: ${config.productName} on ${url}\n`);

  const browser = await chromium.launch();
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
    const brokenFound = broken.filter(b => (bodyText.match(b.pattern) || []).length > 0);
    if (brokenFound.length > 0) {
      const screenshot = `tests/real-user/screenshots/FAIL-${Date.now()}.png`;
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
      const pageResponse = await page.goto(url + path, { waitUntil: 'domcontentloaded' });
      if (!pageResponse.ok()) throw new Error(`${path} returned ${pageResponse.status()}`);
    }
    console.log('✅ Test 4: Critical pages load');

    // TEST 5: No console errors
    const ignored = [/favicon/, /google-analytics/, /ERR_BLOCKED/];
    const realErrors = consoleErrors.filter(e => !ignored.some(p => p.test(e)));
    if (realErrors.length > 0) {
      throw new Error(`Console errors:\n${realErrors.slice(0, 5).join('\n')}`);
    }
    console.log('✅ Test 5: No console errors');

    // PASS screenshot
    await page.screenshot({ path: `tests/real-user/screenshots/PASS-${Date.now()}.png`, fullPage: true });

  } catch (e) {
    failed++;
    failures.push(e.message);
    console.error(`❌ FAILED: ${e.message}`);
  }

  await browser.close();

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  if (failed === 0) {
    console.log('✅ ALL TESTS PASSED — site actually works');
    process.exit(0);
  } else {
    console.log(`❌ FAILED (${failed}) — site is broken`);
    failures.forEach(f => console.log(`  • ${f}`));
    process.exit(1);
  }
}

runAllTests().catch(e => { console.error(e); process.exit(1); });
