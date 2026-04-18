import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { T } from '../theme/tokens';

const NAV_LINKS = [
  { label: 'Plan a Trip', path: '/plan', highlight: true },
  { label: 'Deals', path: '/deals' },
  { label: 'Error Fares', path: '/error-fares' },
  { label: 'Miles & Cards', path: '/miles-cards' },
  { label: 'Blog', path: '/blog', external: true },
];

export default function Nav() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNav = (path: string, external?: boolean) => {
    if (external) { window.location.href = path; }
    else { navigate(path); }
  };

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg,
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        style={{
          fontWeight: 700, fontSize: 17, letterSpacing: -0.5, color: T.text,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: T.font,
        }}
      >
        snap<span style={{ color: T.primary }}>.</span>claps
      </button>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: T.textSec }}>
        {NAV_LINKS.map(({ label, path, external, highlight }) => (
          <button
            key={label}
            onClick={() => handleNav(path, external)}
            style={{
              background: 'none', border: 'none', fontSize: 12,
              fontWeight: highlight ? 700 : 400,
              color: highlight ? T.primary : T.textSec,
              cursor: 'pointer', padding: '6px 10px',
              borderRadius: T.radiusSmall, transition: 'all 0.15s',
              fontFamily: T.font,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = T.primaryLight;
              (e.currentTarget as HTMLElement).style.color = T.primary;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '';
              (e.currentTarget as HTMLElement).style.color = highlight ? T.primary : T.textSec;
            }}
          >
            {label}
          </button>
        ))}
        {isAuthenticated && (
          <button
            onClick={() => navigate('/wallet')}
            style={{
              background: 'none', border: 'none', fontSize: 12, fontWeight: 600,
              color: T.primary, cursor: 'pointer', padding: '6px 10px',
              borderRadius: T.radiusSmall, transition: 'all 0.15s', fontFamily: T.font,
            }}
          >
            💎 My Wallet
          </button>
        )}
      </div>

      {/* Right — auth state */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate('/wallet')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: T.primaryLight, border: 'none',
                borderRadius: 100, padding: '6px 12px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: T.primary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: 'white',
              }}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?'}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </button>
            <button
              onClick={logout}
              style={{
                fontSize: 12, color: T.textMuted, background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px 10px', borderRadius: T.radiusSmall,
                fontFamily: T.font,
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <a
              href="/login"
              style={{ fontSize: 12, color: T.textSec, textDecoration: 'none', fontFamily: T.font }}
            >
              Log in
            </a>
            <button
              onClick={() => navigate('/pricing')}
              style={{
                background: T.primary, color: '#fff', border: 'none', padding: '8px 16px',
                borderRadius: T.radiusSmall, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: T.font,
              }}
            >
              Get Premium →
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
