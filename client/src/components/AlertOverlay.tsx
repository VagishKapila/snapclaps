import { useState, useEffect } from 'react';

export function AlertOverlay() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.open(`https://buttondown.com/oopsluxescapes/subscribe?email=${encodeURIComponent(email)}`, '_blank');
      setSubmitted(true);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 150,
      background: 'linear-gradient(135deg,#0f0d2e,#1e1b4b)',
      boxShadow: '0 -8px 40px rgba(15,13,46,0.3)',
      transform: collapsed ? 'translateY(calc(100% - 48px))' : 'translateY(0)',
      transition: 'transform 0.3s ease',
    }}>
      {collapsed ? (
        <div onClick={() => setCollapsed(false)} style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>📩 3 Error Fares Live — Get Alerts</span>
        </div>
      ) : (
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 8, height: 8, background: '#FF6B6B', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 1.4s infinite' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>🚨 3 error fares live right now</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>They disappear without warning. Join 12,000+ getting real-time alerts.</div>
            </div>
          </div>
          {submitted ? (
            <div style={{ color: '#00C9A7', fontWeight: 700, fontSize: 14 }}>✓ Check your email!</div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" required
                style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: 9, padding: '10px 16px', fontSize: 13, background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none', minWidth: 200, fontFamily: "'Inter',sans-serif" }}
              />
              <button type="submit" style={{ background: '#00C9A7', color: '#0f0d2e', fontWeight: 800, fontSize: 13, padding: '10px 20px', border: 'none', borderRadius: 9, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Get Free Alerts →
              </button>
            </form>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setCollapsed(true)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', fontSize: 12, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Remind me later</button>
            <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20, padding: '4px 8px' }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
}
export default AlertOverlay;
