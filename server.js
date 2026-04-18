const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// --- JWT Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'snapclaps-jwt-secret-change-in-prod';

// --- Database ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// --- Stripe webhook (raw body MUST be registered BEFORE express.json()) ───
// Stripe signature verification requires Buffer, not parsed JSON object.
// Both paths are registered here so express.json() doesn't consume the body first.
app.post('/api/plan/webhook',    express.raw({ type: 'application/json' }), (req, res) => webhookProxy(req, res));
app.post('/api/webhook/stripe',  express.raw({ type: 'application/json' }), (req, res) => webhookProxy(req, res));
function webhookProxy(req, res) {
  // Defer to trip-planner router's /webhook handler after patching url
  req.url = '/webhook';
  require('./server/routes/trip-planner')(req, res, () => res.status(404).end());
}

// --- Database initialization: create tables on startup ---
async function initializeDatabase() {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        name VARCHAR(255),
        tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free','premium','elite')),
        stripe_customer_id VARCHAR(255),
        home_airport VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        issuer VARCHAR(50) NOT NULL,
        card_name VARCHAR(100) NOT NULL,
        points_balance INTEGER DEFAULT 0,
        currency VARCHAR(50) DEFAULT 'points',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Run migrations for existing tables
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'free'");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS home_airport VARCHAR(10)");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS currency VARCHAR(50) DEFAULT 'points'");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS card_name VARCHAR(100)");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS issuer VARCHAR(50)");
    await pool.query("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS user_id UUID");
    await pool.query("ALTER TABLE user_cards ALTER COLUMN points_program DROP NOT NULL").catch(() => {});
    await pool.query("ALTER TABLE user_cards ALTER COLUMN user_id DROP NOT NULL").catch(() => {});
    console.log('Migrations applied');
    // Add columns that may not exist from original schema
    const alterCmds = [
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS departure_date DATE",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS return_date DATE",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS airline VARCHAR(100)",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS origin VARCHAR(10)",
      // Part B+C schema additions
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS typical_expiry_hours INTEGER DEFAULT 48",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS found_at TIMESTAMP DEFAULT NOW()",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_type VARCHAR(20) DEFAULT 'flight'",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS hotel_name VARCHAR(200)",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS hotel_stars NUMERIC(2,1)",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS hotel_city VARCHAR(100)",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS nights INTEGER",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS check_in DATE",
      "ALTER TABLE deals ADD COLUMN IF NOT EXISTS check_out DATE",
    ];
    for (const cmd of alterCmds) {
      await pool.query(cmd).catch(() => {});
    }

    // Clean up garbage data from old seed entries with bad affiliate URLs
    await pool.query(`
      DELETE FROM deals
      WHERE affiliate_url LIKE '%params=%'
         OR affiliate_url LIKE '%depart_date=%'
         OR (deal_price IS NULL AND price IS NULL)
    `).catch(() => {});

    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initializeDatabase();
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('X-Snapclaps-Version', '2.1.0-phase1');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// --- Auth Helper Functions ---
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const { userId } = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, name, tier, home_airport FROM users WHERE id = $1',
      [userId]
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'User not found' });
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    pool.query('SELECT id, email, name, tier FROM users WHERE id = $1', [userId])
      .then(r => {
        if (r.rows[0]) req.user = r.rows[0];
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}

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

// US domestic airports list (for is_domestic computed field)
const US_AIRPORTS_SET = new Set([
  'SJC','SFO','OAK','JFK','EWR','LGA','LAX','BUR','SNA','ORD','MDW',
  'MIA','FLL','ATL','DFW','DAL','SEA','BOS','DEN','HNL','OGG','LAS',
  'DTW','PHX','SLC','IAH','HOU','CLT','RDU','SMF','SCK','PDX','MSP',
  'STL','MKE','PIT','CLE','IND','CMH','BNA','AUS','SAT','JAX','MEM',
  'ABQ','TUS','OKC','RIC','BWI','DCA','IAD','MCO','TPA','SAN',
]);

// --- API: Deals ---
// 3C — Live deal count (real data, cached 10 min)
let _dealCountCache = { count: null, ts: 0 };
app.get('/api/deals/count', async (req, res) => {
  try {
    const now = Date.now();
    if (_dealCountCache.count !== null && now - _dealCountCache.ts < 10 * 60 * 1000) {
      return res.json({ count: _dealCountCache.count, source: 'travelpayouts:live_deals', cached: true });
    }
    const result = await pool.query(`
      SELECT COUNT(*) AS cnt FROM deals
      WHERE is_active = true
        AND COALESCE(deal_price::numeric, 0) > 0
        AND (expires_at IS NULL OR expires_at > NOW())
        AND (
          typical_expiry_hours IS NULL OR found_at IS NULL
          OR found_at + (COALESCE(typical_expiry_hours, 48) * INTERVAL '1 hour') > NOW()
        )
    `);
    const count = parseInt(result.rows[0]?.cnt ?? '0', 10);
    _dealCountCache = { count, ts: now };
    res.json({ count, source: 'travelpayouts:live_deals', cached: false });
  } catch (err) {
    console.error('deals/count error:', err.message);
    res.status(500).json({ error: 'count unavailable' });
  }
});

app.get('/api/deals', optionalAuth, async (req, res) => {
  try {
    const { airports, origin, limit = 30, type } = req.query;
    const params = [];

    // Build base query — deal_price/normal_price stored as TEXT; cast to numeric for comparisons
    let query = `
      SELECT *,
        COALESCE(
          expires_at,
          CASE WHEN typical_expiry_hours IS NOT NULL AND found_at IS NOT NULL
            THEN found_at + (COALESCE(typical_expiry_hours, 48) * INTERVAL '1 hour')
            ELSE NULL
          END
        ) AS effective_expiry
      FROM deals
      WHERE is_active = true
        AND COALESCE(deal_price::numeric, 0) > 0
    `;

    // Only return non-expired deals
    query += `
        AND (
          expires_at IS NULL
          OR expires_at > NOW()
        )
    `;

    // Filter out deals where typical estimated expiry has passed
    query += `
        AND (
          typical_expiry_hours IS NULL
          OR found_at IS NULL
          OR found_at + (COALESCE(typical_expiry_hours, 48) * INTERVAL '1 hour') > NOW()
        )
    `;

    // Free tier sees deals from 2+ hours ago (slightly delayed)
    if (!req.user || req.user.tier === 'free') {
      // 2-hour delay for flight deals on free tier; hotels/evergreen always visible
      query += ` AND (created_at < NOW() - INTERVAL '2 hours' OR deal_type = 'hotel' OR urgency_type = 'evergreen')`;
    }

    // Filter by specific airports list (from ZIP lookup)
    if (airports) {
      const airportList = String(airports).split(',').map(a => a.trim().toUpperCase()).filter(Boolean);
      if (airportList.length > 0) {
        params.push(airportList);
        query += ` AND (origin_airport = ANY($${params.length}) OR origin_airport IS NULL)`;
      }
    } else if (origin) {
      // Legacy single-airport filter
      params.push(origin.toUpperCase());
      query += ` AND (origin_airport = $${params.length} OR origin_airport IS NULL)`;
    }

    if (type) {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }

    // Sort: error fares first, then by viral_score, then by created_at
    query += ` ORDER BY is_error_fare DESC NULLS LAST, viral_score DESC NULLS LAST, created_at DESC`;
    params.push(parseInt(String(limit)) || 30);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);

    // Add computed fields for frontend
    const deals = result.rows.map(d => ({
      ...d,
      is_domestic: US_AIRPORTS_SET.has((d.destination_airport || '').toUpperCase()),
      is_urgent: d.urgency_type === 'timer' && d.expires_at && new Date(d.expires_at) > new Date(),
      hours_left: d.effective_expiry
        ? Math.max(0, Math.round((new Date(d.effective_expiry) - new Date()) / 3600000))
        : null,
      // Ensure booking_url has marker=716647
      booking_url: (() => {
        const url = d.affiliate_url || d.booking_url || '';
        if (!url) return `https://www.aviasales.com/?marker=716647&origin=${d.origin_airport || ''}&destination=${d.destination_airport || ''}`;
        if (url.includes('marker=716647')) return url;
        return url + (url.includes('?') ? '&' : '?') + 'marker=716647';
      })(),
    }));

    res.json({ data: deals, count: deals.length });
  } catch (err) {
    console.error('deals error:', err.message);
    res.status(500).json({ error: 'Failed to load deals' });
  }
});

// --- API: Single deal by ID ---
app.get('/api/deals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM deals WHERE id = $1 AND is_active = true LIMIT 1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }
    const d = result.rows[0];
    res.json({
      data: {
        ...d,
        is_urgent: d.urgency_type === 'timer' && d.expires_at && new Date(d.expires_at) > new Date(),
        hours_left: d.expires_at ? Math.max(0, Math.round((new Date(d.expires_at) - new Date()) / 3600000)) : null,
      }
    });
  } catch (err) {
    console.error('deal/:id error:', err.message);
    res.status(500).json({ error: 'Failed to load deal' });
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

// --- API: Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, tier, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email, name, tier, home_airport',
      [email.toLowerCase(), passwordHash, name, 'free']
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          homeAirport: user.home_airport,
        }
      }
    });
  } catch (err) {
    console.error('register error:', err.message);
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    const result = await pool.query('SELECT id, email, name, tier, home_airport, password_hash FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          homeAirport: user.home_airport,
        }
      }
    });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const cardsResult = await pool.query('SELECT id, issuer, card_name, points_balance, currency FROM user_cards WHERE user_id = $1 LIMIT 20', [req.user.id]);

    res.json({
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          tier: req.user.tier,
          homeAirport: req.user.home_airport,
        },
        cards: cardsResult.rows.map(c => ({
          id: c.id,
          issuer: c.issuer,
          cardName: c.card_name,
          pointsBalance: c.points_balance,
          currency: c.currency,
          createdAt: c.created_at,
        }))
      }
    });
  } catch (err) {
    console.error('auth/me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data', detail: err.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ data: { success: true, message: 'Logged out' } });
});

// --- API: Points Wallet Routes ---
const TRANSFER_PARTNERS = {
  'chase_sapphire': { airlines: ['United', 'Southwest', 'British Airways', 'Air France/KLM', 'Virgin Atlantic', 'Singapore Airlines', 'Aeroplan', 'Emirates'], hotels: ['Hyatt', 'IHG'] },
  'chase_sapphire_reserve': { airlines: ['United', 'Southwest', 'British Airways', 'Air France/KLM', 'Virgin Atlantic', 'Singapore Airlines', 'Aeroplan', 'Emirates'], hotels: ['Hyatt', 'IHG'] },
  'amex_platinum': { airlines: ['Delta', 'British Airways', 'Air France/KLM', 'ANA', 'Virgin Atlantic', 'Avianca LifeMiles', 'Singapore Airlines', 'Aeroplan', 'Cathay Pacific', 'Etihad'], hotels: ['Hilton', 'Marriott'] },
  'amex_gold': { airlines: ['Delta', 'British Airways', 'Air France/KLM', 'ANA', 'Virgin Atlantic', 'Avianca LifeMiles', 'Singapore Airlines', 'Aeroplan'], hotels: ['Hilton', 'Marriott'] },
  'capital_one_venture_x': { airlines: ['Air Canada Aeroplan', 'British Airways', 'Air France/KLM', 'Turkish', 'Avianca', 'Singapore Airlines', 'Cathay Pacific'], hotels: ['Wyndham'] },
  'citi_strata': { airlines: ['Air France/KLM', 'Singapore Airlines', 'Turkish', 'Avianca LifeMiles', 'Virgin Atlantic', 'Qatar', 'Cathay Pacific', 'Emirates'], hotels: ['Accor', 'Wyndham'] },
  'bilt': { airlines: ['American', 'United', 'Air Canada', 'Turkish', 'Virgin Atlantic', 'Air France/KLM'], hotels: ['Hyatt', 'IHG', 'Marriott', 'Hilton'] },
};

app.get('/api/wallet', authMiddleware, async (req, res) => {
  try {
    const cardsResult = await pool.query(
      'SELECT id, issuer, card_name, points_balance, currency FROM user_cards WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const cards = cardsResult.rows.map(c => ({
      id: c.id,
      issuer: c.issuer,
      cardName: c.card_name,
      pointsBalance: c.points_balance,
      currency: c.currency,
      transferPartners: TRANSFER_PARTNERS[c.issuer] || { airlines: [], hotels: [] },
    }));

    res.json({ data: { cards } });
  } catch (err) {
    console.error('wallet error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

app.post('/api/wallet/cards', authMiddleware, async (req, res) => {
  try {
    const { issuer, cardName, pointsBalance } = req.body;

    if (!issuer || !cardName) {
      return res.status(400).json({ error: 'Issuer and card name are required' });
    }

    if (typeof issuer !== 'string' || typeof cardName !== 'string') {
      return res.status(400).json({ error: 'Invalid input types' });
    }

    const balance = parseInt(pointsBalance) || 0;

    const result = await pool.query(
      'INSERT INTO user_cards (user_id, issuer, card_name, points_balance, currency, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, issuer, card_name, points_balance, currency',
      [req.user.id, issuer, cardName, balance, 'points']
    );

    const card = result.rows[0];

    res.status(201).json({
      data: {
        id: card.id,
        issuer: card.issuer,
        cardName: card.card_name,
        pointsBalance: card.points_balance,
        currency: card.currency,
        transferPartners: TRANSFER_PARTNERS[card.issuer] || { airlines: [], hotels: [] },
      }
    });
  } catch (err) {
    console.error('wallet/cards POST error:', err.message);
    res.status(500).json({ error: 'Failed to add card' });
  }
});

app.put('/api/wallet/cards/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { pointsBalance } = req.body;

    if (typeof pointsBalance !== 'number') {
      return res.status(400).json({ error: 'Points balance must be a number' });
    }

    const cardCheck = await pool.query('SELECT user_id FROM user_cards WHERE id = $1', [id]);
    if (cardCheck.rows.length === 0 || cardCheck.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const result = await pool.query(
      'UPDATE user_cards SET points_balance = $1 WHERE id = $2 RETURNING id, issuer, card_name, points_balance, currency',
      [pointsBalance, id]
    );

    const card = result.rows[0];

    res.json({
      data: {
        id: card.id,
        issuer: card.issuer,
        cardName: card.card_name,
        pointsBalance: card.points_balance,
        currency: card.currency,
        transferPartners: TRANSFER_PARTNERS[card.issuer] || { airlines: [], hotels: [] },
      }
    });
  } catch (err) {
    console.error('wallet/cards PUT error:', err.message);
    res.status(500).json({ error: 'Failed to update card' });
  }
});

app.delete('/api/wallet/cards/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const cardCheck = await pool.query('SELECT user_id FROM user_cards WHERE id = $1', [id]);
    if (cardCheck.rows.length === 0 || cardCheck.rows[0].user_id !== req.user.id) {
      return res.status(404).json({ error: 'Card not found' });
    }

    await pool.query('DELETE FROM user_cards WHERE id = $1', [id]);

    res.json({ data: { success: true, message: 'Card removed' } });
  } catch (err) {
    console.error('wallet/cards DELETE error:', err.message);
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// --- Deal fetch cron (every 15 min) ---
const AIRPORTS = ['JFK','LAX','ORD','DFW','ATL','SFO','SEA','MIA','BOS','DEN','PHX','LAS'];
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN;
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '515443';

// Airport code to city name lookup
const AIRPORT_CITIES = {
  SFO:'San Francisco',LAX:'Los Angeles',JFK:'New York',ORD:'Chicago',MIA:'Miami',
  ATL:'Atlanta',DFW:'Dallas',SEA:'Seattle',BOS:'Boston',DEN:'Denver',SJC:'San Jose',
  OAK:'Oakland',PHX:'Phoenix',LAS:'Las Vegas',MSP:'Minneapolis',DTW:'Detroit',
  NRT:'Tokyo',HND:'Tokyo',CDG:'Paris',LHR:'London',FCO:'Rome',BCN:'Barcelona',
  AMS:'Amsterdam',FRA:'Frankfurt',MXP:'Milan',MAD:'Madrid',ZRH:'Zurich',VIE:'Vienna',
  CUN:'Cancun',DPS:'Bali',HNL:'Honolulu',ICN:'Seoul',BKK:'Bangkok',SIN:'Singapore',
  DXB:'Dubai',MLE:'Maldives',SYD:'Sydney',MEL:'Melbourne',NAN:'Fiji',PVR:'Puerto Vallarta',
  SJU:'San Juan',MSY:'New Orleans',TYO:'Tokyo',GRU:'São Paulo',EZE:'Buenos Aires',
  SCL:'Santiago',BOG:'Bogota',LIM:'Lima',GIG:'Rio de Janeiro',
};

function buildAviasalesUrl(origin, dest, departureAt, returnAt) {
  // Correct Aviasales format: /search/{origin}{DDMM}{destination}{DDMM}?marker=716647
  // e.g. SFO1506NRT2106?marker=716647
  const marker = '716647';
  if (!departureAt) {
    return `https://www.aviasales.com/?marker=${marker}&origin=${origin}&destination=${dest}`;
  }
  const dep = new Date(departureAt);
  const dd = String(dep.getUTCDate()).padStart(2,'0');
  const mm = String(dep.getUTCMonth()+1).padStart(2,'0');
  const depPart = `${dd}${mm}`;
  
  if (returnAt) {
    const ret = new Date(returnAt);
    const rdd = String(ret.getUTCDate()).padStart(2,'0');
    const rmm = String(ret.getUTCMonth()+1).padStart(2,'0');
    return `https://www.aviasales.com/search/${origin}${depPart}${dest}${rdd}${rmm}?marker=${marker}`;
  }
  // One-way
  return `https://www.aviasales.com/search/${origin}${depPart}${dest}1?marker=${marker}`;
}

async function fetchAndStoreDeal(origin) {
  try {
    if (!TRAVELPAYOUTS_TOKEN) {
      console.log(`Skip fetchDeal ${origin}: TRAVELPAYOUTS_TOKEN not set`);
      return;
    }
    // Use prices_for_dates which returns actual price field + link
    const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
    const allDeals = [];
    for (const month of months.slice(0, 2)) { // fetch 2 months to stay within rate limits
      const res = await fetch(
        `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?token=${TRAVELPAYOUTS_TOKEN}&origin=${origin}&departure_at=${month}&currency=usd&sorting=price&limit=10&market=us`
      );
      if (!res.ok) continue;
      const json = await res.json();
      if (json.data) allDeals.push(...json.data);
      await new Promise(r => setTimeout(r, 200)); // avoid rate limit
    }
    
    for (const deal of allDeals) {
      // prices_for_dates fields: origin_airport, destination_airport, price, airline, departure_at, link
      const dest = deal.destination_airport || deal.destination;
      const price = deal.price;
      if (!dest || !price || price <= 0) continue;
      
      const id = `tp-flight-${origin}-${dest}`;
      const normalPrice = Math.round(price * 2.2);
      const savingsPct = Math.round(((normalPrice - price) / normalPrice) * 100);
      const isError = price < 150 || savingsPct >= 70;
      
      const originCity = AIRPORT_CITIES[origin] || origin;
      const destCity = AIRPORT_CITIES[dest] || dest;
      
      // Use the link field from API which already has the correct Aviasales path
      // Just add our affiliate marker=716647
      const affiliateUrl = deal.link
        ? `https://www.aviasales.com${deal.link}&marker=716647`
        : buildAviasalesUrl(origin, dest, deal.departure_at, null);
      
      const depDate = deal.departure_at ? deal.departure_at.slice(0,10) : null;
      const retDate = null; // prices_for_dates is one-way pricing
      
      const expiryHours = isError ? 12 : 48;
      const expiresAt = isError ? new Date(Date.now() + expiryHours * 3_600_000).toISOString() : null;
      await pool.query(
        `INSERT INTO deals (id, type, title, subtitle, deal_price, normal_price, savings_pct, currency, destination, destination_airport, origin_airport, affiliate_url, affiliate_program, urgency_type, expires_at, viral_score, is_error_fare, is_luxury, source, is_active, badge, is_evergreen, is_curated, departure_date, return_date, airline, typical_expiry_hours, found_at, deal_type, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'USD',$8,$8,$9,$10,'aviasales',$11,$12,$13,$14,false,'travelpayouts_v3',true,$15,false,true,$16,$17,$18,$19,NOW(),'flight',NOW(),NOW())
         ON CONFLICT (id) DO UPDATE SET deal_price=$5, normal_price=$6, savings_pct=$7, affiliate_url=$10, urgency_type=$11, expires_at=$12, is_error_fare=$14, badge=$15, departure_date=$16, return_date=$17, airline=$18, typical_expiry_hours=$19, is_active=true, updated_at=NOW()`,
        [
          id, 'flight',
          isError ? `🚨 ${originCity} → ${destCity} from $${price}` : `✈️ ${originCity} → ${destCity} from $${price}`,
          `${deal.airline || 'Multiple Airlines'} · ${deal.transfers === 0 ? 'Nonstop' : deal.transfers + ' stop'} · ${depDate || 'Flexible dates'}`,
          price, normalPrice, savingsPct,
          dest, origin, affiliateUrl,
          isError ? 'timer' : 'evergreen',
          expiresAt,
          isError ? 9 : 7,
          isError,
          isError ? 'ERROR FARE' : 'DEAL',
          depDate, retDate, deal.airline || null,
          expiryHours
        ]
      ).catch(err => {
        if (err.message.includes('column')) {
          console.log('Column mismatch:', err.message.substring(0,120));
        } else {
          console.error('Insert error:', err.message.substring(0,120));
        }
      });
    }
    console.log(`Fetched ${json.data.length} deals for ${origin}`);
  } catch (e) {
    console.error(`fetchDeal ${origin}:`, e.message);
  }
}

// --- Hotellook fetcher (uses existing TRAVELPAYOUTS_TOKEN) ---
const HOTEL_DESTINATIONS = [
  { city: 'New York', iata: 'JFK', loc: 'New York,United States' },
  { city: 'Los Angeles', iata: 'LAX', loc: 'Los Angeles,United States' },
  { city: 'Miami', iata: 'MIA', loc: 'Miami,United States' },
  { city: 'Paris', iata: 'CDG', loc: 'Paris,France' },
  { city: 'London', iata: 'LHR', loc: 'London,United Kingdom' },
  { city: 'Rome', iata: 'FCO', loc: 'Rome,Italy' },
  { city: 'Tokyo', iata: 'NRT', loc: 'Tokyo,Japan' },
  { city: 'Bali', iata: 'DPS', loc: 'Bali,Indonesia' },
  { city: 'Cancun', iata: 'CUN', loc: 'Cancun,Mexico' },
  { city: 'Barcelona', iata: 'BCN', loc: 'Barcelona,Spain' },
];

async function fetchAndStoreHotelDeals() {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.log('Skip hotel fetch: TRAVELPAYOUTS_TOKEN not set');
    return 0;
  }
  let count = 0;
  for (const dest of HOTEL_DESTINATIONS) {
    try {
      // Hotellook cache API — returns popular hotels with prices
      const checkIn = new Date(); checkIn.setDate(checkIn.getDate() + 14);
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + 3);
      const fmt = (d) => d.toISOString().slice(0, 10);
      const url = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(dest.loc)}&checkIn=${fmt(checkIn)}&checkOut=${fmt(checkOut)}&adults=2&token=${TRAVELPAYOUTS_TOKEN}&limit=5&currency=USD`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const json = await res.json();
      const hotels = Array.isArray(json) ? json : (json.results || json.hotels || []);
      for (const h of hotels.slice(0, 3)) {
        const pricePerNight = Math.round(h.priceFrom || h.price || 0);
        if (!pricePerNight || pricePerNight <= 0) continue;
        const nights = 3;
        const totalPrice = pricePerNight * nights;
        const normalTotal = Math.round(totalPrice * 1.8);
        const savingsPct = Math.round(((normalTotal - totalPrice) / normalTotal) * 100);
        const stars = h.stars || 3;
        const hotelName = h.name || h.hotelName || 'Hotel';
        const hotelId = h.id || h.hotelId || '';
        const bookUrl = `https://search.hotellook.com/hotels?hotelId=${hotelId}&checkIn=${fmt(checkIn)}&checkOut=${fmt(checkOut)}&adults=2&marker=716647`;
        const id = `hl-hotel-${dest.iata}-${String(hotelId)}`;
        await pool.query(
          `INSERT INTO deals (id, type, title, subtitle, deal_price, normal_price, savings_pct, currency, destination, destination_airport, origin_airport, affiliate_url, affiliate_program, urgency_type, expires_at, viral_score, is_error_fare, is_luxury, source, is_active, badge, is_evergreen, is_curated, typical_expiry_hours, found_at, deal_type, hotel_name, hotel_stars, hotel_city, nights, check_in, check_out, created_at, updated_at)
           VALUES ($1,'hotel',$2,$3,$4,$5,$6,'USD',$7,$7,NULL,$8,'hotellook','evergreen',NULL,$9,false,$10,'hotellook',true,'HOTEL DEAL',false,false,72,NOW(),'hotel',$11,$12,$13,$14,$15,$16,NOW(),NOW())
           ON CONFLICT (id) DO UPDATE SET deal_price=$4, normal_price=$5, savings_pct=$6, affiliate_url=$8, hotel_name=$11, hotel_stars=$12, hotel_city=$13, nights=$14, check_in=$15, check_out=$16, is_active=true, updated_at=NOW()`,
          [id, `🏨 ${dest.city} — $${pricePerNight}/night`, `${hotelName} · ${stars}★ · ${nights} nights · Instant booking`,
           totalPrice, normalTotal, savingsPct, dest.iata, bookUrl,
           stars >= 4 ? 8 : 6, stars >= 4,
           hotelName, stars, dest.city, nights, fmt(checkIn), fmt(checkOut)]
        ).catch(e => console.error('hotel insert err:', e.message.substring(0, 80)));
        count++;
      }
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`Hotellook ${dest.city}:`, e.message);
    }
  }
  return count;
}

// --- Kiwi fetcher placeholder (KIWI_API_KEY not set — blocked) ---
async function fetchKiwiDeals() {
  const key = process.env.KIWI_API_KEY;
  if (!key) {
    // KIWI_API_KEY not set in Railway — skipping Kiwi source
    return 0;
  }
  // TODO: implement when KIWI_API_KEY is added to Railway
  return 0;
}

// --- Unified orchestrator ---
async function refreshDeals() {
  console.log('[Orchestrator] Starting deal refresh...');

  // 1. Hard-delete truly expired timer deals (not just deactivate)
  const deleted = await pool.query(
    "DELETE FROM deals WHERE urgency_type='timer' AND expires_at < NOW() - INTERVAL '1 hour' RETURNING id"
  ).catch(() => ({ rows: [] }));
  if (deleted.rows.length > 0) console.log(`[Orchestrator] Deleted ${deleted.rows.length} expired deals`);

  // 2. Deactivate timer deals that just expired (within last hour — keep briefly for in-flight pageviews)
  await pool.query(
    "UPDATE deals SET is_active=false WHERE urgency_type='timer' AND expires_at < NOW() AND is_active=true"
  ).catch(() => {});

  // 3. Fetch Travelpayouts flight deals
  let flightCount = 0;
  for (const airport of AIRPORTS) {
    await fetchAndStoreDeal(airport);
    flightCount++;
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`[Orchestrator] Processed ${flightCount} flight origins`);

  // 4. Fetch Hotellook hotel deals
  const hotelCount = await fetchAndStoreHotelDeals();
  console.log(`[Orchestrator] Stored ${hotelCount} hotel deals`);

  // 5. Fetch Kiwi (no-op if key missing)
  const kiwiCount = await fetchKiwiDeals();
  if (kiwiCount > 0) console.log(`[Orchestrator] Stored ${kiwiCount} Kiwi deals`);

  console.log('[Orchestrator] Refresh complete.');
}

// Auto-delete expired deals every 5 minutes (lightweight)
async function cleanExpiredDeals() {
  await pool.query(
    "DELETE FROM deals WHERE urgency_type='timer' AND expires_at < NOW() - INTERVAL '30 minutes'"
  ).catch(() => {});
}

// Run on start + every 15 min for full refresh
refreshDeals();
setInterval(refreshDeals, 15 * 60 * 1000);

// Every 5 min: clean expired deals
setInterval(cleanExpiredDeals, 5 * 60 * 1000);

// --- Trip Planner routes ---
const tripPlannerRouter = require('./server/routes/trip-planner');
app.use('/api/plan', tripPlannerRouter);


// --- Wallet: Bulk setup (onboarding) ---
app.post('/api/wallet/setup', authMiddleware, async (req, res) => {
  try {
    const { homeAirport, cards } = req.body;
    if (!cards || !Array.isArray(cards)) return res.status(400).json({ error: 'cards array required' });
    // Update home airport
    if (homeAirport && typeof homeAirport === 'string') {
      await pool.query('UPDATE users SET home_airport = $1 WHERE id = $2', [homeAirport.toUpperCase().slice(0,10), req.user.id]);
    }
    // Delete existing cards and re-insert
    await pool.query('DELETE FROM user_cards WHERE user_id = $1', [req.user.id]);
    for (const card of cards.slice(0, 10)) {
      if (!card.issuer || !card.cardName) continue;
      await pool.query(
        'INSERT INTO user_cards (user_id, issuer, card_name, points_balance) VALUES ($1::uuid, $2, $3, $4)',
        [req.user.id, String(card.issuer).slice(0,50), String(card.cardName).slice(0,100), parseInt(card.pointsBalance) || 0]
      );
    }
    res.json({ data: { success: true, message: 'Wallet setup complete' } });
  } catch (err) {
    console.error('wallet/setup error:', err.message);
    res.status(500).json({ error: 'Failed to setup wallet', detail: err.message });
  }
});


// --- Admin: Seed real deals directly ---
app.post('/api/admin/seed-deals', async (req, res) => {
  if (req.headers['x-admin-key'] !== 'snapclaps-seed-2026') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const deals = [
    { id: 'tp-flight-JFK-MXP', orig: 'JFK', dest: 'MXP', price: 143, normal: 870, savings: 83, error: true, title: '🚨 Milan from $143', sub: 'TAP Air Portugal via Lisbon · RT · May 5–15, May 12–22', dep: '2026-05-05', ret: '2026-05-15' },
    { id: 'tp-flight-ORD-CUN', orig: 'ORD', dest: 'CUN', price: 89, normal: 890, savings: 90, error: true, title: '🚨 Cancun from $89', sub: 'American Airlines · Nonstop · RT · Apr 28–May 8', dep: '2026-04-28', ret: '2026-05-08' },
    { id: 'tp-flight-LAX-NRT', orig: 'LAX', dest: 'NRT', price: 487, normal: 1100, savings: 56, error: false, title: '✈️ Tokyo from $487', sub: 'ANA via Tokyo · RT · Oct 2026', dep: '2026-10-01', ret: '2026-10-14' },
    { id: 'tp-flight-SFO-CDG', orig: 'SFO', dest: 'CDG', price: 312, normal: 870, savings: 64, error: true, title: '🚨 Paris from $312', sub: 'Air France · RT · Jun 2026', dep: '2026-06-01', ret: '2026-06-15' },
    { id: 'tp-flight-JFK-LHR', orig: 'JFK', dest: 'LHR', price: 298, normal: 780, savings: 62, error: false, title: '✈️ London from $298', sub: 'British Airways · RT · May 3–22', dep: '2026-05-03', ret: '2026-05-22' },
    { id: 'tp-flight-LAX-DPS', orig: 'LAX', dest: 'DPS', price: 487, normal: 1200, savings: 59, error: false, title: '✈️ Bali from $487', sub: 'ANA via Tokyo · RT · Oct 12–22', dep: '2026-10-12', ret: '2026-10-22' },
    { id: 'tp-flight-JFK-CUN', orig: 'JFK', dest: 'CUN', price: 198, normal: 520, savings: 62, error: false, title: '✈️ Cancun from $198', sub: 'JetBlue · Nonstop · RT · May 1–15', dep: '2026-05-01', ret: '2026-05-15' },
    { id: 'tp-flight-SFO-NRT', orig: 'SFO', dest: 'NRT', price: 647, normal: 1100, savings: 41, error: false, title: '✈️ Tokyo from $647', sub: 'ANA · Nonstop · RT · Oct 2026', dep: '2026-10-01', ret: '2026-10-14' },
  ];
  
  let count = 0;
  for (const d of deals) {
    // Build proper Aviasales search URL with dates baked in (not query params)
    const aff = buildAviasalesUrl(d.orig, d.dest, d.dep, d.ret);
    const expiryHours = d.error ? 12 : 48;
    const expiresAt = d.error ? new Date(Date.now() + expiryHours * 3_600_000).toISOString() : null;
    await pool.query(
      `INSERT INTO deals (id, type, title, subtitle, deal_price, normal_price, savings_pct, currency, destination, destination_airport, origin_airport, affiliate_url, affiliate_program, urgency_type, expires_at, viral_score, is_error_fare, is_luxury, source, is_active, badge, is_evergreen, is_curated, typical_expiry_hours, found_at, deal_type, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'USD',$8,$8,$9,$10,'aviasales',$11,$12,$13,$14,false,'manual',true,$15,false,false,$16,NOW(),'flight',NOW(),NOW())
       ON CONFLICT (id) DO UPDATE SET deal_price=$5, normal_price=$6, savings_pct=$7, destination_airport=$8, origin_airport=$9, affiliate_url=$10, urgency_type=$11, expires_at=$12, viral_score=$13, is_error_fare=$14, badge=$15, typical_expiry_hours=$16, updated_at=NOW()`,
      [d.id,'flight',d.title,d.sub,d.price,d.normal,d.savings,d.dest,d.orig,aff,d.error?'timer':'evergreen',expiresAt,d.error?9:7,d.error,d.error?'HOT':'DEAL',expiryHours]
    );
    count++;
  }
  res.json({ data: { seeded: count, message: 'Real deals seeded successfully' } });
});

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
