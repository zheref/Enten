/**
 * md-components.ts — registers the Material Web Components we use.
 *
 * Importing a component module defines its custom element globally. Once
 * defined, the element upgrades automatically wherever it appears in the DOM,
 * including markup we inject later via innerHTML.
 *
 * Import this module ONCE from the page's client script.
 *
 * Theming: these components read the `--md-sys-color-*`, `--md-sys-typescale-*`
 * and elevation tokens defined in src/styles/theme.css, so our brand palette
 * (and light/dark switching) applies to them automatically. Crucially,
 * <md-elevation> renders the canonical MD3 elevation (shadow + surface tint),
 * which is what hand-rolled box-shadows were missing.
 */

import '@material/web/elevation/elevation.js';
import '@material/web/ripple/ripple.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/slider/slider.js';
import '@material/web/menu/menu.js';
import '@material/web/menu/menu-item.js';
import '@material/web/button/filled-button.js';
import '@material/web/labs/card/elevated-card.js';
