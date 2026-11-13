export function newestFirst(incidents) {
  return [...incidents].sort((a, b) => Date.parse(b.openedAt) - Date.parse(a.openedAt));
}

export function formatIncidentTime(utc, locale, timeZone) {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  if (timeZone) options.timeZone = timeZone;
  return new Intl.DateTimeFormat(locale, options).format(new Date(utc));
}
