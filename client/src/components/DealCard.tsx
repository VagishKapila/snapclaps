import type { Deal } from '../types';

const TYPE_COLOR: Record<string, string> = {
  error_fare: '#FF6B6B',
  points: '#6d28d9',
  bonus: '#d97706',
  complete_trip: '#6d28d9',
  flight: '#00C9A7',
  hotel: '#0ea5e9',
};

const TYPE_BG: Record<string, string> = {
  error_fare: 'rgba(255,107,107,0.08)',
  points: 'rgba(109,40,217,0.08)',
  bonus: 'rgba(217,119,6,0.08)',
  complete_trip: 'rgba(109,40,217,0.08)',
  flight: 'rgba(0,201,167,0.08)',
  hotel: 'rgba(14,165,233,0.08)',
};

function openLink(url: string) {
  if (url && url !== '#') window.open(url, '_blank', 'noopener,noreferrer');
}

export function DealCard({ type, badge, route, emoji, price, priceLabel, savings, detail, bookUrl, ctaText, isLive, liveStatus, isTealCta }: Deal) {
  const accent = TYPE_COLOR[type] || '#00C9A7';
  const bg = TYPE_BG[type] || 'rgba(0,201,167,0.06)';

  return (
    <div
      onClick={() => openLink(bookUrl)}
      style={{
        minWidth: 240, width: 240,
        background: 'white',
        borderRadius: 16,
        border: `1px solid rgba(15,13,46,0.08)`,
        borderLeft: `4px solid ${accent}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s ease',
        flexShrink: 0,
        boxShadow: '0 2px 10px rgba(15,13,46,0.05)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px rgba(15,13,46,0.12)`;
        (e.currentTarget as HTMLElement).style.borderColor = `transparent`;
        (e.currentTarget as HTMLElement).style.borderLeft = `4px solid ${accent}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,13,46,0.05)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(15,13,46,0.08)';
        (e.currentTarget as HTMLElement).style.borderLeft = `4px solid ${accent}`;
      }}
    >
      {/* Compact header */}
      <div style={{ padding: '12px 14px 10px', background: bg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{
            background: accent, color: 'white',
            fontFamily: "'Anton', sans-serif", fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '3px 9px', borderRadius: 100,
          }}>{badge}</span>
          {isLive && (
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: liveStatus === 'live' ? '#059669' : '#d97706',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%', display: 'inline-block',
                background: liveStatus === 'live' ? '#22c55e' : '#f59e0b',
                animation: 'pulse-dot 1.5s infinite',
              }} />
              {liveStatus === 'live' ? 'Live' : 'Unconfirmed'}
            </span>
          )}
        </div>
        {/* Route + emoji inline - compact */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>{emoji}</span>
          <span style={{
            fontFamily: "'Anton', sans-serif", fontSize: 14, textTransform: 'uppercase',
            color: '#0f0d2e', lineHeight: 1.1,
          }}>{route}</span>
        </div>
      </div>

      {/* Price row */}
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, color: '#0f0d2e', lineHeight: 1 }}>
            {price}
          </span>
          {priceLabel && <span style={{ fontSize: 11, color: 'rgba(15,13,46,0.4)' }}>{priceLabel}</span>}
          {savings && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: accent,
              background: bg, padding: '2px 7px', borderRadius: 100,
            }}>{savings}</span>
          )}
        </div>

        {/* Single-line detail */}
        <div style={{
          fontSize: 11, color: 'rgba(15,13,46,0.45)', marginTop: 5, marginBottom: 12,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {detail.split('\n')[0]}
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); openLink(bookUrl); }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: isTealCta ? '#00C9A7' : '#0f0d2e',
            color: isTealCta ? '#0f0d2e' : 'white',
            border: 'none', borderRadius: '0 0 12px 12px',
            padding: '9px 14px', marginLeft: -14, marginBottom: -12,
            fontFamily: "'Anton', sans-serif", fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget).style.background = accent; (e.currentTarget).style.color = '#0f0d2e'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = isTealCta ? '#00C9A7' : '#0f0d2e'; (e.currentTarget).style.color = isTealCta ? '#0f0d2e' : 'white'; }}
        >
          <span>{ctaText}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
export default DealCard;
