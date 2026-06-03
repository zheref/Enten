# Palette — Design Decisions & Iteration Guide

## Brand colours

| Name | Hex | RGB | Role |
|------|-----|-----|------|
| Eggshell | `#F1E9DA` | `241, 233, 218` | Warm light surface / Naruto foreground |
| Prussian Blue | `#133552` | `19, 53, 82` | Deep header / Naruto background |
| Giants Orange | `#ED6733` | `237, 103, 51` | Classic Part 1 accent |
| Medium Vermillion | `#db5d3f` | `219, 93, 63` | Naruto accent (dashboard) |
| Well Read | `#b13031` | `177, 48, 49` | Kylo Ren accent |
| Cold Gray | `#2D2F34` | `45, 47, 52` | Kylo Ren background |
| Ash | `#C5C4B4` | `197, 196, 180` | Kylo Ren foreground |
| Jaguar | `#292A2D` | `41, 42, 45` | Classic Part 1 NTP fill |

---

## Part 1 — Browser theme (`manifest.json`)

The standalone theme is a **single colour combination** (there is no separate
`manifest-dark.json`). For a dark-leaning look, generate one from the dashboard's
*Customize* panel instead (e.g. the **Kylo Ren** theme) — see below.

| Role | Key | Value | Source colour | Notes |
|------|-----|-------|---------------|-------|
| Tab-strip background | `frame` | `[19, 53, 82]` | Prussian Blue | Strong, dark header — sets the tone immediately |
| Tab-strip (inactive window) | `frame_inactive` | `[28, 66, 100]` | Prussian Blue +15% lighter | Softly recedes when unfocused |
| Tab-strip (Incognito) | `frame_incognito` | `[10, 30, 50]` | Prussian Blue –20% darker | Darker = visually distinct from normal mode |
| Toolbar / address-bar row | `toolbar` | `[241, 233, 218]` | Eggshell | Warm, readable contrast against the dark frame above |
| Active tab label | `tab_text` | `[237, 103, 51]` | Giants Orange | Accent on the Eggshell active-tab surface |
| Inactive tab labels | `tab_background_text` | `[178, 205, 222]` | Blue-gray derived | Light enough to read on Prussian Blue; muted to de-emphasise |
| Bookmarks bar text | `bookmark_text` | `[19, 53, 82]` | Prussian Blue | Dark text on Eggshell toolbar background |
| NTP solid background | `ntp_background` | `[41, 42, 45]` | Jaguar | Shown before the image loads or on areas the image doesn't cover |
| NTP body text | `ntp_text` | `[241, 233, 218]` | Eggshell | High contrast on the dark NTP fill |
| NTP links | `ntp_link` | `[237, 103, 51]` | Giants Orange | Warm accent for links |
| NTP link underline | `ntp_link_underline` | `[237, 103, 51]` | Giants Orange | Match link colour |
| NTP section headers | `ntp_header` | `[241, 233, 218]` | Eggshell | |
| Address-bar text | `omnibox_text` | `[19, 53, 82]` | Prussian Blue | |
| Address-bar background | `omnibox_background` | `[255, 252, 247]` | Near-warm-white | Slightly warmer than pure white to harmonise with Eggshell toolbar |
| Toolbar button bg | `button_background` | `[241, 233, 218]` | Eggshell | |
| Toolbar icons tint | `tints.buttons` | `[0.047, 0.84, 0.38]` | — | HSL — `0.38` lightness keeps icons dark on the Eggshell toolbar |

---

## Part 2 — Dashboard theme palettes (`src/lib/themes.js`)

The dashboard's theme picker maps three brand colours to consistent roles, and
can export a matching Chrome theme `.zip` (`buildThemeManifest`):

| Role | Dashboard | Generated Chrome theme |
|------|-----------|------------------------|
| `accent` | MD3 buttons / highlights (`--md-sys-color-primary`) | tab strip (`frame`) + NTP links |
| `background` | shelf / glass tint (`--shelf-tint`) | toolbar + selected tab + NTP fill |
| `foreground` | — | icons & text |

| Theme | Accent | Background | Foreground |
|-------|--------|------------|------------|
| **Naruto** | `#db5d3f` Medium Vermillion | `#133552` Prussian Blue | `#F1E9DA` Eggshell |
| **Kylo Ren** | `#b13031` Well Read | `#2D2F34` Cold Gray | `#C5C4B4` Ash |

> Note: the generated **Naruto** Chrome theme uses the *accent* (Medium Vermillion)
> on the tab strip — a different mapping from the classic Part 1 `manifest.json`,
> which keeps Prussian Blue on the frame and Giants Orange on labels/links.

---

## Contrast ratios (key pairs, Part 1)

| Pair | Ratio | WCAG level |
|------|-------|-----------|
| Prussian Blue on Eggshell | **~11:1** | AAA ✓✓ |
| Eggshell on Prussian Blue | **~11:1** | AAA ✓✓ |
| Eggshell on Jaguar NTP fill | **~12:1** | AAA ✓✓ |
| Giants Orange on Eggshell | **~2.7:1** | Large/decorative only |
| Inactive tab text `[178, 205, 222]` on Prussian Blue | **~5.4:1** | AA ✓ |

---

## Iteration hints

> Edit `manifest.json` (Part 1) or `src/lib/themes.js` (dashboard themes), then
> reload — `chrome://extensions` for the theme, `npm run build` + reload for the
> dashboard.

### Part 1 theme (`manifest.json`)

1. **Toolbar feels too warm / beige** — push `toolbar` toward neutral by raising
   the B channel from `218` toward `235`: `"toolbar": [241, 233, 235]`.

2. **Prussian Blue frame looks too corporate / navy-heavy** — warm it up by
   nudging R up slightly: `[32, 58, 85]`.

3. **Inactive tab labels `[178, 205, 222]` too blue / too faint** — try
   `[200, 218, 228]` (brighter) or `[155, 185, 205]` (more muted).

4. **Giants Orange labels are hard to read** — darken slightly: `[210, 88, 40]`
   adds contrast without losing warmth.

5. **Address bar background feels too clinical** — match it to the toolbar:
   `"omnibox_background": [241, 233, 218]`.

6. **Toolbar icons look too dark or washed out** — adjust the lightness in
   `tints.buttons`: lower (e.g. `0.20`) for darker icons, higher (e.g. `0.55`)
   for lighter ones.

### Dashboard themes (`src/lib/themes.js`)

7. **Want a new theme** — append `{ id, label, src, accent, background, foreground }`
   and drop the wallpaper in `public/images/`. The picker and zip builder pick it
   up automatically.

8. **Generated Chrome theme icons too dark/light** — `buildThemeManifest` derives
   `tints.buttons` from the foreground; for a dark `background` it lifts the
   foreground lightness to keep icons visible.

### NTP image

9. **Image text / shortcuts hard to read over the photo** — the dashboard renders
   widgets on glass surfaces with their own scrim, so contrast is handled. For the
   Part 1 theme's default Chrome NTP, `ntp_text`/`ntp_header` are Eggshell for soft
   contrast over the photo.
