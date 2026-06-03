# Enten — Chrome Theme & Dashboard

A Chrome project in two parts — a **browser theme** that styles the frame and
toolbar, and a **dashboard extension** that replaces the New Tab page with a
personal hub (email, calendar, shortcuts).

> **Important — they are mutually exclusive.**
> Chrome treats any manifest containing a `"theme"` key as a *theme extension*
> and silently ignores everything else in it, including `chrome_url_overrides`.
> The two parts therefore live in separate manifests and are loaded independently.

---

## Palette

| Role | Name | Hex | RGB |
|------|------|-----|-----|
| Header / tab strip | Prussian Blue | `#133552` | `19, 53, 82` |
| Toolbar / active tab | Eggshell | `#F1E9DA` | `241, 233, 218` |
| Accent / links / active tab label | Giants Orange | `#ED6733` | `237, 103, 51` |
| Dark surface / NTP fill | Jaguar | `#292A2D` | `41, 42, 45` |

---

## Part 1 — Browser Theme

Styles the **tab strip, toolbar, address bar**, and inactive-tab colours.
Does **not** replace the New Tab page — Chrome's default NTP is used.

### What it controls

| Chrome area | Value |
|-------------|-------|
| Tab strip background | Prussian Blue |
| Toolbar / active-tab background | Eggshell |
| Active tab label | Giants Orange |
| Inactive tab labels | Muted steel-blue |
| Toolbar icons | Giants Orange (darker shade) |
| Omnibox background | Near-white warm |
| NTP background fill (behind wallpaper) | Jaguar |
| NTP wallpaper | `naruto-swift.png` (2560 × 1440, centered) |

### Files

```
manifest.json          ← Chrome reads this for the theme
images/
├── naruto-swift.jpg   ← Original 4K source (reference)
└── naruto-swift.png   ← Active wallpaper (2560 × 1440)
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

Replaces the **New Tab page** with a personal dashboard: upcoming calendar
events, recent Gmail messages, and a customisable app-shortcut grid, all
styled with the Enten palette.

Because Chrome ignores `chrome_url_overrides` in any manifest that also
contains `"theme"`, the dashboard lives in its own separate manifest
(`public/manifest.json`) and is built with **Astro** into `dist/`.

### What it provides

| Widget | Source |
|--------|--------|
| App shortcuts | Stored in `chrome.storage.local`; editable at runtime |
| Calendar events | Google Calendar API via `chrome.identity` |
| Inbox preview | Gmail API via `chrome.identity` |
| Auth | `chrome.identity.getAuthToken()` — uses Chrome's signed-in account |

### Files

```
src/
├── pages/index.astro            ← NTP layout (3-column grid)
├── components/
│   ├── Shortcuts.astro          ← App icon grid
│   ├── CalendarWidget.astro     ← Upcoming events
│   ├── EmailWidget.astro        ← Inbox preview
│   └── AuthPanel.astro          ← Google sign-in / sign-out
├── lib/
│   ├── google.js                ← chrome.identity + Calendar + Gmail helpers
│   └── storage.js               ← chrome.storage.local wrapper
└── styles/theme.css             ← Enten CSS variables

public/                          ← Copied verbatim to dist/ by Astro
├── manifest.json                ← Dashboard extension manifest
├── background.js                ← MV3 service worker
└── images/naruto-swift.png      ← NTP wallpaper

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
| `_astro` directory error | Old build before the fix | Run `npm run build` again and reload |
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
