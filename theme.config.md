# Theme Configuration Reference

This file documents every key in `manifest.json` so you can customise the theme
without hunting through Chrome's (sparse) official docs.

---

## `images` — key reference

| Key | What it controls | Recommended size |
|-----|-----------------|-----------------|
| `theme_frame` | Background behind the tab strip (active window) | 2500 × 200 px |
| `theme_frame_inactive` | Same area when the window loses focus | 2500 × 200 px |
| `theme_frame_incognito` | Frame in Incognito windows | 2500 × 200 px |
| `theme_toolbar` | Address-bar row background | 2500 × 40 px |
| `theme_tab_background` | Tile behind inactive tabs | 89 × 41 px |
| `theme_ntp_background` | New Tab Page full-page background | 1920 × 1080 px (or 3840 × 2160 HiDPI) |
| `theme_ntp_attribution` | Small logo badge in bottom-right of NTP | ≤ 200 × 100 px |

All images must be **PNG** (prefer 24-bit with optional alpha). JPG is accepted
for `theme_ntp_background` only when file size matters.

> **Tip** — You can remove any key you don't supply; Chrome will fall through to
> its default or the `colors` / `tints` values.

---

## `colors` — RGB triplets `[R, G, B]` (0 – 255)

| Key | What it controls |
|-----|-----------------|
| `frame` | Frame / tab-strip background (active) |
| `frame_inactive` | Frame when window is unfocused |
| `frame_incognito` | Frame in Incognito |
| `toolbar` | Toolbar / address-bar row background |
| `tab_text` | Text on the active (foreground) tab |
| `tab_background_text` | Text on inactive (background) tabs |
| `bookmark_text` | Bookmarks-bar text |
| `ntp_background` | NTP solid background (when no image is set) |
| `ntp_text` | NTP body text |
| `ntp_link` | NTP link colour |
| `ntp_link_underline` | NTP link underline (match `ntp_link` to hide) |
| `ntp_header` | NTP section-header text |
| `omnibox_text` | Address-bar text |
| `omnibox_background` | Address-bar background |
| `button_background` | Toolbar icon button background |

---

## `tints` — HSL triplets `[hue, saturation, lightness]` (0.0 – 1.0, or -1 = unchanged)

| Key | What it controls |
|-----|-----------------|
| `buttons` | Colour tint on toolbar action buttons |
| `frame` | Colour tint on the frame image |
| `frame_inactive` | Tint when window is unfocused |

Examples:
- `[ -1, -1, -1 ]` — completely unchanged  
- `[ -1, -1, 0.0 ]` — tint to black  
- `[ -1, -1, 1.0 ]` — tint to white  
- `[ 0.6, 0.5, 0.5 ]` — teal-ish mid-tone  

---

## `properties`

| Key | Options | Effect |
|-----|---------|--------|
| `ntp_background_alignment` | `"center"`, `"top"`, `"bottom"`, `"left"`, `"right"`, `"center top"`, etc. | Where to anchor the NTP background image |
| `ntp_background_repeat` | `"no-repeat"`, `"repeat"`, `"repeat-x"`, `"repeat-y"` | Whether the NTP image tiles |
| `ntp_logo_alternate` | `0` (coloured) or `1` (white/light) | Which Google logo Chrome shows on the NTP |
