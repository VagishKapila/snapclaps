const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// --- JWT Config ---
const JWT_SECRET = process.env.JWT_SECRET || 'snapclaps-jwt-secret-change-in-prod';

// --- Database ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

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
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initializeDatabase();

// --- Middleware ---
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',');
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
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

// --- API: Deals ---
app.get('/api/deals', optionalAuth, async (req, res) => {
  try {
    const { origin, limit = 50, type } = req.query;
    let query = 'SELECT * FROM deals WHERE is_active = true';
    const params = [];

    // Free tier users see only deals from 2+ hours ago
    if (!req.user || req.user.tier === 'free') {
      query += ` AND created_at < NOW() - INTERVAL '2 hours'`;
    }

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
    const aff = `https://www.aviasales.com/?marker=716647&origin=${d.orig}&destination=${d.dest}&depart_date=${d.dep}&return_date=${d.ret}`;
    await pool.query(
      `INSERT INTO deals (id, type, title, subtitle, deal_price, normal_price, savings_pct, currency, destination, destination_airport, origin_airport, affiliate_url, affiliate_program, urgency_type, viral_score, is_error_fare, is_luxury, source, is_active, badge, is_evergreen, is_curated, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'USD',$8,$8,$9,$10,'aviasales',$11,$12,$13,false,'manual',true,$14,false,false,NOW(),NOW())
       ON CONFLICT (id) DO UPDATE SET deal_price=$5, normal_price=$6, savings_pct=$7, destination_airport=$8, origin_airport=$9, affiliate_url=$10, urgency_type=$11, viral_score=$12, is_error_fare=$13, badge=$14, updated_at=NOW()`,
      [d.id,'flight',d.title,d.sub,d.price,d.normal,d.savings,d.dest,d.orig,aff,d.error?'timer':'evergreen',d.error?9:7,d.error,d.error?'HOT':'DEAL']
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
