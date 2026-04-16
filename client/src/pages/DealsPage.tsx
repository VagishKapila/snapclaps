import { DealRow } from '../components/DealRow';
import { MOCK_DEALS } from '../lib/constants';

interface DealsPageProps {
  filter?: string;
}

export default function DealsPage({ filter }: DealsPageProps) {
  const title = filter === 'error_fare' ? '🚨 Live Error Fares'
    : filter === 'points' ? '✈️ Points Sweet Spots'
    : '🛫 All Deals Today';

  const subtitle = filter === 'error_fare'
    ? 'Airline pricing mistakes. Book fast — they disappear within hours.'
    : filter === 'points'
    ? 'The best ways to use your miles and points right now.'
    : 'Every deal we\'ve found across flights, hotels, and points.';

  const deals = filter === 'error_fare' ? MOCK_DEALS.errorFares
    : filter === 'points' ? MOCK_DEALS.points
    : [...MOCK_DEALS.errorFares, ...MOCK_DEALS.points, ...MOCK_DEALS.flights];

  return (
    <main style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(32px,6vw,64px)', textTransform: 'uppercase', color: '#0f0d2e', lineHeight: 0.92, margin: '0 0 12px 0' }}>{title}</h1>
        <p style={{ fontSize: 16, color: 'rgba(15,13,46,0.5)', maxWidth: 560 }}>{subtitle}</p>
      </div>

      {filter === 'error_fare' && (
        <DealRow title="🚨 Error Fares" badgeText="Disappear fast" badgeColor="#FF6B6B" deals={MOCK_DEALS.errorFares as any} />
      )}
      {filter === 'points' && (
        <>
          <DealRow title="✈️ Points Sweet Spots" badgeText="Use your miles now" badgeColor="#00C9A7" deals={MOCK_DEALS.points as any} />
          <DealRow title="🛫 Flight Deals" badgeText="Cash deals" badgeColor="#00C9A7" deals={MOCK_DEALS.flights as any} />
        </>
      )}
      {!filter && (
        <>
          <DealRow title="🚨 Error Fares" badgeText="3 live now" badgeColor="#FF6B6B" deals={MOCK_DEALS.errorFares as any} />
          <DealRow title="✈️ Points Sweet Spots" badgeText="Use your miles" badgeColor="#00C9A7" deals={MOCK_DEALS.points as any} />
          <DealRow title="🛫 Flight Deals" badgeText="43 live" badgeColor="#00C9A7" deals={MOCK_DEALS.flights as any} />
        </>
      )}

      {/* Upsell for Premium */}
      <div style={{ background: 'linear-gradient(135deg,#0f0d2e,#1e1b4b)', borderRadius: 20, padding: '40px 32px', textAlign: 'center', marginTop: 40 }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', color: 'white', marginBottom: 12 }}>Get Error Fares Before They Die</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>Free users see deals 2 hours late. Premium members get notified within 60 minutes. Elite within 15 minutes.</p>
        <a href="/api/upgrade/premium" style={{ background: '#00C9A7', color: '#0f0d2e', fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '14px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-block' }}>
          Start Premium — $9.99/mo →
        </a>
      </div>
    </main>
  );
}
