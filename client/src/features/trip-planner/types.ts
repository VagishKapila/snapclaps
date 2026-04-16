export interface TripCard {
  card_id: string;
  points_balance: number;
}

export interface TripSearch {
  session_id: string;
  zip_code: string;
  destination: string;
  travel_month: string;
  duration_days: number;
  cabin_class: 'economy' | 'premium_economy' | 'business_first' | 'any';
  flexible_dates: boolean;
  cards: TripCard[];
  no_cards: boolean;
}

export interface FlightOption {
  source: string;
  program_name: string;
  miles_cost: number;
  taxes_usd: number;
  cabin: string;
  seats_available: number | null;
  best_date: string | null;
  is_direct: boolean;
  user_cards: string[];
  user_points: number;
  can_book_now: boolean;
  points_gap: number;
  live: boolean;
  notes?: string;
  booking_steps: BookingStep[];
}

export interface BookingStep {
  step: number;
  action: string;
  detail: string;
  url?: string;
}

export interface HotelOption {
  program: string;
  property: string;
  points_per_night: number;
  total_points: number;
  cash_value_per_night: number;
  total_cash_value: number;
  nights: number;
  source: string;
  category: number;
}

export interface CardRecommendation {
  type: string;
  card_id: string;
  name?: string;
  reason: string;
  bonus_points: number;
  annual_fee: number;
  affiliate_url: string;
}

export interface TripSummary {
  destination: string;
  emoji: string;
  travel_month: string;
  duration_days: number;
  total_flight_miles: number | null;
  total_hotel_points: number | null;
  cash_value_saved: number | null;
  headline: string;
  can_book_now: boolean;
  best_program: string | null;
}

export interface TripPlan {
  search_id: number;
  destination: string;
  travel_month: string;
  duration_days: number;
  trip_summary: TripSummary;
  flight_options: FlightOption[];
  hotel_options: HotelOption[];
  card_recommendations: CardRecommendation[];
}

export type WizardStep = 1 | 2 | 3 | 4;
