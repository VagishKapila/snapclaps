// server/data/transfer-partners.js
// Maps card identifiers to Seats.aero source names
// Seats.aero confirmed sources: aeromexico, aeroplan, alaska, american, azul, copa, delta,
// emirates, ethiopian, etihad, eurobonus, finnair, flyingblue, frontier, jetblue,
// lifemiles, lufthansa, qantas, qatar, saudia, singapore, smiles, spirit,
// turkish, united, velocity, virginatlantic

const CARD_TO_SOURCES = {
  chase_sapphire_preferred:  ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  chase_sapphire_reserve:    ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  chase_ink_preferred:       ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  chase_ink_unlimited:       ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  chase_freedom_flex:        ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  amex_platinum:             ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan', 'lifemiles', 'etihad', 'emirates'],
  amex_gold:                 ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan', 'lifemiles'],
  amex_green:                ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan'],
  amex_business_platinum:    ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan', 'lifemiles', 'etihad', 'emirates'],
  amex_everyday_preferred:   ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan'],
  capital_one_venture_x:     ['aeroplan', 'flyingblue', 'turkish', 'lifemiles', 'singapore', 'etihad'],
  capital_one_venture:       ['aeroplan', 'flyingblue', 'turkish', 'lifemiles'],
  citi_strata_premier:       ['flyingblue', 'singapore', 'turkish', 'lifemiles', 'etihad', 'qatar'],
  citi_double_cash:          ['flyingblue', 'singapore', 'turkish', 'lifemiles'],
  bilt_mastercard:           ['american', 'united', 'aeroplan', 'virginatlantic', 'flyingblue'],
  united_explorer:           ['united'],
  united_business:           ['united'],
  delta_skymiles_gold:       ['delta'],
  delta_skymiles_platinum:   ['delta'],
  alaska_visa:               ['alaska'],
  southwest_priority:        [],
  jetblue_plus:              ['jetblue'],
  american_advantage:        ['american'],
  world_of_hyatt:            [],
  hilton_honors_amex:        [],
  marriott_bonvoy:           [],
  ihg_premier:               [],
};

const CARD_DISPLAY = {
  chase_sapphire_preferred:  { name: 'Sapphire Preferred', issuer: 'Chase', currency: 'Chase UR', color: '#1A6FE5' },
  chase_sapphire_reserve:    { name: 'Sapphire Reserve', issuer: 'Chase', currency: 'Chase UR', color: '#1A6FE5' },
  chase_ink_preferred:       { name: 'Ink Business Preferred', issuer: 'Chase', currency: 'Chase UR', color: '#1A6FE5' },
  chase_ink_unlimited:       { name: 'Ink Business Unlimited', issuer: 'Chase', currency: 'Chase UR', color: '#1A6FE5' },
  chase_freedom_flex:        { name: 'Freedom Flex', issuer: 'Chase', currency: 'Chase UR', color: '#1A6FE5' },
  amex_platinum:             { name: 'Platinum', issuer: 'Amex', currency: 'Amex MR', color: '#808080' },
  amex_gold:                 { name: 'Gold', issuer: 'Amex', currency: 'Amex MR', color: '#C9963F' },
  amex_green:                { name: 'Green', issuer: 'Amex', currency: 'Amex MR', color: '#3F7F3F' },
  amex_business_platinum:    { name: 'Business Platinum', issuer: 'Amex', currency: 'Amex MR', color: '#808080' },
  amex_everyday_preferred:   { name: 'Everyday Preferred', issuer: 'Amex', currency: 'Amex MR', color: '#0077CC' },
  capital_one_venture_x:     { name: 'Venture X', issuer: 'Capital One', currency: 'Capital One Miles', color: '#D03027' },
  capital_one_venture:       { name: 'Venture', issuer: 'Capital One', currency: 'Capital One Miles', color: '#D03027' },
  citi_strata_premier:       { name: 'Strata Premier', issuer: 'Citi', currency: 'Citi TY', color: '#003B8E' },
  citi_double_cash:          { name: 'Double Cash', issuer: 'Citi', currency: 'Citi TY', color: '#003B8E' },
  bilt_mastercard:           { name: 'Bilt Mastercard', issuer: 'Bilt', currency: 'Bilt Points', color: '#FF5722' },
  united_explorer:           { name: 'United Explorer', issuer: 'Chase', currency: 'United Miles', color: '#1A6FE5' },
  united_business:           { name: 'United Business', issuer: 'Chase', currency: 'United Miles', color: '#1A6FE5' },
  delta_skymiles_gold:       { name: 'Delta Gold', issuer: 'Amex', currency: 'Delta SkyMiles', color: '#E31837' },
  delta_skymiles_platinum:   { name: 'Delta Platinum', issuer: 'Amex', currency: 'Delta SkyMiles', color: '#E31837' },
  alaska_visa:               { name: 'Alaska Airlines Visa', issuer: 'Bank of America', currency: 'Alaska Miles', color: '#0052CC' },
  southwest_priority:        { name: 'Southwest Priority', issuer: 'Chase', currency: 'SW Rapid Rewards', color: '#304CB2' },
  jetblue_plus:              { name: 'JetBlue Plus', issuer: 'Barclays', currency: 'JetBlue Points', color: '#003876' },
  american_advantage:        { name: 'AAdvantage Platinum', issuer: 'Citi', currency: 'AA Miles', color: '#004B87' },
  world_of_hyatt:            { name: 'World of Hyatt', issuer: 'Chase', currency: 'Hyatt Points', color: '#6B4C9A' },
  hilton_honors_amex:        { name: 'Hilton Honors', issuer: 'Amex', currency: 'Hilton Points', color: '#1A5E8A' },
  marriott_bonvoy:           { name: 'Marriott Bonvoy Boundless', issuer: 'Chase', currency: 'Marriott Points', color: '#8B1A1A' },
  ihg_premier:               { name: 'IHG One Rewards Premier', issuer: 'Chase', currency: 'IHG Points', color: '#006A4E' },
};

function getTransferPartners(cardIds) {
  const sources = new Set();
  for (const cardId of cardIds) {
    const cardSources = CARD_TO_SOURCES[cardId] || [];
    for (const src of cardSources) sources.add(src);
  }
  return Array.from(sources);
}

function getCardsForSource(source, cards) {
  const matching = cards.filter(c => (CARD_TO_SOURCES[c.card_id] || []).includes(source));
  const total_points = matching.reduce((sum, c) => sum + (c.points_balance || 0), 0);
  return { cards: matching.map(c => c.card_id), total_points };
}

function getAllCards() {
  return Object.entries(CARD_DISPLAY).map(([id, info]) => ({
    id,
    ...info,
    sources: CARD_TO_SOURCES[id] || [],
  }));
}

module.exports = { CARD_TO_SOURCES, CARD_DISPLAY, getTransferPartners, getCardsForSource, getAllCards };
