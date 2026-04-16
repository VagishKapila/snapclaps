interface TeaserData {
  destination: string;
  emoji: string;
  headline: string;
  can_book_now: boolean;
  best_program: string;
  total_flight_miles: number;
  programs_found: number;
  hotel_options_count: number;
  teaser_flight?: {
    program_name: string;
    miles_cost: number;
    cabin: string;
  };
}

export default function ResultsTeaser({ data }: { data: TeaserData }) {
  return (
    <div style={{
      background: 'var(--navy)', borderRadius: 16, padding: '28px 24px',
      color: '#fff', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 40 }}>{data.emoji}</span>
        <div>
          <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: 24, textTransform: 'uppercase', margin: 0 }}>
            {data.destination}
          </h3>
          {data.can_book_now && (
            <span style={{
              background: '#00C9A7', color: '#fff', borderRadius: 20, padding: '3px 10px',
              fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600,
            }}>
              ✓ YOU CAN BOOK THIS NOW
            </span>
          )}
        </div>
      </div>

      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#cbd5e1', marginBottom: 20, lineHeight: 1.5 }}>
        {data.headline}
      </p>

      {data.teaser_flight && (
        <div style={{
          background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px',
          marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>TOP OPTION</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 20 }}>
              {data.teaser_flight.miles_cost.toLocaleString()} miles
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8' }}>
              {data.teaser_flight.program_name} · {data.teaser_flight.cabin} class
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>PROGRAMS FOUND</div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: 'var(--teal)' }}>{data.programs_found}</div>
          </div>
        </div>
      )}

      {[1, 2, 3].map(i => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 16px',
          marginBottom: 8, filter: 'blur(4px)', userSelect: 'none',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 16 }}>██████ ██████</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8' }}>██████ · Business</div>
          </div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 20 }}>██,███ mi</div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b' }}>
          + {data.hotel_options_count} hotel award options · Full step-by-step booking guide · Card recommendations
        </p>
      </div>
    </div>
  );
}
