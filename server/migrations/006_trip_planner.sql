-- server/migrations/006_trip_planner.sql
-- Trip Planner Funnel — new tables + user columns

CREATE TABLE IF NOT EXISTS trip_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  session_id VARCHAR(255) NOT NULL,
  zip_code VARCHAR(10),
  home_airports TEXT[] DEFAULT '{}',
  destination VARCHAR(255),
  destination_airports TEXT[] DEFAULT '{}',
  travel_month VARCHAR(7),
  duration_days INTEGER DEFAULT 7,
  cabin_class VARCHAR(20) DEFAULT 'any',
  flexible_dates BOOLEAN DEFAULT true,
  cards JSONB DEFAULT '[]',
  transfer_partners TEXT[] DEFAULT '{}',
  no_cards BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_plans (
  id SERIAL PRIMARY KEY,
  search_id INTEGER NOT NULL REFERENCES trip_searches(id) ON DELETE CASCADE,
  flight_options JSONB DEFAULT '[]',
  hotel_options JSONB DEFAULT '[]',
  card_recommendations JSONB DEFAULT '[]',
  trip_summary JSONB DEFAULT '{}',
  deal_status VARCHAR(20) DEFAULT 'live',
  last_status_check TIMESTAMP DEFAULT NOW(),
  social_content_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trip_searches_session ON trip_searches(session_id);
CREATE INDEX IF NOT EXISTS idx_trip_plans_search ON trip_plans(search_id);

CREATE TABLE IF NOT EXISTS seats_aero_cache (
  id SERIAL PRIMARY KEY,
  cache_key VARCHAR(500) UNIQUE NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seats_cache_key ON seats_aero_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_seats_cache_created ON seats_aero_cache(created_at);

ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_min_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onetime_search_ids INTEGER[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS searches_this_month INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_search_reset DATE DEFAULT CURRENT_DATE;
