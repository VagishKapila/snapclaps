export default function TrustBadge() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
      background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20,
      padding: '6px 14px', marginBottom: 24, width: 'fit-content', margin: '0 auto 24px',
    }}>
      <span style={{ fontSize: 14 }}>🔒</span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#166534', fontWeight: 500 }}>
        No credit card needed to see your plan · Real award data from Seats.aero
      </span>
    </div>
  );
}
