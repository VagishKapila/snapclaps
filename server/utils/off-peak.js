// server/utils/off-peak.js
// Determines whether a given travel month is in an off-peak award window
// for a specific loyalty program and region.
//
// NOTE: Month-level granularity only. Dec is treated as fully off-peak for
// AAdvantage (real window is Nov 1 – Dec 14), which slightly over-discounts
// Dec 15–31. Flag for precise date-level logic before holiday season.

'use strict';

/**
 * Returns true if the travel month falls within an off-peak award window.
 *
 * @param {string} program      - e.g. 'AAdvantage', 'Iberia Plus'
 * @param {string} travelMonth  - 'YYYY-MM'
 * @param {string} region       - 'Europe' | 'Asia' | 'Latin America' | etc.
 * @returns {boolean}
 */
function isOffPeak(program, travelMonth, region) {
  if (!program || !travelMonth) return false;
  const month = parseInt(travelMonth.split('-')[1], 10);
  if (!month || isNaN(month)) return false;

  const prog = program.toLowerCase();

  // ── American AAdvantage ────────────────────────────────────────────────
  // US ↔ Europe: Nov 1–Dec 14, Jan 10–Mar 14
  // US ↔ Asia:   Jan 10–Mar 14 only
  if (prog.includes('aadvantage') || prog === 'american airlines' || prog === 'american') {
    if (region === 'Europe') {
      // Nov (11), Dec (12 — approximate), Jan (1), Feb (2), Mar (3)
      return [1, 2, 3, 11, 12].includes(month);
    }
    if (region === 'Asia') {
      return [1, 2, 3].includes(month);
    }
  }

  // ── Iberia Plus / Iberia Avios ─────────────────────────────────────────
  // Roughly Jan–Mar and Nov–Dec for transatlantic routes
  if (prog.includes('iberia')) {
    return [1, 2, 3, 11, 12].includes(month);
  }

  // All other programs (Aeroplan, Virgin Atlantic, Alaska, Turkish, Hyatt,
  // Hilton, IHG) use flat rates — no off-peak distinction.
  return false;
}

/**
 * Given sweet spot rows for a destination + month, returns the effective
 * miles_required accounting for off-peak/peak windows.
 *
 * @param {Object} spot         - sweet_spots DB row
 * @param {string} travelMonth  - 'YYYY-MM'
 * @returns {{ effectiveMiles: number, isOffPeak: boolean, peakMiles: number|null }}
 */
function effectiveMiles(spot, travelMonth) {
  const offPeak = isOffPeak(spot.program, travelMonth, spot.region);
  const peakMiles = spot.peak_miles_required || null;
  // If we're NOT in an off-peak window AND a peak rate exists, use peak
  const miles = (!offPeak && peakMiles) ? peakMiles : spot.miles_required;
  return { effectiveMiles: miles, isOffPeak: offPeak, peakMiles };
}

module.exports = { isOffPeak, effectiveMiles };
