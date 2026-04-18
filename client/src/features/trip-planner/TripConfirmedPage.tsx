import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';

export default function TripConfirmedPage() {
  const { searchId } = useParams<{ searchId: string }>();
  const [searchParams] = useSearchParams();
  const stripeSessionId = searchParams.get('session_id') || '';

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchId) return;
    fetch(`/api/plan/${searchId}/full?session_id=${stripeSessionId}`, {
      headers: { 'x-session-id': stripeSessionId },
    })
      .then(async r => {
        if (r.ok) {
          setPlan(await r.json());
        } else if (r.status === 403) {
          setError('subscription_required');
        } else {
          setError('not_found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('network_error');
        setLoading(false);
      });
  }, [searchId, stripeSessionId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 14 }}>
          Unlocking your plan...
        </p>
      </div>
    </div>
  );

  if (error === 'subscription_required') return (
    <div style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 28, color: '#1a1d1a', marginBottom: 12, fontWeight: 400 }}>
          Subscription required
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748b', marginBottom: 24 }}>
          Your session may have expired, or the plan hasn't been unlocked yet.
        </p>
        <Link to="/plan" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: '999px', background: '#0a5c46', color: '#fff', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
          Start a new search →
        </Link>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 14 }}>
          Could not load your plan. <Link to="/plan" style={{ color: '#0a5c46' }}>Try again →</Link>
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f2', paddingTop: 80 }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Success banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: 32,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" fill="#16a34a"/>
            <path d="M5.5 9L8 11.5L12.5 6.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#15803d' }}>
            Plan unlocked — here's exactly how to book
          </span>
        </div>

        {/* Header */}
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 32, color: '#1a1d1a', fontWeight: 400, marginBottom: 8 }}>
          {plan?.destination || 'Your trip'} booking guide
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#64748b', marginBottom: 32 }}>
          {plan?.travel_month} · Full step-by-step instructions below
        </p>

        {/* Flight options */}
        {plan?.flight_options && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #e8e4de' }}>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#1a1d1a', fontWeight: 400, marginBottom: 16 }}>
              Flight options
            </h3>
            <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, margin: 0 }}>
              {typeof plan.flight_options === 'string' ? plan.flight_options : JSON.stringify(plan.flight_options, null, 2)}
            </pre>
          </div>
        )}

        {/* Card recommendations */}
        {plan?.card_recommendations && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #e8e4de' }}>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#1a1d1a', fontWeight: 400, marginBottom: 16 }}>
              Recommended cards
            </h3>
            <pre style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, margin: 0 }}>
              {typeof plan.card_recommendations === 'string' ? plan.card_recommendations : JSON.stringify(plan.card_recommendations, null, 2)}
            </pre>
          </div>
        )}

        {/* Trip summary */}
        {plan?.trip_summary && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #e8e4de' }}>
            <h3 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 22, color: '#1a1d1a', fontWeight: 400, marginBottom: 16 }}>
              Trip summary
            </h3>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#374151', lineHeight: 1.6, margin: 0 }}>
              {plan.trip_summary}
            </p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/plan" style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#0a5c46', textDecoration: 'none', fontWeight: 600 }}>
            Plan another trip →
          </Link>
        </div>
      </div>
    </div>
  );
}
