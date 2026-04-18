import type { Card } from '../data/cards';
import { fonts } from './styles';

interface Props {
  card: Card;
  balance?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CreditCardVisual({ card, balance, size = 'md' }: Props) {
  const w = size === 'sm' ? 120 : size === 'lg' ? 300 : 200;
  const h = Math.round(w * 0.63);
  const r = Math.round(w * 0.055);

  return (
    <div style={{
      width: w,
      height: h,
      borderRadius: r,
      background: card.color,
      color: card.textColor,
      padding: `${Math.round(h * 0.12)}px ${Math.round(w * 0.09)}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      position: 'relative',
      overflow: 'hidden',
      flexShrink: 0,
      userSelect: 'none',
    }}>
      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Top: issuer */}
      <div style={{
        fontFamily: fonts.body,
        fontSize: Math.round(w * 0.065),
        fontWeight: 800,
        opacity: 0.9,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {card.logo}
      </div>

      {/* Bottom row */}
      <div>
        {balance !== undefined && (
          <div style={{
            fontFamily: fonts.body,
            fontSize: Math.round(w * 0.09),
            fontWeight: 700,
            marginBottom: Math.round(h * 0.06),
            opacity: 0.95,
          }}>
            {balance >= 1000 ? `${(balance / 1000).toFixed(0)}K` : balance.toLocaleString()}
            <span style={{ fontSize: Math.round(w * 0.055), fontWeight: 400, marginLeft: 3, opacity: 0.7 }}>pts</span>
          </div>
        )}
        <div style={{
          fontFamily: fonts.body,
          fontSize: Math.round(w * 0.055),
          opacity: 0.75,
          lineHeight: 1.2,
        }}>
          {card.program_short}
        </div>
        <div style={{
          fontFamily: fonts.body,
          fontSize: Math.round(w * 0.048),
          opacity: 0.6,
          marginTop: 2,
        }}>
          {card.name.length > 22 ? card.name.slice(0, 22) + '…' : card.name}
        </div>
      </div>
    </div>
  );
}
