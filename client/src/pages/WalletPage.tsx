import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Card {
  id: string;
  issuer: string;
  name: string;
  balance: number;
  transferPartners: string[];
}

export const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      return;
    }

    if (user && user.tier !== 'free') {
      fetchCards();
    }
  }, [user, isAuthenticated, authLoading]);

  const fetchCards = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('sc_token');
      const response = await fetch('/api/wallet', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wallet');
      }

      const data = await response.json();
      setCards(data.cards || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Not authenticated
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f7f4',
        }}
      >
        <div
          style={{
            fontFamily: '"Inter", sans-serif',
            color: '#475569',
            fontSize: '16px',
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f7f4',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
            maxWidth: '420px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '24px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0f0d2e',
              margin: '0 0 16px 0',
            }}
          >
            Sign In Required
          </h2>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 32px 0',
            }}
          >
            Sign in to access your Points Wallet and see deals personalized to your cards.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexDirection: 'column',
            }}
          >
            <Link
              to="/login"
              style={{
                padding: '12px 24px',
                backgroundColor: '#0f0d2e',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '12px 24px',
                backgroundColor: '#00C9A7',
                color: '#0f0d2e',
                textDecoration: 'none',
                borderRadius: '8px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center',
              }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated but not premium
  if (user && user.tier === 'free') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f7f4',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
            maxWidth: '420px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '24px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0f0d2e',
              margin: '0 0 16px 0',
            }}
          >
            Upgrade to Premium
          </h2>
          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 24px 0',
            }}
          >
            Points Wallet is a Premium feature. See which deals you can book with your miles, points, and credit cards.
          </p>

          {/* Preview Card (blurred) */}
          <div
            style={{
              marginBottom: '32px',
              opacity: 0.5,
              filter: 'blur(2px)',
            }}
          >
            <div
              style={{
                backgroundColor: '#0f0d2e',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  color: '#fff',
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Chase Sapphire
              </div>
              <div
                style={{
                  color: '#00C9A7',
                  fontFamily: '"Anton", sans-serif',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                124,000 pts
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = '/api/upgrade/premium';
            }}
            style={{
              width: '100%',
              padding: '14px 24px',
              backgroundColor: '#00C9A7',
              color: '#0f0d2e',
              border: 'none',
              borderRadius: '8px',
              fontFamily: '"Anton", sans-serif',
              fontSize: '14px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00a48a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00C9A7';
            }}
          >
            Upgrade to Premium — $9.99/mo →
          </button>
        </div>
      </div>
    );
  }

  // User is premium/elite - show full wallet
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9f7f4',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '48px',
          }}
        >
          <Link
            to="/"
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '14px',
              color: '#00C9A7',
              textDecoration: 'none',
              marginBottom: '24px',
              display: 'inline-block',
            }}
          >
            ← Back to Deals
          </Link>

          <h1
            style={{
              fontFamily: '"Anton", sans-serif',
              fontSize: '40px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: '#0f0d2e',
              margin: '0 0 16px 0',
            }}
          >
            Points Wallet
          </h1>

          <p
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '16px',
              color: '#64748b',
              margin: '0',
            }}
          >
            All your points, miles, and transfer partners in one place.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div
            style={{
              backgroundColor: '#FF6B6B',
              color: '#fff',
              padding: '16px 20px',
              borderRadius: '8px',
              marginBottom: '24px',
              fontFamily: '"Inter", sans-serif',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              fontFamily: '"Inter", sans-serif',
              color: '#475569',
            }}
          >
            Loading your cards...
          </div>
        )}

        {/* Cards Grid */}
        {!loading && cards.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '40px',
            }}
          >
            {cards.map((card) => (
              <div
                key={card.id}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                  borderLeft: '4px solid #00C9A7',
                }}
              >
                <div
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  {card.issuer}
                </div>

                <h3
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#0f0d2e',
                    margin: '0 0 16px 0',
                  }}
                >
                  {card.name}
                </h3>

                <div
                  style={{
                    marginBottom: '16px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '4px',
                    }}
                  >
                    Balance
                  </div>
                  <div
                    style={{
                      fontFamily: '"Anton", sans-serif',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#00C9A7',
                    }}
                  >
                    {card.balance.toLocaleString()} pts
                  </div>
                </div>

                {card.transferPartners.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '8px',
                      }}
                    >
                      Transfer Partners
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {card.transferPartners.slice(0, 3).map((partner) => (
                        <span
                          key={partner}
                          style={{
                            backgroundColor: '#f0fdf4',
                            color: '#15803d',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '11px',
                            fontWeight: '600',
                          }}
                        >
                          {partner}
                        </span>
                      ))}
                      {card.transferPartners.length > 3 && (
                        <span
                          style={{
                            color: '#94a3b8',
                            fontFamily: '"Inter", sans-serif',
                            fontSize: '11px',
                          }}
                        >
                          +{card.transferPartners.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && cards.length === 0 && (
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '48px 32px',
              textAlign: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: '20px',
                textTransform: 'uppercase',
                color: '#0f0d2e',
                margin: '0 0 12px 0',
              }}
            >
              No Cards Added Yet
            </h3>
            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 24px 0',
              }}
            >
              Add your travel cards to see deals you can book with your points and miles.
            </p>
            <button
              onClick={() => navigate('/wallet/onboard')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#00C9A7',
                color: '#0f0d2e',
                border: 'none',
                borderRadius: '8px',
                fontFamily: '"Anton", sans-serif',
                fontSize: '14px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
              }}
            >
              Add a Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
