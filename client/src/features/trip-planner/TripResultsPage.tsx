import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ResultsTeaser from './components/ResultsTeaser';
import Paywall from './components/Paywall';
import FullTripPlan from './components/FullTripPlan';
import type { TripPlan } from './types';

export default function TripResultsPage() {
  const { searchId } = useParams<{ searchId: string }>();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id') || sessionStorage.getItem('sc_session') || '';
  const paid = searchParams.get('paid') === 'true';

  const [teaser, setTeaser] = useState<any>(null);
  const [fullPlan, setFullPlan] = useState<TripPlan | null>(null);
  const [hasPaid, setHasPaid] = useState(paid);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!searchId) return;
    fetch(`/api/plan/${searchId}/teaser`)
      .then(r => r.json())
      .then(d => { setTeaser(d); setLoading(false); })
      .catch(() => { setError('Could not load plan'); setLoading(false); });

    if (paid) {
      fetch(`/api/plan/${searchId}/full`, {
        headers: { 'x-session-id': sessionId },
      }).then(async r => {
        if (r.ok) { setFullPlan(await r.json()); setHasPaid(true); }
      }).catch(() => {});
    }
  }, [searchId, paid, sessionId]);

  const handleUpgrade = async (planType: 'monthly' | 'onetime') => {
    setPayLoading(true);
    try {
      const res = await fetch('/api/plan/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_id: Number(searchId), plan_type: planType, session_id: sessionId }),
      });
      const data = await res.json();
      if (data.checkout_url) window.location.href = data.checkout_url;
      else setError('Could not start checkout. Please try again.');
    } catch {
      setError('Checkout failed. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b' }}>Loading your plan...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--coral)' }}>{error}</p>
        <Link to="/plan" style={{ color: 'var(--teal)', fontFamily: 'Inter, sans-serif' }}>Start a new search →</Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 80 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 36, color: 'var(--navy)', textTransform: 'uppercase', margin: 0 }}>
              Your Trip Plan
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Real award data · Step-by-step booking guide
            </p>
          </div>
          <Link to="/plan" style={{
            padding: '10px 18px', borderRadius: 10, background: '#f1f5f9',
            color: 'var(--navy)', fontFamily: 'Inter, sans-serif', fontSize: 13,
            textDecoration: 'none', fontWeight: 600,
          }}>
            Plan Another Trip →
          </Link>
        </div>

        {teaser && <ResultsTeaser data={{ ...teaser, emoji: teaser.emoji || '✈️' }} />}

        {hasPaid && fullPlan ? (
          <FullTripPlan plan={fullPlan} />
        ) : (
          <Paywall
            searchId={Number(searchId)}
            sessionId={sessionId}
            onUpgrade={handleUpgrade}
            loading={payLoading}
          />
        )}

        {error && <p style={{ color: 'var(--coral)', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginTop: 16 }}>{error}</p>}
      </div>
    </div>
  );
}
