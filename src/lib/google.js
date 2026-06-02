/**
 * google.js — Google API helpers.
 *
 * Authentication strategy
 * ───────────────────────
 * chrome.identity.getAuthToken()
 *   • Uses the Google account already signed into Chrome — no popup for the user.
 *   • Only works for a SINGLE account (the primary Chrome profile account).
 *   • Chrome caches and auto-refreshes the token. You never store it yourself.
 *   • Requires "identity" permission + "oauth2" block in manifest.json.
 *
 * chrome.identity.launchWebAuthFlow()  [NOT used here — see DASHBOARD.md §Multi-account]
 *   • Opens an OAuth popup for any Google (or other) account.
 *   • You must store + refresh the returned token yourself via chrome.storage.local.
 *   • More setup, more flexibility.
 *
 * Token storage
 * ─────────────
 * With getAuthToken() Chrome manages the token lifecycle entirely.
 * User preferences and cached API responses are stored via storage.js.
 */

const BASE = 'https://www.googleapis.com';

/** Get an OAuth token for the signed-in Chrome account (interactive if needed). */
async function getToken(interactive = true) {
  if (typeof chrome === 'undefined' || !chrome?.identity) {
    // Dev mode — return a placeholder so components don't crash.
    return '__DEV_TOKEN__';
  }
  return new Promise((resolve, reject) =>
    chrome.identity.getAuthToken({ interactive }, token =>
      chrome.runtime.lastError
        ? reject(new Error(chrome.runtime.lastError.message))
        : resolve(token)
    )
  );
}

/** Revoke the cached token and force re-auth on next call. */
export async function signOut() {
  if (typeof chrome === 'undefined' || !chrome?.identity) return;
  const token = await getToken(false).catch(() => null);
  if (!token) return;
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
  await new Promise(res => chrome.identity.removeCachedAuthToken({ token }, res));
}

/**
 * Generic authenticated GET to a Google API endpoint.
 * @param {string} url  Full URL including query params.
 */
async function gFetch(url) {
  const token = await getToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Google API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ── Gmail ─────────────────────────────────────────────────────────────────────

/**
 * Fetch the N most recent inbox messages.
 * Returns an array of { id, subject, from, snippet, date, unread }.
 *
 * Scope required: https://www.googleapis.com/auth/gmail.readonly
 */
export async function getRecentEmails(maxResults = 8) {
  if (typeof chrome === 'undefined') return MOCK_EMAILS;

  // 1. Get message IDs from the inbox.
  const list = await gFetch(
    `${BASE}/gmail/v1/users/me/messages?maxResults=${maxResults}&labelIds=INBOX`
  );
  if (!list.messages?.length) return [];

  // 2. Fetch each message header in parallel.
  const messages = await Promise.all(
    list.messages.map(({ id }) =>
      gFetch(`${BASE}/gmail/v1/users/me/messages/${id}?format=metadata` +
              `&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`)
    )
  );

  return messages.map(m => {
    const headers = Object.fromEntries(
      m.payload.headers.map(h => [h.name, h.value])
    );
    return {
      id:      m.id,
      subject: headers['Subject'] ?? '(no subject)',
      from:    headers['From']    ?? '',
      snippet: m.snippet          ?? '',
      date:    headers['Date']    ?? '',
      unread:  m.labelIds?.includes('UNREAD') ?? false,
    };
  });
}

// ── Google Calendar ───────────────────────────────────────────────────────────

/**
 * Fetch upcoming events from the primary calendar.
 * Returns an array of { id, title, start, end, location, allDay }.
 *
 * Scope required: https://www.googleapis.com/auth/calendar.readonly
 */
export async function getUpcomingEvents(maxResults = 8) {
  if (typeof chrome === 'undefined') return MOCK_EVENTS;

  const now = new Date().toISOString();
  const data = await gFetch(
    `${BASE}/calendar/v3/calendars/primary/events` +
    `?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${now}`
  );

  return (data.items ?? []).map(e => ({
    id:       e.id,
    title:    e.summary     ?? '(untitled)',
    start:    e.start.dateTime ?? e.start.date,
    end:      e.end.dateTime   ?? e.end.date,
    location: e.location    ?? '',
    allDay:   !!e.start.date && !e.start.dateTime,
  }));
}

// ── Mock data for npm run dev ─────────────────────────────────────────────────

const MOCK_EMAILS = [
  { id: '1', subject: 'Weekly digest', from: 'newsletter@example.com',
    snippet: 'Here is what happened this week…', date: 'Mon, 2 Jun 2025', unread: true },
  { id: '2', subject: 'Your invoice is ready', from: 'billing@stripe.com',
    snippet: 'Invoice #INV-2025-06 for $29.00', date: 'Sun, 1 Jun 2025', unread: false },
  { id: '3', subject: 'PR review requested', from: 'github@github.com',
    snippet: 'Someone requested your review on…', date: 'Sun, 1 Jun 2025', unread: true },
];

const MOCK_EVENTS = [
  { id: '1', title: 'Team standup', start: new Date().toISOString(),
    end: new Date(Date.now() + 1800000).toISOString(), location: 'Zoom', allDay: false },
  { id: '2', title: 'Lunch with Alex', start: new Date(Date.now() + 7200000).toISOString(),
    end: new Date(Date.now() + 9000000).toISOString(), location: '', allDay: false },
  { id: '3', title: 'Release day', start: new Date().toDateString(),
    end: new Date().toDateString(), location: '', allDay: true },
];
