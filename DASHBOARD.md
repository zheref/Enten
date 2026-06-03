# Enten Dashboard — Architecture & Setup Guide

This document covers everything you need to go from this scaffold to a
fully working personal dashboard — and what to expect at each step.

---

## What's already scaffolded

```
src/
├── pages/index.astro           ← Desktop shell: wallpaper, draggable widgets, anchoring, shelf
├── components/
│   ├── Shortcuts.astro         ← Shelf app icons + drag-reorder + right-click menu
│   ├── CalendarWidget.astro    ← Google Calendar card (md-elevated-card + md-list)
│   ├── EmailWidget.astro       ← Gmail card (md-elevated-card + md-list)
│   ├── StatusArea.astro        ← Account · theme mode · clock (md-icon-button + md-menu)
│   ├── CustomizePanel.astro    ← Theme picker + downloadable Chrome theme (.zip)
│   └── ContainmentAdjuster.astro ← "Customize Icon" panel (source, custom URL, nudge, scale, bg)
├── lib/
│   ├── google.js               ← chrome.identity + Calendar + Gmail API calls
│   ├── storage.js              ← chrome.storage.local wrapper
│   ├── themes.js               ← Theme registry + dashboard apply + Chrome-theme builder
│   ├── favicons.js             ← Favicon resolution + source candidates
│   ├── menu.js                 ← Center-on-anchor helper for md-menu
│   ├── snackbar.js             ← Reusable MD3 snackbar
│   ├── cursor-fix.js           ← Default-cursor policy inside md-* shadow roots
│   └── md-components.ts        ← Registers the Material Web (md-*) custom elements
└── styles/theme.css            ← MD3 token sheet (light/dark) + global component layer

public/                         ← Copied verbatim to dist/ by Astro
├── manifest.json               ← Full extension manifest
├── background.js               ← MV3 service worker
└── images/
    ├── naruto-swift.jpg        ← Naruto wallpaper
    └── kylo-ren-4k.jpg         ← Kylo Ren wallpaper
```

### Material Design 3 — official components

The UI is built on **[@material/web](https://github.com/material-components/material-web)**
(Google's official Material Web Components): `md-elevated-card`, `md-list` /
`md-list-item`, `md-icon-button`, `md-filled-button`, `md-menu` / `md-menu-item` /
`md-sub-menu`, and `md-slider`. They render canonical MD3 behaviour — notably
`md-elevation` (shadow **plus** surface-tint, auto-tonal in dark mode), ripples,
and typography.

They read our `--md-sys-*` tokens from `theme.css`, so the Enten palette
and light/dark switching apply to them automatically. All `md-*` elements are
registered once via `src/lib/md-components.ts`, imported from the page script.

> The colour tokens in `theme.css` are still hand-authored approximations of the
> brand palette's tonal ramps. To make them algorithmically exact, generate them
> with `@material/material-color-utilities` from the source hex codes — a good
> follow-up, but not required for the components to work.

---

## Feasibility map

| Feature | Works? | Notes |
|---------|--------|-------|
| Astro static NTP | ✅ | Static HTML/CSS/JS — perfect for Chrome extension pages |
| Custom CSS design system | ✅ | Full CSS control; Enten tokens in `theme.css` |
| App shortcuts (persisted) | ✅ | Stored in `chrome.storage.local` |
| Google Calendar | ✅ | `chrome.identity` + Calendar API; no popup for signed-in Chrome user |
| Gmail inbox | ✅ | Same; note Gmail scope needs Google verification for public distribution |
| Token storage | ✅ | `chrome.storage.local` — safest option (see §Token storage below) |
| Single Google account | ✅ | `chrome.identity.getAuthToken()` — zero friction |
| Multiple Google accounts | ⚠️ | Possible via `launchWebAuthFlow()`; significantly more setup |
| Background data refresh | ✅ | `chrome.alarms` API; stub in `background.js` |
| Web Store publishing | ✅ | See §Publishing |
| Filesystem JSON config | ❌ | Extensions are sandboxed; use `chrome.storage` instead |
| Dashboard light / auto / dark mode | ✅ | The dashboard's own MD3 tokens switch via the status-area menu (`themeMode`) |
| Auto light/dark for the **Chrome theme** | ❌ | The Chrome *theme* API has no `prefers-color-scheme` equivalent |
| Downloadable Chrome theme from a palette | ✅ | *Customize* panel builds an installable `.zip` (see §Theming) |

---

## Token storage — why chrome.storage.local

| Option | Persistent | Survives "Clear data" | Secure | Notes |
|--------|-----------|----------------------|--------|-------|
| `chrome.storage.local` | ✅ | ✅ | ✅ (ext-only) | **Recommended** |
| `chrome.storage.sync` | ✅ syncs | ✅ | ✅ | 100 KB limit; good for settings |
| `localStorage` | ✅ | ❌ cleared | ✅ | Cleared by "Clear browsing data" |
| JSON file | ❌ | — | ❌ | No direct filesystem access |

With `chrome.identity.getAuthToken()`, Chrome manages the OAuth token itself —
you never store it. Only user preferences and cached API responses need storage.

---

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Set up a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (e.g. "Enten").
3. **APIs & Services → Enable APIs:**
   - Google Calendar API
   - Gmail API
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID:**
   - Application type: **Chrome Extension**
   - Extension ID: find yours at `chrome://extensions` after loading unpacked
     (or use a fixed ID — see §Stable Extension ID below)
5. Copy the **Client ID** into `public/manifest.json`:
   ```json
   "oauth2": {
     "client_id": "YOUR_ID_HERE.apps.googleusercontent.com",
     ...
   }
   ```

### Stable Extension ID (important for OAuth)

Chrome assigns a random ID to unpacked extensions unless you pin it.
To pin it:

1. Generate a key pair:
   ```bash
   openssl genrsa 2048 | openssl pkcs8 -topk8 -nocrypt -out key.pem
   openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A > key.pub
   ```
2. Add the base64 public key to `public/manifest.json`:
   ```json
   "key": "PASTE_BASE64_PUBLIC_KEY_HERE"
   ```
3. The extension ID is now deterministic — register this ID in Google Cloud.
4. **Never commit `key.pem`** — it's in `.gitignore`.

---

## Step 3 — Build

```bash
npm run build
```

Astro outputs everything to `dist/`:

```
dist/
├── manifest.json      ← from public/
├── background.js      ← from public/
├── images/            ← from public/images/
├── index.html         ← compiled from src/pages/index.astro
└── assets/            ← bundled JS + CSS (renamed from Astro's "_astro" — Chrome forbids "_" dirs)
```

---

## Step 4 — Load in Chrome

1. `chrome://extensions` → Enable **Developer mode**.
2. **Load unpacked** → select the `dist/` folder.
3. Open a new tab. You should see the dashboard.

> **Note**: `dist/` is `.gitignore`d. Run `npm run build` whenever you change
> source files, then reload the extension at `chrome://extensions`.

---

## Development workflow

```bash
# Fast UI iteration in the browser (no Chrome APIs — uses mock data)
npm run dev
# → http://localhost:4321

# Build + test in Chrome (real APIs)
npm run build
# → reload extension at chrome://extensions
```

`google.js` and `storage.js` detect when they're running outside Chrome and
return mock data / an in-memory store — so `npm run dev` never crashes.

---

## Customising shelf shortcuts

Shortcuts live in `chrome.storage.local` under the `shortcuts` key. Defaults
are defined in `src/components/Shortcuts.astro`. Each entry supports:

```js
{
  label: 'GitHub',                  // accessible name + tooltip
  url:   'https://github.com',      // opens in a new tab; favicon resolved from host
  scale: 55,                        // 0–100, percent of the circle (default: 100)
  elevation: 1,                     // 0 | 1 | 2 | 3, MD3 levels (default: 1)
}
```

**`scale` — favicon size as a percentage of the 40dp circle:**

| Value | Behaviour | Use for |
|-------|-----------|---------|
| `100` | Favicon fills the circle and is clipped round | Favicons with their own square coloured background (Gmail, YouTube) |
| `< 100` | Favicon scaled down proportionally and centred, white circle visible around it | Transparent / glyph-only favicons (GitHub ≈ 55, Notion, Vercel) |

Any value in between works — `75` for a larger centred glyph, `40` for a tiny
one. `100` reproduces the old "clip" behaviour; ~`55` reproduces the old
"contain" look.

**`elevation`** maps to MD3 elevation levels 0–3, independent of `scale`;
hover bumps it up one level.

To change them at runtime, write a new array to storage from the DevTools
console on the new-tab page:

```js
chrome.storage.local.set({ shortcuts: [
  { label: 'Gmail', url: 'https://mail.google.com', scale: 100, elevation: 2 },
  { label: 'GitHub', url: 'https://github.com',     scale: 55,  elevation: 1 },
  // …
]});
```

---

## Theming

Themes live in `src/lib/themes.js`. Each entry bundles a wallpaper and three
brand colours mapped to consistent roles:

```js
{ id: 'naruto', label: 'Naruto', src: '/images/naruto-swift.jpg',
  accent: '#db5d3f', background: '#133552', foreground: '#F1E9DA' }
```

| Role | Drives (dashboard) | Drives (generated Chrome theme) |
|------|--------------------|---------------------------------|
| `accent` | MD3 `--md-sys-color-primary` (buttons/highlights) | tab strip (`frame`) + NTP links |
| `background` | shelf / glass tint (`--shelf-tint`) | toolbar + selected tab + NTP fill |
| `foreground` | — | icons & text |

Built-in themes:

| Theme | Accent | Background | Foreground |
|-------|--------|------------|------------|
| **Naruto** | `#db5d3f` Medium Vermillion | `#133552` Prussian Blue | `#F1E9DA` Eggshell |
| **Kylo Ren** | `#b13031` Well Read | `#2D2F34` Cold Gray | `#C5C4B4` Ash |

Right-click the wallpaper → **Customize** to open the theme picker. Selecting a
theme recolours the live dashboard (`applyThemeToDashboard`) and persists under
the `theme` key. **Download Chrome theme (.zip)** runs `buildThemeManifest()` +
JSZip to emit an installable theme named **"Enten - <Theme> Theme"**.

To add a theme, append an entry to `THEMES` (drop the wallpaper in
`public/images/`) — the picker and zip builder pick it up automatically.

The dashboard's own surface also switches **light / auto / dark** independently of
the theme, via the status-area menu (persisted under `themeMode`).

---

## Customizing app icons

Right-click any shelf icon → **Customize Icon**. The panel writes a per-URL entry
to `chrome.storage.local` under `appOverrides`:

```js
appOverrides['https://github.com'] = {
  scale: 60,                 // 0–100, % of the circle (100 fills & clips)
  bg: '#0d1117',             // circle background colour
  icon: 'https://…/x.png',   // chosen source or a custom image URL (optional)
  offset: { x: 0, y: -2 },   // manual nudge within the circle, px (optional)
}
```

- **Icon source picker** — Chrome's cached favicon, Google faviconV2 ×128/×64,
  Google domain, DuckDuckGo, or the site's `/favicon.ico` (see `src/lib/favicons.js`).
- **Custom URL** — the trailing **+** tile reveals a field to paste any image URL.
- **Move arrows** — nudge the icon within the circle (any source).
- **Reset** clears the override and restores the default.

Bookmark icons can also be **dragged to reorder**; the order persists under
`bookmarkOrder`.

---

## Multi-account support

`chrome.identity.getAuthToken()` only works for the **primary** signed-in
Chrome profile account. For additional accounts:

1. Use `chrome.identity.launchWebAuthFlow()` — opens an OAuth popup.
2. Store the returned `access_token` and `refresh_token` in
   `chrome.storage.local` keyed by account email.
3. Implement token refresh: when a call returns 401, use the `refresh_token`
   to get a new `access_token` from
   `https://oauth2.googleapis.com/token`.

This is significantly more work. Recommended only if you need
a secondary Google Workspace account alongside your personal one.

---

## Publishing to the Chrome Web Store

### Scopes and verification

| Scope | Verification required for public listing |
|-------|------------------------------------------|
| `calendar.readonly` | May require verification |
| `gmail.readonly` | **Yes** — Google requires an OAuth app review |
| `userinfo.email` | No |

For **personal use** (unpacked or shared privately):
- No verification needed.
- Google shows an "unverified app" warning on first sign-in — click *Continue*.

For **public Web Store listing** with Gmail scope:
- Submit for Google OAuth verification at
  [support.google.com/cloud/answer/9110914](https://support.google.com/cloud/answer/9110914).
- Requires a privacy policy URL and a demo video.
- Timeline: 2–6 weeks.

### Packaging

```bash
npm run build
cd dist && zip -r ../enten-v2.zip . && cd ..
```

Upload `enten-v2.zip` to the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

---

## Directory reference

| Path | Purpose |
|------|---------|
| `src/pages/index.astro` | NTP page layout |
| `src/components/*.astro` | Dashboard widgets |
| `src/lib/google.js` | Gmail + Calendar API + auth |
| `src/lib/storage.js` | `chrome.storage.local` wrapper |
| `src/styles/theme.css` | CSS variables (edit palette here) |
| `public/manifest.json` | Extension manifest — **Chrome loads this** |
| `public/background.js` | MV3 service worker |
| `dist/` | Build output — **gitignored, Chrome loads from here** |
| `manifest.json` (root) | Theme-only manifest (loads bare theme without dashboard) |
