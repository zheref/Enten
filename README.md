# SergioSwift — Chrome Theme

> A custom Google Chrome theme built on three brand colours:
> **Eggshell** `#F1E9DA` · **Giants Orange** `#ED6733` · **Prussian Blue** `#133552`

---

## Table of Contents

1. [What is a Chrome theme?](#1-what-is-a-chrome-theme)
2. [Project structure](#2-project-structure)
3. [Quick-start checklist](#3-quick-start-checklist)
4. [Customising colours](#4-customising-colours)
5. [The NTP background image](#5-the-ntp-background-image)
6. [Loading the theme locally (developer mode)](#6-loading-the-theme-locally-developer-mode)
7. [Testing & iteration tips](#7-testing--iteration-tips)
8. [Packaging for distribution](#8-packaging-for-distribution)
9. [Publishing to the Chrome Web Store](#9-publishing-to-the-chrome-web-store)
10. [Version control workflow](#10-version-control-workflow)
11. [Troubleshooting](#11-troubleshooting)
12. [Resources](#12-resources)

---

## 1. What is a Chrome theme?

A Chrome theme is a special type of Chrome extension (no JavaScript required)
that customises the browser's visual appearance: the tab strip, toolbar, address
bar, New Tab Page background, and colour palette. Everything lives in a single
folder with a `manifest.json` and (optionally) image files.

---

## 2. Project structure

```
.
├── manifest.json     ← The theme (only file Chrome reads)
├── palette.md        ← Full colour map, contrast ratios & iteration hints
├── theme.config.md   ← Key-by-key manifest reference
├── .gitignore
├── README.md         ← You are here
└── images/
    ├── naruto-swift.jpg   ← Original 4K source (keep as reference)
    └── naruto-swift.png   ← Active NTP wallpaper (2560 × 1440)
```

---

## 3. Quick-start checklist

- [ ] Replace `YOUR_THEME_DESCRIPTION` in `manifest.json`
- [ ] Bump `"version"` before each new release
- [ ] Load the theme in Chrome to preview it (see §6)
- [ ] Open a new tab to check the NTP image
- [ ] Open an Incognito window to check the incognito frame
- [ ] Read `palette.md` for colour-by-colour iteration hints
- [ ] When satisfied, commit and tag the release

---

## 4. Customising colours

All colour values are `[R, G, B]` triplets (0–255). The full colour map —
including which brand colour each key uses, contrast ratios, and iteration
hints — is in **`palette.md`**.

Quick reference tool: [RGB ↔ Hex converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)

For `tints`, values are `[hue, saturation, lightness]` (0.0–1.0, or `-1.0`
to leave a channel unchanged). See `theme.config.md` for the full reference.

---

## 5. The NTP background image

`images/naruto-swift.png` (2560 × 1440) is the active New Tab Page wallpaper.
The original 4K source is kept as `naruto-swift.jpg` for reference.

| Setting | Value | Effect |
|---------|-------|--------|
| `ntp_background_alignment` | `"center"` | Centred in both axes |
| `ntp_background_repeat` | `"no-repeat"` | No tiling |

Chrome displays the image at its native pixel size. On a 1080p screen the
2K image slightly overflows the viewport and is cropped to the centre —
sharp and fill-like. On a 1440p display it renders at 1:1.

To replace the image: drop a new PNG into `images/`, update
`"theme_ntp_background"` in `manifest.json`, and reload.

---

## 6. Loading the theme locally (developer mode)

1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this project folder (the one containing `manifest.json`)
5. Chrome applies the theme immediately — no restart needed

To reload after changes: click the **↺** icon next to your theme.

---

## 7. Testing & iteration tips

- Open a **New Tab** to preview the NTP image, typography, and link colours.
- Open an **Incognito window** (`⌘ Shift N` / `Ctrl Shift N`) to check the
  incognito frame colour (`frame_incognito`).
- Click away to another app and back to see active vs inactive frame.
- Consult `palette.md` → *Iteration hints* for targeted tweaks.

---

## 8. Packaging for distribution

```bash
zip -r sergioswift.zip . \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "*.pem" \
  --exclude "*.crx"
```

> **Private key (.pem)** — Chrome generates a `.pem` when you use
> *Pack Extension*. Keep it safe and **never commit it** (listed in
> `.gitignore`). You need it to push updates with the same extension ID.

---

## 9. Publishing to the Chrome Web Store

### Prerequisites

- A Google account enrolled as a Chrome Web Store developer
  (one-time **$5 USD** registration fee).
- At least one **screenshot** at `1280 × 800 px` or `640 × 400 px`.
- A **promotional tile**: `440 × 280 px` PNG (required).
- Optional: small icon `96 × 96 px`; marquee banner `1400 × 560 px`.

### Steps

1. Create the ZIP as described in §8.
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. **New item** → upload the ZIP.
4. Fill in the store listing — **Name**, short description, Category → *Themes*, screenshots.
5. Set **Visibility** → *Public* or *Unlisted*.
6. Submit for review (typically 1–3 business days).

### Updating a published theme

1. Increment `"version"` in `manifest.json`.
2. Re-ZIP and upload in the Developer Dashboard → **Package** → **Upload new package**.
3. Submit for review.

---

## 10. Version control workflow

```bash
# After tweaking colours or images
git add manifest.json
git commit -m "feat: adjust toolbar contrast"

# Tag before each Web Store upload
git tag -a v1.0.0 -m "Release v1.0.0"

# Experiment safely on a branch
git checkout -b experiment/my-idea
# ...iterate, test...
git checkout main          # back to stable
git branch -D experiment/my-idea   # discard if not needed
```

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Theme won't load | `manifest.json` syntax error | Validate at [jsonlint.com](https://jsonlint.com) |
| NTP image not showing | Path mismatch (case-sensitive) | Check `"theme_ntp_background"` matches the file name exactly |
| Colours look off | Wrong RGB order or out-of-range value | Values must be integers 0–255 in `[R, G, B]` order |
| NTP logo looks bad | Wrong `ntp_logo_alternate` | `0` = coloured logo · `1` = white logo |
| Web Store rejects ZIP | ZIP wraps the folder itself | Zip the *contents* of the folder, not the folder |

---

## 12. Resources

- [Chrome theme documentation (Chromium)](https://developer.chrome.com/docs/extensions/mv3/themes/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [JSON validator](https://jsonlint.com)
- [RGB ↔ Hex converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
