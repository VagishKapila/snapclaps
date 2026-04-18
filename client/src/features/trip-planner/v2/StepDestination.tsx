import { useState, useEffect, useRef } from 'react';
import { colors, fonts, radius, shadows } from './styles';
import type { Destination } from '../data/destinations';
import { DESTINATION_EMOJI, getDisplayName } from '../data/destinations';

interface Props {
  onNext: (data: { destination: Destination; month: string; duration: number }) => void;
  initial?: { destination?: Destination | null; month?: string; duration?: number };
}

const MONTHS = [
  'Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026',
  'Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026',
  'Jan 2027','Feb 2027','Mar 2027','Apr 2027','May 2027','Jun 2027',
];

const DURATIONS = [
  { label: '5 nights', value: 5 },
  { label: '7 nights', value: 7 },
  { label: '10 nights', value: 10 },
  { label: '14 nights', value: 14 },
  { label: '3 weeks', value: 21 },
];

function monthToYYYYMM(label: string): string {
  const [mon, year] = label.split(' ');
  const m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(mon) + 1;
  return `${year}-${String(m).padStart(2, '0')}`;
}

export default function StepDestination({ onNext, initial = {} }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [query, setQuery] = useState(initial.destination ? getDisplayName(initial.destination) : '');
  const [selected, setSelected] = useState<Destination | null>(initial.destination || null);
  const [month, setMonth] = useState(initial.month || '');
  const [duration, setDuration] = useState(initial.duration || 7);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/plan/destinations')
      .then(r => r.json())
      .then(d => setDestinations(d.destinations || []))
      .catch(() => {});
  }, []);

  const filtered = query.length > 0
    ? destinations.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.airport.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : destinations.slice(0, 8);

  function selectDest(d: Destination) {
    setSelected(d);
    setQuery(getDisplayName(d));
    setShowSuggestions(false);
    setError('');
  }

  function handleSubmit() {
    if (!selected) { setError('Please select a destination.'); return; }
    if (!month) { setError('Please select a travel month.'); return; }
    onNext({ destination: selected, month: monthToYYYYMM(month), duration });
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.warmBlack,
    background: colors.white,
    border: `1.5px solid ${colors.gray200}`,
    borderRadius: radius.md,
    padding: '14px 16px',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div>
      <h2 style={{ fontFamily: fonts.display, fontSize: 26, color: colors.warmBlack, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.2 }}>
        Where do you want to go?
      </h2>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 28px' }}>
        Choose a destination. We'll show you the best award options.
      </p>

      {/* Destination search */}
      <div style={{ marginBottom: 20, position: 'relative' }}>
        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
          Destination
        </label>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelected(null);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search cities, countries..."
          style={inputStyle}
        />
        {showSuggestions && filtered.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: colors.white,
            borderRadius: radius.md,
            border: `1px solid ${colors.gray200}`,
            boxShadow: shadows.lg,
            zIndex: 100,
            maxHeight: 280,
            overflowY: 'auto',
          }}>
            {filtered.map(d => (
              <button
                key={d.airport}
                onMouseDown={() => selectDest(d)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '11px 14px',
                  border: 'none',
                  background: selected?.airport === d.airport ? colors.emeraldFaint : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ fontSize: 20, minWidth: 28 }}>{DESTINATION_EMOJI[d.airport] || '🌍'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: colors.warmBlack }}>
                      {getDisplayName(d)}
                    </span>
                    {!d.has_active_sweet_spot && (
                      <span style={{
                        fontFamily: fonts.body,
                        fontSize: 10,
                        color: colors.amber,
                        background: '#fef3c7',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600,
                      }}>
                        Researching
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray400 }}>
                    {d.country} · {d.airport}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Month selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
          When do you want to travel?
        </label>
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b655e' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: 36 }}
        >
          <option value="">Select a month</option>
          {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Duration selector */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: colors.gray600, display: 'block', marginBottom: 8 }}>
          Trip length
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DURATIONS.map(d => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              style={{
                padding: '9px 16px',
                borderRadius: radius.full,
                border: `1.5px solid ${duration === d.value ? colors.emerald : colors.gray200}`,
                background: duration === d.value ? colors.emeraldFaint : colors.white,
                fontFamily: fonts.body,
                fontSize: 13,
                fontWeight: duration === d.value ? 600 : 400,
                color: duration === d.value ? colors.emerald : colors.gray600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.coral, margin: '0 0 16px' }}>{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={!selected || !month}
        style={{
          width: '100%',
          padding: '15px 24px',
          borderRadius: radius.full,
          background: (!selected || !month) ? colors.gray200 : colors.emerald,
          color: (!selected || !month) ? colors.gray400 : colors.white,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: (!selected || !month) ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: (!selected || !month) ? 'none' : shadows.card,
        }}
      >
        {selected && !selected.has_active_sweet_spot ? 'Notify me when ready →' : 'See award options →'}
      </button>
    </div>
  );
}
