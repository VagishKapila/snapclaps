import { useState, useEffect } from 'react';

/**
 * computeEffectiveExpiry — returns the Date when a deal is expected to expire.
 *
 * Priority order:
 *  1. `expiresAt`  — explicit expiry set by server (error fares have 12h timer)
 *  2. `typicalExpiryHours` + `foundAt` — e.g. hotels 72h, regular flights 48h
 *  3. Default: 48h from now (safe fallback — deal still shows, timer still ticks)
 */
export function computeEffectiveExpiry(
  expiresAt: string | null | undefined,
  typicalExpiryHours: number | null | undefined,
  foundAt?: string | null
): Date | null {
  if (expiresAt) {
    const d = new Date(expiresAt);
    if (!isNaN(d.getTime()) && d > new Date()) return d;
  }
  if (typicalExpiryHours && typicalExpiryHours > 0) {
    const base = foundAt ? new Date(foundAt) : new Date();
    if (!isNaN(base.getTime())) {
      return new Date(base.getTime() + typicalExpiryHours * 3_600_000);
    }
  }
  // No explicit expiry — return null (timer won't show for evergreen deals)
  return null;
}

interface CountdownTimerProps {
  expiresAt?: string | null;
  typicalExpiryHours?: number | null;
  foundAt?: string | null;
  /** Compact mode = inline chip. Default = standalone row. */
  compact?: boolean;
}

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

function getTimeLeft(expiry: Date): TimeLeft {
  const diff = Math.max(0, expiry.getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
}

export function CountdownTimer({ expiresAt, typicalExpiryHours, foundAt, compact = false }: CountdownTimerProps) {
  const expiry = computeEffectiveExpiry(expiresAt, typicalExpiryHours, foundAt);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(expiry ? getTimeLeft(expiry) : null);

  useEffect(() => {
    if (!expiry) return;
    const tick = () => {
      const t = getTimeLeft(expiry);
      setTimeLeft(t);
      if (t.totalSeconds <= 0) clearInterval(id);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiry?.toISOString()]);

  // Don't render if no expiry or already expired
  if (!expiry || !timeLeft || timeLeft.totalSeconds <= 0) return null;

  const isUrgent = timeLeft.totalSeconds < 3600; // < 1 hour = red
  const color = isUrgent ? '#FF6B6B' : '#d97706';
  const bg = isUrgent ? 'rgba(255,107,107,0.1)' : 'rgba(217,119,6,0.1)';

  const pad = (n: number) => String(n).padStart(2, '0');
  const label = timeLeft.hours > 0
    ? `${timeLeft.hours}h ${pad(timeLeft.minutes)}m`
    : `${pad(timeLeft.minutes)}m ${pad(timeLeft.seconds)}s`;

  if (compact) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, fontWeight: 700, color,
        background: bg, padding: '2px 7px', borderRadius: 100,
        fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em',
      }}>
        ⏱ {label}
      </span>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '5px 14px',
      borderTop: `1px solid rgba(15,13,46,0.06)`,
      background: bg,
    }}>
      <span style={{ fontSize: 11 }}>⏱</span>
      <span style={{
        fontSize: 10, fontWeight: 700, color,
        fontFamily: "'Anton', sans-serif", letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        Expires in {label}
      </span>
    </div>
  );
}

export default CountdownTimer;
