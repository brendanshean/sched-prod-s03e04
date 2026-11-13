## System Diff

Product decided that new incidents stay live at the top, while Ack moves out of each row: opening a row shows a panel for that incident, and Ack lives there. The plan's R2 and SCHED-4511 now describe this flow.

Behavior: selecting a row opens a panel that names and retains its incident ID. Incoming rows are inserted before existing rows without replacing them, so the open panel and focused row stay stable. Ack in the panel sends the selected ID through the supplied API client and marks that row acknowledged.

UX: rows say View details. The panel shows the incident ID, severity, summary, service, region, local time, Ack, and Close. The panel stays open as the feed refreshes.

Data: the incident API and receipt format are unchanged. The page keeps the selected ID and acknowledged IDs in browser memory. No new server data is stored.

Hooks: `board`, `loader`, `empty`, `incident-list`, `incident-row`, `acked`, and `build-sha` remain. The row `ack` hook was removed. `incident-panel` and `panel-ack` were added for the new flow.

The course replay passed all checks. It observed zero existing rows removed during the watch and three Acks that matched their intended incident IDs.

```evidence
{
  "sha": "b6a3d23b57f62d65d195e807035d7bb731422f5e",
  "videoLink": "https://brendanshean.github.io/sched-prod-s03e04/proof-step2.mp4"
}
```
