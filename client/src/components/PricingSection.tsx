import React from 'react';

const TESTIMONIALS = [
  { text: "I asked for business class to Japan under $200 total. Found ANA Business for 55K Amex points and $86 in taxes. Told everyone.", author: "Alex R.", city: "San Francisco" },
  { text: "The Milan error fare for $143 from JFK. Booked in 4 minutes. Weekend in Italy for $180 total including the hotel.", author: "Sarah K.", city: "New York" },
  { text: "Never knew my Chase points could get me to Tokyo in business class. The concierge built the entire trip plan with exact steps.", author: "Marcus T.", city: "Chicago" },
  { text: "The 40% Amex transfer bonus alert saved me $225 per ticket. Would have completely missed it. Premium pays for itself.", author: "Priya M.", city: "Austin" },
  { text: "Bali. Business class both ways. Five nights at the Hyatt. $47 total out of pocket. This is genuinely insane.", author: "Jake L.", city: "Los Angeles" },
];

const PLANS = [
  {
    tier: 'Free', price: '$0', period: '/month', featured: false,
    features: [
      { text: 'Top 3 deals per day (2hr delay)', yes: true },
      { text: 'Full blog access', yes: true },
      { text: 'General miles sweet spots', yes: true },
      { text: 'My Points Wallet', yes: false },
      { text: 'Trip Planner', yes: false },
      { text: 'Error fare alerts', yes: false },
      { text: 'Miles Concierge', yes: false },
    ],
    cta: 'Start Free', ctaHref: '/', ctaOutline: true,
  },
  {
    tier: 'Premium', price: '$9.99', period: '/month', featured: true,
    features: [
      { text: 'All deals — instant access', yes: true },
      { text: 'Error fare alerts within 1 hour', yes: true },
      { text: 'My Points Wallet — full access', yes: true },
      { text: 'Trip Planner (3 searches/month)', yes: true },
      { text: 'Miles Concierge (1 report/month)', yes: true },
      { text: 'Daily deal email alerts', yes: true },
      { text: 'Personalized to your cards', yes: true },
    ],
    cta: 'Start Premium', ctaHref: '/api/upgrade/premium', ctaOutline: false,
  },
  {
    tier: 'Elite', price: '$24.99', period: '/month', featured: false,
    features: [
      { text: 'Everything in Premium', yes: true },
      { text: 'Error fare alerts within 15 min', yes: true },
      { text: 'Trip Planner — unlimited', yes: true },
      { text: 'Miles Concierge (3/month)', yes: true },
      { text: 'Business + First class focus', yes: true },
      { text: 'Transfer bonus priority alerts', yes: true },
      { text: 'Additional reports — $29 each', yes: true },
    ],
    cta: 'Go Elite', ctaHref: '/api/upgrade/elite', ctaOutline: true,
  },
];

export function PricingSection() {
  return (
    <section style={{ padding: '80px 24px', background: '#f3ede4' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px,5vw,52px)', textTransform: 'uppercase', color: '#0f0d2e', lineHeight: 0.92, margin: 0 }}>
            Simple, Honest Pricing
          </h2>
          <p style={{ fontFamily: "'Condiment', cursive", fontSize: 'clamp(20px,3vw,36px)', color: '#00C9A7', marginTop: 8, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            one card referral pays for 10 years of premium
          </p>
        </div>

        {/* Pricing grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 64 }}>
          {PLANS.map(plan => (
            <div key={plan.tier} style={{
              background: 'white', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden',
              border: plan.featured ? '2px solid #00C9A7' : '1.5px solid rgba(15,13,46,0.07)',
              boxShadow: plan.featured ? '0 8px 32px rgba(0,201,167,0.15)' : '0 2px 12px rgba(15,13,46,0.05)',
              transition: 'transform 0.18s, box-shadow 0.18s',
            } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {plan.featured && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#00C9A7', color: '#0f0d2e', fontFamily: "'Anton', sans-serif", fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '0 22px 0 10px' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.featured ? '#00C9A7' : 'rgba(15,13,46,0.35)', marginBottom: 6 }}>{plan.tier}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, color: '#0f0d2e', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(15,13,46,0.35)', fontFamily: "'Inter',sans-serif" }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: f.yes ? 'rgba(15,13,46,0.65)' : 'rgba(15,13,46,0.3)', display: 'flex', gap: 8 }}>
                    <span style={{ color: f.yes ? '#00C9A7' : 'rgba(15,13,46,0.2)', fontWeight: 700, flexShrink: 0 }}>{f.yes ? '✓' : '–'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <a href={plan.ctaHref} style={{
                display: 'block', width: '100%', textAlign: 'center',
                fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase',
                borderRadius: 12, padding: 13, cursor: 'pointer', transition: 'all 0.15s',
                textDecoration: 'none',
                background: plan.ctaOutline ? 'transparent' : '#0f0d2e',
                color: plan.ctaOutline ? '#0f0d2e' : 'white',
                border: plan.ctaOutline ? '2px solid rgba(15,13,46,0.15)' : 'none',
              }}>{plan.cta} →</a>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div>
          <h3 style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 20 }}>💬 Real Travelers, Real Results</h3>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' } as React.CSSProperties}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                minWidth: 300, background: 'white', borderRadius: 18, padding: 24,
                border: '1.5px solid rgba(15,13,46,0.08)',
                boxShadow: '0 2px 12px rgba(15,13,46,0.05)',
              }}>
                <div style={{ fontSize: 14, marginBottom: 10 }}>{'★★★★★'}</div>
                <p style={{ fontSize: 14, fontStyle: 'italic', color: '#2d2b4e', lineHeight: 1.65, marginBottom: 14 }}>"{t.text}"</p>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b6f8a' }}>— {t.author} · {t.city}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default PricingSection;
