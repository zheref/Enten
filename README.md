# YOUR_THEME_NAME — Chrome Theme

> A custom Google Chrome theme built on three brand colours:
> **Eggshell** `#F1E9DA` · **Giants Orange** `#ED6733` · **Prussian Blue** `#133552`
> — with separate light and dark mode manifests.

---

## Table of Contents

1. [What is a Chrome theme?](#1-what-is-a-chrome-theme)
2. [Project structure](#2-project-structure)
3. [Quick-start checklist](#3-quick-start-checklist)
4. [Light and dark modes](#4-light-and-dark-modes)
5. [Customising colours](#5-customising-colours)
6. [The NTP background image](#6-the-ntp-background-image)
7. [Loading the theme locally (developer mode)](#7-loading-the-theme-locally-developer-mode)
8. [Testing & iteration tips](#8-testing--iteration-tips)
9. [Packaging for distribution](#9-packaging-for-distribution)
10. [Publishing to the Chrome Web Store](#10-publishing-to-the-chrome-web-store)
11. [Version control workflow](#11-version-control-workflow)
12. [Troubleshooting](#12-troubleshooting)
13. [Resources](#13-resources)

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
├── manifest.json           ← Active theme (Chrome reads this — light mode by default)
├── manifest-dark.json      ← Dark mode variant (copy → manifest.json to activate)
├── switch-theme.sh         ← Helper script to toggle between light/dark
├── palette.md              ← Full colour map, contrast ratios & iteration hints
├── theme.config.md         ← Key-by-key manifest reference
├── .gitignore
├── README.md               ← You are here
└── images/
    └── naruto-swift.jpg    ← New Tab Page background (4K, centered, no-repeat)
```

---

## 3. Quick-start checklist

- [ ] Replace `YOUR_THEME_NAME` / `YOUR_THEME_DESCRIPTION` in **both** `manifest.json`
      and `manifest-dark.json`
- [ ] Bump `"version"` in both manifests before each new release
- [ ] Load the theme in Chrome to preview it (see §7)
- [ ] Open a new tab to check the NTP image and typography
- [ ] Open an Incognito window to check the incognito frame
- [ ] Read `palette.md` for colour-by-colour iteration hints
- [ ] When satisfied, commit and tag the release

---

## 4. Light and dark modes

> **Chrome themes do not auto-switch based on system dark/light mode.**
> The Chrome theme API has no `prefers-color-scheme` equivalent.
> You switch manually using the helper script or by reloading the extension.

### Using the helper script

```bash
# Activate dark mode
./switch-theme.sh dark

# Restore light mode
./switch-theme.sh light
```

Then open `chrome://extensions` and click the **reload** icon (↺) next to
your theme.

### How it works under the hood

| File | Role |
|------|------|
| `manifest.json` | What Chrome reads. Committed to git as the **light** source of truth. |
| `manifest-dark.json` | Dark mode source. Never overwritten by the script. |
| `switch-theme.sh dark` | Copies `manifest-dark.json` → `manifest.json`. |
| `switch-theme.sh light` | Runs `git checkout -- manifest.json` to restore light mode. |

> **Important** — Do not commit `manifest.json` while it is in dark mode.
> The git-tracked copy is always the light variant. If you need to reset
> manually: `git checkout -- manifest.json`.

### Publishing both variants to the Chrome Web Store

The Web Store treats each uploaded ZIP as a separate listing. To publish both:

1. Keep your current ZIP for the light theme.
2. Copy `manifest-dark.json` → `manifest.json`, update the `"name"` field
   (e.g. append `" — Dark"`), bump the version, re-zip, and upload as a
   separate listing.

---

## 5. Customising colours

All colour values are `[R, G, B]` triplets (0–255). The full colour map —
including which brand colour each key uses, contrast ratios, and iteration
hints — is in **`palette.md`**.

Quick reference tool: [RGB ↔ Hex converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)

For `tints`, values are `[hue, saturation, lightness]` (0.0–1.0, or `-1.0`
to leave a channel unchanged). See `theme.config.md` for the full reference.

---

## 6. The NTP background image

The file `images/naruto-swift.jpg` is used as the New Tab Page wallpaper.

| Setting | Value | Effect |
|---------|-------|--------|
| `ntp_background_alignment` | `"center"` | Image is centered horizontally and vertically |
| `ntp_background_repeat` | `"no-repeat"` | No tiling |

**Why it looks right at 4K:** Chrome displays the image at its native pixel
size with no upscaling. On a 1080p screen the 4K image (3840 × 2160 px) is
roughly 2× larger than the viewport, so Chrome crops and shows the center
portion — sharp and fill-like. On a true 4K display it renders at 1:1.

To replace the image: drop a new file into `images/`, update the path in
both manifests, and reload.

---

## 7. Loading the theme locally (developer mode)

1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this project folder (the one containing `manifest.json`)
5. Chrome applies the theme immediately — no restart needed

To reload after changes: click the **↺** icon next to your theme on
`chrome://extensions`.

---

## 8. Testing & iteration tips

- Open a **New Tab** to preview the NTP image, typography, and link colours.
- Open an **Incognito window** (`⌘ Shift N` / `Ctrl Shift N`) to check the
  incognito frame colour (`frame_incognito`).
- Resize the window narrow to confirm the frame colour fills the tab strip
  gracefully (no image = solid colour, which scales perfectly).
- Click away to another app and back to see the active vs inactive frame
  (`frame` vs `frame_inactive`).
- Consult `palette.md` → *Iteration hints* section for targeted tweaks.

---

## 9. Packaging for distribution

Chrome Web Store submissions require a **ZIP** of the unpacked folder (not a
`.crx`). Build it from the project root:

```bash
# Light mode ZIP
zip -r my-theme-light.zip . \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "*.pem" \
  --exclude "*.crx" \
  --exclude "manifest-dark.json" \
  --exclude "switch-theme.sh"

# Dark mode ZIP  (activate dark first, then zip)
./switch-theme.sh dark
zip -r my-theme-dark.zip . \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --exclude "*.pem" \
  --exclude "*.crx" \
  --exclude "manifest-dark.json" \
  --exclude "switch-theme.sh"
./switch-theme.sh light   # restore
```

> **Private key (.pem)** — Chrome generates a `.pem` when you use
> *Pack Extension*. Keep it safe and **never commit it** (listed in
> `.gitignore`). You need it to push updates with the same extension ID.

---

## 10. Publishing to the Chrome Web Store

### Prerequisites

- A Google account enrolled as a Chrome Web Store developer
  (one-time **$5 USD** registration fee).
- At least one **screenshot** at `1280 × 800 px` or `640 × 400 px`.
- A **promotional tile**: `440 × 280 px` PNG (required).
- Optional: small icon `96 × 96 px`; marquee banner `1400 × 560 px`.

### Steps

1. Create the ZIP as described in §9.
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
3. **New item** → upload the ZIP.
4. Fill in the store listing:
   - **Name** — matches `manifest.json → "name"`
   - **Short description** — up to 132 characters
   - **Category** → *Themes*
   - Upload screenshots and promotional images
5. Set **Visibility** → *Public* or *Unlisted*.
6. Submit for review (typically 1–3 business days).

### Updating a published theme

1. Increment `"version"` in `manifest.json` (e.g. `"1.0.0"` → `"1.1.0"`).
2. Re-ZIP and upload in the Developer Dashboard → **Package** → **Upload new package**.
3. Submit for review.

---

## 11. Version control workflow

```bash
# After tweaking colours or swapping images
git add manifest.json manifest-dark.json
git commit -m "feat: adjust toolbar contrast for readability"

# Tag before each Web Store upload
git tag -a v1.0.0 -m "Release v1.0.0 — initial publish"

# Restore light mode if you accidentally committed dark
git checkout -- manifest.json
```

**Recommended branch strategy:**

```
main        ← always the published, working state  (manifest.json = light)
dev         ← active iteration / experimentation
release/x.y ← frozen snapshot for each Web Store submission
```

---

## 12. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Theme won't load | `manifest.json` has a syntax error | Validate at [jsonlint.com](https://jsonlint.com) |
| NTP image not showing | Path mismatch (case-sensitive) | Check `"theme_ntp_background"` path exactly matches the file name |
| Colours look off | Wrong RGB order or out-of-range value | Values must be integers 0–255 in `[R, G, B]` order |
| NTP logo looks bad | Wrong `ntp_logo_alternate` | `0` = coloured logo (light BG) · `1` = white logo (dark BG) |
| Web Store rejects ZIP | ZIP wraps the folder itself | Zip the *contents* of the folder, not the folder |
| `switch-theme.sh light` fails | Not in a git repo | Run `git init` first, or copy your original manifest manually |

---

## 13. Resources

- [Chrome theme documentation (Chromium)](https://developer.chrome.com/docs/extensions/mv3/themes/)
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Web Store publish guide](https://developer.chrome.com/docs/webstore/publish/)
- [JSON validator](https://jsonlint.com)
- [RGB ↔ Hex converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)
- [Coolors — palette generator](https://coolors.co)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
