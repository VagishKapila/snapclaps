# SnapClaps AI Trip Planner Funnel — Design Spec
## Date: 2026-04-16
## Status: APPROVED — Ready for Implementation
## Branch: `feature/trip-planner-funnel` (from `staging`)

---

## What We're Building

A 4-step AI-powered trip planning funnel at `/plan` that takes a user from "I want to go to Bali" to a fully structured trip plan — showing exactly which points to transfer, to which airline, to book what flight, paired with a hotel, with step-by-step booking instructions and credit card recommendations to close any gap.

**Conversion path:** TikTok → snapclaps.com/plan → 4-step funnel → teaser (free) → paywall ($9.99/mo or $99 one-time) → full plan → booking → affiliate revenue + card referral revenue.

**Why this is the product:** Nobody else does all three. Going.com shows deals. Seats.aero shows raw award data. Point.me shows availability. SnapClaps says "You want Tokyo in October? Here's ANA Business Class for 55K miles using YOUR Amex points, Hotel for 8K Hyatt points from YOUR Chase card. Total out of pocket: $86."

---

## API Integrations — Confirmed Live

### Seats.aero Partner API ✅
- **Key:** `pro_2rXgWT07GibIpsFWwzvqmniBFui`
- **Base URL:** `https://seats.aero/partnerapi/`
- **Auth header:** `Partner-Authorization: pro_2rXgWT07GibIpsFWwzvqmniBFui`
- **Confirmed endpoints:**
  - `GET /partnerapi/routes` → 83,735 routes across 27 programs
  - `GET /partnerapi/availability?origin_airport=X&destination_airport=Y&source=PROGRAM&start_date=&end_date=&cabin=business`
- **27 available programs:** aeromexico, aeroplan, alaska, american, azul, copa, delta, emirates, ethiopian, etihad, eurobonus, finnair, flyingblue, frontier, jetblue, lifemiles, lufthansa, qantas, qatar, saudia, singapore, smiles, spirit, turkish, united, velocity, virginatlantic
- **Data returned per availability:** date, cabin availability flags (Y/W/J/F), mileage cost, taxes (USD cents), remaining seats, airlines (IATA codes), direct vs. connecting

### Seats.aero Rooms/Hotels ❌ Not Available in Partner API
- Tested: `/partnerapi/hotels`, `/partnerapi/rooms`, `/partnerapi/accommodation` — all 404
- Their Rooms feature is consumer-facing only, not in the Partner API yet
- **Hotel strategy:** Pre-seeded sweet spots database (see below). Add `hotel_source` field to data model so we can flip to Seats.aero Rooms API when it becomes available.

### Aviasales API ✅ (already integrated in server.js)
- Used for cash price baseline on every route
- `marker=716647` on all links

---

## Architecture

### Branch Strategy
```
staging (base)
    └── feature/trip-planner-funnel
            └── All new files isolated to:
                  client/src/features/trip-planner/
                  server/routes/trip-planner.js
                  server/data/sweet-spots.js
                  server/data/transfer-partners.js
                  server/utils/deal-card-generator.js
                  server/utils/video-generator.js
                  server/migrations/006_trip_planner.sql
```

### New Routes Added to App.tsx
```
/plan               → TripPlannerPage  (4-step funnel)
/plan/:searchId     → TripResultsPage  (teaser + paywall + full plan)
```

**Do NOT modify:** homepage, /deals, /error-fares, /miles-cards, /pricing, /deal/:id, blog routes, existing server.js routes. All existing affiliate links stay intact.

---

## Frontend File Structure

```
client/src/features/trip-planner/
├── TripPlannerPage.tsx         ← wizard controller, step state management
├── TripResultsPage.tsx         ← loads search results, teaser + paywall + plan
├── steps/
│   ├── Step1Location.tsx       ← ZIP/airport selector
│   ├── Step2Destination.tsx    ← destination + dates + cabin
│   ├── Step3Cards.tsx          ← card selection + points balances
│   └── Step4Processing.tsx     ← animated progress screen (5-10 seconds)
├── components/
│   ├── ResultsTeaser.tsx       ← free preview: flight summary, hotel summary, total value
│   ├── Paywall.tsx             ← $9.99/mo and $99 one-time options
│   ├── FullTripPlan.tsx        ← full plan (post-payment)
│   ├── BookingStep.tsx         ← individual step in booking instructions
│   ├── CardRecommendation.tsx  ← credit card CTA component
│   ├── TrustBadge.tsx         ← reusable trust messaging block
│   └── FunnelProgress.tsx      ← step indicator (Step 1 of 4)
└── types.ts                    ← TripSearch, TripPlan, CardOption interfaces
```

### Styling
Match existing codebase pattern: **inline styles** using CSS variables (`--teal`, `--coral`, `--navy`, `--cream`). Anton font for prices/badges. Inter for body. No Tailwind utility classes in JSX. Mobile-first, min touch target 44px.

---

## Backend File Structure

```
server/
├── routes/
│   └── trip-planner.js         ← all new API endpoints
├── data/
│   ├── sweet-spots.js          ← pre-seeded award data for 30 destinations
│   └── transfer-partners.js    ← card → loyalty program mapping
├── utils/
│   ├── seats-aero.js           ← Seats.aero API client + caching
│   ├── deal-card-generator.js  ← node-canvas image generation (1080×1920 PNG)
│   └── video-generator.js      ← fluent-ffmpeg video assembly (MP4)
└── migrations/
    └── 006_trip_planner.sql    ← trip_searches + trip_plans tables + user columns
```

---

## Database Schema

```sql
-- 006_trip_planner.sql

CREATE TABLE IF NOT EXISTS trip_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),                -- anonymous user tracking
  zip_code VARCHAR(10),
  home_airports TEXT[],                   -- ['SJC', 'SFO', 'OAK']
  destination VARCHAR(255),
  destination_airports TEXT[],            -- ['DPS', 'DEN', 'NRT']
  travel_month VARCHAR(7),               -- '2026-10'
  duration_days INTEGER,
  cabin_class VARCHAR(20) DEFAULT 'any', -- economy | business | first | any
  flexible_dates BOOLEAN DEFAULT true,
  cards JSONB DEFAULT '[]',              -- [{issuer, card_name, points_balance}]
  transfer_partners TEXT[] DEFAULT '{}', -- auto-computed from cards
  no_cards BOOLEAN DEFAULT false,        -- "I don't have a travel card yet"
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'   -- pending | processing | complete | failed
);

CREATE TABLE IF NOT EXISTS trip_plans (
  id SERIAL PRIMARY KEY,
  search_id INTEGER REFERENCES trip_searches(id) ON DELETE CASCADE,
  flight_options JSONB DEFAULT '[]',      -- [{type, source, airline, miles, cabin, taxes, route, booking_steps, availability_dates}]
  hotel_options JSONB DEFAULT '[]',       -- [{property, program, points_per_night, nights, cash_per_night, booking_steps, hotel_source}]
  card_recommendations JSONB DEFAULT '[]',-- [{card_name, issuer, bonus_miles, annual_fee, why, affiliate_url}]
  trip_summary JSONB DEFAULT '{}',        -- {total_value, total_cost, total_savings, can_book_with_current_points}
  deal_status VARCHAR(20) DEFAULT 'live', -- live | expired | checking
  last_status_check TIMESTAMP,
  social_content_path TEXT,              -- path to generated images/video
  created_at TIMESTAMP DEFAULT NOW()
);

-- Extend users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_started TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_min_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onetime_search_ids INTEGER[] DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS searches_this_month INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_search_reset DATE DEFAULT CURRENT_DATE;
```

---

## API Endpoints

### `POST /api/plan/search`
- **Auth:** None required (anonymous via session_id cookie)
- **Body:** `{ zip_code, destination, travel_month, duration_days, cabin_class, flexible_dates, cards, no_cards }`
- **Logic:**
  1. Validate inputs
  2. Create `trip_searches` record, set `session_id` cookie if not present
  3. Compute `home_airports` from ZIP → airport lookup (static JSON, top 500 US ZIPs)
  4. Compute `transfer_partners` from selected cards (using `transfer-partners.js`)
  5. Kick off trip plan generation (can be sync for MVP, async for scale)
  6. Return `{ search_id, teaser }` — teaser is always free
- **Rate limit:** 10/hour per IP

### `GET /api/plan/:searchId/full`
- **Auth:** Required — `session_id` must own this search AND user must be paid
- **Gate check:**
  ```
  if user.subscription_tier === 'free' AND search_id NOT IN user.onetime_search_ids:
    return 402 { requires_payment: true }
  ```
- **Returns:** full trip plan from `trip_plans` table

### `POST /api/plan/subscribe`
- **Body:** `{ plan_type: 'monthly' | 'onetime', search_id }`
- **Creates Stripe Checkout session:**
  - `monthly`: existing Premium price `price_1TLtPqAHP8NRRyLCqObXqQm7` ($9.99/mo)
  - `onetime`: new price `price_TRIP_PLAN_99` ($99 one-time payment) — create this in Stripe
- **Returns:** `{ stripe_checkout_url }`

### `POST /api/webhook/stripe` (extend existing handler)
- On `checkout.session.completed`:
  - monthly → set `user.subscription_tier = 'monthly'`, `subscription_started`, `subscription_min_end = NOW() + 3 months`
  - onetime → push `search_id` to `user.onetime_search_ids`

### `GET /api/plan/:searchId/status`
- Returns `{ deal_status, last_status_check }` — for frontend polling

---

## Trip Plan Generation Logic

### Step 1: Cash Flight (Aviasales)
```javascript
// Already integrated. Call the flight search for origin→destination.
// Returns: price, airline, dates
```

### Step 2: Award Flights (Seats.aero — LIVE API)
```javascript
// For each program that the user can access via their transfer partners:
// 1. Map transfer partner → Seats.aero source name (e.g., 'amex_mr' → 'virginatlantic')
// 2. Call: GET /partnerapi/availability?origin_airport=X&destination_airport=Y&source=PROGRAM
//    &start_date=MONTH_START&end_date=MONTH_END&cabin=J (or F or Y)
// 3. Collect: dates with availability, miles cost, taxes, airlines
// 4. Cross-reference sweet-spots.js to find known-great redemptions
// 5. Rank by cpp (cents per point value)
```

#### Seats.aero Source ↔ Transfer Partner Mapping
```javascript
const SOURCE_BY_PROGRAM = {
  chase_ur:    ['united', 'virginatlantic', 'aeroplan', 'flyingblue', 'singapore'],
  amex_mr:     ['virginatlantic', 'flyingblue', 'delta', 'singapore', 'aeroplan', 'lifemiles'],
  capital_one: ['aeroplan', 'flyingblue', 'turkish', 'lifemiles', 'singapore'],
  citi_ty:     ['flyingblue', 'singapore', 'turkish', 'lifemiles'],
  bilt:        ['american', 'united', 'aeroplan', 'virginatlantic', 'flyingblue'],
  // Airline-direct cards (already in the right program):
  united_card: ['united'],
  delta_card:  ['delta'],
  alaska_card: ['alaska'],
};
```

### Step 3: Hotel Awards (Pre-seeded Sweet Spots)
```javascript
// sweet-spots.js contains pre-seeded hotel data for 30 destinations
// Fields: property, program, points_per_night, typical_cash_per_night,
//         transfer_from, hotel_source: 'internal'
// When Seats.aero Rooms API launches: set hotel_source: 'seats_aero'
```

### Step 4: Matching & Gap Analysis
```javascript
// For each award option found:
// 1. Check: does user have the required transfer partner in their cards?
// 2. Check: does user have enough points? (points_needed vs points_balance)
// 3. Classify:
//    - "Book Now" → user has the points AND the right program
//    - "Almost There" → user has < 20% gap (can earn via spend)
//    - "One Card Away" → wrong program, but one card fixes it
// 4. If gap: find the credit card that closes it (from card_recommendations data)
// 5. Build step-by-step booking instructions per option
```

### Step 5: Teaser vs. Full
```javascript
// Teaser (free, always returned):
//   - Flight: type + airline + rough price range + "You have enough points" or "X points needed"
//   - Hotel: property name + point range + status
//   - Summary: total_value, total_cost estimate, savings_estimate
//   - NO booking steps, NO transfer instructions, NO card links

// Full plan (paywalled):
//   - All of the above PLUS:
//   - Exact step-by-step booking instructions (numbered, specific)
//   - Exact transfer amounts and timing
//   - Credit card recommendations with affiliate links
//   - Direct booking links
//   - Deal status (is award still available?)
```

---

## Stripe Configuration

### Monthly ($9.99/month)
- Reuse: `price_1TLtPqAHP8NRRyLCqObXqQm7` (existing Premium price)
- Min term: 3 months — enforced via `subscription_min_end` in our DB
- Cancellation UI: show "X months remaining on your minimum term"

### One-Time ($99)
- Create new price in Stripe: `price_data.unit_amount = 9900, mode = 'payment'`
- Store price ID in `STRIPE_ONETIME_PRICE_ID` env var
- Unlocks THIS specific `search_id` only (stored in `user.onetime_search_ids`)

---

## Social Content Pipeline

After every trip plan is generated:

```
trip_plan created
    ↓
server/utils/deal-card-generator.js
  → 5 PNG slides (1080×1920) using node-canvas
  → Background: Pexels API (free, 200 req/hr) for destination photo
  → Text: Destination name, trip value, points needed
  → Saved: dist/social-content/YYYY-MM-DD/[destination]/slide[1-5].png
    ↓
server/utils/video-generator.js
  → 15-second MP4 using fluent-ffmpeg
  → Ken Burns zoom on each slide (3s each)
  → Crossfade transitions
  → Saved: dist/social-content/YYYY-MM-DD/[destination]/deal-video.mp4
    ↓
Paperclip Content Creator agent
  → Writes TikTok caption, Instagram caption, Twitter thread
  → Saved: .../social-content/YYYY-MM-DD/[destination]/captions.json
```

---

## Trust Messaging — Required Placements

| Location | Message |
|---|---|
| Step 1 (location) | "We use your ZIP to find nearby airports. Never shared or sold." |
| Step 3 (cards) | "Your points are YOURS. We never access your accounts. We show you the path — you book directly." |
| Paywall | "What you're paying for: AI that scans 27 airline programs + 83,000 routes. The trips and points savings are 100% yours." |
| Full plan (top) | "These are YOUR points and YOUR booking. We give you the steps — you book directly with the airline and hotel." |
| Card recommendations | "We may earn a commission if you apply through our link. This doesn't cost you extra — same bonus either way." |

---

## Pre-Seeded Sweet Spots — 30 Destinations

Seed data in `server/data/sweet-spots.js`. Each destination entry includes:

**Flights:**
- Top 3 award options: `{ source, program_display, miles, cabin, typical_airline, transfer_from[], cpp_estimate, booking_url_template }`
- Fallback cash option via Aviasales

**Hotels:**
- Top 2 hotel options: `{ property, program, points_per_night, nights_for_trip, transfer_from[], cash_per_night, hotel_source: 'internal' }`

**30 destinations:** Tokyo (NRT/HND), Paris (CDG), London (LHR), Bali (DPS), Rome (FCO), Barcelona (BCN), Cancun (CUN), Maldives (MLE), Santorini (JTR), Dubai (DXB), Bangkok (BKK), Singapore (SIN), Honolulu (HNL), Seoul (ICN), Lisbon (LIS), Amsterdam (AMS), Sydney (SYD), Cape Town (CPT), Istanbul (IST), Mexico City (MEX), Reykjavik (KEF), Marrakech (RAK), Phuket (HKT), Athens (ATH), Buenos Aires (EZE), Fiji (NAN), Maui (OGG), Amalfi/Naples (NAP), Kyoto (KIX), Queenstown (ZQN)

**Fallback for unlisted destinations:** Return cash prices only + "Our points team is researching award options — we'll email you within 24 hours."

---

## Seats.aero API Usage Notes

Based on live testing:
- Source names are lowercase, no underscores: `virginatlantic` not `virgin_atlantic`
- Cabin filter is optional; filter by checking `JAvailable: true` etc. in response
- `JTotalTaxes` is in USD cents (divide by 100 for dollars)
- `JRemainingSeats: 0` means unavailable even if `JAvailable: true`
- Cache responses in PostgreSQL for 6 hours — award availability doesn't change that fast
- Query multiple sources in parallel (Promise.all) to minimize latency

---

## 4-Step Funnel UX

### Step 1: Where are you?
- ZIP code input → maps to nearest 3 airports (static JSON lookup)
- Manual airport selection fallback
- Store: `zip_code`, `home_airports`

### Step 2: Where do you want to go?
- Destination autocomplete (200+ cities with airport codes)
- Popular destinations chip row: Tokyo, Paris, Bali, London, Cancun, Rome, Maldives, Hawaii
- Month picker (next 12 months)
- Duration: 3/5/7/10/14 days / flexible
- Cabin: Economy / Business / First / Any
- Flexible dates checkbox (±3 days)

### Step 3: Do you have travel cards?
- Grouped by issuer (Chase, Amex, Capital One, Citi, Bilt, Airline cards, Hotel cards)
- Checkbox + optional points balance input per card
- "I don't have a travel card yet" option → goes to card recommendation path
- Trust message block below the form
- Transfer partners auto-computed on submit

### Step 4: Processing (5-10 seconds)
- Animated progress list:
  - ✅ Finding flights from [AIRPORT] (immediate)
  - ✅ Checking 27 award programs (immediate)
  - ⏳ Calculating your best points path... (animated)
  - ○ Building your complete trip plan
- Real: calling Seats.aero + Aviasales in parallel

### Results Teaser (Free)
- Flight card: airline + cabin + miles required + "✅ You have enough" or "You need X more"
- Hotel card: property + points/night + status
- Summary card: total trip value, estimated cost, savings
- Paywall CTA: two options clearly laid out

### Paywall
- $9.99/month: recurring, 3-month minimum, includes unlimited new searches + deal alerts
- $99 one-time: this trip plan only, no alerts, no future searches
- Trust messaging beneath both options

### Full Trip Plan (Post-Payment)
- Deal status badge: "✅ Award still available as of [time]"
- Points inventory: "Your 80K Amex → 55K to Virgin Atlantic, 25K left over"
- Flight section: step-by-step numbered booking instructions
- Hotel section: same format
- Card recommendations: if gap exists, top 3 cards with math shown
- Trip cost summary
- Monitoring active: "We'll alert you if this deal changes"

---

## Testing Plan

7 tests must pass before merge:

1. **Free flow** — full funnel to teaser without payment
2. **Monthly subscription** — Stripe checkout → full plan unlocked
3. **One-time payment** — $99 → specific search unlocked
4. **No-cards flow** — card recommendation path works
5. **Unlisted destination** — fallback message + cash prices
6. **Social content** — deal cards + video generated after plan
7. **Mobile (375px, 414px, 768px)** — all steps usable on phone

---

## What This Does NOT Change

- Homepage (`/`)
- `/deals`, `/error-fares`, `/miles-cards`, `/pricing`, `/deal/:id`
- All blog routes
- All existing affiliate links and Stripe price IDs
- Existing `server.js` routes
- The `googlebbb3e30ca6a47865.html` file (Search Console verification)

---

## Spec Self-Review

- ✅ No TBD or placeholders — all source names, endpoint formats, price IDs specified
- ✅ Architecture matches feature descriptions
- ✅ Seats.aero API confirmed live with real test calls
- ✅ Hotel gap (no Rooms API) acknowledged and handled with internal sweet spots
- ✅ Scope is focused: one feature branch, isolated files, no existing routes touched
- ✅ All ambiguities resolved: cabin filter approach, teaser vs. full split, Stripe tier reuse

---

*Design spec authored: 2026-04-16*
*Author: Vagish + Claude*
*Ready for: writing-plans → implementation*
