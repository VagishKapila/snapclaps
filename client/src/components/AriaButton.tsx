import { useState } from 'react';
import { AriaOverlay } from './AriaOverlay';

// SVG illustration of Aria - woman with brown hair, yellow dress + robot buddy
const ARIA_AVATAR_SVG = `
<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <!-- Robot (small, background) -->
  <ellipse cx="62" cy="40" rx="13" ry="16" fill="#c8d8e8" stroke="#a0b4c8" stroke-width="1"/>
  <rect x="55" y="32" width="14" height="10" rx="3" fill="#b0c4d8"/>
  <!-- Robot eyes -->
  <circle cx="59" cy="36" r="2.5" fill="#3b82f6"/>
  <circle cx="65" cy="36" r="2.5" fill="#3b82f6"/>
  <circle cx="59" cy="36" r="1" fill="white"/>
  <circle cx="65" cy="36" r="1" fill="white"/>
  <!-- Robot mouth -->
  <path d="M58 41 Q62 44 66 41" stroke="#7095b0" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- Aria body -->
  <ellipse cx="35" cy="65" rx="18" ry="12" fill="#fbbf24"/>
  <path d="M22 58 Q35 72 48 58" fill="#fbbf24"/>

  <!-- Aria neck -->
  <rect x="32" y="48" width="6" height="8" fill="#e8b4a0"/>

  <!-- Aria head -->
  <ellipse cx="35" cy="40" rx="15" ry="16" fill="#f4c5a8"/>
  
  <!-- Aria hair (long brown wavy) -->
  <ellipse cx="35" cy="33" rx="16" ry="10" fill="#6b3a2a"/>
  <path d="M20 36 Q16 50 18 60" stroke="#6b3a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M50 36 Q54 50 52 60" stroke="#6b3a2a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M20 36 Q17 42 19 52" stroke="#7a4535" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M50 36 Q53 42 51 52" stroke="#7a4535" stroke-width="3" fill="none" stroke-linecap="round"/>

  <!-- Aria eyes -->
  <ellipse cx="30" cy="41" rx="3.5" ry="3" fill="#5c3317"/>
  <ellipse cx="40" cy="41" rx="3.5" ry="3" fill="#5c3317"/>
  <circle cx="31" cy="40" r="1" fill="white"/>
  <circle cx="41" cy="40" r="1" fill="white"/>
  
  <!-- Lashes -->
  <path d="M27 38 Q28 36 30 37" stroke="#3d2210" stroke-width="1" fill="none"/>
  <path d="M43 38 Q42 36 40 37" stroke="#3d2210" stroke-width="1" fill="none"/>

  <!-- Aria smile -->
  <path d="M30 46 Q35 50 40 46" stroke="#c0745a" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  
  <!-- Dress off-shoulder detail -->
  <path d="M20 55 Q35 58 50 55" stroke="#f59e0b" stroke-width="2" fill="none"/>
</svg>
`;

export function AriaButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Aria character button */}
      <button
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close Aria' : 'Ask Aria'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 199,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 0, width: 72, height: 72,
          filter: 'drop-shadow(0 8px 24px rgba(0,201,167,0.4))',
          transition: 'all 0.2s ease',
          transform: open ? 'scale(1.1)' : 'scale(1)',
          animation: 'ariaFloat 3s ease-in-out infinite',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 12px 32px rgba(0,201,167,0.6))'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 8px 24px rgba(0,201,167,0.4))'; }}
      >
        <div dangerouslySetInnerHTML={{ __html: ARIA_AVATAR_SVG }} style={{ width: 72, height: 72 }} />
        {/* Pulsing ring when not open */}
        {!open && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            border: '2px solid #00C9A7', opacity: 0.6,
            animation: 'ariaRing 2s ease-out infinite',
          }} />
        )}
        {/* "Ask me!" speech bubble */}
        {!open && (
          <div style={{
            position: 'absolute', bottom: '100%', right: 0, marginBottom: 8,
            background: 'white', borderRadius: '12px 12px 4px 12px',
            padding: '6px 12px', fontSize: 12, fontWeight: 700, color: '#0f0d2e',
            boxShadow: '0 4px 20px rgba(15,13,46,0.15)', whiteSpace: 'nowrap',
            animation: 'fadeUp 0.3s ease',
          }}>
            ✦ Ask Aria!
          </div>
        )}
      </button>

      <style>{`
        @keyframes ariaFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes ariaRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
      `}</style>

      {open && <AriaOverlay onClose={() => setOpen(false)} />}
    </>
  );
}
export default AriaButton;
