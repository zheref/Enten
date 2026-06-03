/**
 * wallpapers.js — the dashboard's wallpaper options.
 * Add an entry here to offer another wallpaper in the Customize panel.
 * `src` paths are served from public/images/ (copied to dist/ by Astro).
 */
export const WALLPAPERS = [
  { id: 'naruto', label: 'Naruto', src: '/images/naruto-swift.jpg' },
  { id: 'kylo',   label: 'Kylo Ren', src: '/images/kylo-ren-4k.jpg' },
];

export const DEFAULT_WALLPAPER = 'naruto';

/** Resolve a wallpaper id to its image src (falls back to the default). */
export function wallpaperSrc(id) {
  const w = WALLPAPERS.find(w => w.id === id);
  return (w || WALLPAPERS[0]).src;
}
