# Enten — Chrome Theme & Dashboard

A Chrome project in two parts — a **browser theme** that styles the frame and
toolbar, and a **dashboard extension** that replaces the New Tab page with a
ChromeOS-style desktop (email, calendar, app shortcuts) built with Astro and
official Material Design 3 components.

> **Important — they are mutually exclusive.**
> Chrome treats any manifest containing a `"theme"` key as a *theme extension*
> and silently ignores everything else in it, including `chrome_url_overrides`.
> The two parts therefore live in separate manifests and are loaded independently
> (you can load both at once — see [Using both](#using-both-at-the-same-time)).

---

## Brand palette

| Name | Hex | RGB | Used by |
|------|-----|-----|---------|
| Eggshell | `#F1E9DA` | `241, 233, 218` | Naruto foreground |
| Prussian Blue | `#133552` | `19, 53, 82` | Naruto background |
| Giants Orange | `#ED6733` | `237, 103, 51` | Classic theme accent (Part 1) |
| Medium Vermillion | `#db5d3f` | `219, 93, 63` | Naruto accent (Part 2) |
| Well Read | `#b13031` | `177, 48, 49` | Kylo Ren accent |
| Cold Gray | `#2D2F34` | `45, 47, 52` | Kylo Ren background |
| Ash | `#C5C4B4` | `197, 196, 180` | Kylo Ren foreground |
| Jaguar | `#292A2D` | `41, 42, 45` | Classic theme NTP fill |

---

## Part 1 — Browser Theme

The standalone theme at the **repo root** (`manifest.json`). Styles the **tab
strip, toolbar, address bar**, and inactive-tab colours. Does **not** replace
the New Tab page — Chrome's default NTP is used.

### What it controls

| Chrome area | Source colour | Value |
|-------------|---------------|-------|
| Tab strip background | Prussian Blue | `19, 53, 82` |
| Toolbar / active-tab background | Eggshell | `241, 233, 218` |
| Active tab label | Giants Orange | `237, 103, 51` |
| Inactive tab labels | Muted steel-blue | `178, 205, 222` |
| Toolbar icons | dark tint | `tints.buttons` lightness `0.38` |
| Omnibox background | Near-white warm | `255, 252, 247` |
| NTP background fill (behind wallpaper) | Jaguar | `41, 42, 45` |
| NTP links | Giants Orange | `237, 103, 51` |
| NTP wallpaper | `images/naruto-swift.png` (2560 × 1440, centered) | — |

### Files

```
manifest.json          ← Chrome reads this for the theme
images/
├── naruto-swift.jpg   ← Original 4K source (reference)
├── naruto-swift.png   ← Active wallpaper (2560 × 1440)
└── kylo-ren-4k.jpg    ← Alternate wallpaper (used by the dashboard theme picker)
```

### Install (unpacked)

1. Clone or [download](../../archive/refs/heads/main.zip) this repository.
2. `chrome://extensions` → enable **Developer mode**.
3. **Load unpacked** → select the **repo root** (where `manifest.json` lives).
4. The theme applies immediately.

To update after pulling changes: click **↺** on `chrome://extensions`.

### Customise

**Swap the wallpaper**
```
1. Drop a PNG into images/ (2560 × 1440 px or larger recommended).
2. Edit manifest.json → "theme_ntp_background": "images/your-image.png"
3. Reload at chrome://extensions.
```

**Change colours** — edit the `[R, G, B]` triplets in `manifest.json → theme → colors`.
Full key reference: [`theme.config.md`](theme.config.md) · Palette notes: [`palette.md`](palette.md).

> Prefer not to hand-edit JSON? The **dashboard** can generate a ready-to-install
> Chrome theme `.zip` for you from a colour palette — see
> [Theme system](#theme-system) below.

### Publish (Chrome Web Store — Category: Themes)

```bash
zip -r enten-theme.zip . \
  --exclude ".git/*" --exclude ".DS_Store" \
  --exclude "*.pem"  --exclude "*.crx"   \
  --exclude "src/*"  --exclude "public/*" \
  --exclude "dist/*" --exclude "node_modules/*"
```

Upload to the [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
→ Category **Themes** → screenshots at `1280 × 800 px` + promotional tile `440 × 280 px`.

---

## Part 2 — Dashboard Extension

Replaces the **New Tab page** with a ChromeOS-style desktop: the brand wallpaper,
draggable widget cards (calendar + inbox), and a floating glass **shelf** (bottom
app bar) of app shortcuts — all styled with official Material Design 3 components.

Because Chrome ignores `chrome_url_overrides` in any manifest that also contains
`"theme"`, the dashboard lives in its own manifest (`public/manifest.json`) and is
built with **Astro** into `dist/`.

### What it provides

**Widgets**

| Widget | Source |
|--------|--------|
| Calendar events | Google Calendar API via `chrome.identity` |
| Inbox preview | Gmail API via `chrome.identity` |
| App shortcuts | Chrome Bookmarks Bar + fixed defaults, in the shelf |
| Auth / account | `chrome.identity.getAuthToken()` — uses Chrome's signed-in account |

**Desktop & UI**

- **Draggable widget cards** — drag anywhere on the desktop; positions persist.
- **Edge anchoring** — right-click the wallpaper → *Anchor Widgets* → Top / Right /
  Bottom / Left. Anchored widgets rearrange automatically on collapse/expand.
- **Collapsible cards** — each widget card can collapse to just its title bar.
- **Floating glass shelf** — a bottom app bar with rounded corners, MD3 elevation,
  and a scheme-aware reflective glass rim.
- **App shortcuts** — circular ChromeOS-style icons drawn from your **Bookmarks
  Bar** plus a few fixed defaults. Bookmarks can be **dragged to reorder** (with a
  live drop indicator).
- **Right-click menu on icons** — *Open in This Tab* / *Open in New Tab* /
  *Copy Link* / *Customize Icon*.
- **Status area** (bottom-right) — connect/disconnect your Google account, switch
  **light / auto / dark** mode, and a live clock — each via a centered MD3 menu.
- **Snackbars & tooltips** — MD3 snackbars (e.g. "Link copied") and icon tooltips.

### Theme system

The dashboard ships a **theme picker** (right-click the wallpaper → *Customize*).
Each theme bundles a wallpaper and three brand colours mapped to consistent roles:

| Role | Drives |
|------|--------|
| **accent** | MD3 buttons & highlights on the dashboard; Chrome-theme tab strip; NTP links |
| **background** | Chrome-theme toolbar + selected tab + NTP fill; dashboard shelf/glass tint |
| **foreground** | Chrome-theme icons & text |

| Theme | Accent | Background | Foreground |
|-------|--------|------------|------------|
| **Naruto** | Medium Vermillion `#db5d3f` | Prussian Blue `#133552` | Eggshell `#F1E9DA` |
| **Kylo Ren** | Well Read `#b13031` | Cold Gray `#2D2F34` | Ash `#C5C4B4` |

Picking a theme recolours the live dashboard instantly. The **Download Chrome
theme (.zip)** button generates an installable theme matching the selected palette,
named e.g. **"Enten - Naruto Theme"** — load it as an unpacked theme (Part 1 style)
or zip it for the Web Store.

### Per-app icon customization

Right-click any shelf icon → **Customize Icon** to open a floating MD3 panel:

- **Icon source picker** — choose among several favicon resolutions/providers
  (Chrome's cached icon, Google faviconV2 ×128/×64, Google domain, DuckDuckGo,
  the site's own `/favicon.ico`).
- **Custom image URL** — the trailing **+** tile reveals a field to paste any
  image URL (ICO / PNG / JPG).
- **Move (nudge) arrows** — reposition the icon within its circle; works for any
  source.
- **Containment scale** — slider from 0–100 % (100 fills & clips the circle; lower
  shrinks the glyph with the circle visible around it).
- **Circle background** — colour swatch + screen eyedropper.

All overrides persist per-URL in `chrome.storage.local` and apply on every render.

### Files

```
src/
├── pages/index.astro            ← Desktop shell: wallpaper, draggable widgets, shelf
├── components/
│   ├── Shortcuts.astro          ← Shelf app icons + drag-reorder + right-click menu
│   ├── CalendarWidget.astro     ← Google Calendar card
│   ├── EmailWidget.astro        ← Gmail inbox card
│   ├── StatusArea.astro         ← Account · theme mode · clock (icon-button menus)
│   ├── CustomizePanel.astro     ← Theme picker + downloadable Chrome theme (.zip)
│   └── ContainmentAdjuster.astro← "Customize Icon" panel
├── lib/
│   ├── google.js                ← chrome.identity + Calendar + Gmail helpers
│   ├── storage.js               ← chrome.storage.local wrapper
│   ├── themes.js                ← Theme registry + dashboard apply + Chrome-theme builder
│   ├── favicons.js              ← Favicon resolution + source candidates
│   ├── menu.js                  ← Center-on-anchor helper for md-menu
│   ├── snackbar.js              ← Reusable MD3 snackbar
│   ├── cursor-fix.js            ← Default-cursor policy inside md-* shadow roots
│   └── md-components.ts         ← Registers the Material Web (md-*) custom elements
└── styles/theme.css             ← MD3 token sheet (light/dark) + global component layer

public/                          ← Copied verbatim to dist/ by Astro
├── manifest.json                ← Dashboard extension manifest
├── background.js                ← MV3 service worker
└── images/
    ├── naruto-swift.jpg         ← Naruto wallpaper
    └── kylo-ren-4k.jpg          ← Kylo Ren wallpaper

dist/                            ← Build output — gitignored, Chrome loads from here
```

### Prerequisites

```bash
npm install
```

### Google OAuth setup (required for Calendar + Gmail)

See **[`DASHBOARD.md`](DASHBOARD.md)** for the full walkthrough. In short:

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2. Enable **Google Calendar API** and **Gmail API**.
3. Create an OAuth 2.0 Client ID (type: *Chrome Extension*).
4. Paste the client ID into `public/manifest.json → oauth2 → client_id`.

### Build & load

```bash
npm run build          # emits dist/
```

1. `chrome://extensions` → enable **Developer mode**.
2. **Load unpacked** → select the **`dist/`** folder (not the repo root).
3. Open a new tab — the dashboard loads.

To iterate: edit source → `npm run build` → click **↺** on `chrome://extensions`.

> The dashboard requests the `favicon`, `bookmarks`, `storage`, and `identity`
> permissions. If Chrome flags a new permission after an update, re-enable the
> extension at `chrome://extensions`.

### Enjoy it full-screen (hide Chrome's New Tab footer)

Chrome draws its own footer bar (the extension name + a **Customize Chrome**
button) at the bottom of every New Tab page, which overlaps the shelf. To hide
it and get the edge-to-edge dashboard:

1. Open a New Tab.
2. Click **Customize Chrome** (bottom-right) to open the side panel.
3. Go to the **Footer** section.
4. Turn **off** *"Show footer on New Tab page"*.

The footer disappears and the dashboard fills the whole window. This is a Chrome
setting (browser UI), so it can't be toggled from the extension itself.

### Development without Chrome

```bash
npm run dev            # Astro dev server at http://localhost:4321
```

All `chrome.*` API calls fall back to mock data automatically, so the full UI
is previewable in any browser without the extension context.

### Publish (Chrome Web Store — Category: Extensions)

```bash
npm run build
cd dist && zip -r ../enten-dashboard.zip . && cd ..
```

Upload `enten-dashboard.zip` → Category **Extensions** (not Themes).

> **Gmail scope note** — `gmail.readonly` requires Google's OAuth verification
> for public listings. Calendar and profile scopes do not. See
> [`DASHBOARD.md §Publishing`](DASHBOARD.md#publishing-to-the-chrome-web-store).

---

## Using both at the same time

You can have both loaded simultaneously — they are independent extensions:

| Extension | Load from | Controls |
|-----------|-----------|----------|
| Theme | repo root (`manifest.json`) | Tab strip, toolbar, address bar colours |
| Dashboard | `dist/` (`public/manifest.json`) | New Tab page content |

Chrome applies the theme's frame/toolbar colours **and** shows the dashboard's
custom NTP — each extension handles a different layer of the browser UI.

> Tip: for a fully matched look, pick a theme in the dashboard's *Customize* panel,
> download its Chrome theme `.zip`, and load that as the Part 1 theme.

---

## Project structure (full)

```
.
├── manifest.json          ← Part 1: theme-only manifest (load from repo root)
├── images/                ← Theme wallpaper assets
├── src/                   ← Part 2: Astro source (dashboard)
├── public/                ← Part 2: static assets copied into dist/
│   └── manifest.json      ← Part 2: dashboard extension manifest
├── dist/                  ← Part 2: build output — load this in Chrome (gitignored)
├── astro.config.mjs
├── package.json
├── palette.md             ← Colour map & iteration hints
├── theme.config.md        ← Theme manifest key reference
├── DASHBOARD.md           ← Dashboard setup, OAuth, publishing guide
└── LICENSE
```

---

## Branch workflow

```bash
git checkout -b experiment/my-idea
# iterate and test
git checkout main
git merge experiment/my-idea   # keep it
git branch -D experiment/my-idea   # or discard
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Theme loads but NTP is default Chrome | Loaded from `dist/` (dashboard manifest has no theme) | Load the repo root for the theme; `dist/` for the dashboard |
| Dashboard NTP not showing | Extension loaded from repo root (theme manifest ignores `chrome_url_overrides`) | Load from `dist/`, not the repo root |
| Custom NTP not showing even from `dist/` | Another extension owns the NTP | Disable other "new tab" extensions |
| A footer bar / "Customize Chrome" button overlaps the shelf | Chrome's built-in New Tab footer | Customize Chrome → **Footer** → turn off *"Show footer on New Tab page"* |
| App shortcuts / bookmarks missing | `bookmarks` or `favicon` permission not granted | Re-enable the extension at `chrome://extensions` |
| A favicon looks wrong / generic | Default source didn't resolve | Right-click the icon → **Customize Icon** → pick another source or paste a custom URL |
| `_astro` directory error | Old build before the `assets/` rename | Run `npm run build` again and reload |
| Theme won't load | `manifest.json` syntax error | Validate at [jsonlint.com](https://jsonlint.com) |
| Calendar / Gmail not loading | OAuth client ID not set | Follow `DASHBOARD.md §Step 2` |
| "Unverified app" warning on sign-in | Expected for personal/unpacked use | Click *Continue* — safe for your own extension |
| Web Store rejects ZIP | ZIP wraps the folder itself | Zip the *contents*, not the folder |

---

## Contributing

Pull requests welcome. Open an issue first for significant changes.

1. Fork and branch from `main`.
2. Test theme changes by loading the repo root as unpacked.
3. Test dashboard changes: `npm run build` → load `dist/` as unpacked.
4. Keep both `manifest.json` and `public/manifest.json` valid JSON.
5. Open a PR with a short description and a screenshot if visual.

---

## License

[MIT](LICENSE) — feel free to fork and make it your own.
