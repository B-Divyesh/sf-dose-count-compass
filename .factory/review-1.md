# Adversarial first-read review 1 — Dose Count Compass

- Reviewed: 2026-08-28 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Verdict: **FAIL**

The basic product path is clear and usable, but the claims inventory does not
cover several visitor-facing promises. The route-change accessibility contract
also fails. A pass requires zero findings.

## Cold first read

Fresh Chromium contexts were checked before scrolling at 390 × 844 and
1440 × 900. At both sizes, the first screen answers the three required
questions:

- It counts doses before a medicine device runs out.
- It is for people tracking inhalers, sprays, injectables, and similar devices
  without a full medication-management account.
- Click **“Try it with sample data”**; the adjacent text says it will show
  three already-counted devices.

The action is visible at 390 px (top 445 px, 44 px high) and at desktop. There
were no page or console errors. This check passes; it is not a blocking first
screen failure.

## Findings

### Blocking

#### F-1-1 — Unlisted export promise

- **Quote/location:** landing hero fact, “Export a backup any time”.
- **Why:** `.factory/claims.json` has a JSON-export claim only for “My devices
  data tools, README”. It does not list the hero or prove the unlimited
  “any time” wording. A visitor can rely on this export promise without a
  matching listed, observable claim.
- **Fix:** change the fact to “Export a JSON backup”; add `landing hero` to
  `json-export.where`. Alternatively add a separate, precisely testable claim
  for the intended availability.

#### F-1-2 — Unlisted immediate-update promise

- **Quote/location:** landing, “The remaining count changes at once.”
- **Why:** this is an observable behavior and “at once” is a timing promise;
  no claims entry or tagged test covers it.
- **Fix:** use “Log each use to update the count.” Add a `log-updates-count`
  claim whose sandbox logs a sample use and asserts the displayed remaining
  count and stored record. If immediacy is retained, state and test a measured
  time limit.

#### F-1-3 — Unlisted landing privacy promise

- **Quote/location:** landing privacy section, “Your devices stay on this
  device unless you export them.”
- **Why:** this is a privacy/data-boundary claim. `local-only` is worded
  “Saved on this device”, is located only in the hero, and its test observes
  the demo flow rather than this real-data promise.
- **Fix:** either use the exact listed claim text and include this location in
  its `where`, or add a real-mode local-storage/network-interception claim
  that proves the stated boundary.

#### F-1-4 — Unlisted connection-state storage promises

- **Quote/location:** landing shell, “Online — changes stay on this device.”
  and “Offline — changes still save on this device.”
- **Why:** both are visitor-facing persistence promises. The offline-reload
  claim proves that the demo page reloads offline, not that a new offline dose
  log saves and survives a reload. No claim entry lists either status message.
- **Fix:** add explicit real/demo storage claims. The offline test must log a
  dose while offline, reload while offline, and confirm that the reduced count
  remains; list the status-message location.

#### F-1-5 — Unlisted README browser-storage claim

- **Quote/location:** README, “The app stores records in browser IndexedDB.”
- **Why:** this tells a visitor where sensitive medicine records reside, but
  no `claims.json` entry names or tests that assertion.
- **Fix:** add a browser-storage claim that creates a real record, reloads,
  and verifies browser-only storage plus same-origin-only traffic; list README
  as its location. Prefer plain copy such as “The app saves records in your
  browser.”

#### F-1-6 — Unlisted README data-boundary promise

- **Quote/location:** README, “Device data stays in the browser unless you
  choose to export it.”
- **Why:** this is separate privacy wording with no exact claims entry or
  real-mode proof. The existing demo-only network test does not cover it.
- **Fix:** add this wording and README to a tested real-data privacy claim, or
  replace it with the exact, fully-covered privacy wording after strengthening
  that test.

### Major

#### F-1-7 — Route changes do not move focus to the new heading or announce it

- **Location/evidence:** after live client-side navigation `/` → `/demo` and
  after Back from `/log` → `/demo`, `document.activeElement` was `BODY`.
  `src/main.ts` calls `document.querySelector("h1")?.focus()`, but the rendered
  `<h1>` elements have no `tabindex="-1"`; the only `aria-live` node is the
  empty toast, not a route announcement.
- **Why:** keyboard and screen-reader users receive neither the required new
  page focus nor a meaningful route change announcement.
- **Fix:** give each route h1 `tabindex="-1"`, focus it after rendering, and
  update a dedicated polite live region with the route heading. Add a browser
  test for link navigation and Back that asserts the active element and the
  announcement text.

### Minor

#### F-1-8 — Non-home routes retain the home canonical and static social metadata

- **Location/evidence:** live `/demo`, `/log`, `/privacy`, and `/terms` each
  expose `<link rel="canonical" href="https://dose-count-compass.sociobot.in/">`.
  `index.html` supplies one static canonical and no `og:url`, `twitter:title`,
  or `twitter:description`; route rendering changes only `document.title`.
- **Why:** real URLs are rendered as canonical home content and route shares
  cannot describe the page reached.
- **Fix:** update canonical, Open Graph URL/title/description, and Twitter
  title/description on every route (or serve route-specific documents).

#### F-1-9 — The designed 404 lacks the required shared shell

- **Location/evidence:** `public/404.html` has only a wordmark header and no
  navigation, footer, Privacy, or Terms links.
- **Why:** a visitor arriving at a missing URL cannot use the product’s
  consistent site navigation or reach its legal/privacy information.
- **Fix:** use the shared header (wordmark, Demo, My devices, Privacy) and
  footer (Privacy, Terms, Param Factory/version) on the 404 while keeping its
  existing styled recovery action.

#### F-1-10 — A first-screen eyebrow uses unexplained product jargon

- **Quote/location:** landing hero eyebrow, “OFFLINE DEVICE COUNTER”.
- **Why:** “device counter” is not the visitor’s job language and provides no
  clearer instruction than the headline.
- **Fix:** remove it, or use “PRIVATE DOSE COUNT”.

#### F-1-11 — The audience copy uses jargon twice

- **Quote/location:** landing lead and README, “medication-management
  account”.
- **Why:** a cold visitor need not know this category to decide whether the
  product is for them.
- **Fix:** use “For people who track doses but do not need a full medicine
  app.” Keep the same term if a specific regulated account product is meant,
  and explain it.

#### F-1-12 — README exceeds the 22-word cap and bundles four promises

- **Quote/location:** README, “It works offline after the first visit, exports
  JSON backups and dose-log CSV files, prints an inventory card, and includes
  an isolated sample-data demo at `/demo`.” (26 words)
- **Why:** this is hard to scan and combines offline, export, print, and demo
  behavior in one sentence.
- **Fix:** split it: “It works offline after the first visit. Export a JSON
  backup or dose-log CSV. Print an inventory card. Try sample data at
  `/demo`.” Ensure each retained promise is listed and tested.

## Copy audit

### Landing sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Online — changes stay on this device. | 6 | F-1-4 unlisted claim |
| Count doses before you run out | 7 | pass |
| For people tracking inhalers, sprays, injectables, and other medicine devices without a medication-management account. | 14 | F-1-11 jargon |
| See three devices already counted. | 5 | pass |
| Saved on this device | 5 | pass (listed claim) |
| Works offline after first visit | 5 | pass (listed claim) |
| Export a backup any time | 5 | F-1-1 unlisted claim |
| Original paper-cut illustration. | 3 | pass; provenance is in design.md |
| It does not show a real medicine. | 7 | pass |
| See the count, then take the next step | 9 | pass |
| Enough for now | 3 | pass |
| A refill threshold is set at 30 puffs. | 8 | pass (sample description) |
| Add a device. | 3 | pass |
| Enter the count printed on it. | 6 | pass |
| Log each use. | 4 | pass |
| The remaining count changes at once. | 6 | F-1-2 unlisted claim |
| Act at your threshold. | 4 | pass |
| Refill before the count reaches zero. | 6 | pass |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | pass |
| Check expiry dates separately. | 4 | pass |
| Your devices stay on this device unless you export them. | 10 | F-1-3 unlisted claim |
| Count physical doses before a device runs out. | 8 | pass |

Non-sentence landing phrases were also checked: “OFFLINE DEVICE COUNTER” is
F-1-10; “A SMALL INVENTORY”, “How dose counting works”, and “What this does
not do” make sense out of context. The primary button, **“Try it with sample
data”**, names its result; no landing button uses a generic verb.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | pass |
| It is for people who want a small private inventory, not a full medication-management account. | 15 | F-1-11 jargon |
| The app stores records in browser IndexedDB. | 7 | F-1-5 unlisted claim; `IndexedDB` jargon |
| It works offline after the first visit, exports JSON backups and dose-log CSV files, prints an inventory card, and includes an isolated sample-data demo at `/demo`. | 26 | F-1-12; claims otherwise listed |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | pass |
| Preview it with `npm run preview`. | 6 | pass |
| Use the count alongside the physical device indicator, prescription label, and pharmacist or clinician instructions. | 15 | pass |
| This is not medical advice. | 5 | pass |
| Device data stays in the browser unless you choose to export it. | 12 | F-1-6 unlisted claim |
| See `/privacy` and `/terms`. | 4 | pass |

No banned marketing adjective was observed. “Device” is consistently used for
the physical container; “inventory” and “device list” name the collection but
do not alter the individual-device term.

## Demo, claims, privacy, and behavior checks

- **Demo:** pass. The first click opens `/demo` with the three realistic sample
  devices immediately visible. The persistent “Demo — sample data, nothing is
  saved” banner, Reset demo, and Start for real controls are present. A fresh
  context with a real `Private real inhaler` showed no real record in demo;
  IndexedDB used separate `real:dose-count-compass` and
  `demo:dose-count-compass` databases. Reset restored three sample cards.
  `/?demo=1` redirected to `/demo` and showed the seeded dashboard.
- **Claim commands:** after a clean `npm ci`, all six exact commands in
  `.factory/claims.json` passed: `offline-reload`, `csv-export`, `json-export`,
  `print-card`, `local-only`, and `demo-isolation`. The CSV test inspected
  three device rows and five dose-log rows after a log; print inspected all
  three sample names.
- **Network/offline:** live demo dose tracking made no cross-origin requests.
  The local offline-reload claim test passed from a fresh context. F-1-4 still
  applies because it does not prove the stronger live status-message promise
  of saving a newly logged offline change through reload.
- **Missed leverage:** no additional AI, sync, or import/export feature is
  required by the local-first dose-counting scope. JSON import/export and CSV
  export already exist; an AI step would not improve this job enough to justify
  sending health-adjacent data.

## Structure and accessibility checks

- Live `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200; the
  missing route returned a styled HTTP 404. All discovered internal links,
  sitemap routes, robots, manifest, icons, and social image returned 200.
- Titles follow the expected pattern, each regular route has one h1, and the
  home description, language, main landmark, favicon, 1200 × 630 social SVG,
  CSP, and security headers are present. F-1-8 and F-1-9 remain.
- Direct deep links and Back restore the correct visual route and demo
  namespace. F-1-7 remains for focus and announcement.
- Live axe-core scans of `/`, `/demo`, `/log`, `/privacy`, `/terms`, and the
  missing route reported no serious or critical violations. At 390 px, no
  horizontal overflow or visible sub-44 px interactive controls were found.
- The paper-cut cabinet art, clipped cards, warm paper palette, and Georgia /
  system type pairing are distinct from a generic SaaS template and match
  `.factory/design.md`.

## Earlier findings rechecked

`verification.md` is the only earlier finding-bearing factory review record;
`verification-2.md` and the existing handoff reported a later pass. Each
original issue was rechecked on the live site and in the current code:

| Earlier finding | Result now | Evidence |
| --- | --- | --- |
| Critical — broken paid purchase / absent paid unlock | fixed | No purchase offer or paid-feature promise is rendered; test confirms unsupported offer is absent. |
| Major — demo displayed real data on Back | fixed | Live real → demo → real → Back kept the correct isolated namespace; claim test passes. |
| Major — unsafe import/delete loss | fixed | Current code schema-validates, confirms replacement/deletion, and supplies Undo; tests pass. |
| Major — CSV/print claim tests too weak | fixed | CSV asserts device and five log rows; print asserts all sample records. |
| Major — keyboard, import focus, 200% reflow | fixed | Current tests pass and mobile has no overflow. |
| Medium — non-404 missing page | fixed | `/not-a-real-page` returns HTTP 404 with the designed view. |
| Medium — undersized touch targets | fixed | 390 px visible-control test passes. |
| Medium — non-immutable hashed assets | fixed | Live assets use the immutable policy; current production route test asserts it. |
| Medium — missing frame protection / permissions policy | fixed | Live CSP includes `frame-ancestors 'none'`; Permissions-Policy is present. |
| Medium — no connection state | fixed | Live shell shows online/offline state (claim coverage is separately F-1-4). |
| Low — threshold could exceed total | fixed | Validation rejects it; test passes. |
| Low — permanently visible empty toast | fixed | Current toast is hidden until a message. |
| Low — initial/default focus and dialog return | fixed | Initial load preserves normal tab order; dialog Escape returns to its trigger. |

None of these earlier findings regressed. F-1-7 is a newly observed
route-change focus/announcement requirement, not the earlier dialog-return
focus defect.

## What would make this perfect

Close F-1-1 through F-1-12: make each visitor-facing promise exactly listed
and sandbox-proven, implement route heading focus plus announcement, complete
route metadata and the 404 shell, and simplify the two jargon-heavy copy
phrases. Then rerun the cold-read, all exact claim commands, live offline
write/reload, route-focus, metadata, and link-crawl checks from a fresh
browser context.
