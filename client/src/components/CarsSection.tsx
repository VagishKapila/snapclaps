/**
 * 2E — Cars / Rental Section
 * DiscoverCars affiliate not yet active on this account.
 * Shows a "coming soon" shell so the section has visual presence
 * without blocking other sections from shipping.
 */
import React from 'react';
import { T } from '../theme/tokens';
import { SECTION_THEMES } from '../theme/section-themes';

export const CarsSection: React.FC = () => {
  const theme = SECTION_THEMES.cars;

  return (
    <div style={{ padding: '0 24px 48px' }}>
      {/* ── Section header ────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingTop: 40,
        borderTop: `1px solid ${T.border}`,
      }}>
        <div>
          <div style={{
            fontSize: 11, fontWeight: 500, textTransform: 'uppercase' as const,
            letterSpacing: '0.15em', color: theme.accent, fontFamily: T.font, marginBottom: 8,
          }}>
            {theme.eyebrow}
          </div>
          <h2 style={{
            fontFamily: T.fontSerif, fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 600, color: T.primary, margin: 0, lineHeight: 1.1,
          }}>
            Rental cars at deal prices
          </h2>
          <p style={{
            fontSize: 16, color: T.textSec, fontFamily: T.font, margin: '10px 0 0', lineHeight: 1.5,
          }}>
            Compare rates across 500+ suppliers — no hidden fees
          </p>
        </div>
        <div style={{
          flexShrink: 0, marginLeft: 24,
          background: theme.countBg, color: theme.countText,
          border: `1px solid ${T.border}`, borderRadius: 20,
          padding: '5px 14px', fontSize: 13, fontWeight: 500,
          fontFamily: T.font, whiteSpace: 'nowrap' as const,
        }}>
          Coming soon
        </div>
      </div>

      {/* ── Placeholder cards ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {['Economy', 'SUV', 'Full Size'].map((cls) => (
          <div
            key={cls}
            style={{
              borderRadius: T.radius, overflow: 'hidden',
              border: `1px solid ${T.border}`, background: T.card,
              opacity: 0.55,
            }}
          >
            {/* Placeholder photo */}
            <div style={{
              height: 100,
              background: `linear-gradient(135deg, ${theme.badgeBg} 0%, #d4dbd8 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32,
            }}>
              🚗
            </div>
            {/* Card body */}
            <div style={{ padding: '12px 14px 14px' }}>
              <div style={{
                fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4,
              }}>
                {cls}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>
                Launching soon · Up to 40% off rack rates
              </div>
              <div style={{
                display: 'block', textAlign: 'center', padding: '9px 0',
                borderRadius: T.radiusSmall, background: theme.badgeBg,
                color: theme.badgeText, fontSize: 12, fontWeight: 600,
                fontFamily: T.font,
              }}>
                Get notified
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
