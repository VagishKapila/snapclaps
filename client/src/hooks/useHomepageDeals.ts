import { useState, useEffect } from 'react';
import type { HomepageDeal } from '../components/DealCardV2';
import { getAirportCity, isDomestic } from '../utils/airport-cities';

// Map server response row → HomepageDeal
function mapToHomepageDeal(d: Record<string, unknown>, index: number): HomepageDeal | null {
  const rawPrice = Number(d.deal_price ?? d.price ?? 0);
  const price = Math.round(rawPrice);
  if (price <= 0) return null;

  const rawNormal = Number(d.normal_price ?? d.original_price ?? 0);
  const originalPrice = rawNormal > price ? Math.round(rawNormal) : Math.round(price * 2.2);
  if (originalPrice <= price) return null;

  const dest = String(d.destination_airport || d.destination || '');
  const orig = String(d.origin_airport || d.origin || '');
  const dealType = String(d.type || d.deal_type || 'flight');
  const isHotel = dealType === 'hotel';
  const isError = d.urgency_type === 'error' || Boolean(d.is_error_fare);

  // booking_url: prefer affiliate_url from Travelpayouts, else existing booking_url
  let bookingUrl = String(d.affiliate_url || d.booking_url || '');
  if (!bookingUrl || bookingUrl === '#') {
    bookingUrl = `https://www.aviasales.com/?marker=716647&origin=${orig}&destination=${dest}`;
  }
  // Ensure marker is present
  if (!bookingUrl.includes('marker=716647')) {
    bookingUrl += (bookingUrl.includes('?') ? '&' : '?') + 'marker=716647';
  }

  // Effective expiry: prefer explicit expires_at, fall back to found_at + typical_expiry_hours
  let effectiveExpiry: string | null = null;
  if (d.effective_expiry) {
    effectiveExpiry = String(d.effective_expiry);
  } else if (d.expires_at) {
    effectiveExpiry = String(d.expires_at);
  } else if (d.found_at && d.typical_expiry_hours) {
    const base = new Date(String(d.found_at));
    base.setHours(base.getHours() + Number(d.typical_expiry_hours));
    effectiveExpiry = base.toISOString();
  }

  // meta_line: airline + date if available
  const airline = String(d.airline || 'Multiple Airlines');
  const depDate = String(d.departure_date || '').slice(0, 10);
  const metaLine = isHotel
    ? `${String(d.hotel_city || getAirportCity(dest))} · ${d.nights ? `${d.nights} nights` : 'Stay'}`
    : `${airline}${depDate ? ` · ${depDate}` : ''} · RT`;

  const sourceName = String(d.source || d.source_name || 'Aviasales');

  return {
    id: String(d.id || `deal-${index}`),
    deal_type: isHotel ? 'hotel' : 'flight',
    badge_type: isHotel ? 'hotel' : (isError ? 'error' : 'deal'),
    badge_label: isHotel ? 'Hotel' : (isError ? 'Error Fare' : 'Deal'),
    destination_airport: dest,
    origin_city: getAirportCity(orig) || orig,
    destination_city: getAirportCity(dest) || dest,
    price,
    original_price: originalPrice,
    meta_line: metaLine,
    booking_url: bookingUrl,
    source_name: sourceName,
    effective_expiry: effectiveExpiry,
    hotel_name: d.hotel_name ? String(d.hotel_name) : undefined,
    hotel_stars: d.hotel_stars ? Number(d.hotel_stars) : undefined,
    is_domestic: isDomestic(dest),
  };
}

interface HomepageDealsResult {
  domestic: HomepageDeal[];
  international: HomepageDeal[];
  hotels: HomepageDeal[];
  loading: boolean;
  error: string | null;
}

export function useHomepageDeals(airports: string[] | null): HomepageDealsResult {
  const [domestic, setDomestic] = useState<HomepageDeal[]>([]);
  const [international, setInternational] = useState<HomepageDeal[]>([]);
  const [hotels, setHotels] = useState<HomepageDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = airports && airports.length > 0
          ? `?airports=${airports.join(',')}&limit=30`
          : '?limit=30';
        const res = await fetch(`/api/deals${params}`);
        if (!res.ok) throw new Error('API error');
        const json = await res.json();
        const items: Record<string, unknown>[] = Array.isArray(json)
          ? json
          : (json.data || []);

        // Filter junk rows and map
        const mapped = items
          .filter(d => d.id !== 'airhelp-evergreen' && !String(d.id || '').includes('evergreen'))
          .map((d, i) => mapToHomepageDeal(d, i))
          .filter((d): d is HomepageDeal => d !== null);

        if (!cancelled) {
          setDomestic(mapped.filter(d => d.deal_type === 'flight' && d.is_domestic));
          setInternational(mapped.filter(d => d.deal_type === 'flight' && !d.is_domestic));
          setHotels(mapped.filter(d => d.deal_type === 'hotel'));
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load deals');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60_000); // refresh every minute
    return () => { cancelled = true; clearInterval(interval); };
  }, [airports?.join(',')]); // re-run when airports change

  return { domestic, international, hotels, loading, error };
}
