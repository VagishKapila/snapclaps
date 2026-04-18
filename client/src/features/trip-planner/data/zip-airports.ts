// ZIP → nearest airports lookup (US only).
// Two-layer lookup:
//   LAYER 1: Exact 5-digit ZIP → airports array
//   LAYER 2: First 3 digits of ZIP → airports array (covers metro regions broadly)
// If neither matches → return null → StepWhereYouAre shows manual fallback input.

export interface NearestAirports {
  airports: { code: string; name: string; city: string }[];
  city: string;
  state: string;
}

// ── Exact 5-digit lookups (highest-traffic ZIPs) ────────────────────────────
const ZIP_EXACT: Record<string, NearestAirports> = {
  '10001': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '90210': { city: 'Beverly Hills', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }] },
  '94103': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '60601': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '77001': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '75201': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '33139': { city: 'Miami Beach', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '02101': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '20001': { city: 'Washington', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '98101': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '85001': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }] },
  '80202': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '30303': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '89101': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
};

// ── 3-digit prefix lookups — covers entire metro region ─────────────────────
// Key = first 3 digits of ZIP as string
const ZIP_PREFIX: Record<string, NearestAirports> = {
  // ── New York Metro (NY, NJ) ─────────────────────────────────────────────
  '100': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '101': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '102': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '103': { city: 'Staten Island', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '104': { city: 'Bronx', state: 'NY', airports: [{ code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '110': { city: 'Queens', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '111': { city: 'Queens', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '112': { city: 'Brooklyn', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '113': { city: 'Queens', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '114': { city: 'Queens', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '116': { city: 'Far Rockaway', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '070': { city: 'Newark', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '071': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '072': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '073': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '074': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '075': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '076': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '077': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '079': { city: 'Northern NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '080': { city: 'Southern NJ', state: 'NJ', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '081': { city: 'Southern NJ', state: 'NJ', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '082': { city: 'Southern NJ', state: 'NJ', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '083': { city: 'Southern NJ', state: 'NJ', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'ACY', name: 'Atlantic City Intl', city: 'Atlantic City' }] },
  '084': { city: 'Southern NJ', state: 'NJ', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '085': { city: 'Trenton', state: 'NJ', airports: [{ code: 'TTN', name: 'Trenton-Mercer', city: 'Trenton' }, { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '086': { city: 'Princeton', state: 'NJ', airports: [{ code: 'TTN', name: 'Trenton-Mercer', city: 'Trenton' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '087': { city: 'Central NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '088': { city: 'Central NJ', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },

  // ── Los Angeles Metro ───────────────────────────────────────────────────
  '900': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '901': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }] },
  '902': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '903': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '904': { city: 'Santa Monica', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }] },
  '905': { city: 'Torrance', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '906': { city: 'Compton', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '907': { city: 'Long Beach', state: 'CA', airports: [{ code: 'LGB', name: 'Long Beach', city: 'Long Beach' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '908': { city: 'Long Beach', state: 'CA', airports: [{ code: 'LGB', name: 'Long Beach', city: 'Long Beach' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '910': { city: 'Pasadena', state: 'CA', airports: [{ code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '911': { city: 'Pasadena', state: 'CA', airports: [{ code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '912': { city: 'Glendale', state: 'CA', airports: [{ code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '913': { city: 'Van Nuys', state: 'CA', airports: [{ code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '914': { city: 'North Hollywood', state: 'CA', airports: [{ code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '915': { city: 'Pomona', state: 'CA', airports: [{ code: 'ONT', name: 'Ontario Intl', city: 'Ontario' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '916': { city: 'Pomona', state: 'CA', airports: [{ code: 'ONT', name: 'Ontario Intl', city: 'Ontario' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '917': { city: 'Covina', state: 'CA', airports: [{ code: 'ONT', name: 'Ontario Intl', city: 'Ontario' }, { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }] },
  '918': { city: 'Whittier', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '919': { city: 'Norwalk', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },

  // ── San Diego ───────────────────────────────────────────────────────────
  '920': { city: 'San Diego', state: 'CA', airports: [{ code: 'SAN', name: 'San Diego Intl', city: 'San Diego' }] },
  '921': { city: 'San Diego', state: 'CA', airports: [{ code: 'SAN', name: 'San Diego Intl', city: 'San Diego' }] },
  '922': { city: 'San Diego', state: 'CA', airports: [{ code: 'SAN', name: 'San Diego Intl', city: 'San Diego' }] },

  // ── San Francisco Bay Area ──────────────────────────────────────────────
  '940': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '941': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '942': { city: 'Sacramento', state: 'CA', airports: [{ code: 'SMF', name: 'Sacramento Intl', city: 'Sacramento' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }] },
  '943': { city: 'Palo Alto', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '944': { city: 'San Mateo', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
  '945': { city: 'Fremont', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '946': { city: 'Oakland', state: 'CA', airports: [{ code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }] },
  '947': { city: 'Berkeley', state: 'CA', airports: [{ code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }] },
  '948': { city: 'Richmond', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
  '949': { city: 'Mill Valley', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
  '950': { city: 'San Jose', state: 'CA', airports: [{ code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
  '951': { city: 'San Jose', state: 'CA', airports: [{ code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }] },
  '952': { city: 'Hayward', state: 'CA', airports: [{ code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '953': { city: 'Santa Cruz', state: 'CA', airports: [{ code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }] },
  '954': { city: 'Santa Rosa', state: 'CA', airports: [{ code: 'STS', name: 'Sonoma County', city: 'Santa Rosa' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },

  // ── Chicago Metro ───────────────────────────────────────────────────────
  '606': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '607': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '608': { city: 'Chicago', state: 'IL', airports: [{ code: 'MDW', name: 'Midway Intl', city: 'Chicago' }, { code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }] },
  '600': { city: 'Chicago Suburbs', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '601': { city: 'Chicago Suburbs', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '602': { city: 'Evanston', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '603': { city: 'Oak Park', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '604': { city: 'Joliet', state: 'IL', airports: [{ code: 'MDW', name: 'Midway Intl', city: 'Chicago' }, { code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }] },
  '605': { city: 'Kankakee', state: 'IL', airports: [{ code: 'MDW', name: 'Midway Intl', city: 'Chicago' }, { code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }] },

  // ── Houston ─────────────────────────────────────────────────────────────
  '770': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '771': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '772': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '773': { city: 'Houston', state: 'TX', airports: [{ code: 'HOU', name: 'William P. Hobby', city: 'Houston' }, { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }] },
  '774': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '775': { city: 'Galveston', state: 'TX', airports: [{ code: 'HOU', name: 'William P. Hobby', city: 'Houston' }, { code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }] },
  '776': { city: 'Beaumont', state: 'TX', airports: [{ code: 'BPT', name: 'Jack Brooks Regional', city: 'Beaumont' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '777': { city: 'Bryan', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }] },

  // ── Dallas / Fort Worth ─────────────────────────────────────────────────
  '750': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '751': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '752': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '753': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '754': { city: 'Garland', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '760': { city: 'Fort Worth', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '761': { city: 'Fort Worth', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }] },
  '762': { city: 'Denton', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }] },

  // ── Miami / Fort Lauderdale ─────────────────────────────────────────────
  '330': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '331': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '332': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '333': { city: 'Fort Lauderdale', state: 'FL', airports: [{ code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }, { code: 'MIA', name: 'Miami Intl', city: 'Miami' }] },
  '334': { city: 'West Palm Beach', state: 'FL', airports: [{ code: 'PBI', name: 'Palm Beach Intl', city: 'West Palm Beach' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },

  // ── Boston / New England ────────────────────────────────────────────────
  '021': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '022': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '023': { city: 'Brockton', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }, { code: 'PVD', name: 'T.F. Green', city: 'Providence' }] },
  '024': { city: 'Dedham', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '025': { city: 'Cape Cod', state: 'MA', airports: [{ code: 'HYA', name: 'Barnstable Municipal', city: 'Hyannis' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '026': { city: 'Worcester', state: 'MA', airports: [{ code: 'ORH', name: 'Worcester Regional', city: 'Worcester' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '027': { city: 'Springfield', state: 'MA', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '028': { city: 'Providence', state: 'RI', airports: [{ code: 'PVD', name: 'T.F. Green', city: 'Providence' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '029': { city: 'Providence', state: 'RI', airports: [{ code: 'PVD', name: 'T.F. Green', city: 'Providence' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '060': { city: 'Hartford', state: 'CT', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'PVD', name: 'T.F. Green', city: 'Providence' }] },
  '061': { city: 'Hartford', state: 'CT', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }] },
  '062': { city: 'New Haven', state: 'CT', airports: [{ code: 'HVN', name: 'Tweed New Haven', city: 'New Haven' }, { code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }] },
  '063': { city: 'New London', state: 'CT', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'PVD', name: 'T.F. Green', city: 'Providence' }] },
  '064': { city: 'Meriden', state: 'CT', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'HVN', name: 'Tweed New Haven', city: 'New Haven' }] },
  '065': { city: 'Waterbury', state: 'CT', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'HVN', name: 'Tweed New Haven', city: 'New Haven' }] },
  '066': { city: 'Bridgeport', state: 'CT', airports: [{ code: 'HVN', name: 'Tweed New Haven', city: 'New Haven' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '067': { city: 'Norwalk', state: 'CT', airports: [{ code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'HVN', name: 'Tweed New Haven', city: 'New Haven' }] },
  '068': { city: 'Stamford', state: 'CT', airports: [{ code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '069': { city: 'Greenfield', state: 'MA', airports: [{ code: 'BDL', name: 'Bradley Intl', city: 'Windsor Locks' }, { code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },

  // ── Washington DC Metro ─────────────────────────────────────────────────
  '200': { city: 'Washington', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '201': { city: 'Northern Virginia', state: 'VA', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '202': { city: 'Washington DC', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '203': { city: 'Washington DC', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '204': { city: 'Rockville', state: 'MD', airports: [{ code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '205': { city: 'Bethesda', state: 'MD', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '206': { city: 'Silver Spring', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '207': { city: 'Prince George\'s County', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '208': { city: 'Gaithersburg', state: 'MD', airports: [{ code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }] },
  '209': { city: 'Upper Marlboro', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '210': { city: 'Baltimore', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '211': { city: 'Baltimore', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '212': { city: 'Baltimore', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '220': { city: 'Northern Virginia', state: 'VA', airports: [{ code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '221': { city: 'Northern Virginia', state: 'VA', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }] },
  '222': { city: 'Arlington', state: 'VA', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }] },
  '223': { city: 'Alexandria', state: 'VA', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }] },

  // ── Philadelphia ────────────────────────────────────────────────────────
  '190': { city: 'Philadelphia', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '191': { city: 'Philadelphia', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '192': { city: 'Philadelphia Suburbs', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '193': { city: 'Philadelphia Suburbs', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '194': { city: 'Philadelphia Suburbs', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },

  // ── Atlanta ─────────────────────────────────────────────────────────────
  '300': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '301': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '302': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '303': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '304': { city: 'Atlanta Suburbs', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '305': { city: 'Atlanta Suburbs', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '306': { city: 'Atlanta Suburbs', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '307': { city: 'Atlanta Suburbs', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '308': { city: 'Augusta', state: 'GA', airports: [{ code: 'AGS', name: 'Augusta Regional', city: 'Augusta' }, { code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '309': { city: 'Savannah', state: 'GA', airports: [{ code: 'SAV', name: 'Savannah/Hilton Head Intl', city: 'Savannah' }] },

  // ── Seattle ─────────────────────────────────────────────────────────────
  '980': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '981': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '982': { city: 'Tacoma', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }, { code: 'GEG', name: 'Spokane Intl', city: 'Spokane' }] },
  '983': { city: 'Tacoma', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '984': { city: 'Tacoma', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '985': { city: 'Olympia', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '986': { city: 'Vancouver', state: 'WA', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }, { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '987': { city: 'Yakima', state: 'WA', airports: [{ code: 'YKM', name: 'Yakima Air Terminal', city: 'Yakima' }, { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '988': { city: 'Wenatchee', state: 'WA', airports: [{ code: 'EAT', name: 'Pangborn Memorial', city: 'Wenatchee' }, { code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '989': { city: 'Spokane', state: 'WA', airports: [{ code: 'GEG', name: 'Spokane Intl', city: 'Spokane' }] },

  // ── Phoenix ─────────────────────────────────────────────────────────────
  '850': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }, { code: 'AZA', name: 'Phoenix-Mesa Gateway', city: 'Mesa' }] },
  '851': { city: 'Mesa', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }, { code: 'AZA', name: 'Phoenix-Mesa Gateway', city: 'Mesa' }] },
  '852': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }] },
  '853': { city: 'Glendale', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }] },
  '854': { city: 'Scottsdale', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }] },
  '855': { city: 'Tempe', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }, { code: 'AZA', name: 'Phoenix-Mesa Gateway', city: 'Mesa' }] },
  '856': { city: 'Tucson', state: 'AZ', airports: [{ code: 'TUS', name: 'Tucson Intl', city: 'Tucson' }] },

  // ── Las Vegas ───────────────────────────────────────────────────────────
  '889': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '890': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '891': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '892': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '893': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '894': { city: 'Reno', state: 'NV', airports: [{ code: 'RNO', name: 'Reno-Tahoe Intl', city: 'Reno' }, { code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '895': { city: 'Reno', state: 'NV', airports: [{ code: 'RNO', name: 'Reno-Tahoe Intl', city: 'Reno' }] },

  // ── Denver ──────────────────────────────────────────────────────────────
  '800': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '801': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '802': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '803': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '804': { city: 'Denver Suburbs', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '805': { city: 'Boulder', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '806': { city: 'Colorado Springs', state: 'CO', airports: [{ code: 'COS', name: 'Colorado Springs', city: 'Colorado Springs' }, { code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '807': { city: 'Fort Collins', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '808': { city: 'Pueblo', state: 'CO', airports: [{ code: 'PUB', name: 'Pueblo Memorial', city: 'Pueblo' }, { code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },

  // ── Portland, OR ────────────────────────────────────────────────────────
  '970': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '971': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '972': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '973': { city: 'Salem', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }, { code: 'SLE', name: 'Salem', city: 'Salem' }] },
  '974': { city: 'Eugene', state: 'OR', airports: [{ code: 'EUG', name: 'Eugene', city: 'Eugene' }, { code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '975': { city: 'Medford', state: 'OR', airports: [{ code: 'MFR', name: 'Rogue Valley Intl', city: 'Medford' }] },
  '976': { city: 'Klamath Falls', state: 'OR', airports: [{ code: 'LMT', name: 'Klamath Falls', city: 'Klamath Falls' }] },
  '977': { city: 'Bend', state: 'OR', airports: [{ code: 'RDM', name: 'Redmond', city: 'Bend' }, { code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '978': { city: 'Corvallis', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '979': { city: 'Astoria', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },

  // ── Minneapolis ─────────────────────────────────────────────────────────
  '550': { city: 'Minneapolis', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '551': { city: 'Minneapolis', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '553': { city: 'Minneapolis', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '554': { city: 'Minneapolis Suburbs', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '555': { city: 'Minneapolis Suburbs', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '560': { city: 'St Paul', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '561': { city: 'St Paul Suburbs', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },

  // ── Austin TX ───────────────────────────────────────────────────────────
  '786': { city: 'Austin', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },
  '787': { city: 'Austin', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },
  '788': { city: 'Austin Suburbs', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },

  // ── San Antonio TX ──────────────────────────────────────────────────────
  '782': { city: 'San Antonio', state: 'TX', airports: [{ code: 'SAT', name: 'San Antonio Intl', city: 'San Antonio' }] },
  '783': { city: 'San Antonio', state: 'TX', airports: [{ code: 'SAT', name: 'San Antonio Intl', city: 'San Antonio' }] },
  '784': { city: 'Corpus Christi', state: 'TX', airports: [{ code: 'CRP', name: 'Corpus Christi Intl', city: 'Corpus Christi' }] },

  // ── Nashville ───────────────────────────────────────────────────────────
  '370': { city: 'Nashville', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  '371': { city: 'Nashville', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  '372': { city: 'Nashville', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  '373': { city: 'Nashville Suburbs', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  '374': { city: 'Memphis', state: 'TN', airports: [{ code: 'MEM', name: 'Memphis Intl', city: 'Memphis' }] },

  // ── Charlotte ───────────────────────────────────────────────────────────
  '280': { city: 'Charlotte', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },
  '281': { city: 'Charlotte', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },
  '282': { city: 'Charlotte', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },
  '283': { city: 'Charlotte Suburbs', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },

  // ── New Orleans ─────────────────────────────────────────────────────────
  '700': { city: 'New Orleans', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  '701': { city: 'New Orleans', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  '702': { city: 'New Orleans Suburbs', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  '703': { city: 'New Orleans Suburbs', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  '704': { city: 'Baton Rouge', state: 'LA', airports: [{ code: 'BTR', name: 'Baton Rouge Metropolitan', city: 'Baton Rouge' }, { code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },

  // ── Salt Lake City ──────────────────────────────────────────────────────
  '840': { city: 'Salt Lake City', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  '841': { city: 'Salt Lake City', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  '842': { city: 'Ogden', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  '843': { city: 'Ogden', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  '844': { city: 'Provo', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }, { code: 'PVU', name: 'Provo Municipal', city: 'Provo' }] },
  '845': { city: 'Price', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },

  // ── Detroit ─────────────────────────────────────────────────────────────
  '480': { city: 'Detroit', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '481': { city: 'Detroit', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '482': { city: 'Detroit', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '483': { city: 'Detroit Suburbs', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '484': { city: 'Flint', state: 'MI', airports: [{ code: 'FNT', name: 'Bishop International', city: 'Flint' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '485': { city: 'Lansing', state: 'MI', airports: [{ code: 'LAN', name: 'Capital Region Intl', city: 'Lansing' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '486': { city: 'Saginaw', state: 'MI', airports: [{ code: 'MBS', name: 'MBS International', city: 'Saginaw' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '487': { city: 'Bay City', state: 'MI', airports: [{ code: 'MBS', name: 'MBS International', city: 'Saginaw' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '488': { city: 'Kalamazoo', state: 'MI', airports: [{ code: 'AZO', name: 'Kalamazoo/Battle Creek Intl', city: 'Kalamazoo' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '489': { city: 'Benton Harbor', state: 'MI', airports: [{ code: 'SBN', name: 'South Bend Intl', city: 'South Bend' }, { code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '490': { city: 'Grand Rapids', state: 'MI', airports: [{ code: 'GRR', name: 'Gerald R. Ford Intl', city: 'Grand Rapids' }] },
  '491': { city: 'Grand Rapids', state: 'MI', airports: [{ code: 'GRR', name: 'Gerald R. Ford Intl', city: 'Grand Rapids' }] },
  '492': { city: 'Grand Rapids', state: 'MI', airports: [{ code: 'GRR', name: 'Gerald R. Ford Intl', city: 'Grand Rapids' }] },

  // ── Raleigh / Durham ────────────────────────────────────────────────────
  '275': { city: 'Raleigh', state: 'NC', airports: [{ code: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh' }] },
  '276': { city: 'Durham', state: 'NC', airports: [{ code: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh' }] },
  '277': { city: 'Raleigh Suburbs', state: 'NC', airports: [{ code: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh' }] },
  '278': { city: 'Rocky Mount', state: 'NC', airports: [{ code: 'RDU', name: 'Raleigh-Durham Intl', city: 'Raleigh' }] },

  // ── Cleveland / Pittsburgh ──────────────────────────────────────────────
  '440': { city: 'Cleveland', state: 'OH', airports: [{ code: 'CLE', name: 'Cleveland Hopkins Intl', city: 'Cleveland' }] },
  '441': { city: 'Cleveland', state: 'OH', airports: [{ code: 'CLE', name: 'Cleveland Hopkins Intl', city: 'Cleveland' }] },
  '442': { city: 'Akron', state: 'OH', airports: [{ code: 'CAK', name: 'Akron-Canton', city: 'Akron' }, { code: 'CLE', name: 'Cleveland Hopkins Intl', city: 'Cleveland' }] },
  '152': { city: 'Pittsburgh', state: 'PA', airports: [{ code: 'PIT', name: 'Pittsburgh Intl', city: 'Pittsburgh' }] },
  '153': { city: 'Pittsburgh', state: 'PA', airports: [{ code: 'PIT', name: 'Pittsburgh Intl', city: 'Pittsburgh' }] },
  '155': { city: 'Pittsburgh Suburbs', state: 'PA', airports: [{ code: 'PIT', name: 'Pittsburgh Intl', city: 'Pittsburgh' }] },

  // ── Columbus / Cincinnati ───────────────────────────────────────────────
  '430': { city: 'Columbus', state: 'OH', airports: [{ code: 'CMH', name: 'John Glenn Columbus Intl', city: 'Columbus' }] },
  '431': { city: 'Columbus', state: 'OH', airports: [{ code: 'CMH', name: 'John Glenn Columbus Intl', city: 'Columbus' }] },
  '432': { city: 'Columbus', state: 'OH', airports: [{ code: 'CMH', name: 'John Glenn Columbus Intl', city: 'Columbus' }] },
  '452': { city: 'Cincinnati', state: 'OH', airports: [{ code: 'CVG', name: 'Cincinnati/Northern Kentucky Intl', city: 'Cincinnati' }] },
  '453': { city: 'Cincinnati', state: 'OH', airports: [{ code: 'CVG', name: 'Cincinnati/Northern Kentucky Intl', city: 'Cincinnati' }] },
  '454': { city: 'Dayton', state: 'OH', airports: [{ code: 'DAY', name: 'Dayton Intl', city: 'Dayton' }] },
  '455': { city: 'Dayton', state: 'OH', airports: [{ code: 'DAY', name: 'Dayton Intl', city: 'Dayton' }] },

  // ── Indianapolis ────────────────────────────────────────────────────────
  '460': { city: 'Indianapolis', state: 'IN', airports: [{ code: 'IND', name: 'Indianapolis Intl', city: 'Indianapolis' }] },
  '461': { city: 'Indianapolis', state: 'IN', airports: [{ code: 'IND', name: 'Indianapolis Intl', city: 'Indianapolis' }] },
  '462': { city: 'Indianapolis', state: 'IN', airports: [{ code: 'IND', name: 'Indianapolis Intl', city: 'Indianapolis' }] },

  // ── St Louis ────────────────────────────────────────────────────────────
  '630': { city: 'St. Louis', state: 'MO', airports: [{ code: 'STL', name: 'St. Louis Lambert Intl', city: 'St. Louis' }] },
  '631': { city: 'St. Louis', state: 'MO', airports: [{ code: 'STL', name: 'St. Louis Lambert Intl', city: 'St. Louis' }] },
  '632': { city: 'St. Louis Suburbs', state: 'MO', airports: [{ code: 'STL', name: 'St. Louis Lambert Intl', city: 'St. Louis' }] },

  // ── Kansas City ─────────────────────────────────────────────────────────
  '640': { city: 'Kansas City', state: 'MO', airports: [{ code: 'MCI', name: 'Kansas City Intl', city: 'Kansas City' }] },
  '641': { city: 'Kansas City', state: 'MO', airports: [{ code: 'MCI', name: 'Kansas City Intl', city: 'Kansas City' }] },

  // ── Tampa / Orlando ─────────────────────────────────────────────────────
  '336': { city: 'Tampa', state: 'FL', airports: [{ code: 'TPA', name: 'Tampa Intl', city: 'Tampa' }, { code: 'PIE', name: 'St. Pete–Clearwater Intl', city: 'Clearwater' }] },
  '337': { city: 'St. Petersburg', state: 'FL', airports: [{ code: 'PIE', name: 'St. Pete–Clearwater Intl', city: 'Clearwater' }, { code: 'TPA', name: 'Tampa Intl', city: 'Tampa' }] },
  '338': { city: 'Lakeland', state: 'FL', airports: [{ code: 'TPA', name: 'Tampa Intl', city: 'Tampa' }, { code: 'MCO', name: 'Orlando Intl', city: 'Orlando' }] },
  '327': { city: 'Orlando', state: 'FL', airports: [{ code: 'MCO', name: 'Orlando Intl', city: 'Orlando' }, { code: 'SFB', name: 'Orlando Sanford Intl', city: 'Sanford' }] },
  '328': { city: 'Orlando', state: 'FL', airports: [{ code: 'MCO', name: 'Orlando Intl', city: 'Orlando' }] },
  '329': { city: 'Daytona Beach', state: 'FL', airports: [{ code: 'DAB', name: 'Daytona Beach Intl', city: 'Daytona Beach' }, { code: 'MCO', name: 'Orlando Intl', city: 'Orlando' }] },
  '324': { city: 'Jacksonville', state: 'FL', airports: [{ code: 'JAX', name: 'Jacksonville Intl', city: 'Jacksonville' }] },
  '325': { city: 'Gainesville', state: 'FL', airports: [{ code: 'GNV', name: 'Gainesville Regional', city: 'Gainesville' }, { code: 'JAX', name: 'Jacksonville Intl', city: 'Jacksonville' }] },

  // ── San Jose / Silicon Valley (408/669 area) ────────────────────────────
  '408': { city: 'San Jose', state: 'CA', airports: [{ code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }, { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
};

export function getAirportsForZip(zip: string): NearestAirports | null {
  if (!zip || zip.length < 3) return null;
  const clean = zip.trim().replace(/\D/g, '').padStart(5, '0').slice(0, 5);
  // Layer 1: exact 5-digit match
  if (ZIP_EXACT[clean]) return ZIP_EXACT[clean];
  // Layer 2: 3-digit prefix match
  const prefix = clean.slice(0, 3);
  if (ZIP_PREFIX[prefix]) return ZIP_PREFIX[prefix];
  // No match
  return null;
}
