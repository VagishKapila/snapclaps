import { colors, fonts, radius, shadows } from './styles';
import type { Destination } from '../data/destinations';
import { DESTINATION_EMOJI } from '../data/destinations';

export interface SearchResult {
  search_id: string | number;
  business: { oneway_miles: number; oneway_taxes: number; rt_miles: number; rt_taxes: number; programs_count: number } | null;
  economy: { oneway_miles: number; oneway_taxes: number; rt_miles: number; rt_taxes: number; programs_count: number } | null;
  cash_estimate: number | null;
  transfer_from: string[];
  dates: { out: string; back: string; availability: string }[];
  program_names_hidden: boolean;
  availability_notes?: string;
}

interface Props {
  result: SearchResult;
  destination: Destination;
  month: string;
  duration: number;
  onNext: () => void;
  onBack: () => void;
}

function fmtMiles(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
}

function fmtMonth(yyyyMM: string): string {
  const [y, m] = yyyyMM.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${y}`;
}

// Researching state — destination has no active sweet spot yet
function ResearchingState({ destination, onBack }: { destination: Destination; onBack: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{DESTINATION_EMOJI[destination.airport] || '🌍'}</div>
      <h3 style={{ fontFamily: fonts.display, fontSize: 22, color: colors.warmBlack, fontWeight: 400, margin: '0 0 10px' }}>
        We're researching {destination.name}
      </h3>
      <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.gray600, margin: '0 0 8px', lineHeight: 1.6, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
        We haven't locked in a verified award rate for this destination yet.
        We'll email you within 24 hours when we find a confirmed sweet spot.
      </p>
      <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray400, margin: '0 0 28px' }}>
        In the meantime, browse live flights →
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <a
          href={`https://www.aviasales.com/?marker=716647&origin=JFK&destination=${destination.airport}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '13px 28px',
            borderRadius: radius.full,
            background: colors.emerald,
            color: colors.white,
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Browse live flights for {destination.name}
        </a>
        <button
          onClick={onBack}
          style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray400, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          ← Pick a different destination
        </button>
      </div>
    </div>
  );
}

function MilesCard({ label, data, cashEstimate }: {
  label: string;
  data: { oneway_miles: number; oneway_taxes: number; rt_miles: number; rt_taxes: number; programs_count: number };
  cashEstimate: number | null;
}) {
  const savings = cashEstimate ? Math.round(cashEstimate - data.rt_taxes) : null;
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.gray100}`,
      borderRadius: radius.lg,
      padding: '20px',
      boxShadow: shadows.sm,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <span style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.emerald, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {label}
          </span>
        </div>
        {savings && savings > 0 && (
          <div style={{
            background: '#dcfce7',
            color: '#16a34a',
            fontFamily: fonts.body,
            fontWeight: 700,
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: radius.full,
          }}>
            Save ~${savings.toLocaleString()}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: colors.cream, borderRadius: radius.md, padding: '12px 14px' }}>
          <div style={{ fontFamily: fonts.display, fontSize: 24, color: colors.warmBlack, fontWeight: 400 }}>
            {fmtMiles(data.oneway_miles)}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gray400, marginTop: 2 }}>
            miles one-way
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gray600, marginTop: 4 }}>
            +${data.oneway_taxes} taxes
          </div>
        </div>
        <div style={{ background: colors.cream, borderRadius: radius.md, padding: '12px 14px' }}>
          <div style={{ fontFamily: fonts.display, fontSize: 24, color: colors.warmBlack, fontWeight: 400 }}>
            {fmtMiles(data.rt_miles)}
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gray400, marginTop: 2 }}>
            miles round-trip
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.gray600, marginTop: 4 }}>
            +${data.rt_taxes} taxes
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontFamily: fonts.body, fontSize: 12, color: colors.gray400 }}>
        {data.programs_count} program{data.programs_count !== 1 ? 's' : ''} · program names revealed after unlock
      </div>
    </div>
  );
}

export default function StepResults({ result, destination, month, duration, onNext, onBack }: Props) {
  const hasActiveData = result.business || result.economy;
  const isResearching = !hasActiveData || (!result.business?.oneway_miles && !result.economy?.oneway_miles);

  if (isResearching && result.availability_notes && result.availability_notes.toLowerCase().includes('research')) {
    return <ResearchingState destination={destination} onBack={onBack} />;
  }

  // No active sweet spot in the DB
  if (!hasActiveData) {
    return <ResearchingState destination={destination} onBack={onBack} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 32 }}>{DESTINATION_EMOJI[destination.airport] || '🌍'}</span>
        <div>
          <h2 style={{ fontFamily: fonts.display, fontSize: 24, color: colors.warmBlack, fontWeight: 400, margin: 0, lineHeight: 1.2 }}>
            {destination.name} award options
          </h2>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray400, margin: '4px 0 0' }}>
            {fmtMonth(month)} · {duration} nights · prices are one-way
          </p>
        </div>
      </div>

      {/* Cash comparison */}
      {result.cash_estimate && (
        <div style={{
          background: colors.creamDark,
          borderRadius: radius.md,
          padding: '12px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.gray600 }}>
            Cash price for this trip
          </span>
          <span style={{ fontFamily: fonts.display, fontSize: 22, color: colors.warmBlack }}>
            ~${result.cash_estimate.toLocaleString()}
          </span>
        </div>
      )}

      {/* Miles cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {result.business && (
          <MilesCard label="Business Class" data={result.business} cashEstimate={result.cash_estimate} />
        )}
        {result.economy && (
          <MilesCard label="Economy" data={result.economy} cashEstimate={result.cash_estimate} />
        )}
      </div>

      {/* Transfer programs (blurred) */}
      {result.transfer_from && result.transfer_from.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.gray400, margin: '0 0 8px' }}>
            Transfer from your cards (program names revealed after unlock)
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {result.transfer_from.map((p, i) => (
              <span key={i} style={{
                fontFamily: fonts.body,
                fontSize: 12,
                fontWeight: 600,
                color: colors.emerald,
                background: colors.emeraldFaint,
                padding: '4px 10px',
                borderRadius: radius.full,
              }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability note */}
      {result.availability_notes && (
        <div style={{
          background: '#fef9ef',
          border: `1px solid #fde68a`,
          borderRadius: radius.md,
          padding: '10px 14px',
          marginBottom: 20,
        }}>
          <p style={{ fontFamily: fonts.body, fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
            ⚡ {result.availability_notes}
          </p>
        </div>
      )}

      <button
        onClick={onNext}
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
        }}
      >
        Tell me which cards I need →
      </button>
    </div>
  );
}
