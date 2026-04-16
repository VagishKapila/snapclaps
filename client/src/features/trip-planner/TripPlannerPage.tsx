import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FunnelProgress from './components/FunnelProgress';
import TrustBadge from './components/TrustBadge';
import Step1Location from './steps/Step1Location';
import Step2Destination from './steps/Step2Destination';
import Step3Cards from './steps/Step3Cards';
import Step4Processing from './steps/Step4Processing';
import type { WizardStep, TripCard } from './types';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem('sc_session');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('sc_session', id);
  }
  return id;
}

export default function TripPlannerPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>(1);
  const [sessionId] = useState(getOrCreateSessionId);
  const [searchId, setSearchId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    zip_code: '', destination: '', travel_month: '',
    duration_days: 7, cabin_class: 'any' as const,
    flexible_dates: true, cards: [] as TripCard[], no_cards: false,
  });

  const handleStep1 = (data: { zip_code: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2 = (data: { destination: string; travel_month: string; duration_days: number }) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3 = async (data: { cards: TripCard[]; no_cards: boolean }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    setStep(4);

    try {
      const res = await fetch('/api/plan/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-session-id': sessionId },
        body: JSON.stringify({ ...updated, session_id: sessionId }),
      });
      const result = await res.json();
      if (result.search_id) setSearchId(result.search_id);
    } catch (err) {
      console.error('Search submit error:', err);
    }
  };

  const handleProcessingComplete = () => {
    if (searchId) {
      navigate(`/plan/${searchId}?session_id=${sessionId}`);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingTop: 80 }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontFamily: 'Condiment, cursive', fontSize: 22, color: 'var(--teal)', margin: '0 0 4px' }}>
            your personal miles expert
          </p>
          <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: 'var(--navy)', textTransform: 'uppercase', margin: '0 0 8px' }}>
            AI Trip Planner
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 15 }}>
            Tell us where you want to go. We'll tell you exactly how to get there with your points.
          </p>
        </div>

        <TrustBadge />
        <FunnelProgress current={step} />

        <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          {step === 1 && <Step1Location onNext={handleStep1} initial={{ zip_code: formData.zip_code }} />}
          {step === 2 && <Step2Destination onNext={handleStep2} initial={{ destination: formData.destination, travel_month: formData.travel_month, duration_days: formData.duration_days }} />}
          {step === 3 && <Step3Cards onNext={handleStep3} initial={{ cards: formData.cards, no_cards: formData.no_cards }} />}
          {step === 4 && searchId && (
            <Step4Processing searchId={searchId} destination={formData.destination} onComplete={handleProcessingComplete} />
          )}
          {step === 4 && !searchId && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b' }}>Starting your search...</p>
            </div>
          )}
        </div>

        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(s => (s - 1) as WizardStep)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontFamily: 'Inter, sans-serif', fontSize: 14, marginTop: 16, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}
