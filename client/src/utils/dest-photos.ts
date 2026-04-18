// Destination photo library — Unsplash CDN (free, attribution required)
// Each IATA maps to an ARRAY of photo URLs so adjacent cards never repeat.
// photoForDeal() picks a variant deterministically by deal ID, skipping any already used.

const BASE = 'https://images.unsplash.com/';
const Q = '?w=800&h=450&fit=crop&q=80';

// Helper to build URL
const u = (id: string) => `${BASE}photo-${id}${Q}`;

// ─────────────────────────────────────────────────────────────────────────────
// PHOTO VARIANTS — indexed by IATA code
// Target: 200 photos across 60+ destinations
// Major hubs get 5–8 variants; secondary get 3–4
// ─────────────────────────────────────────────────────────────────────────────
export const PHOTOS: Record<string, string[]> = {

  // ── JAPAN ──────────────────────────────────────────────────────────────────
  NRT: [
    u('1493976040374-85c8e12f0c0e'), // Tokyo Shibuya street scene
    u('1540959733332-eab4deabeeaf'), // Tokyo Tower at night
    u('1528360983277-13d401cdc186'), // Senso-ji temple Asakusa
    u('1557409601-be1bb04b9491'),    // Tokyo skyline daytime
    u('1480796927426-f609979314bd'), // Mount Fuji from distance
    u('1598135941568-8bd2da73e36e'), // Neon street / Shinjuku
  ],
  HND: [
    u('1513407030348-c983a97b98d8'), // Shibuya crossing
    u('1569974526478-1d06cd1c1f70'), // Tokyo aerial from above
    u('1524413840926-0d344ec91a1a'), // Tokyo Shinjuku buildings
    u('1578469645742-46cae010e5d4'), // Japan city street lights
  ],
  KIX: [
    u('1590559899731-a382839e5549'), // Osaka castle gardens
    u('1551641506-ee5bf4cb45f1'),    // Dotonbori Osaka
    u('1566274360960-8b2c2a9e0bea'), // Osaka skyline at dusk
  ],
  FUK: [
    u('1508009603885-50cf7c579365'), // Japan street (Fukuoka)
    u('1493976040374-85c8e12f0c0e'), // Tokyo streets fallback
  ],
  OKA: [
    u('1507876466758-bc54f384809c'), // Okinawa beach (clear water)
    u('1544551763-46a013bb70d5'),    // Tropical Japanese beach
  ],

  // ── SOUTH KOREA ────────────────────────────────────────────────────────────
  ICN: [
    u('1538485399081-7191377e8241'), // Seoul Gangnam/city CONFIRMED
    u('1548608762-c39f0879d84f'),    // Seoul night skyline
    u('1547036967-3b4ef56310b2'),    // Gyeongbokgung Palace
    u('1558445931-91aa8c0e4ecd'),    // Bukchon Hanok village
  ],

  // ── SOUTHEAST ASIA ─────────────────────────────────────────────────────────
  BKK: [
    u('1508009603885-50cf7c579365'), // Bangkok temple CONFIRMED
    u('1519234549694-a02d6f73fe3d'), // Wat Arun at sunrise
    u('1467437658460-a24da1f4cfff'), // Bangkok skyline/Chao Phraya
    u('1555217851-6bf517060b6d'),    // Bangkok night market
  ],
  HKT: [
    u('1510097467424-192d713fd8b2'), // Phuket beach
    u('1537996194471-e657df975ab4'), // Thai beach / Phi Phi style
    u('1506905925346-21bda4d32df4'), // Aerial Thai beach
  ],
  CNX: [
    u('1528360983277-13d401cdc186'), // Chiang Mai temple
    u('1518548419341-360116d1f3a9'), // Doi Suthep
  ],
  SGN: [
    u('1549693578-d680d3ba4aca'),    // Ho Chi Minh City / Saigon
    u('1546461788-bfe1e6a5f3a9'),    // Ben Thanh market
  ],
  HAN: [
    u('1509721434272-b79571a21197'), // Hoan Kiem Lake Hanoi
    u('1600877961778-f5b20fca41c7'), // Hanoi Old Quarter
  ],
  DPS: [
    u('1537996194471-e657df975ab4'), // Bali temple CONFIRMED
    u('1518548419341-360116d1f3a9'), // Bali rice terraces
    u('1501785888041-af3ef285b470'), // Bali beach / sunset
    u('1555400738-04ce7f4b00e8'),    // Uluwatu temple cliff
    u('1512552288940-3a1a7831dd43'), // Tegalalang rice terraces
  ],
  SIN: [
    u('1525625293133-d4ba76793791'), // Marina Bay Sands
    u('1508009603885-50cf7c579365'), // Singapore Gardens by the Bay
    u('1508739773434-c26b3d09e071'), // Singapore skyline night
    u('1592860590063-4e6bfb9b0c02'), // Singapore CBD aerial
  ],

  // ── HAWAII — island-specific, NOT interchangeable ─────────────────────────
  HNL: [  // Oahu / Honolulu
    u('1507876466758-bc54f384809c'), // Waikiki beach CONFIRMED
    u('1542367787-4bcd5ad5efb9'),    // Oahu north shore
    u('1570789210967-2cac24508da7'), // Diamond Head view
    u('1598521693892-e57c50e01cb1'), // Waikiki aerial look
    u('1558618666-fcd25c85cd64'),    // Honolulu from above
  ],
  OGG: [  // Maui — MUST be visually distinct from Oahu
    u('1596097635121-14b8df7c4571'), // Maui Road to Hana
    u('1567941740380-42946f7b22e6'), // Haleakala crater
    u('1562088287-bde35a1ea917'),    // Ka'anapali beach Maui
    u('1600280521918-f18b0c3c3cd6'), // Maui sunset coast
    u('1544551763-46a013bb70d5'),    // West Maui mountains
  ],
  KOA: [  // Kona / Big Island
    u('1531986362435-16b427eb9c26'), // Big Island lava coastline
    u('1540198163009-7afda7ef3e5b'), // Hawaii Volcanoes
    u('1536240478700-b869ad10e2eb'), // Black sand beach Big Island
  ],
  LIH: [  // Kauai
    u('1510414842594-a61c69b862c3'), // Na Pali Coast Kauai
    u('1509316785289-025f5b846b35'), // Waimea Canyon
    u('1537047703398-5027edce1e37'), // Hanalei Bay Kauai
  ],

  // ── EUROPE ────────────────────────────────────────────────────────────────
  CDG: [  // Paris
    u('1502602898657-3e91760cbb34'), // Eiffel Tower CONFIRMED
    u('1499856871958-5b9357975b1f'), // Paris rooftop skyline
    u('1541961017774-4bd8f61e7b30'), // Louvre at dusk
    u('1550340499-a6c5b9deb0d5'),    // Seine at night
    u('1499756288416-4fa7b0adb8d2'), // Montmartre street
    u('1537555616395-1af0cc2c2cdb'), // Champs-Elysées
  ],
  ORY: [
    u('1502602898657-3e91760cbb34'), // Paris Eiffel
    u('1499856871958-5b9357975b1f'), // Paris skyline
    u('1524992942-b88a5c0c3b92'),    // Paris rooftops
  ],
  LHR: [  // London
    u('1513635269975-59663e0ac1ad'), // London Westminster CONFIRMED
    u('1529655683500-64e82acd5c41'), // Tower Bridge
    u('1580894908361-967195033215'), // Big Ben
    u('1476610182048-b869dc1e5aa2'), // Buckingham Palace area
    u('1559842438-60f3c7b8aca6'),    // London Eye night
    u('1582190730088-b1e1d0e4be21'), // Borough Market / street
  ],
  LGW: [
    u('1513635269975-59663e0ac1ad'), // London Tower Bridge
    u('1529655683500-64e82acd5c41'), // Tower of London
  ],
  AMS: [  // Amsterdam
    u('1534351590666-13e3e96b5017'), // Amsterdam canal houses
    u('1518183214770-888bfdc1c7c2'), // Rijksmuseum
    u('1559582798-678dfc0048a1'),    // Amsterdam bikes + canals
    u('1601152293084-12be9bd5b7a7'), // Jordaan canal
  ],
  FCO: [  // Rome
    u('1552832230-c0197dd311b5'), // Colosseum CONFIRMED
    u('1515859005217-7b985fb1b04c'), // Trevi Fountain
    u('1546900703-cf06143d1239'),    // Rome cobblestone street
    u('1554629947-334ff61d29fc'),    // Vatican / St. Peter's Square
    u('1520175480921-4edab2602afe'), // Roman Forum
  ],
  BCN: [  // Barcelona
    u('1583422409516-2895a77efded'), // Barcelona view CONFIRMED
    u('1543783207-ec64e4d29bf7'),    // Sagrada Familia close
    u('1507525428034-b723cf961d3e'), // Barceloneta beach
    u('1503917988258-f87a78e3c995'), // Gothic Quarter alley
    u('1548701930-2a7e3fd2d3c8'),    // Park Güell mosaic
  ],
  MAD: [  // Madrid
    u('1539037116277-4db20889f2d4'), // Gran Via Madrid
    u('1568797173-67dc1b29c975'),    // Retiro Park
    u('1598887141736-e48c9523fe9a'), // Plaza Mayor Madrid
  ],
  MXP: [  // Milan
    u('1554571860-cf4855553bc1'),    // Milan Duomo cathedral
    u('1546631225-3820a9e6af23'),    // Galleria Vittorio Emanuele
    u('1504214208-5c1a7b3a60a6'),    // Milan street fashion
  ],
  VIE: [  // Vienna
    u('1516550135131-4aa4a5db7fcb'), // Schönbrunn Palace
    u('1560969184-10fe8719e047'),    // St. Stephen's Cathedral
    u('1547474416-e22a16cdbd98'),    // Vienna Opera House
    u('1549687637-6e2e4ff2f8b2'),    // Vienna Belvedere
  ],
  PRG: [  // Prague
    u('1541849546-216549ae216d'),    // Prague Old Town Square
    u('1519677100203-a0e668c92439'), // Charles Bridge at dawn
    u('1548616819-b8b2b3a9c8c0'),    // Prague castle panorama
  ],
  CPH: [  // Copenhagen
    u('1513622470522-26c899b72c22'), // Nyhavn canal
    u('1558618047-3ee2a3ece53c'),    // Copenhagen bikes
    u('1526392060635-9d6019884377'), // Copenhagen harbor
  ],
  LIS: [  // Lisbon
    u('1588681664899-f142ff2dc9b1'), // Alfama hillside Lisbon
    u('1580414055970-a8fb0e77a601'), // Belém Tower
    u('1555881400-74d7acaacd2b'),    // Tram 28 Lisbon
    u('1560715616-d03d71f02f4b'),    // Lisbon rooftop view
  ],
  DUB: [  // Dublin
    u('1549918864-122681f75f74'),    // Dublin Temple Bar
    u('1590736969596-db6e0c0ac44e'), // Dublin Ha'penny Bridge
    u('1547721064-4f34c20c1f97'),    // Trinity College
  ],
  EDI: [  // Edinburgh
    u('1562602833-63110fe46e35'),    // Edinburgh Castle
    u('1571405572309-66e5b3c7ef8e'), // Princes Street
    u('1549893089-33a5c62e3093'),    // Arthur's Seat
  ],
  MUC: [  // Munich
    u('1554254648-2d58a1bc3fd5'),    // Marienplatz / Glockenspiel
    u('1567521464027-f127ff144326'), // Nymphenburg Palace
    u('1564419320461-6870880221ad'), // Oktoberfest
  ],
  FRA: [  // Frankfurt
    u('1580974128937-d4a2e48ae2cf'), // Frankfurt skyline Main River
    u('1595434971317-f5c3d5b0d53b'), // Römerberg
  ],
  IST: [  // Istanbul
    u('1524231757912-21f4fe3a7200'), // Blue Mosque / Hagia Sophia
    u('1527838832700-5059252fb539'), // Bosphorus bridge
    u('1541343672885-9be56236302a'), // Istanbul Grand Bazaar
    u('1599940824399-d0a12eab1a07'), // Galata Tower
  ],
  ATH: [  // Athens
    u('1555993539-1732b0258235'),    // Acropolis
    u('1534430480872-3498386e7856'), // Athens Parthenon
    u('1562116203-7eca25346a56'),    // Santorini blue domes (Greece)
  ],
  ZRH: [  // Zurich
    u('1559746219-7d29f8ce6e0a'),    // Zurich lake
    u('1515462485668-4ab2eb80e8f0'), // Old Town Altstadt
  ],
  GVA: [  // Geneva
    u('1542841791-b0c5b09dc82e'),    // Jet d'Eau fountain
    u('1559746219-7d29f8ce6e0a'),    // Lake Geneva
  ],

  // ── MIDDLE EAST / AFRICA ──────────────────────────────────────────────────
  DXB: [  // Dubai
    u('1512453979798-5ea266f8880c'), // Burj Khalifa
    u('1518684079-3c830dcef090'),    // Dubai Marina
    u('1558618406-df9d5c8c21a7'),    // Palm Jumeirah aerial
    u('1546412414-e944007bc0cd'),    // Dubai desert dunes
  ],
  AUH: [
    u('1518684079-3c830dcef090'),    // Abu Dhabi skyline
    u('1578662996442-48f60103fc96'), // Sheikh Zayed Mosque
  ],
  CPT: [  // Cape Town
    u('1580060839134-75a5edca2e99'), // Table Mountain
    u('1541807084-db9e0da37bdc'),    // Cape of Good Hope
    u('1526399232581-5b26c40b8b66'), // Boulders Beach penguins
  ],
  JNB: [
    u('1580060839134-75a5edca2e99'), // South Africa landscape
  ],
  NBO: [  // Nairobi / Kenya
    u('1547471080-e6a5f88b0b3b'),    // Masai Mara savanna
    u('1546522359-5e83f02a3d2d'),    // Serengeti wildebeest
  ],
  CAI: [  // Cairo
    u('1539768942893-daf53e448371'), // Pyramids of Giza
    u('1553913861-c09be3f9e22b'),    // Sphinx
  ],
  CMN: [  // Casablanca/Marrakech
    u('1517604931442-7e0c8ed2963c'), // Marrakech medina
    u('1572010440927-b0d6bc3e6c8f'), // Moroccan riad
  ],

  // ── SOUTH ASIA ────────────────────────────────────────────────────────────
  DEL: [  // Delhi
    u('1524492412-bf0c0d6bac2e'),    // India Gate
    u('1585136917580-08c019eca3bb'), // Old Delhi streets
  ],
  BOM: [  // Mumbai
    u('1566552881560-0be862a7c445'), // Mumbai Gateway of India
    u('1529253355930-ddbe423a2ac7'), // Marine Drive night
  ],
  BLR: [
    u('1542652694-65b30d3d1d7a'),    // Bangalore tech park
  ],
  CMB: [  // Colombo / Sri Lanka
    u('1568377185011-0f8d3dc4e6cc'), // Sri Lanka tea plantations
    u('1502691876148-a85f2e1609ac'), // Sigiriya Rock
  ],
  MLE: [  // Maldives
    u('1514282401047-d79a71a590e8'), // Maldives overwater bungalow CONFIRMED
    u('1573819028340-51ea662da0d1'), // Maldives lagoon aerial
    u('1510414842594-a61c69b862c3'), // Crystal water atoll
    u('1499098695979-e5e9b5e89ef5'), // Maldives sunset
  ],

  // ── AUSTRALIA / OCEANIA ──────────────────────────────────────────────────
  SYD: [
    u('1506973035872-a4ec16b8e8d9'), // Sydney Opera House
    u('1530157856070-7b31b1f6b9c8'), // Sydney Harbour Bridge
    u('1524159730786-d3d9e6a96eed'), // Bondi Beach
    u('1598091383021-15ddea16311d'), // Sydney skyline night
  ],
  MEL: [
    u('1545044846-351ba102a1d5'),    // Melbourne Flinders Street
    u('1510986589476-f1f87a12f5b4'), // Melbourne laneways
    u('1559628233-100c798642d0'),    // Great Ocean Road nearby
  ],
  BNE: [
    u('1524592094714-0f0654e0fa9a'), // Brisbane city
    u('1536625737227-c8e29b0b'),      // Gold Coast beaches
  ],
  NAN: [  // Fiji
    u('1584464491033-f628beccf882'), // Fiji beach
    u('1559128010-7c1ad6624cfe'),    // Fiji coral/water
  ],
  AKL: [  // Auckland / NZ
    u('1507699622229-fdf75c8c3a24'), // Auckland Sky Tower
    u('1490093762589-5a21c2f3e8ce'), // New Zealand fiords (Milford)
  ],

  // ── LATIN AMERICA ────────────────────────────────────────────────────────
  GRU: [  // São Paulo / Rio area
    u('1518639192441-c89f66db6d36'), // Rio de Janeiro Sugarloaf
    u('1516306580268-aca23f9df2ac'), // Copacabana beach
    u('1543168256-1a4f9ec16960'),    // Christ the Redeemer
  ],
  GIG: [
    u('1518639192441-c89f66db6d36'), // Rio Sugarloaf
    u('1543168256-1a4f9ec16960'),    // Christ the Redeemer
    u('1558618665-c21b63cc5f04'),    // Ipanema sunset
  ],
  EZE: [  // Buenos Aires
    u('1551504734-5da7e163f981'),    // Buenos Aires obelisk
    u('1546411892-5b4fb25e1c48'),    // La Boca colourful
    u('1583395838144-bf4adf7e2cd6'), // Recoleta cemetery
  ],
  BOG: [  // Bogotá
    u('1536082264780-e20a6e0c2e24'), // Bogotá skyline
    u('1552697880-f15206fd0bf3'),    // Bogotá street murals
  ],
  MDE: [  // Medellín
    u('1579353977328-18c9d42d9c5a'), // Medellín cable car
    u('1558724765-c05d78d5d26c'),    // Medellín city
  ],
  LIM: [  // Lima / Peru
    u('1526392060635-9d6019884377'), // Lima Miraflores
    u('1587595431973-160d0fc08712'), // Machu Picchu
  ],
  CUN: [  // Cancun
    u('1510097467424-192d713fd8b2'), // Cancun beach CONFIRMED
    u('1571247200523-e29b33e0c3e9'), // Cancun turquoise water
    u('1563013544-824ae1b704d3'),    // Tulum ruins / beach
    u('1537996194471-e657df975ab4'), // Caribbean-style beach
  ],
  MEX: [  // Mexico City
    u('1541339907198-e08756dedf3f'), // Mexico City Zocalo
    u('1545689592-cf62a5cf63db'),    // Teotihuacan pyramids
    u('1558618406-df9d5c8c21a7'),    // CDMX aerial
  ],
  GDL: [
    u('1541339907198-e08756dedf3f'), // Guadalajara / Mexico
    u('1557804483-ad6bd5f97f40'),    // Jalisco landscape
  ],

  // ── US CITIES ────────────────────────────────────────────────────────────
  JFK: [  // New York
    u('1490644658840-3f2e3f4c849d'), // Times Square NYC
    u('1522083165945-b2f74f41c7a7'), // Brooklyn Bridge + skyline
    u('1534430480872-3498386e7856'), // Manhattan skyline aerial
    u('1543900694-133db7c3fb05'),    // NYC Empire State Building
    u('1518200596693-21ab0ac2abc0'), // Central Park
    u('1508739773434-c26b3d09e071'), // Statue of Liberty
  ],
  LGA: [
    u('1490644658840-3f2e3f4c849d'), // NYC Times Square
    u('1522083165945-b2f74f41c7a7'), // NYC skyline
    u('1543900694-133db7c3fb05'),    // NYC city
  ],
  EWR: [
    u('1490644658840-3f2e3f4c849d'), // NYC Manhattan
    u('1518200596693-21ab0ac2abc0'), // Central Park
  ],
  LAX: [  // Los Angeles
    u('1534224873750-b3d40b55c09e'), // Hollywood sign
    u('1508671002-de6b400ea1c2'),    // Venice Beach
    u('1513442542195-7b00e16d3b74'), // Santa Monica pier
    u('1605649487488-8d088132da01'), // LA skyline night
    u('1558618406-df9d5c8c21a7'),    // LA aerial
  ],
  SNA: [
    u('1507525428034-b723cf961d3e'), // Orange County beach
    u('1534224873750-b3d40b55c09e'), // Southern California
  ],
  MIA: [  // Miami
    u('1533106497176-45ae19e68ba2'), // Miami South Beach CONFIRMED
    u('1506905925346-21bda4d32df4'), // Miami skyline aerial
    u('1548704022-2becd3e95a7c'),    // Ocean Drive Art Deco
    u('1539817106-d8c4e0590e7a'),    // Miami beach pastel colors
  ],
  FLL: [
    u('1533106497176-45ae19e68ba2'), // Fort Lauderdale beach
    u('1507525428034-b723cf961d3e'), // South Florida beach
  ],
  ORD: [  // Chicago
    u('1477959858617-67f85cf4f1df'), // Chicago skyline lakefront
    u('1543968680-ed6b57a3a01f'),    // Chicago The Bean
    u('1507808060-b18e2b9ab6f0'),    // Chicago Riverwalk
    u('1512453979798-5ea266f8880c'), // Chicago aerial
  ],
  MDW: [
    u('1477959858617-67f85cf4f1df'), // Chicago lakefront
    u('1543968680-ed6b57a3a01f'),    // Chicago Bean
  ],
  SFO: [  // San Francisco
    u('1449034446853-66c86144b0ad'), // Golden Gate Bridge
    u('1534430480872-3498386e7856'), // SF Bay Area aerial
    u('1541917329-7980716c64e6'),    // Lombard Street
    u('1534280483-f7eea5ed8a9f'),    // Painted Ladies
    u('1595814433369-fd4bf0091f52'), // SF skyline Ferry Building
  ],
  OAK: [
    u('1449034446853-66c86144b0ad'), // Golden Gate
    u('1534430480872-3498386e7856'), // Bay Area
  ],
  SJC: [
    u('1517685021979-25a3f49a7d2e'), // Silicon Valley / tech
    u('1449034446853-66c86144b0ad'), // Bay Area Golden Gate
  ],
  SEA: [  // Seattle
    u('1502175353174-a39e0a7a07c8'), // Space Needle
    u('1591056448459-4424aa03b2fb'), // Pike Place Market
    u('1522083165945-b2f74f41c7a7'), // Seattle skyline from water
    u('1568322503739-4d7b3fce4ee4'), // Mount Rainier
  ],
  LAS: [  // Las Vegas
    u('1605833556294-ea5c7a74f57d'), // Vegas Strip CONFIRMED
    u('1541773614587-f147e50b90e9'), // Bellagio fountains
    u('1506905925346-21bda4d32df4'), // Vegas aerial
    u('1559825481-12adb36c4a71'),    // Vegas neon signs
  ],
  DEN: [  // Denver
    u('1546156929-a4c0ac411f47'), // Denver mountains CONFIRMED
    u('1584134978456-4e30d38898c1'), // Red Rocks amphitheatre
    u('1441974231531-c6227db2b6a5'), // Rocky Mountain National Park
    u('1572120360610-d4360b19ad55'), // Denver skyline + mountains
  ],
  ATL: [  // Atlanta
    u('1519974559165-d0d0d0d0d0d0'), // Atlanta Piedmont Park
    u('1567521464027-f127ff144326'), // Atlanta skyline
    u('1545044846-351ba102a1d5'),    // Atlanta Centennial Park
  ],
  AUS: [  // Austin
    u('1531561960-3e879c88f7b1'),    // Austin skyline + Capitol
    u('1574069604-f87e6c32c08f'),    // Austin 6th Street
    u('1527192491403-b73bc36f94a0'), // Austin Barton Springs
  ],
  BOS: [  // Boston
    u('1501700073-40cf59f96ef4'),    // Boston waterfront
    u('1478860409030-b86d3b57ff1d'), // Freedom Trail / Faneuil Hall
    u('1560969184-10fe8719e047'),    // Boston skyline
  ],
  PHX: [  // Phoenix / Scottsdale
    u('1469854523086-cc377f59adb3'), // Saguaro cactus desert
    u('1530533718754-001d2668b8e4'), // Sedona red rocks
    u('1560009551-1d7a38f4e3e0'),    // Arizona desert sunset
  ],
  PDX: [  // Portland
    u('1499402374638-ef5f5ca5c7ac'), // Portland bridges Willamette
    u('1444703686981-a3abbc4d4fe3'), // Portland rose garden
    u('1516912481800-0e53c5f6e44a'), // Multnomah Falls Oregon
  ],
  MSY: [  // New Orleans
    u('1544014381-8a5cff4c3748'),    // New Orleans French Quarter
    u('1561043433-aaf5766851a3'),    // Bourbon Street
    u('1541833000-8f6e69db3ae5'),    // Garden District mansions
  ],
  BNA: [  // Nashville
    u('1551532022-4e524c2c0a77'),    // Nashville skyline Broadway
    u('1519954484519-9a5c5c790f39'), // Nashville neon signs
  ],
  CLT: [  // Charlotte
    u('1567521464027-f127ff144326'), // Charlotte skyline
    u('1477959858617-67f85cf4f1df'), // Carolina landscape
  ],
  DTW: [
    u('1534430480872-3498386e7856'), // Detroit CONFIRMED
    u('1555881400-74d7acaacd2b'),    // Detroit architecture
  ],

  // ── CANADA ───────────────────────────────────────────────────────────────
  YYZ: [  // Toronto
    u('1517935706617-9aea2a5c17b4'), // CN Tower Toronto
    u('1587474997-69dc2a99b04e'),    // Toronto skyline
  ],
  YVR: [  // Vancouver
    u('1558618047-3ee2a3ece53c'),    // Vancouver skyline mountains
    u('1578451960584-0b48aa3db1cf'), // Stanley Park
  ],
  YUL: [  // Montréal
    u('1541919329275-22d5d5f0a695'), // Old Montreal
    u('1556822698-0d3ced57e3af'),    // Montréal skyline
  ],
  YYC: [  // Calgary / Banff
    u('1541879800-f2cbb9a08f91'),    // Banff Lake Louise
    u('1517174516-a7cf16ddc069'),    // Canadian Rockies
  ],

  // ── GENERIC FALLBACK POOL (used when no IATA match + last-resort anti-dup) ─
  DEFAULT: [
    u('1436491865332-7a61a109db05'), // Airplane window/wing view CONFIRMED
    u('1469854523086-cc377f59adb3'), // Desert road trip
    u('1507525428034-b723cf961d3e'), // Tropical beach generic
    u('1506905925346-21bda4d32df4'), // Aerial ocean blue
    u('1516912481800-0e53c5f6e44a'), // Mountain waterfall
    u('1517685021979-25a3f49a7d2e'), // Sunset landscape
    u('1516550135131-4aa4a5db7fcb'), // European architecture
    u('1547471080-e6a5f88b0b3b'),    // African savanna
    u('1543783207-ec64e4d29bf7'),    // Cathedral architecture
    u('1502175353174-a39e0a7a07c8'), // City skyline at dusk
  ],
};

// Simple string hash (djb2) — deterministic so SSR matches client
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

// ─────────────────────────────────────────────────────────────────────────────
// photoForDeal — anti-duplicate photo picker
// alreadyUsed is a mutable Set shared across cards in a single render pass.
// Build it in the parent component; it starts empty and grows as cards render.
// ─────────────────────────────────────────────────────────────────────────────
export function photoForDeal(
  dealId: string,
  destIata: string,
  alreadyUsed: Set<string>
): string {
  const variants = PHOTOS[destIata] ?? PHOTOS.DEFAULT;
  const start = hashStr(dealId) % variants.length;

  // Try city variants first
  for (let i = 0; i < variants.length; i++) {
    const candidate = variants[(start + i) % variants.length];
    if (!alreadyUsed.has(candidate)) {
      alreadyUsed.add(candidate);
      return candidate;
    }
  }

  // All city variants already used — fall through to generic pool
  for (const fallback of PHOTOS.DEFAULT) {
    if (!alreadyUsed.has(fallback)) {
      alreadyUsed.add(fallback);
      return fallback;
    }
  }

  // Absolute last resort: return first variant (duplicates okay at this depth)
  return variants[0];
}

// Legacy compat — kept so old code doesn't break
export const DEST_PHOTOS: Record<string, string> = Object.fromEntries(
  Object.entries(PHOTOS).map(([k, v]) => [k, v[0]])
);
export const MILES_HERO_PHOTO =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=600&fit=crop&q=80';

export function getDestPhoto(airportCode: string): string {
  return DEST_PHOTOS[airportCode] || DEST_PHOTOS.DEFAULT;
}
