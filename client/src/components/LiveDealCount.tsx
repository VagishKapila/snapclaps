/**
 * 3C — Real-data social proof counter
 * Source: travelpayouts:live_deals (PostgreSQL deal count, 10-min server cache)
 * Rules: real data only, hide on failure, no hardcoded numbers
 */
import { useEffect, useState } from 'react';
import { T } from '../theme/tokens';

export const LiveDealCount: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);
  const [source, setSource] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/deals/count')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => {
        if (!cancelled && typeof d.count === 'number') {
          setCount(d.count);
          setSource(d.source ?? 'travelpayouts:live_deals');
        }
      })
      .catch(() => { /* fail silently — component returns null */ });
    return () => { cancelled = true; };
  }, []);

  if (count === null) return null;

  return (
    <p
      data-source={source}
      style={{
        textAlign: 'center',
        margin: '8px 0 0',
        fontSize: 13,
        fontWeight: 500,
        color: T.textMuted,
        fontFamily: T.font,
      }}
    >
      {count.toLocaleString()} deals live right now
    </p>
  );
};
