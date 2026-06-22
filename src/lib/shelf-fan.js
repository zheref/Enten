/**
 * shelf-fan.js — the popover that fans a list of shelf items up out of a shelf
 * trigger, like the macOS dock "Downloads" stack in list view.
 *
 * The fan is a column anchored to the bottom (it sits just above the floating
 * shelf and grows upward). Rows are laid out bottom-first (CSS
 * `flex-direction: column-reverse`), so the row nearest the shelf is first in
 * the DOM and reveals first: on open each row slides up from below with a
 * staggered delay, sweeping upward until all are revealed.
 *
 * Only one fan is open at a time. Closing is wired to: clicking the trigger
 * again, clicking outside, pressing Escape, or following a row's link.
 */

const REVEAL_STAGGER = 38;   // ms between successive rows revealing
const REVEAL_BASE    = 10;   // ms before the first row reveals

let openFan = null;          // the currently-open .shelf-fan element (or null)

/** Position `fan` centred over `trigger`, opening upward from just above it. */
function position(fan, trigger) {
  const r = trigger.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  // Anchor by the fan's bottom edge so it grows up; centre on the trigger.
  fan.style.left = `${Math.round(cx)}px`;
  fan.style.bottom = `${Math.round(window.innerHeight - r.top + 10)}px`;
}

/** Reveal rows bottom-to-top with a staggered slide-up. */
function reveal(fan) {
  const rows = Array.from(fan.querySelectorAll('.shelf-row-item'));
  rows.forEach((row, i) => {
    row.style.transitionDelay = `${REVEAL_BASE + i * REVEAL_STAGGER}ms`;
  });
  // Next frame: flip to the revealed state so the transition runs.
  requestAnimationFrame(() => requestAnimationFrame(() => fan.classList.add('is-revealed')));
}

export function closeFan() {
  if (!openFan) return;
  const fan = openFan;
  const trigger = fan.__trigger;
  openFan = null;
  fan.classList.remove('is-revealed');
  trigger?.classList.remove('is-active');
  trigger?.setAttribute('aria-expanded', 'false');
  // Hide after the collapse transition so it's not focusable/visible at rest.
  const onEnd = () => { if (!fan.classList.contains('is-revealed')) fan.hidden = true; };
  fan.addEventListener('transitionend', onEnd, { once: true });
  // Fallback in case no transition fires (e.g. reduced motion / display swap).
  setTimeout(() => { if (!fan.classList.contains('is-revealed')) fan.hidden = true; }, 280);
}

export function openFanFor(fan, trigger) {
  if (openFan === fan) { closeFan(); return; }
  if (openFan) closeFan();
  fan.__trigger = trigger;
  fan.hidden = false;
  position(fan, trigger);
  trigger.classList.add('is-active');
  trigger.setAttribute('aria-expanded', 'true');
  openFan = fan;
  reveal(fan);
}

export function isFanOpen(fan) {
  return openFan === fan;
}

/**
 * Wire a trigger button to its fan. `onBeforeOpen` (optional) runs right before
 * the fan opens — use it to (re)build the fan's rows. Returns nothing; safe to
 * call once per trigger/fan pair.
 */
export function bindFan(trigger, fan, onBeforeOpen) {
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (openFan === fan) { closeFan(); return; }
    onBeforeOpen?.();
    openFanFor(fan, trigger);
  });
  // A click on the fan's own chrome (not a row) shouldn't dismiss it.
  fan.addEventListener('click', (e) => e.stopPropagation());
}

// Global dismissers — installed once.
let globalsInstalled = false;
export function installFanDismissers() {
  if (globalsInstalled) return;
  globalsInstalled = true;
  document.addEventListener('click', () => closeFan());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFan(); });
  window.addEventListener('resize', () => closeFan());
  // Keep an open fan glued to its trigger if anything reflows it.
  window.addEventListener('scroll', () => { if (openFan) position(openFan, openFan.__trigger); }, true);
}
