import React from 'react';
import { T } from '../theme/tokens';
import { SECTION_THEMES, type SectionThemeKey } from '../theme/section-themes';
import { DealCardV2 } from './DealCardV2';
import { photoForDeal } from '../utils/dest-photos';
import type { HomepageDeal } from './DealCardV2';

interface DealsSectionProps {
  title: string;
  subhead: string;
  deals: HomepageDeal[];
  themeKey: SectionThemeKey;
}

export const DealsSection: React.FC<DealsSectionProps> = ({
  title,
  subhead,
  deals,
  themeKey,
}) => {
  if (!deals || deals.length === 0) return null;

  const theme = SECTION_THEMES[themeKey];

  // Pre-compute photo assignments — anti-duplicate pass across every card in this section
  const usedInSection = new Set<string>();
  const photoUrls = deals.map(deal =>
    photoForDeal(deal.id, deal.destination_airport, usedInSection)
  );

  return (
    <div style={{ padding: '0 24px 48px' }}>
      {/* ── Section header — 2A: Big Fraunces + 2B: per-section accent ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingTop: 40,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div>
          {/* Eyebrow — DM Sans 500, 11px, 2B accent color */}
          <div style={{
            fontSize: 11,
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            color: theme.accent,
            fontFamily: T.font,
            marginBottom: 8,
          }}>
            {theme.eyebrow}
          </div>

          {/* Big Fraunces headline — 2A: clamp 32–48px */}
          <h2 style={{
            fontFamily: T.fontSerif,
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600,
            color: T.primary,
            margin: 0,
            lineHeight: 1.1,
          }}>
            {title}
          </h2>

          {/* Subhead — DM Sans 400 16px */}
          <p style={{
            fontSize: 16,
            color: T.textSec,
            fontFamily: T.font,
            margin: '10px 0 0',
            lineHeight: 1.5,
          }}>
            {subhead}
          </p>
        </div>

        {/* Live count pill — 2B accent bg/text */}
        <div style={{
          flexShrink: 0,
          marginLeft: 24,
          background: theme.countBg,
          color: theme.countText,
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
            badgeBg={theme.badgeBg}
            badgeText={theme.badgeText}
          />
        ))}
      </div>
    </div>
  );
};
