import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import type { Deal } from '../types';
import { MOCK_DEALS } from '../lib/constants';

// The card recommendation engine — heart of the revenue
const CARD_PATHS: Record<string, { card: string; bonus: string; fee: string; path: string; url: string }> = {
  europe: { card: 'Chase Sapphire Preferred', bonus: '60,000 Chase points', fee: '$95/yr', path: 'Transfer 28K Chase UR → Turkish Miles → Book on Turkish.com (~$25 taxes)', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred' },
  japan: { card: 'Amex Platinum', bonus: '80,000 Amex points', fee: '$695/yr', path: 'Transfer 55K Amex MR → Virgin Atlantic → Book ANA Business on virgin.com (~$86 taxes)', url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/' },
  caribbean: { card: 'Chase Sapphire Preferred', bonus: '60,000 Chase points', fee: '$95/yr', path: 'Use Chase Travel portal at 1.25¢/point OR transfer to Hyatt for hotel. Pure cash deal saves most.', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred' },
  default: { card: 'Chase Sapphire Preferred', bonus: '60,000 Chase points', fee: '$95/yr', path: 'Transfer points to 14+ airline partners. This deal may be cashable or coverable with points.', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred' },
};

function getCardPath(route: string) {
  const r = route.toLowerCase();
  if (r.includes('milan') || r.includes('paris') || r.includes('london') || r.includes('europe')) return CARD_PATHS.europe;
  if (r.includes('tokyo') || r.includes('japan') || r.includes('bali') || r.includes('asia')) return CARD_PATHS.japan;
  if (r.includes('cancun') || r.includes('caribbean') || r.includes('mexico')) return CARD_PATHS.caribbean;
  return CARD_PATHS.default;
}

function findDeal(id: string): Deal | null {
  const all = [...MOCK_DEALS.errorFares, ...MOCK_DEALS.points, ...MOCK_DEALS.flights] as Deal[];
  return all.find(d => d.id === id || d.route.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(id)) || all[0];
}

export default function DealPage() {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [showPath, setShowPath] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const found = findDeal(id || '');
    setDeal(found);
  }, [id]);

  if (!deal) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: "'Anton', sans-serif", fontSize: 24, color: '#0f0d2e' }}>
        Loading deal...
      </div>
    );
  }

  const cardPath = getCardPath(deal.route);
  const isError = deal.type === 'error_fare';

  return (
    <main style={{ minHeight: '100vh', background: '#f9f7f4' }}>
      {/* HERO — the deal, full screen */}
      <div style={{
        background: 'linear-gradient(145deg,#0f0d2e 0%,#1e1b4b 50%,#0d3b2e 100%)',
        padding: '40px 24px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, background: 'rgba(0,201,167,0.15)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, background: 'rgba(255,107,107,0.1)', borderRadius: '50%', filter: 'blur(80px)' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            {isError && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,107,107,0.9)', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '7px 14px', borderRadius: 100 }}>
                <span style={{ width: 7, height: 7, background: 'white', borderRadius: '50%', animation: 'pulse-dot 1.4s infinite', display: 'inline-block' }} />
                🚨 Live Error Fare
              </span>
            )}
            <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, padding: '7px 14px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.15)' }}>
              ✦ AI found this deal
            </span>
          </div>

          {/* Route — HUGE */}
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(40px,8vw,88px)', textTransform: 'uppercase', color: 'white', lineHeight: 0.92, letterSpacing: '-0.02em', marginBottom: 16 }}>
            {deal.route}
          </h1>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(48px,8vw,80px)', color: '#00C9A7', lineHeight: 1 }}>{deal.price}</span>
            {deal.originalPrice && <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>{deal.originalPrice}</span>}
            {deal.savings && <span style={{ background: '#FF6B6B', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 16, textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100 }}>{deal.savings}</span>}
          </div>

          {/* Detail */}
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, lineHeight: 1.6, maxWidth: 600, whiteSpace: 'pre-line' }}>
            {deal.detail}
          </p>
          {isError && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>⚠️ Error fares disappear fast. Airlines must refund within 24 hours if they cancel — safe to book now.</p>}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href={deal.bookUrl} target="_blank" rel="noopener noreferrer" style={{
              background: '#00C9A7', color: '#0f0d2e', fontWeight: 800, fontSize: 16,
              padding: '15px 32px', borderRadius: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 24px rgba(0,201,167,0.35)', transition: 'all 0.15s',
            }}>✈ Book Now — {deal.price}</a>
            <button onClick={() => setShowPath(true)} style={{
              background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 15, fontWeight: 600,
              padding: '15px 28px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.15s',
            }}>💳 Get this trip FREE with points →</button>
          </div>
        </div>
      </div>

      {/* ARIA POINTS PATH — the conversion engine */}
      {showPath && (
        <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', padding: '40px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= step ? '#6d28d9' : 'rgba(109,40,217,0.2)', transition: 'background 0.3s' }} />
              ))}
            </div>

            {step === 0 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👩</div>
                  <div style={{ background: 'white', borderRadius: '0 16px 16px 16px', padding: '16px 20px', flex: 1, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, color: '#00C9A7', textTransform: 'uppercase', marginBottom: 6 }}>Aria says</div>
                    <p style={{ fontSize: 15, color: '#0f0d2e', lineHeight: 1.6, margin: 0 }}>
                      Great news — I found you a way to get this <strong>{deal.route}</strong> trip for almost free using <strong>{cardPath.card}</strong> points. The signup bonus alone covers this entire trip. Here's your exact path 👇
                    </p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginBottom: 24 }}>
                  {['Apply for the card', 'Earn your bonus', 'Transfer & book'].map((s, i) => (
                    <div key={i} style={{ background: 'white', borderRadius: 14, padding: 18, border: '1px solid rgba(109,40,217,0.15)' }}>
                      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, color: '#6d28d9', textTransform: 'uppercase', marginBottom: 6 }}>Step {i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0d2e', marginBottom: 4 }}>{s}</div>
                      <div style={{ fontSize: 12, color: 'rgba(15,13,46,0.5)', lineHeight: 1.5 }}>
                        {i === 0 && `${cardPath.card} — ${cardPath.bonus} after spending $4K in first 3 months.`}
                        {i === 1 && `You get ${cardPath.bonus} — enough to cover this entire trip plus more.`}
                        {i === 2 && cardPath.path}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setStep(1)} style={{ background: '#6d28d9', color: 'white', fontWeight: 700, fontSize: 15, padding: '14px 28px', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                  Show Me the Card →
                </button>
              </div>
            )}

            {step === 1 && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(109,40,217,0.1)', marginBottom: 20, border: '2px solid rgba(109,40,217,0.15)' }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 4 }}>{cardPath.card}</div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, color: '#6d28d9', marginBottom: 8 }}>{cardPath.bonus}</div>
                  <div style={{ fontSize: 13, color: 'rgba(15,13,46,0.5)', marginBottom: 16 }}>Annual fee: {cardPath.fee} · Worth it for this trip alone</div>
                  <div style={{ background: 'rgba(109,40,217,0.06)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 14, color: '#3730a3', lineHeight: 1.6 }}>
                    <strong>Your booking path:</strong> {cardPath.path}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <a href={cardPath.url} target="_blank" rel="noopener noreferrer" style={{ background: '#0f0d2e', color: 'white', fontWeight: 800, fontSize: 15, padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
                      Apply for {cardPath.card} →
                    </a>
                    <button onClick={() => setStep(2)} style={{ background: 'rgba(109,40,217,0.08)', color: '#6d28d9', fontWeight: 600, fontSize: 14, padding: '14px 24px', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                      I already have points
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'rgba(15,13,46,0.3)', marginTop: 12 }}>We earn a referral fee when you're approved. You pay nothing extra. FTC compliant.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div style={{ animation: 'fadeUp 0.3s ease', textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 8 }}>You're all set!</h2>
                <p style={{ fontSize: 15, color: 'rgba(15,13,46,0.6)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>
                  {cardPath.path}. Book as soon as you transfer your points — award availability changes daily.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={deal.bookUrl} target="_blank" rel="noopener noreferrer" style={{ background: '#00C9A7', color: '#0f0d2e', fontWeight: 800, fontSize: 15, padding: '14px 28px', borderRadius: 12, textDecoration: 'none' }}>
                    Book {deal.route} Now →
                  </a>
                  <a href="/api/upgrade/premium" style={{ background: '#0f0d2e', color: 'white', fontWeight: 700, fontSize: 14, padding: '14px 24px', borderRadius: 12, textDecoration: 'none' }}>
                    Get Error Fare Alerts (Premium) →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* If path not shown yet, show Aria strip */}
      {!showPath && (
        <div style={{ background: 'white', borderLeft: '4px solid #00C9A7', padding: '18px 28px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 4px 20px rgba(15,13,46,0.06)', flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00C9A7,#00a88c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, position: 'relative' }}>
            👩
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, background: '#22c55e', borderRadius: '50%', border: '2px solid white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Aria says · online now</div>
            <div style={{ fontSize: 14, color: '#0f0d2e' }}>I know exactly how to get this trip free with your points. The {cardPath.card} bonus covers it completely. <strong>Want to see your exact path?</strong></div>
          </div>
          <button onClick={() => setShowPath(true)} style={{ background: '#00C9A7', color: '#0f0d2e', fontWeight: 800, fontSize: 13, padding: '10px 20px', border: 'none', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Aria, show me how →
          </button>
        </div>
      )}

      {/* More deals below */}
      <div style={{ padding: '40px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 16 }}>More Live Deals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
          {(MOCK_DEALS.errorFares as Deal[]).slice(0, 4).filter(d => d.id !== deal.id).map(d => (
            <a key={d.id} href={`/deal/${d.id}`} style={{
              background: 'white', borderRadius: 14, padding: 18, border: '1.5px solid rgba(15,13,46,0.08)',
              textDecoration: 'none', display: 'block', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(15,13,46,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <span style={{ fontSize: 20, marginRight: 6 }}>{d.emoji}</span>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, textTransform: 'uppercase', color: '#0f0d2e', margin: '6px 0 2px' }}>{d.route}</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: '#FF6B6B' }}>{d.price}</div>
              <div style={{ fontSize: 11, color: 'rgba(15,13,46,0.4)' }}>{d.savings}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
