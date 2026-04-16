// server/data/zip-airports.js
// ZIP prefix -> nearest major airports (IATA codes)
// Covers top US metro areas

const ZIP_TO_AIRPORTS = {
  '100': ['JFK', 'LGA', 'EWR'], // New York City
  '101': ['JFK', 'LGA', 'EWR'],
  '102': ['JFK', 'LGA', 'EWR'],
  '103': ['JFK', 'LGA', 'EWR'],
  '104': ['JFK', 'LGA', 'EWR'],
  '110': ['JFK', 'LGA'],
  '113': ['JFK', 'LGA'],
  '114': ['JFK', 'LGA'],
  '200': ['DCA', 'IAD', 'BWI'], // Washington DC
  '201': ['DCA', 'IAD', 'BWI'],
  '202': ['DCA', 'IAD', 'BWI'],
  '203': ['DCA', 'IAD', 'BWI'],
  '204': ['DCA', 'IAD', 'BWI'],
  '205': ['DCA', 'IAD', 'BWI'],
  '206': ['DCA', 'IAD', 'BWI'],
  '207': ['DCA', 'IAD', 'BWI'],
  '208': ['DCA', 'IAD', 'BWI'],
  '209': ['DCA', 'IAD', 'BWI'],
  '210': ['BWI', 'DCA', 'IAD'], // Baltimore
  '211': ['BWI', 'DCA'],
  '212': ['BWI', 'DCA'],
  '213': ['BWI', 'DCA'],
  '214': ['BWI', 'DCA'],
  '300': ['ATL'],               // Atlanta
  '301': ['ATL'],
  '302': ['ATL'],
  '303': ['ATL'],
  '304': ['ATL'],
  '305': ['MIA', 'FLL', 'PBI'], // Miami
  '306': ['MIA', 'FLL'],
  '307': ['MIA', 'FLL'],
  '308': ['MIA', 'FLL'],
  '331': ['MIA', 'FLL'],
  '332': ['MIA', 'FLL'],
  '333': ['MIA', 'FLL'],
  '334': ['MIA', 'FLL'],
  '350': ['BHM'],               // Birmingham AL
  '360': ['MSY'],               // New Orleans
  '370': ['BNA'],               // Nashville
  '380': ['MEM'],               // Memphis
  '385': ['MEM'],
  '390': ['JAX'],               // Jacksonville
  '400': ['CVG', 'CMH'],        // Cincinnati / Columbus
  '410': ['CLE'],               // Cleveland
  '411': ['CLE'],
  '430': ['CMH'],               // Columbus OH
  '440': ['CLE'],
  '441': ['CLE'],
  '442': ['CLE'],
  '443': ['CLE'],
  '444': ['CLE'],
  '445': ['PIT'],               // Pittsburgh
  '150': ['PIT'],
  '151': ['PIT'],
  '152': ['PIT'],
  '153': ['PIT'],
  '460': ['IND'],               // Indianapolis
  '462': ['IND'],
  '463': ['IND'],
  '480': ['DTW'],               // Detroit
  '481': ['DTW'],
  '482': ['DTW'],
  '483': ['DTW'],
  '490': ['DTW', 'GRR'],
  '491': ['DTW'],
  '600': ['ORD', 'MDW'],        // Chicago
  '601': ['ORD', 'MDW'],
  '602': ['ORD', 'MDW'],
  '603': ['ORD', 'MDW'],
  '604': ['ORD', 'MDW'],
  '606': ['ORD', 'MDW'],
  '607': ['ORD', 'MDW'],
  '608': ['ORD', 'MDW'],
  '620': ['STL'],               // St Louis
  '630': ['STL'],
  '631': ['STL'],
  '641': ['MCI'],               // Kansas City
  '650': ['MCI'],
  '660': ['MSP'],               // Minneapolis
  '700': ['MSY'],               // New Orleans
  '701': ['MSY'],
  '710': ['HOU', 'IAH'],        // Houston
  '711': ['IAH', 'HOU'],
  '730': ['OKC'],               // Oklahoma City
  '740': ['TUL'],               // Tulsa
  '750': ['DFW', 'DAL'],        // Dallas
  '751': ['DFW', 'DAL'],
  '752': ['DFW', 'DAL'],
  '753': ['DFW', 'DAL'],
  '754': ['DFW', 'DAL'],
  '760': ['DFW', 'DAL'],
  '761': ['DFW', 'DAL'],
  '762': ['DFW', 'DAL'],
  '763': ['DFW', 'DAL'],
  '764': ['DFW', 'DAL'],
  '765': ['DFW', 'DAL'],
  '766': ['DFW', 'DAL'],
  '800': ['DEN'],               // Denver
  '801': ['DEN'],
  '802': ['DEN'],
  '803': ['DEN'],
  '804': ['DEN'],
  '850': ['PHX'],               // Phoenix
  '851': ['PHX'],
  '852': ['PHX'],
  '853': ['PHX'],
  '854': ['PHX'],
  '855': ['PHX'],
  '856': ['TUS'],               // Tucson
  '900': ['LAX', 'BUR', 'LGB'], // Los Angeles
  '901': ['LAX', 'BUR'],
  '902': ['LAX'],
  '903': ['LAX'],
  '904': ['LAX'],
  '905': ['LAX', 'LGB'],
  '906': ['LAX'],
  '907': ['LAX'],
  '908': ['LAX'],
  '910': ['SNA', 'LAX'],        // Orange County
  '911': ['SAN'],               // San Diego
  '912': ['SAN'],
  '913': ['SAN'],
  '914': ['SAN'],
  '915': ['SAN'],
  '916': ['SAN'],
  '917': ['SAN'],
  '918': ['SAN'],
  '919': ['SAN'],
  '920': ['SAN'],
  '921': ['SAN'],
  '922': ['SAN'],
  '925': ['SFO', 'OAK', 'SJC'], // Bay Area
  '940': ['SFO', 'OAK', 'SJC'],
  '941': ['SFO', 'OAK'],
  '942': ['SFO', 'OAK'],
  '943': ['SFO', 'OAK'],
  '944': ['SFO', 'OAK'],
  '945': ['SFO', 'OAK'],
  '946': ['OAK', 'SFO'],
  '947': ['SFO', 'OAK'],
  '948': ['SFO'],
  '949': ['SNA', 'LAX'],
  '950': ['SJC', 'SFO'],        // Silicon Valley
  '951': ['SJC', 'SFO'],
  '952': ['SJC', 'SFO'],
  '960': ['SMF'],               // Sacramento
  '970': ['PDX'],               // Portland
  '971': ['PDX'],
  '972': ['PDX'],
  '980': ['SEA'],               // Seattle
  '981': ['SEA'],
  '982': ['SEA'],
  '983': ['SEA'],
  '984': ['SEA'],
  '985': ['SEA'],
  '986': ['SEA'],
  '987': ['SEA'],
  '020': ['BOS', 'ORH'],        // Boston
  '021': ['BOS'],
  '022': ['BOS'],
  '023': ['BOS'],
  '024': ['BOS'],
  '028': ['PVD'],               // Providence
  '029': ['PVD'],
  '060': ['BDL', 'HVN'],        // Connecticut
  '061': ['BDL'],
  '062': ['BDL'],
  '063': ['BDL'],
  '064': ['BDL'],
  '065': ['BDL'],
  '066': ['BDL'],
  '067': ['BDL'],
  '068': ['BDL'],
  '069': ['JFK', 'LGA'],
  '070': ['EWR', 'JFK'],        // New Jersey
  '071': ['EWR', 'JFK'],
  '072': ['EWR', 'JFK'],
  '073': ['EWR', 'JFK'],
  '074': ['EWR', 'JFK'],
  '075': ['EWR', 'JFK'],
  '076': ['EWR', 'PHL'],
  '077': ['EWR', 'JFK'],
  '078': ['EWR', 'JFK'],
  '079': ['EWR', 'JFK'],
  '080': ['PHL', 'EWR'],        // Philadelphia
  '081': ['PHL'],
  '082': ['PHL'],
  '083': ['PHL'],
  '084': ['PHL'],
  '085': ['PHL', 'TTN'],
  '086': ['PHL'],
  '087': ['PHL'],
  '088': ['PHL', 'EWR'],
  '089': ['PHL', 'EWR'],
  '120': ['BUF'],               // Buffalo
  '121': ['BUF'],
  '122': ['BUF'],
  '123': ['BUF'],
  '124': ['BUF'],
  '125': ['SYR'],               // Syracuse
  '130': ['SYR'],
  '131': ['SYR'],
  '132': ['SYR'],
  '133': ['SYR'],
  '140': ['ROC'],               // Rochester
  '141': ['ROC'],
  '142': ['ROC'],
  '143': ['ROC'],
  '145': ['ROC'],
};

function getAirportsFromZip(zip) {
  if (!zip) return ['JFK', 'LAX', 'ORD']; // default
  const prefix3 = zip.slice(0, 3);
  const prefix2 = zip.slice(0, 2).padStart(3, '0');
  return ZIP_TO_AIRPORTS[prefix3] || ZIP_TO_AIRPORTS[prefix2] || ['JFK', 'LAX', 'ORD'];
}

module.exports = { ZIP_TO_AIRPORTS, getAirportsFromZip };
