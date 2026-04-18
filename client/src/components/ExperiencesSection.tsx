/**
 * 2D — Experiences Section
 * Curated Klook activities linked via Travelpayouts affiliate.
 * Klook affiliate format: https://www.klook.com/activity/{id}/?aid=716647
 * Hide if rendered count < 3 per iron rule.
 */
import React from 'react';
import { T } from '../theme/tokens';
import { SECTION_THEMES } from '../theme/section-themes';
import { getDestPhoto } from '../utils/dest-photos';

export interface Experience {
  id: string;
  destination: string;       // city name
  destinationIata: string;   // for photo lookup
  title: string;
  duration: string;          // "3 hours"
  groupType: string;         // "Small group" | "Private" | "Self-guided"
  cancellation: string;      // "Free cancellation"
  priceFrom: number;         // USD
  klookId: string;           // Klook activity ID
}

// Curated top experiences — real Klook activity IDs
const CURATED_EXPERIENCES: Experience[] = [
  { id: 'klook-nrt-1', destination: 'Tokyo', destinationIata: 'NRT',
    title: 'Shibuya Crossing Night Walking Tour', duration: '3 hours',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 49, klookId: '9765' },
  { id: 'klook-nrt-2', destination: 'Tokyo', destinationIata: 'NRT',
    title: 'Tokyo DisneySea 1-Day Ticket', duration: 'Full day',
    groupType: 'Self-guided', cancellation: 'Free cancellation',
    priceFrom: 79, klookId: '10735' },
  { id: 'klook-icn-1', destination: 'Seoul', destinationIata: 'ICN',
    title: 'Seoul City Day Tour with Gyeongbokgung Palace', duration: '8 hours',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 55, klookId: '4003' },
  { id: 'klook-bkk-1', destination: 'Bangkok', destinationIata: 'BKK',
    title: 'Chao Phraya Sunset Dinner Cruise', duration: '2.5 hours',
    groupType: 'Private', cancellation: 'Free cancellation',
    priceFrom: 39, klookId: '2097' },
  { id: 'klook-dps-1', destination: 'Bali', destinationIata: 'DPS',
    title: 'Mount Batur Sunrise Trek with Breakfast', duration: 'Full day',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 35, klookId: '9388' },
  { id: 'klook-cdg-1', destination: 'Paris', destinationIata: 'CDG',
    title: 'Eiffel Tower Priority Access + Seine River Cruise', duration: '4 hours',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 89, klookId: '20338' },
  { id: 'klook-bcn-1', destination: 'Barcelona', destinationIata: 'BCN',
    title: 'Sagrada Família Skip-the-Line Tour', duration: '1.5 hours',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 45, klookId: '12278' },
  { id: 'klook-sin-1', destination: 'Singapore', destinationIata: 'SIN',
    title: 'Universal Studios Singapore 1-Day Pass', duration: 'Full day',
    groupType: 'Self-guided', cancellation: 'Free cancellation',
    priceFrom: 65, klookId: '1551' },
  { id: 'klook-hkg-1', destination: 'Hong Kong', destinationIata: 'HKG',
    title: 'Victoria Peak & Harbour Night Tour', duration: '3 hours',
    groupType: 'Small group', cancellation: 'Free cancellation',
    priceFrom: 42, klookId: '5032' },
];

function buildKlookUrl(klookId: string): string {
  return `https://www.klook.com/activity/${klookId}/?aid=716647`;
}

interface ExperiencesSectionProps {
  /** If provided, filter to experiences at matching destinations. If null, show all curated. */
  activeDestinations?: string[] | null;
}

export const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({ activeDestinations }) => {
  const theme = SECTION_THEMES.experiences;

  // Filter to active destinations if provided, otherwise show all curated
  let experiences = CURATED_EXPERIENCES;
  if (activeDestinations && activeDestinations.length > 0) {
    const dest = new Set(activeDestinations.map(d => d.toUpperCase()));
    const filtered = CURATED_EXPERIENCES.filter(e => dest.has(e.destinationIata.toUpperCase()));
    // Fall back to full list if <3 destination matches
    if (filtered.length >= 3) experiences = filtered;
  }

  // Per iron rule: hide entire section if <3 experiences
  if (experiences.length < 3) return null;

  // Limit to 9 for clean grid
  const visible = experiences.slice(0, 9);

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
            Things to do there
          </h2>
          <p style={{
            fontSize: 16, color: T.textSec, fontFamily: T.font, margin: '10px 0 0', lineHeight: 1.5,
          }}>
            Curated activities via Klook — book once, travel better
          </p>
        </div>
        <div style={{
          flexShrink: 0, marginLeft: 24,
          background: theme.countBg, color: theme.countText,
          border: `1px solid ${T.border}`, borderRadius: 20,
          padding: '5px 14px', fontSize: 13, fontWeight: 500,
          fontFamily: T.font, whiteSpace: 'nowrap' as const,
        }}>
          {visible.length} curated
        </div>
      </div>

      {/* ── Experience card grid ─────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}>
        {visible.map((exp) => {
          const photo = getDestPhoto(exp.destinationIata);
          const bookUrl = buildKlookUrl(exp.klookId);
          return (
            <div
              key={exp.id}
              onClick={() => window.open(bookUrl, '_blank', 'noopener,noreferrer')}
              style={{
                borderRadius: T.radius, overflow: 'hidden',
                border: `1px solid ${T.border}`, background: T.card,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(138,90,0,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'none';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              {/* Photo header */}
              <div style={{
                height: 100,
                backgroundImage: `url(${photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%)',
                }} />
                {/* Price overlay */}
                <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    From ${exp.priceFrom}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginLeft: 4 }}>/person</span>
                </div>
                {/* Badge */}
                <div style={{ position: 'absolute', top: 10, left: 10 }}>
                  <span style={{
                    background: theme.badgeBg, color: theme.badgeText,
                    padding: '3px 7px', borderRadius: 4,
                    fontWeight: 600, textTransform: 'uppercase' as const,
                    fontSize: 9, letterSpacing: 0.3,
                  }}>
                    Experience
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3, lineHeight: 1.3 }}>
                  {exp.title}
                </div>
                <div style={{ fontSize: 11, color: T.textSec, marginBottom: 10 }}>
                  {exp.destination} · {exp.duration} · {exp.groupType} · {exp.cancellation}
                </div>
                <a
                  href={bookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    display: 'block', textAlign: 'center',
                    padding: '9px 0', borderRadius: T.radiusSmall,
                    background: T.primary, color: '#fff',
                    textDecoration: 'none', fontSize: 12,
                    fontWeight: 600, fontFamily: T.font,
                  }}
                >
                  Book on Klook →
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
