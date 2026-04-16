import { useState, useEffect } from 'react';

interface Destination {
  name: string;
  airports: string[];
  country_code: string;
  emoji: string;
  region: string;
}

interface Props {
  onNext: (data: { destination: string; travel_month: string; duration_days: number }) => void;
  initial?: { destination?: string; travel_month?: string; duration_days?: number };
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getUpcomingMonths(count = 12) {
  const now = new Date();
  const results = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    results.push({ label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}`, value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` });
  }
  return results;
}

export default function Step2Destination({ onNext, initial }: Props) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [query, setQuery] = useState(initial?.destination || '');
  const [selected, setSelected] = useState<Destination | null>(null);
  const [month, setMonth] = useState(initial?.travel_month || '');
  const [duration, setDuration] = useState(initial?.duration_days || 7);
  const [error, setError] = useState('');
  const upcomingMonths = getUpcomingMonths();

  useEffect(() => {
    fetch('/api/plan/destinations').then(r => r.json()).then(d => setDestinations(d.destinations || [])).catch(() => setDestinations([]));
  }, []);

  const filtered = query.length > 1
    ? destinations.filter(d => d.name.toLowerCase().includes(query.toLowerCase()) || d.country_code.toLowerCase().includes(query.toLowerCase()))
    : destinations.slice(0, 8);

  const handleSelect = (dest: Destination) => {
    setSelected(dest);
    setQuery(dest.name);
  };

  const handleSubmit = () => {
    if (!selected && !query) { setError('Choose a destination'); return; }
    if (!month) { setError('Pick a travel month'); return; }
    setError('');
    onNext({ destination: selected ? selected.name : query, travel_month: month, duration_days: duration });
  };

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
        <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 8 }}>
          Where do you want to go?
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 15 }}>
          We'll find award seats for your destination in real time.
        </p>
      </div>

      <div style={{ marginBottom: 20, position: 'relative' }}>
        <input
          type="text"
          placeholder="Search destination (e.g. Tokyo, Bali, Paris...)"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); }}
          style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif', fontSize: 15, outline: 'none', boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
          onBlur={e => (e.target.style.borderColor = selected ? 'var(--teal)' : '#e2e8f0')}
        />
        {query.length > 0 && !selected && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden', marginTop: 4,
          }}>
            {filtered.slice(0, 6).map(d => (
              <div
                key={d.name}
                onClick={() => handleSelect(d)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: '1px solid #f1f5f9', fontFamily: 'Inter, sans-serif',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseOut={e => (e.currentTarget.style.background = '#fff')}
              >
                <span style={{ fontSize: 24 }}>{d.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 14 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{d.region} · {d.airports.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!selected && query.length === 0 && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginBottom: 10, textAlign: 'center' }}>POPULAR DESTINATIONS</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {destinations.slice(0, 8).map(d => (
              <button
                key={d.name}
                onClick={() => handleSelect(d)}
                style={{
                  padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0',
                  background: '#fff', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--teal)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                {d.emoji} {d.name.split(',')[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 14, display: 'block', marginBottom: 8 }}>
          When are you thinking?
        </label>
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 12, border: '2px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif', fontSize: 14, background: '#fff', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Select month...</option>
          {upcomingMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 28 }}>
        <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 14, display: 'block', marginBottom: 8 }}>
          Trip length: <span style={{ color: 'var(--teal)' }}>{duration} nights</span>
        </label>
        <input
          type="range" min={3} max={21} value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--teal)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8' }}>
          <span>3 nights</span><span>21 nights</span>
        </div>
      </div>

      {error && <p style={{ color: 'var(--coral)', fontFamily: 'Inter, sans-serif', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'var(--teal)', color: '#fff', fontFamily: 'Anton, sans-serif',
          fontSize: 18, textTransform: 'uppercase', letterSpacing: 1,
        }}
      >
        Next: My Points →
      </button>
    </div>
  );
}
