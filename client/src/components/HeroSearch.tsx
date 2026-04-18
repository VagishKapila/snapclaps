import React, { useState } from 'react';
import { T } from '../theme/tokens';
import { lookupZip } from '../utils/zip-airports';
import type { ZipLocation } from '../utils/zip-airports';

interface HeroSearchProps {
  onLocationSet: (loc: ZipLocation | null) => void;
  hasLocation: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onLocationSet, hasLocation }) => {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim()) return;
    const match = lookupZip(input.replace(/\D/g, ''));
    if (match) {
      onLocationSet(match);
      localStorage.setItem('snapclaps_location', JSON.stringify(match));
    }
  };

  if (hasLocation) return null;

  return (
    <div style={{ padding: '40px 24px 28px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{
        fontFamily: T.fontSerif, fontSize: 30, fontWeight: 600,
        lineHeight: 1.25, color: T.text, marginBottom: 10,
      }}>
        Find deals from airports near you
      </h1>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 22 }}>
        We scan hundreds of routes every 15 minutes.<br />
        Enter your city and see what's cheap right now.
      </p>
      <div style={{
        display: 'flex', maxWidth: 480, margin: '0 auto', borderRadius: T.radius,
        overflow: 'hidden', border: `1.5px solid ${T.borderHover}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Enter your city or ZIP — e.g. San Jose, 95112"
          style={{
            flex: 1, padding: '14px 16px', border: 'none', fontSize: 14,
            fontFamily: T.font, outline: 'none', background: '#fff',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: T.primary, color: '#fff', border: 'none', padding: '14px 22px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font, whiteSpace: 'nowrap',
          }}
        >
          Show my deals →
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: T.textMuted }}>
        <a
          href="#"
          style={{ color: 'inherit' }}
          onClick={(e) => { e.preventDefault(); onLocationSet(null); }}
        >
          or show me deals from everywhere
        </a>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: T.textMuted, opacity: 0.6 }}>
        Your points are yours. We never access your accounts — you book directly.
      </div>
    </div>
  );
};
