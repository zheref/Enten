# SergioSwift — Chrome Theme

A minimal Chrome theme built on three colours: a deep **Prussian Blue** header,
a warm **Eggshell** toolbar, and **Giants Orange** accents on links and active
elements.

---

## Palette

| Role | Name | Hex | RGB |
|------|------|-----|-----|
| Header / tab strip | Prussian Blue | `#133552` | `19, 53, 82` |
| Toolbar / active tab | Eggshell | `#F1E9DA` | `241, 233, 218` |
| Accent / links / active tab label | Giants Orange | `#ED6733` | `237, 103, 51` |
| NTP background fill | Jaguar | `#292A2D` | `41, 42, 45` |

---

## Install — personal use (unpacked)

> No Web Store account required.

1. [Download or clone](../../archive/refs/heads/main.zip) this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (toggle, top-right corner).
4. Click **Load unpacked** and select the downloaded folder
   (the one that contains `manifest.json`).
5. Chrome applies the theme immediately — no restart needed.

To update after pulling new changes: click the **↺** icon next to the
theme on `chrome://extensions`.

---

## Install — Chrome Web Store

> *(Not published yet — coming soon.)*

---

## Customise

### Swap the New Tab Page wallpaper

1. Drop your image into the `images/` folder (PNG recommended; 2560 × 1440 px
   or larger for sharp display on 1440p / 4K screens).
2. Open `manifest.json` and update the path:
   ```json
   "theme_ntp_background": "images/your-image.png"
   ```
3. Reload the extension at `chrome://extensions`.

### Change colours

All values in `manifest.json → theme → colors` are `[R, G, B]` triplets
(0 – 255). A quick reference for every key is in
[`theme.config.md`](theme.config.md).

Useful tools:
- [Hex → RGB converter](https://www.rapidtables.com/convert/color/hex-to-rgb.html)
- [Contrast checker](https://webaim.org/resources/contrastchecker/)

Full colour map with contrast ratios and iteration hints: [`palette.md`](palette.md).

### Branch workflow

```bash
# Always keep main stable
git checkout -b experiment/my-idea

# Iterate, reload in Chrome to preview, then either merge or discard
git checkout main
git merge experiment/my-idea   # keep
git branch -D experiment/my-idea   # or discard
```

---

## Project structure

```
.
├── manifest.json       ← The theme (only file Chrome reads)
├── palette.md          ← Colour map, contrast ratios, iteration hints
├── theme.config.md     ← Every manifest key explained
├── .gitignore
├── README.md
└── images/
    ├── naruto-swift.jpg    ← Original 4K source (reference only)
    └── naruto-swift.png    ← Active NTP wallpaper (2560 × 1440)
```

---

## Publish to the Chrome Web Store

1. Zip the folder (exclude dev-only files):
   ```bash
   zip -r sergioswift.zip . \
     --exclude ".git/*" --exclude ".DS_Store" \
     --exclude "*.pem"  --exclude "*.crx"
   ```
2. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   (one-time $5 USD registration fee).
3. **New item** → upload the ZIP → fill in the listing:
   - **Category** → *Themes*
   - **Screenshots** — at least one at `1280 × 800 px`
   - **Promotional tile** — `440 × 280 px` PNG (required)
4. Submit for review (1 – 3 business days).

To update a published theme: bump `"version"` in `manifest.json`,
re-zip, and upload a new package.

---

## Contributing

Pull requests are welcome. Please open an issue first for significant
palette or structural changes so we can discuss the direction.

1. Fork the repo and create a branch from `main`.
2. Make your changes and test by loading the folder as an unpacked extension.
3. Keep `manifest.json` valid JSON (validate at [jsonlint.com](https://jsonlint.com)).
4. Open a pull request with a short description and, if possible, a screenshot
   of the change in Chrome.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Theme won't load | `manifest.json` syntax error | Validate at [jsonlint.com](https://jsonlint.com) |
| NTP image not showing | Path mismatch (case-sensitive on Linux/macOS) | Check `"theme_ntp_background"` matches file name exactly |
| Colours look wrong | Wrong RGB order or out-of-range value | Values must be integers 0 – 255 in `[R, G, B]` order |
| NTP logo looks off | Wrong `ntp_logo_alternate` | `0` = coloured Google logo · `1` = white logo |
| Web Store rejects ZIP | ZIP contains the folder itself | Zip the *contents* of the folder, not the folder |

---

## License

[MIT](LICENSE) — feel free to fork and make it your own.
