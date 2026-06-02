import { defineConfig } from 'astro/config';

export default defineConfig({
  // Pure static output — no server, no SSR.
  // Astro emits plain HTML + JS + CSS that Chrome can load as an extension.
  output: 'static',

  // Build into dist/.  Chrome is pointed at dist/ as the unpacked extension root.
  // Root manifest.json (theme-only) is kept for loading the bare theme.
  // public/manifest.json (full dashboard) is what lands in dist/.
  outDir: 'dist',

  // Astro copies everything in public/ to dist/ verbatim — that is where
  // manifest.json, background.js, and images live.
  publicDir: 'public',

  build: {
    // Chrome forbids directories whose names start with "_".
    // Rename Astro's default "_astro" asset folder to "assets".
    assets: 'assets',
  },
});
