import React from 'react';
import { DealCard } from './DealCard';
import type { Deal } from '../types';

interface DealRowProps {
  title: string;
  badgeText: string;
  badgeColor?: string;
  deals: Deal[];
  seeAllHref?: string;
}

export function DealRow({ title, badgeText, badgeColor = '#FF6B6B', deals, seeAllHref }: DealRowProps) {
  const isRed = badgeColor === '#FF6B6B';
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px,3vw,30px)', textTransform: 'uppercase', color: '#0f0d2e' }}>{title}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: isRed ? '#FF6B6B' : '#047857', background: isRed ? 'rgba(255,107,107,0.1)' : 'rgba(0,201,167,0.1)', padding: '4px 12px', borderRadius: 100, whiteSpace: 'nowrap' }}>{badgeText}</span>
        </div>
        {seeAllHref && (
          <a href={seeAllHref} style={{ fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(15,13,46,0.35)', textDecoration: 'none', borderBottom: '2px solid #00C9A7', paddingBottom: 2, whiteSpace: 'nowrap' }}>See All →</a>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' } as React.CSSProperties}>
        {deals.map(deal => <DealCard key={deal.id} {...deal} />)}
      </div>
    </div>
  );
}
export default DealRow;
