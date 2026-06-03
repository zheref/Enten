/**
 * userdata.js — export / import / clear the user's custom data.
 *
 * "Custom data" = every preference and override the user creates on the
 * dashboard: theme selection & mode, widget rearrangement, app-icon overrides,
 * bookmark order, and custom shortcuts. It deliberately excludes the signed-in
 * account (`userEmail`) and transient API caches (`cachedEmails`/`cachedEvents`),
 * which are device-specific and not portable.
 */

import { storageGet, storageSet, storageRemove } from './storage.js';

/** chrome.storage.local keys that make up the portable custom configuration. */
export const CONFIG_KEYS = [
  'theme',            // selected theme id
  'themeMode',        // light | auto | dark
  'appOverrides',     // per-app icon: source/URL, scale, bg, offset
  'bookmarkOrder',    // drag-reordered bookmark icons
  'shortcuts',        // custom shelf shortcuts
  'widgetAnchor',     // edge anchoring (top/right/bottom/left)
  'widgetPositions',  // dragged widget positions
  'widgetCollapsed',  // collapsed widget state
];

const FILE_TYPE = 'enten-config';
const FILE_VERSION = 1;

/** Read the current custom data (only keys that exist) into a plain object. */
export async function readConfig() {
  const all = await storageGet(CONFIG_KEYS);
  const data = {};
  for (const k of CONFIG_KEYS) if (all[k] !== undefined) data[k] = all[k];
  return data;
}

/** Build the export payload (a tagged, versioned wrapper around the data). */
export async function buildExport() {
  return {
    app: 'Enten',
    type: FILE_TYPE,
    version: FILE_VERSION,
    exportedAt: new Date().toISOString(),
    data: await readConfig(),
  };
}

/**
 * Validate a parsed file and return the recognised data subset.
 * Throws if the file isn't a valid Enten configuration.
 */
export function parseImport(obj) {
  if (!obj || typeof obj !== 'object' || obj.type !== FILE_TYPE
      || typeof obj.data !== 'object' || obj.data === null) {
    throw new Error('Not a valid Enten configuration file');
  }
  const data = {};
  for (const k of CONFIG_KEYS) if (obj.data[k] !== undefined) data[k] = obj.data[k];
  return data;
}

/**
 * Replace local custom data with the contents of an exported file.
 * Returns the list of imported keys.
 */
export async function importConfig(obj) {
  const data = parseImport(obj);
  await storageRemove(CONFIG_KEYS);          // clean replace, not a merge
  if (Object.keys(data).length) await storageSet(data);
  return Object.keys(data);
}

/** Remove all custom data, restoring the dashboard to its defaults. */
export async function clearConfig() {
  await storageRemove(CONFIG_KEYS);
}
