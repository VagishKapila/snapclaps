const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Database ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// Session tracking middleware for Trip Planner
app.use((req, res, next) => {
  if (!req.cookies.sc_session) {
    const sid = crypto.randomBytes(16).toString('hex');
    res.cookie('sc_session', sid, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: 'lax' });
    req.sessionId = sid;
  } else {
    req.sessionId = req.cookies.sc_session;
  }
  next();
});

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- Static files: React app ---
const fs = require('fs');
app.use(express.static(path.join(__dirname, 'dist')));

// --- Blog routes (for Travelpayouts review & SEO) ---
app.use('/blog', express.static(path.join(__dirname, 'blog')));
app.get('/blog', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog', 'index.html'));
});
app.get('/blog/:slug', (req, res) => {
  const file = path.join(__dirname, 'blog', `${req.params.slug}.html`);
  const fs = require('fs');
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.sendFile(path.join(__dirname, 'blog', 'index.html'));
  }
});

// --- eSIM promo cards (Airalo via Travelpayouts — approved) ---
const ESIM_PROMOS = [
  {
    id: 'esim-promo-airalo',
    type: 'esim',
    title: '📱 Stay Connected Abroad — eSIM from $5',
    subtitle: 'No roaming fees. Instant activation. 190+ countries covered.',
    deal_price: '5',
    normal_price: '25',
    savings_pct: '80',
    currency: 'USD',
    destination: 'Worldwide',
    destination_airport: null,
    origin_airport: null,
    affiliate_url: 'https://airalo.tpo.lv/KDAmYfab',
    affiliate_program: 'Airalo',
    urgency_type: 'evergreen',
    expires_at: null,
    seats_left: null,
    viral_score: 8,
    is_error_fare: false,
    is_luxury: false,
    image_url: null,
    source: 'snapclaps_curated',
    is_active: true,
    badge: 'TRAVEL HACK',
    is_evergreen: true,
    description: 'The traveler\'s secret: buy an eSIM before you fly. Airalo covers 190+ countries from $5. No contracts, no surprises.',
  }
];

// --- API: Geolocation ---
app.get('/api/geo', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    // Check location cache first
    const cached = await pool.query(
      'SELECT city, region, country, lat, lng, airport_iata, airport_name FROM location_cache WHERE ip = $1 AND created_at > NOW() - INTERVAL \'24 hours\'',
      [ip]
    );
    if (cached.rows.length > 0) {
      return res.json({ data: cached.rows[0] });
    }
    // Fallback to default
    return res.json({
      data: { city: 'New York', region: 'New York', country: 'United States', airport_iata: 'JFK', airport_name: 'John F. Kennedy International Airport', lat: 40.6413, lng: -73.7781 }
    });
  } catch (err) {
    console.error('geo error:', err.message);
    res.json({ data: { airport_iata: 'JFK', airport_name: 'John F. Kennedy International Airport', city: 'New York', region: 'New York', country: 'United States', lat: 40.6413, lng: -73.7781 } });
  }
});

// --- API: Deals ---
app.get('/api/deals', async (req, res) => {
  try {
    const { origin, limit = 50, type } = req.query;
    let query = 'SELECT * FROM deals WHERE is_active = true';
    const params = [];
    if (origin) {
      params.push(origin.toUpperCase());
      query += ` AND (origin_airport = $${params.length} OR origin_airport IS NULL)`;
    }
    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    query += ' ORDER BY viral_score DESC NULLS LAST, is_error_fare DESC, created_at DESC';
    params.push(parseInt(limit) || 50);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    const deals = result.rows.map(d => ({
      ...d,
      is_urgent: d.urgency_type === 'timer' && d.expires_at && new Date(d.expires_at) > new Date(),
      hours_left: d.expires_at ? Math.max(0, Math.round((new Date(d.expires_at) - new Date()) / 3600000)) : null,
    }));

    // Inject eSIM promo card every 6 deals
    const finalDeals = [];
    deals.forEach((deal, i) => {
      finalDeals.push(deal);
      if ((i + 1) % 6 === 0 && i < deals.length - 1) {
        finalDeals.push(ESIM_PROMOS[0]);
      }
    });

    res.json({ data: finalDeals, count: finalDeals.length });
  } catch (err) {
    console.error('deals error:', err.message);
    res.status(500).json({ error: 'Failed to load deals' });
  }
});

// --- API: Track click ---
app.post('/api/track-click', async (req, res) => {
  try {
    const { deal_id, origin } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '';
    if (deal_id && !deal_id.includes('esim')) {
      const deal = await pool.query('SELECT affiliate_program FROM deals WHERE id = $1', [deal_id]);
      const prog = deal.rows[0]?.affiliate_program || 'unknown';
      await pool.query(
        'INSERT INTO deal_clicks (deal_id, ip, origin_airport, affiliate_program) VALUES ($1, $2, $3, $4)',
        [deal_id, ip, origin || null, prog]
      );
    }
    // Return the affiliate URL for the deal
    const deal = await pool.query('SELECT affiliate_url FROM deals WHERE id = $1', [deal_id]);
    const url = deal.rows[0]?.affiliate_url || '#';
    res.json({ affiliate_url: url });
  } catch (err) {
    console.error('track-click error:', err.message);
    res.json({ affiliate_url: '#' });
  }
});

// --- API: Flight search redirect (Aviasales, marker=716647) ---
app.get('/api/search', (req, res) => {
  const { origin, dest } = req.query;
  if (!origin || !dest) return res.redirect('https://www.aviasales.com/?marker=716647');
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate() + 7).padStart(2, '0');
  const dateStr = `${month}${day}`;
  const url = `https://www.aviasales.com/search/${origin.toUpperCase()}${dateStr}${dest.toUpperCase()}1?marker=716647`;
  res.redirect(302, url);
});

// --- API: Hotel search redirect (Booking.com direct — no tp.media) ---
app.get('/api/hotel-search', (req, res) => {
  const { destination } = req.query;
  if (!destination) return res.redirect('https://www.booking.com/?aid=7914697');
  const encoded = encodeURIComponent(destination.trim());
  const url = `https://www.booking.com/searchresults.html?ss=${encoded}&aid=7914697&group_adults=2&no_rooms=1&selected_currency=USD`;
  res.redirect(302, url);
});

// --- API: Credit cards ---
app.get('/api/cards', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM card_promotions WHERE is_active = true ORDER BY bonus_cash_value DESC NULLS LAST, created_at DESC'
    );
    res.json({ data: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('cards error:', err.message);
    res.status(500).json({ error: 'Failed to load cards' });
  }
});

// --- API: Miles sweet spots ---
app.get('/api/miles', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT *, true AS is_active FROM award_sweet_spots ORDER BY cash_value_usd DESC NULLS LAST LIMIT 20'
    );
    res.json({ data: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('miles error:', err.message);
    res.status(500).json({ error: 'Failed to load miles' });
  }
});

// --- Stripe subscription config ---
const STRIPE_PLANS = {
  premium: {
    name: 'Premium',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: ['Unlimited deal alerts', 'Priority access to error fares', 'Email notifications', 'No ads'],
    payment_link: process.env.STRIPE_PREMIUM_LINK || 'https://buy.stripe.com/4gM6oG96q4DX3i46kw1B602',
    stripe_price_id: 'price_1TLtPqAHP8NRRyLCqObXqQm7',
  },
  elite: {
    name: 'Elite',
    price: 24.99,
    currency: 'USD',
    interval: 'month',
    features: ['Everything in Premium', 'First-access error fares', 'SMS + push alerts', 'Concierge deal requests', 'No ads'],
    payment_link: process.env.STRIPE_ELITE_LINK || 'https://buy.stripe.com/00w9ASaau3zTaKw9wI1B603',
    stripe_price_id: 'price_1TLtPqAHP8NRRyLCQRe4YJKq',
  },
};

// --- API: Subscription config ---
app.get('/api/subscription/config', (req, res) => {
  res.json({
    data: {
      premium: { ...STRIPE_PLANS.premium, payment_link: undefined },
      elite: { ...STRIPE_PLANS.elite, payment_link: undefined },
    }
  });
});

// --- API: Upgrade redirect ---
app.get('/api/upgrade/:tier', (req, res) => {
  const tier = req.params.tier?.toLowerCase();
  const plan = STRIPE_PLANS[tier];
  if (!plan) return res.status(400).json({ error: 'Invalid tier. Use: premium or elite' });
  const successUrl = encodeURIComponent(`${req.headers.origin || 'https://www.snapclaps.com'}/?payment=success&tier=${tier}`);
  res.redirect(302, `${plan.payment_link}?success_url=${successUrl}`);
});

// --- API: Legal pages ---
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'blog', 'privacy-policy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'blog', 'terms-of-service.html')));
app.get('/affiliate-disclosure', (req, res) => res.sendFile(path.join(__dirname, 'blog', 'affiliate-disclosure.html')));

// --- SEO: Sitemap + Robots ---
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

// --- Deal fetch cron (every 15 min) ---
const AIRPORTS = ['JFK','LAX','ORD','DFW','ATL','SFO','SEA','MIA','BOS','DEN','PHX','LAS'];
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '515443';

async function fetchAndStoreDeal(origin) {
  try {
    const res = await fetch(`https://api.travelpayouts.com/v1/prices/cheap?origin=${origin}&currency=usd&token=${TRAVELPAYOUTS_TOKEN}`);
    if (!res.ok) return;
    const json = await res.json();
    const deals = json.data || {};
    for (const [dest, info] of Object.entries(deals)) {
      if (!info || !info.price) continue;
      const price = info.price;
      const normalPrice = Math.round(price * 2.5);
      const savingsPct = 60;
      const id = `tp-flight-${origin}-${dest}`;
      const isError = price < 150 || savingsPct >= 70;
      const searchUrl = `https://snapclaps.com/api/search?origin=${origin}&dest=${dest}&deal_id=${id}`;
      await pool.query(`
        INSERT INTO deals (id, type, title, subtitle, deal_price, normal_price, savings_pct, currency, destination, destination_airport, origin_airport, affiliate_url, affiliate_program, urgency_type, expires_at, viral_score, is_error_fare, is_luxury, source, is_active, badge, is_evergreen, is_curated, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,NOW(),NOW())
        ON CONFLICT (id) DO UPDATE SET deal_price=$5, normal_price=$6, savings_pct=$7, affiliate_url=$12, urgency_type=$14, expires_at=$15, viral_score=$16, is_error_fare=$17, is_active=$20, badge=$21, updated_at=NOW()
      `, [
        id, 'flight',
        isError ? `🚨 ${dest.charAt(0)+dest.slice(1).toLowerCase()} from $${price}` : `✈️ ${dest.charAt(0)+dest.slice(1).toLowerCase()} from $${price}`,
        `Roundtrip from ${origin} — ${isError ? 'ERROR FARE! Book now' : 'limited availability'}`,
        price, normalPrice, savingsPct, 'USD',
        dest, dest, origin,
        searchUrl, 'kiwi',
        isError ? 'timer' : 'evergreen',
        isError ? new Date(Date.now() + 12 * 3600 * 1000).toISOString() : null,
        isError ? 9 : 7,
        isError, false, 'travelpayouts_api', true,
        isError ? 'HOT' : 'DEAL', false, true
      ]);
    }
  } catch (e) {
    console.error(`fetchDeal ${origin}:`, e.message);
  }
}

async function refreshDeals() {
  console.log('Refreshing deals from Travelpayouts...');
  // Deactivate expired timer deals
  await pool.query("UPDATE deals SET is_active=false WHERE urgency_type='timer' AND expires_at < NOW()").catch(() => {});
  for (const airport of AIRPORTS) {
    await fetchAndStoreDeal(airport);
    await new Promise(r => setTimeout(r, 500)); // throttle
  }
  console.log('Deals refreshed.');
}

// Run on start + every 15 min
refreshDeals();
setInterval(refreshDeals, 15 * 60 * 1000);

// --- Trip Planner routes ---
const tripPlannerRouter = require('./server/routes/trip-planner');
app.use('/api/plan', tripPlannerRouter);

// --- SPA fallback — serve React app ---
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/blog/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- Start ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SnapClaps server running on port ${PORT}`);
});
