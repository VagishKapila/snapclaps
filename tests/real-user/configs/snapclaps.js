module.exports = {
  productName: 'SnapClaps',
  urls: {
    production: 'https://www.snapclaps.com',
    staging: 'https://snapclaps-staging.up.railway.app',
  },
  expectedPatterns: [
    { pattern: /\$\d{2,5}\b/g, name: 'realistic prices ($10+)', minCount: 5 },
    { pattern: /[A-Z]{3}\s*[→–\-]\s*[A-Z]{3}/g, name: 'airport route pairs', minCount: 3 },
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
