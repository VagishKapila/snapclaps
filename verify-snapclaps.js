const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/tmp/pw-browsers/chromium_headless_shell-1217/chrome-linux/headless_shell' });
  const page = await browser.newPage();
  
  console.log('Loading snapclaps.com...');
  await page.goto('https://www.snapclaps.com', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Wait for deal cards to render
  await page.waitForTimeout(3000);
  
  // Get all text content
  const bodyText = await page.evaluate(() => document.body.innerText);
  
  // Count $0 occurrences
  const zeroPriceMatches = (bodyText.match(/\$0\b/g) || []).length;
  const nanMatches = (bodyText.match(/NaN%/g) || []).length;
  
  // Get deal card prices
  const prices = await page.evaluate(() => {
    const priceEls = Array.from(document.querySelectorAll('[style*="fontSize: 26"]'));
    return priceEls.map(el => el.textContent?.trim()).filter(Boolean);
  });
  
  // Also try getting all text that looks like prices
  const allPriceLike = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all
      .filter(el => el.children.length === 0)
      .map(el => el.textContent?.trim())
      .filter(t => t && /^\$\d/.test(t))
      .slice(0, 20);
  });
  
  // Get savings badges
  const savings = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    return all
      .filter(el => el.children.length === 0)
      .map(el => el.textContent?.trim())
      .filter(t => t && /off/.test(t))
      .slice(0, 15);
  });
  
  console.log('\n=== BROWSER VERIFICATION RESULTS ===');
  console.log(`$0 occurrences: ${zeroPriceMatches}`);
  console.log(`NaN% occurrences: ${nanMatches}`);
  console.log('\nDeal card prices found:', prices.length > 0 ? prices : 'none via font selector');
  console.log('\nAll price-like text:', allPriceLike);
  console.log('\nSavings badges:', savings);
  
  // Take screenshot
  await page.screenshot({ path: '/tmp/snapclaps-verify.png', fullPage: false });
  console.log('\nScreenshot saved to /tmp/snapclaps-verify.png');
  
  await browser.close();
  
  // Pass/fail
  if (zeroPriceMatches === 0 && nanMatches === 0) {
    console.log('\n✅ PASS: Zero $0 prices, zero NaN% discounts');
    process.exit(0);
  } else {
    console.log(`\n❌ FAIL: Found ${zeroPriceMatches} instances of $0 and ${nanMatches} instances of NaN%`);
    process.exit(1);
  }
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(2);
});
