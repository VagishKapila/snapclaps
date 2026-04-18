import { useState, useEffect } from 'react';
import type { Deal } from '../types';
import { MOCK_DEALS } from '../lib/constants';

// Map IATA code → country flag emoji
const IATA_EMOJI: Record<string, string> = {
  MXP:'🇮🇹', FCO:'🇮🇹', LHR:'🇬🇧', CDG:'🇫🇷', NRT:'🇯🇵', HND:'🇯🇵',
  DPS:'🇮🇩', CUN:'🇲🇽', DXB:'🇦🇪', BKK:'🇹🇭', SIN:'🇸🇬', HKG:'🇭🇰',
  AMS:'🇳🇱', BCN:'🇪🇸', MAD:'🇪🇸', FRA:'🇩🇪', ZRH:'🇨🇭', VIE:'🇦🇹',
  LIS:'🇵🇹', ATH:'🇬🇷', SYD:'🇦🇺', MEL:'🇦🇺', GRU:'🇧🇷', EZE:'🇦🇷',
  YYZ:'🇨🇦', YVR:'🇨🇦', ICN:'🇰🇷', DEL:'🇮🇳', BOM:'🇮🇳', CAI:'🇪🇬',
  CPT:'🇿🇦', JNB:'🇿🇦', MEX:'🇲🇽', BOG:'🇨🇴', LIM:'🇵🇪', SCL:'🇨🇱',
  CMN:'🇲🇦', DAD:'🇻🇳', SGN:'🇻🇳', HAN:'🇻🇳', KUL:'🇲🇾', MNL:'🇵🇭',
  CGK:'🇮🇩', ADD:'🇪🇹', NBO:'🇰🇪', ACC:'🇬🇭', LAX:'🇺🇸', JFK:'🇺🇸',
  ORD:'🇺🇸', MIA:'🇺🇸', SFO:'🇺🇸', SEA:'🇺🇸', BOS:'🇺🇸', DFW:'🇺🇸',
};

function getEmoji(iata: string): string {
  return IATA_EMOJI[iata] || '✈️';
}

function mapServerDeal(d: Record<string, unknown>, index: number): Deal {
  const isError = d.urgency_type === 'error' || d.urgency_type === 'timer' || Boolean(d.is_error_fare);

  // deal_price and normal_price come as strings from the DB — convert to number
  const rawPrice = Number(d.deal_price ?? d.price ?? 0);
  const price = Math.round(rawPrice);
  const rawNormal = Number(d.normal_price ?? d.original_price ?? 0);
  const originalPrice = rawNormal > 0 ? Math.round(rawNormal) : Math.round(rawPrice * 2.2);
  // savings_pct also comes as a string
  const savingsPct = d.savings_pct ? Math.round(Number(d.savings_pct)) :
    (originalPrice > 0 ? Math.round(((originalPrice - price) / originalPrice) * 100) : 55);

  const dest = (d.destination_airport as string) || (d.destination as string) || 'INT';
  const orig = (d.origin_airport as string) || (d.origin as string) || 'USA';
  const airline = (d.airline as string) || 'Multiple Airlines';

  // Use the pre-built affiliate_url with marker already embedded, else construct one
  const bookUrl = (() => {
    const aff = d.affiliate_url as string;
    if (aff && aff.includes('aviasales')) return aff;
    const depRaw = (d.departure_date as string) || '';
    const depDate = depRaw ? depRaw.slice(0, 10) : (() => {
      const dt = new Date(); dt.setMonth(dt.getMonth() + 2);
      return dt.toISOString().slice(0, 10);
    })();
    const retDate = (() => {
      const dt = new Date(depDate); dt.setDate(dt.getDate() + 10);
      return dt.toISOString().slice(0, 10);
    })();
    return `https://www.aviasales.com/?marker=716647&origin=${orig}&destination=${dest}&depart_date=${depDate}&return_date=${retDate}`;
  })();

  // Determine deal type (flight vs hotel)
  const dealType = (d.type as string) === 'hotel' ? 'hotel' : (isError ? 'error_fare' : 'flight');
  const isHotel = dealType === 'hotel';

  // Hotel-specific fields
  const hotelName = (d.hotel_name as string) || undefined;
  const hotelCity = (d.hotel_city as string) || undefined;
  const nights = d.nights ? Number(d.nights) : undefined;

  // Build route label
  const routeLabel = isHotel
    ? `${hotelCity || dest} · ${nights ? `${nights} nights` : 'Stay'}`
    : `${orig} → ${dest}`;

  // detail line
  const detailLine = isHotel
    ? `${hotelName || 'Hotel'} · ${nights ? `${nights} nights` : ''} · ${(d.check_in as string || '').slice(0, 10)}`
    : `${airline} · RT · Found recently`;

  return {
    id: (d.id as string) || `deal-${index}`,
    type: dealType as Deal['type'],
    badge: isHotel ? '🏨 Hotel Deal' : (isError ? '🚨 Error Fare' : '✈️ Flight Deal'),
    route: routeLabel,
    emoji: isHotel ? '🏨' : getEmoji(dest),
    price: `$${price}`,
    originalPrice: `$${originalPrice}`,
    savings: `${savingsPct}% off`,
    detail: detailLine,
    bookUrl,
    ctaText: isHotel ? 'Book Hotel' : (isError ? 'Book Now' : 'Book on Aviasales'),
    isLive: isError,
    liveStatus: isError ? 'live' : undefined,
    foundMinutesAgo: Math.floor(Math.random() * 120) + 5,
    isTealCta: isHotel,
    expiresAt: (d.expires_at as string) || null,
    typicalExpiryHours: d.typical_expiry_hours ? Number(d.typical_expiry_hours) : null,
    source: (d.source as string) || undefined,
    hotelName,
    hotelStars: d.hotel_stars ? Number(d.hotel_stars) : undefined,
    hotelCity,
    nights,
    checkIn: (d.check_in as string) || undefined,
    checkOut: (d.check_out as string) || undefined,
  };
}

interface UseDealsResult {
  deals: Deal[];
  errorFares: Deal[];
  flights: Deal[];
  loading: boolean;
  error: string | null;
}

export function useDeals(): UseDealsResult {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/deals?limit=30');
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        // API returns { data: [...], count: N }
        const items = Array.isArray(json) ? json : (json.data || []);
        const mapped = items
          .filter((d: Record<string, unknown>) => (d.deal_price || d.price) && (d.destination_airport || d.destination) && d.id !== 'airhelp-evergreen' && !String(d.id || '').includes('evergreen'))
          .slice(0, 20)
          .map((d: Record<string, unknown>, i: number) => mapServerDeal(d, i));
        setDeals(mapped.length >= 2 ? mapped : defaultDeals());
      } catch {
        setDeals(defaultDeals());
        setError(null); // silently use mock data if API fails
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const errorFares = deals.filter(d => d.type === 'error_fare');
  const flights = deals.filter(d => d.type === 'flight');

  return { deals, errorFares, flights, loading, error };
}

function defaultDeals(): Deal[] {
  return [
    ...MOCK_DEALS.errorFares as Deal[],
    ...MOCK_DEALS.flights as Deal[],
  ];
}
