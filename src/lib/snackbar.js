/**
 * snackbar.js — a tiny, reusable MD3 snackbar.
 *
 * showSnackbar(message, durationMs?) shows a single transient message in the
 * bottom-right corner, just above the shelf. One shared element is reused and
 * re-triggered, so rapid calls replace the current message.
 *
 * Styling lives in the global .md3-snackbar rules in src/styles/theme.css
 * (the element is appended to <body>, outside any Astro scope, so it must be
 * styled globally).
 */

let host = null;
let hideTimer;

function ensureHost() {
  if (host && document.body.contains(host)) return host;
  host = document.createElement('div');
  host.className = 'md3-snackbar';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
}

/**
 * Show a transient message.
 * @param {string} message     Text to display.
 * @param {number} [durationMs=4000]  How long before it auto-dismisses.
 */
export function showSnackbar(message, durationMs = 4000) {
  const el = ensureHost();
  el.textContent = message;
  el.classList.remove('is-visible');
  // Force reflow so re-adding the class restarts the enter transition.
  void el.offsetWidth;
  el.classList.add('is-visible');

  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => el.classList.remove('is-visible'), durationMs);
}
