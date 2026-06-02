/**
 * storage.js — thin wrapper around chrome.storage.local.
 *
 * Why chrome.storage.local and NOT localStorage?
 *  - Persists across extension reinstalls and Chrome profile syncs.
 *  - Never cleared by "Clear browsing data" (unlike localStorage).
 *  - Isolated to your extension — no other page can read it.
 *  - 10 MB default quota (vs localStorage's ~5 MB).
 *
 * Falls back to an in-memory Map when running outside Chrome (npm run dev).
 */

const isChromeExt = typeof chrome !== 'undefined' && !!chrome?.storage?.local;
const memStore = new Map();

/** Persist one or more key/value pairs. */
export async function storageSet(items) {
  if (isChromeExt) {
    return new Promise((resolve, reject) =>
      chrome.storage.local.set(items, () =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve()
      )
    );
  }
  Object.entries(items).forEach(([k, v]) => memStore.set(k, v));
}

/** Retrieve values by key (or array of keys). Returns an object. */
export async function storageGet(keys) {
  if (isChromeExt) {
    return new Promise((resolve, reject) =>
      chrome.storage.local.get(keys, result =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(result)
      )
    );
  }
  const keyList = Array.isArray(keys) ? keys : [keys];
  return Object.fromEntries(keyList.map(k => [k, memStore.get(k)]));
}

/** Remove one or more keys. */
export async function storageRemove(keys) {
  if (isChromeExt) {
    return new Promise((resolve, reject) =>
      chrome.storage.local.remove(keys, () =>
        chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve()
      )
    );
  }
  (Array.isArray(keys) ? keys : [keys]).forEach(k => memStore.delete(k));
}
