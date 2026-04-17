import { useState } from 'react';

interface Props {
  onNext: (data: { zip_code: string }) => void;
  initial?: { zip_code?: string };
}

export default function Step1Location({ onNext, initial }: Props) {
  const [zip, setZip] = useState(initial?.zip_code || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!zip || zip.length < 5) { setError('Enter a valid 5-digit ZIP code'); return; }
    setError('');
    onNext({ zip_code: zip });
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
      <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 8 }}>
        Where are you flying from?
      </h2>
      <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>
        We'll find the best airports near you — no account needed.
      </p>

      <div style={{ display: 'flex', gap: 12, maxWidth: 320, margin: '0 auto 8px' }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="ZIP Code (e.g. 10001)"
          value={zip}
          onChange={e => setZip(e.target.value.replace(/\D/g, ''))}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            flex: 1, padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif', fontSize: 16, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
          onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '14px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'var(--teal)', color: '#fff', fontFamily: 'Anton, sans-serif',
            fontSize: 16, textTransform: 'uppercase', letterSpacing: 1,
            transition: 'opacity 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={e => (e.currentTarget.style.opacity = '1')}
        >
          Next →
        </button>
      </div>
      {error && <p style={{ color: 'var(--coral)', fontFamily: 'Inter, sans-serif', fontSize: 13, marginTop: 8 }}>{error}</p>}

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginTop: 16 }}>
        We use your ZIP only to find nearby airports — never stored with your identity.
      </p>
    </div>
  );
}
