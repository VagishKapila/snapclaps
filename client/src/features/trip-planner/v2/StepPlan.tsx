// StepPlan — Booking path breakdown between StepCards and StepUnlock
// Shows: date picker (from search result dates[]), booking path (3 steps), points inventory

import { useState } from 'react';
import { colors, fonts, radius, shadows } from './styles';
import type { SearchResult } from './StepResults';
import type { CardBalance } from './StepCards';
import { CARDS } from '../data/cards';
import type { Destination } from '../data/destinations';

interface Props {
  result: SearchResult;
  destination: Destination;
  month: string;         // YYYY-MM
  duration: number | 'flex';
  balances: CardBalance[];
  no_cards: boolean;
  onNext: () => void;    // → StepUnlock
  onBack: () => void;    // → StepCards
}

function fmtMiles(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
}

function formatDatePair(out: string, back: string): string {
  // out/back are 'YYYY-MM-DD' strings
  const fmt = (s: string) => {
    const d = new Date(s + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  return `${fmt(out)} → ${fmt(back)}`;
}

export default function StepPlan({ result, destination, month, duration, balances, no_cards, onNext, onBack }: Props) {
  const cabin = result.business ? 'business' : 'economy';
  const data = result.business || result.economy;

  // Select first date pair by default
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);

  // Total points across all cards
  const totalPoints = balances.reduce((sum, b) => sum + b.balance, 0);
  const requiredMiles = data ? data.rt_miles : 0;
  const pointsRatio = requiredMiles > 0 ? Math.min(totalPoints / requiredMiles, 1) : 0;
  const shortfall = Math.max(requiredMiles - totalPoints, 0);
  const hasEnough = totalPoints >= requiredMiles && !no_cards && totalPoints > 0;

  // Find the first matching card name for the blurred transfer step
  const firstCard = balances.length > 0 ? CARDS.find(c => c.id === balances[0].card_id) : null;
  const programName = firstCard ? firstCard.program_short : 'your points card';

  // Available dates from search result
  const dates = result.dates || [];
  const selectedDate = dates[selectedDateIdx] || null;

  if (!data) return null;

  const stepItemStyle = (_active: boolean): React.CSSProperties => ({
    display: 'flex',
    gap: 12,
    padding: '14px 0',
    borderBottom: `1px solid ${colors.gray100}`,
  });

  // Suppress unused warning for duration (part of the API contract)
  void duration;

  return (
    <div>
      <h2 style={{ fontFamily: fonts.display, fontSize: 26, color: colors.warmBlack, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.2 }}>
        We found your booking path
      </h2>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray400, margin: '0 0 24px' }}>
        {/* origin not available here, use destination only */}
        {destination.name} · Round trip · {cabin === 'business' ? 'Business class' : 'Economy'}
      </p>

      {/* Date picker */}
      {dates.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.gray600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select travel dates
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dates.slice(0, 3).map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDateIdx(i)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: radius.md,
                  border: `1.5px solid ${selectedDateIdx === i ? colors.emerald : colors.gray200}`,
                  background: selectedDateIdx === i ? colors.emeraldFaint : colors.white,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontFamily: fonts.body, fontSize: 14, fontWeight: 600, color: selectedDateIdx === i ? colors.emerald : colors.warmBlack }}>
                  {formatDatePair(d.out, d.back)}
                </span>
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '999px',
                  background: d.availability === 'limited' ? '#fef3c7' : '#dcfce7',
                  color: d.availability === 'limited' ? '#92400e' : '#16a34a',
                }}>
                  {d.availability === 'limited' ? 'Limited seats' : 'Plenty of seats'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {dates.length === 0 && (
        <div style={{
          background: '#fef9ef',
          border: '1px solid #fde68a',
          borderRadius: radius.md,
          padding: '12px 14px',
          marginBottom: 20,
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
            ⚡ No confirmed award dates found yet for {month} — availability can open closer to the date. Unlock to get notified.
          </p>
        </div>
      )}

      {/* Booking path */}
      <div style={{ marginBottom: 20, background: colors.white, border: `1px solid ${colors.gray100}`, borderRadius: radius.lg, padding: '4px 16px', boxShadow: shadows.sm }}>
        <p style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 4px' }}>
          Booking path
        </p>

        {/* Step 1 */}
        <div style={stepItemStyle(true)}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.emerald, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: '#fff' }}>1</span>
          </div>
          <div>
            <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.warmBlack, marginBottom: 4 }}>
              Transfer your points
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray600, lineHeight: 1.5 }}>
              Move {fmtMiles(data.rt_miles)} points from your {programName} account to the partner airline program.
              Takes ~instantly to 24hrs.{' '}
              <span style={{
                display: 'inline-block',
                padding: '1px 8px',
                borderRadius: '999px',
                background: colors.gray100,
                fontFamily: fonts.body,
                fontSize: 11,
                fontWeight: 700,
                color: colors.gray400,
                filter: 'blur(4px)',
                userSelect: 'none',
              }}>
                ████████
              </span>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={stepItemStyle(true)}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.emerald, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: '#fff' }}>2</span>
          </div>
          <div>
            <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.warmBlack, marginBottom: 4 }}>
              Book your flight
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray600, lineHeight: 1.5 }}>
              Log into the partner program. Search {destination.name}
              {selectedDate ? ` on ${formatDatePair(selectedDate.out, selectedDate.back)}` : ''}.
              Select {cabin === 'business' ? 'business class' : 'economy'} with points.
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ ...stepItemStyle(true), borderBottom: 'none' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.emerald, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: '#fff' }}>3</span>
          </div>
          <div>
            <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: colors.warmBlack, marginBottom: 4 }}>
              Pay taxes & fees
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray600, lineHeight: 1.5 }}>
              ${data.rt_taxes} in government taxes and airline fees. That's it.
            </div>
          </div>
        </div>
      </div>

      {/* Points inventory */}
      <div style={{ marginBottom: 24, background: colors.cream, borderRadius: radius.lg, padding: '16px' }}>
        <p style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
          Your points inventory
        </p>

        {no_cards || totalPoints === 0 ? (
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray600, margin: 0, lineHeight: 1.5 }}>
            You haven't added any cards. That's fine — we'll show you which cards to get.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray600 }}>You have</span>
              <span style={{ fontFamily: fonts.display, fontSize: 18, color: colors.warmBlack }}>{fmtMiles(totalPoints)} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray600 }}>You need</span>
              <span style={{ fontFamily: fonts.display, fontSize: 18, color: colors.warmBlack }}>{fmtMiles(requiredMiles)} pts</span>
            </div>

            {/* Progress bar */}
            <div style={{ background: colors.gray100, borderRadius: '999px', height: 8, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%',
                borderRadius: '999px',
                background: hasEnough ? colors.emerald : `linear-gradient(90deg, ${colors.emerald}, #c8a15c)`,
                width: `${Math.round(pointsRatio * 100)}%`,
                transition: 'width 0.6s ease',
              }} />
            </div>

            {hasEnough ? (
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: '#16a34a', margin: 0, fontWeight: 600 }}>
                ✓ You have enough points to book this trip today.
              </p>
            ) : (
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray600, margin: 0 }}>
                You're {fmtMiles(shortfall)} points short. We'll show you the fastest way to close the gap.
              </p>
            )}
          </>
        )}
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '15px 24px',
          borderRadius: radius.full,
          background: colors.emerald,
          color: colors.white,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
          boxShadow: shadows.card,
          marginBottom: 10,
        }}
      >
        Show me how to book this →
      </button>

      <button
        onClick={onBack}
        style={{
          display: 'block',
          width: '100%',
          padding: '10px',
          background: 'none',
          border: 'none',
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.gray400,
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        ← Edit my cards
      </button>
    </div>
  );
}
