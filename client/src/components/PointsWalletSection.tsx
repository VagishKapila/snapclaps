import React from 'react';

interface WalletCard {
  name: string;
  points: number;
  progress: number;
}

interface TripBadge {
  status: 'booked' | 'available' | 'almost' | 'out-of-reach';
  icon: string;
  title: string;
  details: string;
  value: string;
}

export const PointsWalletSection: React.FC = () => {
  const walletCards: WalletCard[] = [
    { name: 'Chase Sapphire Preferred', points: 50000, progress: 45 },
    { name: 'Amex Gold', points: 80000, progress: 72 },
  ];

  const tripBadges: TripBadge[] = [
    {
      status: 'booked',
      icon: '✅',
      title: 'Book Today',
      details: 'Park Hyatt Tokyo 2 nights',
      value: '50K Chase → Hyatt · Worth $900',
    },
    {
      status: 'available',
      icon: '✈️',
      title: 'You Have Enough',
      details: 'ANA Business Class to Tokyo',
      value: '55K Amex → VA · $12,400 value',
    },
    {
      status: 'almost',
      icon: '💳',
      title: 'One Card Away',
      details: 'Emirates First Class to Dubai',
      value: 'Need Alaska miles · one card closes the gap',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked':
        return '#10b981';
      case 'available':
        return '#f59e0b';
      case 'almost':
        return '#FF6B6B';
      default:
        return '#9ca3af';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'booked':
        return 'rgba(16, 185, 129, 0.1)';
      case 'available':
        return 'rgba(245, 158, 11, 0.1)';
      case 'almost':
        return 'rgba(255, 107, 107, 0.1)';
      default:
        return 'rgba(156, 163, 175, 0.1)';
    }
  };

  return (
    <section
      style={{
        backgroundColor: '#f3ede4',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative orb */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          right: '40px',
          width: '400px',
          height: '400px',
          background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          opacity: 0.1,
          zIndex: 0,
        }}
      />

      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '60px',
            alignItems: 'start',
          }}
        >
          {/* Left Column */}
          <div>
            <div
              style={{
                marginBottom: '24px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '56px',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#0f0d2e',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                  letterSpacing: '0.02em',
                }}
              >
                Your Points,
              </h2>
              <h2
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '56px',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: '#0f0d2e',
                  textTransform: 'uppercase',
                  margin: '8px 0 0 0',
                  letterSpacing: '0.02em',
                }}
              >
                Finally
              </h2>
              <p
                style={{
                  fontFamily: 'Condiment, cursive',
                  fontSize: '48px',
                  color: '#00C9A7',
                  margin: '12px 0 0 0',
                  lineHeight: 1,
                }}
              >
                put to work
              </p>
            </div>

            <p
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#4b5563',
                marginBottom: '32px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
              }}
            >
              Connect your loyalty accounts and watch SnapClaps find the absolute best redemptions. We handle the math. You get the upgrades and experiences worth thousands.
            </p>

            <button
              onClick={() => window.location.href = '/api/upgrade/premium'}
              style={{
                padding: '14px 28px',
                backgroundColor: '#0f0d2e',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#00C9A7';
                (e.target as HTMLButtonElement).style.color = '#0f0d2e';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#0f0d2e';
                (e.target as HTMLButtonElement).style.color = '#ffffff';
              }}
            >
              Set Up My Wallet
              <span style={{ fontSize: '18px' }}>→</span>
            </button>
          </div>

          {/* Right Column */}
          <div>
            {/* Wallet Cards */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {walletCards.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    borderRadius: '12px',
                    padding: '20px',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#0f0d2e',
                        margin: 0,
                      }}
                    >
                      {card.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#00C9A7',
                      }}
                    >
                      {card.points.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${card.progress}%`,
                        backgroundColor: '#00C9A7',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      color: '#9ca3af',
                      margin: '8px 0 0 0',
                    }}
                  >
                    {card.progress}% toward next redemption
                  </p>
                </div>
              ))}

              {/* Add Card */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  border: '2px dashed #d1d5db',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#00C9A7';
                  el.style.backgroundColor = 'rgba(0, 201, 167, 0.05)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#d1d5db';
                  el.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                <span
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '24px',
                    color: '#9ca3af',
                    fontWeight: 300,
                  }}
                >
                  +
                </span>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#9ca3af',
                    margin: '8px 0 0 0',
                    fontWeight: 500,
                  }}
                >
                  Add another card
                </p>
              </div>
            </div>

            {/* Trip Badges */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {tripBadges.map((badge, idx) => (
                <div
                  key={idx}
                  style={{
                    background: getStatusBgColor(badge.status),
                    borderLeft: `4px solid ${getStatusColor(badge.status)}`,
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {badge.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#0f0d2e',
                        margin: '0 0 4px 0',
                      }}
                    >
                      {badge.title}
                    </h4>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        color: '#4b5563',
                        margin: '0 0 4px 0',
                        fontWeight: 500,
                      }}
                    >
                      {badge.details}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        color: getStatusColor(badge.status),
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {badge.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PointsWalletSection;
