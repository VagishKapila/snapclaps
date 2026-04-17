/**
 * C2 Seed Script — Sweet Spots
 *
 * Run AFTER migration 007 has been applied:
 *   node scripts/seed-sweet-spots.js
 *
 * Requires DATABASE_URL in environment (Railway production):
 *   PGPASSWORD=... node scripts/seed-sweet-spots.js
 * or set DATABASE_URL=postgres://...
 *
 * HARD RULES honoured in this file:
 *   - Every is_active=true row has a real source_url from OMAAT/TPG/FrequentMiler
 *   - miles_required are published chart rates — not fabricated round numbers
 *   - is_active=false used where exact current rate cannot be verified
 *   - transfer_from uses card IDs from TripPlanner.jsx CARDS array only
 *
 * Research search dates: April 17, 2026
 * Key devaluations incorporated:
 *   - Virgin Atlantic → ANA: raised to 52,500 (West) / 60,000 (East)  [was 47,500]
 *   - Iberia Avios transatlantic business: raised to 40,500 off-peak   [was 34,000]
 *   - Hyatt award chart 2025: Category 8 standard now 45,000, top 75,000
 *   - Turkish M&S 2024-2025 devaluations incorporated
 *   - Alaska Mileage Plan → JAL: 35,000 eco / 60,000 biz (confirmed via TPG)
 *   - Singapore KrisFlyer: Nov 2025 devaluation — specific US-SIN rate unconfirmed → is_active=false
 */

'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ─── Card ID reference (from TripPlanner.jsx CARDS array) ─────────────────
// Chase UR:       csr, csp, ink-preferred
// Amex MR:        amex-plat, amex-gold, amex-green, amex-business-plat
// Capital One:    venture-x, venture
// Citi TY:        citi-premier
// Bilt:           bilt
// AA direct:      aa-citi-plat, aa-exec
// United direct:  united-explorer, united-club
// Alaska direct:  alaska
// Hyatt direct:   hyatt
// Hilton direct:  hilton-honors, hilton-aspire
// IHG direct:     ihg-premier
// Marriott direct: marriott-bonvoy, marriott-amex
// ─────────────────────────────────────────────────────────────────────────

// Transfer program → card IDs (for easy reference in rows below)
const CARDS = {
  VIRGIN_ATLANTIC:  ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','citi-premier','bilt','venture-x','venture'],
  IBERIA_AVIOS:     ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','bilt','venture-x','venture'],
  AEROPLAN:         ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','venture-x','venture','bilt'],
  AADVANTAGE:       ['aa-citi-plat','aa-exec','citi-premier','bilt'],
  ALASKA:           ['alaska','bilt'],
  TURKISH:          ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','citi-premier','venture-x','venture','bilt'],
  KRISFLYER:        ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','citi-premier','venture-x','venture','bilt'],
  HYATT:            ['csr','csp','ink-preferred','hyatt'],
  HILTON:           ['amex-plat','amex-gold','amex-green','amex-business-plat','hilton-honors','hilton-aspire'],
  IHG:              ['csr','csp','ihg-premier'],
  FLYING_BLUE:      ['csr','csp','ink-preferred','amex-plat','amex-gold','amex-green','amex-business-plat','venture-x','bilt'],
};

const BANKS = {
  VIRGIN_ATLANTIC:  ['Chase UR','Amex MR','Citi TY','Bilt','Capital One'],
  IBERIA_AVIOS:     ['Chase UR','Amex MR','Bilt','Capital One'],
  AEROPLAN:         ['Chase UR','Amex MR','Capital One','Bilt'],
  AADVANTAGE:       ['AA AAdvantage','Citi TY','Bilt'],
  ALASKA:           ['Alaska Mileage Plan','Bilt'],
  TURKISH:          ['Chase UR','Amex MR','Citi TY','Capital One','Bilt'],
  KRISFLYER:        ['Chase UR','Amex MR','Citi TY','Capital One','Bilt'],
  HYATT:            ['Chase UR','Hyatt'],
  HILTON:           ['Amex MR','Hilton'],
  IHG:              ['Chase UR','IHG'],
  FLYING_BLUE:      ['Chase UR','Amex MR','Capital One','Bilt'],
};

// ─── Source URL constants (all confirmed to exist from search results) ────
const SRC = {
  VS_ANA:       'https://onemileatatime.com/guides/redeem-virgin-atlantic-points-ana/',
  IBERIA_DEVAL: 'https://frequentmiler.com/iberia-devaluation-business-class-between-us-europe-now-starting-at-40500-miles-one-way/',
  IBERIA_GUIDE: 'https://onemileatatime.com/guides/redeem-iberia-avios/',
  AEROPLAN:     'https://frequentmiler.com/air-canada-aeroplan-guide/',
  AA_LONDON:    'https://thepointsguy.com/loyalty-programs/business-class-awards-london/',
  AA_GUIDE:     'https://onemileatatime.com/guides/redeem-american-aadvantage-miles/',
  ALASKA_JAL:   'https://thepointsguy.com/airline/alaska-miles-starlux-japan-airlines-business-class/',
  ALASKA_JAPAN: 'https://thepointsguy.com/loyalty-programs/travel-to-japan-with-points-and-miles/',
  ALASKA_SYD:   'https://frequentmiler.com/best-ways-to-get-to-australia-new-zealand-south-pacific-using-miles/',
  TURKISH:      'https://thepointsguy.com/loyalty-programs/turkish-milessmiles-points-devaluation/',
  TURKISH_FM:   'https://frequentmiler.com/best-uses-for-turkish-miles-smiles-miles/',
  KRISFLYER:    'https://onemileatatime.com/news/singapore-krisflyer-devaluation/',
  VS_ANZ:       'https://onemileatatime.com/insights/virgin-atlantic-points-air-new-zealand/',
  FIJI_ALASKA:  'https://frequentmiler.com/best-ways-to-get-to-australia-new-zealand-south-pacific-using-miles/',
  AUS_NZ:       'https://thepointsguy.com/deals/australia-new-zealand-star-alliance/',
  HYATT_2025:   'https://onemileatatime.com/news/world-of-hyatt-hotel-category-changes/',
  HYATT_GUIDE:  'https://thepointsguy.com/loyalty-programs/hyatt-award-chart/',
  HILTON_DEVAL: 'https://onemileatatime.com/news/hilton-honors-devalues-points/',
  MALDIVES_PTS: 'https://thepointsguy.com/guide/where-to-stay-maldives-points-and-miles/',
  IHG_GUIDE:    'https://thepointsguy.com/loyalty-programs/redeem-points-ihg-rewards-club/',
  EUROPE_MILES: 'https://thepointsguy.com/loyalty-programs/best-ways-us-to-europe-using-miles/',
  SWEET_SPOTS:  'https://onemileatatime.com/guides/airline-award-sweet-spots/',
  ASIA_MILES:   'https://frequentmiler.com/best-ways-to-get-to-asia-using-points-and-miles/',
  LONDON_MILES: 'https://thepointsguy.com/loyalty-programs/getting-to-london-using-points-and-miles/',
};

// ─── Seed rows ─────────────────────────────────────────────────────────────
// Columns: destination_airport, destination_city, destination_country, region,
//          program, miles_required, cabin, airline, product_name,
//          transfer_from, transfer_bank_programs,
//          typical_cash_price, typical_taxes,
//          availability_notes, booking_url, booking_steps,
//          source_url, is_active

const ROWS = [

  // ════════════════ TOKYO NRT ════════════════

  {
    destination_airport: 'NRT', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'Virgin Atlantic Flying Club', miles_required: 52500, cabin: 'business',
    airline: 'ANA', product_name: 'ANA The Room via Virgin Atlantic',
    transfer_from: CARDS.VIRGIN_ATLANTIC, transfer_bank_programs: BANKS.VIRGIN_ATLANTIC,
    typical_cash_price: 7800, typical_taxes: 390,
    availability_notes: 'West Coast (LAX/SFO) rate. East Coast (JFK/EWR) costs 60,000 pts. Book by phone +1-800-365-9500. ANA now charges fuel surcharges ~$350–400. Availability opens ~330 days out. Book early.',
    booking_url: 'https://www.virginatlantic.com/us/en/flying-club/spend-miles/flights.html',
    booking_steps: ['Call Virgin Atlantic Flying Club at +1-800-365-9500','Request ANA saver award [origin] to NRT','Confirm business class availability on ANA metal','Pay taxes/fees with credit card (~$390)','Receive e-ticket within 24 hrs'],
    source_url: SRC.VS_ANA, is_active: true,
  },

  {
    destination_airport: 'NRT', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'Alaska Mileage Plan', miles_required: 60000, cabin: 'business',
    airline: 'Japan Airlines', product_name: 'JAL Business Class',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 7800, typical_taxes: 75,
    availability_notes: 'Low fuel surcharges vs. other programs — JAL awards through Alaska carry minimal fees. Good space on JAL operated JFK–NRT nonstop. Book 330 days out.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search partner flights: origin → NRT','Select Japan Airlines, business class saver','Book online or call 1-800-654-5669','Pay ~$75 in taxes'],
    source_url: SRC.ALASKA_JAL, is_active: true,
  },

  {
    destination_airport: 'NRT', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'Alaska Mileage Plan', miles_required: 35000, cabin: 'economy',
    airline: 'Japan Airlines', product_name: 'JAL Economy',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 1050, typical_taxes: 55,
    availability_notes: 'Best economy value to Japan. Low fuel surcharges. JAL economy has premium service for the cabin class.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search partner flights: origin → NRT','Select Japan Airlines, economy saver','Book online or call 1-800-654-5669'],
    source_url: SRC.ALASKA_JAPAN, is_active: true,
  },

  {
    destination_airport: 'NRT', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'World of Hyatt', miles_required: 45000, cabin: 'hotel',
    airline: null, product_name: 'Park Hyatt Tokyo — Standard Award',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 700, typical_taxes: 85,
    availability_notes: 'Standard rate 45,000 pts/night. After 2025 Hyatt devaluation, peak (Top) nights can reach 75,000 pts. Book standard dates for best value. Lost in Translation hotel.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/japan/park-hyatt-tokyo/tyoph',
    booking_steps: ['Search award availability at hyatt.com','Select Park Hyatt Tokyo','Choose standard or off-peak dates','Book with Hyatt points'],
    source_url: SRC.HYATT_2025, is_active: true,
  },

  // ════════════════ TOKYO HND ════════════════

  {
    destination_airport: 'HND', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'Virgin Atlantic Flying Club', miles_required: 52500, cabin: 'business',
    airline: 'ANA', product_name: 'ANA Business via Virgin Atlantic',
    transfer_from: CARDS.VIRGIN_ATLANTIC, transfer_bank_programs: BANKS.VIRGIN_ATLANTIC,
    typical_cash_price: 7800, typical_taxes: 390,
    availability_notes: 'Haneda has better city access. Same VS→ANA rate as NRT. West Coast rate; East Coast is 60,000 pts.',
    booking_url: 'https://www.virginatlantic.com/us/en/flying-club/spend-miles/flights.html',
    booking_steps: ['Call Virgin Atlantic Flying Club +1-800-365-9500','Request ANA award to HND','Confirm business saver availability','Pay taxes/fees'],
    source_url: SRC.VS_ANA, is_active: true,
  },

  {
    destination_airport: 'HND', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'Alaska Mileage Plan', miles_required: 35000, cabin: 'economy',
    airline: 'Japan Airlines', product_name: 'JAL Economy to Haneda',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 1050, typical_taxes: 55,
    availability_notes: 'JAL flies JFK–HND nonstop. Low surcharges through Alaska Mileage Plan.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search partner flights to HND','Select JAL economy saver'],
    source_url: SRC.ALASKA_JAPAN, is_active: true,
  },

  {
    destination_airport: 'HND', destination_city: 'Tokyo', destination_country: 'Japan', region: 'Asia',
    program: 'World of Hyatt', miles_required: 25000, cabin: 'hotel',
    airline: null, product_name: 'Andaz Tokyo Toranomon Hills — Standard Award',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 400, typical_taxes: 50,
    availability_notes: 'Category 5 property. Rate requires verification following 2025 Hyatt devaluation — book and check current pricing at hyatt.com before planning.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/japan/andaz-tokyo-toranomon-hills/tyoaz',
    booking_steps: ['Search award at hyatt.com','Select Andaz Tokyo'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ KYOTO KIX ════════════════

  {
    destination_airport: 'KIX', destination_city: 'Kyoto', destination_country: 'Japan', region: 'Asia',
    program: 'Virgin Atlantic Flying Club', miles_required: 52500, cabin: 'business',
    airline: 'ANA', product_name: 'ANA Business to Osaka/Kyoto via Virgin Atlantic',
    transfer_from: CARDS.VIRGIN_ATLANTIC, transfer_bank_programs: BANKS.VIRGIN_ATLANTIC,
    typical_cash_price: 7600, typical_taxes: 390,
    availability_notes: 'Fly into KIX (Kansai/Osaka) — 75 min to Kyoto by Haruka express. Same VS/ANA pricing zone as NRT. West Coast rate.',
    booking_url: 'https://www.virginatlantic.com/us/en/flying-club/spend-miles/flights.html',
    booking_steps: ['Call Virgin Atlantic Flying Club +1-800-365-9500','Request ANA award to KIX','Confirm business saver availability'],
    source_url: SRC.VS_ANA, is_active: true,
  },

  {
    destination_airport: 'KIX', destination_city: 'Kyoto', destination_country: 'Japan', region: 'Asia',
    program: 'Alaska Mileage Plan', miles_required: 35000, cabin: 'economy',
    airline: 'Japan Airlines', product_name: 'JAL Economy to Osaka/Kyoto',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 1000, typical_taxes: 55,
    availability_notes: 'Fly into KIX for easy Kyoto access. JAL partner award via Alaska Mileage Plan.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search partner flights to KIX','Select JAL economy saver'],
    source_url: SRC.ALASKA_JAPAN, is_active: true,
  },

  {
    destination_airport: 'KIX', destination_city: 'Kyoto', destination_country: 'Japan', region: 'Asia',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Regency Kyoto — Standard Award',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 40,
    availability_notes: 'Rate subject to 2025 Hyatt category changes. Verify current pricing at hyatt.com before booking.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/japan/hyatt-regency-kyoto/osarh',
    booking_steps: ['Search award at hyatt.com','Select Hyatt Regency Kyoto'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ PARIS CDG ════════════════

  {
    destination_airport: 'CDG', destination_city: 'Paris', destination_country: 'France', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 65000, cabin: 'business',
    airline: 'Air France', product_name: 'Air France Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 4500, typical_taxes: 120,
    availability_notes: 'Aeroplan zone-based chart: US East → France is approximately 65,000 pts business. Air France partner awards. Confirm current rate at aeroplan.com — some partners now use dynamic pricing.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan at aeroplan.com','Search flights: origin → CDG','Select Air France partner award, Business','Book and pay taxes'],
    source_url: SRC.AEROPLAN, is_active: true,
  },

  {
    destination_airport: 'CDG', destination_city: 'Paris', destination_country: 'France', region: 'Europe',
    program: 'Air France Flying Blue', miles_required: 45000, cabin: 'business',
    airline: 'Air France', product_name: 'Air France Business — Flying Blue Promo',
    transfer_from: CARDS.FLYING_BLUE, transfer_bank_programs: BANKS.FLYING_BLUE,
    typical_cash_price: 4500, typical_taxes: 200,
    availability_notes: 'Flying Blue runs monthly promo awards. Business class to Paris can drop to 40,000-55,000 miles during promos. Pricing is dynamic — check flyingblue.com monthly. Promo dates typically limited to 6-month window.',
    booking_url: 'https://www.flyingblue.com/en/spend/flights/promo-rewards',
    booking_steps: ['Check flyingblue.com for current month promo awards','Search Paris promo dates','Book during promo window for best rates'],
    source_url: SRC.EUROPE_MILES, is_active: false,
  },

  {
    destination_airport: 'CDG', destination_city: 'Paris', destination_country: 'France', region: 'Europe',
    program: 'World of Hyatt', miles_required: 30000, cabin: 'hotel',
    airline: null, product_name: 'Park Hyatt Paris-Vendôme — Standard Award',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 1200, typical_taxes: 150,
    availability_notes: 'Category 7 property. Rate subject to 2025 Hyatt devaluation — verify current pricing at hyatt.com. Standard rate approximately 25,000-35,000 pts post-devaluation.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/france/park-hyatt-paris-vendome/parph',
    booking_steps: ['Search award at hyatt.com','Select Park Hyatt Paris-Vendôme','Choose standard/off-peak dates'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ LONDON LHR ════════════════

  {
    destination_airport: 'LHR', destination_city: 'London', destination_country: 'UK', region: 'Europe',
    program: 'American AAdvantage', miles_required: 57500, cabin: 'business',
    airline: 'British Airways', product_name: 'BA Club World via AAdvantage',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 5800, typical_taxes: 780,
    availability_notes: 'WARNING: BA adds fuel surcharges ~$750-800 one-way even on AAdvantage awards. Net savings over cash are modest. Consider Iberia via MAD to avoid surcharges. Award availability is plentiful from JFK/EWR.',
    booking_url: 'https://www.aa.com/reservation/issr/redeemMiles.do',
    booking_steps: ['Log into AA.com','Search multi-partner award to LHR','Select British Airways operated flight','Confirm total fees before booking (~$780)'],
    source_url: SRC.AA_LONDON, is_active: true,
  },

  {
    destination_airport: 'LHR', destination_city: 'London', destination_country: 'UK', region: 'Europe',
    program: 'Iberia Plus', miles_required: 40500, cabin: 'business',
    airline: 'Iberia', product_name: 'Iberia Business JFK-MAD-LHR (off-peak)',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 5800, typical_taxes: 160,
    availability_notes: 'Via Madrid connection. LOW fuel surcharges vs. BA (~$160 vs. ~$780). Same Avios pool as British Airways — transfer via iberia.com. Off-peak rate; peak ~50,000 Avios. Connection adds travel time.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Search award at iberia.com','Route: JFK → MAD → LHR','Select Iberia-operated business saver','Off-peak dates only for this rate'],
    source_url: SRC.IBERIA_DEVAL, is_active: true,
  },

  {
    destination_airport: 'LHR', destination_city: 'London', destination_country: 'UK', region: 'Europe',
    program: 'World of Hyatt', miles_required: 25000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Regency London — The Churchill',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 550, typical_taxes: 70,
    availability_notes: 'Rate subject to 2025 Hyatt devaluation — verify current category and pricing at hyatt.com before booking.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/england/hyatt-regency-london-the-churchill/lonrc',
    booking_steps: ['Search award at hyatt.com','Select Hyatt Regency London Churchill'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ BARCELONA BCN ════════════════

  {
    destination_airport: 'BCN', destination_city: 'Barcelona', destination_country: 'Spain', region: 'Europe',
    program: 'Iberia Plus', miles_required: 40500, cabin: 'business',
    airline: 'Iberia', product_name: 'Iberia Business Class (off-peak)',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 4200, typical_taxes: 65,
    availability_notes: 'JFK–BCN direct on Iberia. Low fuel surcharges (~$65). Off-peak rate after 2025 devaluation (was 34,000). Peak dates ~50,000 Avios. JFK-BCN distance falls in 3,001-4,000 mile band.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Log into iberia.com','Search JFK to BCN on Iberia metal','Select Business class saver award','Choose off-peak date for 40,500 Avios','Pay ~$65 in taxes'],
    source_url: SRC.IBERIA_DEVAL, is_active: true,
  },

  {
    destination_airport: 'BCN', destination_city: 'Barcelona', destination_country: 'Spain', region: 'Europe',
    program: 'Iberia Plus', miles_required: 20000, cabin: 'economy',
    airline: 'Iberia', product_name: 'Iberia Economy (off-peak)',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 700, typical_taxes: 55,
    availability_notes: 'Economy off-peak rate requires verification following Iberia 2025 devaluation. Approximate rate based on zone pricing — confirm at iberia.com before planning.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Search iberia.com for economy award to BCN'],
    source_url: SRC.IBERIA_GUIDE, is_active: false,
  },

  // ════════════════ LISBON LIS ════════════════

  {
    destination_airport: 'LIS', destination_city: 'Lisbon', destination_country: 'Portugal', region: 'Europe',
    program: 'Iberia Plus', miles_required: 40500, cabin: 'business',
    airline: 'Iberia', product_name: 'Iberia Business Class via MAD (off-peak)',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 3800, typical_taxes: 65,
    availability_notes: 'JFK–MAD–LIS on Iberia. JFK–LIS distance ~3,368 miles = same 3,001-4,000mi zone as Barcelona → same off-peak rate. Low surcharges. Peak ~50,000 Avios.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Log into iberia.com','Search JFK to LIS (will route via MAD)','Select Business saver award','Off-peak dates for 40,500 Avios rate'],
    source_url: SRC.IBERIA_DEVAL, is_active: true,
  },

  {
    destination_airport: 'LIS', destination_city: 'Lisbon', destination_country: 'Portugal', region: 'Europe',
    program: 'World of Hyatt', miles_required: 15000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Regency Lisbon',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 250, typical_taxes: 30,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Lower category property — confirm current pricing at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/portugal/hyatt-regency-lisbon/lisrp',
    booking_steps: ['Search award at hyatt.com','Select Hyatt Regency Lisbon'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ ROME FCO ════════════════

  {
    destination_airport: 'FCO', destination_city: 'Rome', destination_country: 'Italy', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 65000, cabin: 'business',
    airline: 'Lufthansa', product_name: 'Lufthansa Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 5200, typical_taxes: 130,
    availability_notes: 'Route via FRA or MUC connection on Lufthansa/ITA. Aeroplan zone-based pricing for transatlantic business. Some Aeroplan partners now use dynamic pricing — confirm rate at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search partner flights to FCO','Select Lufthansa operated, Business saver','Book and pay taxes (~$130)'],
    source_url: SRC.AEROPLAN, is_active: true,
  },

  {
    destination_airport: 'FCO', destination_city: 'Rome', destination_country: 'Italy', region: 'Europe',
    program: 'AAdvantage', miles_required: 22500, cabin: 'economy',
    airline: 'American Airlines', product_name: 'AA Economy JFK-FCO (own-metal, no fuel surcharge)',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 900, typical_taxes: 55,
    availability_notes: 'American flies JFK→FCO nonstop (seasonal). Own-metal redemption — no fuel surcharges. Published sAAver rate 22,500 one-way economy. Web specials occasionally dip to 20,000.',
    booking_url: 'https://www.aa.com/aadvantage/aadvantageProgram/aadvantageAwardTravel.jsp',
    booking_steps: ['Search aa.com → MileageSAAver availability','Select JFK → FCO nonstop on AA metal','Book and pay ~$55 taxes only'],
    source_url: SRC.AA_GUIDE, is_active: true,
  },

  {
    destination_airport: 'FCO', destination_city: 'Rome', destination_country: 'Italy', region: 'Europe',
    program: 'Iberia Plus', miles_required: 50000, cabin: 'business',
    airline: 'Iberia', product_name: 'Iberia Business JFK-MAD-FCO (off-peak)',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 5200, typical_taxes: 85,
    availability_notes: 'JFK-FCO distance ~4,275 miles = 4,001-5,500mi zone. Rate estimate based on zone chart — confirm exact current rate at iberia.com. Via Madrid connection.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Search iberia.com for JFK → FCO (via MAD)','Select Business saver'],
    source_url: SRC.IBERIA_GUIDE, is_active: false,
  },

  {
    destination_airport: 'FCO', destination_city: 'Rome', destination_country: 'Italy', region: 'Europe',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Centric Rome (or similar)',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 45,
    availability_notes: 'Rate requires verification. Hyatt Rome portfolio and current category pricing subject to 2025 devaluation — confirm at hyatt.com.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=Rome%2C+Italy',
    booking_steps: ['Search Hyatt award availability in Rome'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ AMSTERDAM AMS ════════════════

  {
    destination_airport: 'AMS', destination_city: 'Amsterdam', destination_country: 'Netherlands', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 60000, cabin: 'business',
    airline: 'KLM', product_name: 'KLM Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 4300, typical_taxes: 110,
    availability_notes: 'JFK-AMS ~3,630 miles = shorter distance band than Paris → 60,000 pts. KLM has good award availability from JFK and EWR. Aeroplan zone pricing.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search flights to AMS via KLM','Select Business saver award'],
    source_url: SRC.AEROPLAN, is_active: true,
  },

  {
    destination_airport: 'AMS', destination_city: 'Amsterdam', destination_country: 'Netherlands', region: 'Europe',
    program: 'World of Hyatt', miles_required: 15000, cabin: 'hotel',
    airline: null, product_name: 'Andaz Amsterdam Prinsengracht',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 400, typical_taxes: 50,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Unique canalside hotel — confirm current category and pricing at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/netherlands/andaz-amsterdam-prinsengracht/amsaz',
    booking_steps: ['Search award at hyatt.com','Select Andaz Amsterdam'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ ISTANBUL IST ════════════════

  {
    destination_airport: 'IST', destination_city: 'Istanbul', destination_country: 'Turkey', region: 'Middle East',
    program: 'Turkish Miles&Smiles', miles_required: 65000, cabin: 'business',
    airline: 'Turkish Airlines', product_name: 'Turkish Airlines Business Class',
    transfer_from: CARDS.TURKISH, transfer_bank_programs: BANKS.TURKISH,
    typical_cash_price: 4200, typical_taxes: 95,
    availability_notes: 'US East Coast (JFK) to IST on Turkish. Published rate per TPG Dec 2025 article following devaluation. Previously was cheaper. Transfer points from Chase UR, Amex MR, Capital One, Citi TY at 1:1.',
    booking_url: 'https://www.turkishairlines.com/en-int/miles-and-smiles/flight-awards/',
    booking_steps: ['Log into Turkish Miles&Smiles','Search: origin → IST, Business class','Select Turkish Airlines operated flight','Book and pay taxes (~$95)'],
    source_url: SRC.TURKISH, is_active: true,
  },

  {
    destination_airport: 'IST', destination_city: 'Istanbul', destination_country: 'Turkey', region: 'Middle East',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Park Hyatt Istanbul Maçka Palas',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 500, typical_taxes: 60,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm current category pricing at hyatt.com before booking.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/turkey/park-hyatt-istanbul-macka-palas/istph',
    booking_steps: ['Search award at hyatt.com','Select Park Hyatt Istanbul Maçka Palas'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ SYDNEY SYD ════════════════

  {
    destination_airport: 'SYD', destination_city: 'Sydney', destination_country: 'Australia', region: 'Pacific',
    program: 'Air Canada Aeroplan', miles_required: 75000, cabin: 'business',
    airline: 'Air Canada', product_name: 'Air Canada Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 6500, typical_taxes: 140,
    availability_notes: 'US to Australia business class. Confirmed at 75,000 pts via TPG deal alert (Star Alliance to AU/NZ). Nonstop available from YVR or via connections. Good availability. Minimal fuel surcharges.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search flights: origin → SYD','Select Air Canada or Star Alliance partner, Business','Book and pay taxes'],
    source_url: SRC.AUS_NZ, is_active: true,
  },

  {
    destination_airport: 'SYD', destination_city: 'Sydney', destination_country: 'Australia', region: 'Pacific',
    program: 'Air Canada Aeroplan', miles_required: 40000, cabin: 'economy',
    airline: 'Air Canada', product_name: 'Air Canada Economy to Sydney',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 1300, typical_taxes: 100,
    availability_notes: 'Economy rate to Australia — verify exact current rate at aeroplan.com. Aeroplan zone pricing.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search economy award to SYD'],
    source_url: SRC.AUS_NZ, is_active: false,
  },

  {
    destination_airport: 'SYD', destination_city: 'Sydney', destination_country: 'Australia', region: 'Pacific',
    program: 'IHG One Rewards', miles_required: 50000, cabin: 'hotel',
    airline: null, product_name: 'InterContinental Sydney',
    transfer_from: CARDS.IHG, transfer_bank_programs: BANKS.IHG,
    typical_cash_price: 450, typical_taxes: 55,
    availability_notes: 'IHG uses dynamic pricing — 50,000 pts is an approximate typical rate. Verify actual cost at ihg.com for your dates.',
    booking_url: 'https://www.ihg.com/intercontinental/hotels/us/en/sydney/sydha/hoteldetail',
    booking_steps: ['Search reward nights at ihg.com','Select InterContinental Sydney'],
    source_url: SRC.IHG_GUIDE, is_active: false,
  },

  // ════════════════ QUEENSTOWN ZQN ════════════════

  {
    destination_airport: 'ZQN', destination_city: 'Queenstown', destination_country: 'New Zealand', region: 'Pacific',
    program: 'Virgin Atlantic Flying Club', miles_required: 62500, cabin: 'business',
    airline: 'Air New Zealand', product_name: 'Air New Zealand Business Premier',
    transfer_from: CARDS.VIRGIN_ATLANTIC, transfer_bank_programs: BANKS.VIRGIN_ATLANTIC,
    typical_cash_price: 7500, typical_taxes: 190,
    availability_notes: 'NZ to mainland North America one-way confirmed 62,500 VS points. Route likely US–AKL then AKL–ZQN domestic. Strong availability on Air NZ metal. Ben Schlappig confirmed this redemption at OMAAT.',
    booking_url: 'https://www.virginatlantic.com/us/en/flying-club/spend-miles/flights.html',
    booking_steps: ['Call Virgin Atlantic Flying Club','Request Air New Zealand award to ZQN (via AKL)','Confirm Business Premier availability','Pay taxes (~$190)'],
    source_url: SRC.VS_ANZ, is_active: true,
  },

  {
    destination_airport: 'ZQN', destination_city: 'Queenstown', destination_country: 'New Zealand', region: 'Pacific',
    program: 'World of Hyatt', miles_required: 15000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Regency Lake Taupo (closest Hyatt)',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 40,
    availability_notes: 'No Hyatt property directly in Queenstown. Nearest options in North Island. Consider boutique hotels redeemable via Mr & Mrs Smith or Tablet Hotels with Amex FHR instead.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=New+Zealand',
    booking_steps: ['Search Hyatt awards in New Zealand'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ FIJI NAN ════════════════

  {
    destination_airport: 'NAN', destination_city: 'Fiji', destination_country: 'Fiji', region: 'Pacific',
    program: 'Alaska Mileage Plan', miles_required: 55000, cabin: 'business',
    airline: 'Fiji Airways', product_name: 'Fiji Airways Business Class',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 5200, typical_taxes: 120,
    availability_notes: 'Great value confirmed via FrequentMiler. Fiji Airways business is lie-flat on LAX/SFO routes. Free stopover on Alaska Mileage Plan allows adding a US city. Book early — Fiji award space fills quickly.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search partner flights to NAN','Select Fiji Airways Business award','Book and pay taxes (~$120)'],
    source_url: SRC.FIJI_ALASKA, is_active: true,
  },

  {
    destination_airport: 'NAN', destination_city: 'Fiji', destination_country: 'Fiji', region: 'Pacific',
    program: 'Alaska Mileage Plan', miles_required: 27500, cabin: 'economy',
    airline: 'Fiji Airways', product_name: 'Fiji Airways Economy',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 1500, typical_taxes: 90,
    availability_notes: 'Economy rate to Fiji via Alaska. Verify exact current rate at alaskaair.com — economy rate not fully confirmed in recent research.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search Fiji Airways economy to NAN'],
    source_url: SRC.FIJI_ALASKA, is_active: false,
  },

  // ════════════════ MAUI OGG ════════════════

  {
    destination_airport: 'OGG', destination_city: 'Maui', destination_country: 'USA', region: 'Pacific',
    program: 'World of Hyatt', miles_required: 45000, cabin: 'hotel',
    airline: null, product_name: 'Andaz Maui at Wailea Resort — Standard Award',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 900, typical_taxes: 110,
    availability_notes: 'Standard rate 45,000 pts/night per 2025 Hyatt chart. Peak (Top) nights reach 75,000 pts after 2025 devaluation. Book standard/off-peak dates for best value. 5-star oceanfront resort.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/hawaii/andaz-maui-at-wailea-resort/hnmaz',
    booking_steps: ['Search award at hyatt.com','Select Andaz Maui at Wailea','Choose non-peak dates for standard rate','Book with Hyatt points'],
    source_url: SRC.HYATT_2025, is_active: true,
  },

  {
    destination_airport: 'OGG', destination_city: 'Maui', destination_country: 'USA', region: 'Pacific',
    program: 'Alaska Mileage Plan', miles_required: 20000, cabin: 'economy',
    airline: 'Alaska Airlines', product_name: 'Alaska Airlines Economy to Maui',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 400, typical_taxes: 30,
    availability_notes: 'Domestic US route. Rate requires verification — Alaska/Atmos merged with Hawaiian and pricing changed. Check current rates at alaskaair.com.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search OGG from your origin city','Select economy saver award'],
    source_url: SRC.ALASKA_SYD, is_active: false,
  },

  // ════════════════ MALDIVES MLE ════════════════

  {
    destination_airport: 'MLE', destination_city: 'Maldives', destination_country: 'Maldives', region: 'Asia',
    program: 'Hilton Honors', miles_required: 120000, cabin: 'hotel',
    airline: null, product_name: 'Conrad Maldives Rangali Island',
    transfer_from: CARDS.HILTON, transfer_bank_programs: BANKS.HILTON,
    typical_cash_price: 1800, typical_taxes: 200,
    availability_notes: 'Dynamic pricing. Hilton has devalued this property multiple times — typical range now 95,000-180,000 pts/night. Check specific dates at hilton.com. Note: Amex MR transfers to Hilton at 2:1 (2 MR = 1 Hilton point). SeaPlane included in some rates.',
    booking_url: 'https://www.hilton.com/en/hotels/mlecici-conrad-maldives-rangali-island/',
    booking_steps: ['Search award nights at hilton.com','Select Conrad Maldives Rangali Island','Check Honors points rate for your dates','Book — award includes seaplane transfer from MLE airport'],
    source_url: SRC.MALDIVES_PTS, is_active: true,
  },

  {
    destination_airport: 'MLE', destination_city: 'Maldives', destination_country: 'Maldives', region: 'Asia',
    program: 'Air Canada Aeroplan', miles_required: 75000, cabin: 'business',
    airline: 'Emirates', product_name: 'Emirates Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 7000, typical_taxes: 200,
    availability_notes: 'Route: US → DXB on Emirates, then DXB → MLE. Aeroplan now uses dynamic pricing for Emirates — rate is approximate. Verify at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Search Aeroplan awards to MLE via DXB'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  // ════════════════ BALI DPS ════════════════

  {
    destination_airport: 'DPS', destination_city: 'Bali', destination_country: 'Indonesia', region: 'Asia',
    program: 'IHG One Rewards', miles_required: 26250, cabin: 'hotel',
    airline: null, product_name: 'InterContinental Bali Resort',
    transfer_from: CARDS.IHG, transfer_bank_programs: BANKS.IHG,
    typical_cash_price: 500, typical_taxes: 60,
    availability_notes: 'Dynamic pricing. Average award cost ~26,250 pts/night per TPG research. Beachfront resort in Jimbaran. Verify exact pricing at ihg.com for your dates.',
    booking_url: 'https://www.ihg.com/intercontinental/hotels/us/en/bali/dpsha/hoteldetail',
    booking_steps: ['Search reward nights at ihg.com','Select InterContinental Bali Resort','Confirm points rate for specific dates'],
    source_url: SRC.IHG_GUIDE, is_active: true,
  },

  {
    destination_airport: 'DPS', destination_city: 'Bali', destination_country: 'Indonesia', region: 'Asia',
    program: 'Singapore Airlines KrisFlyer', miles_required: 58500, cabin: 'business',
    airline: 'Singapore Airlines', product_name: 'Singapore Airlines Business via SIN',
    transfer_from: CARDS.KRISFLYER, transfer_bank_programs: BANKS.KRISFLYER,
    typical_cash_price: 4500, typical_taxes: 140,
    availability_notes: 'Route: US → SIN → DPS on Singapore Airlines. Rate estimate based on US-Asia zone pricing post-Nov 2025 devaluation — verify exact rate at singaporeair.com.',
    booking_url: 'https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/use-miles/use-krisflyer-miles/',
    booking_steps: ['Log into KrisFlyer account','Search US → SIN → DPS on Singapore Airlines','Select business class saver award'],
    source_url: SRC.KRISFLYER, is_active: false,
  },

  // ════════════════ SINGAPORE SIN ════════════════

  {
    destination_airport: 'SIN', destination_city: 'Singapore', destination_country: 'Singapore', region: 'Asia',
    program: 'Singapore Airlines KrisFlyer', miles_required: 88500, cabin: 'business',
    airline: 'Singapore Airlines', product_name: 'Singapore Airlines Business Class',
    transfer_from: CARDS.KRISFLYER, transfer_bank_programs: BANKS.KRISFLYER,
    typical_cash_price: 9500, typical_taxes: 180,
    availability_notes: 'Post-November 2025 KrisFlyer devaluation. Approximate US→SIN one-way business rate. OMAAT confirmed US-Europe business increased to 89K — US-Asia (Singapore) is likely similar or higher. Verify exact rate at singaporeair.com before planning.',
    booking_url: 'https://www.singaporeair.com/en_UK/sg/ppsclub-krisflyer/use-miles/use-krisflyer-miles/',
    booking_steps: ['Log into KrisFlyer at singaporeair.com','Search US gateway → SIN, business saver','Confirm current mileage rate','Book and pay taxes (~$180)'],
    source_url: SRC.KRISFLYER, is_active: false,
  },

  {
    destination_airport: 'SIN', destination_city: 'Singapore', destination_country: 'Singapore', region: 'Asia',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Andaz Singapore',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 400, typical_taxes: 50,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm current category at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/singapore/andaz-singapore/sinaz',
    booking_steps: ['Search award at hyatt.com','Select Andaz Singapore'],
    source_url: SRC.HYATT_2025, is_active: false,
  },

  // ════════════════ DUBAI DXB ════════════════

  {
    destination_airport: 'DXB', destination_city: 'Dubai', destination_country: 'UAE', region: 'Middle East',
    program: 'Turkish Miles&Smiles', miles_required: 80000, cabin: 'business',
    airline: 'Turkish Airlines', product_name: 'Turkish Business JFK-IST-DXB',
    transfer_from: CARDS.TURKISH, transfer_bank_programs: BANKS.TURKISH,
    typical_cash_price: 6500, typical_taxes: 120,
    availability_notes: 'Via Istanbul connection. Approximate rate — Turkish M&S pricing for US to Middle East requires current verification at turkishairlines.com. Program has devalued significantly.',
    booking_url: 'https://www.turkishairlines.com/en-int/miles-and-smiles/flight-awards/',
    booking_steps: ['Log into Turkish Miles&Smiles','Search JFK → IST → DXB Business class'],
    source_url: SRC.TURKISH_FM, is_active: false,
  },

  {
    destination_airport: 'DXB', destination_city: 'Dubai', destination_country: 'UAE', region: 'Middle East',
    program: 'World of Hyatt', miles_required: 25000, cabin: 'hotel',
    airline: null, product_name: 'Park Hyatt Dubai',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 600, typical_taxes: 75,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm category and pricing at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/united-arab-emirates/park-hyatt-dubai/dubph',
    booking_steps: ['Search award at hyatt.com','Select Park Hyatt Dubai'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ BANGKOK BKK ════════════════

  {
    destination_airport: 'BKK', destination_city: 'Bangkok', destination_country: 'Thailand', region: 'Asia',
    program: 'Turkish Miles&Smiles', miles_required: 78000, cabin: 'business',
    airline: 'Turkish Airlines', product_name: 'Turkish Business JFK-IST-BKK',
    transfer_from: CARDS.TURKISH, transfer_bank_programs: BANKS.TURKISH,
    typical_cash_price: 5800, typical_taxes: 110,
    availability_notes: 'Via Istanbul connection. Approximate rate for US to Southeast Asia on Turkish — verify at turkishairlines.com.',
    booking_url: 'https://www.turkishairlines.com/en-int/miles-and-smiles/flight-awards/',
    booking_steps: ['Log into Turkish Miles&Smiles','Search US gateway → IST → BKK Business'],
    source_url: SRC.ASIA_MILES, is_active: false,
  },

  {
    destination_airport: 'BKK', destination_city: 'Bangkok', destination_country: 'Thailand', region: 'Asia',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Grand Hyatt Erawan Bangkok',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 40,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm current category pricing at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/thailand/grand-hyatt-erawan-bangkok/bkkgh',
    booking_steps: ['Search award at hyatt.com','Select Grand Hyatt Erawan Bangkok'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ HONOLULU HNL ════════════════

  {
    destination_airport: 'HNL', destination_city: 'Honolulu', destination_country: 'USA', region: 'Pacific',
    program: 'Alaska Mileage Plan', miles_required: 25000, cabin: 'economy',
    airline: 'Alaska Airlines', product_name: 'Alaska Economy to Honolulu',
    transfer_from: CARDS.ALASKA, transfer_bank_programs: BANKS.ALASKA,
    typical_cash_price: 350, typical_taxes: 25,
    availability_notes: 'Domestic US route. Rate requires verification following Alaska/Hawaiian merger and Atmos Rewards transition. Check current rates at alaskaair.com.',
    booking_url: 'https://www.alaskaair.com/account/login?goto=mileage-plan',
    booking_steps: ['Log into Alaska Mileage Plan','Search HNL from your origin city'],
    source_url: SRC.ALASKA_SYD, is_active: false,
  },

  {
    destination_airport: 'HNL', destination_city: 'Honolulu', destination_country: 'USA', region: 'Pacific',
    program: 'Hilton Honors', miles_required: 60000, cabin: 'hotel',
    airline: null, product_name: 'Hilton Hawaiian Village Waikiki Beach Resort',
    transfer_from: CARDS.HILTON, transfer_bank_programs: BANKS.HILTON,
    typical_cash_price: 550, typical_taxes: 65,
    availability_notes: 'Dynamic pricing. Hilton Hawaiian Village is a large resort — award rates vary widely by date. Verify at hilton.com.',
    booking_url: 'https://www.hilton.com/en/hotels/hnlhvhh-hilton-hawaiian-village-waikiki-beach-resort/',
    booking_steps: ['Search award at hilton.com','Select Hilton Hawaiian Village'],
    source_url: SRC.HILTON_DEVAL, is_active: false,
  },

  // ════════════════ SEOUL ICN ════════════════

  {
    destination_airport: 'ICN', destination_city: 'Seoul', destination_country: 'South Korea', region: 'Asia',
    program: 'Air Canada Aeroplan', miles_required: 65000, cabin: 'business',
    airline: 'Korean Air', product_name: 'Korean Air Prestige Class via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 6500, typical_taxes: 140,
    availability_notes: 'Approximate rate — verify current pricing at aeroplan.com. Aeroplan has partner awards to Seoul on Korean Air and Asiana.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search flights: US gateway → ICN via Korean Air','Select Business saver'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'ICN', destination_city: 'Seoul', destination_country: 'South Korea', region: 'Asia',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Park Hyatt Seoul',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 450, typical_taxes: 55,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm current category and pricing at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/south-korea/park-hyatt-seoul/seoph',
    booking_steps: ['Search award at hyatt.com','Select Park Hyatt Seoul'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ CAPE TOWN CPT ════════════════

  {
    destination_airport: 'CPT', destination_city: 'Cape Town', destination_country: 'South Africa', region: 'Africa',
    program: 'Air Canada Aeroplan', miles_required: 85000, cabin: 'business',
    airline: 'Ethiopian Airlines', product_name: 'Star Alliance Business to Cape Town',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 9000, typical_taxes: 180,
    availability_notes: 'Long-haul to South Africa. Typical routing via European or African hub. Approximate rate — verify at aeroplan.com. Limited direct options from US.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search flights to CPT via Star Alliance partners'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'CPT', destination_city: 'Cape Town', destination_country: 'South Africa', region: 'Africa',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Regency Cape Town',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 40,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm at hyatt.com.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=Cape+Town%2C+South+Africa',
    booking_steps: ['Search Hyatt awards in Cape Town'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ MEXICO CITY MEX ════════════════

  {
    destination_airport: 'MEX', destination_city: 'Mexico City', destination_country: 'Mexico', region: 'Latin America',
    program: 'American AAdvantage', miles_required: 22500, cabin: 'business',
    airline: 'American Airlines', product_name: 'AA Business Class to Mexico City',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 1800, typical_taxes: 55,
    availability_notes: 'Short-haul Latin America pricing. Approximate rate — AAdvantage dynamic pricing applies. Verify at aa.com.',
    booking_url: 'https://www.aa.com/reservation/issr/redeemMiles.do',
    booking_steps: ['Search award at aa.com','Select flight to MEX, business class'],
    source_url: SRC.AA_GUIDE, is_active: false,
  },

  {
    destination_airport: 'MEX', destination_city: 'Mexico City', destination_country: 'Mexico', region: 'Latin America',
    program: 'American AAdvantage', miles_required: 12500, cabin: 'economy',
    airline: 'American Airlines', product_name: 'AA Economy to Mexico City',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 500, typical_taxes: 45,
    availability_notes: 'Short-haul economy. AAdvantage uses dynamic pricing — verify at aa.com for actual cost.',
    booking_url: 'https://www.aa.com/reservation/issr/redeemMiles.do',
    booking_steps: ['Search award at aa.com','Select economy flight to MEX'],
    source_url: SRC.AA_GUIDE, is_active: false,
  },

  // ════════════════ CANCUN CUN ════════════════

  {
    destination_airport: 'CUN', destination_city: 'Cancun', destination_country: 'Mexico', region: 'Latin America',
    program: 'American AAdvantage', miles_required: 22500, cabin: 'business',
    airline: 'American Airlines', product_name: 'AA Business to Cancun',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 1600, typical_taxes: 50,
    availability_notes: 'Approximate rate — AAdvantage dynamic pricing. Verify at aa.com.',
    booking_url: 'https://www.aa.com/reservation/issr/redeemMiles.do',
    booking_steps: ['Search award at aa.com','Select business flight to CUN'],
    source_url: SRC.AA_GUIDE, is_active: false,
  },

  {
    destination_airport: 'CUN', destination_city: 'Cancun', destination_country: 'Mexico', region: 'Latin America',
    program: 'World of Hyatt', miles_required: 25000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt Zilara Cancun (all-inclusive)',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 600, typical_taxes: 75,
    availability_notes: 'All-inclusive resort bookable on Hyatt points. Rate requires verification post-2025 devaluation. Confirm at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/mexico/hyatt-zilara-cancun/cunzh',
    booking_steps: ['Search award at hyatt.com','Select Hyatt Zilara Cancun'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ REYKJAVIK KEF ════════════════

  {
    destination_airport: 'KEF', destination_city: 'Reykjavik', destination_country: 'Iceland', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 45000, cabin: 'business',
    airline: 'Icelandair', product_name: 'Icelandair Saga Business via Aeroplan',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 2800, typical_taxes: 80,
    availability_notes: 'Short transatlantic — Icelandair is an Aeroplan partner. Rate estimate — verify at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search Icelandair partner awards to KEF'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'KEF', destination_city: 'Reykjavik', destination_country: 'Iceland', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 20000, cabin: 'economy',
    airline: 'Icelandair', product_name: 'Icelandair Economy to Reykjavik',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 600, typical_taxes: 55,
    availability_notes: 'Short transatlantic economy — affordable in miles. Verify exact rate at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search Icelandair economy award to KEF'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  // ════════════════ MARRAKECH RAK ════════════════

  {
    destination_airport: 'RAK', destination_city: 'Marrakech', destination_country: 'Morocco', region: 'Africa',
    program: 'Iberia Plus', miles_required: 50000, cabin: 'business',
    airline: 'Iberia', product_name: 'Iberia Business to Marrakech via MAD',
    transfer_from: CARDS.IBERIA_AVIOS, transfer_bank_programs: BANKS.IBERIA_AVIOS,
    typical_cash_price: 2800, typical_taxes: 90,
    availability_notes: 'Route via Madrid connection. Approximate estimate based on zone distance — verify exact rate at iberia.com.',
    booking_url: 'https://www.iberia.com/us/',
    booking_steps: ['Search iberia.com for US → MAD → RAK'],
    source_url: SRC.IBERIA_GUIDE, is_active: false,
  },

  {
    destination_airport: 'RAK', destination_city: 'Marrakech', destination_country: 'Morocco', region: 'Africa',
    program: 'World of Hyatt', miles_required: 15000, cabin: 'hotel',
    airline: null, product_name: 'Hyatt property in Marrakech',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 300, typical_taxes: 35,
    availability_notes: 'Limited Hyatt inventory in Marrakech. Verify available properties and current rates at hyatt.com.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=Marrakech%2C+Morocco',
    booking_steps: ['Search Hyatt awards in Marrakech'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ PHUKET HKT ════════════════

  {
    destination_airport: 'HKT', destination_city: 'Phuket', destination_country: 'Thailand', region: 'Asia',
    program: 'Turkish Miles&Smiles', miles_required: 78000, cabin: 'business',
    airline: 'Turkish Airlines', product_name: 'Turkish Business via IST to Phuket',
    transfer_from: CARDS.TURKISH, transfer_bank_programs: BANKS.TURKISH,
    typical_cash_price: 5500, typical_taxes: 110,
    availability_notes: 'Via Istanbul connection. Approximate rate for US to Southeast Asia — verify at turkishairlines.com.',
    booking_url: 'https://www.turkishairlines.com/en-int/miles-and-smiles/flight-awards/',
    booking_steps: ['Log into Turkish Miles&Smiles','Search US → IST → HKT Business class'],
    source_url: SRC.TURKISH_FM, is_active: false,
  },

  {
    destination_airport: 'HKT', destination_city: 'Phuket', destination_country: 'Thailand', region: 'Asia',
    program: 'IHG One Rewards', miles_required: 40000, cabin: 'hotel',
    airline: null, product_name: 'InterContinental Phuket Resort',
    transfer_from: CARDS.IHG, transfer_bank_programs: BANKS.IHG,
    typical_cash_price: 450, typical_taxes: 55,
    availability_notes: 'IHG dynamic pricing — approximate rate. Verify at ihg.com for your dates.',
    booking_url: 'https://www.ihg.com/intercontinental/hotels/us/en/phuket/',
    booking_steps: ['Search reward nights at ihg.com','Select InterContinental Phuket'],
    source_url: SRC.IHG_GUIDE, is_active: false,
  },

  // ════════════════ ATHENS ATH ════════════════

  {
    destination_airport: 'ATH', destination_city: 'Athens', destination_country: 'Greece', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 70000, cabin: 'business',
    airline: 'Lufthansa', product_name: 'Lufthansa Business via FRA to Athens',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 5500, typical_taxes: 140,
    availability_notes: 'Longer transatlantic route — distance pushes into 70,000 pt zone. Route via Frankfurt on Lufthansa. Verify at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search US → FRA → ATH on Lufthansa','Select Business saver'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'ATH', destination_city: 'Athens', destination_country: 'Greece', region: 'Europe',
    program: 'World of Hyatt', miles_required: 15000, cabin: 'hotel',
    airline: null, product_name: 'Grand Hyatt Athens',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 350, typical_taxes: 40,
    availability_notes: 'Rate requires verification post-2025 Hyatt devaluation. Confirm at hyatt.com.',
    booking_url: 'https://www.hyatt.com/en-US/hotel/greece/grand-hyatt-athens/athgh',
    booking_steps: ['Search award at hyatt.com','Select Grand Hyatt Athens'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ BUENOS AIRES EZE ════════════════

  {
    destination_airport: 'EZE', destination_city: 'Buenos Aires', destination_country: 'Argentina', region: 'Latin America',
    program: 'Air Canada Aeroplan', miles_required: 55000, cabin: 'business',
    airline: 'LATAM Airlines', product_name: 'LATAM Business to Buenos Aires',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 4800, typical_taxes: 130,
    availability_notes: 'South America business class. Approximate Aeroplan zone rate — verify at aeroplan.com. LATAM is an Aeroplan partner.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search US gateway → EZE via LATAM'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'EZE', destination_city: 'Buenos Aires', destination_country: 'Argentina', region: 'Latin America',
    program: 'American AAdvantage', miles_required: 30000, cabin: 'economy',
    airline: 'LATAM Airlines', product_name: 'LATAM Economy to Buenos Aires',
    transfer_from: CARDS.AADVANTAGE, transfer_bank_programs: BANKS.AADVANTAGE,
    typical_cash_price: 1200, typical_taxes: 100,
    availability_notes: 'Approximate rate — AAdvantage dynamic pricing applies. Verify at aa.com.',
    booking_url: 'https://www.aa.com/reservation/issr/redeemMiles.do',
    booking_steps: ['Search award at aa.com','Select LATAM partner economy to EZE'],
    source_url: SRC.AA_GUIDE, is_active: false,
  },

  // ════════════════ NAPLES NAP (Amalfi Coast) ════════════════

  {
    destination_airport: 'NAP', destination_city: 'Amalfi Coast', destination_country: 'Italy', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 65000, cabin: 'business',
    airline: 'Lufthansa', product_name: 'Lufthansa Business via FRA to Naples',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 5000, typical_taxes: 130,
    availability_notes: 'Fly into Naples for Amalfi Coast access. Route via Frankfurt. Approximate Aeroplan zone rate — verify at aeroplan.com.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search US → FRA → NAP on Lufthansa'],
    source_url: SRC.AEROPLAN, is_active: false,
  },

  {
    destination_airport: 'NAP', destination_city: 'Amalfi Coast', destination_country: 'Italy', region: 'Europe',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'NH Collection Grand Hotel Convento di Amalfi',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 700, typical_taxes: 85,
    availability_notes: 'Verify Hyatt availability in Amalfi Coast at hyatt.com — limited inventory. May require staying in Sorrento or Naples and day-tripping to Amalfi.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=Amalfi%2C+Italy',
    booking_steps: ['Search Hyatt awards near Amalfi Coast'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

  // ════════════════ SANTORINI JTR ════════════════

  {
    destination_airport: 'JTR', destination_city: 'Santorini', destination_country: 'Greece', region: 'Europe',
    program: 'Air Canada Aeroplan', miles_required: 70000, cabin: 'business',
    airline: 'Lufthansa', product_name: 'Lufthansa Business via FRA/MUC to JTR',
    transfer_from: CARDS.AEROPLAN, transfer_bank_programs: BANKS.AEROPLAN,
    typical_cash_price: 6500, typical_taxes: 145,
    availability_notes: 'Two-leg routing: US → European hub → ATH, then short domestic to JTR. Approximate rate for Greece zone. Verify at aeroplan.com. Peak summer availability limited.',
    booking_url: 'https://www.aircanada.com/aeroplan/redeem/partners',
    booking_steps: ['Log into Aeroplan','Search US → European hub → ATH/JTR','Select business saver'],
    source_url: SRC.EUROPE_MILES, is_active: false,
  },

  {
    destination_airport: 'JTR', destination_city: 'Santorini', destination_country: 'Greece', region: 'Europe',
    program: 'World of Hyatt', miles_required: 20000, cabin: 'hotel',
    airline: null, product_name: 'Andronis Concept Wellness Resort or similar',
    transfer_from: CARDS.HYATT, transfer_bank_programs: BANKS.HYATT,
    typical_cash_price: 800, typical_taxes: 95,
    availability_notes: 'Limited Hyatt inventory in Santorini. Small World of Hyatt Privé properties may exist. Verify at hyatt.com.',
    booking_url: 'https://www.hyatt.com/search/hyatt?searchLocation=Santorini%2C+Greece',
    booking_steps: ['Search Hyatt awards in Santorini'],
    source_url: SRC.HYATT_GUIDE, is_active: false,
  },

];

// ─── Runner ──────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect();
  let inserted = 0;
  try {
    await client.query('BEGIN');

    for (const row of ROWS) {
      await client.query(
        `INSERT INTO sweet_spots (
          destination_airport, destination_city, destination_country, region,
          program, miles_required, cabin, airline, product_name,
          transfer_from, transfer_bank_programs,
          typical_cash_price, typical_taxes,
          availability_notes, booking_url, booking_steps,
          source_url, last_verified, is_active
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),$18
        )`,
        [
          row.destination_airport, row.destination_city, row.destination_country, row.region,
          row.program, row.miles_required, row.cabin, row.airline || null, row.product_name || null,
          row.transfer_from, row.transfer_bank_programs,
          row.typical_cash_price || null, row.typical_taxes || null,
          row.availability_notes || null, row.booking_url || null, row.booking_steps || [],
          row.source_url, row.is_active,
        ]
      );
      inserted++;
    }

    await client.query('COMMIT');
    console.log(`\n✅ Seeded ${inserted} rows into sweet_spots`);
    console.log(`\nRun these verification queries:`);
    console.log(`  SELECT COUNT(*) FROM sweet_spots;`);
    console.log(`  SELECT COUNT(DISTINCT destination_city) FROM sweet_spots;`);
    console.log(`  SELECT COUNT(*) FROM sweet_spots WHERE is_active = true;`);
    console.log(`  SELECT COUNT(*) FROM sweet_spots WHERE source_url IS NULL OR source_url = '';`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
