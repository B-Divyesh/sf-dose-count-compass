# Count medicine-device doses — independent review 7

- Reviewed: 2026-09-06 UTC
- Work order: `dose-count-compass-review-7`
- Live URL: <https://dose-count-compass.sociobot.in>
- Implementation candidate: `3e3b78cab86b9a8ed8c9afb3dfd5713f34b33392`
- Documentation base: `f4972f9a492b44d39d13011989c7694cc863fed5`
- Verdict: **FAIL**
- Findings: **0 blocking, 1 major, 0 minor**
- Untested public claims: **0**

The dose-counting job, isolated demo, local storage, downloads, print view,
offline use, routes, and recovery paths work. The product cannot pass because
its light-theme keyboard focus ring has only 1.94:1 contrast against the page.
The supplied accessibility contract requires at least 3:1.

## Finding

### F-7-1 — Keyboard focus rings do not meet the required light-theme contrast

- **Severity:** Major
- **Location:** live light theme; `src/style.css` focus rules and
  `.file-label:focus-within`
- **Observed evidence:** Focusing the live **Demo** link produced a 4px solid
  `rgb(230, 169, 61)` outline with a 3px offset. The adjacent page background
  was `rgb(251, 247, 237)`. Their measured WCAG contrast is **1.94:1**.
- **Scope:** the same `--sun` outline is used for buttons, links, inputs,
  selects, textareas, and the visible import control. It passes against the
  dark background at 7.50:1 but fails against the light background.
- **Impact:** keyboard users receive a focus change below the contract's 3:1
  designed-focus minimum throughout the default light treatment. Controls
  remain reachable and operable, so this is not classified as critical.
- **Required repair:** use separate light/dark focus tokens that each reach
  3:1 against adjacent colors. Add a browser test that computes the contrast
  of the focused indicator in both color schemes.

This finding reopens the focus-visibility part of the original independent
verification's keyboard finding. Focus order, dialog return, visible file
focus geometry, and 200% reflow are fixed; the earlier repair did not verify
the ring's contrast.

## First screen before scrolling

Fresh Chromium contexts with no site data opened the live page at 390 × 844
and 1440 × 900.

- **Job:** “Count doses before you run out.”
- **Audience:** “For people who track doses but do not need a full medicine
  app.”
- **First action:** “Try it with sample data,” next to “See three devices
  already counted.”

On the phone, the action ended at y=432 and the three privacy/offline/price
facts ended at y=593. On desktop, the action ended at y=476. Both views stayed
at scroll position zero, had no horizontal overflow, returned 200, used one
`h1` and one `main`, and made only same-origin requests. There were no console,
page, or request errors.

The first screen uses plain job and audience words. No audited landing or
README sentence exceeds 22 words or uses a banned marketing term. Terminology
stays consistent: device, doses left, refill reminder, backup file,
dose-history spreadsheet, and demo/sample data.

## Demo, normal use, boundaries, and recovery

All browser work used fresh disposable contexts. The temporary real record
existed only in that context's `real:dose-count-compass` IndexedDB database;
closing the context discarded it and did not change another user's data.

- One click opened `/demo` with Blue rescue inhaler at 42/200, Saline spray at
  86/120, and Travel injector at 1/2. The banner remained visible as “Demo —
  sample data, nothing is saved,” with **Reset demo** and **Start for real**.
- A real spray persisted through reload. It counted 2 → 1 → 0, showed the
  refill reminder at 1, showed “Empty — refill now” at zero, and disabled its
  log control.
- Invalid remaining/reminder values stayed in the dialog and announced:
  “Set whole-number counts: total at least 1, and refill reminder no higher
  than total.” Correcting the values saved normally.
- Demo logging changed Blue 42 → 41. Reset restored 42. Browser Back from the
  real list restored the sample list without exposing the real record.
  **Start for real** restored only the real record. `/?demo=1` normalized to
  `/demo`, restored Blue to 42, and did not show the real record.
- IndexedDB exposed exactly the separate `demo:dose-count-compass` and
  `real:dose-count-compass` databases in the exercised context.
- Invalid backup data was rejected without opening replacement confirmation.
  A valid backup named the one-for-three replacement before confirmation;
  Undo restored the three samples. Deleting Blue required named confirmation;
  Undo restored it.
- The live backup contained three devices. The reset sample spreadsheet had
  three device rows and four dose-log rows. The print view named all three
  samples.
- All six sample log/edit controls had unique, device-specific accessible
  names.

## Public claims

`.factory/claims.json` has 12 unique claims. Each has exactly one matching
`@claim:<id>` test. After `npm ci` in the clean checkout, every declared command
was run independently and passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — 42 → 41 survived offline reload |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS — 3 device and 5 dose-log rows after a new log |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS — all 3 samples present |
| `backup-import` | `npm test -- --grep @claim:backup-import` | PASS — invalid rejection, confirmation, replacement, Undo |
| `print-card` | `npm test -- --grep @claim:print-card` | PASS — all 3 samples present |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — real persistence and same-origin traffic |
| `log-updates-count` | `npm test -- --grep @claim:log-updates-count` | PASS — 42 → 0, stored log, disabled zero state |
| `refill-reminder` | `npm test -- --grep @claim:refill-reminder` | PASS — above, at, and below 30 |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — one-click samples, namespace separation, reset |
| `free-to-use` | `npm test -- --grep @claim:free-to-use` | PASS — add/log without purchase or billing traffic |
| `undo-window` | `npm test -- --grep @claim:undo-window` | PASS — import and deletion at 29,999/30,000 ms |
| `edit-device` | `npm test -- --grep @claim:edit-device` | PASS — changed details survived reload |

The live landing page, app routes, metadata, README, catalog description, and
status messages were cross-checked against the inventory. No missing, false,
incomplete, or untested public claim was found. The focus contrast defect is a
quality requirement, not an untested public capability claim.

## Accessibility, routes, privacy, and PWA

- `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200. Each had a
  route-specific title, description, canonical, Open Graph/Twitter title, one
  `h1`, one `main`, `lang="en"`, skip link, header, and footer.
- Client navigation and browser Back focused the destination heading and
  announced “Now viewing: Three devices, counted for you.”
- All internal links found on the standard routes returned 200. The privacy
  page contains the marked external Param Factory product-listing destination.
  It was not opened because this work order forbids connecting to another
  product.
- `/review-7-missing` returned an intentional HTTP 404 with “Page not found,”
  the shared shell, legal links, and a route home. The browser's expected
  failed-resource console line for that deliberate 404 is not a defect.
- The live privacy/real/demo/export/print flow made requests only to
  `dose-count-compass.sociobot.in`. There was no analytics, CDN, AI, billing,
  sign-in, or other third-party runtime request. Privacy questions have a
  marked destination; product data itself remains local and user-exportable.
- The manifest had no parse or installability errors. The active controlling
  worker was `/sw.js`. Offline mode showed “Offline,” accepted 42 → 41,
  retained 41 after a 200 offline reload, and returned the styled 404 with
  status 404 for a missing route. `registration.update()` completed. A
  controller-change event displayed “A new version is ready.”
- Keyboard order, Enter, Escape, dialog focus return, import-control focus,
  44px targets, 390px layout, and all five routes at 200% text size passed.
  Reduced motion resolved transitions and animations to 0.01ms. F-7-1 is the
  remaining focus-contrast failure.
- Playwright axe-core 4.10.3 found zero violations, including minor and
  moderate ones, across all five routes and the 404 in light and dark modes.
  The standalone axe CLI could not locate its own Chrome binary in this worker;
  the equivalent Playwright integration completed against the supplied
  browser.
- `/opt/fleet/lib/verify-url.sh` passed live: 778ms load, correct title/lang,
  one `h1`, one main landmark, complete image alt text, labeled buttons, and no
  console errors on the 200 page.

The product is a static local-first PWA. It has no backend, tenant, API health,
authentication, or rate-limited live endpoint. Tenant isolation, restart
persistence, and 429/`Retry-After` checks are therefore not applicable. It is
not a CLI, library, or desktop artifact. The paid-unlock contract is not
applicable because the product is free and exposes no purchase control. AI is
not justified for manual physical-device counting; backup, spreadsheet, and
print portability already cover the useful adjacent steps.

## Visual identity and performance

The paper-cut medicine-cabinet illustration, clipped paper cards, physical
count gauges, Georgia headings, warm paper palette, and dark treatment match
`.factory/design.md`. The image provenance is recorded. The reviewed phone and
desktop screens are product-specific and not a generic gradient/template
layout.

Fresh mobile Lighthouse results were Performance **99**, Accessibility
**100**, Best Practices **100**, and SEO **100**. FCP was 0.9s, LCP 1.2s, CLS
0, TBT 120ms, and transfer 50KiB. The clean build contained 20,458 bytes of
JavaScript (7.40KiB gzip), 10,585 bytes of CSS (3.24KiB gzip), and a 37,512-byte
hero image, within the product budgets.

## Candidate and live deployment

`3e3b78c` is the last commit that changes product code. Later commits through
documentation base `f4972f9` change only review/verification reports and the
handoff. A clean build from `f4972f9` therefore represents implementation
candidate `3e3b78c`.

Live SHA-256 values matched that build for `index.html`, hashed JS, hashed CSS,
`sw.js`, the manifest, hero image, 404 HTML/CSS, and print CSS. Home HTML
revalidates after 30 seconds; hashed assets are immutable for one year.
Responses include the self-only CSP with header-delivered
`frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, and a
restrictive Permissions-Policy.

## Earlier finding disposition

Every earlier review and verification finding was inspected. “Closed” below
means current live behavior or the current clean suite proves the repair;
prior labels were not accepted as evidence.

| Earlier finding | Current disposition |
| --- | --- |
| F-1-1 | Closed — backup wording is inventoried and the complete JSON download passes. |
| F-1-2 | Closed — count behavior is tested from 42 through zero without an unsupported timing word. |
| F-1-3 | Closed — landing storage wording is listed; the full live flow stayed same-origin. |
| F-1-4 | Closed — the shell reports Online/Offline and offline data survived reload. |
| F-1-5 | Closed — README uses tested browser-storage wording, not IndexedDB jargon. |
| F-1-6 | Closed — README uses the same tested storage boundary. |
| F-1-7 | Closed for route behavior — navigation and Back focus and announce the route heading. F-7-1 separately reopens indicator contrast. |
| F-1-8 | Closed — all five routes update canonical and social metadata. |
| F-1-9 | Closed — the 404 has the shared header/footer and legal links. |
| F-1-10 | Closed — the supporting label is the plain “PRIVATE DOSE COUNT.” |
| F-1-11 | Closed — audience copy says “full medicine app.” |
| F-1-12 | Closed — README sentences remain within the supplied word cap. |
| F-2-1 | Closed — leaving/re-entering demo resets samples and preserves only the disposable real namespace. |
| F-2-2 | Closed — the core count promise is listed and tested through zero. |
| F-2-3 | Closed — one click opens all three populated samples. |
| F-2-4 | Closed — refill status is checked above, at, and below the chosen count. |
| F-2-5 | Closed — controlled online/offline missing routes return styled HTTP 404. |
| F-2-6 | Closed — “Tracked devices” `h2` precedes device `h3` headings. |
| F-2-7 | Closed — visitor copy uses backup file and dose-history spreadsheet. |
| F-2-8 | Closed — visitor copy and forms use refill reminder. |
| F-2-9 | Closed — preview heading names doses left and refill status. |
| F-2-10 | Closed — first screen states storage, offline use, and free price. |
| F-3-1 | Closed — `/log` uses “Dose Count Compass — Track device doses.” |
| F-4-1 | Closed — live and cached missing-page heading is “Page not found.” |
| F-5-1 | Closed — both 30-second Undo paths are measured at the boundary. |
| F-5-2 | Closed — device controls have unique device-specific accessible names. |
| F-5-3 | Closed — help names device details and edits persist after reload. |
| F-5-4 | Closed — download feedback says “Dose-history spreadsheet downloaded.” |
| F-5-5 | Closed — README heading remains “Run locally.” |
| F-5-6 | Closed in product markup — privacy has a direct, marked external destination. External navigation was excluded by the work-order boundary. |

Earlier unnumbered verification defects are also closed for the removed paid
offer, demo/real namespace leak, broken demo query, unsafe import/delete,
incomplete CSV/print proof, soft 404, small touch targets, short cache policy,
missing response protections, missing connection state, invalid reminder
count, and empty toast. The original keyboard/reflow group is closed for
order, operation, return focus, file focus, and reflow, but **reopened for
focus-indicator contrast by F-7-1**.

## Clean-checkout commands

The clean checkout was `/tmp/dose-review7-t6JRWB` at documentation base
`f4972f9`.

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
12 exact claims.json commands  PASS — one matching test each
npm run lint                   PASS — tsc --noEmit
npm test                       PASS — 27/27
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

## Release decision

**FAIL.** There is one major finding and zero untested public claims. A future
review may declare PASS only after F-7-1 is repaired, the focus contrast is
measured in both themes, every claim command still passes, and the repaired
implementation is deployed.
