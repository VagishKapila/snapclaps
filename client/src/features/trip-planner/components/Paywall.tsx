interface Props {
  searchId: number;
  sessionId: string;
  onUpgrade: (planType: 'monthly' | 'onetime') => void;
  loading: boolean;
}

export default function Paywall({ onUpgrade, loading }: Props) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #1e3a5f 100%)',
        borderRadius: 20, padding: '36px 28px', color: '#fff', marginBottom: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔓</div>
        <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, textTransform: 'uppercase', marginBottom: 12 }}>
          Unlock Your Full Plan
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
          See all programs, complete step-by-step booking instructions, hotel award options, and which card gets you there if you're short on miles.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '2px solid var(--teal)',
            borderRadius: 16, padding: '20px', minWidth: 180, flex: 1, maxWidth: 240,
          }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, color: 'var(--teal)' }}>$99</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>One-time · This trip</div>
            <ul style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#cbd5e1', paddingLeft: 16, margin: '0 0 20px' }}>
              <li>Full plan for this trip</li>
              <li>All flight options</li>
              <li>Hotel award options</li>
              <li>Booking steps</li>
            </ul>
            <button
              disabled={loading}
              onClick={() => onUpgrade('onetime')}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                background: 'var(--teal)', color: '#fff', fontFamily: 'Anton, sans-serif',
                fontSize: 15, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Redirecting...' : 'Get This Plan →'}
            </button>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.08)', border: '2px solid #e2e8f0',
            borderRadius: 16, padding: '20px', minWidth: 180, flex: 1, maxWidth: 240,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--coral)', color: '#fff', borderRadius: 20, padding: '4px 14px',
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
            }}>BEST VALUE</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 36 }}>$9.99</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>/month · Cancel anytime</div>
            <ul style={{ textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#cbd5e1', paddingLeft: 16, margin: '0 0 20px' }}>
              <li>Unlimited trip plans</li>
              <li>All flight options</li>
              <li>Hotel + card recs</li>
              <li>Error fare alerts</li>
              <li>3 AI concierge searches/mo</li>
            </ul>
            <button
              disabled={loading}
              onClick={() => onUpgrade('monthly')}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: '2px solid var(--teal)',
                background: 'transparent', color: 'var(--teal)', fontFamily: 'Anton, sans-serif',
                fontSize: 15, textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Redirecting...' : 'Subscribe →'}
            </button>
          </div>
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8' }}>
        🔒 Secure checkout via Stripe · Cancel monthly anytime · SnapClaps is trusted by 10,000+ travelers
      </p>
    </div>
  );
}
