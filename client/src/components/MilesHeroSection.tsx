import React, { useState } from 'react';
import { T } from '../theme/tokens';

const CARDS_LIST = [
  { id: 'chase_sapphire',   label: 'Chase Sapphire' },
  { id: 'amex_gold',        label: 'Amex Gold' },
  { id: 'amex_plat',        label: 'Amex Platinum' },
  { id: 'capital_one',      label: 'Capital One Venture' },
  { id: 'citi_premier',     label: 'Citi Premier' },
  { id: 'bilt',             label: 'Bilt' },
  { id: 'united',           label: 'United Explorer' },
  { id: 'hyatt',            label: 'World of Hyatt' },
];

// Japan proof-card photo (Kyoto / historic streets)
const JAPAN_PHOTO =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&h=480&fit=crop&q=85';

export const MilesHeroSection: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState(['chase_sapphire', 'amex_gold']);

  const toggleCard = (id: string) => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <section style={{
      margin: '0 24px 40px',
      borderRadius: 20,
      overflow: 'hidden',
      border: `1px solid ${T.border}`,
      background: T.card,
      boxShadow: '0 4px 24px rgba(45,106,79,0.06)',
    }}>

      {/* ── Responsive two-column grid ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,2fr) minmax(0,3fr)',
        gap: 0,
      }}
        className="miles-hero-grid"
      >
        {/* ── LEFT COLUMN — Japan Proof Card ─────────────────────────── */}
        <div style={{
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          background: '#0a0a0a',
        }}>
          {/* Photo */}
          <div style={{
            height: 240,
            backgroundImage: `url(${JAPAN_PHOTO})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)',
            }} />
            {/* LIVE AWARD badge */}
            <div style={{
              position: 'absolute', top: 16, left: 16,
              background: T.primary, color: '#fff',
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              padding: '3px 8px', borderRadius: 4,
            }}>
              Live Award
            </div>
          </div>

          {/* Award card body */}
          <div style={{
            padding: '20px 20px 24px',
            background: '#fafaf5',
            flex: 1,
            borderTop: `1px solid ${T.border}`,
          }}>
            {/* Source line */}
            <div style={{
              fontSize: 10, color: T.textMuted,
              fontFamily: T.fontMono, marginBottom: 10,
            }}>
              via Seats.aero · Updated today
            </div>

            {/* Route */}
            <div style={{
              fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 2,
            }}>
              SFO → Tokyo Narita
            </div>
            <div style={{
              fontSize: 12, color: T.textSec, marginBottom: 16,
            }}>
              ANA Business Class "The Room" · Oct 12–22, 2026
            </div>

            {/* Miles + Cash */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.primary, lineHeight: 1 }}>55K</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>miles needed</div>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 700, color: T.text, lineHeight: 1 }}>$86</div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>total out-of-pocket</div>
              </div>
            </div>

            {/* Transfer path */}
            <div style={{
              fontSize: 11, color: T.textSec, lineHeight: 1.6,
              background: T.bgWarm, borderRadius: 8, padding: '10px 12px',
            }}>
              Transfer: Amex MR → Virgin Atlantic<br />
              Book: ANA partner award on virginatlantic.com
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN — AI Concierge Pitch ──────────────────────── */}
        <div style={{ padding: '36px 40px 36px 36px' }}>
          {/* Eyebrow */}
          <div style={{
            fontSize: 12, fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.18em',
            color: T.accent, fontFamily: T.font,
            marginBottom: 14,
          }}>
            AI Points Concierge
          </div>

          {/* Headline (page H1) */}
          <h1 style={{
            fontFamily: T.fontSerif,
            fontSize: 'clamp(28px, 3.5vw, 56px)',
            fontWeight: 700,
            color: '#1B3A2F',
            lineHeight: 1.1,
            margin: '0 0 18px',
          }}>
            You already have the points.<br />
            We turn them into the trip.
          </h1>

          {/* SEO-rich body copy (verbatim from brief) */}
          <p style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: '#3A3A3A',
            fontFamily: T.font,
            margin: '0 0 28px',
            maxWidth: 520,
          }}>
            Your AI concierge finds the smartest ways to use credit card points
            and airline miles — business class flights on ANA, Lufthansa, Air France;
            luxury hotels at Park Hyatt, Andaz, Ritz-Carlton; award sweet spots most
            travelers never find. We transfer your Amex, Chase, and Capital One points
            to the right airline partner, show you the exact booking path, and surface
            the availability in real time. Your points stay in your accounts. You book
            directly with the airline or hotel. We do the research — you get the trip.
          </p>

          {/* Card selector label */}
          <div style={{
            fontSize: 14, fontWeight: 500,
            color: T.text, fontFamily: T.font,
            marginBottom: 12,
          }}>
            Select the cards you have:
          </div>

          {/* 2-row card pill grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, auto)',
            gap: 8,
            justifyContent: 'start',
            marginBottom: 24,
          }}>
            {CARDS_LIST.map(card => {
              const sel = selectedCards.includes(card.id);
              return (
                <span
                  key={card.id}
                  onClick={() => toggleCard(card.id)}
                  style={{
                    display: 'inline-block',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: sel ? 600 : 400,
                    cursor: 'pointer',
                    background: sel ? T.primary : T.bgWarm,
                    color: sel ? '#fff' : T.primary,
                    border: `1px solid ${sel ? T.primary : T.border}`,
                    transition: 'all 0.15s',
                    fontFamily: T.font,
                    userSelect: 'none' as const,
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {card.label}
                </span>
              );
            })}
          </div>

          {/* Primary CTA */}
          <a
            href="/plan"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '18px 0',
              borderRadius: 12,
              background: T.primary,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 18,
              fontWeight: 600,
              fontFamily: T.font,
              transition: 'background 0.15s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = T.primaryDark)}
            onMouseLeave={e => (e.currentTarget.style.background = T.primary)}
          >
            Plan my trip with points →
          </a>

          {/* Footnote */}
          <p style={{
            textAlign: 'center',
            marginTop: 12,
            fontSize: 13,
            color: T.textMuted,
            lineHeight: 1.5,
            fontFamily: T.font,
          }}>
            Your points stay in your accounts. We show you the steps — you book directly.
          </p>
        </div>
      </div>

      {/* ── Mobile responsive overrides ─────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .miles-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .miles-hero-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid ${T.border};
            order: 2;
          }
          .miles-hero-grid > div:last-child {
            order: 1;
            padding: 28px 24px 24px !important;
          }
        }
        @media (max-width: 480px) {
          .miles-hero-grid > div:last-child {
            padding: 24px 20px 20px !important;
          }
        }
      `}</style>
    </section>
  );
};
