/**
 * themes.js — dashboard themes.
 *
 * Each theme bundles a wallpaper and two brand colours:
 *   accent     → toolbar / active tab / highlights (the dashboard primary).
 *   background → frame / tab backs / backgrounds.
 *
 * Selecting a theme: swaps the wallpaper, recolours the dashboard, and can
 * generate an installable Chrome theme (.zip) featuring the same colours.
 * Add an entry here (and drop the image in public/images/) to offer more.
 */
export const THEMES = [
  { id: 'naruto', label: 'Naruto',   src: '/images/naruto-swift.jpg', accent: '#F1E9DA', background: '#133552' },
  { id: 'kylo',   label: 'Kylo Ren', src: '/images/kylo-ren-4k.jpg',  accent: '#B72C2A', background: '#2D2F34' },
];

export const DEFAULT_THEME = 'naruto';

export function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

// ── Colour helpers ────────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
const rgbList = hex => hexToRgb(hex).join(', ');        // "r, g, b" for rgba()
function luminance([r, g, b]) { return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }
const isDark = hex => luminance(hexToRgb(hex)) < 0.5;
const onColor = hex => (isDark(hex) ? [255, 255, 255] : [0, 0, 0]);  // contrasting text

// ── Apply a theme to the live dashboard ───────────────────────────────────────
export function applyThemeToDashboard(id) {
  const t = getTheme(id);
  const img = document.querySelector('.wallpaper img');
  if (img) img.src = t.src;
  const root = document.documentElement;
  root.style.setProperty('--md-sys-color-primary', t.accent);     // accent highlights
  root.style.setProperty('--md-sys-color-surface-tint', t.accent);
  root.style.setProperty('--shelf-tint', rgbList(t.background));   // glass takes the bg hue
}

// ── Build an installable Chrome theme manifest from a theme ───────────────────
// accent → toolbar / active tab / links;  background → frame / tab backs / NTP.
export function buildThemeManifest(theme) {
  const acc = hexToRgb(theme.accent);
  const bg  = hexToRgb(theme.background);
  const onAcc = onColor(theme.accent);
  const onBg  = onColor(theme.background);
  return {
    manifest_version: 3,
    name: `SergioSwift — ${theme.label}`,
    version: '1.0.0',
    description: `${theme.label} theme — accent ${theme.accent}, background ${theme.background}.`,
    theme: {
      images: { theme_ntp_background: 'images/wallpaper.jpg' },
      colors: {
        frame: bg,
        frame_inactive: bg,
        frame_incognito: bg,
        toolbar: acc,
        tab_text: onAcc,
        tab_background_text: onBg,
        bookmark_text: onAcc,
        ntp_background: bg,
        ntp_text: onBg,
        ntp_link: acc,
        button_background: acc,
        omnibox_background: acc,
        omnibox_text: onAcc,
      },
      properties: {
        ntp_background_alignment: 'center',
        ntp_background_repeat: 'no-repeat',
        ntp_logo_alternate: isDark(theme.background) ? 1 : 0,
      },
    },
  };
}
