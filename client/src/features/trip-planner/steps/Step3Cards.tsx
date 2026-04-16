import { useState, useEffect } from 'react';
import type { TripCard } from '../types';

interface CardDef {
  id: string;
  name: string;
  issuer: string;
  currency: string;
  color: string;
  sources?: string[];
}

interface Props {
  onNext: (data: { cards: TripCard[]; no_cards: boolean }) => void;
  initial?: { cards?: TripCard[]; no_cards?: boolean };
}

export default function Step3Cards({ onNext, initial }: Props) {
  const [allCards, setAllCards] = useState<CardDef[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>(
    Object.fromEntries((initial?.cards || []).map(c => [c.card_id, c.points_balance]))
  );
  const [noCards, setNoCards] = useState(initial?.no_cards || false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch('/api/plan/cards').then(r => r.json()).then(d => setAllCards(d.cards || [])).catch(() => setAllCards([]));
  }, []);

  const transferCards = allCards.filter(c => c.sources && c.sources.length > 0);
  const displayed = showAll ? transferCards : transferCards.slice(0, 8);

  const toggleCard = (cardId: string) => {
    setSelected(prev => {
      if (prev[cardId] !== undefined) {
        const next = { ...prev };
        delete next[cardId];
        return next;
      }
      return { ...prev, [cardId]: 50000 };
    });
  };

  const updateBalance = (cardId: string, val: string) => {
    const n = parseInt(val.replace(/,/g, ''), 10);
    if (!isNaN(n)) setSelected(prev => ({ ...prev, [cardId]: n }));
  };

  const handleSubmit = () => {
    const cards: TripCard[] = Object.entries(selected).map(([card_id, points_balance]) => ({ card_id, points_balance }));
    onNext({ cards, no_cards: noCards });
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💳</div>
        <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: 32, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: 8 }}>
          Which cards do you have?
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 15 }}>
          We'll match your points to the best award seats. Skip if you want card recommendations instead.
        </p>
      </div>

      <div
        onClick={() => setNoCards(!noCards)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
          borderRadius: 12, border: `2px solid ${noCards ? 'var(--coral)' : '#e2e8f0'}`,
          background: noCards ? '#fff5f5' : '#fff', cursor: 'pointer', marginBottom: 20,
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 4, border: '2px solid',
          borderColor: noCards ? 'var(--coral)' : '#cbd5e1',
          background: noCards ? 'var(--coral)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {noCards && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
        </div>
        <div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 14 }}>
            I don't have travel credit cards yet
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 12 }}>
            We'll show you the best card to get for this trip + the sign-up bonus that covers your flights
          </div>
        </div>
      </div>

      {!noCards && (
        <>
          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 13, marginBottom: 12 }}>
            SELECT YOUR CARDS (tap to add, enter approximate point balance):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10, marginBottom: 16 }}>
            {displayed.map(card => {
              const isSelected = selected[card.id] !== undefined;
              return (
                <div key={card.id} style={{
                  borderRadius: 12, border: `2px solid ${isSelected ? card.color : '#e2e8f0'}`,
                  background: isSelected ? card.color + '15' : '#fff', overflow: 'hidden',
                  transition: 'all 0.2s',
                }}>
                  <div
                    onClick={() => toggleCard(card.id)}
                    style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 3, border: '2px solid',
                      borderColor: isSelected ? card.color : '#cbd5e1',
                      background: isSelected ? card.color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: 11 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 13 }}>{card.name}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b' }}>{card.issuer} · {card.currency}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ padding: '0 14px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={selected[card.id].toLocaleString()}
                        onChange={e => updateBalance(card.id, e.target.value)}
                        placeholder="Points balance"
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 8, border: '1px solid #e2e8f0',
                          fontFamily: 'Inter, sans-serif', fontSize: 13, outline: 'none',
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>pts</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {transferCards.length > 8 && (
            <button
              onClick={() => setShowAll(!showAll)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal)', fontFamily: 'Inter, sans-serif', fontSize: 13, marginBottom: 16 }}
            >
              {showAll ? 'Show less ↑' : `Show all ${transferCards.length} cards ↓`}
            </button>
          )}

          {Object.keys(selected).length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#166534', margin: 0 }}>
                ✓ {Object.keys(selected).length} card{Object.keys(selected).length > 1 ? 's' : ''} selected · {' '}
                {Object.values(selected).reduce((a, b) => a + b, 0).toLocaleString()} total points
              </p>
            </div>
          )}
        </>
      )}

      <button
        onClick={handleSubmit}
        style={{
          width: '100%', padding: '16px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'var(--teal)', color: '#fff', fontFamily: 'Anton, sans-serif',
          fontSize: 18, textTransform: 'uppercase', letterSpacing: 1,
        }}
      >
        Find My Award Seats →
      </button>

      <p style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
        Your card info never leaves your browser · We only use program names + point balances
      </p>
    </div>
  );
}
