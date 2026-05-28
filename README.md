# YOUR_THEME_NAME — Chrome Theme

> A custom Google Chrome theme with personalised colours, images, and branding.

---

## Table of Contents

1. [What is a Chrome theme?](#1-what-is-a-chrome-theme)
2. [Project structure](#2-project-structure)
3. [Quick-start checklist](#3-quick-start-checklist)
4. [Customising colours](#4-customising-colours)
5. [Preparing your images](#5-preparing-your-images)
6. [Loading the theme locally (developer mode)](#6-loading-the-theme-locally-developer-mode)
7. [Testing & iteration tips](#7-testing--iteration-tips)
8. [Packaging for distribution](#8-packaging-for-distribution)
9. [Publishing to the Chrome Web Store](#9-publishing-to-the-chrome-web-store)
10. [Version control workflow](#10-version-control-workflow)
11. [Troubleshooting](#11-troubleshooting)
12. [Resources](#12-resources)

---

## 1. What is a Chrome theme?

A Chrome theme is a special type of Chrome extension (no JavaScript required) that
customises the browser's visual appearance: the tab strip, toolbar, address bar,
New Tab Page background, and colour palette. Everything lives in a single folder
with a `manifest.json` and a handful of PNG/JPG images.

---

## 2. Project structure

```
.
├── manifest.json               ← Extension manifest (colours, image paths, properties)
├── theme.config.md             ← Full key-reference for every manifest option
├── .gitignore
├── README.md                   ← You are here
└── images/
    ├── theme_frame.png               ← Tab-strip background (active window)
    ├── theme_frame_inactive.png      ← Tab-strip background (window unfocused)
    ├── theme_frame_incognito.png     ← Tab-strip background (Incognito)
    ├── theme_toolbar.png             ← Address-bar row background
    ├── theme_tab_background.png      ← Inactive-tab tile
    ├── theme_ntp_background.png      ← New Tab Page wallpaper
    └── theme_ntp_attribution.png     ← Small logo badge on the NTP
```

Each image slot in `images/` currently contains a `*.placeholder` file that
describes the required dimensions and format. Delete the placeholder and drop in
your real PNG once it's ready.

---

## 3. Quick-start checklist

- [ ] Replace `YOUR_THEME_NAME` and `YOUR_THEME_DESCRIPTION` in `manifest.json`
- [ ] Update `"version"` in `manifest.json` whenever you publish a new release
- [ ] Replace every `[R, G, B]` colour value with your palette (see §4)
- [ ] Create and drop in each image file (see §5); remove the `.placeholder` files
- [ ] Remove any `images` keys from `manifest.json` you don't want to supply
- [ ] Load the theme in Chrome to preview it (see §6)
- [ ] Adjust until satisfied, bump the version, commit, and tag

---

## 4. Customising colours

Open `manifest.json` and edit the `"colors"` object. All values are
`[R, G, B]` triplets in the 0–255 range.

**Recommended workflow:**

1. Pick your palette in a tool like [Coolors](https://coolors.co),
   [Paletton](https://paletton.com), or Figma.
2. Note the hex codes, then convert to RGB
   (e.g. `#1a73e8` → `[26, 115, 232]`).
3. Paste the triplets into the matching keys in `manifest.json`.

**Key colour decisions:**

| If your theme is… | Set `ntp_logo_alternate` to… |
|--------------------|------------------------------|
| Light background   | `0` (coloured Google logo)  |
| Dark background    | `1` (white Google logo)     |

For `tints`, values are `[hue, saturation, lightness]` where `-1.0` means
"leave this channel alone". See `theme.config.md` for a full breakdown.

---

## 5. Preparing your images

### Recommended dimensions

| File | Size | Notes |
|------|------|-------|
| `theme_frame.png` | 2500 × 200 px | Tiles horizontally; put important art in the right half |
| `theme_frame_inactive.png` | 2500 × 200 px | Desaturate `theme_frame` by ~30 % |
| `theme_frame_incognito.png` | 2500 × 200 px | Dark variant of `theme_frame` |
| `theme_toolbar.png` | 2500 × 40 px | Keep it subtle — only 40 px tall |
| `theme_tab_background.png` | 89 × 41 px | Tiled; semi-transparent overlays work well |
| `theme_ntp_background.png` | 1920 × 1080 px | Use 3840 × 2160 for HiDPI |
| `theme_ntp_attribution.png` | ≤ 200 × 100 px | PNG with transparent background |

### Format rules

- All images should be **PNG-24**.
- `theme_ntp_background` may also be **JPG** if you need to save file size.
- Keep the total size of all images under **~2 MB** for a smooth install.

### Optional images

Every key in the `"images"` object is optional. Remove any key you don't want;
Chrome will fall back to its default behaviour for that slot.

---

## 6. Loading the theme locally (developer mode)

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select this project folder (the one containing `manifest.json`).
5. Chrome applies the theme immediately — no restart needed.

To reload after changes:

- Click the refresh icon (⟳) next to your theme on `chrome://extensions`, **or**
- Remove and re-add the unpacked extension.

---

## 7. Testing & iteration tips

- Open a **New Tab** to check the NTP background and colours.
- Open an **Incognito window** (`⌘ Shift N` / `Ctrl Shift N`) to verify the
  incognito frame.
- Resize the window to a narrow width to confirm the frame image tiles or crops
  gracefully.
- Toggle window focus (click another app, then back) to check the inactive frame.
- Use Chrome DevTools (`F12`) on the New Tab Page — inspect the `body` and
  `#most-visited` elements to understand which CSS Chrome is applying.

---

## 8. Packaging for distribution

Chrome can pack the extension for you:

1. Go to `chrome://extensions` → **Pack extension**.
2. Set **Extension root directory** to this folder.
3. Leave **Private key file** blank for the first pack (Chrome generates a `.pem`).
4. Click **Pack Extension**.

Chrome outputs:
- `<folder-name>.crx` — the installable package (keep this for sideloading)
- `<folder-name>.pem` — your **private key** (store it safely; you need it for
  every subsequent pack to maintain the same extension ID)

> **Warning** — Never commit the `.pem` file to version control. It is listed in
> `.gitignore` by default.

For Chrome Web Store submission, you upload a **ZIP** of the unpacked folder,
not the `.crx`.

```bash
# Create a clean ZIP from the project root (exclude hidden files and placeholders)
zip -r my-theme.zip . \
  --exclude "*.placeholder" \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "*.pem" \
  --exclude "*.crx"
```

---

## 9. Publishing to the Chrome Web Store

### Prerequisites

- A **Google account** enrolled as a Chrome Web Store developer
  (one-time $5 USD registration fee).
- At least one screenshot of the theme at **1280 × 800 px** or **640 × 400 px**.
- A **promotional tile** image: **440 × 280 px** PNG (required).
- Optional: small tile **96 × 96 px** and marquee banner **1400 × 560 px**.

### Steps

1. Zip your theme folder as described in §8.
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. Click **New item** → upload the ZIP.
4. Fill in the store listing:
   - **Name** — matches `manifest.json → name`
   - **Short description** — up to 132 characters
   - **Detailed description** — markdown supported
   - **Category** → select *Themes*
   - Upload screenshots and promotional images
5. Set **Visibility** to *Public* or *Unlisted*.
6. Submit for review (usually takes 1–3 business days).

### Updating a published theme

1. Increment `"version"` in `manifest.json` (e.g. `"1.0.0"` → `"1.1.0"`).
2. Re-zip the folder.
3. In the Developer Dashboard, open your item → **Package** → **Upload new package**.
4. Submit for review.

---

## 10. Version control workflow

This project is a git repository. Suggested workflow:

```bash
# Initial setup (already done)
git init
git add .
git commit -m "chore: initial theme scaffold"

# After each meaningful change
git add manifest.json images/
git commit -m "feat: add NTP background and dark palette"

# Tag a release before uploading to the Web Store
git tag -a v1.0.0 -m "Release v1.0.0"
```

**Branch strategy (optional):**

```
main        ← always the published, working state
dev         ← active iteration / work-in-progress
release/x.y ← frozen snapshot for each Web Store submission
```

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Theme does not apply | `manifest.json` has a syntax error | Validate JSON at [jsonlint.com](https://jsonlint.com) |
| Image not showing | Path in `manifest.json` doesn't match the file name (case-sensitive) | Double-check paths and file names |
| Colours look wrong | Wrong RGB order or out-of-range value | Values must be integers 0–255 in `[R, G, B]` order |
| NTP logo looks bad | Wrong `ntp_logo_alternate` value | Use `1` for dark backgrounds, `0` for light |
| Inactive frame looks identical to active | Missing `frame_inactive` colour or `tints.frame_inactive` | Add a lighter/darker `frame_inactive` colour |
| Web Store rejects ZIP | ZIP contains the root folder itself | Zip the *contents* of the folder, not the folder |

---

## 12. Resources

- [Chrome theme documentation (Chromium)](https://developer.chrome.com/docs/extensions/mv3/themes/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store publish guide](https://developer.chrome.com/docs/webstore/publish/)
- [JSON validator](https://jsonlint.com)
- [RGB ↔ Hex converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)
- [Coolors — palette generator](https://coolors.co)
