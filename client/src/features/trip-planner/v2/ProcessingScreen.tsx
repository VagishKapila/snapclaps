import { useEffect, useState } from 'react';
import { colors, fonts } from './styles';

const MESSAGES = [
  'Scanning award availability…',
  'Matching your points to sweet spots…',
  'Calculating off-peak windows…',
  'Finding the best programs…',
  'Almost there…',
];

interface Props {
  destination: string;
  onComplete: () => void;
  delayMs?: number;
}

export default function ProcessingScreen({ destination, onComplete, delayMs = 2800 }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => Math.min(i + 1, MESSAGES.length - 1));
    }, 600);
    const dotsInterval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    const timer = setTimeout(onComplete, delayMs);
    return () => { clearInterval(interval); clearInterval(dotsInterval); clearTimeout(timer); };
  }, [onComplete, delayMs]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      minHeight: 280,
    }}>
      {/* Animated pulse dot */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: colors.emerald,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          position: 'relative',
          zIndex: 2,
        }}>
          ✈️
        </div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: colors.emerald,
          opacity: 0.15,
          animation: 'pulse-ring 1.4s ease-out infinite',
        }} />
        <style>{`
          @keyframes pulse-ring {
            0% { transform: translate(-50%,-50%) scale(1); opacity: 0.15; }
            100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
          }
        `}</style>
      </div>

      <h3 style={{
        fontFamily: fonts.display,
        fontSize: 22,
        color: colors.warmBlack,
        fontWeight: 400,
        margin: '0 0 8px',
        textAlign: 'center',
      }}>
        Searching award space for {destination}
      </h3>

      <p style={{
        fontFamily: fonts.body,
        fontSize: 14,
        color: colors.gray600,
        margin: '0 0 32px',
        textAlign: 'center',
        minHeight: 20,
        transition: 'opacity 0.3s ease',
      }}>
        {MESSAGES[msgIdx]}{dots}
      </p>

      {/* Progress bar */}
      <div style={{
        width: '100%',
        maxWidth: 280,
        height: 3,
        background: colors.gray100,
        borderRadius: 99,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: colors.emerald,
          borderRadius: 99,
          animation: `progress-bar ${delayMs}ms ease forwards`,
        }} />
      </div>
      <style>{`
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
