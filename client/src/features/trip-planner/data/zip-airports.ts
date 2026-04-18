// ZIP → nearest airports lookup (US only — top 50 metro areas).
// Returns up to 3 airports sorted by proximity.
// Unknown ZIPs fall through to the fallback message prompt.

export interface NearestAirports {
  airports: { code: string; name: string; city: string }[];
  city: string;
  state: string;
}

const ZIP_MAP: Record<string, NearestAirports> = {
  // New York
  '10001': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark', city: 'Newark' }] },
  '10002': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark', city: 'Newark' }] },
  '10003': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark', city: 'Newark' }] },
  '10014': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark', city: 'Newark' }] },
  // Los Angeles
  '90001': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '90210': { city: 'Beverly Hills', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '90036': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  // San Francisco Bay Area
  '94102': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '94105': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '94110': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '94025': { city: 'Menlo Park', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }] },
  // Chicago
  '60601': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '60611': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  // Houston
  '77001': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '77002': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  // Dallas
  '75201': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '75202': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  // Miami
  '33101': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }, { code: 'PBI', name: 'Palm Beach Intl', city: 'West Palm Beach' }] },
  '33139': { city: 'Miami Beach', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '33131': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  // Boston
  '02101': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }, { code: 'PVD', name: 'T.F. Green', city: 'Providence' }, { code: 'MHT', name: 'Manchester-Boston Regional', city: 'Manchester' }] },
  '02108': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }, { code: 'PVD', name: 'T.F. Green', city: 'Providence' }] },
  // Washington DC
  '20001': { city: 'Washington', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore' }] },
  '20005': { city: 'Washington', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore' }] },
  // Seattle
  '98101': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }, { code: 'BFI', name: 'King County Intl', city: 'Seattle' }] },
  '98109': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  // Phoenix
  '85001': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }, { code: 'AZA', name: 'Phoenix-Mesa Gateway', city: 'Mesa' }] },
  '85004': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }, { code: 'AZA', name: 'Phoenix-Mesa Gateway', city: 'Mesa' }] },
  // Denver
  '80201': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '80202': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  // Atlanta
  '30301': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '30303': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  // Las Vegas
  '89101': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '89109': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  // Minneapolis
  '55401': { city: 'Minneapolis', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  // Portland
  '97201': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '97202': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  // San Diego
  '92101': { city: 'San Diego', state: 'CA', airports: [{ code: 'SAN', name: 'San Diego Intl', city: 'San Diego' }, { code: 'TIJ', name: 'Tijuana Intl', city: 'Tijuana' }] },
  // Detroit
  '48201': { city: 'Detroit', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  // Philadelphia
  '19101': { city: 'Philadelphia', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }, { code: 'PNE', name: 'Northeast Philadelphia', city: 'Philadelphia' }] },
  '19102': { city: 'Philadelphia', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  // Austin
  '78701': { city: 'Austin', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },
  '78702': { city: 'Austin', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },
  // Nashville
  '37201': { city: 'Nashville', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  // Charlotte
  '28201': { city: 'Charlotte', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },
  // New Orleans
  '70112': { city: 'New Orleans', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  // Baltimore
  '21201': { city: 'Baltimore', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }] },
  // Salt Lake City
  '84101': { city: 'Salt Lake City', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  // San Antonio
  '78201': { city: 'San Antonio', state: 'TX', airports: [{ code: 'SAT', name: 'San Antonio Intl', city: 'San Antonio' }] },
};

// Prefix-based lookup: match first 3 digits for broader coverage
const ZIP_PREFIX_MAP: Record<string, NearestAirports> = {
  '100': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '101': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '102': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '103': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '104': { city: 'New York', state: 'NY', airports: [{ code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }, { code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }] },
  '070': { city: 'Newark', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }, { code: 'LGA', name: 'LaGuardia', city: 'New York' }] },
  '071': { city: 'New Jersey', state: 'NJ', airports: [{ code: 'EWR', name: 'Newark Liberty Intl', city: 'Newark' }, { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York' }] },
  '900': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }] },
  '902': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'BUR', name: 'Hollywood Burbank', city: 'Burbank' }] },
  '906': { city: 'Los Angeles', state: 'CA', airports: [{ code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles' }, { code: 'LGB', name: 'Long Beach', city: 'Long Beach' }] },
  '941': { city: 'San Francisco', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '940': { city: 'San Francisco Bay Area', state: 'CA', airports: [{ code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco' }, { code: 'OAK', name: 'Oakland Intl', city: 'Oakland' }, { code: 'SJC', name: 'San Jose Intl', city: 'San Jose' }] },
  '606': { city: 'Chicago', state: 'IL', airports: [{ code: 'ORD', name: "O'Hare Intl", city: 'Chicago' }, { code: 'MDW', name: 'Midway Intl', city: 'Chicago' }] },
  '770': { city: 'Houston', state: 'TX', airports: [{ code: 'IAH', name: 'George Bush Intercontinental', city: 'Houston' }, { code: 'HOU', name: 'William P. Hobby', city: 'Houston' }] },
  '752': { city: 'Dallas', state: 'TX', airports: [{ code: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas' }, { code: 'DAL', name: 'Love Field', city: 'Dallas' }] },
  '331': { city: 'Miami', state: 'FL', airports: [{ code: 'MIA', name: 'Miami Intl', city: 'Miami' }, { code: 'FLL', name: 'Fort Lauderdale-Hollywood', city: 'Fort Lauderdale' }] },
  '021': { city: 'Boston', state: 'MA', airports: [{ code: 'BOS', name: 'Logan Intl', city: 'Boston' }] },
  '200': { city: 'Washington', state: 'DC', airports: [{ code: 'DCA', name: 'Reagan National', city: 'Arlington' }, { code: 'IAD', name: 'Dulles Intl', city: 'Dulles' }, { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore' }] },
  '981': { city: 'Seattle', state: 'WA', airports: [{ code: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle' }] },
  '850': { city: 'Phoenix', state: 'AZ', airports: [{ code: 'PHX', name: 'Phoenix Sky Harbor', city: 'Phoenix' }] },
  '802': { city: 'Denver', state: 'CO', airports: [{ code: 'DEN', name: 'Denver Intl', city: 'Denver' }] },
  '303': { city: 'Atlanta', state: 'GA', airports: [{ code: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta' }] },
  '891': { city: 'Las Vegas', state: 'NV', airports: [{ code: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas' }] },
  '554': { city: 'Minneapolis', state: 'MN', airports: [{ code: 'MSP', name: 'Minneapolis-Saint Paul Intl', city: 'Minneapolis' }] },
  '972': { city: 'Portland', state: 'OR', airports: [{ code: 'PDX', name: 'Portland Intl', city: 'Portland' }] },
  '921': { city: 'San Diego', state: 'CA', airports: [{ code: 'SAN', name: 'San Diego Intl', city: 'San Diego' }] },
  '482': { city: 'Detroit', state: 'MI', airports: [{ code: 'DTW', name: 'Detroit Metropolitan Wayne County', city: 'Detroit' }] },
  '191': { city: 'Philadelphia', state: 'PA', airports: [{ code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia' }] },
  '787': { city: 'Austin', state: 'TX', airports: [{ code: 'AUS', name: 'Austin-Bergstrom Intl', city: 'Austin' }] },
  '372': { city: 'Nashville', state: 'TN', airports: [{ code: 'BNA', name: 'Nashville Intl', city: 'Nashville' }] },
  '282': { city: 'Charlotte', state: 'NC', airports: [{ code: 'CLT', name: 'Charlotte Douglas Intl', city: 'Charlotte' }] },
  '701': { city: 'New Orleans', state: 'LA', airports: [{ code: 'MSY', name: 'Louis Armstrong New Orleans Intl', city: 'New Orleans' }] },
  '212': { city: 'Baltimore', state: 'MD', airports: [{ code: 'BWI', name: 'Baltimore/Washington Intl', city: 'Baltimore' }, { code: 'DCA', name: 'Reagan National', city: 'Arlington' }] },
  '841': { city: 'Salt Lake City', state: 'UT', airports: [{ code: 'SLC', name: 'Salt Lake City Intl', city: 'Salt Lake City' }] },
  '782': { city: 'San Antonio', state: 'TX', airports: [{ code: 'SAT', name: 'San Antonio Intl', city: 'San Antonio' }] },
};

export function getAirportsForZip(zip: string): NearestAirports | null {
  if (!zip || zip.length < 3) return null;
  const clean = zip.trim().replace(/\D/g, '').slice(0, 5);
  // Exact match first
  if (ZIP_MAP[clean]) return ZIP_MAP[clean];
  // 3-digit prefix match
  if (clean.length >= 3 && ZIP_PREFIX_MAP[clean.slice(0, 3)]) return ZIP_PREFIX_MAP[clean.slice(0, 3)];
  return null;
}
