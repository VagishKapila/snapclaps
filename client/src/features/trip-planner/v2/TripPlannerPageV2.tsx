// Trip Planner v2
// Tagline: "You already have the points. We show you how to use them."
// Steps: Where you are → Destination → Your plan → Book it
// Palette: emerald #0a5c46, cream #faf7f2, warm black #1a1d1a, gold #c8a15c
// Fonts: Instrument Serif (display) + Figtree (body)

import { useState, useEffect, useCallback } from 'react';
import StepIndicator from './StepIndicator';
import TrustStrip from './TrustStrip';
import StepWhereYouAre from './StepWhereYouAre';
import StepDestination from './StepDestination';
import StepResults, { type SearchResult } from './StepResults';
import StepCards, { type CardBalance } from './StepCards';
import StepUnlock from './StepUnlock';
import ProcessingScreen from './ProcessingScreen';
import { colors, fonts, radius, shadows } from './styles';
import type { Destination } from '../data/destinations';

type Step = 1 | 2 | 3 | 4;

interface FormState {
  zip: string;
  origin: string;
  destination: Destination | null;
  month: string;
  duration: number | 'flex';
  balances: CardBalance[];
  no_cards: boolean;
}

interface Config {
  stripe_mode: string;
  monthly_price_cents: number;
  onetime_price_cents: number;
}

const defaultConfig: Config = { stripe_mode: 'live', monthly_price_cents: 999, onetime_price_cents: 9900 };

// Fade-in-up animation
const fadeInUp = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

export default function TripPlannerPageV2() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    zip: '', origin: '', destination: null, month: '', duration: 7, balances: [], no_cards: false,
  });
  const [processing, setProcessing] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [config, setConfig] = useState<Config>(defaultConfig);

  useEffect(() => {
    fetch('/api/plan/config')
      .then(r => r.json())
      .then(d => setConfig({ stripe_mode: d.stripe_mode || 'live', monthly_price_cents: d.monthly_price_cents || 999, onetime_price_cents: d.onetime_price_cents || 9900 }))
      .catch(() => {});
  }, []);

  // Step 1 → 2
  function handleWhereYouAre(data: { zip: string; origin: string }) {
    setForm(prev => ({ ...prev, ...data }));
    setStep(2);
  }

  // Step 2 → processing → step 3
  async function handleDestination(data: { destination: Destination; month: string; duration: number | 'flex' }) {
    const updated = { ...form, ...data };
    setForm(updated);

    // Freetext destination (not in seeded list) or no active sweet spot → researching state
    if (data.destination.is_freetext || !data.destination.has_active_sweet_spot) {
      setSearchResult({
        search_id: 'researching',
        business: null,
        economy: null,
        cash_estimate: null,
        transfer_from: [],
        dates: [],
        program_names_hidden: true,
        availability_notes: 'researching',
      });
      setStep(3);
      // Save freetext search to DB (fire and forget)
      if (data.destination.is_freetext) {
        fetch('/api/plan/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: updated.origin,
            destination_airport: 'FREETEXT',
            destination_freetext: data.destination.name,
            travel_month: data.month,
            duration: typeof data.duration === 'number' ? data.duration : 7,
          }),
        }).catch(() => {});
      }
      return;
    }

    setProcessing(true);
    setStep(3);

    try {
      const res = await fetch('/api/plan/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: updated.origin,
          destination_airport: data.destination.airport,
          travel_month: data.month,
          duration: typeof data.duration === 'number' ? data.duration : 7,
        }),
      });
      const result = await res.json();
      setSearchResult(result);
    } catch {
      setSearchResult({
        search_id: '',
        business: null,
        economy: null,
        cash_estimate: null,
        transfer_from: [],
        dates: [],
        program_names_hidden: true,
        availability_notes: 'Search failed. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  }

  // Step 3 → 4 (cards)
  function handleResultsNext() {
    setStep(4);
  }

  // Step 4 → unlock (same step 4, show StepUnlock)
  const [showUnlock, setShowUnlock] = useState(false);
  function handleCardsNext(data: { balances: CardBalance[]; no_cards: boolean }) {
    setForm(prev => ({ ...prev, ...data }));
    setShowUnlock(true);
  }

  // Unlock → Stripe
  async function handleUnlockConfirm(plan: 'monthly' | 'onetime') {
    if (!searchResult?.search_id) throw new Error('No search ID');
    const res = await fetch('/api/plan/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, search_id: searchResult.search_id }),
    });
    const data = await res.json();
    if (data.checkout_url) {
      window.location.href = data.checkout_url;
    } else {
      throw new Error('No checkout URL');
    }
  }

  const currentStep: Step = showUnlock ? 4 : step;

  return (
    <div style={{ minHeight: '100vh', background: colors.cream, paddingTop: 80 }}>
      <style>{fadeInUp}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInUp 0.5s ease both' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: colors.emeraldFaint,
            border: `1px solid ${colors.emerald}`,
            borderRadius: radius.full,
            padding: '5px 14px',
            marginBottom: 16,
          }}>
            <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.emerald, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Miles Concierge
            </span>
          </div>
          <h1 style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(28px, 6vw, 40px)',
            color: colors.warmBlack,
            fontWeight: 400,
            margin: '0 0 10px',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}>
            You already have the points.
            <br />
            <em style={{ fontStyle: 'italic', color: colors.emerald }}>We show you how to use them.</em>
          </h1>
          <TrustStrip />
        </div>

        {/* Step indicator */}
        <StepIndicator current={currentStep} />

        {/* Card */}
        <div style={{
          background: colors.white,
          borderRadius: radius.xl,
          padding: '32px 28px',
          boxShadow: shadows.lg,
          animation: 'fadeInUp 0.4s ease both 0.1s',
        }}>
          {step === 1 && (
            <StepWhereYouAre
              onNext={handleWhereYouAre}
              initial={{ zip: form.zip, origin: form.origin }}
            />
          )}

          {step === 2 && (
            <StepDestination
              onNext={handleDestination}
              initial={{ destination: form.destination, month: form.month, duration: form.duration }}
            />
          )}

          {step === 3 && !showUnlock && (
            <>
              {processing ? (
                <ProcessingScreen
                  destination={form.destination?.name || 'your destination'}
                  onComplete={() => {}}
                  delayMs={2200}
                />
              ) : searchResult ? (
                <StepResults
                  result={searchResult}
                  destination={form.destination!}
                  month={form.month}
                  duration={form.duration}
                  homeAirport={form.origin}
                  onNext={handleResultsNext}
                  onBack={() => setStep(2)}
                />
              ) : (
                <ProcessingScreen destination={form.destination?.name || 'your destination'} onComplete={() => {}} />
              )}
            </>
          )}

          {step === 4 && !showUnlock && (
            <StepCards
              onNext={handleCardsNext}
              onBack={() => setStep(3)}
            />
          )}

          {showUnlock && searchResult && (
            <StepUnlock
              searchId={searchResult.search_id}
              stripeMode={config.stripe_mode}
              monthlyPriceCents={config.monthly_price_cents}
              onetimePriceCents={config.onetime_price_cents}
              onConfirm={handleUnlockConfirm}
            />
          )}
        </div>

        {/* Back button (steps 2-3, not on unlock) */}
        {step > 1 && step < 4 && !showUnlock && !processing && (
          <button
            onClick={() => {
              if (step === 3) setStep(2);
              else if (step === 2) setStep(1);
            }}
            style={{
              display: 'block',
              margin: '16px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.gray400,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            ← Back
          </button>
        )}
        {showUnlock && (
          <button
            onClick={() => setShowUnlock(false)}
            style={{
              display: 'block',
              margin: '16px auto 0',
              background: 'none',
              border: 'none',
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.gray400,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
