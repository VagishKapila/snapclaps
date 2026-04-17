import { useEffect, useState } from 'react';

interface Props {
  searchId: number;
  destination: string;
  onComplete: () => void;
}

const MESSAGES = [
  'Checking award availability across 27 airlines...',
  'Scanning Seats.aero for real-time seats...',
  'Matching your points to programs...',
  'Calculating miles + taxes...',
  'Finding hotel award options...',
  'Building your personalized plan...',
];

export default function Step4Processing({ searchId, destination, onComplete }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgInterval = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1800);
    const dotInterval = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/plan/${searchId}/status`);
        const data = await res.json();
        if (data.status === 'complete' || data.has_plan) {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          clearInterval(dotInterval);
          onComplete();
        } else if (data.status === 'error') {
          clearInterval(pollInterval);
          clearInterval(msgInterval);
          clearInterval(dotInterval);
          onComplete();
        }
      } catch { /* network hiccup, keep polling */ }
    }, 2000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(dotInterval);
      clearInterval(pollInterval);
    };
  }, [searchId, onComplete]);

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 24, animation: 'float 2s ease-in-out infinite' }}>✈️</div>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>

      <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 8 }}>
        Building Your Plan
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 15, marginBottom: 32 }}>
        Checking real award availability to <strong>{destination}</strong>
      </p>

      <div style={{ background: '#e2e8f0', borderRadius: 8, height: 8, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: 'var(--teal)', borderRadius: 8,
          animation: 'progress 8s ease-out forwards',
        }} />
        <style>{`@keyframes progress { from { width: 5%; } to { width: 95%; } }`}</style>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--navy)', minHeight: 24 }}>
        {MESSAGES[msgIdx]}{dots}
      </p>

      <div style={{ marginTop: 40, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
          🔒 <strong>Your data is safe.</strong> We're checking Seats.aero's live award inventory — the same data points experts use. No credit card required to see results.
        </p>
      </div>
    </div>
  );
}
