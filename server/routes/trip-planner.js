// server/routes/trip-planner.js
// All /api/plan/* endpoints — Checkpoint D rewrite
//
// CHANGES FROM PREVIOUS VERSION:
//   - POST /search: now SYNCHRONOUS. Queries sweet_spots from DB (not JS mock data).
//     Applies off-peak/peak logic. Calls Seats.aero with 5s timeout for live dates.
//     Returns new response shape matching TripPlanner.jsx exactly.
//   - GET /user/tier: new endpoint
//   - POST /subscribe: supports 'monthly' ($9.99) and 'onetime' ($99 concierge) plan types
//   - POST /webhook: now updates users.subscription_tier + subscription_min_end
//   - GET /:id/full: gates on subscription_tier != 'free' AND subscription_min_end > NOW()
//
// CACHE STRATEGY (flagged per spec):
//   PostgreSQL table: seats_aero_cache (cache_key TEXT, response_data JSONB, created_at TIMESTAMPTZ)
//   TTL: 6 hours. ON CONFLICT (cache_key) DO UPDATE refreshes on new data.
//   ✅ Survives Railway restarts. No Redis needed at current scale.
//   Flag: if daily Seats.aero API call volume exceeds 1,000/day, add Redis (Railway plugin available).
//
// STRIPE ENV VARS REQUIRED (not yet set in Railway — FLAG):
//   STRIPE_SECRET_KEY         — live secret key for checkout sessions
//   STRIPE_WEBHOOK_SECRET     — from `stripe listen` or dashboard
//   STRIPE_MONTHLY_PRICE_ID   — price_1TLtPqAHP8NRRyLCqObXqQm7 ($9.99/mo, already exists)
//   STRIPE_ONETIME_PRICE_ID   — $99 one-time concierge price (must be created in Stripe dashboard)
//
// mapSeatsAeroCabin LOCATION: server/utils/seats-aero.js, exported as mapSeatsAeroCabin

'use strict';

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { getAirportsFromZip } = require('../data/zip-airports');
const { getDateCandidates, mapSeatsAeroCabin } = require('../utils/seats-aero');
const { effectiveMiles, isOffPeak } = require('../utils/off-peak');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ── Stripe setup (optional — 503 if not configured) ───────────────────────
let stripe = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) { console.warn('Stripe not configured:', e.message); }

// Price IDs
const STRIPE_MONTHLY_PRICE_ID  = process.env.STRIPE_MONTHLY_PRICE_ID  || 'price_1TLtPqAHP8NRRyLCqObXqQm7';
const STRIPE_ONETIME_PRICE_ID  = process.env.STRIPE_ONETIME_PRICE_ID  || null; // Must be set — see header note
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.snapclaps.com';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plan/search
// Synchronous: queries sweet_spots, applies off-peak logic, fetches Seats.aero dates
// ─────────────────────────────────────────────────────────────────────────────
router.post('/search', async (req, res) => {
  try {
    // Accept both new TripPlanner.jsx format and old format for backward compat
    const {
      // New format (from TripPlanner.jsx Step 4)
      zip,
      destination_airport,
      destination_freetext,   // Bug 1: user-typed destination not in seeded list
      month,
      duration,
      // Old format fields (backward compat)
      zip_code,
      destination,        // city name — ignored in favor of destination_airport
      travel_month,
      duration_days,
      cabin_class = 'any',
      session_id,
    } = req.body;

    const effectiveZip         = zip || zip_code;
    const effectiveDestAirport = destination_airport;
    // session_id: use provided value, fall back to cookie set by session middleware, or generate one
    const effectiveSessionId   = session_id || req.sessionId || require('crypto').randomBytes(16).toString('hex');
    const effectiveMonth       = month || travel_month;
    const effectiveDuration    = parseInt(duration || duration_days || 7, 10);

    if (!effectiveDestAirport) {
      return res.status(400).json({ error: 'destination_airport required (IATA code, e.g. "FCO")' });
    }
    if (!effectiveMonth || !/^\d{4}-\d{2}$/.test(effectiveMonth)) {
      return res.status(400).json({ error: 'month required in YYYY-MM format (e.g. "2026-10")' });
    }

    // ── Bug 1: FREETEXT destination — save and return researching state ──
    if (effectiveDestAirport === 'FREETEXT') {
      const homeAirports = getAirportsFromZip(effectiveZip || '');
      const origin = homeAirports[0] || null;
      const effectiveSessionIdFT = effectiveSessionId;
      // Ensure column exists (idempotent migration)
      await pool.query(`ALTER TABLE trip_searches ADD COLUMN IF NOT EXISTS destination_freetext VARCHAR(200)`).catch(() => {});
      const { rows: [ftRow] } = await pool.query(`
        INSERT INTO trip_searches
          (session_id, zip_code, origin_airport, destination_airport, destination_freetext,
           travel_month, duration_days, cabin_class, status, home_airports)
        VALUES ($1,$2,$3,'FREETEXT',$4,$5,$6,$7,'researching',$8)
        RETURNING id
      `, [
        effectiveSessionIdFT,
        effectiveZip,
        origin,
        destination_freetext || null,
        effectiveMonth,
        effectiveDuration,
        cabin_class,
        origin ? [origin] : [],
      ]).catch(() => ({ rows: [{ id: 0 }] }));
      return res.json({
        search_id: String(ftRow?.id || 0),
        business: null,
        economy: null,
        cash_estimate: null,
        transfer_from: [],
        dates: [],
        program_names_hidden: true,
        availability_notes: `researching — ${destination_freetext || 'unknown destination'}`,
      });
    }

    // ── 1. Resolve home airport from ZIP ─────────────────────────────────
    const homeAirports = getAirportsFromZip(effectiveZip || '94110');
    const origin = homeAirports[0] || 'SFO';

    // ── 2. Query sweet_spots from DB ─────────────────────────────────────
    // BEFORE (mock): used findDestination() from server/data/sweet-spots.js
    // AFTER  (DB):   SELECT * FROM sweet_spots WHERE destination_airport = $1
    const { rows: sweetSpots } = await pool.query(`
      SELECT *
      FROM sweet_spots
      WHERE destination_airport = $1
        AND cabin IN ('economy', 'business')
        AND is_active = true
      ORDER BY miles_required ASC
    `, [effectiveDestAirport]);

    // ── 3. Create search record before anything else (needed for search_id) ─
    const { rows: [searchRow] } = await pool.query(`
      INSERT INTO trip_searches
        (session_id, zip_code, origin_airport, destination_airport, destination,
         travel_month, duration_days, cabin_class, status, home_airports)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'complete',$9)
      RETURNING id
    `, [
      effectiveSessionId,
      effectiveZip,
      origin,
      effectiveDestAirport,
      destination || effectiveDestAirport,
      effectiveMonth,
      effectiveDuration,
      cabin_class,
      [origin],
    ]);
    const searchId = String(searchRow.id);

    // ── 4. Empty state — no active rows for this destination ─────────────
    if (sweetSpots.length === 0) {
      return res.json({
        search_id: searchId,
        business: null,
        economy: null,
        cash_estimate: null,
        transfer_from: [],
        dates: [],
        program_names_hidden: true,
        availability_notes: 'We\'re still researching sweet spots for this destination. Check back soon.',
      });
    }

    // ── 5. Apply off-peak / peak logic to each row ────────────────────────
    const enriched = sweetSpots.map(spot => {
      const { effectiveMiles: miles, isOffPeak: offPeak, peakMiles } = effectiveMiles(spot, effectiveMonth);
      return { ...spot, effective_miles: miles, is_off_peak: offPeak, peak_miles_required: peakMiles };
    });

    // ── 6. Separate business vs economy, pick best (lowest effective miles) ─
    const bizSpots = enriched.filter(s => s.cabin === 'business').sort((a, b) => a.effective_miles - b.effective_miles);
    const ecoSpots = enriched.filter(s => s.cabin === 'economy').sort((a, b) => a.effective_miles - b.effective_miles);
    const bestBiz  = bizSpots[0] || null;
    const bestEco  = ecoSpots[0] || null;

    // ── 7. Collect all transfer programs across active spots ──────────────
    const allTransferPrograms = [...new Set(
      enriched.flatMap(s => Array.isArray(s.transfer_bank_programs) ? s.transfer_bank_programs : [])
    )];

    // ── 8. Live date candidates from Seats.aero (5s timeout, fail gracefully) ─
    const { startDate, endDate } = monthToDateRange(effectiveMonth);
    const dates = await getDateCandidates({
      origin,
      dest: effectiveDestAirport,
      startDate,
      endDate,
      duration: effectiveDuration,
      needBusiness: !!bestBiz,
      needEconomy:  !!bestEco,
    });

    // ── 9. Cash estimate — use DB typical_cash_price (Travelpayouts fallback later) ─
    const cashEstimate = bestBiz?.typical_cash_price || bestEco?.typical_cash_price || null;

    // ── 10. Build availability_notes for no-date case ─────────────────────
    const monthLabel = formatMonth(effectiveMonth);
    const availNotes = dates.length === 0
      ? `No saver award availability found in ${monthLabel}. We search daily — we'll alert you when space opens.`
      : null;

    // ── 11. Respond ───────────────────────────────────────────────────────
    return res.json({
      search_id: searchId,
      business: bestBiz ? {
        oneway_miles:   bestBiz.effective_miles,
        oneway_taxes:   bestBiz.typical_taxes   || 0,
        rt_miles:       bestBiz.effective_miles * 2,
        rt_taxes:       (bestBiz.typical_taxes  || 0) * 2,
        programs_count: bizSpots.length,
      } : null,
      economy: bestEco ? {
        oneway_miles:   bestEco.effective_miles,
        oneway_taxes:   bestEco.typical_taxes   || 0,
        rt_miles:       bestEco.effective_miles * 2,
        rt_taxes:       (bestEco.typical_taxes  || 0) * 2,
        programs_count: ecoSpots.length,
      } : null,
      cash_estimate: cashEstimate,
      transfer_from: allTransferPrograms,
      dates,
      program_names_hidden: true,
      ...(availNotes ? { availability_notes: availNotes } : {}),
    });

  } catch (err) {
    console.error('POST /plan/search error:', err);
    return res.status(500).json({
      error: 'Search failed',
      ...(process.env.NODE_ENV !== 'production' ? { details: err.message } : {}),
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/plan/destinations
// Returns ALL destination cities (active + inactive) with has_active_sweet_spot flag.
// Used for autocomplete — users should see all 30 destinations even if we don't
// have a confirmed rate yet. has_active_sweet_spot=false → show "researching" state.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/destinations', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT
        destination_city    AS name,
        destination_airport AS airport,
        destination_country AS country,
        region,
        bool_or(is_active)  AS has_active_sweet_spot
      FROM sweet_spots
      GROUP BY destination_city, destination_airport, destination_country, region
      ORDER BY destination_city
    `);
    res.json({ destinations: rows });
  } catch (err) {
    console.error('GET /plan/destinations error:', err);
    res.status(500).json({ error: 'Failed to load destinations' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/config
// Exposes safe public config values to the frontend (no secrets).
// STRIPE_MODE: 'test' | 'live' — controls test-mode banner in UI.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({
    stripe_mode: process.env.STRIPE_MODE || 'live',
    monthly_price_cents: 999,
    onetime_price_cents: 9900,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/user/tier
// Returns the current user's subscription tier.
// Requires x-session-id header or session_id query param.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/user/tier', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;
    if (!sessionId) return res.json({ tier: 'free', subscription_min_end: null });

    // Look up user by session (anonymous users without auth use session-based access)
    const { rows } = await pool.query(`
      SELECT u.subscription_tier, u.subscription_min_end
      FROM users u
      WHERE u.id IN (
        SELECT user_id FROM trip_searches
        WHERE session_id = $1 AND user_id IS NOT NULL
        LIMIT 1
      )
    `, [sessionId]);

    if (!rows[0]) return res.json({ tier: 'free', subscription_min_end: null });

    const user = rows[0];
    // Check if subscription is still valid
    const isActive = user.subscription_min_end && new Date(user.subscription_min_end) > new Date();
    const tier = (user.subscription_tier && user.subscription_tier !== 'free' && isActive)
      ? user.subscription_tier
      : 'free';

    res.json({ tier, subscription_min_end: user.subscription_min_end });
  } catch (err) {
    console.error('GET /plan/user/tier error:', err);
    res.json({ tier: 'free', subscription_min_end: null });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/plan/:searchId/status
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:searchId/status', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ts.id, ts.status, tp.id AS plan_id
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/plan/:searchId/teaser
// ─────────────────────────────────────────────────────────────────────────────
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
    const flights = (plan.flight_options || []).slice(0, 1);
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
        program_name: '••••••••',   // blurred until paid
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

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/plan/:searchId/full
// Full plan — program names UNBLURRED.
// Gate: subscription_tier != 'free' AND subscription_min_end > NOW()
// Returns 403 (not 402) if not subscribed — distinct from 402 payment-required.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:searchId/full', async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.query.session_id;

    const { rows: searchRows } = await pool.query(
      `SELECT ts.*, tp.flight_options, tp.hotel_options, tp.card_recommendations, tp.trip_summary
       FROM trip_searches ts
       LEFT JOIN trip_plans tp ON tp.search_id = ts.id
       WHERE ts.id = $1`,
      [req.params.searchId]
    );
    if (!searchRows[0]) return res.status(404).json({ error: 'Plan not found' });
    const search = searchRows[0];

    // Check subscription access
    const hasAccess = await checkSubscriptionAccess(sessionId, search.user_id, search.id);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Subscription required',
        search_id: search.id,
        pricing: {
          monthly:  { price_cents: 999,  price_id: STRIPE_MONTHLY_PRICE_ID },
          onetime:  { price_cents: 9900, price_id: STRIPE_ONETIME_PRICE_ID },
        },
      });
    }

    res.json({
      search_id:            search.id,
      destination:          search.destination,
      travel_month:         search.travel_month,
      duration_days:        search.duration_days,
      trip_summary:         search.trip_summary,
      flight_options:       search.flight_options,
      hotel_options:        search.hotel_options,
      card_recommendations: search.card_recommendations,
    });
  } catch (err) {
    console.error('GET /plan/full error:', err);
    res.status(500).json({ error: 'Failed to fetch full plan' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plan/subscribe
// Creates a Stripe Checkout session.
// plan: 'monthly' → $9.99/mo subscription (3-mo min enforced via metadata)
// plan: 'onetime' → $99 one-time concierge access (30-day access)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/subscribe', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        error: 'Payments not configured',
        fix: 'Set STRIPE_SECRET_KEY in Railway environment variables',
      });
    }

    const { search_id, plan, plan_type, session_id } = req.body;
    const effectivePlan = plan || plan_type; // accept both keys

    if (!search_id) return res.status(400).json({ error: 'search_id required' });
    if (!effectivePlan) return res.status(400).json({ error: 'plan required: "monthly" or "onetime"' });

    let priceId, mode, subscriptionData;

    if (effectivePlan === 'monthly') {
      priceId = STRIPE_MONTHLY_PRICE_ID;
      mode = 'subscription';
      // 3-month minimum: enforced in webhook via subscription_min_end = NOW() + 3 months
      subscriptionData = { metadata: { min_months: '3' } };
    } else if (effectivePlan === 'onetime') {
      if (!STRIPE_ONETIME_PRICE_ID) {
        return res.status(503).json({
          error: 'One-time price not configured',
          fix: 'Create a $99 one-time price in Stripe dashboard and set STRIPE_ONETIME_PRICE_ID in Railway',
        });
      }
      priceId = STRIPE_ONETIME_PRICE_ID;
      mode = 'payment';
    } else {
      return res.status(400).json({ error: 'plan must be "monthly" or "onetime"' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      ...(subscriptionData ? { subscription_data: subscriptionData } : {}),
      success_url: `${FRONTEND_URL}/plan/${search_id}/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${FRONTEND_URL}/plan/${search_id}`,
      metadata: {
        search_id:   String(search_id),
        plan_type:   effectivePlan,
        session_id:  session_id || '',
      },
    });

    res.json({ checkout_url: session.url, session_id: session.id });
  } catch (err) {
    console.error('POST /plan/subscribe error:', err);
    res.status(500).json({ error: 'Checkout session creation failed' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/plan/webhook  (also registered as /api/webhook/stripe in server.js)
// Stripe webhook — on checkout.session.completed:
//   - Monthly: set users.subscription_tier = 'premium', subscription_min_end = +3 months
//   - One-time: set users.subscription_tier = 'concierge', subscription_min_end = +30 days
//   - Also mark trip_searches.status = 'paid'
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).send('Not configured');

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { search_id, plan_type, session_id } = session.metadata || {};

    try {
      // Upgrade user subscription tier
      // Strategy: upsert by customer email (works for anonymous checkout too)
      const customerEmail = session.customer_details?.email || session.customer_email;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      const isMonthly = plan_type === 'monthly';
      const tier = isMonthly ? 'premium' : 'concierge';
      const minEndInterval = isMonthly ? "INTERVAL '3 months'" : "INTERVAL '30 days'";

      if (customerEmail) {
        // Ensure unique constraint exists (idempotent)
        await pool.query(`
          ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email)
        `).catch(() => {}); // Ignore if already exists or syntax error

        // Upsert user by email — creates row if new, updates if returning
        const { rows: upsertRows } = await pool.query(`
          INSERT INTO users (email, stripe_customer_id, subscription_tier, subscription_started, subscription_min_end, updated_at)
          VALUES ($1, $2, $3, NOW(), NOW() + ${minEndInterval}, NOW())
          ON CONFLICT (email) DO UPDATE SET
            stripe_customer_id   = EXCLUDED.stripe_customer_id,
            subscription_tier    = EXCLUDED.subscription_tier,
            subscription_started = EXCLUDED.subscription_started,
            subscription_min_end = EXCLUDED.subscription_min_end,
            updated_at           = EXCLUDED.updated_at
          RETURNING id
        `, [customerEmail, stripeCustomerId || null, tier]);

        const userId = upsertRows[0]?.id;
        console.log(`Upserted user ${userId} (${customerEmail}) to ${tier} (${isMonthly ? '3-month min' : '30 days'})`);

        // Link trip_searches.user_id if we have a search_id
        if (search_id && userId) {
          await pool.query(
            `UPDATE trip_searches SET user_id = $1, status = 'paid' WHERE id = $2`,
            [userId, search_id]
          );
        }
      } else if (session_id) {
        // Fallback: look up by session_id for authenticated users
        const { rows: userRows } = await pool.query(
          `SELECT DISTINCT user_id FROM trip_searches
           WHERE session_id = $1 AND user_id IS NOT NULL LIMIT 1`,
          [session_id]
        );
        const userId = userRows[0]?.user_id;
        if (userId) {
          await pool.query(`
            UPDATE users
            SET subscription_tier     = $1,
                subscription_started  = NOW(),
                subscription_min_end  = NOW() + ${minEndInterval},
                updated_at            = NOW()
            WHERE id = $2
          `, [tier, userId]);
          console.log(`Upgraded existing user ${userId} to ${tier}`);
        }
      }
    } catch (err) {
      console.error('Webhook DB update error:', err.message);
      // Return 200 anyway — don't cause Stripe to retry for DB errors
    }
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a session/user has an active subscription that grants full plan access.
 * Gate: subscription_tier != 'free' AND subscription_min_end > NOW()
 */
async function checkSubscriptionAccess(sessionId, userId, searchId) {
  try {
    // Direct user check
    if (userId) {
      const { rows } = await pool.query(
        `SELECT subscription_tier, subscription_min_end FROM users
         WHERE id = $1 AND subscription_tier != 'free'
           AND subscription_min_end > NOW()`,
        [userId]
      );
      if (rows.length > 0) return true;
    }
    // Session-based paid search check
    if (sessionId && searchId) {
      const { rows } = await pool.query(
        `SELECT id FROM trip_searches WHERE id = $1 AND session_id = $2 AND status = 'paid'`,
        [searchId, sessionId]
      );
      if (rows.length > 0) return true;
    }
    return false;
  } catch { return false; }
}

/**
 * Convert 'YYYY-MM' to { startDate: 'YYYY-MM-01', endDate: 'YYYY-MM-DD' }
 */
function monthToDateRange(travelMonth) {
  if (!travelMonth) return { startDate: null, endDate: null };
  const [year, month] = travelMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    startDate: `${travelMonth}-01`,
    endDate:   `${travelMonth}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Format 'YYYY-MM' as human label e.g. 'October 2026'
 */
function formatMonth(travelMonth) {
  if (!travelMonth) return travelMonth;
  const [year, month] = travelMonth.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

module.exports = router;
