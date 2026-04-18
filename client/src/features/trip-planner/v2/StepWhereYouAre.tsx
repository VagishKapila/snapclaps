import { useState } from 'react';
import { colors, fonts, radius, shadows } from './styles';
import { getAirportsForZip } from '../data/zip-airports';

interface Props {
  onNext: (data: { zip: string; origin: string }) => void;
  initial?: { zip?: string; origin?: string };
}

export default function StepWhereYouAre({ onNext, initial = {} }: Props) {
  const [zip, setZip] = useState(initial.zip || '');
  const [origin, setOrigin] = useState(initial.origin || '');
  const [manualMode, setManualMode] = useState(false);
  const [error, setError] = useState('');

  const result = zip.length >= 5 ? getAirportsForZip(zip) : null;

  function handleZipChange(v: string) {
    const clean = v.replace(/\D/g, '').slice(0, 5);
    setZip(clean);
    setError('');
    if (clean.length >= 5) {
      const found = getAirportsForZip(clean);
      if (found && found.airports.length > 0) {
        setOrigin(found.airports[0].code);
        setManualMode(false);
      } else {
        setOrigin('');
        setManualMode(true);
      }
    } else {
      setOrigin('');
    }
  }

  function handleSubmit() {
    if (!origin || origin.length !== 3) {
      setError('Please select your departure airport.');
      return;
    }
    onNext({ zip, origin });
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.warmBlack,
    background: colors.white,
    border: `1.5px solid ${colors.gray200}`,
    borderRadius: radius.md,
    padding: '14px 16px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div>
      <h2 style={{ fontFamily: fonts.display, fontSize: 26, color: colors.warmBlack, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.2 }}>
        Where are you flying from?
      </h2>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 28px' }}>
        We'll find the best award options from your nearest airports.
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
          Your ZIP code
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={zip}
          onChange={e => handleZipChange(e.target.value)}
          placeholder="e.g. 10001"
          style={inputStyle}
        />
      </div>

      {result && !manualMode && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
            Select your airport
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.airports.map(apt => (
              <button
                key={apt.code}
                onClick={() => setOrigin(apt.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: radius.md,
                  border: `1.5px solid ${origin === apt.code ? colors.emerald : colors.gray200}`,
                  background: origin === apt.code ? colors.emeraldFaint : colors.white,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: 18,
                  fontWeight: 700,
                  color: origin === apt.code ? colors.emerald : colors.warmBlack,
                  minWidth: 44,
                }}>
                  {apt.code}
                </span>
                <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600 }}>
                  {apt.name} — {apt.city}
                </span>
                {origin === apt.code && (
                  <div style={{ marginLeft: 'auto' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="9" fill={colors.emerald} />
                      <path d="M5 9L7.5 11.5L13 6.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setManualMode(true); setOrigin(''); }}
            style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray400, background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
          >
            Different airport?
          </button>
        </div>
      )}

      {(manualMode || (zip.length >= 5 && !result)) && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
            {zip.length >= 5 && !result
              ? "We don't recognize that ZIP yet — enter your airport code:"
              : 'Enter your airport code (e.g. JFK, LAX, ORD)'}
          </label>
          <input
            type="text"
            value={origin}
            onChange={e => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="JFK"
            maxLength={3}
            style={{ ...inputStyle, textTransform: 'uppercase', fontWeight: 700, fontSize: 18, letterSpacing: '0.1em' }}
          />
        </div>
      )}

      {error && (
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.coral, margin: '0 0 16px' }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!origin || origin.length !== 3}
        style={{
          width: '100%',
          padding: '15px 24px',
          borderRadius: radius.full,
          background: (!origin || origin.length !== 3) ? colors.gray200 : colors.emerald,
          color: (!origin || origin.length !== 3) ? colors.gray400 : colors.white,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: (!origin || origin.length !== 3) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: (!origin || origin.length !== 3) ? 'none' : shadows.card,
        }}
      >
        Continue →
      </button>
    </div>
  );
}
