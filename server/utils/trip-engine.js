// server/utils/trip-engine.js
// Matching engine: user cards + points balances -> best award options

const { findDestination } = require('../data/sweet-spots');
const { getCardsForSource } = require('../data/transfer-partners');
const { queryAvailability } = require('./seats-aero');

// Static card recommendations for users with no/few cards
const CARD_RECOMMENDATIONS = {
  best_overall: {
    card_id: 'chase_sapphire_preferred',
    reason: 'Best all-around travel card — 60K bonus points worth ~$750, transfers to 14 airlines',
    bonus_points: 60000,
    annual_fee: 95,
    affiliate_url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
  },
  best_premium: {
    card_id: 'amex_platinum',
    reason: 'Highest bonus (80K MR points), lounge access, transfers to 19 airlines + hotels',
    bonus_points: 80000,
    annual_fee: 695,
    affiliate_url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/',
  },
  best_no_fee: {
    card_id: 'bilt_mastercard',
    reason: 'No annual fee, earn points on rent, transfers to United/American/Virgin',
    bonus_points: 0,
    annual_fee: 0,
    affiliate_url: 'https://www.biltrewards.com/card',
  },
};

/**
 * Main function: generate a complete trip plan
 * @param {Object} search - trip_searches row
 * @returns {Object} plan data to store in trip_plans
 */
async function generateTripPlan(search) {
  const {
    destination, destination_airports, home_airports,
    travel_month, duration_days, cabin_class, cards, transfer_partners, no_cards
  } = search;

  // 1. Get destination sweet spot data
  const destData = findDestination(destination);

  // 2. Build date range from travel_month
  const { startDate, endDate } = monthToDateRange(travel_month);

  // 3. Query Seats.aero for real availability
  const cabins = cabin_class === 'economy' ? ['Y'] : cabin_class === 'premium_economy' ? ['Y', 'W'] : ['J', 'F'];
  let liveAvailability = [];
  if (home_airports && destination_airports && home_airports.length && destination_airports.length) {
    liveAvailability = await queryAvailability({
      origins: home_airports.slice(0, 2), // cap to 2 origins
      destinations: destination_airports.slice(0, 2),
      cabins,
      startDate, endDate,
    });
  }

  // 4. Build flight options
  const flightOptions = buildFlightOptions(liveAvailability, destData, cards, transfer_partners);

  // 5. Build hotel options from sweet spots
  const hotelOptions = buildHotelOptions(destData, duration_days);

  // 6. Build card recommendations
  const cardRecommendations = buildCardRecs(flightOptions, hotelOptions, cards, no_cards);

  // 7. Build summary
  const tripSummary = buildSummary(search, destData, flightOptions, hotelOptions);

  return { flight_options: flightOptions, hotel_options: hotelOptions, card_recommendations: cardRecommendations, trip_summary: tripSummary };
}

function monthToDateRange(travelMonth) {
  if (!travelMonth) return { startDate: null, endDate: null };
  const [year, month] = travelMonth.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

function buildFlightOptions(liveAvailability, destData, cards, transferPartners) {
  const options = [];

  // Group live availability by source/program
  const bySource = {};
  for (const avail of liveAvailability) {
    const src = avail.Source;
    if (!bySource[src]) bySource[src] = [];
    bySource[src].push(avail);
  }

  // Add live options first
  for (const [source, rows] of Object.entries(bySource)) {
    const bestRow = rows.sort((a, b) => (a.JMileageCost || 999999) - (b.JMileageCost || 999999))[0];
    const userCards = cards ? getCardsForSource(source, cards) : { cards: [], total_points: 0 };
    const milesCost = bestRow.JMileageCost || bestRow.YMileageCost || bestRow.FMileageCost;
    if (!milesCost) continue;

    options.push({
      source,
      program_name: formatProgramName(source),
      miles_cost: milesCost,
      taxes_usd: Math.round((bestRow.TotalTaxes || 0) / 100),
      cabin: bestRow.JAvailable ? 'Business' : bestRow.FAvailable ? 'First' : 'Economy',
      seats_available: bestRow.JRemainingSeats || bestRow.FRemainingSeats || bestRow.YRemainingSeats || 1,
      best_date: bestRow.Date,
      is_direct: bestRow.Direct || false,
      user_cards: userCards.cards,
      user_points: userCards.total_points,
      can_book_now: userCards.total_points >= milesCost,
      points_gap: Math.max(0, milesCost - userCards.total_points),
      live: true,
      booking_steps: generateBookingSteps(source, milesCost, userCards),
    });
  }

  // Add sweet-spot options not in live results
  if (destData) {
    for (const spot of (destData.flight_sweet_spots || [])) {
      if (bySource[spot.program]) continue; // already have live data
      const userCards = cards ? getCardsForSource(spot.program, cards) : { cards: [], total_points: 0 };
      options.push({
        source: spot.program,
        program_name: formatProgramName(spot.program),
        miles_cost: spot.miles,
        taxes_usd: spot.taxes_usd,
        cabin: spot.cabin === 'J' ? 'Business' : spot.cabin === 'F' ? 'First' : 'Economy',
        seats_available: null,
        best_date: null,
        is_direct: false,
        user_cards: userCards.cards,
        user_points: userCards.total_points,
        can_book_now: userCards.total_points >= spot.miles,
        points_gap: Math.max(0, spot.miles - userCards.total_points),
        live: false,
        notes: spot.notes,
        booking_steps: generateBookingSteps(spot.program, spot.miles, userCards),
      });
    }
  }

  // Sort: can_book_now first, then by miles_cost
  return options.sort((a, b) => {
    if (a.can_book_now && !b.can_book_now) return -1;
    if (!a.can_book_now && b.can_book_now) return 1;
    return a.miles_cost - b.miles_cost;
  });
}

function buildHotelOptions(destData, durationDays) {
  if (!destData) return [];
  const nights = durationDays || 7;
  return (destData.hotel_sweet_spots || []).map(h => ({
    program: h.program,
    property: h.property,
    points_per_night: h.points,
    total_points: h.points * nights,
    cash_value_per_night: h.cash_value,
    total_cash_value: h.cash_value * nights,
    nights,
    source: h.source,
    category: h.category,
  }));
}

function buildCardRecs(flightOptions, hotelOptions, cards, noCards) {
  if (!noCards && cards && cards.length > 0) {
    // User has cards — find the gap card if needed
    const gapOptions = flightOptions.filter(f => !f.can_book_now && f.points_gap < 60000);
    if (gapOptions.length === 0) return [];
    return [{
      type: 'gap_fill',
      ...CARD_RECOMMENDATIONS.best_overall,
      reason: `You need ~${gapOptions[0].points_gap.toLocaleString()} more miles for ${gapOptions[0].program_name} Business. This card's signup bonus covers it.`,
    }];
  }
  // No cards
  return [
    { type: 'primary', ...CARD_RECOMMENDATIONS.best_overall },
    { type: 'premium', ...CARD_RECOMMENDATIONS.best_premium },
    { type: 'no_fee',  ...CARD_RECOMMENDATIONS.best_no_fee },
  ];
}

function buildSummary(search, destData, flightOptions, hotelOptions) {
  const best = flightOptions[0];
  const hotel = hotelOptions[0];
  return {
    destination: search.destination,
    emoji: destData ? destData.emoji : 'airplane',
    travel_month: search.travel_month,
    duration_days: search.duration_days,
    total_flight_miles: best ? best.miles_cost : null,
    total_hotel_points: hotel ? hotel.total_points : null,
    cash_value_saved: best ? (best.miles_cost * 0.018 + (hotel ? hotel.total_cash_value : 0)) : null,
    headline: best
      ? `Book ${destData ? destData.destination : search.destination} in ${best.cabin} Class for ${best.miles_cost.toLocaleString()} miles`
      : `Award travel to ${search.destination} — ${flightOptions.length} programs found`,
    can_book_now: flightOptions.some(f => f.can_book_now),
    best_program: best ? best.program_name : null,
  };
}

function generateBookingSteps(source, milesCost, userCards) {
  const steps = [];
  const programUrls = {
    aeroplan: 'https://www.aircanada.com/aeroplan/redeem/',
    united: 'https://www.united.com/en/us/book-flight/united-booking',
    american: 'https://www.aa.com/aadvantage/',
    delta: 'https://www.delta.com/us/en/skymiles/overview',
    virginatlantic: 'https://flywith.virginatlantic.com/gb/en/flying-club.html',
    flyingblue: 'https://www.flyingblue.com/en/',
    singapore: 'https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/',
    lifemiles: 'https://www.lifemiles.com/',
    turkish: 'https://www.turkishairlines.com/en-us/miles-and-smiles/',
    emirates: 'https://www.emirates.com/us/english/skywards/',
    etihad: 'https://www.etihad.com/en-us/etihad-guest/',
    alaska: 'https://www.alaskaair.com/account/overview',
    jetblue: 'https://trueblue.jetblue.com/',
    qantas: 'https://www.qantas.com/us/en/frequent-flyer.html',
    qatar: 'https://www.qatarairways.com/en-us/privilege-club.html',
    lufthansa: 'https://www.miles-and-more.com/us/en.html',
  };

  if (userCards.total_points >= milesCost) {
    steps.push({ step: 1, action: 'Transfer points', detail: `Go to your ${userCards.cards[0] || 'card'} app -> Transfer -> Select ${formatProgramName(source)}` });
    steps.push({ step: 2, action: 'Allow 1-3 days', detail: 'Points transfers usually post within minutes for Amex and Chase, up to 3 days for others' });
    steps.push({ step: 3, action: 'Search & book', detail: `Book directly at ${programUrls[source] || 'the airline\'s website'}`, url: programUrls[source] });
  } else {
    const gap = milesCost - userCards.total_points;
    steps.push({ step: 1, action: `You need ${gap.toLocaleString()} more miles`, detail: 'Get a signup bonus card — most cover this gap in first 3 months of spending' });
    steps.push({ step: 2, action: 'Meet minimum spend', detail: 'Usually $3K-$4K in first 3 months to earn the welcome bonus' });
    steps.push({ step: 3, action: 'Transfer & book', detail: `Once points post, transfer to ${formatProgramName(source)} and book`, url: programUrls[source] });
  }
  return steps;
}

function formatProgramName(source) {
  const names = {
    aeroplan: 'Air Canada Aeroplan', united: 'United MileagePlus', american: 'AAdvantage',
    delta: 'Delta SkyMiles', virginatlantic: 'Virgin Atlantic Flying Club',
    flyingblue: 'Air France/KLM Flying Blue', singapore: 'Singapore KrisFlyer',
    lifemiles: 'Avianca LifeMiles', turkish: 'Turkish Miles&Smiles',
    emirates: 'Emirates Skywards', etihad: 'Etihad Guest', alaska: 'Alaska Mileage Plan',
    jetblue: 'JetBlue TrueBlue', qantas: 'Qantas Frequent Flyer', qatar: 'Qatar Privilege Club',
    lufthansa: 'Lufthansa Miles & More', aeromexico: 'Aeromexico Club Premier',
    azul: 'Azul Tudo Azul', copa: 'Copa ConnectMiles', ethiopian: 'Ethiopian ShebaMiles',
    eurobonus: 'SAS EuroBonus', finnair: 'Finnair Plus', frontier: 'Frontier Miles',
    saudia: 'Saudi Airlines Alfursan', smiles: 'GOL Smiles', spirit: 'Spirit Free Spirit',
    velocity: 'Virgin Australia Velocity',
  };
  return names[source] || source;
}

module.exports = { generateTripPlan, formatProgramName };
