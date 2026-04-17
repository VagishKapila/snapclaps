import React, { useState } from 'react';
import { T } from '../theme/tokens';
import { MILES_HERO_PHOTO } from '../utils/dest-photos';

const CARDS_LIST = [
  { id: 'chase_sapphire', label: 'Chase Sapphire' },
  { id: 'amex_gold', label: 'Amex Gold' },
  { id: 'amex_plat', label: 'Amex Platinum' },
  { id: 'capital_one', label: 'Capital One Venture' },
  { id: 'citi_premier', label: 'Citi Premier' },
  { id: 'bilt', label: 'Bilt' },
  { id: 'united', label: 'United Explorer' },
  { id: 'hyatt', label: 'World of Hyatt' },
];

export const MilesHeroSection: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState(['chase_sapphire', 'amex_gold']);

  const toggleCard = (id: string) => {
    setSelectedCards(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ margin: '16px 24px 24px' }}>
      {/* Hero image with overlay */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', position: 'relative',
        minHeight: 340,
        backgroundImage: `url(${MILES_HERO_PHOTO})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
        }} />

        {/* Content on top of photo */}
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 28px' }}>
          {/* Small badge */}
          <div style={{
            display: 'inline-block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 1.2, padding: '4px 10px', borderRadius: 4,
            background: 'rgba(255,255,255,0.15)', color: '#fff', marginBottom: 16,
            backdropFilter: 'blur(4px)',
          }}>
            AI Points Concierge
          </div>

          {/* Warm heading */}
          <h2 style={{
            fontFamily: T.fontSerif, fontSize: 28, fontWeight: 600,
            color: '#fff', lineHeight: 1.25, marginBottom: 8, maxWidth: 480,
          }}>
            You already have the points.<br />
            We turn them into the trip.
          </h2>

          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
            marginBottom: 24, maxWidth: 520,
          }}>
            Your AI concierge finds the smartest ways to use your miles —
            business class flights, luxury hotels, and more — often for just the cost of taxes.
            You stay in control. We show you how.
          </p>

          {/* Live award deal overlay */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            borderRadius: 12, padding: '18px 22px', maxWidth: 440,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                padding: '2px 6px', borderRadius: 3,
                background: T.primary, color: '#fff',
              }}>Live award</span>
              <span style={{
                fontSize: 10, color: 'rgba(255,255,255,0.5)',
                fontFamily: T.fontMono,
              }}>via Seats.aero · Updated today</span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              SFO → Tokyo Narita
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 14 }}>
              ANA Business Class "The Room" · Oct 12–22, 2026
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>55K</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>miles needed</div>
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>$86</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>total out-of-pocket</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  Transfer: Amex MR → Virgin Atlantic<br />
                  Book: ANA partner award on virginatlantic.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card selector BELOW the photo */}
      <div style={{
        background: T.bgWarm, borderRadius: '0 0 16px 16px',
        padding: '20px 24px', marginTop: -8,
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: T.text, marginBottom: 10 }}>
          Select the cards you have — see what trips your points unlock:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {CARDS_LIST.map(card => {
            const sel = selectedCards.includes(card.id);
            return (
              <span
                key={card.id}
                onClick={() => toggleCard(card.id)}
                style={{
                  padding: '7px 12px', borderRadius: T.radiusSmall,
                  fontSize: 12, fontWeight: sel ? 600 : 400, cursor: 'pointer',
                  background: sel ? T.primary : '#fff', color: sel ? '#fff' : T.textSec,
                  border: `1px solid ${sel ? T.primary : T.borderHover}`,
                  transition: 'all 0.15s', fontFamily: T.font,
                }}
              >
                {card.label}
              </span>
            );
          })}
        </div>

        <a
          href="/plan"
          style={{
            display: 'block', textAlign: 'center', padding: 12, borderRadius: 10,
            background: T.primary, color: '#fff', textDecoration: 'none',
            fontSize: 14, fontWeight: 600, fontFamily: T.font,
          }}
        >
          Plan my trip with points →
        </a>

        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: T.textMuted, lineHeight: 1.5 }}>
          Your points stay in your accounts. We show you the steps — you book directly.
        </p>
      </div>
    </div>
  );
};
