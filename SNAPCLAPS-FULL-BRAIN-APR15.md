# SnapClaps — Full Company Brain & Revenue Plan
## As of April 15, 2026 — For Strategic Discussion

---

## WHAT SNAPCLAPS IS

SnapClaps is a travel deals discovery platform at **snapclaps.com**. We find flights, hotels, and travel packages 40–90% off and surface them before they disappear. Revenue comes from three streams: premium subscriptions, affiliate commissions, and eventually brand partnerships. We are modeled directly after **Going.com (formerly Scott's Cheap Flights)**, which does $50M+/year with a team of ~55 people. We run the equivalent workforce with **11 AI agents + Vagish as the sole human board member**.

**Stack:** Node.js/Express backend on Railway, vanilla JS frontend (pre-built bundle + custom injected UI), PostgreSQL database, Stripe Live mode.

**Live URL:** https://www.snapclaps.com
**TikTok brand:** @OopsLuxEscapes (existing channel, active)

---

## WHAT WE'VE BUILT & DEPLOYED (COMPLETE)

### 1. THE WEBSITE — Live at snapclaps.com
- **4-tab UI:** Flights | Hotels | Miles & Cards | Error Fares
- **Deals feed:** Auto-refreshes every 15 minutes from Travelpayouts API (12 major US airports monitored)
- **Hotel search:** Routes to Booking.com with our affiliate ID (aid=7914697)
- **Miles & Cards tab:** Links to loyalty programs (Alaska, Flying Blue, Chase UR, etc.) + credit card applications (Chase Sapphire, Amex Platinum, Venture X, Citi Strata)
- **Error Fares tab:** Dedicated section for mistake fares + guides
- **Pricing modal:** Premium $9.99/mo | Elite $24.99/mo — both on Stripe Live mode
- **Newsletter signup:** Buttondown embedded on homepage and blog

### 2. BLOG — 27 SEO Posts Live at snapclaps.com/blog
All posts have: title tags, meta descriptions, canonical URLs, JSON-LD schema, affiliate links woven in.

**Posts live:**
- cheap-flights-guide, error-fares-guide, error-fares-guide-complete
- best-travel-credit-cards-2026, best-credit-cards-travel
- how-to-use-miles-points, best-time-book-flights
- travel-esim-guide, esim-travel-guide
- cheap-flights-europe, cheap-flights-tokyo
- cheap-business-class-flights, airline-flash-sales-guide
- best-flight-deal-websites, hotel-booking-hacks
- luxury-hotels-under-200, honeymoon-maldives
- bali-budget-guide, paris-travel-guide
- santorini-vs-amalfi, tokyo-first-timer
- budget-travel-destinations-2026, packing-light-guide
- carry-on-packing-list, car-rental-tips
- travel-insurance-guide, how-snapclaps-finds-deals

### 3. AFFILIATE PROGRAMS — All Wired & Tracking

| Program | Commission | Status | How It Works |
|---|---|---|---|
| Aviasales | Per click | ✅ Active | marker=716647, all flight searches |
| Airalo eSIM | Per sale | ✅ Active | airalo.tpo.lv/KDAmYfab, injected every 6th deal |
| AirHelp | Per sale | ✅ Active | airhelp.tpo.lv/irNfNVGG, on all flight pages |
| Kiwi.com | Per booking | ✅ Active | Flight alternatives |
| Klook | 2–5% | ✅ Active | Tours/activities Asia |
| GetYourGuide | % | ✅ Applied | Tours globally — PENDING APPROVAL |
| DiscoverCars | 23–54% | ✅ Applied | Car rentals — PENDING APPROVAL |
| Tripadvisor | 8% + CPC | ✅ Applied | Reviews + activities — PENDING APPROVAL |
| 12Go | % | ✅ Applied | Ground transport SE Asia — PENDING APPROVAL |
| Omio | % | ✅ Applied | Trains/buses Europe — PENDING APPROVAL |
| Hostelworld | % | ✅ Applied | Budget accommodation — PENDING APPROVAL |
| VisitorsCoverage | % | ✅ Applied | Travel insurance — PENDING APPROVAL |
| Trip.com | 1–5.5% | ✅ Applied | Flights + hotels — PENDING APPROVAL |
| Booking.com | 25–40% | ⏳ June 2026 | Hotels — eligible after 2 months live |
| Skimlinks | Auto-monetize | ✅ Installed | ID 301475, pending publisher approval (3 days) |
| Viator | 8% | ⏳ Declined | Re-apply in a few days |
| Amazon Associates | % | ⏳ Needs Vagish SSN | Travel gear |

### 4. SEO INFRASTRUCTURE
- **sitemap.xml** — 33 pages, submitted to Google Search Console ✅
- **robots.txt** — pointing to sitemap ✅
- **Google Search Console** — verified via HTML file, sitemap submitted ✅ (Google found 33 pages immediately)
- **JSON-LD schema** — on all 27 blog posts ✅
- **Skimlinks** — auto-monetizes any commercial links in blog posts ✅

### 5. EMAIL NEWSLETTER (Buttondown)
- **3 welcome emails written and uploaded:**
  - Email 1: "Your first deal is already waiting ✈️" (immediate)
  - Email 2: "How we find deals nobody else posts 🔍" (day 2)
  - Email 3: "Deals this week — 3 we'd book right now 🌍" (day 5)
- **Newsletter:** Free tier, no cost
- **Automation:** Requires Buttondown paid plan to auto-send — currently drafts, can manually broadcast

### 6. STRIPE — LIVE MODE
- **Premium:** $9.99/month — `price_1TLtPqAHP8NRRyLCqObXqQm7`
- **Elite:** $24.99/month — `price_1TLtPqAHP8NRRyLCQRe4YJKq`
- **Payment links working:** Upgrade modal on homepage routes to Stripe Checkout
- **No subscribers yet** — traffic needed first

---

## THE AI COMPANY — PAPERCLIP AGENTS (YOUR EMPLOYEES)

This is the Going.com equivalent team, running autonomously 24/7.

### CURRENT PHASE 1 TEAM (5 agents, ~$185/mo in API costs)

**Agent 1 — CEO Agent** | Runs: Monday 8am
- Generates weekly sprint plan for all agents
- Reviews prior week output
- Escalates to Vagish only: budget decisions >$100, pivots, partnerships
- Output: `/paperclipSnapClaps/weekly-report-[date].md`

**Agent 2 — Deal Scout** | Runs: Every 6 hours (6am, 12pm, 6pm, midnight)
- Researches 5+ hot travel deals from public sources
- Scores each deal: Savings Score + Availability + Viral Potential + Destination Appeal
- Only publishes deals scoring 7+/10
- Minimum 40% off = qualifies
- Output: `/paperclipSnapClaps/deals-[date]-[hour].md`

**Agent 3 — Content Creator** | Runs: Daily at 9am
- Writes one 800-word travel deal blog post or deal alert
- Includes affiliate links (Aviasales marker, Airalo eSIM)
- Topics: trending destinations, deal alerts, travel tips
- Output: `/paperclipSnapClaps/content-[date].md`

**Agent 4 — Social Media Manager** | Runs: Mon/Wed/Fri at 10am
- Writes 3 scripts per session:
  - TikTok script (60 seconds, hook-first)
  - Instagram caption + hashtags
  - Twitter/X thread (5 tweets)
- Output: `/paperclipSnapClaps/social-[date].md`

**Agent 5 — Newsletter Agent** | Runs: Friday at 4pm
- Compiles week's best 5 deals into Buttondown-ready newsletter
- Includes catchy subject line, deal summaries, affiliate links
- Output: `/paperclipSnapClaps/newsletter-[date].md`

### PHASE 2 TEAM (June 2026, +2 agents, +$70/mo)
- **Growth Hacker Agent** — tracks what content is performing, doubles down, finds new channels
- **Analytics Agent** — weekly metrics dashboard, conversion analysis, revenue by source

### FULL PHASE 3 VISION (11 agents total — Going.com parity)
- Chief Deal Expert (Opus) — quality gate on all deals
- 3x Deal Scout Squad (Sonnet) — flights, hotels, error fares separately
- Video Producer — creates short-form video scripts from deals
- Member Success Agent — handles subscriber questions
- QA Editor — reviews all content before it goes live

### GAPS IN THE CURRENT AGENT SETUP
❌ **No link checker** — nobody is verifying affiliate links are working
❌ **No QA Editor** — content goes out unreviewed
❌ **No marketing agent** — nobody is posting to TikTok/Instagram yet (scripts written, not posted)
❌ **Agents write to files but don't post** — outputs are drafts only, need manual approval or posting pipeline

---

## WHAT'S NOT BUILT YET — THE GAPS

### Miles Concierge (OopsLux Deals)
This was discussed as a premium tier concept: a white-glove miles/points search service where users tell us where they want to go and we find the best award redemptions. Status: **NOT BUILT**. Here's what's needed:
- A form/intake flow for users to submit destination + dates + departure city
- A "concierge agent" that searches award availability (AwardLogic API, points.com, or manual research)
- A response mechanism (email or in-app) with options found
- Pricing: could be $49–99/search or bundled into Elite tier
- **Revenue potential:** High — people pay a lot for this. Going.com's premium is $100+/year.

### OopsLux Deals — How We're Finding Them
Currently: Travelpayouts API feeds us deals from their network (Aviasales, Kiwi.com, etc.). These are real-time price data, not curated error fares.

**What we need for true OopsLux/error fares:**
- Monitor airline pricing APIs for sudden drops (>50% from 90-day average)
- Cross-reference with historic pricing (need a price history database)
- Alert system that pushes to social + email within minutes of detection
- Sources: Secret Flying, Airfarewatchdog, Google Flights price alerts, Skiplagged
- **Current status:** The Error Fares tab exists but shows content from the blog, not live error fares

### Posting Pipeline (Social Media)
Currently: Social Media Manager agent writes scripts → saves to files. **Nobody posts them.**

What's needed to make this autonomous:
- TikTok account @snapclaps (Vagish needs to create with phone verification)
- Instagram @snapclaps (same)
- The `social-media-poster` skill exists in Cowork and can post to TikTok, YouTube, Reddit, LinkedIn, Facebook, X via their APIs
- **Gap:** Account creation needs Vagish → then posting can be fully automated

### User Acquisition
**Current plan:** Organic SEO from 27 blog posts + Paperclip content.

**What's missing:**
- No paid traffic (Google Ads, Meta Ads) — zero budget allocated
- No influencer partnerships set up
- No referral program
- No PR/press outreach
- TikTok organic is the fastest free channel — @OopsLuxEscapes already exists

**Fastest path to first subscribers:**
1. TikTok @OopsLuxEscapes — already have the channel, post deal videos 3x/day
2. Reddit posts in r/travel, r/churning, r/solotravel — manual but free
3. Facebook Groups (travel deals groups) — post deals manually at first
4. Email waitlist — push people to subscribe on the homepage

### Link Quality & Monitoring
**Currently: NO agent checking affiliate links.** This is a gap. The existing QA Editor role in the blueprint is designed for this.

**What's needed:**
- Weekly automated curl check of all affiliate links
- Alert if any return 404 or redirect incorrectly
- Verify Booking.com aid= parameter is present
- Verify Aviasales marker= is correct
- **Quick fix:** Add a 5th scheduled task that runs weekly and tests all key affiliate URLs

---

## REVENUE PATH TO $50K/MONTH

### Revenue Streams & Targets

| Stream | Month 1 | Month 3 | Month 6 | Month 12 |
|---|---|---|---|---|
| Affiliate clicks (Aviasales, eSIM, etc.) | $0–50 | $200–500 | $1,000–3,000 | $5,000–10,000 |
| Subscriptions (Premium $9.99 + Elite $24.99) | $0 | $100–500 | $1,000–5,000 | $10,000–20,000 |
| Skimlinks auto-monetize (blog) | $0 | $50–200 | $500–1,500 | $2,000–5,000 |
| Booking.com hotels (June 2026+) | — | — | $500–2,000 | $3,000–8,000 |
| Miles Concierge (not built) | — | — | $500–2,000 | $5,000–10,000 |
| Brand partnerships | — | — | — | $5,000–10,000 |
| **Total** | **~$50** | **~$800** | **~$6,000** | **~$40,000** |

### The Critical Path
Going.com's secret: **email subscribers who trust you to find deals.** They built to 2M+ subscribers by being first with error fares. That's the model.

1. **Traffic** → 27 blog posts get indexed (weeks 1-4) → organic clicks
2. **Subscribers** → visitors join newsletter → high-intent audience
3. **Trust** → Deal Scout finds real deals → subscribers book → affiliate commissions
4. **Subscriptions** → paying members get deals hours before free list
5. **Scale** → more subscribers → more data → better deals → more revenue

### The $50K/month Math
- **5,000 Premium subscribers** × $9.99 = $49,950/month
- Or: 2,000 Premium + 600 Elite = $19,980 + $14,994 = ~$35,000 + affiliates = $50K+
- Going.com took 3 years to get to this scale. We're targeting 12-18 months with AI leverage.

---

## MONTHLY OPERATING COSTS

| Item | Cost |
|---|---|
| Railway hosting | ~$20/mo |
| Paperclip agents Phase 1 (5 agents) | ~$185/mo |
| Buttondown (free tier) | $0 |
| Travelpayouts affiliate programs | $0 |
| Skimlinks | $0 |
| **Total Phase 1** | **~$205/mo** |

---

## WHAT NEEDS TO HAPPEN IN THE NEXT 2 WEEKS

### Vagish Does (requires human):
1. Create TikTok @snapclaps (phone verification) — **this unlocks social posting**
2. Create Instagram @snapclaps — same
3. Create X/Twitter @snapclaps
4. Sign up for Amazon Associates (needs SSN/tax info)
5. Upgrade Buttondown ($9/mo) to enable welcome email automations

### Claude Does Next Session:
1. Build a link checker scheduled task (weekly audit of all affiliate URLs)
2. Wire the social-media-poster skill to Paperclip Social Media Manager output
3. Build error fare detection logic (monitor for >50% price drops vs 90-day average)
4. Start the Miles Concierge intake form + agent
5. Set up Google Analytics 4 and wire to Search Console
6. Write 10 more blog posts (Reddit/TikTok-optimized, viral angles)
7. Build a "deal of the day" email trigger (when Deal Scout finds 9+/10 deal, fires email immediately)

---

## INFRASTRUCTURE CREDENTIALS (KEEP PRIVATE)

- **Railway token:** Generate fresh at railway.com/account/tokens each session
- **Travelpayouts account:** 515443, marker=716647
- **Buttondown API key:** `9dd21f02-ed84-4454-af4b-b079ab533b29`
- **Stripe Live:** `acct_1TG76NAHP8NRRyLC` (Varshyl account)
- **Skimlinks ID:** 301475
- **Google Search Console:** Verified via HTML file (googlebbb3e30ca6a47865.html)

---

## BRAND IDENTITY

- **Name:** SnapClaps
- **TikTok persona:** @OopsLuxEscapes
- **Tagline:** "We find the deals. You take the trip."
- **Colors:** Teal #00C9A7 + Coral #FF6B6B + Dark Navy #1A1A2E
- **Vibe:** Exciting but trustworthy. Like a well-traveled friend who texts you when they spot an insane deal.
- **Target:** 25–45 year olds who travel 2–5x/year and hate paying full price

---

## OPEN QUESTIONS FOR STRATEGY DISCUSSION

1. **Miles Concierge pricing** — $49 one-time search fee vs. bundled into Elite? How do we staff it (AI + human hybrid or fully AI)?

2. **OopsLux Deals** — Do we build our own price history database or subscribe to a service? How do we detect error fares before they expire?

3. **Posting pipeline** — Once TikTok/Instagram accounts are created, do we post the agent's scripts manually or automate fully? What's the approval process?

4. **Paid acquisition** — Do we allocate any budget to Google Ads on travel keywords? Even $200/month on "cheap flights" could drive meaningful traffic.

5. **Referral program** — "Give a friend $5 credit, get $5 credit" — does this make sense at the current stage or too early?

6. **Subscription gating** — What do Premium members get that free users don't? Currently: nothing different. This needs to be defined and built.

7. **Link quality monitoring** — Who's watching to make sure our affiliate links work and commissions are tracking? (Currently nobody.)

8. **The Booking.com bet** — When we get approved in June, hotels at 25–40% commission could be our biggest revenue driver. How do we maximize hotel searches on the site?

---

## 🧪 Real User Testing — Layer 9 (Installed April 16, 2026)

### Rule
Before claiming ANY frontend task is "done", run:
```bash
npm run test:real-user:production
```
This must return zero broken indicators on the LIVE URL.
"Tests pass" = only when Layer 9 passes. Backend tests, TS compilation, and Vite build do NOT prove frontend works.

### Infrastructure
- Runner: `tests/real-user/live-site-check.js`
- Config: `tests/real-user/configs/snapclaps.js`
- npm scripts: `test:real-user`, `test:real-user:staging`, `test:real-user:production`

### First Layer 9 Run — April 16, 2026 — PARTIAL PASS

**Deal cards (Netflix rows):** ✅ PASS — real prices, real savings, no $0, no NaN%
**Critical pages (6):** ✅ All return 200

**Bugs found in Hero (FeaturedDeal component):**
- `$$143` — double dollar sign on main price (price prop already has `$`, template adds another)
- `$$850` — double dollar sign on was-price strikethrough
- `$$143` — double dollar sign on "BOOK NOW" button text
- `83% OFF OFF` — "OFF" duplicated on savings badge (`{_savings} OFF` where `_savings` already contains "OFF")

**Root cause:** `FeaturedDeal.tsx` uses `${price}` or `{_savings} OFF` where the prop values already contain `$` and `OFF` respectively.
**Fix required:** Remove duplicate `$` from button text and duplicate `OFF` from savings badge.
**Status:** Not yet fixed — scheduled for follow-up session.

### Lesson Locked In
The previous `$0 / NaN%` bug in deal cards was caught and fixed by running proper browser-level checks.
Do not claim frontend is working without Layer 9 PASS screenshot attached.
