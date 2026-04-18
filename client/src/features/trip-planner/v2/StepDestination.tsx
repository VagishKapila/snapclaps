import { useState, useEffect, useRef } from 'react';
import { colors, fonts, radius, shadows } from './styles';
import type { Destination } from '../data/destinations';
import { DESTINATION_EMOJI, getDisplayName } from '../data/destinations';

interface Props {
  onNext: (data: { destination: Destination; month: string; duration: number | 'flex' }) => void;
  initial?: { destination?: Destination | null; month?: string; duration?: number | 'flex' };
}

const MONTHS = [
  'Jan 2026','Feb 2026','Mar 2026','Apr 2026','May 2026','Jun 2026',
  'Jul 2026','Aug 2026','Sep 2026','Oct 2026','Nov 2026','Dec 2026',
  'Jan 2027','Feb 2027','Mar 2027','Apr 2027','May 2027','Jun 2027',
];

const DURATION_NIGHTS = [3, 5, 7, 10, 14];

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
  const [duration, setDuration] = useState<number | 'flex'>(initial.duration || 7);
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

  function selectFreetext() {
    if (!query.trim()) return;
    const synth: Destination = {
      name: query.trim(),
      airport: 'FREETEXT',
      country: '',
      region: '',
      has_active_sweet_spot: false,
      is_freetext: true,
    };
    setSelected(synth);
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
        {showSuggestions && (filtered.length > 0 || query.length >= 2) && (
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
            {/* Freetext fallback — always shown at the bottom when user has typed a query */}
            {query.trim().length >= 2 && (
              <button
                onMouseDown={selectFreetext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '11px 14px',
                  border: 'none',
                  borderTop: filtered.length > 0 ? `1px solid ${colors.gray100}` : 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 18, minWidth: 28 }}>🔍</span>
                <span style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600 }}>
                  Search <strong style={{ color: colors.warmBlack }}>"{query.trim()}"</strong> →
                </span>
              </button>
            )}
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
          {DURATION_NIGHTS.map(n => (
            <button
              key={n}
              onClick={() => setDuration(n)}
              style={{
                padding: '9px 16px',
                borderRadius: radius.full,
                border: `1.5px solid ${duration === n ? colors.emerald : colors.gray200}`,
                background: duration === n ? colors.emeraldFaint : colors.white,
                fontFamily: fonts.body,
                fontSize: 13,
                fontWeight: duration === n ? 600 : 400,
                color: duration === n ? colors.emerald : colors.gray600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {n} nights
            </button>
          ))}
          <button
            onClick={() => setDuration('flex')}
            style={{
              padding: '9px 16px',
              borderRadius: radius.full,
              border: `1.5px solid ${duration === 'flex' ? colors.emerald : colors.gray200}`,
              background: duration === 'flex' ? colors.emeraldFaint : colors.white,
              fontFamily: fonts.body,
              fontSize: 13,
              fontWeight: duration === 'flex' ? 600 : 400,
              color: duration === 'flex' ? colors.emerald : colors.gray600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Flexible
          </button>
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
        {selected?.is_freetext ? 'Browse flights →' : selected && !selected.has_active_sweet_spot ? 'Notify me when ready →' : 'See award options →'}
      </button>
    </div>
  );
}
