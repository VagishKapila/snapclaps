import React from 'react';

const PLANS = [
  {
    tier: 'Free', price: '$0', period: '/month', featured: false,
    tagline: 'Get a feel for SnapClaps',
    features: [
      { yes: true,  text: 'Top 3 deals per day (2hr delay)' },
      { yes: true,  text: 'Full blog access' },
      { yes: true,  text: 'General miles sweet spots' },
      { yes: false, text: 'My Points Wallet' },
      { yes: false, text: 'Trip Planner' },
      { yes: false, text: 'Error fare alerts' },
      { yes: false, text: 'Miles Concierge' },
      { yes: false, text: 'Daily email alerts' },
    ],
    cta: 'Start Free', href: '/', outline: true,
  },
  {
    tier: 'Premium', price: '$9.99', period: '/month', featured: true,
    tagline: 'For serious deal hunters',
    features: [
      { yes: true, text: 'All deals — instant access' },
      { yes: true, text: 'Error fare alerts within 1 hour' },
      { yes: true, text: 'My Points Wallet — full access' },
      { yes: true, text: 'Trip Planner (3 searches/month)' },
      { yes: true, text: 'Miles Concierge (1 report/month)' },
      { yes: true, text: 'Daily deal email alerts' },
      { yes: true, text: 'Personalized to your cards' },
      { yes: true, text: 'Cancel anytime' },
    ],
    cta: 'Start Premium', href: '/api/upgrade/premium', outline: false,
  },
  {
    tier: 'Elite', price: '$24.99', period: '/month', featured: false,
    tagline: 'For points obsessives',
    features: [
      { yes: true, text: 'Everything in Premium' },
      { yes: true, text: 'Error fare alerts within 15 min' },
      { yes: true, text: 'Trip Planner — unlimited' },
      { yes: true, text: 'Miles Concierge (3/month)' },
      { yes: true, text: 'Business + First class focus' },
      { yes: true, text: 'Transfer bonus priority alerts' },
      { yes: true, text: 'Additional concierge reports $29' },
      { yes: true, text: 'Cancel anytime' },
    ],
    cta: 'Go Elite', href: '/api/upgrade/elite', outline: true,
  },
];

const FAQ = [
  { q: 'What do I actually get with Premium?', a: 'All deals with no delay (free users wait 2 hours), error fare alerts within 60 minutes, My Points Wallet to see what you can book with your miles, Trip Planner to find the optimal way to use your points, and 1 Miles Concierge report per month.' },
  { q: 'What\'s Miles Concierge?', a: 'You tell Aria where you want to go. We search 26 airline programs, find the best award availability for your cards, and send you a step-by-step booking guide. It\'s like having a personal travel agent who\'s an expert in points.' },
  { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no questions. Cancel from your account page or email us. You keep access until the end of your billing period.' },
  { q: 'How fast are error fare alerts?', a: 'Premium members get alerted within 60 minutes of us finding an error fare. Elite members get alerted within 15 minutes. Free users see it 2 hours later — and most error fares are gone by then.' },
  { q: 'Do you take kickbacks from airlines?', a: 'Never. We earn commissions when you book through our links (standard industry practice, fully disclosed), but we never show a deal because an airline paid us. We show the genuinely best deals.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are processed by Stripe with 256-bit encryption. We never store your card information.' },
];

export default function PricingPage() {
  return (
    <main style={{ background: '#f9f7f4' }}>
      {/* Hero */}
      <div style={{ padding: '64px 24px 48px', textAlign: 'center', background: 'linear-gradient(160deg,#0f0d2e,#1e1b4b)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(0,201,167,0.12)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(36px,6vw,64px)', textTransform: 'uppercase', color: 'white', lineHeight: 0.92, marginBottom: 12 }}>
            Simple,<br />Honest Pricing
          </h1>
          <p style={{ fontFamily: "'Condiment', cursive", fontSize: 'clamp(20px,3vw,36px)', color: '#00C9A7', marginBottom: 8, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            one card referral pays for 10 years of premium
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '12px auto 0' }}>
            We find you a deal. You book with points. We earn a card referral commission. Everybody wins.
          </p>
        </div>
      </div>

      {/* Pricing cards */}
      <div style={{ padding: '48px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 64 }}>
          {PLANS.map(plan => (
            <div key={plan.tier} style={{
              background: 'white', borderRadius: 24, padding: 28, position: 'relative', overflow: 'hidden',
              border: plan.featured ? '2px solid #00C9A7' : '1.5px solid rgba(15,13,46,0.08)',
              boxShadow: plan.featured ? '0 12px 40px rgba(0,201,167,0.12)' : '0 2px 12px rgba(15,13,46,0.05)',
              transition: 'transform 0.18s',
            } as React.CSSProperties}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {plan.featured && (
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#00C9A7', color: '#0f0d2e', fontFamily: "'Anton', sans-serif", fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: '0 22px 0 10px' }}>Most Popular</div>
              )}
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: plan.featured ? '#00C9A7' : 'rgba(15,13,46,0.35)', marginBottom: 4 }}>{plan.tier}</div>
              <div style={{ fontSize: 13, color: 'rgba(15,13,46,0.5)', marginBottom: 10 }}>{plan.tagline}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 48, color: '#0f0d2e', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(15,13,46,0.35)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: f.yes ? 'rgba(15,13,46,0.7)' : 'rgba(15,13,46,0.3)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ color: f.yes ? '#00C9A7' : 'rgba(15,13,46,0.2)', fontWeight: 700, flexShrink: 0 }}>{f.yes ? '✓' : '–'}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <a href={plan.href} style={{
                display: 'block', width: '100%', textAlign: 'center',
                fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase',
                borderRadius: 12, padding: 14, textDecoration: 'none', transition: 'all 0.15s',
                background: plan.outline ? 'transparent' : '#0f0d2e',
                color: plan.outline ? '#0f0d2e' : 'white',
                border: plan.outline ? '2px solid rgba(15,13,46,0.15)' : 'none',
              }}>{plan.cta} →</a>
            </div>
          ))}
        </div>

        {/* Value proof */}
        <div style={{ background: 'linear-gradient(135deg,#0f0d2e,#1e1b4b)', borderRadius: 20, padding: '36px 32px', marginBottom: 64, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 24, textAlign: 'center' }}>
          {[
            { num: '47', unit: 'dollars', label: 'Avg out-of-pocket cost for a trip booked with points' },
            { num: '$150', unit: 'commission', label: 'Avg card referral we earn when you apply for a card we recommend' },
            { num: '27', unit: 'blog posts', label: 'SEO articles covering every aspect of travel deals + points' },
            { num: '26', unit: 'airlines', label: 'Award programs monitored for sweet spots and availability' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, color: '#00C9A7', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', margin: '4px 0 8px' }}>{s.unit}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 28, textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 14, padding: 22, border: '1.5px solid rgba(15,13,46,0.07)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0f0d2e', marginBottom: 8 }}>{faq.q}</div>
                <div style={{ fontSize: 14, color: 'rgba(15,13,46,0.6)', lineHeight: 1.65 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, textTransform: 'uppercase', color: '#0f0d2e', marginBottom: 10 }}>Ready to Travel Smarter?</h2>
          <p style={{ fontSize: 15, color: 'rgba(15,13,46,0.5)', marginBottom: 24 }}>Start free. Upgrade when you find a deal worth keeping.</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/" style={{ background: 'rgba(15,13,46,0.06)', color: '#0f0d2e', fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>Browse Deals Free →</a>
            <a href="/api/upgrade/premium" style={{ background: '#0f0d2e', color: 'white', fontFamily: "'Anton', sans-serif", fontSize: 12, letterSpacing: '0.07em', textTransform: 'uppercase', padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}>Start Premium — $9.99/mo →</a>
          </div>
        </div>
      </div>
    </main>
  );
}
