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

// Format a YYYY-MM-DD date range as an uppercase mono caption.
// Same day:        "MAY 19"
// Same month:      "MAY 18–20"
// Cross-month:     "MAY 30–JUN 2"
export function formatDateRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  const start = new Date(`${startIso}T12:00:00`);
  const end = new Date(`${endIso}T12:00:00`);
  const opts = { month: 'short', day: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts).toUpperCase();
  if (startIso === endIso) return startStr;
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${startStr}–${end.getDate()}`;
  }
  const endStr = end.toLocaleDateString('en-US', opts).toUpperCase();
  return `${startStr}–${endStr}`;
}
