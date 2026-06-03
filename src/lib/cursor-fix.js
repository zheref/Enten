/**
 * cursor-fix.js — force the default cursor inside Material Web components.
 *
 * Material Web hardcodes `cursor: pointer` on inner shadow-DOM elements
 * (.icon-button, .list-item, .menu-item, the slider handle, …) which document
 * CSS cannot reach. We adopt a tiny stylesheet into each component's shadow
 * root that resets the cursor to default. A MutationObserver patches elements
 * added later (e.g. list items injected by the widgets).
 */

const SHEET = new CSSStyleSheet();
SHEET.replaceSync(':host, * { cursor: default !important; }');

const SEL = [
  'md-icon-button', 'md-filled-button', 'md-text-button',
  'md-menu-item', 'md-sub-menu', 'md-slider', 'md-list-item',
].join(',');

function adopt(el) {
  const root = el.shadowRoot;
  if (!root || !('adoptedStyleSheets' in root)) return false;
  if (root.adoptedStyleSheets.includes(SHEET)) return true;
  try {
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, SHEET];
    return true;
  } catch { return false; }
}

// Shadow root / adopted sheets may not exist until after the first Lit render.
function patch(el) {
  if (!adopt(el)) requestAnimationFrame(() => adopt(el));
}

export function installCursorFix() {
  document.querySelectorAll(SEL).forEach(patch);

  const obs = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.matches?.(SEL)) patch(node);
        node.querySelectorAll?.(SEL).forEach(patch);
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
}
