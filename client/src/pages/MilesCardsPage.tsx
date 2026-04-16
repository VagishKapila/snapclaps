import { DealRow } from '../components/DealRow';
import { MOCK_DEALS } from '../lib/constants';

const CARDS = [
  { name: 'Chase Sapphire Preferred', bonus: '60,000 UR', fee: '$95/yr', best: 'Hyatt hotels, Virgin Atlantic for ANA', url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred' },
  { name: 'Amex Platinum', bonus: '80,000 MR', fee: '$695/yr', best: 'ANA Business via VA, Delta, Singapore', url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/' },
  { name: 'Capital One Venture X', bonus: '75,000 miles', fee: '$395/yr', best: 'Turkish miles, Aeroplan, Singapore', url: 'https://creditcards.capitalone.com/venture-x-credit-card/' },
  { name: 'Citi Strata Premier', bonus: '60,000 TY', fee: '$95/yr', best: 'Turkish, Qatar, Virgin Atlantic', url: 'https://www.citi.com/credit-cards/citi-strata-premier-credit-card' },
];

export default function MilesCardsPage() {
  return (
    <main style={{ padding: '40px 24px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(32px,6vw,64px)', textTransform: 'uppercase', color: '#0f0d2e', lineHeight: 0.92, margin: '0 0 12px 0' }}>✈️ Miles & Cards</h1>
        <p style={{ fontSize: 16, color: 'rgba(15,13,46,0.5)', maxWidth: 560 }}>The best ways to use your points right now, and the cards that get you there.</p>
      </div>

      <DealRow title="✈️ Points Sweet Spots" badgeText="Use your miles now" badgeColor="#00C9A7" deals={MOCK_DEALS.points as any} />

      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 20 }}>💳 Best Travel Cards Right Now</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {CARDS.map(card => (
            <a key={card.name} href={card.url} target="_blank" rel="noopener noreferrer" style={{ background: 'white', borderRadius: 18, padding: 24, border: '1.5px solid rgba(15,13,46,0.08)', textDecoration: 'none', display: 'block', transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(15,13,46,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 8 }}>{card.name}</div>
              <div style={{ fontSize: 24, fontFamily: "'Anton', sans-serif", color: '#00C9A7', marginBottom: 6 }}>{card.bonus}</div>
              <div style={{ fontSize: 12, color: 'rgba(15,13,46,0.4)', marginBottom: 12 }}>Annual fee: {card.fee}</div>
              <div style={{ fontSize: 13, color: 'rgba(15,13,46,0.6)', marginBottom: 16 }}>Best for: {card.best}</div>
              <div style={{ background: '#0f0d2e', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 16px', borderRadius: 8, textAlign: 'center' }}>Learn More →</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
