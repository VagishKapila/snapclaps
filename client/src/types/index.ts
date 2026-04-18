export interface Deal {
  id: string;
  type: 'error_fare' | 'points' | 'flight' | 'hotel' | 'bonus' | 'complete_trip';
  badge: string;
  route: string;
  emoji: string;
  price: string;
  priceLabel?: string;
  originalPrice?: string;
  savings?: string;
  detail: string;
  bookUrl: string;
  ctaText: string;
  isLive?: boolean;
  liveStatus?: 'live' | 'unconfirmed' | 'expired';
  foundMinutesAgo?: number;
  isTealCta?: boolean;
  expiresAt?: string | null;         // ISO timestamp — for countdown timer
  typicalExpiryHours?: number | null; // expected lifetime in hours
  source?: string;                    // travelpayouts_v3 | kiwi | hotellook | manual
  hotelName?: string;
  hotelStars?: number;
  hotelCity?: string;
  nights?: number;
  checkIn?: string;
  checkOut?: string;
}

export interface User {
  id: string;
  email: string;
  tier: 'free' | 'premium' | 'elite';
  cards?: { issuer: string; name: string; balance: number; currency: string; }[];
  homeAirport?: string;
}

export interface AriaSuggestion {
  headline: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
  steps?: string[];
}
