import React from 'react';

interface FeaturedDealProps {
  route: string;
  price: string;
  wasPrice: string;
  savings: string;
  detail: string;
  bookUrl: string;
  foundMinutesAgo: number;
  onGetFree: () => void;
}

export const FeaturedDeal: React.FC<FeaturedDealProps> = ({
  route,
  price,
  wasPrice,
  savings: _savings,
  detail,
  bookUrl,
  foundMinutesAgo,
  onGetFree,
}) => {

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '60vh',
        minHeight: '500px',
        background: 'linear-gradient(135deg, #0f0d2e 0%, #1a0d3e 50%, #0d3d35 100%)',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 20px 60px rgba(0, 201, 167, 0.15)',
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 201, 167, 0.3), transparent)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-100px',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255, 107, 107, 0.25), transparent)',
          borderRadius: '50%',
          filter: 'blur(70px)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Top pills */}
      <div
        style={{
          position: 'absolute',
          top: '32px',
          left: '32px',
          right: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {/* Error fare pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FF6B6B',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontFamily: 'Anton, sans-serif',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
          }}
        >
          🚨 LIVE ERROR FARE
        </div>

        {/* Glass pill - found time ago */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: '#f9f7f4',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          ✦ AI found this {foundMinutesAgo} min ago
        </div>
      </div>

      {/* Bottom content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '48px 32px 32px',
          background: 'linear-gradient(to top, rgba(15, 13, 46, 0.95), transparent)',
          color: 'white',
        }}
      >
        {/* Route text */}
        <div
          style={{
            fontSize: 'clamp(36px, 8vw, 72px)',
            fontFamily: 'Anton, sans-serif',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '-1px',
            lineHeight: '1.1',
            marginBottom: '16px',
          }}
        >
          {route}
        </div>

        {/* Price section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontFamily: 'Anton, sans-serif',
              fontWeight: 'bold',
              color: '#00C9A7',
            }}
          >
            ${price}
          </div>
          <div
            style={{
              fontSize: '20px',
              color: '#ccc',
              textDecoration: 'line-through',
            }}
          >
            ${wasPrice}
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#FF6B6B',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontFamily: 'Anton, sans-serif',
              fontWeight: 'bold',
            }}
          >
            {_savings} OFF
          </div>
        </div>

        {/* Detail text */}
        <div
          style={{
            fontSize: '14px',
            color: '#bbb',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '28px',
          }}
        >
          {detail}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px 28px',
              backgroundColor: '#00C9A7',
              color: '#0f0d2e',
              fontSize: '15px',
              fontFamily: 'Anton, sans-serif',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0, 201, 167, 0.3)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLElement).style.boxShadow = '0 12px 32px rgba(0, 201, 167, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(0)';
              (e.target as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 201, 167, 0.3)';
            }}
          >
            ✈ BOOK NOW — ${price}
          </a>

          <button
            onClick={onGetFree}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '16px 28px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#f9f7f4',
              fontSize: '15px',
              fontFamily: 'Anton, sans-serif',
              fontWeight: 'bold',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            💳 GET THIS FREE WITH POINTS →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }
      `}</style>
    </div>
  );
};
