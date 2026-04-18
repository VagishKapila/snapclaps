const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/tmp/pw-browsers/chromium-1217/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/plan', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);
  const title = await page.title();
  const bodyText = await page.textContent('body');
  console.log('TITLE:', title);
  console.log('HAS_PLAN_CONTENT:', bodyText.includes('ZIP') || bodyText.includes('flying from') || bodyText.includes('Where are you') || bodyText.includes('Step 1'));
  console.log('BODY_PREVIEW:', bodyText.slice(0, 400));
  await page.screenshot({ path: '/tmp/plan-local-screenshot.png', fullPage: false });
  console.log('Screenshot saved');
  await browser.close();
})();
