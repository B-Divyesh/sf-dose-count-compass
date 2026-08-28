# Adversarial first-read review 3 — Dose Count Compass

- Reviewed: 2026-08-28 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Candidate: `9a719cddecc2acdd4d06e704c668880e3b27519a`
- Verdict: **FAIL**

The product is clear, tryable, and locally verified. One route still misses
the required title pattern. A zero-finding review cannot pass until that is
corrected.

## Cold first read

Fresh Chromium contexts with no prior product storage opened the live home
page at 390 × 844 and 1440 × 900. Before scrolling, both answered the required
questions:

- **What it does:** “Count doses before you run out”.
- **For whom:** “For people who track doses but do not need a full medicine
  app.”
- **What to click:** “Try it with sample data”; “See three devices already
  counted.” states the result.

At 390 px, the primary action occupied y=388–432 px (44 px high), so it and
its outcome were visible in the first screen. There was one `h1`, one `main`,
`lang="en"`, no horizontal overflow, and no page or console errors. This gate
passes; no blocking first-read finding is raised.

## Findings

### Minor

#### F-3-1 — The My devices title reverses the required product-title pattern

- **Quote/location:** live `/log` `<title>` and Open Graph title, “My devices
  — Dose Count Compass”. `src/main.ts`, `pageTitle()` returns the same string.
- **Why:** the route-specific title is meaningful, but it does not follow the
  required `Product — what it does` pattern. In a browser tab, history list,
  or shared preview, the product name is second and the title system is
  inconsistent with the home route, “Dose Count Compass — Count medicine
  doses”.
- **Concrete fix:** change the title and matching Open Graph/Twitter title to
  “Dose Count Compass — Track device doses”. Extend the route-metadata test to
  assert the exact `/log` title and social title.

## Copy audit

Words are whitespace-separated; hyphenated terms count as one. Every landing
and README sentence or visitor-facing phrase is listed below. No entry exceeds
22 words. No banned marketing adjective appears. The sole copy-system finding
is F-3-1, which concerns a route title rather than sentence length.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Online | 1 | factual connection state |
| PRIVATE DOSE COUNT | 3 | clear label |
| Count doses before you run out | 6 | `log-updates-count` |
| For people who track doses but do not need a full medicine app. | 13 | clear audience and change |
| Try it with sample data | 5 | result-naming primary action; `demo-isolation` |
| See three devices already counted. | 5 | `demo-isolation` |
| Saved in your browser | 4 | `local-only` |
| Works offline after first visit | 5 | `offline-reload` |
| Free to use | 3 | `free-to-use` |
| Original paper-cut illustration. | 3 | provenance is in `design.md` |
| It does not show a real medicine. | 7 | descriptive art clarification |
| A SMALL INVENTORY | 3 | clear label |
| Check doses left and refill status | 6 | clear section heading; count/reminder claims |
| Download a backup file or dose-history spreadsheet from your device list. | 11 | `json-export`, `csv-export` |
| Enough for now | 3 | sample status; `refill-reminder` |
| A refill reminder starts at 30 puffs. | 7 | `refill-reminder` |
| How dose counting works | 4 | clear heading |
| Add a device. | 3 | concrete step |
| Enter the count printed on it. | 6 | concrete step |
| Log each use. | 3 | `log-updates-count` |
| Update the count. | 3 | `log-updates-count` |
| Plan a refill at your chosen count. | 7 | `refill-reminder` |
| The card shows a refill reminder before zero. | 8 | `refill-reminder` |
| What this does not do | 5 | clear limitation heading |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | safety limitation, not a product promise |
| Check expiry dates separately. | 4 | safety instruction |
| Saved in your browser. | 4 | `local-only` |
| Count doses before a device runs out. | 7 | footer; `log-updates-count` |

The landing uses consistent terms: **device** for the physical container,
**doses left** for the count, **refill reminder** for the low-count prompt,
**backup file** for a full copy, **dose-history spreadsheet** for the CSV
download, and **demo/sample data** for the sandbox. Headings make sense out
of context. The landing's only button is the explicit result-naming action
“Try it with sample data”.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | `log-updates-count` |
| It is for people who track doses but do not need a full medicine app. | 15 | clear audience |
| It is free to use. | 5 | `free-to-use` |
| Saved in your browser. | 4 | `local-only` |
| It works offline after the first visit. | 7 | `offline-reload` |
| Download a backup file or dose-history spreadsheet. | 7 | `json-export`, `csv-export` |
| Import a backup with confirmation and Undo. | 7 | `backup-import` |
| Print an inventory card. | 4 | `print-card` |
| Try three separate sample devices at `/?demo=1`. | 7 | `demo-isolation` |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | developer documentation |
| Preview it with `npm run preview`. | 6 | developer documentation |
| Backup files use `.json`. | 4 | file-format documentation |
| Dose-history spreadsheet files use `.csv`. | 5 | file-format documentation |
| Use the count alongside the physical device indicator, prescription label, and pharmacist or clinician instructions. | 15 | safety instruction |
| This is not medical advice. | 5 | safety limitation |
| Saved in your browser. | 4 | `local-only` |
| See `/privacy` and `/terms`. | 4 | route references |

No README button label, heading, jargon, term drift, or >22-word sentence was
found. The file extensions are appropriately confined to the developer-facing
file-format section.

## Demo, claims, sandbox, and privacy

- The landing action opened `/demo` in one click. The first rendered demo
  screen already showed Blue rescue inhaler (42), Saline spray (86), and
  Travel injector (1), alongside their statuses.
- The persistent banner read “Demo — sample data, nothing is saved” and
  supplied **Reset demo** and **Start for real**. Changing Blue rescue inhaler
  to 41, starting for real, and returning to `/demo` restored 42. A real
  “Review real inhaler” record remained visible only on `/log`.
- The code uses distinct `demo:dose-count-compass` and
  `real:dose-count-compass` IndexedDB names. `startReal()` restores the sample
  namespace before loading real data. Demo UI operations therefore neither
  read nor write the real namespace.
- After service-worker control, an offline live demo log changed 42 to 41 and
  retained 41 after an offline reload.
- A full fresh-context live flow (real record, demo, reset, real exit, offline
  log/reload) made no cross-origin requests. There are no analytics, CDN
  fonts, third-party scripts, embedded provider keys, or AI calls.

### Claims from a clean clone

Fresh clone: `/tmp/dcc-review-3-20260828`, at the reviewed commit. `npm ci`,
`npm run lint`, and `npm run build` passed. Every exact command listed in
`.factory/claims.json` passed with one matching tagged test:

| Claim | Result |
| --- | --- |
| `offline-reload` | PASS |
| `csv-export` | PASS |
| `json-export` | PASS |
| `backup-import` | PASS |
| `print-card` | PASS |
| `local-only` | PASS |
| `log-updates-count` | PASS |
| `refill-reminder` | PASS |
| `demo-isolation` | PASS |
| `free-to-use` | PASS |

The complete clean-clone Playwright suite passed (23 tests). Its final
`test-results/.last-run.json` reports `"status": "passed"`. No listed claim
failed and no landing/README capability promise lacks an appropriate claim
entry. Safety limitations and instructions are not product capability claims.

## Structure, accessibility, and visual identity

- Live `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200. The
  missing route returned the designed shared-shell 404 with HTTP 404. Every
  discovered route, sitemap URL, robots file, manifest, favicon, touch icon,
  and social image resolved.
- Each route had one `h1`, a `main`, header/footer, skip link, canonical,
  description, Open Graph metadata, Twitter metadata, favicon, and an
  appropriate route title, except F-3-1. Deep links, browser Back, heading
  focus, and the polite “Now viewing” announcement worked after route change.
- The local test suite includes light/dark axe checks across all routes and
  404; it passed. Mobile 390 px reflow, 44 px targets, keyboard order,
  dialog-return focus, visible file-input focus, and reduced motion passed.
- The paper-cut medicine-cabinet art, warm paper/ink palette, clipped cards,
  physical-count gauge, and Georgia/system pairing match `design.md` and are
  recognizably product-specific rather than a generic SaaS template.
- The obvious portability features are present: backup import/export,
  dose-history export, and printable inventory. An AI feature would send
  health-adjacent data without improving the manual count, so no missed-AI or
  sync finding is raised.

## Earlier findings rechecked

Every prior finding record was read: `review-1.md`, `review-2.md`,
`verification.md`, `verification-2.md`, `polish-1.md`, `polish-2.md`, and the
prior handoff. The following confirms actual live behavior and current code,
not merely their repair notes.

| Earlier finding(s) | Result in this review | Evidence |
| --- | --- | --- |
| F-1-1 through F-1-6 | fixed | Public export, count, storage, offline, and README promises are now listed in the relevant claim entries; all matching tests pass. |
| F-1-7 | fixed | SPA navigation and Back move focus to the route `h1` and populate the polite route announcer. |
| F-1-8 | fixed | Regular SPA routes update canonical, description, Open Graph, and Twitter metadata. |
| F-1-9 | fixed | 404 has the shared header, footer, Privacy, and Terms links. |
| F-1-10 through F-1-12 | fixed | “PRIVATE DOSE COUNT”, “full medicine app”, and short README sentences are live. |
| F-2-1 | fixed | Demo exit resets samples; re-entry restores Blue rescue inhaler to 42 while real data remains separate. |
| F-2-2 through F-2-4 | fixed | Core-count, hero-demo, and refill-reminder claims include their public locations and exact tests. |
| F-2-5 | fixed | The service worker precaches `404.css` and emits cached missing responses with status 404; the controlled-PWA test passes. |
| F-2-6 | fixed | Populated dashboard headings are `h1` → “Tracked devices” `h2` → device `h3`s. |
| F-2-7 through F-2-10 | fixed | Visitor copy uses plain backup/reminder terms, a concrete preview heading, and privacy/offline/free first-screen facts. |
| Verification: paid offer, demo leakage, unsafe imports/deletes, weak exports | fixed | No paid offer is rendered; namespace isolation, confirmed import/delete Undo, and complete export/print assertions pass. |
| Verification: keyboard, reflow, targets, storage/network, policies | fixed | Full suite and live checks cover focus, 200% reflow, targets, offline persistence, same-origin requests, CSP, and headers. |
| Verification: missing page, cache, security, connection, threshold, toast | fixed | Styled HTTP 404 works online/offline; cache/policy/connection/validation/toast tests pass. |

No earlier finding is reopened. F-3-1 is newly found.

## What would make this perfect

Correct F-3-1, then rerun the exact route-metadata assertion, all ten claim
commands, full Playwright suite, cold mobile/desktop read, demo isolation
flow, offline reload, and live link/404 crawl. A PASS requires that title fix
and zero remaining findings.
