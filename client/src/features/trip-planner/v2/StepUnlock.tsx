import { useState } from 'react';
import { colors, fonts, radius, shadows } from './styles';

interface Props {
  searchId: string | number;
  stripeMode: string;
  monthlyPriceCents: number;
  onetimePriceCents: number;
  onConfirm: (plan: 'monthly' | 'onetime') => Promise<void>;
}

export default function StepUnlock({ searchId, stripeMode, monthlyPriceCents, onetimePriceCents, onConfirm }: Props) {
  const [loading, setLoading] = useState<'monthly' | 'onetime' | null>(null);
  const [error, setError] = useState('');
  const isTest = stripeMode === 'test';
  const isLive = stripeMode === 'live';

  async function handleClick(plan: 'monthly' | 'onetime') {
    setLoading(plan);
    setError('');
    try {
      await onConfirm(plan);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  const monthlyPrice = `$${(monthlyPriceCents / 100).toFixed(2)}/month`;
  const onetimePrice = `$${(onetimePriceCents / 100).toFixed(0)}`;

  return (
    <div>
      <h2 style={{ fontFamily: fonts.display, fontSize: 26, color: colors.warmBlack, margin: '0 0 8px', fontWeight: 400, lineHeight: 1.2 }}>
        Unlock your full plan
      </h2>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 28px', lineHeight: 1.6 }}>
        You already have the points. We show you exactly which program to use, step-by-step booking instructions, and how to transfer your points.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {/* DIY Pro — Monthly */}
        <div style={{
          borderRadius: radius.lg,
          border: `1.5px solid ${colors.emerald}`,
          padding: '20px',
          background: colors.white,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Best value badge */}
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: colors.emerald,
            color: colors.white,
            fontFamily: fonts.body,
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: radius.full,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Most popular
          </div>

          <div style={{ marginBottom: 4 }}>
            {(isTest || isLive) && (
              <span style={{
                display: 'inline-block',
                fontFamily: fonts.body,
                fontSize: 10,
                color: colors.emerald,
                background: colors.emeraldFaint,
                padding: '2px 7px',
                borderRadius: radius.full,
                fontWeight: 700,
                marginBottom: 6,
                border: `1px solid ${colors.emerald}`,
              }}>
                {isLive ? 'Launch pricing' : 'Test mode'}
              </span>
            )}
          </div>

          <h3 style={{ fontFamily: fonts.display, fontSize: 20, color: colors.warmBlack, fontWeight: 400, margin: '0 0 4px' }}>
            DIY Pro
          </h3>
          <div style={{ fontFamily: fonts.display, fontSize: 28, color: colors.emerald, margin: '0 0 8px' }}>
            {monthlyPrice}
          </div>
          <ul style={{ margin: '0 0 16px', padding: '0 0 0 18px', listStyle: 'none' }}>
            {[
              'Exact program name + airline revealed',
              'Step-by-step booking walkthrough',
              'Transfer instructions from your cards',
              'Unlimited searches for 30 days',
              'Cancel anytime',
            ].map((item, i) => (
              <li key={i} style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.gray600,
                padding: '3px 0 3px 20px',
                position: 'relative',
              }}>
                <span style={{ position: 'absolute', left: 0, color: colors.emerald }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleClick('monthly')}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: radius.full,
              background: colors.emerald,
              color: colors.white,
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: loading !== null ? 'wait' : 'pointer',
              opacity: loading !== null ? 0.7 : 1,
              boxShadow: shadows.card,
            }}
          >
            {loading === 'monthly' ? 'Redirecting to checkout…' : `Unlock for ${monthlyPrice}`}
          </button>
        </div>

        {/* Concierge — One-time */}
        <div style={{
          borderRadius: radius.lg,
          border: `1.5px solid ${colors.gray200}`,
          padding: '20px',
          background: colors.white,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ marginBottom: 4 }}>
            {(isTest || isLive) && (
              <span style={{
                display: 'inline-block',
                fontFamily: fonts.body,
                fontSize: 10,
                color: colors.emerald,
                background: colors.emeraldFaint,
                padding: '2px 7px',
                borderRadius: radius.full,
                fontWeight: 700,
                marginBottom: 6,
                border: `1px solid ${colors.emerald}`,
              }}>
                {isLive ? 'Launch pricing' : 'Test mode'}
              </span>
            )}
          </div>

          <h3 style={{ fontFamily: fonts.display, fontSize: 20, color: colors.warmBlack, fontWeight: 400, margin: '0 0 4px' }}>
            Concierge
          </h3>
          <div style={{ fontFamily: fonts.display, fontSize: 28, color: colors.warmBlack, margin: '0 0 4px' }}>
            {onetimePrice}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray400, margin: '0 0 8px' }}>
            One-time, for this trip
          </div>

          <ul style={{ margin: '0 0 16px', padding: '0 0 0 18px', listStyle: 'none' }}>
            {[
              'Everything in DIY Pro',
              'We book the award for you',
              'We handle the transfer + call',
              'Dedicated to your exact trip',
            ].map((item, i) => (
              <li key={i} style={{
                fontFamily: fonts.body,
                fontSize: 13,
                color: colors.gray600,
                padding: '3px 0 3px 20px',
                position: 'relative',
              }}>
                <span style={{ position: 'absolute', left: 0, color: colors.gold }}>✦</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleClick('onetime')}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: radius.full,
              background: colors.warmBlack,
              color: colors.white,
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 14,
              border: 'none',
              cursor: loading !== null ? 'wait' : 'pointer',
              opacity: loading !== null ? 0.7 : 1,
            }}
          >
            {loading === 'onetime' ? 'Redirecting to checkout…' : `Book for me — ${onetimePrice}`}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.coral, textAlign: 'center', margin: '0 0 16px' }}>{error}</p>
      )}

      <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray400, textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
        Secure checkout via Stripe · Cancel anytime · No hidden fees
      </p>
    </div>
  );
}
