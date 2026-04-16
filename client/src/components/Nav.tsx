import { Link, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Plan a Trip', path: '/plan', highlight: true },
  { label: 'Deals', path: '/deals' },
  { label: 'Error Fares', path: '/error-fares' },
  { label: 'Miles & Cards', path: '/miles-cards' },
  { label: 'Blog', path: '/blog', external: true },
];

export default function Nav() {
  const navigate = useNavigate();

  const handleNav = (path: string, external?: boolean) => {
    if (external) {
      window.location.href = path;
    } else {
      navigate(path);
    }
  };

  return (
    <nav style={{ background: 'rgba(249,247,244,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(15,13,46,0.07)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Link to="/" style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, textTransform: 'uppercase', color: '#0f0d2e', textDecoration: 'none', letterSpacing: '0.02em', flexShrink: 0 }}>
          Snap<span style={{ color: '#00C9A7' }}>.</span>Claps
        </Link>

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
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <a href="/login" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(15,13,46,0.6)', textDecoration: 'none', padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(15,13,46,0.12)', transition: 'all 0.15s' }}>Log In</a>
          <a href="/api/upgrade/premium" style={{ background: '#0f0d2e', color: 'white', fontWeight: 700, fontSize: 13, padding: '8px 18px', borderRadius: 10, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>Get Premium →</a>
        </div>
      </div>
    </nav>
  );
}
