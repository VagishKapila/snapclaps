export interface ZipLocation {
  city: string;
  airports: string[];
}

export const ZIP_AIRPORTS: Record<string, ZipLocation> = {
  // California
  '94': { city: 'San Francisco, CA', airports: ['SFO', 'OAK', 'SJC'] },
  '95': { city: 'San Jose, CA', airports: ['SJC', 'SFO', 'OAK'] },
  '900': { city: 'Los Angeles, CA', airports: ['LAX', 'BUR', 'SNA'] },
  '901': { city: 'Los Angeles, CA', airports: ['LAX', 'BUR', 'SNA'] },
  '902': { city: 'Los Angeles, CA', airports: ['LAX', 'SNA', 'BUR'] },
  '917': { city: 'Burbank, CA', airports: ['BUR', 'LAX'] },
  '926': { city: 'Orange County, CA', airports: ['SNA', 'LAX'] },
  '921': { city: 'San Diego, CA', airports: ['SAN', 'LAX'] },
  '958': { city: 'Sacramento, CA', airports: ['SMF', 'OAK', 'SFO'] },
  // New York
  '100': { city: 'New York, NY', airports: ['JFK', 'EWR', 'LGA'] },
  '101': { city: 'New York, NY', airports: ['JFK', 'EWR', 'LGA'] },
  '102': { city: 'New York, NY', airports: ['JFK', 'LGA', 'EWR'] },
  '103': { city: 'New York, NY', airports: ['JFK', 'LGA', 'EWR'] },
  '104': { city: 'Bronx, NY', airports: ['LGA', 'JFK', 'EWR'] },
  '110': { city: 'Queens, NY', airports: ['JFK', 'LGA', 'EWR'] },
  '112': { city: 'Brooklyn, NY', airports: ['JFK', 'LGA', 'EWR'] },
  // Illinois
  '606': { city: 'Chicago, IL', airports: ['ORD', 'MDW'] },
  '607': { city: 'Chicago, IL', airports: ['ORD', 'MDW'] },
  '608': { city: 'Chicago, IL', airports: ['ORD', 'MDW'] },
  // Florida
  '331': { city: 'Miami, FL', airports: ['MIA', 'FLL'] },
  '332': { city: 'Miami, FL', airports: ['MIA', 'FLL'] },
  '333': { city: 'Fort Lauderdale, FL', airports: ['FLL', 'MIA'] },
  '328': { city: 'Orlando, FL', airports: ['MCO', 'TPA'] },
  '337': { city: 'Tampa, FL', airports: ['TPA', 'MCO'] },
  // Georgia
  '303': { city: 'Atlanta, GA', airports: ['ATL'] },
  '304': { city: 'Atlanta, GA', airports: ['ATL'] },
  // Texas
  '752': { city: 'Dallas, TX', airports: ['DFW', 'DAL'] },
  '753': { city: 'Dallas, TX', airports: ['DFW', 'DAL'] },
  '770': { city: 'Houston, TX', airports: ['IAH', 'HOU'] },
  '787': { city: 'Austin, TX', airports: ['AUS'] },
  // Washington
  '981': { city: 'Seattle, WA', airports: ['SEA'] },
  '982': { city: 'Seattle, WA', airports: ['SEA'] },
  // Massachusetts
  '021': { city: 'Boston, MA', airports: ['BOS'] },
  '022': { city: 'Boston, MA', airports: ['BOS'] },
  // Colorado
  '802': { city: 'Denver, CO', airports: ['DEN'] },
  '800': { city: 'Denver, CO', airports: ['DEN'] },
  // Nevada
  '891': { city: 'Las Vegas, NV', airports: ['LAS'] },
  // Washington DC
  '200': { city: 'Washington DC', airports: ['DCA', 'IAD', 'BWI'] },
  '201': { city: 'Washington DC', airports: ['DCA', 'IAD', 'BWI'] },
  '202': { city: 'Washington DC', airports: ['DCA', 'IAD', 'BWI'] },
  // Arizona
  '850': { city: 'Phoenix, AZ', airports: ['PHX'] },
  '852': { city: 'Phoenix, AZ', airports: ['PHX'] },
  // Michigan
  '482': { city: 'Detroit, MI', airports: ['DTW'] },
  '483': { city: 'Detroit, MI', airports: ['DTW'] },
  // Minnesota
  '554': { city: 'Minneapolis, MN', airports: ['MSP'] },
  '551': { city: 'Minneapolis, MN', airports: ['MSP'] },
  // Oregon
  '972': { city: 'Portland, OR', airports: ['PDX'] },
  // Utah
  '841': { city: 'Salt Lake City, UT', airports: ['SLC'] },
  // Tennessee
  '372': { city: 'Nashville, TN', airports: ['BNA'] },
  // North Carolina
  '276': { city: 'Raleigh, NC', airports: ['RDU'] },
  '277': { city: 'Raleigh, NC', airports: ['RDU'] },
};

export function lookupZip(zip: string): ZipLocation | null {
  const p3 = zip.substring(0, 3);
  const p2 = zip.substring(0, 2);
  return ZIP_AIRPORTS[p3] || ZIP_AIRPORTS[p2] || null;
}

// ── City-name lookup (2F) ────────────────────────────────────────────────────
// Keys are lowercase. Aliases → canonical ZipLocation.
const CITY_NAMES: Record<string, ZipLocation> = {
  'new york':        { city: 'New York, NY',        airports: ['JFK', 'EWR', 'LGA'] },
  'nyc':             { city: 'New York, NY',        airports: ['JFK', 'EWR', 'LGA'] },
  'brooklyn':        { city: 'New York, NY',        airports: ['JFK', 'LGA', 'EWR'] },
  'bronx':           { city: 'New York, NY',        airports: ['LGA', 'JFK', 'EWR'] },
  'queens':          { city: 'New York, NY',        airports: ['JFK', 'LGA', 'EWR'] },
  'manhattan':       { city: 'New York, NY',        airports: ['JFK', 'EWR', 'LGA'] },
  'san francisco':   { city: 'San Francisco, CA',   airports: ['SFO', 'OAK', 'SJC'] },
  'sf':              { city: 'San Francisco, CA',   airports: ['SFO', 'OAK', 'SJC'] },
  'bay area':        { city: 'San Francisco, CA',   airports: ['SFO', 'OAK', 'SJC'] },
  'oakland':         { city: 'San Francisco, CA',   airports: ['OAK', 'SFO', 'SJC'] },
  'san jose':        { city: 'San Jose, CA',        airports: ['SJC', 'SFO', 'OAK'] },
  'san diego':       { city: 'San Diego, CA',       airports: ['SAN'] },
  'los angeles':     { city: 'Los Angeles, CA',     airports: ['LAX', 'BUR', 'SNA'] },
  'la':              { city: 'Los Angeles, CA',     airports: ['LAX', 'BUR', 'SNA'] },
  'lax':             { city: 'Los Angeles, CA',     airports: ['LAX', 'BUR', 'SNA'] },
  'burbank':         { city: 'Burbank, CA',         airports: ['BUR', 'LAX'] },
  'orange county':   { city: 'Orange County, CA',   airports: ['SNA', 'LAX'] },
  'sacramento':      { city: 'Sacramento, CA',      airports: ['SMF', 'OAK', 'SFO'] },
  'chicago':         { city: 'Chicago, IL',         airports: ['ORD', 'MDW'] },
  'miami':           { city: 'Miami, FL',           airports: ['MIA', 'FLL'] },
  'fort lauderdale': { city: 'Fort Lauderdale, FL', airports: ['FLL', 'MIA'] },
  'ft lauderdale':   { city: 'Fort Lauderdale, FL', airports: ['FLL', 'MIA'] },
  'orlando':         { city: 'Orlando, FL',         airports: ['MCO'] },
  'tampa':           { city: 'Tampa, FL',           airports: ['TPA', 'MCO'] },
  'atlanta':         { city: 'Atlanta, GA',         airports: ['ATL'] },
  'dallas':          { city: 'Dallas, TX',          airports: ['DFW', 'DAL'] },
  'houston':         { city: 'Houston, TX',         airports: ['IAH', 'HOU'] },
  'austin':          { city: 'Austin, TX',          airports: ['AUS'] },
  'seattle':         { city: 'Seattle, WA',         airports: ['SEA'] },
  'boston':          { city: 'Boston, MA',          airports: ['BOS'] },
  'denver':          { city: 'Denver, CO',          airports: ['DEN'] },
  'las vegas':       { city: 'Las Vegas, NV',       airports: ['LAS'] },
  'vegas':           { city: 'Las Vegas, NV',       airports: ['LAS'] },
  'washington':      { city: 'Washington DC',       airports: ['DCA', 'IAD', 'BWI'] },
  'washington dc':   { city: 'Washington DC',       airports: ['DCA', 'IAD', 'BWI'] },
  'dc':              { city: 'Washington DC',       airports: ['DCA', 'IAD', 'BWI'] },
  'phoenix':         { city: 'Phoenix, AZ',         airports: ['PHX'] },
  'detroit':         { city: 'Detroit, MI',         airports: ['DTW'] },
  'minneapolis':     { city: 'Minneapolis, MN',     airports: ['MSP'] },
  'portland':        { city: 'Portland, OR',        airports: ['PDX'] },
  'salt lake city':  { city: 'Salt Lake City, UT',  airports: ['SLC'] },
  'salt lake':       { city: 'Salt Lake City, UT',  airports: ['SLC'] },
  'nashville':       { city: 'Nashville, TN',       airports: ['BNA'] },
  'raleigh':         { city: 'Raleigh, NC',         airports: ['RDU'] },
};

/**
 * Returns 0–N ZipLocation matches for a city-name query.
 * - 0: not found
 * - 1: unambiguous match — use it
 * - 2+: caller should show disambiguation dropdown
 */
export function lookupCity(query: string): ZipLocation[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  // Exact match — fastest path
  if (CITY_NAMES[q]) return [CITY_NAMES[q]];

  // Collect all keys that start with the query OR whose city string starts with it
  const results: ZipLocation[] = [];
  const seenCities = new Set<string>();

  for (const [key, loc] of Object.entries(CITY_NAMES)) {
    if (key.startsWith(q) || loc.city.toLowerCase().startsWith(q)) {
      if (!seenCities.has(loc.city)) {
        seenCities.add(loc.city);
        results.push(loc);
      }
    }
  }

  // If still empty, try substring match (e.g., "jose" finds "san jose")
  if (results.length === 0) {
    for (const [key, loc] of Object.entries(CITY_NAMES)) {
      if (key.includes(q) || loc.city.toLowerCase().includes(q)) {
        if (!seenCities.has(loc.city)) {
          seenCities.add(loc.city);
          results.push(loc);
        }
      }
    }
  }

  return results;
}
