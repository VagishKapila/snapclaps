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
