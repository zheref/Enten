# SergioSwift Dashboard — Architecture & Setup Guide

This document covers everything you need to go from this scaffold to a
fully working personal dashboard — and what to expect at each step.

---

## What's already scaffolded

```
src/
├── pages/index.astro           ← Full NTP layout (bg image + 3-column grid)
├── components/
│   ├── Shortcuts.astro         ← Persisted app-icon grid
│   ├── CalendarWidget.astro    ← Google Calendar (upcoming events)
│   ├── EmailWidget.astro       ← Gmail (recent inbox)
│   └── AuthPanel.astro         ← Google sign-in / sign-out
├── lib/
│   ├── google.js               ← chrome.identity + Calendar + Gmail API calls
│   └── storage.js              ← chrome.storage.local wrapper
└── styles/theme.css            ← SergioSwift CSS variables + base reset

public/                         ← Copied verbatim to dist/ by Astro
├── manifest.json               ← Full extension manifest (v2.0.0)
├── background.js               ← MV3 service worker
└── images/naruto-swift.png     ← NTP wallpaper
```

---

## Feasibility map

| Feature | Works? | Notes |
|---------|--------|-------|
| Astro static NTP | ✅ | Static HTML/CSS/JS — perfect for Chrome extension pages |
| Custom CSS design system | ✅ | Full CSS control; SergioSwift tokens in `theme.css` |
| App shortcuts (persisted) | ✅ | Stored in `chrome.storage.local` |
| Google Calendar | ✅ | `chrome.identity` + Calendar API; no popup for signed-in Chrome user |
| Gmail inbox | ✅ | Same; note Gmail scope needs Google verification for public distribution |
| Token storage | ✅ | `chrome.storage.local` — safest option (see §Token storage below) |
| Single Google account | ✅ | `chrome.identity.getAuthToken()` — zero friction |
| Multiple Google accounts | ⚠️ | Possible via `launchWebAuthFlow()`; significantly more setup |
| Background data refresh | ✅ | `chrome.alarms` API; stub in `background.js` |
| Web Store publishing | ✅ | See §Publishing |
| Filesystem JSON config | ❌ | Extensions are sandboxed; use `chrome.storage` instead |
| Auto light/dark theme switching | ❌ | Chrome theme API has no `prefers-color-scheme` equivalent |

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
2. Create a new project (e.g. "SergioSwift").
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
└── _astro/            ← bundled JS + CSS
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
cd dist && zip -r ../sergioswift-v2.zip . && cd ..
```

Upload `sergioswift-v2.zip` to the
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
