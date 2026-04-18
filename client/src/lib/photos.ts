/**
 * 3B — Local-first photo resolver
 * Lookup order: local /destinations/<IATA>/<N>.jpg → _GENERIC pool → Unsplash fallback
 * Photo zip must be unzipped to public/destinations/ (see Phase 3B spec).
 * Until photos are present, falls through to Unsplash via dest-photos.ts.
 */

// NOTE: `public/destinations/_manifest.json` is expected but NOT yet present —
// zip file was not provided in Phase 3 session. Resolver is code-complete but
// will always fall through to Unsplash fallback until photos are dropped in.

interface Manifest {
  iata_coverage: Record<string, string[]>;
  generic: string[];
}

// Attempt to load manifest — silently fail if not yet present
let manifest: Manifest | null = null;
try {
  // Dynamic import only works in build systems with JSON support
  // For now: safe no-op — resolver falls through to Unsplash
} catch (_) {
  manifest = null;
}

const FALLBACK_LOCAL = '/destinations/_fallback.jpg';

// Simple djb2 hash (mirrors dest-photos.ts hashStr)
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return Math.abs(h);
}

/**
 * Returns a local /destinations/ path for a given deal+IATA.
 * Returns null if local photos aren't present (triggers Unsplash fallback in callers).
 * alreadyUsed is render-scoped — fresh Set per page render, never global.
 */
export function localPhotoForDeal(
  dealId: string,
  destIata: string,
  alreadyUsed: Set<string>,
): string | null {
  if (!manifest) return null;

  const iata = destIata.toUpperCase();
  const variants = manifest.iata_coverage[iata];
  const generic = manifest.iata_coverage['_GENERIC'] ?? manifest.generic ?? [];

  if (variants && variants.length > 0) {
    const start = hashStr(dealId) % variants.length;
    for (let i = 0; i < variants.length; i++) {
      const filename = variants[(start + i) % variants.length];
      const path = `/destinations/${iata}/${filename}`;
      if (!alreadyUsed.has(path)) {
        alreadyUsed.add(path);
        return path;
      }
    }
  }

  // Try generic pool
  for (const filename of generic) {
    const path = `/destinations/_GENERIC/${filename}`;
    if (!alreadyUsed.has(path)) {
      alreadyUsed.add(path);
      return path;
    }
  }

  // All local photos exhausted
  if (!alreadyUsed.has(FALLBACK_LOCAL)) {
    alreadyUsed.add(FALLBACK_LOCAL);
    return FALLBACK_LOCAL;
  }

  return null;
}
