// server/data/sweet-spots.js
// Pre-seeded award sweet spots for 30 top destinations
// hotel_source: 'internal' — will flip to 'seats_aero_rooms' when Rooms API launches

const SWEET_SPOTS = [
  // ─── ASIA ───────────────────────────────────────────────────────────────
  {
    destination: 'Tokyo, Japan',
    airports: ['NRT', 'HND'],
    country_code: 'JP',
    emoji: '🇯🇵',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'aeroplan',      cabin: 'J', miles: 55000, taxes_usd: 120, notes: 'ANA Business via Aeroplan — best value' },
      { program: 'virginatlantic', cabin: 'J', miles: 60000, taxes_usd: 500, notes: 'ANA Business via Virgin — watch fuel surcharges' },
      { program: 'united',        cabin: 'J', miles: 70000, taxes_usd: 90,  notes: 'ANA/United Business — book early' },
      { program: 'american',      cabin: 'J', miles: 60000, taxes_usd: 100, notes: 'Japan Airlines Business via AA' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',   property: 'Park Hyatt Tokyo', points: 35000, cash_value: 900, category: 8, source: 'internal' },
      { program: 'Marriott', property: 'The Tokyo EDITION Toranomon', points: 40000, cash_value: 700, category: 7, source: 'internal' },
      { program: 'Hilton',  property: 'Conrad Tokyo', points: 60000, cash_value: 600, category: 6, source: 'internal' },
    ],
  },
  {
    destination: 'Bali, Indonesia',
    airports: ['DPS'],
    country_code: 'ID',
    emoji: '🇮🇩',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'lifemiles',  cabin: 'J', miles: 42500, taxes_usd: 40,  notes: 'Avianca LifeMiles — incredible value, no fuel surcharge' },
      { program: 'singapore',  cabin: 'J', miles: 57500, taxes_usd: 70,  notes: 'Singapore KrisFlyer — Silk Air codeshare' },
      { program: 'aeroplan',   cabin: 'J', miles: 60000, taxes_usd: 110, notes: 'Aeroplan via partner airlines' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',   property: 'Alila Seminyak', points: 25000, cash_value: 450, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'W Bali Seminyak', points: 35000, cash_value: 600, category: 7, source: 'internal' },
      { program: 'IHG',     property: 'InterContinental Bali', points: 40000, cash_value: 400, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Singapore',
    airports: ['SIN'],
    country_code: 'SG',
    emoji: '🇸🇬',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'aeroplan',    cabin: 'J', miles: 55000, taxes_usd: 100, notes: 'Air Canada Aeroplan via Star Alliance' },
      { program: 'singapore',   cabin: 'J', miles: 67500, taxes_usd: 500, notes: 'Singapore KrisFlyer direct — fuel surcharge applies' },
      { program: 'lifemiles',   cabin: 'J', miles: 45000, taxes_usd: 50,  notes: 'LifeMiles no fuel surcharge' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',   property: 'Andaz Singapore', points: 30000, cash_value: 550, category: 6, source: 'internal' },
      { program: 'Marriott', property: 'W Singapore Sentosa Cove', points: 40000, cash_value: 600, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Bangkok, Thailand',
    airports: ['BKK', 'DMK'],
    country_code: 'TH',
    emoji: '🇹🇭',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 55000, taxes_usd: 100, notes: 'Thai Airways Business via Aeroplan' },
      { program: 'lifemiles', cabin: 'J', miles: 42500, taxes_usd: 40,  notes: 'No fuel surcharge — great value' },
      { program: 'united',    cabin: 'J', miles: 70000, taxes_usd: 90,  notes: 'Star Alliance partners' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Park Hyatt Bangkok', points: 25000, cash_value: 400, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'W Bangkok', points: 35000, cash_value: 450, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Conrad Bangkok', points: 40000, cash_value: 350, category: 4, source: 'internal' },
    ],
  },
  {
    destination: 'Seoul, South Korea',
    airports: ['ICN', 'GMP'],
    country_code: 'KR',
    emoji: '🇰🇷',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 55000, taxes_usd: 90,  notes: 'Korean Air or Asiana Business' },
      { program: 'united',    cabin: 'J', miles: 70000, taxes_usd: 80,  notes: 'Asiana via Star Alliance' },
      { program: 'lifemiles', cabin: 'J', miles: 42500, taxes_usd: 40,  notes: 'Avianca LifeMiles — best rates' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Grand Hyatt Seoul', points: 17000, cash_value: 300, category: 4, source: 'internal' },
      { program: 'Marriott', property: 'W Seoul Walkerhill', points: 35000, cash_value: 400, category: 6, source: 'internal' },
    ],
  },

  // ─── EUROPE ──────────────────────────────────────────────────────────────
  {
    destination: 'Paris, France',
    airports: ['CDG', 'ORY'],
    country_code: 'FR',
    emoji: '🇫🇷',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',      cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Air France Business — solid value' },
      { program: 'flyingblue',    cabin: 'J', miles: 50000, taxes_usd: 300, notes: 'Flying Blue promo awards — watch for 25% off' },
      { program: 'virginatlantic', cabin: 'J', miles: 50000, taxes_usd: 200, notes: 'Air France via Virgin — watch fuel surcharges' },
      { program: 'delta',         cabin: 'J', miles: 72000, taxes_usd: 150, notes: 'Delta One via SkyMiles' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Park Hyatt Paris Vendôme', points: 35000, cash_value: 1200, category: 8, source: 'internal' },
      { program: 'Marriott', property: 'Le Méridien Etoile', points: 35000, cash_value: 500, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Paris Opéra', points: 50000, cash_value: 500, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'London, UK',
    airports: ['LHR', 'LGW', 'STN'],
    country_code: 'GB',
    emoji: '🇬🇧',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',      cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'British Airways Business — avoid fuel surcharges on BA-operated' },
      { program: 'virginatlantic', cabin: 'J', miles: 50000, taxes_usd: 150, notes: 'Virgin Upper Class — excellent product' },
      { program: 'united',        cabin: 'J', miles: 70000, taxes_usd: 100, notes: 'United Polaris via Star Alliance' },
      { program: 'american',      cabin: 'J', miles: 57500, taxes_usd: 130, notes: 'AA Business via oneworld' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Andaz London Liverpool Street', points: 20000, cash_value: 400, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'London Marriott Hotel Grosvenor Square', points: 35000, cash_value: 500, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Waldorf Hilton London', points: 50000, cash_value: 500, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Rome, Italy',
    airports: ['FCO', 'CIA'],
    country_code: 'IT',
    emoji: '🇮🇹',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Lufthansa/ITA Business via Aeroplan' },
      { program: 'lifemiles',  cabin: 'J', miles: 49000, taxes_usd: 200, notes: 'Avianca LifeMiles' },
      { program: 'flyingblue', cabin: 'J', miles: 50000, taxes_usd: 300, notes: 'Air France/KLM flying to Rome' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Rome Marriott Grand Hotel Flora', points: 35000, cash_value: 450, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Rome Cavalieri', points: 50000, cash_value: 500, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Barcelona, Spain',
    airports: ['BCN'],
    country_code: 'ES',
    emoji: '🇪🇸',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Iberia/Vueling/Lufthansa via Star/oneworld' },
      { program: 'lifemiles',  cabin: 'J', miles: 49000, taxes_usd: 200, notes: 'No fuel surcharge routes available' },
      { program: 'american',   cabin: 'J', miles: 57500, taxes_usd: 130, notes: 'Iberia Business via AA' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Arts Hotel Barcelona', points: 35000, cash_value: 500, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Diagonal Mar Barcelona', points: 50000, cash_value: 400, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Amsterdam, Netherlands',
    airports: ['AMS'],
    country_code: 'NL',
    emoji: '🇳🇱',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'flyingblue', cabin: 'J', miles: 50000, taxes_usd: 250, notes: 'KLM Business via Flying Blue' },
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Star Alliance partners via AMS' },
      { program: 'delta',      cabin: 'J', miles: 72000, taxes_usd: 150, notes: 'KLM via Delta/SkyTeam' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'W Amsterdam', points: 40000, cash_value: 550, category: 7, source: 'internal' },
      { program: 'Hilton',   property: 'Waldorf Astoria Amsterdam', points: 60000, cash_value: 700, category: 6, source: 'internal' },
    ],
  },

  // ─── MIDDLE EAST ─────────────────────────────────────────────────────────
  {
    destination: 'Dubai, UAE',
    airports: ['DXB', 'DWC'],
    country_code: 'AE',
    emoji: '🇦🇪',
    region: 'Middle East',
    flight_sweet_spots: [
      { program: 'emirates', cabin: 'J', miles: 72500, taxes_usd: 70,  notes: 'Emirates Skywards Business — home carrier' },
      { program: 'emirates', cabin: 'F', miles: 90000, taxes_usd: 90,  notes: 'Emirates First Class — stunning product' },
      { program: 'etihad',   cabin: 'J', miles: 64000, taxes_usd: 80,  notes: 'Etihad Business — good alternative' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Bulgari Hotel Dubai', points: 55000, cash_value: 900, category: 8, source: 'internal' },
      { program: 'Hyatt',    property: 'Park Hyatt Dubai', points: 20000, cash_value: 400, category: 5, source: 'internal' },
      { program: 'Hilton',   property: 'Waldorf Astoria Dubai Palm Jumeirah', points: 70000, cash_value: 700, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Maldives',
    airports: ['MLE'],
    country_code: 'MV',
    emoji: '🇲🇻',
    region: 'Asia',
    flight_sweet_spots: [
      { program: 'emirates',  cabin: 'J', miles: 72500, taxes_usd: 90,  notes: 'Emirates via Dubai — most convenient routing' },
      { program: 'aeroplan',  cabin: 'J', miles: 75000, taxes_usd: 150, notes: 'Via SriLankan or other partners' },
      { program: 'etihad',    cabin: 'J', miles: 64000, taxes_usd: 80,  notes: 'Etihad via Abu Dhabi' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Park Hyatt Maldives Hadahaa', points: 30000, cash_value: 1200, category: 7, source: 'internal' },
      { program: 'Marriott', property: 'W Maldives', points: 50000, cash_value: 1500, category: 8, source: 'internal' },
      { program: 'Hilton',   property: 'Conrad Maldives Rangali Island', points: 80000, cash_value: 1800, category: 9, source: 'internal' },
    ],
  },

  // ─── LATIN AMERICA ───────────────────────────────────────────────────────
  {
    destination: 'Cancun, Mexico',
    airports: ['CUN'],
    country_code: 'MX',
    emoji: '🇲🇽',
    region: 'Latin America',
    flight_sweet_spots: [
      { program: 'american',  cabin: 'J', miles: 25000, taxes_usd: 25, notes: 'AA Business — incredibly cheap with AAdvantage' },
      { program: 'united',    cabin: 'J', miles: 25000, taxes_usd: 30, notes: 'United Business — great deal' },
      { program: 'aeroplan',  cabin: 'J', miles: 20000, taxes_usd: 20, notes: 'Aeroplan — cheapest business class in miles' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Hyatt Zilara Cancun (all-inclusive)', points: 20000, cash_value: 500, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'JW Marriott Cancun', points: 35000, cash_value: 400, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Cancun Mar Caribe All-Inclusive', points: 40000, cash_value: 400, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Punta Cana, Dominican Republic',
    airports: ['PUJ'],
    country_code: 'DO',
    emoji: '🇩🇴',
    region: 'Latin America',
    flight_sweet_spots: [
      { program: 'american', cabin: 'J', miles: 20000, taxes_usd: 22, notes: 'Short hop Business Class — great deal' },
      { program: 'united',   cabin: 'J', miles: 20000, taxes_usd: 25, notes: 'United Business' },
      { program: 'jetblue',  cabin: 'W', miles: 15000, taxes_usd: 20, notes: 'JetBlue Mint — best premium product' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Hyatt Ziva Cap Cana', points: 20000, cash_value: 600, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'Paradisus Palma Real (all-inclusive)', points: 35000, cash_value: 500, category: 6, source: 'internal' },
    ],
  },
  {
    destination: 'Buenos Aires, Argentina',
    airports: ['EZE', 'AEP'],
    country_code: 'AR',
    emoji: '🇦🇷',
    region: 'Latin America',
    flight_sweet_spots: [
      { program: 'lifemiles', cabin: 'J', miles: 40000, taxes_usd: 50, notes: 'Avianca LifeMiles — best rates to South America' },
      { program: 'american',  cabin: 'J', miles: 40000, taxes_usd: 60, notes: 'LATAM or AA Business' },
      { program: 'united',    cabin: 'J', miles: 40000, taxes_usd: 50, notes: 'Star Alliance routing' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Palacio Duhau Park Hyatt Buenos Aires', points: 20000, cash_value: 350, category: 5, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Buenos Aires', points: 30000, cash_value: 300, category: 4, source: 'internal' },
    ],
  },

  // ─── CARIBBEAN ───────────────────────────────────────────────────────────
  {
    destination: 'St. Lucia',
    airports: ['UVF', 'SLU'],
    country_code: 'LC',
    emoji: '🇱🇨',
    region: 'Caribbean',
    flight_sweet_spots: [
      { program: 'american', cabin: 'J', miles: 20000, taxes_usd: 22, notes: 'Short Caribbean hop — great value' },
      { program: 'united',   cabin: 'J', miles: 25000, taxes_usd: 25, notes: 'United Business' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Windjammer Landing Villa Beach Resort', points: 35000, cash_value: 700, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Turks and Caicos',
    airports: ['PLS'],
    country_code: 'TC',
    emoji: '🇹🇨',
    region: 'Caribbean',
    flight_sweet_spots: [
      { program: 'american', cabin: 'J', miles: 20000, taxes_usd: 22, notes: 'AA Business — most flights via MIA or JFK' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Wymara Resort and Villas', points: 20000, cash_value: 800, category: 5, source: 'internal' },
      { program: 'Marriott', property: 'The Palms Turks and Caicos', points: 35000, cash_value: 900, category: 7, source: 'internal' },
    ],
  },

  // ─── OCEANIA ─────────────────────────────────────────────────────────────
  {
    destination: 'Sydney, Australia',
    airports: ['SYD'],
    country_code: 'AU',
    emoji: '🇦🇺',
    region: 'Oceania',
    flight_sweet_spots: [
      { program: 'aeroplan',   cabin: 'J', miles: 75000, taxes_usd: 150, notes: 'Qantas or Air Canada Business via Aeroplan' },
      { program: 'american',   cabin: 'J', miles: 70000, taxes_usd: 100, notes: 'Qantas Business via AA — great product' },
      { program: 'lifemiles',  cabin: 'J', miles: 63000, taxes_usd: 80,  notes: 'LifeMiles no fuel surcharge' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Park Hyatt Sydney', points: 25000, cash_value: 700, category: 6, source: 'internal' },
      { program: 'Marriott', property: 'W Sydney', points: 35000, cash_value: 500, category: 6, source: 'internal' },
    ],
  },
  {
    destination: 'Auckland, New Zealand',
    airports: ['AKL'],
    country_code: 'NZ',
    emoji: '🇳🇿',
    region: 'Oceania',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 75000, taxes_usd: 150, notes: 'Air New Zealand Business via Aeroplan' },
      { program: 'united',    cabin: 'J', miles: 80000, taxes_usd: 120, notes: 'Air NZ via United Star Alliance' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Grand Hyatt Auckland', points: 17000, cash_value: 300, category: 4, source: 'internal' },
      { program: 'Marriott', property: 'The Cordis Auckland', points: 25000, cash_value: 350, category: 5, source: 'internal' },
    ],
  },

  // ─── AFRICA ──────────────────────────────────────────────────────────────
  {
    destination: 'Cape Town, South Africa',
    airports: ['CPT'],
    country_code: 'ZA',
    emoji: '🇿🇦',
    region: 'Africa',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 75000, taxes_usd: 200, notes: 'Via London or Dubai connections' },
      { program: 'emirates',  cabin: 'J', miles: 75000, taxes_usd: 200, notes: 'Emirates via Dubai — excellent routing' },
      { program: 'etihad',    cabin: 'J', miles: 64000, taxes_usd: 150, notes: 'Etihad via Abu Dhabi' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Westin Cape Town', points: 25000, cash_value: 350, category: 5, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Cape Town City Centre', points: 30000, cash_value: 300, category: 4, source: 'internal' },
    ],
  },

  // ─── NORTH AMERICA ───────────────────────────────────────────────────────
  {
    destination: 'Hawaii (Honolulu), USA',
    airports: ['HNL', 'OGG', 'KOA'],
    country_code: 'US',
    emoji: '🌺',
    region: 'North America',
    flight_sweet_spots: [
      { program: 'alaska',   cabin: 'J', miles: 40000, taxes_usd: 35, notes: 'Alaska Airlines Business — incredible value' },
      { program: 'united',   cabin: 'J', miles: 35000, taxes_usd: 50, notes: 'United Polaris domestic' },
      { program: 'american', cabin: 'J', miles: 30000, taxes_usd: 40, notes: 'AA Business — short mainland hop' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Andaz Maui at Wailea Resort', points: 25000, cash_value: 700, category: 6, source: 'internal' },
      { program: 'Marriott', property: 'Sheraton Maui Resort & Spa', points: 35000, cash_value: 600, category: 6, source: 'internal' },
      { program: 'Hilton',   property: 'Grand Wailea Maui (Waldorf)', points: 70000, cash_value: 900, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Montreal, Canada',
    airports: ['YUL'],
    country_code: 'CA',
    emoji: '🇨🇦',
    region: 'North America',
    flight_sweet_spots: [
      { program: 'aeroplan', cabin: 'J', miles: 15000, taxes_usd: 20, notes: 'Aeroplan — home carrier, short hop' },
      { program: 'united',   cabin: 'J', miles: 15000, taxes_usd: 20, notes: 'Star Alliance to Canada' },
      { program: 'american', cabin: 'J', miles: 15000, taxes_usd: 20, notes: 'AA via oneworld partners' },
    ],
    hotel_sweet_spots: [
      { program: 'Hyatt',    property: 'Hotel Le Crystal (SLH)', points: 17000, cash_value: 250, category: 4, source: 'internal' },
      { program: 'Marriott', property: 'Le Centre Sheraton Montreal', points: 25000, cash_value: 250, category: 5, source: 'internal' },
    ],
  },

  // ─── ADDITIONAL POPULAR DESTINATIONS ─────────────────────────────────────
  {
    destination: 'Santorini, Greece',
    airports: ['JTR', 'ATH'],
    country_code: 'GR',
    emoji: '🇬🇷',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Via Athens or other European hub' },
      { program: 'flyingblue', cabin: 'J', miles: 50000, taxes_usd: 250, notes: 'Air France/KLM to ATH then Aegean to JTR' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Mystique Santorini (Autograph)', points: 35000, cash_value: 900, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Amalfi Coast, Italy',
    airports: ['NAP'],
    country_code: 'IT',
    emoji: '🇮🇹',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Via Rome or Milan, short train/ferry to coast' },
      { program: 'lifemiles', cabin: 'J', miles: 49000, taxes_usd: 200, notes: 'No fuel surcharge Avianca routing' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Monastero Santa Rosa Hotel & Spa', points: 35000, cash_value: 1100, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Istanbul, Turkey',
    airports: ['IST', 'SAW'],
    country_code: 'TR',
    emoji: '🇹🇷',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'turkish',   cabin: 'J', miles: 45000, taxes_usd: 100, notes: 'Miles&Smiles — home carrier, excellent value' },
      { program: 'aeroplan',  cabin: 'J', miles: 57500, taxes_usd: 150, notes: 'Via Turkish Airlines partner award' },
      { program: 'lifemiles', cabin: 'J', miles: 49000, taxes_usd: 150, notes: 'LifeMiles no fuel surcharge' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Four Points by Sheraton Istanbul', points: 25000, cash_value: 250, category: 5, source: 'internal' },
      { program: 'Hilton',   property: 'Conrad Istanbul Bosphorus', points: 50000, cash_value: 500, category: 5, source: 'internal' },
    ],
  },
  {
    destination: 'Marrakech, Morocco',
    airports: ['RAK'],
    country_code: 'MA',
    emoji: '🇲🇦',
    region: 'Africa',
    flight_sweet_spots: [
      { program: 'flyingblue', cabin: 'J', miles: 50000, taxes_usd: 300, notes: 'Air France via Paris — frequent service' },
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 200, notes: 'Via European hub connections' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Four Seasons Marrakech', points: 35000, cash_value: 700, category: 7, source: 'internal' },
    ],
  },
  {
    destination: 'Lisbon, Portugal',
    airports: ['LIS'],
    country_code: 'PT',
    emoji: '🇵🇹',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',   cabin: 'J', miles: 57500, taxes_usd: 180, notes: 'TAP Air Portugal Business via Aeroplan' },
      { program: 'flyingblue', cabin: 'J', miles: 50000, taxes_usd: 250, notes: 'Air France/TAP combination' },
      { program: 'lifemiles',  cabin: 'J', miles: 49000, taxes_usd: 150, notes: 'No fuel surcharge routing' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Bairro Alto Hotel (Autograph)', points: 35000, cash_value: 500, category: 6, source: 'internal' },
      { program: 'Hyatt',    property: 'Hyatt Regency Lisbon', points: 17000, cash_value: 300, category: 4, source: 'internal' },
    ],
  },
  {
    destination: 'Prague, Czech Republic',
    airports: ['PRG'],
    country_code: 'CZ',
    emoji: '🇨🇿',
    region: 'Europe',
    flight_sweet_spots: [
      { program: 'aeroplan',  cabin: 'J', miles: 57500, taxes_usd: 180, notes: 'Via Lufthansa or Czech Airlines' },
      { program: 'lifemiles', cabin: 'J', miles: 49000, taxes_usd: 180, notes: 'LifeMiles Star Alliance routing' },
    ],
    hotel_sweet_spots: [
      { program: 'Marriott', property: 'Hotel Josef Prague (Autograph)', points: 25000, cash_value: 350, category: 5, source: 'internal' },
      { program: 'Hilton',   property: 'Hilton Prague', points: 30000, cash_value: 300, category: 4, source: 'internal' },
    ],
  },
];

function findDestination(query) {
  if (!query) return null;
  const q = query.toLowerCase();
  return SWEET_SPOTS.find(d =>
    d.destination.toLowerCase().includes(q) ||
    d.airports.some(a => a.toLowerCase() === q) ||
    d.country_code.toLowerCase() === q
  ) || null;
}

function getTopDestinations(limit = 10) {
  return SWEET_SPOTS.slice(0, limit);
}

function getDestinationsByRegion(region) {
  return SWEET_SPOTS.filter(d => d.region === region);
}

module.exports = { SWEET_SPOTS, findDestination, getTopDestinations, getDestinationsByRegion };
