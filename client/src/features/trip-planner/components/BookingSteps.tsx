import type { BookingStep } from '../types';

export default function BookingSteps({ steps, programName }: { steps: BookingStep[]; programName: string }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--navy)', fontSize: 14, marginBottom: 12 }}>
        How to book with {programName}:
      </h4>
      {steps.map(s => (
        <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: 'var(--teal)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Anton, sans-serif', fontSize: 14, flexShrink: 0, marginTop: 2,
          }}>{s.step}</div>
          <div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: 'var(--navy)', fontSize: 14 }}>{s.action}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{s.detail}</div>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--teal)', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600 }}>
                Book Now →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
