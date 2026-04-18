/**
 * Per-section color accents — Phase 2B
 * Applied to: eyebrow label, badge pill, live-count pill only.
 * Buttons, headlines, page backgrounds stay primary green (#2D6A4F).
 * All accent colors verified WCAG AA against #FAFAF5 background.
 */
export const SECTION_THEMES = {
  domestic: {
    accent: '#2D6A4F',
    badgeBg: '#E8F0EB',
    badgeText: '#2D6A4F',
    countBg: '#E8F0EB',
    countText: '#2D6A4F',
    eyebrow: 'NEAR YOU',
  },
  international: {
    accent: '#1B3A2F',
    badgeBg: '#DEE8E2',
    badgeText: '#1B3A2F',
    countBg: '#DEE8E2',
    countText: '#1B3A2F',
    eyebrow: 'WORLDWIDE',
  },
  hotels: {
    accent: '#5B4B8A',
    badgeBg: '#EDE8F5',
    badgeText: '#5B4B8A',
    countBg: '#EDE8F5',
    countText: '#5B4B8A',
    eyebrow: 'STAYS',
  },
  experiences: {
    accent: '#8A5A00',
    badgeBg: '#FFF3DC',
    badgeText: '#8A5A00',
    countBg: '#FFF3DC',
    countText: '#8A5A00',
    eyebrow: 'EXPERIENCES',
  },
  cars: {
    accent: '#4A5D5A',
    badgeBg: '#E5EAE9',
    badgeText: '#4A5D5A',
    countBg: '#E5EAE9',
    countText: '#4A5D5A',
    eyebrow: 'WHEELS',
  },
  miles: {
    accent: '#5F7C46',
    badgeBg: '#F1EED9',
    badgeText: '#5F7C46',
    countBg: '#F1EED9',
    countText: '#5F7C46',
    eyebrow: 'MILES',
  },
} as const;

export type SectionThemeKey = keyof typeof SECTION_THEMES;
export type SectionTheme = typeof SECTION_THEMES[SectionThemeKey];
