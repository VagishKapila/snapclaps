import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AVAILABLE_CARDS = [
  { id: 'chase-saphire-pref', issuer: 'Chase', name: 'Sapphire Preferred' },
  { id: 'chase-saphire-reserve', issuer: 'Chase', name: 'Sapphire Reserve' },
  { id: 'amex-platinum', issuer: 'American Express', name: 'Platinum' },
  { id: 'amex-gold', issuer: 'American Express', name: 'Gold' },
  { id: 'capital-one-venture', issuer: 'Capital One', name: 'Venture X' },
  { id: 'citi-strata', issuer: 'Citi', name: 'Strata Premier' },
  { id: 'bilt-mastercard', issuer: 'Bilt', name: 'Mastercard' },
];

export const WalletOnboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('sc_token');

  const [step, setStep] = useState(1);
  const [homeAirport, setHomeAirport] = useState('');
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [cardBalances, setCardBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectCard = (cardId: string) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
      const newBalances = { ...cardBalances };
      delete newBalances[cardId];
      setCardBalances(newBalances);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleBalanceChange = (cardId: string, value: string) => {
    setCardBalances({
      ...cardBalances,
      [cardId]: value,
    });
  };

  const handleStep1Continue = () => {
    if (!homeAirport.trim()) {
      setError('Please enter your home airport');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (selectedCards.size === 0) {
      setError('Please select at least one card');
      return;
    }
    setError('');
    setStep(3);
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      // Build wallet data
      const walletData = {
        homeAirport: homeAirport.toUpperCase(),
        cards: Array.from(selectedCards).map((cardId) => {
          const card = AVAILABLE_CARDS.find((c) => c.id === cardId);
          return {
            cardId,
            issuer: card?.issuer,
            name: card?.name,
            balance: parseInt(cardBalances[cardId] || '0'),
          };
        }),
      };

      const response = await fetch('/api/wallet/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to set up wallet');
      }

      navigate('/wallet');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f9f7f4',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Progress Indicator */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '48px',
            justifyContent: 'center',
          }}
        >
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= s ? '#00C9A7' : '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Anton", sans-serif',
                fontSize: '18px',
                fontWeight: 'bold',
                color: step >= s ? '#fff' : '#64748b',
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Step 1: Home Airport */}
        {step === 1 && (
          <div>
            <h1
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: '32px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0f0d2e',
                margin: '0 0 16px 0',
              }}
            >
              What's Your Home Airport?
            </h1>

            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 32px 0',
              }}
            >
              We'll use this to recommend deals closest to you.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {error}
              </div>
            )}

            <input
              type="text"
              value={homeAirport}
              onChange={(e) => setHomeAirport(e.target.value.toUpperCase())}
              placeholder="SJC, JFK, LAX, LHR..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px 20px',
                border: '2px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: '"Inter", sans-serif',
                backgroundColor: '#fff',
                color: '#0f0d2e',
                outline: 'none',
                transition: 'border-color 0.2s',
                marginBottom: '32px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00C9A7';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            />

            <button
              onClick={handleStep1Continue}
              style={{
                width: '100%',
                padding: '16px 20px',
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
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Select Cards */}
        {step === 2 && (
          <div>
            <h1
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: '32px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0f0d2e',
                margin: '0 0 16px 0',
              }}
            >
              What Travel Cards Do You Have?
            </h1>

            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 32px 0',
              }}
            >
              Select your cards to see deals you can book.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              {AVAILABLE_CARDS.map((card) => (
                <label
                  key={card.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: selectedCards.has(card.id) ? '#e0fdf4' : '#fff',
                    borderRadius: '8px',
                    border: selectedCards.has(card.id) ? '2px solid #00C9A7' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedCards.has(card.id)}
                    onChange={() => handleSelectCard(card.id)}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}
                    >
                      {card.issuer}
                    </div>
                    <div
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f0d2e',
                      }}
                    >
                      {card.name}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: '#e2e8f0',
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
                Back
              </button>
              <button
                onClick={handleStep2Continue}
                style={{
                  flex: 1,
                  padding: '16px 20px',
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
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Card Balances */}
        {step === 3 && (
          <div>
            <h1
              style={{
                fontFamily: '"Anton", sans-serif',
                fontSize: '32px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                color: '#0f0d2e',
                margin: '0 0 16px 0',
              }}
            >
              How Many Points Do You Have?
            </h1>

            <p
              style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                color: '#64748b',
                margin: '0 0 32px 0',
              }}
            >
              Exact numbers aren't needed — ballpark figures help us find better deals for you.
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '32px',
              }}
            >
              {Array.from(selectedCards).map((cardId) => {
                const card = AVAILABLE_CARDS.find((c) => c.id === cardId);
                return (
                  <div key={cardId}>
                    <label
                      style={{
                        display: 'block',
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0f0d2e',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {card?.name}
                    </label>
                    <input
                      type="number"
                      value={cardBalances[cardId] || ''}
                      onChange={(e) => handleBalanceChange(cardId, e.target.value)}
                      placeholder="0"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 16px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: '"Inter", sans-serif',
                        backgroundColor: '#fff',
                        color: '#0f0d2e',
                        outline: 'none',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: '#e2e8f0',
                  color: '#0f0d2e',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: '"Anton", sans-serif',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={handleCompleteOnboarding}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '16px 20px',
                  backgroundColor: loading ? '#94a3b8' : '#00C9A7',
                  color: '#0f0d2e',
                  border: 'none',
                  borderRadius: '8px',
                  fontFamily: '"Anton", sans-serif',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Setting Up...' : 'See My Deals →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
