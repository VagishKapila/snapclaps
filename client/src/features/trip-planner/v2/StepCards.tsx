import { useState } from 'react';
import { colors, fonts, radius, shadows } from './styles';
import { CARDS, TRANSFERABLE_CARDS, AIRLINE_CARDS, HOTEL_CARDS } from '../data/cards';
import type { Card } from '../data/cards';
import CreditCardVisual from './CreditCardVisual';
import BalanceModal from './BalanceModal';
import NoCardModal from './NoCardModal';

export interface CardBalance {
  card_id: string;
  balance: number;
}

interface Props {
  onNext: (data: { balances: CardBalance[]; no_cards: boolean }) => void;
  onBack: () => void;
}

type Category = 'transferable' | 'airline' | 'hotel';

export default function StepCards({ onNext, onBack }: Props) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [editCard, setEditCard] = useState<Card | null>(null);
  const [showNoCard, setShowNoCard] = useState(false);
  const [activeTab, setActiveTab] = useState<Category>('transferable');

  const grouped: Record<Category, Card[]> = {
    transferable: TRANSFERABLE_CARDS,
    airline: AIRLINE_CARDS,
    hotel: HOTEL_CARDS,
  };

  const tabLabels: Record<Category, string> = {
    transferable: 'Transferable',
    airline: 'Airline',
    hotel: 'Hotel',
  };

  function saveBalance(card: Card, balance: number) {
    if (balance > 0) {
      setBalances(prev => ({ ...prev, [card.id]: balance }));
    } else {
      setBalances(prev => { const copy = { ...prev }; delete copy[card.id]; return copy; });
    }
    setEditCard(null);
  }

  function handleNoCards() {
    setShowNoCard(false);
    onNext({ balances: [], no_cards: true });
  }

  const selectedCount = Object.keys(balances).length;

  return (
    <div>
      <h2 style={{ fontFamily: fonts.display, fontSize: 26, color: colors.warmBlack, margin: '0 0 6px', fontWeight: 400, lineHeight: 1.2 }}>
        Which points cards do you have?
      </h2>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 24px' }}>
        Tap any card to add your balance. We'll match your points to the best award.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: colors.gray100, borderRadius: radius.lg, padding: 4 }}>
        {(Object.keys(tabLabels) as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: radius.md,
              background: activeTab === cat ? colors.white : 'transparent',
              border: 'none',
              fontFamily: fonts.body,
              fontSize: 12,
              fontWeight: activeTab === cat ? 700 : 400,
              color: activeTab === cat ? colors.warmBlack : colors.gray400,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: activeTab === cat ? shadows.sm : 'none',
            }}
          >
            {tabLabels[cat]}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 12,
        marginBottom: 24,
        maxHeight: 340,
        overflowY: 'auto',
      }}>
        {grouped[activeTab].map(card => {
          const bal = balances[card.id];
          const selected = bal !== undefined && bal > 0;
          return (
            <button
              key={card.id}
              onClick={() => setEditCard(card)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '12px 8px',
                borderRadius: radius.lg,
                border: `1.5px solid ${selected ? colors.emerald : colors.gray200}`,
                background: selected ? colors.emeraldFaint : colors.white,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
            >
              {selected && (
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: colors.emerald,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <CreditCardVisual card={card} balance={bal} size="sm" />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, color: selected ? colors.emerald : colors.warmBlack }}>
                  {card.program_short}
                </div>
                {selected && (
                  <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.gray400 }}>
                    {bal >= 1000 ? `${(bal / 1000).toFixed(0)}K pts` : `${bal} pts`}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div style={{
          background: colors.emeraldFaint,
          borderRadius: radius.md,
          padding: '10px 14px',
          marginBottom: 16,
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.emerald,
          fontWeight: 600,
        }}>
          ✓ {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected
        </div>
      )}

      <button
        onClick={() => {
          if (selectedCount === 0) {
            setShowNoCard(true);
            return;
          }
          onNext({
            balances: Object.entries(balances).map(([card_id, balance]) => ({ card_id, balance })),
            no_cards: false,
          });
        }}
        style={{
          width: '100%',
          padding: '15px 24px',
          borderRadius: radius.full,
          background: colors.emerald,
          color: colors.white,
          fontFamily: fonts.body,
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
          boxShadow: shadows.card,
          marginBottom: 10,
        }}
      >
        {selectedCount === 0 ? "I don't have any points cards" : 'See my personalized plan →'}
      </button>

      <button
        onClick={onBack}
        style={{
          width: '100%',
          padding: '10px',
          background: 'none',
          border: 'none',
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.gray400,
          cursor: 'pointer',
        }}
      >
        ← Back
      </button>

      {editCard && (
        <BalanceModal
          card={editCard}
          initialBalance={balances[editCard.id] || 0}
          onSave={bal => saveBalance(editCard, bal)}
          onClose={() => setEditCard(null)}
        />
      )}

      {showNoCard && (
        <NoCardModal
          onConfirm={handleNoCards}
          onClose={() => setShowNoCard(false)}
        />
      )}
    </div>
  );
}
