# Adversarial first-read review 2 — Dose Count Compass

- Reviewed: 2026-08-28 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Candidate: `9f163af5e8150f6de3e297b3e98c57d122c5b231`
- Work order: `dose-count-compass-review-2`
- Verdict: **FAIL**

The cold first screen and core counter work, and every listed claim command
passes. The product still fails this zero-finding review. Demo edits survive
“Start for real,” the installed PWA serves an incomplete soft 404, three
landing claims are not fully inventoried, and smaller structure/copy issues
remain.

## Cold first read

Fresh Chromium contexts were opened without prior product storage at 390 ×
844 and 1440 × 900. Before scrolling, both screens answered all three
questions:

- **What it does:** “Count doses before you run out.”
- **For whom:** “For people who track doses but do not need a full medicine
  app.”
- **What to click first:** “Try it with sample data,” followed by “See three
  devices already counted.”

At 390 px, the headline ended at 284 px, the audience sentence at 360 px, the
44 px action at 432 px, and the adjacent outcome at 480 px. All were inside
the 844 px first screen. Desktop also showed them without scrolling. There
were no console or page errors, and neither viewport overflowed horizontally.
This mandatory gate passes.

## Findings

### Blocking

#### F-2-1 — “Start for real” does not discard changed demo data

- **Quote/location:** demo banner, “Demo — sample data, nothing is saved”; demo
  control, “Start for real.”
- **Evidence:** in a fresh live context, the Blue rescue inhaler was changed
  from 42 to 41. After **Start for real**, returning to `/demo` still showed
  41. IndexedDB `demo:dose-count-compass` also still stored 41. In code,
  `start-real` only calls `navigate("/log")` (`src/main.ts:170`).
- **Why:** leaving demo mode is required to discard demo changes unless the
  visitor explicitly keeps them. Persisting them across “Start for real” is
  inconsistent with “nothing is saved” and makes the next demo session start
  from modified rather than known sample data. This is a weak demo and is
  blocking under the demo contract.
- **Fix:** on **Start for real**, reset or delete only the
  `demo:dose-count-compass` namespace before opening `/log`. Add a tagged test
  that changes a sample count, starts for real, re-enters `/demo`, and sees the
  original 42 while confirming real records are unchanged.

#### F-2-2 — The core headline/README behavior is not fully listed as a claim

- **Quote/location:** landing h1, “Count doses before you run out”; README,
  “Count doses in inhalers, sprays, injectables, and other medicine devices
  before they run out.”; footer, “Count physical doses before a device runs
  out.”
- **Evidence:** `claims.json` has `log-updates-count`, located only in the
  landing how-it-works section and worded “Log each use. Update the count.” It
  does not list the hero, footer, or README versions of the product’s core
  promise.
- **Why:** a visitor can rely on the headline as the main product capability.
  The existing tagged test proves one decrement, but the claims inventory
  does not connect that evidence to all three public locations.
- **Fix:** expand one precisely worded count claim to include the landing hero,
  footer, and README. Its tagged test should drive a sample device through
  repeated logs, including zero and the disabled-at-zero state.

#### F-2-3 — The hero’s promised one-click demo result is an unlisted claim

- **Quote/location:** landing hero, “See three devices already counted.”
- **Evidence:** `demo-isolation.where` lists the demo banner and README, not
  the landing hero. Its tagged test enters demo from `/log`; it never clicks
  the hero action. A separate untagged test covers `/?demo=1`, not this
  promise.
- **Why:** the sentence tells a cold visitor exactly what the first click will
  produce. Manual verification passed, but the claims contract requires the
  public promise and its location to be listed and proven on every build.
- **Fix:** list the hero outcome under `demo-isolation` or add a dedicated
  claim. The tagged test must start at `/`, click **Try it with sample data**,
  and assert the banner plus all three named devices on the first rendered
  demo screen.

#### F-2-4 — The landing advertises refill-threshold behavior without a claim

- **Quote/location:** landing preview, “A refill threshold is set at 30
  puffs”; how-it-works step, “Act at your threshold. Refill before the count
  reaches zero.”
- **Evidence:** no `claims.json` entry covers refill status or threshold
  behavior. The untagged validation test only rejects a threshold above the
  total; it does not prove the advertised sample status transition.
- **Why:** this is a functional reason to use the counter, not decorative
  sample text. A visitor can rely on it when deciding whether the product
  helps plan a refill.
- **Fix:** either remove the capability copy or add a claim and tagged test
  that logs a sample device across its chosen reminder count and verifies the
  visible status before, at, and below that count.

#### F-2-5 — The earlier real-404 repair is incomplete in the installed PWA

- **Quote/location:** missing route h1, “This shelf is empty”; service-worker
  navigation fallback in `scripts/write-sw.mjs:4`; 404 head in
  `public/404.html:3`.
- **Evidence:** a raw live request to an unknown URL returns HTTP 404. After
  the service worker controls the page, navigating to the same unknown URL
  returns HTTP 200 because the cached `/404.html` response is reused with its
  original 200 status. Offline, `/404.css` is not precached: the live missing
  route used Times New Roman, the recovery button became an unstyled inline
  link, `/404.css` failed with `net::ERR_FAILED`, and the console logged a
  resource error. The 404 document also lacks a meta description, canonical,
  Open Graph/Twitter metadata, and apple-touch icon.
- **Why:** the earlier `verification.md` finding “non-404 missing page” is only
  fixed at the hosting edge, not for the installed offline product. This is a
  broken deep route with a console error and incomplete required metadata.
- **Fix:** precache `404.css`; synthesize a cached missing-page `Response` with
  status 404 (or preserve a cached 404 response); add the route metadata; and
  test a controlled online navigation plus a controlled offline navigation.
  Both must render the designed shell with no console error and report 404.

### Major

#### F-2-6 — Device headings skip from h1 to h3

- **Location/evidence:** live `/demo` and populated `/log` have an h1 followed
  directly by device-card h3 elements. `deviceCard()` always emits `<h3>` at
  `src/main.ts:98`; the containing device grid has no h2.
- **Why:** the heading outline skips a level on the product’s main screen.
  Screen-reader heading navigation presents the sample devices as children of
  a section that has no heading.
- **Fix:** add a visible or visually hidden h2 such as “Tracked devices” to the
  grid and keep card names as h3, or make the card names h2 on dashboard
  routes. Add an outline assertion for both empty and populated dashboards.

### Minor

#### F-2-7 — File-format jargon appears in visitor copy and terms drift

- **Quote/location:** landing fact, “Export a JSON backup”; README, “Export a
  JSON backup or dose-log CSV”; dashboard buttons, “Export backup” and “Export
  CSV.”
- **Why:** `JSON` and `CSV` are implementation terms for a non-technical
  medicine-device audience. The same result is called “JSON backup” in copy
  and only “backup” on the action.
- **Fix:** use “Download a backup file” on the landing and button. Use
  “Download a backup file or dose-history spreadsheet” in the README, with the
  file extensions documented separately for technical readers.

#### F-2-8 — “Threshold” is unexplained jargon and produces a vague step

- **Quote/location:** “A refill threshold is set at 30 puffs” and “Act at your
  threshold.”
- **Why:** a first-time visitor must infer that “threshold” means the chosen
  count at which the card changes status. “Act” does not name the result.
- **Fix:** use “A refill reminder starts at 30 puffs” and “Plan a refill at
  your chosen count.” Use “refill reminder” in the form and status copy too.

#### F-2-9 — A landing heading does not make sense out of context

- **Quote/location:** preview h2, “See the count, then take the next step.”
- **Why:** in a screen-reader headings list, neither “the count” nor “the next
  step” names what the section contains.
- **Fix:** use “Check doses left and refill status.”

#### F-2-10 — The first-screen facts omit price/free status

- **Location/evidence:** the three hero facts are “Saved in your browser,”
  “Works offline after first visit,” and “Export a JSON backup.”
- **Why:** the required first-screen fact set covers privacy, offline use, and
  price. A cold visitor cannot confirm whether the product is free or leads to
  payment after setup.
- **Fix:** replace the export fact with “Free to use” if that is the intended
  offer, and list/test that offer claim. Keep export in the product preview.

## Copy audit

Words are counted as whitespace-separated words; hyphenated terms count as
one. No sentence exceeds 22 words. No banned marketing adjective appears.

### Landing-page sentences and sentence-like copy

| Copy | Words | Result |
| --- | ---: | --- |
| Count doses before you run out | 6 | F-2-2 |
| For people who track doses but do not need a full medicine app. | 13 | pass |
| See three devices already counted. | 5 | F-2-3 |
| Saved in your browser | 4 | listed claim |
| Works offline after first visit | 5 | listed claim |
| Export a JSON backup | 4 | listed claim; F-2-7 jargon |
| Original paper-cut illustration. | 3 | pass; provenance is documented |
| It does not show a real medicine. | 7 | pass |
| See the count, then take the next step | 8 | F-2-9 |
| Enough for now | 3 | pass; sample status |
| A refill threshold is set at 30 puffs. | 8 | F-2-4, F-2-8 |
| Add a device. | 3 | pass |
| Enter the count printed on it. | 6 | pass |
| Log each use. | 3 | listed claim |
| Update the count. | 3 | listed claim |
| Act at your threshold. | 4 | F-2-4, F-2-8 |
| Refill before the count reaches zero. | 6 | F-2-4 |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | pass |
| Check expiry dates separately. | 4 | pass |
| Saved in your browser. | 4 | listed claim |
| Count physical doses before a device runs out. | 8 | F-2-2 |

Landing headings/labels were also checked: “PRIVATE DOSE COUNT” (3), “A SMALL
INVENTORY” (3), “How dose counting works” (4), and “What this does not do”
(5) pass. The primary action “Try it with sample data” (5) is a result-naming
verb phrase. Navigation links are descriptive. No generic Submit, Go, or
Continue action appears on the landing page.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | F-2-2 |
| It is for people who track doses but do not need a full medicine app. | 15 | pass |
| Saved in your browser. | 4 | listed claim |
| It works offline after the first visit. | 7 | listed claim |
| Export a JSON backup or dose-log CSV. | 7 | listed claims; F-2-7 jargon |
| Print an inventory card. | 4 | listed claim |
| Try sample data at `/demo`. | 5 | listed demo claim |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | pass; developer instruction |
| Preview it with `npm run preview`. | 6 | pass; developer instruction |
| Use the count alongside the physical device indicator, prescription label, and pharmacist or clinician instructions. | 15 | pass |
| This is not medical advice. | 5 | pass |
| Saved in your browser. | 4 | listed claim |
| See `/privacy` and `/terms`. | 4 | pass |

### Terminology check

| Concept | Terms observed | Result |
| --- | --- | --- |
| Physical medicine container | device | consistent |
| Remaining quantity | count; doses left | understandable in context |
| Example mode | demo; sample data | consistent purpose |
| Full backup | JSON backup; backup | F-2-7 |
| Dose-history download | dose-log CSV; CSV | F-2-7 |
| Low-count reminder | refill threshold; threshold | F-2-8 |

## Demo, sandbox, and live behavior

- One click from the landing page opened `/demo` with the persistent banner
  and three realistic records: Blue rescue inhaler, Saline spray, and Travel
  injector. The first demo screen already showed counts and refill status.
- **Reset demo** restored the Blue rescue inhaler from 41 to 42.
- A real record named `Audit real inhaler` remained only in
  `real:dose-count-compass`; it was absent from the demo UI and the demo
  database. Browser Back restored the sample namespace correctly. The earlier
  real/demo leakage is fixed.
- F-2-1 remains: leaving demo does not discard changed demo state.
- In a fresh live context, logging offline changed 42 to 41 and the 41 count
  survived an offline reload. The complete observed app/demo traffic was
  same-origin. No analytics, CDN font, external script, or model request was
  observed.

## Claims verification

A clean clone at `/tmp/dcc-review-2.sGVSxp` was installed with `npm ci`. Every
exact command from `.factory/claims.json` was run independently:

| Claim id | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 1 test; offline log and reload retained 41 |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS, 1 test; 3 device rows and 5 dose-log rows |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS, 1 test; 3 sample devices |
| `print-card` | `npm test -- --grep @claim:print-card` | PASS, 1 test; all 3 sample names |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS, 1 test; real IndexedDB persistence and no cross-origin request |
| `log-updates-count` | `npm test -- --grep @claim:log-updates-count` | PASS, 1 test; visible and stored count/log changed |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS, 1 test; no real record in demo export |

No listed command failed. F-2-1 identifies a semantic gap in what the demo
test proves; F-2-2 through F-2-4 identify unlisted public promises.

## Structure, routing, accessibility, and identity

- Live `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200. All
  discovered internal links, `robots.txt`, `sitemap.xml`, manifest, favicon,
  touch icon, and 1200 × 630 social image resolved. Raw unknown URLs returned
  404; F-2-5 covers installed/offline routing.
- Regular routes have route-specific titles, descriptions, canonicals, Open
  Graph/Twitter metadata, one h1, `lang="en"`, and a main landmark. Deep links,
  client navigation, Back, h1 focus, and the polite route announcement worked.
- The 404 has the shared header/footer and a designed paper-cabinet recovery
  view, but F-2-5 covers its missing metadata, soft status under service-worker
  control, and unstyled offline state.
- Live axe scans on `/`, `/demo`, `/log`, `/privacy`, `/terms`, and the missing
  page reported no serious or critical violations. The complete local suite
  also passed light/dark axe sweeps, 390 px target sizing, keyboard paths, and
  200% reflow. F-2-6 remains an outline defect not reported at those axe
  severities.
- The paper-cut medicine cabinet art, clipped paper cards, warm ink/paper
  palette, and restrained counter motion match `.factory/design.md` and are
  visually distinct from a generic SaaS template. Reduced-motion handling is
  present.
- The production JavaScript is 19.14 KB raw / 7.03 KB gzip and CSS is 10.51 KB
  raw / 3.22 KB gzip. Live hashed assets use immutable caching. CSP,
  frame-ancestors, Permissions-Policy, HSTS, referrer policy, and `nosniff` are
  present.

## Earlier findings rechecked

### `.factory/review-1.md`

| Earlier id | Result now | Independent evidence |
| --- | --- | --- |
| F-1-1 | fixed | Hero says “Export a JSON backup”; JSON claim lists landing hero and passes. |
| F-1-2 | fixed | Copy says “Update the count”; tagged visible/storage test passes. |
| F-1-3 | fixed | Landing uses the listed browser-storage wording; real-mode interception passes. |
| F-1-4 | fixed | Connection copy is only Online/Offline; live offline write/reload passes. |
| F-1-5 | fixed | README no longer names IndexedDB; browser-storage claim covers it. |
| F-1-6 | fixed | README uses the same listed browser-storage wording. |
| F-1-7 | fixed | Live navigation and Back focus h1 and announce the route. |
| F-1-8 | fixed for listed SPA routes | `/demo`, `/log`, `/privacy`, and `/terms` update canonical/social metadata. F-2-5 separately covers 404 metadata. |
| F-1-9 | fixed for the shared shell | 404 now has shared nav/footer. F-2-5 separately reopens true installed/offline 404 behavior. |
| F-1-10 | fixed | Eyebrow is “PRIVATE DOSE COUNT.” |
| F-1-11 | fixed | Landing and README use “full medicine app.” |
| F-1-12 | fixed | README capability copy is split; no sentence exceeds 22 words. |

### Earlier `.factory/verification.md` defects

| Earlier defect | Result now |
| --- | --- |
| Broken purchase and absent paid unlock | fixed; the unsupported offer is absent |
| Demo displayed real data and `/?demo=1` failed | fixed for namespace/query/Back isolation; F-2-1 is a distinct demo-exit defect |
| Unsafe import and delete loss | fixed; validation, confirmation, and Undo tests pass |
| Weak CSV and print claim tests | fixed; complete row/content assertions pass |
| Keyboard order, import focus, dialog focus, 200% reflow | fixed; full suite passes |
| Missing page returned 200 | **half-fixed; reopened as F-2-5 under service-worker control** |
| Sub-44 px touch targets | fixed; 390 px test passes |
| Hashed assets lacked immutable caching | fixed live |
| Frame/permissions headers missing | fixed live |
| No connection state | fixed; Online/Offline status is present |
| Threshold could exceed total | fixed; validation test passes |
| Empty toast sliver | fixed; toast is hidden until used |
| Initial/default and dialog-return focus | fixed; keyboard tests pass |

`.factory/polish-1.md` and the prior handoff add repair assertions but no
additional findings. Their “known gaps: none” statement is contradicted by
F-2-1 through F-2-10 above.

## Missed leverage

No AI step is justified for this local, health-adjacent manual counter. It
would add data disclosure and cost without removing the need to verify the
physical device. JSON import/export, CSV history export, and a printable card
already cover the obvious portability paths. Cloud sync would conflict with
the current browser-only privacy promise unless introduced as a clearly
optional, separately claimed feature. No missed-leverage finding is raised.

## What would make this perfect

Close F-2-1 through F-2-10: discard demo changes on exit, inventory and tag
every public capability claim, make the service-worker 404 styled and truly
404 online/offline, repair the dashboard heading outline, replace file-format
and threshold jargon, name the preview section concretely, and state the
price/free status. Then rerun the cold mobile/desktop read, every exact claim
command, demo exit/re-entry, installed offline missing-route check, metadata
crawl, heading-outline assertion, and full accessibility/build suite from a
fresh clone. A PASS requires zero remaining findings and no untested claim.
