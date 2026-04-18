import { useState } from 'react';
import type { Card } from '../data/cards';
import CreditCardVisual from './CreditCardVisual';
import { colors, fonts, radius, shadows } from './styles';

interface Props {
  card: Card;
  initialBalance?: number;
  onSave: (balance: number) => void;
  onClose: () => void;
}

export default function BalanceModal({ card, initialBalance = 0, onSave, onClose }: Props) {
  const [value, setValue] = useState(initialBalance > 0 ? String(initialBalance) : '');

  function handleSave() {
    const n = parseInt(value.replace(/,/g, ''), 10);
    onSave(isNaN(n) ? 0 : n);
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(26,29,26,0.55)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: colors.white,
        borderRadius: `${radius.xl} ${radius.xl} 0 0`,
        padding: '28px 24px 40px',
        width: '100%',
        maxWidth: 500,
        boxShadow: shadows.lg,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <CreditCardVisual card={card} balance={parseInt(value.replace(/,/g, ''), 10) || 0} size="lg" />
        </div>

        <h3 style={{ fontFamily: fonts.display, fontSize: 22, color: colors.warmBlack, fontWeight: 400, margin: '0 0 6px', textAlign: 'center' }}>
          How many {card.program_short} points do you have?
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray400, margin: '0 0 24px', textAlign: 'center' }}>
          Approximate is fine — we'll show what you can reach.
        </p>

        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, '');
              setValue(raw ? parseInt(raw).toLocaleString() : '');
            }}
            placeholder="e.g. 75,000"
            style={{
              fontFamily: fonts.body,
              fontSize: 28,
              color: colors.warmBlack,
              fontWeight: 600,
              border: `1.5px solid ${colors.gray200}`,
              borderRadius: radius.md,
              padding: '14px 16px',
              width: '100%',
              boxSizing: 'border-box',
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[25000, 50000, 75000, 100000].map(v => (
            <button
              key={v}
              onClick={() => setValue(v.toLocaleString())}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: radius.md,
                border: `1.5px solid ${value === v.toLocaleString() ? colors.emerald : colors.gray200}`,
                background: value === v.toLocaleString() ? colors.emeraldFaint : colors.white,
                fontFamily: fonts.body,
                fontSize: 12,
                fontWeight: 600,
                color: value === v.toLocaleString() ? colors.emerald : colors.gray600,
                cursor: 'pointer',
              }}
            >
              {v >= 1000 ? `${v / 1000}K` : v}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: radius.full,
            background: colors.emerald,
            color: colors.white,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Save points balance
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: 8,
            background: 'none',
            border: 'none',
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.gray400,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
