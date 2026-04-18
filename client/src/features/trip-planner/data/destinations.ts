// All 31 destination entries (30 cities — Tokyo has 2 airports).
// has_active_sweet_spot is computed server-side from the DB.
// This file is the STATIC fallback / type definition. Runtime data comes from
// GET /api/plan/destinations which includes has_active_sweet_spot per airport.

export interface Destination {
  name: string;           // City name
  airport: string;        // IATA code — 'FREETEXT' for user-typed destinations not in the seeded list
  country: string;
  region: string;
  has_active_sweet_spot: boolean;
  emoji?: string;
  is_freetext?: boolean;  // true when user typed a destination not in our seeded list
}

// Static emoji map for destinations
export const DESTINATION_EMOJI: Record<string, string> = {
  AMS: '🇳🇱', ATH: '🇬🇷', BCN: '🇪🇸', BKK: '🇹🇭', CDG: '🇫🇷',
  CPT: '🇿🇦', CUN: '🇲🇽', DPS: '🇮🇩', DXB: '🇦🇪', EZE: '🇦🇷',
  FCO: '🇮🇹', HKT: '🇹🇭', HND: '🇯🇵', HNL: '🇺🇸', ICN: '🇰🇷',
  IST: '🇹🇷', JTR: '🇬🇷', KEF: '🇮🇸', KIX: '🇯🇵', LHR: '🇬🇧',
  LIS: '🇵🇹', MEX: '🇲🇽', MLE: '🇲🇻', NAN: '🇫🇯', NAP: '🇮🇹',
  NRT: '🇯🇵', OGG: '🇺🇸', RAK: '🇲🇦', SIN: '🇸🇬', SYD: '🇦🇺',
  ZQN: '🇳🇿',
};

// Canonical display names for airports that need clarity
export const DESTINATION_DISPLAY: Record<string, string> = {
  KIX: 'Kyoto (via Osaka)',
  NAP: 'Amalfi Coast (via Naples)',
  JTR: 'Santorini',
  HND: 'Tokyo Haneda',
  NRT: 'Tokyo Narita',
};

export function getDisplayName(dest: Destination): string {
  return DESTINATION_DISPLAY[dest.airport] || dest.name;
}
