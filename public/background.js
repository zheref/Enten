/**
 * background.js — Manifest V3 service worker.
 *
 * In MV3, background pages are replaced by service workers.
 * Key constraints:
 *   - Service workers are terminated when idle (not persistent).
 *   - Do NOT store state in variables — use chrome.storage.local.
 *   - Alarms API (chrome.alarms) is the right way to schedule periodic tasks.
 *
 * Current responsibilities:
 *   - Respond to extension install / update.
 *   - (Optional) Scheduled token refresh or cache pre-warm via alarms.
 */

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('[Enten] Extension installed.');
  }
  if (reason === 'update') {
    console.log('[Enten] Extension updated.');
  }
});

// Example: refresh cached calendar + email every 15 minutes.
// Uncomment and wire up to your fetch functions when ready.
//
// chrome.alarms.create('refreshData', { periodInMinutes: 15 });
// chrome.alarms.onAlarm.addListener(alarm => {
//   if (alarm.name === 'refreshData') {
//     // Import helpers and re-fetch — results stored in chrome.storage.local.
//     // The NTP page reads from storage on next open.
//   }
// });
