import React from 'react';
import { T } from '../theme/tokens';
import { getDestPhoto } from '../utils/dest-photos';
import { CountdownTimerInline } from './CountdownTimerInline';

export interface HomepageDeal {
  id: string;
  deal_type: 'flight' | 'hotel';
  badge_type: 'error' | 'deal' | 'hotel';
  badge_label: string;
  destination_airport: string;
  origin_city: string;
  destination_city: string;
  price: number;
  original_price: number;
  meta_line: string;
  booking_url: string;
  source_name: string;
  effective_expiry: string | null;
  hotel_name?: string;
  hotel_stars?: number;
  is_domestic: boolean;
}

interface DealCardV2Props {
  deal: HomepageDeal;
}

const badgeStyles: Record<string, { background: string; color: string }> = {
  error: { background: T.errorBg, color: T.error },
  deal: { background: T.primaryLight, color: T.primary },
  hotel: { background: T.hotelBg, color: T.hotel },
};

export const DealCardV2: React.FC<DealCardV2Props> = ({ deal }) => {
  const isHotel = deal.deal_type === 'hotel';
  const photoUrl = getDestPhoto(deal.destination_airport);
  const badge = badgeStyles[deal.badge_type] || badgeStyles.deal;
  const savingsPct = deal.original_price > 0
    ? Math.round(((deal.original_price - deal.price) / deal.original_price) * 100)
    : null;

  const handleCardClick = () => {
    if (deal.booking_url && deal.booking_url !== '#') {
      window.open(deal.booking_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        borderRadius: T.radius, overflow: 'hidden',
        border: `1px solid ${T.border}`, background: T.card,
        transition: 'transform 0.15s, box-shadow 0.15s', cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(45,106,79,0.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Destination photo header */}
      <div style={{
        height: 100, backgroundImage: `url(${photoUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'relative',
      }}>
        {/* Gradient overlay so text is readable */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.5) 100%)',
        }} />
        {/* Price overlay on photo */}
        <div style={{
          position: 'absolute', bottom: 10, left: 14,
          display: 'flex', alignItems: 'baseline', gap: 6,
        }}>
          <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>${deal.price}</span>
          {isHotel && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>/night</span>}
          {deal.original_price > deal.price && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'line-through' }}>
              ${deal.original_price.toLocaleString()}
            </span>
          )}
          {savingsPct !== null && savingsPct > 0 && (
            <span style={{
              fontSize: 10, fontWeight: 600, color: '#fff',
              background: T.primary, padding: '2px 6px', borderRadius: 3,
            }}>{savingsPct}% off</span>
          )}
        </div>
        {/* Timer overlay on photo */}
        {deal.effective_expiry && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span style={{
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              padding: '4px 8px', borderRadius: 4, fontSize: 10,
              fontFamily: T.fontMono, color: '#fff', fontWeight: 500,
            }}>
              ⏱ <CountdownTimerInline expiresAt={deal.effective_expiry} />
            </span>
          </div>
        )}
        {/* Badge overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span style={{
            ...badge, padding: '3px 7px', borderRadius: 4,
            fontWeight: 600, textTransform: 'uppercase' as const, fontSize: 9, letterSpacing: 0.3,
          }}>{deal.badge_label}</span>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3 }}>
          {isHotel ? deal.hotel_name : `${deal.origin_city} → ${deal.destination_city}`}
          {isHotel && deal.hotel_stars && (
            <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.4 }}>{'★'.repeat(deal.hotel_stars)}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: T.textSec, marginBottom: 10, lineHeight: 1.4 }}>
          {deal.meta_line}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a
            href={deal.booking_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1, textAlign: 'center', padding: '9px 0', borderRadius: T.radiusSmall,
              background: T.text, color: '#fff', textDecoration: 'none',
              fontSize: 12, fontWeight: 600, fontFamily: T.font,
            }}
          >
            Book now →
          </a>
          <span style={{ fontSize: 9, color: T.textMuted, marginLeft: 8, opacity: 0.5 }}>
            {deal.source_name}
          </span>
        </div>
      </div>
    </div>
  );
};
