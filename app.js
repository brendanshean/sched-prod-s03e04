import { ack, fetchIncidents } from './api.js';
import { formatIncidentTime, newestFirst } from './format.js';

const board = document.querySelector('[data-testid="board"]');
const loader = document.querySelector('[data-testid="loader"]');
const empty = document.querySelector('[data-testid="empty"]');
const list = document.querySelector('[data-testid="incident-list"]');
const status = document.querySelector('[data-testid="status"]');
const count = document.querySelector('[data-testid="incident-count"]');
const panel = document.querySelector('[data-testid="incident-panel"]');
const panelTitle = document.querySelector('[data-testid="panel-title"]');
const panelSeverity = document.querySelector('[data-testid="panel-severity"]');
const panelSummary = document.querySelector('[data-testid="panel-summary"]');
const panelService = document.querySelector('[data-testid="panel-service"]');
const panelOpened = document.querySelector('[data-testid="panel-opened"]');
const panelAck = document.querySelector('[data-testid="panel-ack"]');
const panelAcked = document.querySelector('[data-testid="panel-acked"]');
const panelClose = document.querySelector('[data-testid="panel-close"]');

const acknowledged = new Map();
const acknowledging = new Set();
const rowsById = new Map();
let incidents = [];
let loaded = false;
let refreshing = false;
let selectedId = null;

function incidentRow(incident) {
  const row = document.createElement('li');
  row.className = 'incident-row';
  row.dataset.testid = 'incident-row';
  row.dataset.id = incident.id;
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `Open incident ${incident.id}`);
  if (selectedId === incident.id) row.setAttribute('aria-current', 'true');

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
    const cue = document.createElement('span');
    cue.className = 'open-cue';
    cue.textContent = 'View details';
    action.append(cue);
  }

  row.append(top, summary, details, action);
  return row;
}

function render() {
  const currentIds = new Set(incidents.map(incident => incident.id));
  for (const [id, row] of rowsById) {
    if (currentIds.has(id)) continue;
    row.remove();
    rowsById.delete(id);
  }

  let next = null;
  for (let i = incidents.length - 1; i >= 0; i -= 1) {
    const incident = incidents[i];
    let row = rowsById.get(incident.id);
    if (!row) {
      row = incidentRow(incident);
      rowsById.set(incident.id, row);
      list.insertBefore(row, next);
    }
    if (selectedId === incident.id) row.setAttribute('aria-current', 'true');
    else row.removeAttribute('aria-current');
    if (acknowledged.has(incident.id) && !row.querySelector('[data-testid="acked"]')) {
      const mark = document.createElement('span');
      mark.className = 'acked';
      mark.dataset.testid = 'acked';
      mark.textContent = 'Acked';
      mark.title = `Acknowledged ${acknowledged.get(incident.id)}`;
      row.querySelector('.row-action').replaceChildren(mark);
    }
    next = row;
  }
  empty.hidden = incidents.length !== 0;
  list.hidden = incidents.length === 0;
  count.textContent = `${incidents.length} ${incidents.length === 1 ? 'incident' : 'incidents'}`;
}

function renderPanel() {
  const incident = incidents.find(item => item.id === selectedId);
  if (!incident) {
    panel.hidden = true;
    delete panel.dataset.id;
    return;
  }

  panel.hidden = false;
  panel.dataset.id = incident.id;
  panelTitle.textContent = `Incident ${incident.id}`;
  panelSeverity.textContent = incident.severity;
  panelSeverity.className = `severity ${/^(sev1|sev2|sev3)$/i.test(incident.severity) ? incident.severity.toLowerCase() : ''}`;
  panelSummary.textContent = incident.summary;
  panelService.textContent = `${incident.service} · ${incident.region}`;
  panelOpened.dateTime = incident.openedAt;
  panelOpened.textContent = formatIncidentTime(incident.openedAt, navigator.language);
  panelOpened.title = incident.openedAt;

  const isAcked = acknowledged.has(incident.id);
  panelAck.hidden = isAcked;
  panelAck.disabled = acknowledging.has(incident.id);
  panelAck.textContent = panelAck.disabled ? 'Acknowledging…' : `Ack ${incident.id}`;
  panelAcked.hidden = !isAcked;
  if (isAcked) panelAcked.title = `Acknowledged ${acknowledged.get(incident.id)}`;
}

function openIncident(id) {
  selectedId = id;
  render();
  renderPanel();
  (panelAck.hidden ? panelClose : panelAck).focus();
}

async function refresh() {
  if (refreshing) return;
  refreshing = true;
  try {
    const page = await fetchIncidents();
    incidents = newestFirst(page.incidents);
    render();
    renderPanel();
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

list.addEventListener('click', (event) => {
  const row = event.target.closest('[data-testid="incident-row"]');
  if (row) openIncident(row.dataset.id);
});

list.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const row = event.target.closest('[data-testid="incident-row"]');
  if (!row) return;
  event.preventDefault();
  openIncident(row.dataset.id);
});

panelClose.addEventListener('click', () => {
  const id = selectedId;
  selectedId = null;
  renderPanel();
  render();
  list.querySelector(`[data-id="${id}"]`)?.focus();
});

panelAck.addEventListener('click', async () => {
  const id = selectedId;
  if (!id) return;
  if (acknowledged.has(id) || acknowledging.has(id)) return;
  acknowledging.add(id);
  renderPanel();
  try {
    const result = await ack(id);
    acknowledged.set(id, result.ackedAt);
    render();
    renderPanel();
    if (selectedId === id) panelClose.focus();
    status.textContent = `Incident ${id} acknowledged`;
    status.classList.remove('error');
  } catch (error) {
    status.textContent = `Could not acknowledge ${id} · try again`;
    status.classList.add('error');
    console.error('Incident ack failed', error);
  } finally {
    acknowledging.delete(id);
    renderPanel();
  }
});

void refresh();
setInterval(refresh, 2_000);
