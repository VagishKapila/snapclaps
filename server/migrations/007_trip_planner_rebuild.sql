-- ============================================================
-- Migration 007: Trip Planner Rebuild
-- Date: 2026-04-17
-- Author: Claude (Checkpoint C1)
--
-- What this does:
--   1. DROP award_sweet_spots (wrong schema, 10 stale rows — per Option C approval)
--   2. CREATE sweet_spots with authoritative schema (real data, real source URLs)
--   3. ALTER trip_searches: user_id INTEGER → UUID (safe: all 5 rows are NULL)
--      + add origin_airport VARCHAR(5), destination_airport VARCHAR(5) if missing
--   4. trip_plans: no changes needed (schema matches trip-planner.js code)
--
-- Pre-run safety checks (verified before writing this migration):
--   - award_sweet_spots has 10 rows — approved for DROP
--   - trip_searches has 5 rows, ALL user_id = NULL → safe to ALTER column type
--   - trip_plans has 5 rows, schema already matches code → no ALTER needed
--   - trip-engine.js does NOT query sweet_spots from DB (uses JS data files)
--     so DROP does NOT break the current working trip planner
-- ============================================================

BEGIN;

-- ─── 1. DROP old wrong-schema table ───────────────────────────────────────

DROP TABLE IF EXISTS award_sweet_spots CASCADE;

-- ─── 2. CREATE sweet_spots (authoritative schema) ─────────────────────────

CREATE TABLE IF NOT EXISTS sweet_spots (
  id                    SERIAL PRIMARY KEY,

  -- Destination identifiers
  destination_airport   VARCHAR(5)   NOT NULL,              -- IATA airport code, e.g. 'FCO'
  destination_city      VARCHAR(100) NOT NULL,              -- Human display name, e.g. 'Rome'
  destination_country   VARCHAR(100) NOT NULL,              -- e.g. 'Italy'
  region                VARCHAR(50)  NOT NULL,              -- 'Europe' | 'Asia' | 'Latin America' | etc.

  -- Award details
  program               VARCHAR(100) NOT NULL,              -- Loyalty program slug, e.g. 'aeroplan'
  miles_required        INTEGER      NOT NULL,              -- One-way per person
  cabin                 VARCHAR(20)  NOT NULL               -- 'economy' | 'premium_economy' | 'business' | 'first' | 'hotel'
                        CHECK (cabin IN ('economy','premium_economy','business','first','hotel')),
  airline               VARCHAR(100),                      -- Operating/partner carrier (NULL for hotel-only rows)
  product_name          VARCHAR(150) NOT NULL,              -- e.g. 'Lufthansa Business via Aeroplan'

  -- Transferability
  transfer_from         TEXT[]       NOT NULL DEFAULT '{}', -- Card IDs matching CARDS array in TripPlanner.jsx
                                                            -- e.g. '{chase_sapphire_preferred,amex_platinum}'
  transfer_bank_programs TEXT[]     NOT NULL DEFAULT '{}', -- Human labels, e.g. '{Chase UR,Amex MR,Citi TYP}'

  -- Cost context
  typical_cash_price    INTEGER      NOT NULL,              -- USD, one-way economy reference fare
  typical_taxes         INTEGER      NOT NULL DEFAULT 0,    -- Taxes/fees in USD (0 = fuel-dumped)

  -- Booking guidance
  availability_notes    TEXT,                               -- e.g. 'Book 2-11 months out. Partner space opens T-330.'
  booking_url           TEXT         NOT NULL,              -- Direct booking URL for this program
  booking_steps         TEXT[]       NOT NULL DEFAULT '{}', -- Ordered human steps for booking

  -- Sourcing / trust
  source_url            TEXT         NOT NULL,              -- Published rate source (no fabricated numbers)
  last_verified         DATE         NOT NULL DEFAULT CURRENT_DATE, -- When miles rate was last confirmed
  is_active             BOOLEAN      NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Indexes: the two main query patterns
CREATE INDEX IF NOT EXISTS idx_sweet_spots_destination
  ON sweet_spots (destination_airport);

CREATE INDEX IF NOT EXISTS idx_sweet_spots_program_cabin
  ON sweet_spots (program, cabin);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_sweet_spots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sweet_spots_updated_at ON sweet_spots;
CREATE TRIGGER trg_sweet_spots_updated_at
  BEFORE UPDATE ON sweet_spots
  FOR EACH ROW EXECUTE FUNCTION update_sweet_spots_updated_at();

-- ─── 3. ALTER trip_searches ────────────────────────────────────────────────

-- 3a. user_id: INTEGER → UUID
--     Safe because all 5 existing rows have user_id = NULL.
--     No FK constraint was enforced (confirmed — no constraint exists on this column).
ALTER TABLE trip_searches
  ALTER COLUMN user_id TYPE UUID USING NULL::UUID;

-- 3b. Add origin_airport if not present (VARCHAR(5) IATA code)
ALTER TABLE trip_searches
  ADD COLUMN IF NOT EXISTS origin_airport VARCHAR(5);

-- 3c. Add destination_airport if not present
ALTER TABLE trip_searches
  ADD COLUMN IF NOT EXISTS destination_airport VARCHAR(5);

-- ─── 4. trip_plans — no schema changes needed ──────────────────────────────
--
-- Current production schema matches trip-planner.js exactly:
--   id SERIAL, search_id INTEGER → trip_searches(id),
--   flight_options JSONB, hotel_options JSONB,
--   card_recommendations JSONB, trip_summary JSONB,
--   deal_status VARCHAR, last_status_check TIMESTAMP,
--   social_content_path TEXT, created_at TIMESTAMP
--
-- No ALTER required.

-- ─── Verification queries (run after COMMIT to spot-check) ─────────────────
--
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' AND table_name IN ('sweet_spots','trip_searches','trip_plans');
--
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'trip_searches' AND column_name IN ('user_id','origin_airport','destination_airport');
--
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'sweet_spots' ORDER BY ordinal_position;
--
-- SELECT COUNT(*) FROM sweet_spots;  -- expect 0 (seed script runs separately in C2/C3)

COMMIT;
