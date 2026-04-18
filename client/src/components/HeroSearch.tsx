/**
 * 2F — HeroSearch
 * Accepts ZIP codes (numeric) AND city names (text).
 * Shows disambiguation dropdown when a query matches 2+ cities.
 * Persists selection to localStorage.
 */
import React, { useState, useRef, useEffect } from 'react';
import { T } from '../theme/tokens';
import { lookupZip, lookupCity } from '../utils/zip-airports';
import type { ZipLocation } from '../utils/zip-airports';

interface HeroSearchProps {
  onLocationSet: (loc: ZipLocation | null) => void;
  hasLocation: boolean;
}

function isZipInput(val: string): boolean {
  return /^\d+$/.test(val.trim());
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onLocationSet, hasLocation }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<ZipLocation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside closes dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (val: string) => {
    setInput(val);
    setError(null);

    const trimmed = val.trim();
    if (!trimmed || isZipInput(trimmed)) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // City name: compute suggestions live once ≥ 2 chars
    if (trimmed.length >= 2) {
      const matches = lookupCity(trimmed);
      setSuggestions(matches);
      setShowDropdown(matches.length >= 2);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const acceptLocation = (loc: ZipLocation) => {
    onLocationSet(loc);
    localStorage.setItem('snapclaps_location', JSON.stringify(loc));
    setInput('');
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    if (isZipInput(trimmed)) {
      const match = lookupZip(trimmed);
      if (match) {
        acceptLocation(match);
      } else {
        setError('ZIP code not found — try a major city name instead.');
      }
      return;
    }

    // City name path
    const matches = lookupCity(trimmed);
    if (matches.length === 0) {
      setError(`"${trimmed}" not found. Try a major US city like "Chicago" or a ZIP code.`);
    } else if (matches.length === 1) {
      acceptLocation(matches[0]);
    } else {
      // Multiple — show dropdown, let user pick
      setSuggestions(matches);
      setShowDropdown(true);
    }
  };

  if (hasLocation) return null;

  return (
    <div style={{ padding: '40px 24px 28px', textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: T.fontSerif, fontSize: 30, fontWeight: 600,
        lineHeight: 1.25, color: T.text, marginBottom: 10,
      }}>
        Find deals from airports near you
      </h2>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 22 }}>
        We scan hundreds of routes every 15 minutes.<br />
        Enter your city or ZIP and see what's cheap right now.
      </p>

      {/* ── Search box + dropdown wrapper ─────────────────────────────── */}
      <div ref={dropdownRef} style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
        <div style={{
          display: 'flex', borderRadius: T.radius, overflow: 'hidden',
          border: `1.5px solid ${error ? '#DC2626' : T.borderHover}`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <input
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="City or ZIP — Chicago, SF, 10001…"
            style={{
              flex: 1, padding: '14px 16px', border: 'none', fontSize: 14,
              fontFamily: T.font, outline: 'none', background: '#fff',
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              background: T.primary, color: '#fff', border: 'none', padding: '14px 22px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font,
              whiteSpace: 'nowrap',
            }}
          >
            Show my deals →
          </button>
        </div>

        {/* Disambiguation dropdown */}
        {showDropdown && suggestions.length >= 2 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: '#fff', border: `1px solid ${T.border}`,
            borderRadius: T.radiusSmall, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 100, overflow: 'hidden',
          }}>
            <div style={{
              padding: '8px 14px 6px', fontSize: 11, fontWeight: 500,
              color: T.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.1em',
              borderBottom: `1px solid ${T.border}`,
            }}>
              Which city?
            </div>
            {suggestions.map((loc) => (
              <button
                key={loc.city}
                onClick={() => acceptLocation(loc)}
                style={{
                  display: 'flex', width: '100%', alignItems: 'center',
                  justifyContent: 'space-between', padding: '10px 14px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: `1px solid ${T.border}`, textAlign: 'left' as const,
                  fontFamily: T.font,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.primaryLight)}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 14, fontWeight: 500, color: T.text }}>
                  {loc.city}
                </span>
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  {loc.airports.join(' · ')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#DC2626' }}>
          {error}
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: T.textMuted }}>
        <a
          href="#"
          style={{ color: 'inherit' }}
          onClick={(e) => { e.preventDefault(); onLocationSet(null); }}
        >
          or show me deals from everywhere
        </a>
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: T.textMuted, opacity: 0.6 }}>
        Your points are yours. We never access your accounts — you book directly.
      </div>
    </div>
  );
};
