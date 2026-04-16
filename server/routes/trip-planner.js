// server/routes/trip-planner.js
// All /api/plan/* endpoints

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { getAirportsFromZip } = require('../data/zip-airports');
const { getTransferPartners, getAllCards } = require('../data/transfer-partners');
const { findDestination, SWEET_SPOTS } = require('../data/sweet-spots');
const { generateTripPlan } = require('../utils/trip-engine');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Stripe (optional — only needed for paywall)
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch(e) { console.warn('Stripe not configured'); }

// ─── GET /api/plan/destinations ───────────────────────────────────────────
// Returns all available destinations for Step 2 autocomplete
router.get('/destinations', (req, res) => {
  const destinations = SWEET_SPOTS.map(d => ({
    name: d.destination,
    airports: d.airports,
    country_code: d.country_code,
    emoji: d.emoji,
    region: d.region,
  }));
  res.json({ destinations });
});

// ─── GET /api/plan/cards ──────────────────────────────────────────────────
// Returns all supported credit cards for Step 3
router.get('/cards', (req, res) => {
  res.json({ cards: getAllCards() });
});

// ─── POST /api/plan/search ────────────────────────────────────────────────
// Step 4: Submit search, kick off background plan generation
router.post('/search', async (req, res) => {
  try {
    const {
      session_id, zip_code, destination, travel_month,
      duration_days = 7, cabin_class = 'any', flexible_dates = true,
      cards = [], no_cards = false,
    } = req.body;

    if (!session_id) return res.status(400).json({ error: 'session_id required' });
    if (!destination) return res.status(400).json({ error: 'destination required' });

    // Resolve airports from zip
    const homeAirports = getAirportsFromZip(zip_code);
    const destData = findDestination(destination);
    const destAirports = destData ? destData.airports : [];
    const transferPartners = no_cards ? [] : getTransferPartners(cards.map(c => c.card_id));

    // Create search record
    const { rows } = await pool.query(
      `INSERT INTO trip_searches
        (session_id, zip_code, home_airports, destination, destination_airports, travel_month,
         duration_days, cabin_class, flexible_dates, cards, transfer_partners, no_cards, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'processing')
       RETURNING id`,
      [session_id, zip_code, homeAirports, destination, destAirports, travel_month,
       duration_days, cabin_class, flexible_dates, JSON.stringify(cards),
       transferPartners, no_cards]
    );
    const searchId = rows[0].id;

    // Generate plan asynchronously (don't await — let client poll)
    generateAndStorePlan(searchId).catch(err => {
      console.error('plan gen error:', err);
      pool.query(`UPDATE trip_searches SET status='error' WHERE id=$1`, [searchId]);
    });

    res.json({ search_id: searchId, status: 'processing', estimated_seconds: 8 });
  } catch (err) {
    console.error('POST /plan/search error:', err);
    res.status(500).json({ error: 'Failed to start search' });
  }
});

// ─── GET /api/plan/:searchId/status ──────────────────────────────────────
// Polling endpoint — returns current status
router.get('/:searchId/status', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ts.id, ts.status, tp.id as plan_id
       FROM trip_searches ts
       LEFT JOIN trip_plans tp ON tp.search_id = ts.id
       WHERE ts.id = $1`,
      [req.params.searchId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Search not found' });
    res.json({ search_id: rows[0].id, status: rows[0].status, has_plan: !!rows[0].plan_id });
  } catch (err) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

// ─── GET /api/plan/:searchId/teaser ──────────────────────────────────────
// Free preview (no payment required) — just the summary + teaser
router.get('/:searchId/teaser', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ts.destination, ts.travel_month, ts.duration_days,
              tp.trip_summary, tp.flight_options, tp.hotel_options
       FROM trip_searches ts
       JOIN trip_plans tp ON tp.search_id = ts.id
       WHERE ts.id = $1`,
      [req.params.searchId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Plan not found' });

    const plan = rows[0];
    const summary = plan.trip_summary || {};
    const flights = (plan.flight_options || []).slice(0, 1); // tease just top option

    res.json({
      destination: plan.destination,
      travel_month: plan.travel_month,
      duration_days: plan.duration_days,
      headline: summary.headline,
      emoji: summary.emoji,
      can_book_now: summary.can_book_now,
      best_program: summary.best_program,
      total_flight_miles: summary.total_flight_miles,
      teaser_flight: flights[0] ? {
        program_name: flights[0].program_name,
        miles_cost: flights[0].miles_cost,
        cabin: flights[0].cabin,
      } : null,
      programs_found: (plan.flight_options || []).length,
      hotel_options_count: (plan.hotel_options || []).length,
    });
  } catch (err) {
    res.status(500).json({ error: 'Teaser fetch failed' });
  }
});

// ─── GET /api/plan/:searchId/full ────────────────────────────────────────
// Full plan — requires payment check
router.get('/:searchId/full', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;

    // Check payment
    const { rows: searchRows } = await pool.query(
      `SELECT ts.*, tp.flight_options, tp.hotel_options, tp.card_recommendations, tp.trip_summary
       FROM trip_searches ts
       JOIN trip_plans tp ON tp.search_id = ts.id
       WHERE ts.id = $1`,
      [req.params.searchId]
    );
    if (!searchRows[0]) return res.status(404).json({ error: 'Plan not found' });

    const search = searchRows[0];

    // Check if user has access (paid session or subscribed user)
    const hasPaid = await checkAccess(sessionId, search.id);
    if (!hasPaid) {
      return res.status(402).json({
        error: 'Payment required',
        search_id: search.id,
        pricing: { monthly: 999, onetime: 9900 }, // cents
      });
    }

    res.json({
      search_id: search.id,
      destination: search.destination,
      travel_month: search.travel_month,
      duration_days: search.duration_days,
      trip_summary: search.trip_summary,
      flight_options: search.flight_options,
      hotel_options: search.hotel_options,
      card_recommendations: search.card_recommendations,
    });
  } catch (err) {
    console.error('GET /plan/full error:', err);
    res.status(500).json({ error: 'Failed to fetch full plan' });
  }
});

// ─── POST /api/plan/subscribe ─────────────────────────────────────────────
// Create Stripe checkout session for paywall
router.post('/subscribe', async (req, res) => {
  try {
    if (!stripe) return res.status(503).json({ error: 'Payments not configured' });

    const { search_id, plan_type, session_id } = req.body;
    if (!search_id || !plan_type) return res.status(400).json({ error: 'search_id and plan_type required' });

    const priceId = plan_type === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID || 'price_1TLtPqAHP8NRRyLCqObXqQm7'
      : process.env.STRIPE_ONETIME_PRICE_ID;

    if (!priceId) return res.status(503).json({ error: 'Price not configured' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan_type === 'monthly' ? 'subscription' : 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://www.snapclaps.com'}/plan/${search_id}?paid=true&session_id=${session_id}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://www.snapclaps.com'}/plan/${search_id}`,
      metadata: { search_id: String(search_id), plan_type, session_id: session_id || '' },
    });

    res.json({ checkout_url: session.url });
  } catch (err) {
    console.error('POST /plan/subscribe error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// ─── POST /api/plan/webhook ───────────────────────────────────────────────
// Stripe webhook — mark search as paid after successful payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Not configured');
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { search_id, session_id } = session.metadata || {};
    if (search_id) {
      // Store paid session_id -> search_id mapping
      await pool.query(
        `UPDATE trip_searches SET status='paid' WHERE id=$1`,
        [search_id]
      ).catch(console.error);
    }
  }
  res.json({ received: true });
});

// ─── Helpers ─────────────────────────────────────────────────────────────

async function generateAndStorePlan(searchId) {
  const { rows } = await pool.query(`SELECT * FROM trip_searches WHERE id=$1`, [searchId]);
  if (!rows[0]) throw new Error('Search not found: ' + searchId);
  const search = rows[0];

  const planData = await generateTripPlan({
    ...search,
    cards: Array.isArray(search.cards) ? search.cards : JSON.parse(search.cards || '[]'),
  });

  await pool.query(
    `INSERT INTO trip_plans (search_id, flight_options, hotel_options, card_recommendations, trip_summary)
     VALUES ($1,$2,$3,$4,$5)`,
    [searchId,
     JSON.stringify(planData.flight_options),
     JSON.stringify(planData.hotel_options),
     JSON.stringify(planData.card_recommendations),
     JSON.stringify(planData.trip_summary)]
  );

  await pool.query(`UPDATE trip_searches SET status='complete' WHERE id=$1`, [searchId]);
}

async function checkAccess(sessionId, searchId) {
  if (!sessionId) return false;
  // Check if this session paid for this search
  try {
    const { rows: r2 } = await pool.query(
      `SELECT id FROM trip_searches WHERE id=$1 AND status='paid'`,
      [searchId]
    );
    return r2.length > 0;
  } catch { return false; }
}

module.exports = router;
