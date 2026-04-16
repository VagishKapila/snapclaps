const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/tmp/pw-browsers/chromium_headless_shell-1217/chrome-linux/headless_shell' });
  const page = await browser.newPage();
  await page.goto('https://www.snapclaps.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const zeroElements = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all
      .filter(el => el.children.length === 0 && el.textContent?.trim() === '$0')
      .map(el => ({
        text: el.textContent?.trim(),
        tag: el.tagName,
        style: el.getAttribute('style')?.slice(0, 120),
        parentText: el.parentElement?.textContent?.trim().slice(0, 100),
      }));
  });
  
  console.log('Elements showing $0:', JSON.stringify(zeroElements, null, 2));
  await browser.close();
})().catch(e => console.error(e.message));
