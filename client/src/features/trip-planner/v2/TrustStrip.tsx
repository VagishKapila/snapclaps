import { colors, fonts } from './styles';

export default function TrustStrip() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '10px 0 0',
      flexWrap: 'wrap',
    }}>
      {['Free to explore', 'No credit card needed', 'Pay only if you want help booking'].map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {i > 0 && <span style={{ color: colors.gray200, fontSize: 12, userSelect: 'none' }}>·</span>}
          <span style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.gray600,
            letterSpacing: '0.01em',
          }}>
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}
