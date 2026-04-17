import React from 'react';
import { T } from '../theme/tokens';
import { DealCardV2 } from './DealCardV2';
import type { HomepageDeal } from './DealCardV2';

interface DealsSectionProps {
  title: string;
  icon: string;
  deals: HomepageDeal[];
  countColor?: string;
}

export const DealsSection: React.FC<DealsSectionProps> = ({ title, icon, deals, countColor }) => {
  if (!deals || deals.length === 0) return null;

  return (
    <div>
      <div style={{
        padding: '24px 24px 12px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{
          fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.2,
          fontWeight: 600, color: T.primary, margin: 0,
        }}>
          {icon} {title}
        </h3>
        <span style={{
          fontFamily: T.fontMono, fontSize: 10, padding: '3px 8px', borderRadius: 4,
          fontWeight: 600, background: countColor || T.primaryLight,
          color: countColor ? '#fff' : T.primary,
        }}>
          {deals.length} live
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
        padding: '0 24px 24px',
      }}>
        {deals.map((deal, i) => (
          <DealCardV2 key={deal.id || i} deal={deal} />
        ))}
      </div>
    </div>
  );
};
