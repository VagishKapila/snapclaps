import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { label: 'Plan a Trip', path: '/plan', highlight: true },
  { label: 'Deals', path: '/deals' },
  { label: 'Error Fares', path: '/error-fares' },
  { label: 'Miles & Cards', path: '/miles-cards' },
  { label: 'Blog', path: '/blog', external: true },
];

const TIER_COLOR: Record<string, string> = {
  premium: '#00C9A7',
  elite: '#6d28d9',
  free: 'rgba(15,13,46,0.35)',
};

export default function Nav() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNav = (path: string, external?: boolean) => {
    if (external) { window.location.href = path; }
    else { navigate(path); }
  };

  return (
    <nav style={{ background: 'rgba(249,247,244,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(15,13,46,0.07)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Logo */}
        <button onClick={() => navigate('/')} style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, textTransform: 'uppercase', color: '#0f0d2e', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.02em', flexShrink: 0, padding: 0 }}>
          Snap<span style={{ color: '#00C9A7' }}>.</span>Claps
        </button>

        {/* Center nav */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, path, external, highlight }) => (
            <button key={label} onClick={() => handleNav(path, external)} style={{
              background: 'none', border: 'none', fontSize: 13, fontWeight: highlight ? 700 : 500,
              color: highlight ? '#00C9A7' : 'rgba(15,13,46,0.55)', cursor: 'pointer', padding: '6px 12px',
              borderRadius: 8, transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(15,13,46,0.05)'; (e.currentTarget as HTMLElement).style.color = highlight ? '#00C9A7' : '#0f0d2e'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = highlight ? '#00C9A7' : 'rgba(15,13,46,0.55)'; }}
            >{label}</button>
          ))}
          {isAuthenticated && (
            <button onClick={() => navigate('/wallet')} style={{
              background: 'none', border: 'none', fontSize: 13, fontWeight: 600,
              color: TIER_COLOR[user?.tier || 'free'], cursor: 'pointer', padding: '6px 12px',
              borderRadius: 8, transition: 'all 0.15s', fontFamily: "'Inter', sans-serif",
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              💎 My Wallet
            </button>
          )}
        </div>

        {/* Right — auth state */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {/* User avatar + tier badge */}
              <button onClick={() => navigate('/wallet')} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(15,13,46,0.05)', border: 'none',
                borderRadius: 100, padding: '6px 12px 6px 6px', cursor: 'pointer',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${TIER_COLOR[user?.tier || 'free']}, #00a88c)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: 'white',
                }}>
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0f0d2e', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name || user?.email?.split('@')[0]}
                </span>
                <span style={{
                  fontSize: 9, fontFamily: "'Anton', sans-serif", letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: TIER_COLOR[user?.tier || 'free'],
                }}>{user?.tier || 'free'}</span>
              </button>
              <button onClick={logout} style={{
                fontSize: 12, color: 'rgba(15,13,46,0.4)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px 10px', borderRadius: 8,
              }}>Sign out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{
                fontSize: 13, fontWeight: 600, color: 'rgba(15,13,46,0.6)',
                background: 'none', border: '1.5px solid rgba(15,13,46,0.12)',
                borderRadius: 10, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.15s',
              }}>Log In</button>
              <button onClick={() => navigate('/pricing')} style={{
                background: '#0f0d2e', color: 'white', fontWeight: 700, fontSize: 13,
                padding: '8px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}>Get Premium →</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
