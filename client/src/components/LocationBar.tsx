import React from 'react';
import { T } from '../theme/tokens';
import type { ZipLocation } from '../utils/zip-airports';

interface LocationBarProps {
  location: ZipLocation | null;
  onClear: () => void;
}

export const LocationBar: React.FC<LocationBarProps> = ({ location, onClear }) => {
  if (!location) return null;
  return (
    <div style={{
      fontSize: 11, padding: '8px 24px', background: T.bgWarm,
      display: 'flex', alignItems: 'center', gap: 6, color: T.textSec,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
      <span>
        Showing deals from{' '}
        <strong style={{ color: T.text }}>{location.airports.join(' · ')}</strong>{' '}
        near {location.city}
      </span>
      <span
        onClick={onClear}
        style={{ textDecoration: 'underline', cursor: 'pointer', color: T.primary, fontWeight: 500, marginLeft: 4 }}
      >
        Change
      </span>
      <span style={{ marginLeft: 'auto', opacity: 0.5 }}>Updated 15 min ago</span>
    </div>
  );
};
