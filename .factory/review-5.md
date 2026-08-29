# Adversarial first-read review 5 — Dose Count Compass

- Reviewed: 2026-08-29 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Base: `59c9c2ff7d7314b326a7adf48401f3849eee21a3`
- Work order: `dose-count-compass-review-5`
- Verdict: **FAIL**

The first screen, demo sandbox, listed claims, core routes, and prior repairs
pass. The product still fails the required zero-finding standard. Two
visitor-facing promises are absent from the claims inventory, repeated device
controls have ambiguous accessible names, and three smaller copy defects
remain.

`.factory/brief.json` is not present in this checkout. Scope was therefore
checked against `AGENTS.md`, `.factory/design.md`, the current product and
README, and all earlier review, polish, verification, and handoff records.

## Findings

### Blocking

#### F-5-1 — The promised 30-second Undo window is not listed or timed by a claim test

- **Exact quote/location:** live import confirmation on `/demo` and `/log`,
  “You can undo this replacement for 30 seconds.” Live delete confirmation,
  “Delete Blue rescue inhaler? You can undo this for 30 seconds.” The same
  strings are emitted by `src/main.ts`.
- **Evidence:** `.factory/claims.json` says only “Imports a backup file with
  confirmation and Undo.” `@claim:backup-import` clicks Undo immediately. The
  delete/Undo test is untagged and also clicks immediately. No claim names the
  30-second limit, and no test observes Undo near or after that boundary.
- **Why this fails:** 30 seconds is a quantitative recovery promise. A person
  may rely on it after replacing or deleting health-adjacent records. The
  claims contract requires the stated number to be inventoried and measured.
- **Concrete fix:** add one claim such as “Undo remains available for 30
  seconds after import or deletion,” list both dialog locations, and add one
  tagged test covering both paths at the time boundary. Alternatively remove
  the duration from the UI and add a separate listed/tested deletion-Undo
  claim.

### Major

#### F-5-2 — Device-card controls do not identify the device they change

- **Exact quote/location:** `/demo` renders three buttons whose complete
  accessible name is “Edit”. Dose buttons are named only “Log 1 puff”, “Log 1
  spray”, and “Log 1 device”. `src/main.ts` emits no device-specific
  `aria-label` or association for these controls.
- **Evidence:** live accessible-name inspection returned three identical
  `Edit` buttons. The axe scan reports no automated violation, but a screen
  reader button list cannot distinguish which record each `Edit` changes. Two
  inhalers in a real list would likewise produce duplicate “Log 1 puff”
  controls.
- **Why this fails:** the action name does not name its target. A keyboard or
  screen-reader user can operate the button but cannot reliably choose the
  intended medicine device.
- **Concrete fix:** expose names such as “Log 1 puff for Blue rescue inhaler”
  and “Edit Blue rescue inhaler”, while retaining concise visible labels if
  desired. Add a test that creates two devices of the same type and checks
  every card action has a unique device-specific accessible name.

#### F-5-3 — “You can change it later” is ambiguous and unlisted

- **Exact quote/location:** Add/Edit device help text, “Use the total count
  printed on the device. You can change it later.”
- **Evidence:** “it” can mean the total count or the device. No
  `.factory/claims.json` entry covers editing a saved device. Existing tests
  open the Edit dialog, but none changes details, saves, reloads, and verifies
  the change.
- **Why this fails:** the sentence makes a useful product promise without a
  defined object or repeatable proof.
- **Concrete fix:** either remove the second sentence, or rewrite it as “You
  can edit the device details later” and add an `edit-device` claim whose test
  changes a saved device and confirms the result after reload.

### Minor

#### F-5-4 — The download confirmation reintroduces file-format jargon

- **Exact quote/location:** toast after **Download dose history**, “CSV
  downloaded.”
- **Why this fails:** the rest of the visitor UI consistently uses
  “dose-history spreadsheet”. Switching to “CSV” after the action breaks the
  documented terminology and makes a non-technical visitor translate the
  result.
- **Concrete fix:** rewrite the toast as “Dose-history spreadsheet
  downloaded.”

#### F-5-5 — The README heading “Run” is unclear out of context

- **Exact quote/location:** `README.md`, `## Run`.
- **Why this fails:** a screen-reader heading list does not say whether this
  means run tests, run a build, or run the product.
- **Concrete fix:** rename it **“Run locally”**.

#### F-5-6 — The privacy contact instruction has no usable destination

- **Exact quote/location:** `/privacy`, “For a privacy question, contact the
  Param Factory through its product listing.” No link or contact address is
  present in that sentence, the page, or the footer.
- **Why this fails:** a person with a privacy question is told to use a place
  they cannot open from the page.
- **Concrete fix:** link “Param Factory product listing” to the verified
  listing URL, or replace the sentence with a working support email/link and
  include it in the link crawl.

## Cold first read

Fresh Chromium contexts with no site data opened the live home page at
390 × 844 and 1440 × 900. Before scrolling, both answered all three required
questions:

- **What it does:** “Count doses before you run out.”
- **For whom:** “For people who track doses but do not need a full medicine
  app.”
- **What to click first:** “Try it with sample data.” The adjacent sentence
  says, “See three devices already counted.”

At 390 px the headline ended at y=284, the audience sentence at y=360, the
44 px primary action at y=432, its stated result at y=480, and all three facts
at y=593. The page had no horizontal overflow or console/page error. The
desktop primary action ended at y=476. This mandatory gate passes.

## Copy audit

Words below are whitespace-separated rendered words. Headings, navigation,
actions, labels, alt text, and footer copy are included. Isolated numeric UI
values are not sentences. No landing or README line exceeds 22 words, and no
banned marketing adjective appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | clear action |
| Dose Count Compass | 3 | product name |
| Demo | 1 | clear navigation label |
| My devices | 2 | clear navigation label |
| Privacy | 1 | clear navigation label |
| Online | 1 | factual state |
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
| Download a backup file or dose-history spreadsheet from your device list. | 11 | export claims |
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
| Built by Param Factory · v1.2.2 | 6 | build attribution |

The landing uses **device**, **doses left**, **refill reminder**, **backup
file**, **dose-history spreadsheet**, and **demo/sample data** consistently.
The primary action names its result. No landing-copy finding remains.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Dose Count Compass | 3 | document title |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | `log-updates-count` |
| It is for people who track doses but do not need a full medicine app. | 15 | clear audience |
| It is free to use. | 5 | `free-to-use` |
| Saved in your browser. | 4 | `local-only` |
| It works offline after the first visit. | 7 | `offline-reload` |
| Download a backup file or dose-history spreadsheet. | 7 | export claims |
| Import a backup with confirmation and Undo. | 7 | `backup-import` |
| Print an inventory card. | 4 | `print-card` |
| Try three separate sample devices at `/?demo=1`. | 7 | `demo-isolation` |
| Run | 1 | **F-5-5: unclear heading** |
| Test and build | 3 | clear heading |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | developer instruction |
| Preview it with `npm run preview`. | 6 | developer instruction |
| Deploy | 1 | clear heading in deployment documentation |
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

There is no term drift or jargon in the audited landing/README copy. F-5-4
concerns a post-action product toast outside those two surfaces.

## Demo, sandbox, and live behaviour

- One click on **Try it with sample data** opened `/demo`. Its first rendered
  product screen had the persistent “Demo — sample data, nothing is saved”
  banner, **Reset demo**, **Start for real**, and three populated devices:
  Blue rescue inhaler at 42/200, Saline spray at 86/120, and Travel injector
  at 1/2.
- In a fresh context, a real `Review 5 real inhaler` at 8/8 was added first.
  Demo showed no real record. Logging changed Blue 42 → 41; Reset returned it
  to 42. After another demo change, Start for real restored the untouched real
  record. Re-entering `/demo` restored Blue to 42.
- IndexedDB inspection showed `Review 5 real inhaler` only in
  `real:dose-count-compass` and the three original samples only in
  `demo:dose-count-compass`.
- After service-worker control, a fresh demo changed 42 → 41 offline and
  retained 41 through an offline reload. An offline unknown route returned
  the styled “Page not found” document with HTTP 404.
- The live real/demo/offline flow made same-origin requests only. There were
  no analytics, third-party scripts/fonts, model calls, or embedded provider
  credentials.

The mandatory demo and isolation gate passes.

## Claims

The repository contains ten unique claims and exactly one matching
`@claim:<id>` test for each. From clean clone
`/tmp/dcc-review5-clean.CeToWW` at the reviewed base, `npm ci` succeeded and
every exact command in `.factory/claims.json` passed independently:

| Claim | Result | Observed proof |
| --- | --- | --- |
| `offline-reload` | PASS | Logged 42 → 41 offline and retained 41 after reload. |
| `csv-export` | PASS | Download contains three device rows and five dose-log rows. |
| `json-export` | PASS | Backup contains all three sample devices. |
| `backup-import` | PASS | Invalid data is rejected; valid replacement confirms; immediate Undo restores the prior list. |
| `print-card` | PASS | Printable card contains all three samples. |
| `local-only` | PASS | A real record persists in IndexedDB with no cross-origin request. |
| `log-updates-count` | PASS | Blue counts 42 → 0, logs persist, zero disables the control. |
| `refill-reminder` | PASS | Status changes above, at, and below 30. |
| `demo-isolation` | PASS | Hero entry, separate namespaces, reset-on-exit, and untouched real data pass. |
| `free-to-use` | PASS | Add/log works with no purchase control or billing request. |

F-5-1 and F-5-3 are unlisted-claim findings. No listed claim test failed.

## Structure, routing, accessibility, and identity

- `/`, `/demo`, `/log`, `/privacy`, and `/terms` return 200. The designed
  missing route returns HTTP 404 online and offline. All discovered navigation
  destinations and required assets (`robots.txt`, sitemap, manifest, icons,
  social image, artwork, and stylesheets) resolve as expected.
- Every checked page has `lang="en"`, one `h1`, one `main`, an ordered heading
  outline, a route-specific title, description, canonical, Open Graph/Twitter
  metadata, favicon, shared header, and footer with Privacy and Terms.
- Client navigation and Back both focus the destination `h1` and announce
  “Now viewing: Three devices, counted for you.” Deep links and reloads retain
  the correct route.
- The factory `verify-url.sh` passed: HTTP 200, 620 ms load, no console error,
  one `h1`, `lang`, `main`, alt text, and button names present.
- Live axe-core checks found zero serious/critical violations across all five
  routes and the 404 in light and dark colour schemes. At 390 px there was no
  overflow and no visible target below 44 × 44 px. At 390 px with a 200% root
  font size, there was still no horizontal overflow or off-screen control.
  F-5-2 is a manual accessible-name defect that axe does not identify.
- The warm paper, ink, moss, coral, clipped-card, physical-gauge treatment and
  original paper-cut cabinet artwork match `.factory/design.md`. The product
  is visually distinct from a generic SaaS template.
- Live JavaScript and CSS SHA-256 values match the clean-clone production
  build. JavaScript is 19,510 bytes raw / 7.12 kB gzip; CSS is 10,585 bytes raw
  / 3.24 kB gzip. Security headers include self-only CSP with
  `frame-ancestors 'none'`, `nosniff`, referrer policy, HSTS, and restrictive
  Permissions-Policy. Hashed assets use one-year immutable caching.

## Earlier findings rechecked

Every earlier `review-*.md`, `polish-*.md`, verification report, and the prior
handoff was read. Results below come from current live behaviour and current
code/tests, not the prior “fixed” labels.

| Earlier finding | Current result and fresh evidence |
| --- | --- |
| F-1-1 | Fixed: visitor copy says “backup file”; JSON claim lists and tests landing download. |
| F-1-2 | Fixed: count claim and test run a device from 42 to zero. |
| F-1-3 | Fixed: landing uses the listed browser-storage wording; live traffic stayed same-origin. |
| F-1-4 | Fixed: shell says Online/Offline; a new offline log survived reload. |
| F-1-5 | Fixed: README no longer exposes IndexedDB jargon; real storage is tested. |
| F-1-6 | Fixed: README uses the listed browser-storage wording. |
| F-1-7 | Fixed: navigation and Back focused and announced the destination `h1`. |
| F-1-8 | Fixed: all five SPA routes update title, canonical, Open Graph, and Twitter metadata. |
| F-1-9 | Fixed: 404 has shared navigation/footer and Privacy/Terms. |
| F-1-10 | Fixed: first-screen label is “PRIVATE DOSE COUNT”. |
| F-1-11 | Fixed: audience copy says “full medicine app”. |
| F-1-12 | Fixed: no README sentence exceeds 22 words. |
| F-2-1 | Fixed: Start for real resets only demo state and preserves the real record. |
| F-2-2 | Fixed: hero/footer/README count promise is listed and tested through zero. |
| F-2-3 | Fixed: landing action opens all three populated samples in one click. |
| F-2-4 | Fixed: refill claim verifies above, at, and below the chosen count. |
| F-2-5 | Fixed: controlled online/offline missing routes return styled HTTP 404. |
| F-2-6 | Fixed: “Tracked devices” `h2` precedes device `h3` headings. |
| F-2-7 | Fixed: primary visitor copy says backup file and dose-history spreadsheet. F-5-4 is a newly found status-toast inconsistency. |
| F-2-8 | Fixed: primary copy and forms use “refill reminder”. |
| F-2-9 | Fixed: preview heading names doses left and refill status. |
| F-2-10 | Fixed: first screen shows privacy, offline, and free facts. |
| F-3-1 | Fixed: `/log` title and social title are “Dose Count Compass — Track device doses”. |
| F-4-1 | Fixed: live and cached 404 heading is “Page not found”. |
| Verification: broken paid offer | Fixed: no paid offer, purchase link, or billing request remains. |
| Verification: demo/real leakage and broken query entry | Fixed: separate databases, Back handling, and `/?demo=1` pass. |
| Verification: unsafe import/delete loss | Fixed for validation, confirmation, and immediate Undo. F-5-1 concerns the newer untested duration promise. |
| Verification: weak CSV/print tests | Fixed: full device/log rows and all printed samples are asserted. |
| Verification: keyboard, import focus, dialog focus, and 200% reflow | Fixed in the full suite and fresh live reflow check. |
| Verification: missing page | Fixed: styled HTTP 404 works online and under service-worker control. |
| Verification: undersized targets | Fixed: live 390 px controls meet 44 px minimums. |
| Verification: non-immutable assets | Fixed: hashed JS/CSS use immutable caching. |
| Verification: frame and permissions headers | Fixed: live headers contain both protections. |
| Verification: missing connection state | Fixed: Online/Offline status is present. |
| Verification: reminder above total | Fixed: validation and regression test pass. |
| Verification: visible empty toast | Fixed: toast is hidden until a status exists. |
| Verification: initial and dialog-return focus | Fixed: skip-link order and return focus pass. |

No earlier numbered finding is reopened. F-5-1 through F-5-6 are new gaps
found by rerunning the full checklist.

## Quality gates

From the clean clone:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
10 exact claims.json commands  PASS — one test each
npm run lint                   PASS
npm test                       PASS — 23/23
npm run build                  PASS — dist/ produced
```

## Missed leverage

No additional AI or sync feature is justified. This is a local, manual
health-adjacent counter; sending device data to a model would add disclosure
without removing the need to verify the physical device. Backup import/export,
dose-history export, and a printable inventory already cover the obvious
portability needs. No missed-leverage finding is raised.

## What would make this perfect

Close F-5-1 through F-5-6: inventory and measure the 30-second recovery
promise, either prove or remove the edit-later promise, give every card action
a device-specific accessible name, keep the spreadsheet term in the success
toast, rename the README heading to “Run locally”, and add a direct privacy
contact link. Then rerun all ten exact claim commands, the complete suite,
clean build, live demo isolation/offline flow, route/link crawl, accessible
name inspection, and cold mobile/desktop read. A PASS requires zero findings.
