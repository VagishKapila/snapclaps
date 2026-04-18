module.exports = {
  productName: 'SnapClaps',
  urls: {
    production: 'https://www.snapclaps.com',
    staging: 'https://www.snapclaps.com', // no separate staging env
  },
  expectedPatterns: [
    // Prices: deal cards show $123, $68, etc.
    { pattern: /\$\d{2,5}\b/g, name: 'realistic prices ($10+)', minCount: 3 },
    // Route arrows: v2 DealCard shows "Denver → Charlotte", "Atlanta → San Diego"
    // Match any word → word pattern (city names, not airport codes)
    { pattern: /[A-Za-z]+\s*→\s*[A-Za-z]+/g, name: 'route arrows (city → city)', minCount: 2 },
  ],
  criticalPages: [
    '/',
    '/deals',
    '/error-fares',
    '/blog',
    '/pricing',
    '/blog/cheap-flights-guide',
    '/plan',
  ],
};
