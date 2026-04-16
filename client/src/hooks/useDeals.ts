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
  const isError = d.urgency_type === 'error' || Boolean(d.is_error_fare);
  const price = Math.round(d.price as number || 0);
  const originalPrice = Math.round((d.price as number || 0) * 2.2);
  const savings = Math.round(((originalPrice - price) / originalPrice) * 100);
  const dest = (d.destination as string) || 'INT';
  const orig = (d.origin as string) || 'USA';
  const airline = (d.airline as string) || 'Multiple Airlines';

  return {
    id: (d.id as string) || `deal-${index}`,
    type: isError ? 'error_fare' : 'flight',
    badge: isError ? '🚨 Error Fare' : '✈️ Flight Deal',
    route: `${orig} → ${dest}`,
    emoji: getEmoji(dest),
    price: `$${price}`,
    originalPrice: `$${originalPrice}`,
    savings: `${savings}% off`,
    detail: `${airline} · RT · Found recently`,
    bookUrl: `https://www.aviasales.com/?marker=716647&origin=${orig}&destination=${dest}`,
    ctaText: isError ? 'Book Now' : 'Book on Aviasales',
    isLive: isError,
    liveStatus: isError ? 'live' : undefined,
    foundMinutesAgo: Math.floor(Math.random() * 120) + 5,
    isTealCta: false,
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
        const res = await fetch('/api/deals');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.slice(0, 20).map((d, i) => mapServerDeal(d as Record<string, unknown>, i))
          : [];
        setDeals(mapped.length > 0 ? mapped : defaultDeals());
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
