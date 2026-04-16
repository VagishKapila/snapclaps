import { useState } from 'react';
import { FeaturedDeal } from '../components/FeaturedDeal';
import { AriaStrip } from '../components/AriaStrip';
import { DealRow } from '../components/DealRow';
import PointsWalletSection from '../components/PointsWalletSection';
import PricingSection from '../components/PricingSection';
import { useDeals } from '../hooks/useDeals';
import { MOCK_DEALS, FEATURED_DEAL, ARIA_DEFAULT } from '../lib/constants';
import type { Deal } from '../types';

export default function HomePage() {
  const [showPointsPath, setShowPointsPath] = useState(false);
  const { errorFares, flights, loading } = useDeals();

  // Use live error fares if available, else mock
  const liveErrorFares = errorFares.length > 0 ? errorFares : MOCK_DEALS.errorFares as Deal[];
  const liveFlights = flights.length > 0 ? flights : MOCK_DEALS.flights as Deal[];

  return (
    <main>
      {/* Hero + Aria */}
      <div style={{ padding: '20px 24px 0', maxWidth: 1280, margin: '0 auto' }}>
        <FeaturedDeal
          route={FEATURED_DEAL.route}
          price={FEATURED_DEAL.price}
          wasPrice={FEATURED_DEAL.wasPrice}
          savings={FEATURED_DEAL.savings}
          detail={FEATURED_DEAL.detail}
          bookUrl={FEATURED_DEAL.bookUrl}
          foundMinutesAgo={FEATURED_DEAL.foundMinutesAgo}
          onGetFree={() => setShowPointsPath(true)}
        />

        <AriaStrip message={ARIA_DEFAULT.message} onCta={() => setShowPointsPath(true)} />

        {showPointsPath && (
          <div style={{ background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', borderRadius: '0 0 20px 20px', padding: '24px 32px', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, letterSpacing: '0.08em', color: '#3730a3', marginBottom: 16, textTransform: 'uppercase' }}>✦ Your path to Milan for FREE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 20 }}>
              {[
                { n: 1, title: 'Apply for Chase Sapphire Preferred', desc: '$95/yr · 60K bonus points = 2 roundtrips to Europe' },
                { n: 2, title: 'Transfer 28K Chase UR → Turkish Miles', desc: '1:1 transfer · Instant · Free · Keep 32K for next trip' },
                { n: 3, title: 'Book JFK→MXP on Turkish.com', desc: '28K miles + ~$25 taxes · Milan for $25 per person' },
              ].map(step => (
                <div key={step.n} style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, textTransform: 'uppercase', color: 'rgba(55,48,163,0.5)', marginBottom: 6 }}>Step {step.n}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#3730a3', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(15,13,46,0.4)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred" target="_blank" rel="noopener noreferrer" style={{ background: '#6d28d9', color: 'white', fontWeight: 700, fontSize: 14, padding: '13px 24px', borderRadius: 10, textDecoration: 'none' }}>
                Apply for Chase Sapphire — 60K Points →
              </a>
              <div style={{ fontSize: 11, color: 'rgba(15,13,46,0.3)' }}>Affiliate link · We earn a commission · You pay nothing extra</div>
            </div>
          </div>
        )}
      </div>

      {/* Live Deal Rows */}
      <div style={{ padding: '0 24px 40px', maxWidth: 1280, margin: '0 auto' }}>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'rgba(15,13,46,0.4)', fontSize: 14 }}>Loading live deals...</div>
        ) : (
          <>
            <DealRow title="🚨 Error Fares" badgeText={`${liveErrorFares.length} live · disappear fast`} badgeColor="#FF6B6B" deals={liveErrorFares} seeAllHref="/error-fares" />
            <DealRow title="✈️ Points Sweet Spots" badgeText="Use your miles now" badgeColor="#00C9A7" deals={MOCK_DEALS.points as Deal[]} seeAllHref="/miles-cards" />
            <DealRow title="🛫 Flight Deals Today" badgeText={`${liveFlights.length} deals live`} badgeColor="#00C9A7" deals={liveFlights} seeAllHref="/deals" />
          </>
        )}
      </div>

      <PointsWalletSection />
      <PricingSection />
    </main>
  );
}
