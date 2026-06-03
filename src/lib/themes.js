/**
 * themes.js — dashboard themes.
 *
 * Each theme bundles a wallpaper and three brand colours:
 *   accent     → toolbar / active-tab surface / button & omnibox backgrounds.
 *   background → frame / tab backs / NTP background.
 *   foreground → tab text / links / toolbar-icon tint (the dashboard primary).
 *
 * Naruto's three colours (Eggshell / Prussian Blue / Giants Orange) reproduce
 * the original canonical SergioSwift theme. Add an entry here (and drop the
 * image in public/images/) to offer more.
 */
export const THEMES = [
  { id: 'naruto', label: 'Naruto',   src: '/images/naruto-swift.jpg',
    accent: '#F1E9DA', background: '#133552', foreground: '#ED6733' },
  { id: 'kylo',   label: 'Kylo Ren', src: '/images/kylo-ren-4k.jpg',
    accent: '#B72C2A', background: '#2D2F34', foreground: '#C5C4B4' },
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
  root.style.setProperty('--md-sys-color-primary', t.foreground);  // highlight accent
  root.style.setProperty('--md-sys-color-surface-tint', t.foreground);
  root.style.setProperty('--shelf-tint', rgbList(t.background));    // glass takes the bg hue
}

// ── Build an installable Chrome theme manifest from a theme ───────────────────
// accent → toolbar surfaces;  background → frame / NTP;  foreground → tab text /
// links / toolbar-icon tint. Text colours are auto-contrasted for legibility.
export function buildThemeManifest(theme) {
  const A = hexToRgb(theme.accent);
  const B = hexToRgb(theme.background);
  const F = hexToRgb(theme.foreground);
  const onA = onColor(theme.accent);
  const onB = onColor(theme.background);
  return {
    manifest_version: 3,
    name: theme.label,
    version: '1.0.0',
    description: `${theme.label} — a SergioSwift theme. Accent ${theme.accent}, background ${theme.background}, foreground ${theme.foreground}.`,
    theme: {
      images: { theme_ntp_background: 'images/wallpaper.jpg' },
      colors: {
        frame: B,
        frame_inactive: lighten(B, 0.12),
        frame_incognito: darken(B, 0.4),
        toolbar: A,
        tab_text: F,
        tab_background_text: lighten(B, 0.7),
        bookmark_text: onA,
        ntp_background: B,
        ntp_text: onB,
        ntp_link: F,
        ntp_link_underline: F,
        ntp_header: onB,
        omnibox_background: A,
        omnibox_text: onA,
        button_background: A,
      },
      tints: {
        // Toolbar icons take the foreground hue/saturation, with a lightness
        // that contrasts the toolbar (accent): darker on a light toolbar,
        // lighter on a dark one. (Light accent → 0.38 reproduces the original.)
        buttons: (() => {
          const [h, s, l] = rgbToHsl(F);
          return [h, s, isDark(theme.accent) ? Math.max(l, 0.6) : 0.38];
        })(),
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
