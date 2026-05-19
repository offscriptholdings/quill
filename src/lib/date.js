// Return today's date as YYYY-MM-DD in the user's local timezone.
// en-CA returns ISO-style date format reliably across locales.
export function localTodayIso() {
  return new Date().toLocaleDateString('en-CA');
}

export function localDateIso(date) {
  return date.toLocaleDateString('en-CA');
}

// Add n days to a YYYY-MM-DD string and return YYYY-MM-DD.
// Days are added in local calendar terms (DST-safe via Date arithmetic at noon).
export function addDaysIso(iso, n) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + n);
  return localDateIso(d);
}

// Format an ISO timestamp as a short manuscript-style local time: "9:00a" / "2:30p".
export function formatLocalTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' AM', 'a')
    .replace(' PM', 'p');
}
