/**
 * favicons.js — favicon resolution for shelf icons.
 *
 * Default uses Google's URL-based faviconV2 endpoint: unlike the domain-based
 * s2 service it doesn't collapse subdomains (so mail/calendar.google.com keep
 * their own icons), and unlike Chrome's _favicon it doesn't depend on what the
 * browser happens to have cached. Per-app, the Customize Icon panel can store a
 * specific source from iconSources() to override this.
 */

/** Google faviconV2 URL (URL-aware). */
function gv2(url, size) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(url)}&size=${size}`;
}

/** Default favicon for a URL. */
export function faviconFor(url) {
  try { new URL(url); return gv2(url, 64); }
  catch { return ''; }
}

/** Candidate icon sources/resolutions for a URL, for the Customize Icon picker. */
export function iconSources(url) {
  let u;
  try { u = new URL(url); } catch { return []; }
  const host = u.hostname;
  const list = [
    { key: 'gv2-128', label: 'Google · 128', src: gv2(url, 128) },
    { key: 'gv2-64',  label: 'Google · 64',  src: gv2(url, 64) },
    { key: 's2-128',  label: 'Domain · 128', src: `https://www.google.com/s2/favicons?domain=${host}&sz=128` },
    { key: 'ddg',     label: 'DuckDuckGo',   src: `https://icons.duckduckgo.com/ip3/${host}.ico` },
    { key: 'site',    label: 'Site icon',    src: `${u.origin}/favicon.ico` },
  ];
  // Chrome's real cached favicon (extension only).
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    const c = new URL(chrome.runtime.getURL('/_favicon/'));
    c.searchParams.set('pageUrl', url);
    c.searchParams.set('size', '64');
    list.unshift({ key: 'chrome', label: 'Chrome', src: c.toString() });
  }
  return list;
}
