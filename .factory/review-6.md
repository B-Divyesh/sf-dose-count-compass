# Adversarial first-read review 6 — Dose Count Compass

- Reviewed: 2026-08-29 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Base: `8f0f72044b2e2379f6304636291cf4b18a0ffc13`
- Verdict: **PASS**
- Findings: **0 blocking, 0 major, 0 minor**

The live product is clear on first read, opens a useful isolated demo in one
click, and supports every public capability claim with a passing sandbox test.
No untested claim, regression, dead link, routing defect, or copy finding was
found.

## Cold first read

Fresh Chromium contexts with no site data opened the live home page at
390 × 844 and 1440 × 900. Before scrolling, both screens answered all three
questions:

- **What it does:** “Count doses before you run out.”
- **For whom:** “For people who track doses but do not need a full medicine
  app.”
- **What to click first:** “Try it with sample data.” The adjacent result is
  “See three devices already counted.”

At 390 px, the headline ended at y=284, the audience sentence at y=360, the
44 px primary action at y=432, and all three facts ended at y=593. At desktop,
the primary action ended at y=476. Neither viewport overflowed horizontally.
Both returned HTTP 200 with one `h1`, one `main`, and no console or request
errors. The blocking first-screen gate passes.

## Copy audit

Words are whitespace-separated rendered words. The tables include headings,
navigation, actions, labels, alt text, and footer copy. Numeric gauge values
alone are omitted. No entry exceeds 22 words, uses a banned marketing
adjective, drifts terminology, or uses a generic action label.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | clear action |
| Dose Count Compass | 3 | product name |
| Demo | 1 | clear navigation label |
| My devices | 2 | clear navigation label |
| Privacy | 1 | clear navigation label |
| Online | 1 | factual connection state |
| PRIVATE DOSE COUNT | 3 | clear supporting label |
| Count doses before you run out | 6 | `log-updates-count` |
| For people who track doses but do not need a full medicine app. | 13 | clear audience |
| Try it with sample data | 5 | result-naming action; `demo-isolation` |
| See three devices already counted. | 5 | `demo-isolation` |
| Saved in your browser | 4 | `local-only` |
| Works offline after first visit | 5 | `offline-reload` |
| Free to use | 3 | `free-to-use` |
| Paper-cut shelf with generic inhaler, nasal spray, and injector. | 9 | useful image alt text |
| Original paper-cut illustration. | 3 | asset provenance |
| It does not show a real medicine. | 7 | useful image clarification |
| A SMALL INVENTORY | 3 | clear section label |
| Check doses left and refill status | 6 | clear section heading |
| Download a backup file or dose-history spreadsheet from your device list. | 11 | `json-export`, `csv-export` |
| Inhaler | 1 | sample type label |
| Enough for now | 3 | sample status |
| Blue rescue inhaler | 3 | sample device name |
| of 200 left | 3 | sample count label |
| 42 puffs | 2 | sample unit |
| A refill reminder starts at 30 puffs. | 7 | `refill-reminder` |
| How dose counting works | 4 | clear section heading |
| Add a device. | 3 | concrete step |
| Enter the count printed on it. | 6 | concrete instruction |
| Log each use. | 3 | `log-updates-count` |
| Update the count. | 3 | `log-updates-count` |
| Plan a refill at your chosen count. | 7 | `refill-reminder` |
| The card shows a refill reminder before zero. | 8 | `refill-reminder` |
| What this does not do | 5 | clear limitation heading |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | useful safety limit |
| Check expiry dates separately. | 4 | useful safety instruction |
| Saved in your browser. | 4 | `local-only` |
| Count doses before a device runs out. | 7 | `log-updates-count` |
| Privacy | 1 | footer link |
| Terms | 1 | footer link |
| Built by Param Factory · v1.2.3 | 6 | build attribution |

The landing consistently uses **device**, **doses left**, **refill reminder**,
**backup file**, **dose-history spreadsheet**, and **demo/sample data**. Every
heading names its section. The primary action names its action and result.

### README

Code blocks are commands, not prose sentences; every heading and prose
sentence is listed.

| Copy | Words | Result |
| --- | ---: | --- |
| Dose Count Compass | 3 | document title |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | `log-updates-count` |
| It is for people who track doses but do not need a full medicine app. | 15 | clear audience |
| It is free to use. | 5 | `free-to-use` |
| Saved in your browser. | 4 | `local-only` |
| It works offline after the first visit. | 7 | `offline-reload` |
| Download a backup file or dose-history spreadsheet. | 7 | `json-export`, `csv-export` |
| Import a backup with confirmation and Undo. | 7 | `backup-import` |
| Print an inventory card. | 4 | `print-card` |
| Try three separate sample devices at `/?demo=1`. | 7 | `demo-isolation` |
| Run locally | 2 | clear heading |
| Test and build | 3 | clear heading |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | developer instruction |
| Preview it with `npm run preview`. | 6 | developer instruction |
| Deploy | 1 | clear deployment heading |
| Build with `npm run build`. | 5 | developer instruction |
| The factory static work order publishes the resulting `dist/` directory with `public/staticwebapp.config.json`. | 12 | developer instruction |
| File formats | 2 | clear heading |
| Backup files use `.json`. | 4 | developer file-format note |
| Dose-history spreadsheet files use `.csv`. | 5 | developer file-format note |
| Safety and privacy | 3 | clear heading |
| Use the count alongside the physical device indicator, prescription label, and pharmacist or clinician instructions. | 15 | useful safety instruction |
| This is not medical advice. | 5 | useful safety limit |
| Saved in your browser. | 4 | `local-only` |
| See `/privacy` and `/terms`. | 4 | route instruction |

There are no copy findings or proposed rewrites because every audited string
passes the supplied plain-words rules.

## Demo and sandbox behaviour

- One click on **Try it with sample data** opened `/demo`. Its first rendered
  screen showed Blue rescue inhaler at 42/200, Saline spray at 86/120, and
  Travel injector at 1/2, including count and refill status.
- The persistent banner read “Demo — sample data, nothing is saved” and exposed
  **Reset demo** and **Start for real**.
- A real record named `Review 6 real device` was created first. It was absent
  in demo. Logging changed Blue from 42 to 41; Reset restored 42. Starting for
  real restored the untouched real record. Storage databases were
  `demo:dose-count-compass` and `real:dose-count-compass`.
- After service-worker control, logging offline changed Blue from 42 to 41 and
  41 remained after an offline reload.
- The full real/demo/offline request log contained no cross-origin request.
  No analytics, CDN font/script, model request, or provider credential appeared.
- `.factory/demo.md` documents `/demo`, `/?demo=1`, samples, reset/exit,
  offline availability, and both storage namespaces.

The blocking demo and isolation gate passes.

## Claims

`.factory/claims.json` contains 12 unique entries. Static inspection found
exactly one `@claim:<id>` test for each and no extra claim tag. A fresh local
clone at `/tmp/dose-review6-lrHkBh` ran `npm ci`, then every listed command
independently:

| Claim | Exact command | Result and observable evidence |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — offline 42 → 41 survived reload |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS — 3 device rows and 5 dose-log rows |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS — all 3 sample devices in backup |
| `backup-import` | `npm test -- --grep @claim:backup-import` | PASS — invalid input rejected; confirmed replacement and Undo worked |
| `print-card` | `npm test -- --grep @claim:print-card` | PASS — all 3 sample names printed |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — real record persisted with same-origin traffic only |
| `log-updates-count` | `npm test -- --grep @claim:log-updates-count` | PASS — 42 → 0, stored history, disabled zero state |
| `refill-reminder` | `npm test -- --grep @claim:refill-reminder` | PASS — status checked above, at, and below 30 |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — one-click samples, reset-on-exit, untouched real data |
| `free-to-use` | `npm test -- --grep @claim:free-to-use` | PASS — add/log completed without purchase controls or billing traffic |
| `undo-window` | `npm test -- --grep @claim:undo-window` | PASS — both Undo paths visible at 29,999 ms and absent at 30,000 ms |
| `edit-device` | `npm test -- --grep @claim:edit-device` | PASS — changed details remained after reload |

The live landing, application routes, README, metadata, and catalog copy were
cross-checked against this inventory. Every capability, privacy, offline,
price, export, demo, reminder, edit, and quantitative Undo sentence is listed.
Safety instructions and limitations do not claim product performance. There
is no unlisted or untested claim.

## Structure, routing, accessibility, and identity

- `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200 with one `h1`,
  one `main`, a skip link, and consistent header/footer. Their titles were
  “Dose Count Compass — Count medicine doses”, “Demo — Dose Count Compass”,
  “Dose Count Compass — Track device doses”, “Privacy — Dose Count Compass”,
  and “Terms — Dose Count Compass”.
- Every route had its own description, canonical, Open Graph title/URL/image,
  Twitter metadata, favicon, and shared legal links. The social image is a
  product-specific 1200 × 630 SVG; the home artwork is documented original art.
- Direct links and reloads retained the route. Client navigation and Back
  focused the destination `h1` and announced “Now viewing: Three devices,
  counted for you.”
- Every discovered link across all five routes returned 200, including the
  external Param Factory product-listing link. Robots, sitemap, manifest,
  icons, and artwork also resolved.
- Raw and browser navigation to `/review-6-missing` returned HTTP 404. The
  designed page used “Page not found”, the shared shell, and legal links. The
  suite also verifies the styled 404 under offline service-worker control.
- Security headers include self-only CSP with response-header
  `frame-ancestors 'none'`, `nosniff`, strict referrer policy, HSTS, and a
  restrictive Permissions-Policy. Hashed assets are immutable.
- `/opt/fleet/lib/verify-url.sh` passed live: 590 ms load, one `h1`,
  `lang="en"`, `main`, complete alt text and button names, and no console error.
  Playwright axe integration found no serious or critical issue on every route
  and the 404 in light and dark modes.
- The suite also passed keyboard add, dialog-return focus, import focus, 200%
  reflow, 390 px overflow, 44 px targets, and unique device-specific actions.
  CSS supplies visible focus and reduced-motion handling.
- Warm paper, clipped layered cards, a physical dose gauge, Georgia display
  type, and the medicine-cabinet diorama match `.factory/design.md`. The result
  is product-specific rather than a generic SaaS template.

## Earlier findings rechecked

Every earlier `review-*.md`, `polish-*.md`, and the prior handoff was read.
These results use current live behaviour and current code/tests, not prior
“fixed” labels.

| Earlier id | Current verification |
| --- | --- |
| F-1-1 | Fixed — “backup file” is listed and proved at every public location. |
| F-1-2 | Fixed — no timing adjective; the count test runs 42 to zero and inspects storage. |
| F-1-3 | Fixed — landing uses listed browser-storage wording; traffic stayed same-origin. |
| F-1-4 | Fixed — shell says Online/Offline; offline logging survived reload. |
| F-1-5 | Fixed — README has no IndexedDB jargon; browser persistence is tested. |
| F-1-6 | Fixed — README uses the same listed browser-storage wording. |
| F-1-7 | Fixed — navigation and Back focused and announced the destination `h1`. |
| F-1-8 | Fixed — all five routes update canonical and social metadata. |
| F-1-9 | Fixed — 404 has shared navigation/footer and Privacy/Terms. |
| F-1-10 | Fixed — first-screen label is “PRIVATE DOSE COUNT”. |
| F-1-11 | Fixed — audience copy says “full medicine app”. |
| F-1-12 | Fixed — every README sentence is at most 15 words. |
| F-2-1 | Fixed — Start for real resets demo only and preserves the real record. |
| F-2-2 | Fixed — hero/footer/README count promise is tested through zero. |
| F-2-3 | Fixed — the landing action opens three populated samples in one click. |
| F-2-4 | Fixed — reminder is checked above, at, and below its chosen count. |
| F-2-5 | Fixed — raw and controlled online/offline missing routes return styled HTTP 404. |
| F-2-6 | Fixed — “Tracked devices” `h2` precedes device `h3` headings. |
| F-2-7 | Fixed — visitor copy uses “backup file” and “dose-history spreadsheet”. |
| F-2-8 | Fixed — visitor copy and forms use “refill reminder”. |
| F-2-9 | Fixed — preview heading names doses left and refill status. |
| F-2-10 | Fixed — first screen states storage, offline use, and free price. |
| F-3-1 | Fixed — `/log` document/social title uses the required product-first wording. |
| F-4-1 | Fixed — live and cached missing-page `h1` is “Page not found”. |
| F-5-1 | Fixed — `undo-window` inventories and measures both 30-second paths. |
| F-5-2 | Fixed — dose/edit controls have unique device-specific accessible names. |
| F-5-3 | Fixed — help names “device details”; edits persist through reload. |
| F-5-4 | Fixed — feedback says “Dose-history spreadsheet downloaded.” |
| F-5-5 | Fixed — README heading is “Run locally”. |
| F-5-6 | Fixed — privacy page provides a marked, live external destination. |

Earlier unnumbered verification defects are also still closed: no unsupported
paid offer, real/demo leakage, unsafe import/delete, incomplete CSV/print
assertion, focus/reflow defect, soft offline 404, undersized target, cache or
header defect, missing connection state, reminder validation issue, or empty
toast regression was found.

## Missed leverage

No missed-leverage finding is raised. Backup import/export, dose-history
spreadsheet export, and printable inventory cover the expected portability
paths. Cloud sync would contradict the current browser-only model unless made
optional. AI would disclose health-adjacent data without removing the need to
check the physical device, so it is not justified for this manual counter.

## Quality gates

From the fresh clone:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
12 exact claims.json commands  PASS — one matching test each
npm run lint                   PASS
npm test                       PASS — 27/27
npm run build                  PASS — dist/ produced
initial JavaScript             PASS — 20.46 kB raw / 7.40 kB gzip
```

## What would make this perfect

Nothing remains to change based on this complete review. A future feature
should be added only with equally plain copy, an isolated demo path, and an
observable claim test; it is not required for the current job-to-be-done.
