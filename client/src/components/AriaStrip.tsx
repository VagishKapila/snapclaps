import React from 'react';

interface AriaStripProps {
  message: string;
  onCta: () => void;
}

export const AriaStrip: React.FC<AriaStripProps> = ({ message, onCta }) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'white',
        borderLeft: '4px solid #00C9A7',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        marginBottom: '40px',
      }}
    >
      {/* Aria avatar with online indicator */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#f0f9f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            border: '2px solid #e0f2ee',
          }}
        >
          🧑‍💻
        </div>
        {/* Green online dot */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '12px',
            height: '12px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
          }}
        />
      </div>

      {/* Text content */}
      <div
        style={{
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontFamily: 'Anton, sans-serif',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: '#0f0d2e',
            marginBottom: '6px',
          }}
        >
          ✦ ARIA SAYS · YOUR AI TRAVEL GUIDE · ONLINE NOW
        </div>
        <div
          style={{
            fontSize: '15px',
            fontFamily: 'Inter, sans-serif',
            color: '#374151',
            lineHeight: '1.5',
          }}
        >
          {message}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onCta}
        style={{
          flexShrink: 0,
          padding: '10px 16px',
          backgroundColor: '#00C9A7',
          color: '#0f0d2e',
          fontSize: '13px',
          fontFamily: 'Anton, sans-serif',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0, 201, 167, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#00b089';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 201, 167, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#00C9A7';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 201, 167, 0.2)';
        }}
      >
        ARIA, SHOW ME HOW →
      </button>
    </div>
  );
};
