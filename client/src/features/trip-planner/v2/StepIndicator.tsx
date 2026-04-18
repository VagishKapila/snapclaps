import { colors, fonts } from './styles';

const STEPS = [
  { label: 'Where you are', num: 1 },
  { label: 'Destination', num: 2 },
  { label: 'Your plan', num: 3 },
  { label: 'Book it', num: 4 },
];

interface Props {
  current: number;
}

export default function StepIndicator({ current }: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      gap: 0,
      marginBottom: 40,
      position: 'relative',
    }}>
      {/* Connector line */}
      <div style={{
        position: 'absolute',
        top: 14,
        left: '10%',
        right: '10%',
        height: 1,
        background: colors.gray200,
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        top: 14,
        left: '10%',
        width: `${Math.max(0, ((current - 1) / 3) * 80)}%`,
        height: 1,
        background: colors.emerald,
        zIndex: 1,
        transition: 'width 0.4s ease',
      }} />

      {STEPS.map((step) => {
        const isDone = step.num < current;
        const isActive = step.num === current;
        const isFuture = step.num > current;
        return (
          <div key={step.num} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            position: 'relative',
            zIndex: 2,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDone ? colors.emerald : isActive ? colors.warmBlack : colors.white,
              border: `1.5px solid ${isDone ? colors.emerald : isActive ? colors.warmBlack : colors.gray200}`,
              transition: 'all 0.25s ease',
              marginBottom: 8,
            }}>
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? colors.white : isFuture ? colors.gray400 : colors.white,
                  lineHeight: 1,
                }}>{step.num}</span>
              )}
            </div>
            <span style={{
              fontFamily: fonts.body,
              fontSize: 11,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? colors.warmBlack : isDone ? colors.emerald : colors.gray400,
              textAlign: 'center',
              maxWidth: 72,
              lineHeight: 1.3,
              transition: 'color 0.25s ease',
            }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
