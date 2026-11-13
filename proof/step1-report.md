## What you checked

I used the public incident board while new incidents were arriving. I put the pointer over the top Ack for INC-9517 and kept it at that screen position. INC-2437 arrived above it. The click acknowledged INC-2437, while INC-9517 stayed open. The detached developer console logged the sealed receipt for INC-2437. Its `openedAt` was 2026-11-13T02:32:21.675Z and its `ackedAt` was 2026-11-13T02:32:23.266Z, 1.591 seconds later.

## When

At 00:01, INC-9517 is the top row and the pointer is over its Ack. Around 00:05, INC-2437 takes the top position. At 00:06, INC-2437 shows Acknowledged while INC-9517 still has an Ack button.

## Where

`app/app.js:89` sorts the live feed newest first; `app/app.js:78` replaces the rows on each refresh, which runs every two seconds at `app/app.js:130`. `app/app.js:66` binds the incident ID to each Ack button. The click handler reads the button now at that screen position at `app/app.js:108` and sends that ID at `app/app.js:114`.

## Options for product

1. Hold arriving rows while a person is aiming at an Ack, show a new-incident indicator, and insert the rows after the action.
2. Insert new rows immediately, but ask the person to confirm the incident ID before sending the Ack when the list has shifted.

```evidence
{
  "flow": "ack-incident",
  "expected": "INC-9517",
  "got": "INC-2437",
  "at": "00:06",
  "receipt": "a1.MdfknIFaXOZc99HT.C2cl_K73jZYQjuKMYILcOpo_rmubcS1XGHyif0kO2Bvw6WgA3tFtjoOxNIC0mS7b5BpZGoWoAlJVkkR52ck5tTyMyd1GmtA_oRHsrS2fw9YJluzi41NR6lj4XkyA4fPXfH6bYs9TdVtsa-dEeP2hcobxBycfaLyLUBSJdle6X7Cs1H--NHTuboxIH6O_awngk9ub",
  "sha": "636e0de02ecb99ca5b32befd97b00c2e9029888d",
  "videoLink": "https://sched-prod-s03e04-bs.edgedhaven4.chatgpt.site/proof-step1.mp4"
}
```
