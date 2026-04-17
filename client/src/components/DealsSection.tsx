import React from 'react';
import { T } from '../theme/tokens';
import { DealCardV2 } from './DealCardV2';
import { photoForDeal } from '../utils/dest-photos';
import type { HomepageDeal } from './DealCardV2';

interface DealsSectionProps {
  title: string;
  eyebrow: string;       // e.g. "NEAR YOU" | "WORLDWIDE" | "STAYS"
  subhead: string;       // e.g. "Updated every 15 minutes — book direct, no middleman"
  deals: HomepageDeal[];
  countColor?: string;   // override for the live-count pill text color
  countBg?: string;      // override for the live-count pill background
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  title,
  eyebrow,
  subhead,
  deals,
  countColor,
  countBg,
}) => {
  if (!deals || deals.length === 0) return null;

  // Pre-compute photo assignments — anti-duplicate pass across every card
  // in this section. The Set starts empty and grows as we iterate.
  const usedInSection = new Set<string>();
  const photoUrls = deals.map(deal =>
    photoForDeal(deal.id, deal.destination_airport, usedInSection)
  );

  return (
    <div style={{ padding: '0 24px 40px' }}>
      {/* ── Section header ──────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingTop: 16,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div>
          {/* Eyebrow */}
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            color: T.accent,
            fontFamily: T.font,
            marginBottom: 6,
          }}>
            {eyebrow}
          </div>

          {/* Big Fraunces headline */}
          <h2 style={{
            fontFamily: T.fontSerif,
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 600,
            color: T.primary,
            margin: 0,
            lineHeight: 1.1,
          }}>
            {title}
          </h2>

          {/* Subhead */}
          <p style={{
            fontSize: 16,
            color: T.textSec,
            fontFamily: T.font,
            margin: '8px 0 0',
            lineHeight: 1.5,
          }}>
            {subhead}
          </p>
        </div>

        {/* Live count pill */}
        <div style={{
          flexShrink: 0,
          marginLeft: 24,
          background: countBg || T.bgWarm,
          color: countColor || T.primary,
          border: `1px solid ${T.border}`,
          borderRadius: 20,
          padding: '5px 14px',
          fontSize: 13,
          fontWeight: 500,
          fontFamily: T.font,
          whiteSpace: 'nowrap' as const,
        }}>
          {deals.length} live
        </div>
      </div>

      {/* ── Deal card grid ───────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {deals.map((deal, i) => (
          <DealCardV2
            key={deal.id || i}
            deal={deal}
            photoUrl={photoUrls[i]}
          />
        ))}
      </div>
    </div>
  );
};
