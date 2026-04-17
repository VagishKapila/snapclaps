// Destination photo URLs — Unsplash (free, no API key)
// In production: download, resize to 600x400, host as /photos/destinations/*.jpg
export const DEST_PHOTOS: Record<string, string> = {
  // Japan / Tokyo
  NRT: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
  HND: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
  // Hawaii
  HNL: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=600&h=400&fit=crop',
  OGG: 'https://images.unsplash.com/photo-1507876466758-bc54f384809c?w=600&h=400&fit=crop',
  // Paris
  CDG: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
  // Bali
  DPS: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
  // Cancun
  CUN: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=600&h=400&fit=crop',
  // London
  LHR: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop',
  // Rome
  FCO: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop',
  // Barcelona
  BCN: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop',
  // Miami
  MIA: 'https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=600&h=400&fit=crop',
  // Seoul
  ICN: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&h=400&fit=crop',
  // Bangkok
  BKK: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&h=400&fit=crop',
  // Maldives
  MLE: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop',
  // Denver
  DEN: 'https://images.unsplash.com/photo-1546156929-a4c0ac411f47?w=600&h=400&fit=crop',
  // Las Vegas
  LAS: 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=600&h=400&fit=crop',
  // Detroit
  DTW: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop',
  // Fallback
  DEFAULT: 'https://images.unsplash.com/photo-1436491865332-7a61a109db05?w=600&h=400&fit=crop',
};

// Large hero photo for Miles section (Japan)
export const MILES_HERO_PHOTO =
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&h=600&fit=crop';

export function getDestPhoto(airportCode: string): string {
  return DEST_PHOTOS[airportCode] || DEST_PHOTOS.DEFAULT;
}
