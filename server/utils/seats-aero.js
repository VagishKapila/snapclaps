// server/utils/seats-aero.js
// Seats.aero Partner API client with 6-hour PostgreSQL cache

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });

const SEATS_AERO_BASE = 'https://seats.aero/partnerapi';
const API_KEY = process.env.SEATS_AERO_API_KEY || 'pro_2rXgWT07GibIpsFWwzvqmniBFui';
const CACHE_HOURS = 6;

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

module.exports = { queryAvailability, getRoutes };
