const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/tmp/pw-browsers/chromium-1217/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('https://www.snapclaps.com/plan', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  const body = await page.textContent('body');
  const isWizard = body.includes('ZIP') || body.includes('flying from') || body.includes('Where are you');
  const isHomepage = body.includes('JFK') && body.includes('MILAN');
  console.log('URL:', page.url());
  console.log('IS_WIZARD:', isWizard);
  console.log('IS_HOMEPAGE_FALLBACK:', isHomepage);
  console.log('BODY_PREVIEW:', body.slice(0,300));
  await page.screenshot({ path: '/tmp/precheck-plan-production.png' });
  await browser.close();
})();
