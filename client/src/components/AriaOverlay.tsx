import { useState } from 'react';

// Same SVG for the overlay
const ARIA_SVG_LARGE = `
<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
  <!-- Robot buddy (small, back right) -->
  <ellipse cx="95" cy="60" rx="20" ry="24" fill="#c8d8e8" stroke="#a0b4c8" stroke-width="1.5"/>
  <rect x="83" y="47" width="22" height="16" rx="4" fill="#b0c4d8"/>
  <circle cx="89" cy="54" r="4" fill="#3b82f6"/><circle cx="89" cy="54" r="1.5" fill="white"/>
  <circle cx="99" cy="54" r="4" fill="#3b82f6"/><circle cx="99" cy="54" r="1.5" fill="white"/>
  <path d="M87 63 Q92 68 97 63" stroke="#7095b0" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Robot hand wave -->
  <rect x="107" y="55" width="6" height="14" rx="3" fill="#b0c4d8"/>
  <circle cx="110" cy="53" r="4" fill="#c8d8e8"/>

  <!-- Aria dress/body -->
  <ellipse cx="52" cy="118" rx="28" ry="18" fill="#fbbf24"/>
  <path d="M28 105 Q52 125 76 105" fill="#fbbf24"/>
  <path d="M28 105 Q52 118 76 105" stroke="#f59e0b" stroke-width="2" fill="none"/>

  <!-- Neck -->
  <rect x="48" y="92" width="9" height="12" fill="#e8b4a0"/>

  <!-- Head -->
  <ellipse cx="52" cy="76" rx="23" ry="24" fill="#f4c5a8"/>
  
  <!-- Hair - long brown wavy -->
  <ellipse cx="52" cy="63" rx="24" ry="14" fill="#6b3a2a"/>
  <path d="M29 72 Q23 95 27 115" stroke="#6b3a2a" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M75 72 Q81 95 77 115" stroke="#6b3a2a" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M30 75 Q25 88 28 103" stroke="#7a4535" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M74 75 Q79 88 76 103" stroke="#7a4535" stroke-width="4" fill="none" stroke-linecap="round"/>

  <!-- Eyes -->
  <ellipse cx="44" cy="77" rx="5" ry="4.5" fill="#5c3317"/>
  <ellipse cx="60" cy="77" rx="5" ry="4.5" fill="#5c3317"/>
  <circle cx="45.5" cy="76" r="1.5" fill="white"/>
  <circle cx="61.5" cy="76" r="1.5" fill="white"/>
  <!-- Lashes -->
  <path d="M40 73 Q42 70 45 71.5" stroke="#3d2210" stroke-width="1.5" fill="none"/>
  <path d="M64 73 Q62 70 59 71.5" stroke="#3d2210" stroke-width="1.5" fill="none"/>
  <!-- Brows -->
  <path d="M40 70 Q44 68 48 70" stroke="#5c3317" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M56 70 Q60 68 64 70" stroke="#5c3317" stroke-width="1.5" fill="none" stroke-linecap="round"/>

  <!-- Smile -->
  <path d="M44 84 Q52 91 60 84" stroke="#c0745a" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M44 84 Q52 89 60 84" fill="#f48c7a" opacity="0.3"/>
</svg>
`;

interface AriaOverlayProps {
  onClose: () => void;
}

export function AriaOverlay({ onClose }: AriaOverlayProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      msg: "Hey! 👋 I'm Aria, your AI travel guide. I just found a Milan deal for $143 — that's 83% off! Want me to show you how to get it completely free with Chase points?",
      options: ["Yes! Show me how 🙌", "I already have points 💳", "Just book with cash →"]
    },
    {
      msg: "Perfect! Here's your 3-step path to free Milan flight:\n\n1️⃣ Apply for Chase Sapphire Preferred (60K bonus)\n2️⃣ Transfer 28K points → Turkish Miles\n3️⃣ Book JFK→MXP for ~$25 in taxes\n\nTotal cost: $25. Normally $850.",
      options: ["Apply for Chase Sapphire →", "I have Chase already", "Tell me more options"]
    },
    {
      msg: "Great! The Chase Sapphire Preferred gives you 60K points. That's enough for 2 Milan roundtrips AND the little robot here goes wild every time someone scores a deal like this 🤖✨",
      options: ["Apply Now →", "Find me another deal →"]
    }
  ];

  const current = steps[Math.min(step, steps.length - 1)];

  const handleOption = (opt: string, idx: number) => {
    if (opt.includes('→') && opt.includes('Chase')) {
      window.open('https://creditcards.chase.com/rewards-credit-cards/sapphire/preferred', '_blank');
    } else if (opt.includes('cash →')) {
      window.open('https://www.aviasales.com/?marker=716647', '_blank');
    } else if (idx === 0 && step < steps.length - 1) {
      setStep(s => s + 1);
    } else if (opt.includes('deal →')) {
      onClose();
    } else {
      setStep(s => Math.min(s + 1, steps.length - 1));
    }
  };

  return (
    <div style={{
      position: 'fixed', bottom: 110, right: 16, zIndex: 200,
      width: 340, animation: 'ariaSlideIn 0.4s ease',
    }}>
      <style>{`
        @keyframes ariaSlideIn { from{opacity:0;transform:translateX(20px) translateY(10px)} to{opacity:1;transform:translateX(0) translateY(0)} }
      `}</style>

      {/* Chat bubble */}
      <div style={{
        background: 'white', borderRadius: '20px 20px 4px 20px',
        padding: 20, boxShadow: '0 16px 48px rgba(15,13,46,0.18)',
        border: '1.5px solid rgba(15,13,46,0.08)', marginBottom: 12, position: 'relative',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 12, background: 'rgba(15,13,46,0.06)',
          border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer',
          fontSize: 14, color: 'rgba(15,13,46,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {/* Aria name tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#00C9A7,#00a88c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 2px 8px rgba(0,201,167,0.3)',
          }}>👩</div>
          <div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 12, textTransform: 'uppercase', color: '#00C9A7' }}>Aria</div>
            <div style={{ fontSize: 10, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 5, height: 5, background: '#22c55e', borderRadius: '50%', display: 'inline-block' }} />
              Online · here to help
            </div>
          </div>
          {/* Step indicators */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= step ? '#00C9A7' : 'rgba(15,13,46,0.15)' }} />
            ))}
          </div>
        </div>

        {/* Message */}
        <p style={{ fontSize: 14, color: '#0f0d2e', lineHeight: 1.6, marginBottom: 16, whiteSpace: 'pre-line' }}>
          {current.msg}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {current.options.map((opt, i) => (
            <button key={i} onClick={() => handleOption(opt, i)} style={{
              background: i === 0 ? '#0f0d2e' : 'rgba(15,13,46,0.04)',
              color: i === 0 ? 'white' : '#0f0d2e',
              border: 'none', borderRadius: 10, padding: '10px 14px',
              fontSize: 13, fontWeight: i === 0 ? 700 : 500, cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? '#00C9A7' : 'rgba(15,13,46,0.08)'; if(i===0)(e.currentTarget as HTMLElement).style.color='#0f0d2e'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? '#0f0d2e' : 'rgba(15,13,46,0.04)'; if(i===0)(e.currentTarget as HTMLElement).style.color='white'; }}
            >{opt}</button>
          ))}
        </div>
      </div>

      {/* Aria character standing next to chat */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ fontSize: 11, color: 'rgba(15,13,46,0.35)', alignSelf: 'center' }}>Aria · AI Travel Guide</div>
        <div
          dangerouslySetInnerHTML={{ __html: ARIA_SVG_LARGE }}
          style={{
            width: 90, height: 105,
            filter: 'drop-shadow(0 4px 16px rgba(0,201,167,0.25))',
            animation: 'ariaFloat 3s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
export default AriaOverlay;
