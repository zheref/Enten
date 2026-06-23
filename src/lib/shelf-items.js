/**
 * shelf-items.js — the shelf's data model + icon/row markup.
 *
 * One place that knows how to build the list of shelf items (configured
 * shortcuts + the Chrome Bookmarks Bar), resolve each one's visual props from
 * the per-app overrides, and emit the two flavours of markup they render in:
 *
 *   • iconHTML  — the compact circular icon used inline in the shelf row and as
 *                 the live-preview circle elsewhere.
 *   • rowHTML   — a horizontal "circle + label" row, used inside the fan
 *                 popovers (Archived / Overflow), à la the macOS dock list view.
 *
 * Archiving: the user can hide any item from the shelf. Archived URLs live in
 * chrome.storage.local under `archivedUrls`; archived items are pulled out of
 * the inline row and shown only in the Archived fan.
 */

import { storageGet, storageSet } from './storage.js';
import { faviconFor } from './favicons.js';

// scale: 0–100 (percent of circle)  ·  elevation: 0 | 1 | 2 | 3
export const DEFAULT_SHORTCUTS = [
  { label: 'Gmail',    url: 'https://mail.google.com',     scale: 80, elevation: 1 },
  { label: 'Calendar', url: 'https://calendar.google.com', scale: 80, elevation: 1 },
  { label: 'GitHub',   url: 'https://github.com',          scale: 73, elevation: 1 },
  { label: 'YouTube',  url: 'https://youtube.com',         scale: 67, elevation: 1 },
  { label: 'Notion',   url: 'https://notion.so',           scale: 73, elevation: 1 },
  { label: 'Figma',    url: 'https://figma.com',           scale: 67, elevation: 1 },
  { label: 'Linear',   url: 'https://linear.app',          scale: 90, elevation: 1 },
  { label: 'Vercel',   url: 'https://vercel.com',          scale: 100, elevation: 1 },
];

export const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export const esc = (s) => String(s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Default containment scale per item kind. */
const DEFAULT_SCALE = { shortcut: 100, bookmark: 85 };

/**
 * Resolve an item's effective visual props by folding in its per-app override
 * (scale / bg / icon / offset), keyed by URL.
 */
export function resolveVisual(item, appOverrides = {}) {
  const ov = appOverrides[item.url] || {};
  const kindDefault = DEFAULT_SCALE[item.kind] ?? 100;
  const scale = clamp(
    typeof ov.scale === 'number' ? ov.scale
      : (typeof item.scale === 'number' ? item.scale : kindDefault),
    0, 100,
  );
  const elev = [0, 1, 2, 3].includes(item.elevation) ? item.elevation : 1;
  const bg = ov.bg || '';
  const src = ov.icon || faviconFor(item.url);
  const offset = (ov.offset && typeof ov.offset.x === 'number') ? ov.offset : null;
  return { scale, elev, bg, src, offset };
}

/** Inner markup of the white circle (favicon clipped to a round app icon). */
function circleHTML(v) {
  const bgStyle = v.bg ? `background:${esc(v.bg)};` : '';
  const off = v.offset && (v.offset.x || v.offset.y)
    ? `transform:translate(${v.offset.x}px,${v.offset.y}px);` : '';
  return `
    <span class="shelf-icon__circle elev-${v.elev}" style="${bgStyle}" aria-hidden="true">
      <img class="shelf-icon__favicon" draggable="false"
           style="width:${v.scale}%;height:${v.scale}%;${off}"
           src="${esc(v.src)}" alt="" loading="lazy" />
    </span>`;
}

/**
 * Build one inline shelf icon.
 *  - Bookmarks are draggable to reorder; fixed shortcuts are not.
 *  - A normal click opens in THIS tab; new-tab / copy live in the right-click
 *    menu (and middle-click still opens a tab).
 */
export function iconHTML(item, appOverrides = {}) {
  const v = resolveVisual(item, appOverrides);
  const label = esc(item.label ?? item.url ?? '');
  const draggable = item.kind === 'bookmark' ? 'true' : 'false';
  return `
    <a class="shelf-icon" href="${esc(item.url)}" role="listitem" aria-label="${label}"
       data-url="${esc(item.url)}" data-kind="${item.kind}" draggable="${draggable}">
      ${circleHTML(v)}
      <span class="shelf-icon__tip" role="tooltip">${label}</span>
    </a>`;
}

/**
 * Build one fan row — the same circle with its title beside it (macOS-dock
 * "Downloads" list style). Used inside the Archived / Overflow popovers.
 */
export function rowHTML(item, appOverrides = {}) {
  const v = resolveVisual(item, appOverrides);
  const label = esc(item.label ?? item.url ?? '');
  return `
    <a class="shelf-row-item" href="${esc(item.url)}" role="listitem" aria-label="${label}"
       data-url="${esc(item.url)}" data-kind="${item.kind}">
      ${circleHTML(v)}
      <span class="shelf-row-item__label">${label}</span>
    </a>`;
}

/** Read the Chrome Bookmarks Bar (node id "1"); bookmarks only (skip folders). */
export async function getBookmarksBar() {
  if (typeof chrome === 'undefined' || !chrome?.bookmarks) return [];
  return new Promise(resolve => {
    chrome.bookmarks.getChildren('1', (children) => {
      if (chrome.runtime.lastError || !children) { resolve([]); return; }
      resolve(children
        .filter(n => n.url)
        .map(n => ({ label: n.title || n.url, url: n.url })));
    });
  });
}

/** The set of archived URLs. */
export async function getArchivedSet() {
  const { archivedUrls = [] } = await storageGet('archivedUrls');
  return new Set(archivedUrls);
}

/** Archive (hide from the shelf) or unarchive a single URL. */
export async function setArchived(url, archived) {
  const set = await getArchivedSet();
  if (archived) set.add(url); else set.delete(url);
  await storageSet({ archivedUrls: Array.from(set) });
}

/**
 * Load the full, ordered shelf model.
 *
 * Returns every item (shortcuts first, then bookmarks in the user's saved
 * order) tagged with its `kind` and `archived` flag, plus the shared
 * `appOverrides` map so callers can render without re-fetching.
 */
export async function loadShelf() {
  const { appOverrides = {} } = await storageGet('appOverrides');
  const archived = await getArchivedSet();

  const { shortcuts } = await storageGet('shortcuts');
  const shortcutItems = (shortcuts ?? DEFAULT_SHORTCUTS)
    .map(s => ({ ...s, kind: 'shortcut' }));

  const bookmarks = await getBookmarksBar();
  if (bookmarks.length) {
    const { bookmarkOrder = [] } = await storageGet('bookmarkOrder');
    bookmarks.sort((a, b) => {
      const ia = bookmarkOrder.indexOf(a.url);
      const ib = bookmarkOrder.indexOf(b.url);
      if (ia === -1 && ib === -1) return 0;
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }
  const bookmarkItems = bookmarks.map(b => ({ ...b, kind: 'bookmark' }));

  const items = [...shortcutItems, ...bookmarkItems]
    .map(it => ({ ...it, archived: archived.has(it.url) }));

  return { items, appOverrides };
}
