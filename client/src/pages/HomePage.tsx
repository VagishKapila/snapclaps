import { useState, useEffect, useCallback } from 'react';
import { T } from '../theme/tokens';
import { LocationBar } from '../components/LocationBar';
import { HeroSearch } from '../components/HeroSearch';
import { MilesHeroSection } from '../components/MilesHeroSection';
import { DealsSection } from '../components/DealsSection';
import { ExperiencesSection } from '../components/ExperiencesSection';
import { CarsSection } from '../components/CarsSection';
import { useHomepageDeals } from '../hooks/useHomepageDeals';
import type { ZipLocation } from '../utils/zip-airports';

export default function HomePage() {
  const [location, setLocation] = useState<ZipLocation | null>(null);

  // Restore saved location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('snapclaps_location');
      if (saved) setLocation(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const handleLocationSet = useCallback((loc: ZipLocation | null) => {
    setLocation(loc);
    if (loc) localStorage.setItem('snapclaps_location', JSON.stringify(loc));
    else localStorage.removeItem('snapclaps_location');
  }, []);

  const handleClear = useCallback(() => {
    setLocation(null);
    localStorage.removeItem('snapclaps_location');
  }, []);

  const { domestic, international, hotels, loading } = useHomepageDeals(
    location ? location.airports : null
  );

  // Active destination IATAs for experiences filtering
  const activeDestinations = [
    ...domestic.map(d => d.destination_airport),
    ...international.map(d => d.destination_airport),
  ].filter(Boolean);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.font }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
      `}</style>

      {/* Location banner — shown when user has set a location */}
      <LocationBar location={location} onClear={handleClear} />

      {/* ZIP/city search — shown when no location set */}
      <HeroSearch onLocationSet={handleLocationSet} hasLocation={!!location} />

      {/* When location is set, show which airports we're scanning */}
      {location && (
        <div style={{ padding: '16px 24px 0', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: T.fontSerif, fontSize: 22, fontWeight: 600,
            color: T.text, marginBottom: 4,
          }}>
            Deals from airports near {location.city.split(',')[0]}
          </h2>
          <p style={{ fontSize: 12, color: T.textMuted }}>
            Scanning {location.airports.join(', ')} · Updated every 15 minutes
          </p>
        </div>
      )}

      {/* ── MILES SECTION FIRST — above all deal sections ── */}
      <MilesHeroSection />

      {/* ── DEAL SECTIONS ── */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: T.textMuted, fontSize: 14 }}>
          Loading live deals…
        </div>
      ) : (
        <>
          <DealsSection
            title="Domestic flights near you"
            subhead="Updated every 15 minutes — book direct, no middleman"
            deals={domestic}
            themeKey="domestic"
          />
          <DealsSection
            title="International flights"
            subhead="Error fares, flash sales, and sweet spots — gone in hours"
            deals={international}
            themeKey="international"
          />
          <DealsSection
            title="Hotels"
            subhead="Top-rated properties at deal prices — instant confirmation"
            deals={hotels}
            themeKey="hotels"
          />
          {/* 2D — Experiences via Klook */}
          <ExperiencesSection
            activeDestinations={activeDestinations.length > 0 ? activeDestinations : null}
          />
          {/* 2E — Cars coming soon */}
          <CarsSection />
        </>
      )}
    </div>
  );
}
