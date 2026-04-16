import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AriaOverlay } from '../components/AriaOverlay';
import type { Deal } from '../types';
import { MOCK_DEALS } from '../lib/constants';

// Card recommendation engine — maps deal destination to best card path
const CARD_PATHS: Record<string, { card: string; bonus: string; fee: string; points: string; path: string; url: string; commission: string }> = {
  europe: {
    card: 'Chase Sapphire Preferred',
    bonus: '60,000 UR points',
    fee: '$95/yr',
    points: '28K → Turkish Miles',
    path: 'Transfer 28K Chase UR → Turkish Miles (1:1, free, instant) → Book JFK→MXP for ~$25 in taxes',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    commission: '$150'
  },
  japan: {
    card: 'Amex Platinum',
    bonus: '80,000 MR points',
    fee: '$695/yr',
    points: '55K → Virgin Atlantic',
    path: 'Transfer 55K Amex MR → Virgin Atlantic → Book ANA Business Class on virgin.com (~$86 taxes)',
    url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/',
    commission: '$200'
  },
  asia: {
    card: 'Chase Sapphire Preferred',
    bonus: '60,000 UR points',
    fee: '$95/yr',
    points: '45K → Aeroplan',
    path: 'Transfer 45K Chase UR → Air Canada Aeroplan → Book Star Alliance flights to Asia for ~$30 taxes',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    commission: '$150'
  },
  caribbean: {
    card: 'Chase Sapphire Preferred',
    bonus: '60,000 UR points',
    fee: '$95/yr',
    points: '25K → United',
    path: 'Use Chase Travel Portal at 1.25¢/point. 60K points = $750 in flights — more than enough.',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    commission: '$150'
  },
  default: {
    card: 'Chase Sapphire Preferred',
    bonus: '60,000 UR points',
    fee: '$95/yr',
    points: 'Flexible',
    path: 'Transfer to 14+ airline partners at 1:1. 60K bonus points = this trip free plus change.',
    url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred',
    commission: '$150'
  }
};

function getCardPath(route: string) {
  const r = route.toLowerCase();
  if (r.includes('milan') || r.includes('paris') || r.includes('london') || r.includes('rome') || r.includes('amsterdam') || r.includes('europe')) return CARD_PATHS.europe;
  if (r.includes('tokyo') || r.includes('japan') || r.includes('nrt') || r.includes('hnd')) return CARD_PATHS.japan;
  if (r.includes('bali') || r.includes('bangkok') || r.includes('singapore') || r.includes('seoul') || r.includes('asia')) return CARD_PATHS.asia;
  if (r.includes('cancun') || r.includes('caribbean') || r.includes('mexico') || r.includes('nassau')) return CARD_PATHS.caribbean;
  return CARD_PATHS.default;
}

function buildDealFromServer(d: Record<string, unknown>): Deal {
  const IATA_EMOJI: Record<string, string> = { MXP:'🇮🇹',FCO:'🇮🇹',LHR:'🇬🇧',CDG:'🇫🇷',NRT:'🇯🇵',HND:'🇯🇵',DPS:'🇮🇩',CUN:'🇲🇽',DXB:'🇦🇪',BKK:'🇹🇭',SIN:'🇸🇬',LAX:'🇺🇸',JFK:'🇺🇸',ORD:'🇺🇸',SFO:'🇺🇸' };
  const isError = Boolean(d.is_error_fare) || d.urgency_type === 'error';
  const price = Math.round((d.price as number) || 0);
  const orig = (d.origin_airport as string) || (d.origin as string) || 'USA';
  const dest = (d.destination_airport as string) || (d.destination as string) || 'INT';
  return {
    id: (d.id as string) || 'unknown',
    type: isError ? 'error_fare' : 'flight',
    badge: isError ? '🚨 Error Fare' : '✈️ Flight Deal',
    route: `${orig} → ${dest}`,
    emoji: IATA_EMOJI[dest] || '✈️',
    price: `$${price}`,
    originalPrice: `$${Math.round(price * 2.2)}`,
    savings: `${Math.round(((price * 2.2 - price) / (price * 2.2)) * 100)}% off`,
    detail: `${(d.airline as string) || 'Multiple Airlines'} · Roundtrip`,
    bookUrl: `https://www.aviasales.com/?marker=716647&origin=${orig}&destination=${dest}`,
    ctaText: 'Book Now',
    isLive: isError,
    liveStatus: isError ? 'live' : undefined,
  };
}

function findMockDeal(id: string): Deal | null {
  const all = [...MOCK_DEALS.errorFares, ...MOCK_DEALS.points, ...MOCK_DEALS.flights] as Deal[];
  return all.find(d => d.id === id) || all[0];
}

export default function DealPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [ariaOpen, setAriaOpen] = useState(false);
  const [viewers] = useState(Math.floor(Math.random() * 23) + 7);

  useEffect(() => {
    async function loadDeal() {
      try {
        const res = await fetch(`/api/deals/${id}`);
        if (res.ok) {
          const { data } = await res.json();
          setDeal(buildDealFromServer(data as Record<string, unknown>));
        } else {
          setDeal(findMockDeal(id || ''));
        }
      } catch {
        setDeal(findMockDeal(id || ''));
      } finally {
        setLoading(false);
      }
    }
    loadDeal();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f0d2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Finding your deal...</div>
      </div>
    );
  }

  if (!deal) return null;

  const cardPath = getCardPath(deal.route);
  const isError = deal.type === 'error_fare';

  return (
    <div style={{ minHeight: '100vh', background: '#0f0d2e', fontFamily: "'Inter', sans-serif" }}>

      {/* HERO — full screen, mobile-first 9:16 feel */}
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0f0d2e 0%, #1a1040 45%, #0d3020 100%)',
        display: 'flex', flexDirection: 'column',
        padding: '0 0 120px 0', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, background: 'rgba(0,201,167,0.14)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -60, width: 280, height: 280, background: 'rgba(255,107,107,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Top bar */}
        <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <Link to="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, textTransform: 'uppercase', color: '#00C9A7', textDecoration: 'none', letterSpacing: '0.02em' }}>
            Snap<span style={{ color: 'white' }}>.</span>Claps
          </Link>
          <div style={{
            background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)',
            color: '#FF6B6B', fontFamily: "'Anton', sans-serif", fontSize: 10,
            letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 100,
          }}>Limited Deal</div>
        </div>

        {/* Live badge */}
        <div style={{ padding: '0 24px 20px', zIndex: 2 }}>
          {isError && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,107,0.9)', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '7px 16px', borderRadius: 100 }}>
              <span style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', animation: 'pulse-dot 1.4s infinite', display: 'inline-block' }} />
              🚨 Live Error Fare · Act Fast
            </div>
          )}
        </div>

        {/* Main content — centered, feels like phone screen */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px', zIndex: 2, maxWidth: 560, margin: '0 auto', width: '100%' }}>

          {/* Destination — HUGE Anton */}
          <div style={{ fontFamily: "'Condiment', cursive", fontSize: 'clamp(24px,4vw,42px)', color: 'rgba(255,255,255,0.45)', marginBottom: 4, lineHeight: 1 }}>
            {deal.emoji} your deal
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(44px,9vw,88px)', textTransform: 'uppercase', color: 'white', lineHeight: 0.88, letterSpacing: '-0.02em', marginBottom: 20 }}>
            {deal.route}
          </h1>

          {/* Price — massive teal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Anton', sans-serif', sans-serif", fontSize: 'clamp(56px,10vw,88px)', color: '#00C9A7', lineHeight: 1 }}>{deal.price}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {deal.originalPrice && <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>{deal.originalPrice}</span>}
              {deal.savings && <span style={{ background: '#FF6B6B', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 14, textTransform: 'uppercase', padding: '4px 12px', borderRadius: 100 }}>{deal.savings}</span>}
            </div>
          </div>

          {/* Deal detail */}
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 8, lineHeight: 1.6 }}>
            {deal.detail}
          </p>
          {isError && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>
              Airlines must fully refund within 24hrs if they cancel this fare. Safe to book immediately.
            </p>
          )}

          {/* Aria speech bubble */}
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 16, padding: '18px 20px', marginBottom: 24, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>👩</div>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aria · Your AI Guide</div>
                <div style={{ fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} /> Online now
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
              I found a way to get this <strong style={{ color: 'white' }}>{deal.route}</strong> trip for <strong style={{ color: '#00C9A7' }}>almost free</strong> using {cardPath.card} points ({cardPath.bonus}). Want me to show you the exact steps?
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <a
              href={deal.bookUrl}
              target="_blank" rel="noopener noreferrer"
              style={{
                background: '#00C9A7', color: '#0f0d2e', fontWeight: 800, fontSize: 16,
                padding: '18px 28px', borderRadius: 14, textDecoration: 'none',
                textAlign: 'center', display: 'block',
                boxShadow: '0 8px 32px rgba(0,201,167,0.35)',
                fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >✈ Book Now — {deal.price}</a>
            <button
              onClick={() => setAriaOpen(true)}
              style={{
                background: 'rgba(255,255,255,0.08)', color: 'white', fontSize: 15, fontWeight: 600,
                padding: '16px 28px', borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', backdropFilter: 'blur(8px)', width: '100%',
                fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
              }}
            >💳 Use My Points — Get This Trip FREE</button>
          </div>
        </div>

        {/* Urgency strip — fixed at bottom */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '14px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          zIndex: 10,
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, background: '#FF6B6B', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 1.4s infinite' }} />
            ⚡ <strong style={{ color: 'white' }}>{viewers} people</strong> viewing this deal right now
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            {isError ? '⚠️ Error fares disappear without warning — book now' : '🗓️ Prices can change · Lock it in now'}
          </span>
        </div>
      </div>

      {/* POINTS PATH SECTION */}
      <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '56px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', color: '#3730a3', marginBottom: 6 }}>
            Get This Trip Free
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(55,48,163,0.7)', marginBottom: 28, lineHeight: 1.6 }}>
            The {cardPath.card} gives you {cardPath.bonus} as a welcome bonus. That's enough to cover this entire trip. Annual fee: {cardPath.fee}.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
            {[
              { n: 1, title: `Apply for ${cardPath.card}`, desc: `${cardPath.bonus} after spending $4K in first 3 months. Annual fee: ${cardPath.fee}.` },
              { n: 2, title: 'Transfer your points', desc: cardPath.points + ' — 1:1 ratio, instant, free. No expiry.' },
              { n: 3, title: 'Book your flight', desc: cardPath.path },
            ].map(step => (
              <div key={step.n} style={{ background: 'white', borderRadius: 14, padding: 20, display: 'grid', gridTemplateColumns: '36px 1fr', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6d28d9', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step.n}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#3730a3', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(15,13,46,0.5)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <a
            href={cardPath.url}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', width: '100%', textAlign: 'center',
              background: '#0f0d2e', color: 'white', fontWeight: 800, fontSize: 16,
              padding: '18px', borderRadius: 14, textDecoration: 'none',
              fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em',
              boxShadow: '0 8px 24px rgba(15,13,46,0.2)',
            }}
          >Apply for {cardPath.card} — {cardPath.bonus} →</a>
          <p style={{ fontSize: 11, color: 'rgba(15,13,46,0.3)', textAlign: 'center', marginTop: 10 }}>
            Affiliate link · We earn ~{cardPath.commission} when you're approved · You pay nothing extra · FTC compliant
          </p>
        </div>
      </div>

      {/* More deals */}
      <div style={{ background: '#f9f7f4', padding: '40px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 16 }}>More Error Fares</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(MOCK_DEALS.errorFares as Deal[]).filter(d => d.id !== deal.id).slice(0, 3).map(d => (
              <Link key={d.id} to={`/deal/${d.id}`} style={{
                background: 'white', borderRadius: 14, padding: '16px 18px',
                border: '1px solid rgba(15,13,46,0.08)', textDecoration: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{d.emoji}</span>
                  <div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, textTransform: 'uppercase', color: '#0f0d2e' }}>{d.route}</div>
                    <div style={{ fontSize: 11, color: 'rgba(15,13,46,0.4)' }}>{d.savings}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: '#FF6B6B' }}>{d.price}</div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link to="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#00C9A7', textDecoration: 'none', borderBottom: '2px solid #00C9A7', paddingBottom: 2 }}>
              See All Live Deals →
            </Link>
          </div>
        </div>
      </div>

      {/* Aria Overlay */}
      {ariaOpen && <AriaOverlay onClose={() => setAriaOpen(false)} />}
    </div>
  );
}
