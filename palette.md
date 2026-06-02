# Palette — Design Decisions & Iteration Guide

## Brand colours

| Name | Hex | RGB |
|------|-----|-----|
| Eggshell | `#F1E9DA` | `[241, 233, 218]` |
| Giants Orange | `#ED6733` | `[237, 103, 51]` |
| Prussian Blue | `#133552` | `[19, 53, 82]` |

---

## How each colour is used

### Light mode (`manifest.json`)

| Role | Key | Value | Source colour | Notes |
|------|-----|-------|---------------|-------|
| Tab-strip background | `frame` | `[19, 53, 82]` | Prussian Blue | Strong, dark header — sets the tone immediately |
| Tab-strip (inactive window) | `frame_inactive` | `[28, 66, 100]` | Prussian Blue +15% lighter | Softly recedes when unfocused |
| Tab-strip (Incognito) | `frame_incognito` | `[10, 30, 50]` | Prussian Blue –20% darker | Darker = visually distinct from normal mode |
| Toolbar / address-bar row | `toolbar` | `[241, 233, 218]` | Eggshell | Warm, readable contrast against the dark frame above |
| Active tab label | `tab_text` | `[19, 53, 82]` | Prussian Blue | Dark text on the white/Eggshell active-tab surface |
| Inactive tab labels | `tab_background_text` | `[178, 205, 222]` | Blue-gray derived | Light enough to read on Prussian Blue; muted to de-emphasise |
| Bookmarks bar text | `bookmark_text` | `[19, 53, 82]` | Prussian Blue | Dark text on Eggshell toolbar background |
| NTP solid background | `ntp_background` | `[241, 233, 218]` | Eggshell | Shown before the image loads or on areas the image doesn't cover |
| NTP body text | `ntp_text` | `[19, 53, 82]` | Prussian Blue | ~11:1 contrast on Eggshell — AAA ✓✓ |
| NTP links | `ntp_link` | `[237, 103, 51]` | Giants Orange | ~2.7:1 on Eggshell — fine for large/decorative text; see iteration note below |
| NTP link underline | `ntp_link_underline` | `[237, 103, 51]` | Giants Orange | Match link colour |
| NTP section headers | `ntp_header` | `[19, 53, 82]` | Prussian Blue | |
| Address-bar text | `omnibox_text` | `[19, 53, 82]` | Prussian Blue | |
| Address-bar background | `omnibox_background` | `[255, 252, 247]` | Near-warm-white | Slightly warmer than pure white to harmonise with Eggshell toolbar |
| Toolbar button bg | `button_background` | `[241, 233, 218]` | Eggshell | |
| Toolbar icons tint | `tints.buttons` | `[-1, -1, 0.20]` | — | 0.20 lightness = dark icons, clearly visible on Eggshell toolbar |

### Dark mode (`manifest-dark.json`)

| Role | Key | Value | Source colour | Notes |
|------|-----|-------|---------------|-------|
| Tab-strip background | `frame` | `[8, 22, 40]` | Prussian Blue ×0.4 | Near-black navy — deeper than Prussian Blue for true dark feel |
| Tab-strip (inactive) | `frame_inactive` | `[12, 28, 48]` | Slightly lighter | Barely lighter than frame — almost merges with it when unfocused |
| Tab-strip (Incognito) | `frame_incognito` | `[5, 14, 28]` | Darkest navy | |
| Toolbar / address-bar row | `toolbar` | `[18, 44, 68]` | Mid-dark navy | Lighter than the frame so the toolbar has a subtle lift |
| Active tab label | `tab_text` | `[241, 233, 218]` | Eggshell | Warm cream on dark active-tab surface |
| Inactive tab labels | `tab_background_text` | `[120, 155, 185]` | Muted steel-blue | Visible on near-black frame but clearly dimmer than active |
| Bookmarks bar text | `bookmark_text` | `[241, 233, 218]` | Eggshell | |
| NTP solid background | `ntp_background` | `[10, 26, 44]` | Dark navy | Behind the NTP image |
| NTP body text | `ntp_text` | `[241, 233, 218]` | Eggshell | High contrast on dark bg |
| NTP links | `ntp_link` | `[237, 103, 51]` | Giants Orange | ~5.8:1 on dark navy — AA ✓ |
| NTP link underline | `ntp_link_underline` | `[237, 103, 51]` | Giants Orange | |
| NTP section headers | `ntp_header` | `[241, 233, 218]` | Eggshell | |
| Address-bar text | `omnibox_text` | `[241, 233, 218]` | Eggshell | |
| Address-bar background | `omnibox_background` | `[24, 55, 84]` | Slightly lighter than toolbar | Creates a distinct "pill" for the URL bar |
| Toolbar button bg | `button_background` | `[18, 44, 68]` | Same as toolbar | |
| Toolbar icons tint | `tints.buttons` | `[-1, -1, 0.85]` | — | 0.85 lightness = near-white icons on dark toolbar |

---

## Contrast ratios (key pairs)

| Pair | Ratio | WCAG level |
|------|-------|-----------|
| Prussian Blue on Eggshell | **~11:1** | AAA ✓✓ |
| Eggshell on Prussian Blue | **~11:1** | AAA ✓✓ |
| Giants Orange on dark frame `[8, 22, 40]` | **~5.8:1** | AA ✓ |
| Giants Orange on Eggshell | **~2.7:1** | Large/decorative only |
| Inactive tab text `[178, 205, 222]` on Prussian Blue | **~5.4:1** | AA ✓ |
| Inactive tab text `[120, 155, 185]` on dark frame `[8, 22, 40]` | **~4.8:1** | AA ✓ |

---

## Iteration hints

> These are the most likely tweaks. Edit `manifest.json` (light) or
> `manifest-dark.json` (dark), then reload at `chrome://extensions`.

### Light mode

1. **Toolbar feels too warm / beige** — push `toolbar` toward neutral:
   increase the B channel from `218` toward `235`:
   `"toolbar": [241, 233, 235]`

2. **Prussian Blue frame looks too corporate / navy-heavy** — warm it up by
   nudging R up slightly: `[32, 58, 85]`.

3. **Inactive tab labels `[178, 205, 222]` too blue / too faint** — try
   `[200, 218, 228]` (brighter) or `[155, 185, 205]` (more muted).

4. **Giants Orange links are hard to read on the NTP** — darken slightly:
   `[210, 88, 40]` adds contrast against Eggshell without losing warmth.

5. **Address bar background feels too clinical** — match it to the toolbar:
   `"omnibox_background": [241, 233, 218]`.

6. **Toolbar icons look too dark or washed out** — adjust the lightness in
   `tints.buttons`: go lower (e.g. `0.15`) for darker icons, higher (e.g.
   `0.35`) for slightly lighter ones.

### Dark mode

7. **Frame looks too black / not enough blue** — lighten frame slightly:
   `[14, 34, 58]`. This reveals more of the Prussian Blue tonal character.

8. **Toolbar / frame junction not distinct enough** — widen the gap between
   `frame` and `toolbar` values. Try `"toolbar": [24, 56, 86]`.

9. **NTP background shows too much before the image loads** — match it closer
   to the image's dominant edge colour for a seamless feel.

10. **Giants Orange links look too harsh on dark** — try a slightly
    desaturated variant: `[220, 110, 70]`.

### NTP image

11. **Image appears too small on screen** — it is displayed at its native
    pixel dimensions (no upscaling). On a 1080p display the 4K image is
    ~2× the screen size and will be cropped to the center, which is
    intentional. Nothing to change here.

12. **Image text / shortcuts are hard to read over the photo** — Chrome's
    NTP renders its UI over the photo without a scrim. If the image has a
    light area behind the shortcuts, switch `ntp_text` and `ntp_header` to
    Eggshell (`[241, 233, 218]`) for soft contrast, or to a near-white
    `[250, 248, 244]` for stronger contrast. Dark mode already uses Eggshell.
