import { ack, fetchIncidents } from './api.js';
import { formatIncidentTime, newestFirst } from './format.js';

const board = document.querySelector('[data-testid="board"]');
const loader = document.querySelector('[data-testid="loader"]');
const empty = document.querySelector('[data-testid="empty"]');
const list = document.querySelector('[data-testid="incident-list"]');
const status = document.querySelector('[data-testid="status"]');
const count = document.querySelector('[data-testid="incident-count"]');

const acknowledged = new Map();
const acknowledging = new Set();
let incidents = [];
let loaded = false;
let refreshing = false;

function incidentRow(incident) {
  const row = document.createElement('li');
  row.className = 'incident-row';
  row.dataset.testid = 'incident-row';
  row.dataset.id = incident.id;

  const top = document.createElement('div');
  top.className = 'row-top';

  const id = document.createElement('span');
  id.className = 'incident-id';
  id.textContent = incident.id;
  top.append(id);

  const severity = document.createElement('span');
  severity.className = `severity ${/^(sev1|sev2|sev3)$/i.test(incident.severity) ? incident.severity.toLowerCase() : ''}`;
  severity.textContent = incident.severity;
  top.append(severity);

  const summary = document.createElement('p');
  summary.className = 'summary';
  summary.textContent = incident.summary;

  const details = document.createElement('div');
  details.className = 'row-details';

  const service = document.createElement('span');
  service.textContent = `${incident.service} · ${incident.region}`;
  details.append(service);

  const opened = document.createElement('time');
  opened.dateTime = incident.openedAt;
  opened.textContent = formatIncidentTime(incident.openedAt, navigator.language);
  opened.title = incident.openedAt;
  details.append(opened);

  const action = document.createElement('div');
  action.className = 'row-action';
  if (acknowledged.has(incident.id)) {
    const mark = document.createElement('span');
    mark.className = 'acked';
    mark.dataset.testid = 'acked';
    mark.textContent = 'Acked';
    mark.title = `Acknowledged ${acknowledged.get(incident.id)}`;
    action.append(mark);
  } else {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.testid = 'ack';
    button.dataset.id = incident.id;
    button.disabled = acknowledging.has(incident.id);
    button.textContent = button.disabled ? 'Acknowledging…' : 'Ack';
    button.setAttribute('aria-label', `Acknowledge incident ${incident.id}`);
    action.append(button);
  }

  row.append(top, summary, details, action);
  return row;
}

function render() {
  list.replaceChildren(...incidents.map(incidentRow));
  empty.hidden = incidents.length !== 0;
  list.hidden = incidents.length === 0;
  count.textContent = `${incidents.length} ${incidents.length === 1 ? 'incident' : 'incidents'}`;
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const page = await fetchIncidents();
    incidents = newestFirst(page.incidents);
    render();
    loaded = true;
    loader.hidden = true;
    board.setAttribute('aria-busy', 'false');
    status.textContent = 'Live · updated just now';
    status.classList.remove('error');
  } catch (error) {
    status.textContent = loaded ? 'Update failed · retrying' : 'Could not load incidents · retrying';
    status.classList.add('error');
    console.error('Incident refresh failed', error);
  } finally {
    refreshing = false;
  }
}

list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-testid="ack"]');
  if (!button) return;
  const id = button.dataset.id;
  if (acknowledged.has(id) || acknowledging.has(id)) return;
  acknowledging.add(id);
  button.disabled = true;
  button.textContent = 'Acknowledging…';
  try {
    const result = await ack(id);
    acknowledged.set(id, result.ackedAt);
    render();
    status.textContent = `Incident ${id} acknowledged`;
    status.classList.remove('error');
  } catch (error) {
    status.textContent = `Could not acknowledge ${id} · try again`;
    status.classList.add('error');
    console.error('Incident ack failed', error);
  } finally {
    acknowledging.delete(id);
    render();
  }
});

void refresh();
setInterval(refresh, 2_000);
