/**
 * menu.js — open an md-menu horizontally centred on its anchor.
 *
 * md-menu has no "centre" corner, so we open it left-aligned to the anchor and
 * then shift it by xOffset = (anchorWidth − menuWidth) / 2 and reposition().
 * The menu surface (.menu) is measured after it renders.
 */
function centre(menu, anchorEl, tries = 4) {
  requestAnimationFrame(() => {
    const surface = menu.shadowRoot && menu.shadowRoot.querySelector('.menu');
    const mw = surface ? surface.offsetWidth : 0;
    if (!mw && tries > 0) { centre(menu, anchorEl, tries - 1); return; }
    const aw = anchorEl.offsetWidth || 0;
    menu.xOffset = Math.round((aw - mw) / 2);
    if (typeof menu.reposition === 'function') menu.reposition();
  });
}

/** Open `menu` anchored to and horizontally centred on `anchorEl`. */
export function openCenteredMenu(menu, anchorEl) {
  menu.anchorElement = anchorEl;
  menu.xOffset = 0;
  menu.open = true;
  centre(menu, anchorEl);
}

/** Re-centre an already-opening menu on its anchor (e.g. opened via a delay). */
export function centerMenuOn(menu, anchorEl) {
  centre(menu, anchorEl);
}
