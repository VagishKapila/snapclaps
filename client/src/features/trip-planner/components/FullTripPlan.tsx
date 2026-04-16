import type { TripPlan } from '../types';
import BookingSteps from './BookingSteps';

export default function FullTripPlan({ plan }: { plan: TripPlan }) {
  const s = plan.trip_summary;
  return (
    <div>
      <div style={{
        background: 'var(--navy)', borderRadius: 16, padding: '28px 24px', color: '#fff', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 48 }}>{s.emoji}</span>
          <div>
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, textTransform: 'uppercase', margin: 0 }}>
              {s.destination}
            </h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#94a3b8', fontSize: 14, margin: 0 }}>
              {plan.travel_month} · {plan.duration_days} nights
            </p>
          </div>
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#cbd5e1', lineHeight: 1.5 }}>{s.headline}</p>
        {s.cash_value_saved && (
          <div style={{ marginTop: 12, background: 'rgba(0,201,167,0.15)', borderRadius: 10, padding: '10px 14px', display: 'inline-block' }}>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 20, color: 'var(--teal)' }}>
              ~${Math.round(s.cash_value_saved).toLocaleString()} saved
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#94a3b8', marginLeft: 8 }}>vs. paying cash</span>
          </div>
        )}
      </div>

      <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 16 }}>
        ✈️ Flight Award Options ({plan.flight_options.length})
      </h3>
      {plan.flight_options.map((f, i) => (
        <div key={i} style={{
          border: `2px solid ${f.can_book_now ? 'var(--teal)' : '#e2e8f0'}`,
          borderRadius: 14, padding: '20px', marginBottom: 16, background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 18, color: 'var(--navy)' }}>{f.program_name}</span>
                {f.can_book_now && (
                  <span style={{ background: 'var(--teal)', color: '#fff', borderRadius: 20, padding: '2px 8px', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600 }}>
                    ✓ YOU HAVE ENOUGH
                  </span>
                )}
                {f.live && (
                  <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '2px 8px', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 600 }}>
                    LIVE
                  </span>
                )}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b' }}>
                {f.cabin} Class · {f.is_direct ? 'Direct' : 'Connecting'} · {f.taxes_usd ? `+$${f.taxes_usd} taxes` : ''}
              </div>
              {f.notes && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{f.notes}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 28, color: f.can_book_now ? 'var(--teal)' : 'var(--navy)' }}>
                {f.miles_cost.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b' }}>miles</div>
            </div>
          </div>

          {f.user_cards.length > 0 && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--navy)', margin: 0 }}>
                <strong>Your points: {f.user_points.toLocaleString()}</strong>
                {f.can_book_now
                  ? <span style={{ color: 'var(--teal)' }}> ✓ You have enough!</span>
                  : <span style={{ color: 'var(--coral)' }}> · {f.points_gap.toLocaleString()} more needed</span>
                }
              </p>
            </div>
          )}

          <BookingSteps steps={f.booking_steps} programName={f.program_name} />
        </div>
      ))}

      {plan.hotel_options.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 16, marginTop: 32 }}>
            🏨 Hotel Award Options
          </h3>
          {plan.hotel_options.map((h, i) => (
            <div key={i} style={{
              border: '2px solid #e2e8f0', borderRadius: 14, padding: '20px', marginBottom: 12,
              background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--navy)', fontSize: 15 }}>{h.property}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b' }}>{h.program} · {h.nights} nights</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {h.points_per_night.toLocaleString()} pts/night · Cash value: ~${h.cash_value_per_night}/night
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 24, color: 'var(--navy)' }}>{h.total_points.toLocaleString()}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#64748b' }}>total points</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
                  ~${h.total_cash_value.toLocaleString()} value
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {plan.card_recommendations.length > 0 && (
        <>
          <h3 style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 16, marginTop: 32 }}>
            💳 Card Recommendations
          </h3>
          {plan.card_recommendations.map((c, i) => (
            <div key={i} style={{
              border: '2px solid #e2e8f0', borderRadius: 14, padding: '20px', marginBottom: 12,
              background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--navy)', fontSize: 15, marginBottom: 6 }}>
                  {c.name || c.card_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>{c.reason}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {c.bonus_points > 0 && (
                    <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600 }}>
                      {c.bonus_points.toLocaleString()} bonus pts
                    </span>
                  )}
                  <span style={{ background: '#f8fafc', color: '#64748b', borderRadius: 20, padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                    ${c.annual_fee}/yr
                  </span>
                </div>
              </div>
              <a
                href={c.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '12px 20px', borderRadius: 10, background: 'var(--teal)',
                  color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: 14,
                  textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Apply Now →
              </a>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
