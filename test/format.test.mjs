import test from 'node:test';
import assert from 'node:assert/strict';
import { formatIncidentTime, newestFirst } from '../app/format.js';

test('new incidents sort first without changing the API response', () => {
  const incidents = [
    { id: 'early', openedAt: '2026-11-12T03:03:00.000Z' },
    { id: 'late', openedAt: '2026-11-12T03:04:00.000Z' },
  ];
  assert.deepEqual(newestFirst(incidents).map(({ id }) => id), ['late', 'early']);
  assert.equal(incidents[0].id, 'early');
});

test('times use the viewer zone and day-month order for European locales', () => {
  const utc = '2026-11-12T03:03:00.000Z';
  assert.match(formatIncidentTime(utc, 'de-DE', 'Europe/Berlin'), /^12\.11\.2026/);
  assert.match(formatIncidentTime(utc, 'en-NZ', 'Pacific/Auckland'), /^12\/11\/2026/);
  assert.match(formatIncidentTime(utc, 'en-US', 'America/Los_Angeles'), /^11\/11\/2026/);
});
