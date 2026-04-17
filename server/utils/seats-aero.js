// server/utils/seats-aero.js
// Seats.aero Partner API client with 6-hour PostgreSQL cache

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

const SEATS_AERO_BASE = 'https://seats.aero/partnerapi';
const API_KEY = process.env.SEATS_AERO_API_KEY || 'pro_2rXgWT07GibIpsFWwzvqmniBFui';
const CACHE_HOURS = 6;
const SEATS_AERO_TIMEOUT_MS = 5000; // 5s max per search call

// ── mapSeatsAeroCabin ─────────────────────────────────────────────────────
// Seats.aero response cabin strings → our DB cabin enum.
// Seats.aero returns: 'economy' | 'premium' | 'business' | 'first'
// Our DB uses:        'economy' | 'premium_economy' | 'business' | 'first' | 'hotel'
//
// LOCATION: server/utils/seats-aero.js, exported as mapSeatsAeroCabin
function mapSeatsAeroCabin(seatsAeroCabin) {
  if (!seatsAeroCabin) return 'economy';
  if (seatsAeroCabin === 'premium') return 'premium_economy';
  return seatsAeroCabin; // 'economy', 'business', 'first' pass through unchanged
}

// ── dbCabinToSeatsAero ────────────────────────────────────────────────────
// Reverse map: DB cabin → Seats.aero API query letter code
// Used when building API request from a sweet_spots row cabin value
const DB_CABIN_TO_CODE = {
  economy: 'Y',
  premium_economy: 'W',
  business: 'J',
  first: 'F',
};
function dbCabinToCode(dbCabin) {
  return DB_CABIN_TO_CODE[dbCabin] || 'Y';
}

// cabin: Y=economy, W=premium economy, J=business, F=first
async function queryAvailability({ origins, destinations, cabins = ['J', 'F'], startDate, endDate }) {
  const results = [];
  for (const origin of origins) {
    for (const dest of destinations) {
      for (const cabin of cabins) {
        const cacheKey = `${origin}-${dest}-${cabin}-${startDate}-${endDate}`;
        const cached = await getCached(cacheKey);
        if (cached) { results.push(...cached); continue; }

        try {
          const url = `${SEATS_AERO_BASE}/availability?origin_airport=${origin}&destination_airport=${dest}&cabin=${cabin}${startDate ? '&start_date=' + startDate : ''}${endDate ? '&end_date=' + endDate : ''}`;
          const res = await fetch(url, {
            headers: { 'Partner-Authorization': API_KEY, 'Accept': 'application/json' },
          });
          if (!res.ok) { console.error(`seats.aero ${res.status} for ${cacheKey}`); continue; }
          const data = await res.json();
          const available = (data.data || []).filter(r => r.YAvailable || r.WAvailable || r.JAvailable || r.FAvailable);
          await setCached(cacheKey, available);
          results.push(...available);
        } catch (err) {
          console.error('seats.aero fetch error:', err.message);
        }
      }
    }
  }
  return results;
}

async function getCached(key) {
  try {
    const { rows } = await pool.query(
      `SELECT response_data FROM seats_aero_cache WHERE cache_key = $1 AND created_at > NOW() - INTERVAL '${CACHE_HOURS} hours'`,
      [key]
    );
    return rows[0] ? rows[0].response_data : null;
  } catch { return null; }
}

async function setCached(key, data) {
  try {
    await pool.query(
      `INSERT INTO seats_aero_cache (cache_key, response_data) VALUES ($1, $2)
       ON CONFLICT (cache_key) DO UPDATE SET response_data = $2, created_at = NOW()`,
      [key, JSON.stringify(data)]
    );
  } catch (err) { console.error('cache write error:', err.message); }
}

async function getRoutes() {
  try {
    const res = await fetch(`${SEATS_AERO_BASE}/routes`, {
      headers: { 'Partner-Authorization': API_KEY },
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

// ── getDateCandidates ─────────────────────────────────────────────────────
// Returns up to 3 { out, back, availability } date pairs from Seats.aero
// for a given origin → destination within a travel month.
// Pairs outbound + inbound legs. Times out in SEATS_AERO_TIMEOUT_MS.
//
// @param {string} origin      - IATA origin (e.g. 'SFO')
// @param {string} dest        - IATA destination (e.g. 'FCO')
// @param {string} startDate   - 'YYYY-MM-DD'
// @param {string} endDate     - 'YYYY-MM-DD'
// @param {number} duration    - trip length in days
// @param {boolean} needBusiness
// @param {boolean} needEconomy
// @returns {Array<{ out: string, back: string, availability: 'high'|'medium'|'low' }>}
async function getDateCandidates({ origin, dest, startDate, endDate, duration = 7, needBusiness = true, needEconomy = true }) {
  try {
    const cabins = [];
    if (needBusiness) cabins.push('J');
    if (needEconomy && !cabins.includes('Y')) cabins.push('Y');
    if (!cabins.length) return [];
    if (!startDate || !endDate) return [];

    // Fetch outbound and inbound in parallel with timeout
    const withTimeout = (promise) => Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), SEATS_AERO_TIMEOUT_MS)),
    ]);

    const [outbound, inbound] = await withTimeout(Promise.all([
      queryAvailability({ origins: [origin], destinations: [dest], cabins, startDate, endDate }),
      queryAvailability({ origins: [dest], destinations: [origin], cabins, startDate, endDate }),
    ])).catch(() => [[], []]);

    // Build set of available outbound dates
    const outDates = outbound
      .filter(r => r.JAvailable || r.YAvailable || r.FAvailable || r.WAvailable)
      .map(r => r.Date)
      .filter(Boolean)
      .sort();

    // Build set of available inbound dates
    const inDateSet = new Set(
      inbound
        .filter(r => r.JAvailable || r.YAvailable || r.FAvailable || r.WAvailable)
        .map(r => r.Date)
        .filter(Boolean)
    );

    // Try to find round-trip pairs (out + back at out+duration)
    const pairs = [];
    for (const out of outDates) {
      const back = addDays(out, duration);
      if (inDateSet.has(back)) {
        pairs.push({ out, back, availability: 'high' });
        if (pairs.length >= 3) break;
      }
    }

    // Fill remainder with outbound-only options marked 'limited'
    if (pairs.length < 3) {
      const usedOuts = new Set(pairs.map(p => p.out));
      for (const out of outDates) {
        if (usedOuts.has(out)) continue;
        pairs.push({ out, back: addDays(out, duration), availability: 'limited' });
        if (pairs.length >= 3) break;
      }
    }

    // If zero results: return empty (caller will set availability_notes)
    return pairs.slice(0, 3);
  } catch (err) {
    console.error('getDateCandidates error:', err.message);
    return [];
  }
}

// ── addDays ───────────────────────────────────────────────────────────────
function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

module.exports = { queryAvailability, getRoutes, mapSeatsAeroCabin, dbCabinToCode, getDateCandidates };
