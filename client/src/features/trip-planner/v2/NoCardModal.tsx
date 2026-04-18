import { colors, fonts, radius, shadows } from './styles';

interface Props {
  onConfirm: () => void;
  onClose: () => void;
}

export default function NoCardModal({ onConfirm, onClose }: Props) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(26,29,26,0.55)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: colors.white,
        borderRadius: `${radius.xl} ${radius.xl} 0 0`,
        padding: '32px 24px 40px',
        width: '100%',
        maxWidth: 500,
        boxShadow: shadows.lg,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
        <h3 style={{ fontFamily: fonts.display, fontSize: 22, color: colors.warmBlack, fontWeight: 400, margin: '0 0 12px' }}>
          No points yet?
        </h3>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 8px', lineHeight: 1.6 }}>
          That's exactly why we're here.
        </p>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 28px', lineHeight: 1.6 }}>
          We'll show you which one card — based on your destination — earns you enough points for this trip, often within 90 days of the welcome bonus.
        </p>

        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: radius.full,
            background: colors.emerald,
            color: colors.white,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            marginBottom: 10,
          }}
        >
          Show me which card to get →
        </button>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'none',
            border: 'none',
            fontFamily: fonts.body,
            fontSize: 13,
            color: colors.gray400,
            cursor: 'pointer',
          }}
        >
          Actually, I do have points
        </button>
      </div>
    </div>
  );
}
