/**
 * themes.js — dashboard themes.
 *
 * Each theme bundles a wallpaper and three brand colours:
 *   accent     → MD3 buttons / highlights (dashboard primary); Chrome-theme
 *                tab-strip background.
 *   background → Chrome-theme toolbar + selected tab; dashboard shelf/glass tint.
 *   foreground → Chrome-theme icons & text.
 */
export const THEMES = [
  { id: 'naruto', label: 'Naruto',   src: '/images/naruto-swift.jpg',
    accent: '#db5d3f', background: '#133552', foreground: '#F1E9DA' },
  { id: 'kylo',   label: 'Kylo Ren', src: '/images/kylo-ren-4k.jpg',
    accent: '#b13031', background: '#2D2F34', foreground: '#C5C4B4' },
];

export const DEFAULT_THEME = 'naruto';

export function getTheme(id) {
  return THEMES.find(t => t.id === id) || THEMES[0];
}

// ── Colour helpers ────────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const rgbList   = hex => hexToRgb(hex).join(', ');            // "r, g, b" for rgba()
const rgbCss    = ([r, g, b]) => `rgb(${r}, ${g}, ${b})`;
const luminance = ([r, g, b]) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
const isDark    = hex => luminance(hexToRgb(hex)) < 0.5;
const onColor   = hex => (isDark(hex) ? [255, 255, 255] : [0, 0, 0]);
const lighten   = ([r, g, b], t) => [r, g, b].map(c => Math.round(c + (255 - c) * t));
const darken    = ([r, g, b], t) => [r, g, b].map(c => Math.round(c * (1 - t)));

function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2; let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [+h.toFixed(3), +s.toFixed(3), +l.toFixed(3)];
}

// ── Apply a theme to the live dashboard ───────────────────────────────────────
export function applyThemeToDashboard(id) {
  const t = getTheme(id);
  const img = document.querySelector('.wallpaper img');
  if (img) img.src = t.src;
  const root = document.documentElement;
  // MD3 buttons / highlights use the accent colour.
  root.style.setProperty('--md-sys-color-primary', t.accent);
  root.style.setProperty('--md-sys-color-on-primary', rgbCss(onColor(t.accent)));
  root.style.setProperty('--md-sys-color-surface-tint', t.accent);
  root.style.setProperty('--shelf-tint', rgbList(t.background));
}

// ── Build an installable Chrome theme manifest from a theme ───────────────────
// accent → tab-strip background;  background → toolbar + selected tab;
// foreground → icons & text.
export function buildThemeManifest(theme) {
  const A = hexToRgb(theme.accent);
  const B = hexToRgb(theme.background);
  const F = hexToRgb(theme.foreground);
  const [fh, fs, fl] = rgbToHsl(F);
  return {
    manifest_version: 3,
    name: `Enten - ${theme.label} Theme`,
    version: '1.0.0',
    description: `${theme.label} — an Enten theme. Accent ${theme.accent}, background ${theme.background}, foreground ${theme.foreground}.`,
    theme: {
      images: { theme_ntp_background: 'images/wallpaper.jpg' },
      colors: {
        frame: A,                       // tab-strip background
        frame_inactive: darken(A, 0.12),
        frame_incognito: darken(A, 0.3),
        toolbar: B,                     // toolbar + selected tab
        tab_text: F,                    // selected-tab text
        tab_background_text: F,         // unselected-tab text
        bookmark_text: F,
        ntp_background: B,
        ntp_text: F,
        ntp_header: F,
        ntp_link: A,                    // links take the accent highlight
        ntp_link_underline: A,
        omnibox_background: B,
        omnibox_text: F,
        button_background: B,
      },
      tints: {
        // Toolbar icons take the foreground colour. Toolbar (background) is the
        // dark surface, so icons stay light (foreground's own lightness).
        buttons: [fh, fs, isDark(theme.background) ? Math.max(fl, 0.6) : 0.38],
        frame: [-1, -1, -1],
        frame_inactive: [-1, 0.35, 0.55],
      },
      properties: {
        ntp_background_alignment: 'center',
        ntp_background_repeat: 'no-repeat',
        ntp_logo_alternate: isDark(theme.background) ? 1 : 0,
      },
    },
  };
}
