import React from 'react';
import type { WizardStep } from '../types';

const STEPS = [
  { num: 1, label: 'Where You Are' },
  { num: 2, label: 'Destination' },
  { num: 3, label: 'Your Points' },
  { num: 4, label: 'Your Plan' },
];

export default function FunnelProgress({ current }: { current: WizardStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40, padding: '0 16px' }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s.num}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: s.num <= current ? 'var(--teal)' : '#e2e8f0',
              color: s.num <= current ? '#fff' : '#94a3b8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Anton, sans-serif', fontSize: 16,
              transition: 'all 0.3s ease',
            }}>
              {s.num < current ? '✓' : s.num}
            </div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 11,
              color: s.num <= current ? 'var(--navy)' : '#94a3b8',
              fontWeight: s.num === current ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1, height: 2, minWidth: 24, maxWidth: 60,
              background: s.num < current ? 'var(--teal)' : '#e2e8f0',
              margin: '0 4px', marginBottom: 22,
              transition: 'background 0.3s ease',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
