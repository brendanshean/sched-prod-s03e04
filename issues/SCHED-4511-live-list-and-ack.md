---
id: SCHED-4511
title: Live list with incident panel Ack
status: ready
plan: R1, R2
---

On-call needs to see new incidents the moment they come in and take one with a click.

- New incidents appear at the top of the list as they arrive, newest first (R1).
- Each row opens an incident panel (`data-testid="incident-panel"`) that names the selected ID. The panel's
  **Ack** button (`data-testid="panel-ack"`) calls `api.ack(id)` for that ID and marks the row acked
  (`data-testid="acked"`) (R2).

Acceptance: a new incident shows at the top without a reload; an open panel stays on its selected
incident; Ack in that panel acknowledges that incident.
