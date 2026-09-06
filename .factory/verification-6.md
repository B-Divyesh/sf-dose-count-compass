# Count medicine-device doses — independent verification 6

- Verified: 2026-09-06 UTC
- Work order: `dose-count-compass-verify-6`
- Live URL: <https://dose-count-compass.sociobot.in>
- Implementation candidate: `f9e96d315183c516be71d4e2e1e3e982d80621ab`
- Documentation base: `98297d547aab18782747fb78aa2791b286da85c9`
- Verdict: **PASS**
- Findings: **0 blocking, 0 major, 0 minor**
- Untested public claims: **0**

The live product completes the researched job: count doses in inhalers,
sprays, injectables, and other medicine devices before they run out. It is for
people who want a small private counter instead of a full medicine app. The
first action is **Try it with sample data**.

## First screen before scrolling

Fresh phone (390 × 844) and desktop (1440 × 900) browser contexts opened the
live home page at scroll position zero.

- Job: **Count doses before you run out**.
- Audience: **For people who track doses but do not need a full medicine app.**
- First action: **Try it with sample data**.
- Stated result: **See three devices already counted.**

On the phone, the action ended at y=432 and the privacy, offline, and free-use
facts ended at y=593. On desktop, the action ended at y=476. Both views kept
the action visible before scrolling, had no horizontal overflow, and showed
one `h1`, one `main`, and `lang="en"`. The page title was **Dose Count Compass
— Count medicine doses**. There were no console, page, or request errors.

The rendered landing and README copy was checked against the plain-words
contract and `.factory/claims.json`. The job, audience, actions, headings, and
terms are direct and consistent. No unlisted performance, privacy, price,
export, demo, or timing promise was found.

## Demo, normal use, boundaries, and recovery

All live browser work used fresh disposable contexts.

- One click opened `/demo` with Blue rescue inhaler at 42/200, Saline spray at
  86/120, and Travel injector at 1/2. Counts and refill states were already
  populated.
- The persistent label read **Demo — sample data, nothing is saved** and kept
  **Reset demo** and **Start for real** visible.
- A temporary real spray remained at 2 doses after demo logging, Reset demo,
  backup import and Undo, print, Start for real, and `/?demo=1` re-entry.
- Demo logging changed Blue from 42 to 41. Reset restored 42. Starting for real
  restored the real record. Re-entering through `/?demo=1` normalized to
  `/demo`, restored the original samples, and did not show the real record.
- IndexedDB used separate `real:dose-count-compass` and
  `demo:dose-count-compass` databases.
- Normal counting passed from 2 to 1 to 0. The card showed the refill reminder
  at 1, **Empty — refill now** at zero, and disabled further logging.
- An invalid remaining count above the total kept the edit dialog open and
  announced how to correct the whole-number counts. Corrected values saved.
- Invalid backup data was rejected without replacement. A valid one-for-three
  replacement required confirmation, and Undo restored all three samples.
- Deletion named the device, required confirmation, and Undo restored it.
- The live backup contained three devices. The reset spreadsheet contained
  three device rows and four existing dose-log rows. The print view named all
  three samples. The claim test adds a log and proves five spreadsheet log
  rows.
- Device dose and edit controls had unique device-specific accessible names.
- The clean suite measured both recovery paths: Undo was present at 29,999 ms
  and absent at 30,000 ms.

No existing user data was available to or changed by these fresh contexts.

## Public claims

`.factory/claims.json` contains 12 unique entries. Static inspection found
exactly one matching `@claim:<id>` test for every entry and no extra claim tag.
After `npm ci` in the clean candidate checkout, every declared command was run
separately and passed.

| Claim | Exact command | Observable result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — offline 42 → 41 survived reload |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS — 3 device rows and 5 dose-log rows |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS — all 3 samples were in the backup |
| `backup-import` | `npm test -- --grep @claim:backup-import` | PASS — invalid rejection, confirmation, replacement, and Undo |
| `print-card` | `npm test -- --grep @claim:print-card` | PASS — all 3 sample devices were present |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — real persistence and same-origin-only traffic |
| `log-updates-count` | `npm test -- --grep @claim:log-updates-count` | PASS — 42 → 0, stored history, and disabled zero state |
| `refill-reminder` | `npm test -- --grep @claim:refill-reminder` | PASS — status above, at, and below 30 |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — one-click samples, separate stores, reset, untouched real data |
| `free-to-use` | `npm test -- --grep @claim:free-to-use` | PASS — add and log without purchase controls or billing traffic |
| `undo-window` | `npm test -- --grep @claim:undo-window` | PASS — import and deletion at 29,999/30,000 ms |
| `edit-device` | `npm test -- --grep @claim:edit-device` | PASS — changed details survived reload |

The live landing page, app routes, status and dialog text, metadata, README,
and catalog description were cross-checked against this inventory. There are
**zero false, incomplete, missing, or untested public claims**.

## Accessibility and interaction

- Playwright axe-core 4.10.3 found **zero violations of any impact** on `/`,
  `/demo`, `/log`, `/privacy`, `/terms`, and the designed 404.
- The repaired 4px focus indicators were reached through the real Tab order
  and measured against adjacent rendered surfaces in light and dark themes.
  Ratios ranged from **5.15:1 to 7.50:1**, above the required 3:1.
- The focus measurements covered navigation, the dark demo bar, normal,
  warning and empty cards, Undo, a form input, the import control, and 404.
- The first Tab reached the skip link. Enter opened the add dialog. Escape
  closed it and returned focus to its trigger. The visible import label showed
  the focus indicator.
- Client navigation focused the destination heading and announced it in the
  polite route region. Browser Back behavior is covered by the full suite.
- Every regular route reflowed at 200% text in a 390px viewport without
  horizontal overflow. No visible control on those routes, the edit dialog,
  or the Undo state measured below 44 × 44 CSS pixels.
- Reduced motion resolved the tested transition to `0.01ms`. Nothing flashes,
  autoplays, or loops. The product does not request notification permission.
- `/opt/fleet/lib/verify-url.sh` passed in 567ms with the correct title,
  language, one `h1`, one main landmark, complete image alt text, labeled
  buttons, and no console errors.

## Routes, privacy, PWA, and expected 404

- `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200 with their own
  titles. Internal links found across those pages all returned 200.
- The privacy page has a direct external destination marked `rel="external"`.
  It was not opened because the work order forbids connecting to another
  product.
- `/verify6-intentional-missing` returned the expected HTTP 404. It rendered
  **Page not found**, the shared header/footer, legal links, and a route home.
  This deliberate status is passing evidence, not an error.
- The complete live real/demo/download/print flow made same-origin requests
  only. No analytics, CDN font/script, AI, billing, authentication, or other
  third-party runtime request appeared.
- The manifest has standalone display, a versioned start URL, matching theme
  colors, and 192/512 maskable icons.
- The active `/sw.js` uses cache `dose-compass-v9`, precaches the app shell and
  styled 404, calls `skipWaiting()` and `clients.claim()`, and removes older
  product caches.
- Offline demo logging changed 42 to 41 and retained 41 after reload. The
  connection state read **Offline**. The update check completed, and a
  controller change displayed **A new version is ready.**
- The privacy and terms routes were present and readable. There is no paid
  offer, backend, tenant, server data store, authentication, or product API.
  Backend isolation, restart, health, and 429/`Retry-After` checks are not
  applicable.

## Clean checkout, deployment, and performance

Clean checkout: `/tmp/dcc-verify6-clean.iCr5B7` at the implementation SHA.

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
12 exact claims.json commands  PASS — one matching test each
npm run lint                   PASS — tsc --noEmit
npm test                       PASS — 28/28 Playwright tests
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

The build contains 20,458 bytes of JavaScript (7.40 KiB gzip), 10,947 bytes
of CSS (3.31 KiB gzip), and a 37,512-byte hero image. Live `index.html`, JS,
CSS, service worker, manifest, hero, 404 HTML/CSS, and print CSS SHA-256 values
matched the candidate build.

Responses include a self-only CSP with header-delivered `frame-ancestors
'none'`, HSTS, `nosniff`, strict referrer policy, and restrictive permissions.
Hashed assets use one-year immutable caching.

Fresh mobile Lighthouse 13.0.1 results:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.76 s |
| Largest Contentful Paint | 1.05 s |
| Cumulative Layout Shift | 0 |
| Total Blocking Time | 42 ms |
| Transfer | 50 KiB |

## Earlier finding disposition

Every earlier verification, review, and repair report was inspected. The
dispositions below use the current clean suite and fresh live behavior.

| Earlier finding | Current evidence |
| --- | --- |
| F-1-1 | Closed — backup wording and every public location map to the complete JSON download test. |
| F-1-2 | Closed — the count claim runs the sample from 42 through zero without an unsupported timing word. |
| F-1-3 | Closed — landing privacy wording is listed; the full live flow stayed same-origin. |
| F-1-4 | Closed — the shell states Online/Offline and a new offline log survived reload. |
| F-1-5 | Closed — README uses tested browser-storage wording, not IndexedDB jargon. |
| F-1-6 | Closed — README uses the same tested browser-storage statement. |
| F-1-7 | Closed — navigation and Back focus and announce the route heading; current focus contrast also passes. |
| F-1-8 | Closed — all five routes update title, description, canonical, Open Graph, and Twitter metadata. |
| F-1-9 | Closed — the 404 has the shared navigation, footer, Privacy, and Terms links. |
| F-1-10 | Closed — the first-screen supporting label is **PRIVATE DOSE COUNT**. |
| F-1-11 | Closed — audience copy says **full medicine app**. |
| F-1-12 | Closed — README capability sentences remain short and separately claim-covered. |
| F-2-1 | Closed — Start for real resets only demo data and preserves the real record. |
| F-2-2 | Closed — hero, dashboard, footer, README, and catalog count wording is tested through zero. |
| F-2-3 | Closed — the landing action opens all three populated samples in one click. |
| F-2-4 | Closed — reminder status passes above, at, and below the chosen count. |
| F-2-5 | Closed — controlled online and offline missing routes return the styled HTTP 404 without resource errors. |
| F-2-6 | Closed — **Tracked devices** `h2` precedes device `h3` headings. |
| F-2-7 | Closed — visitor copy consistently uses **backup file** and **dose-history spreadsheet**. |
| F-2-8 | Closed — visitor copy and forms use **refill reminder** and a specific refill action. |
| F-2-9 | Closed — the preview heading is **Check doses left and refill status**. |
| F-2-10 | Closed — the first screen states browser storage, offline use, and free price. |
| F-3-1 | Closed — `/log` uses **Dose Count Compass — Track device doses** for document and social titles. |
| F-4-1 | Closed — the live and cached missing-page heading is **Page not found**. |
| F-5-1 | Closed — both 30-second Undo paths pass the 29,999/30,000 ms boundary. |
| F-5-2 | Closed — dose/edit actions have unique device-specific accessible names. |
| F-5-3 | Closed — help names device details and a full edit persists after reload. |
| F-5-4 | Closed — feedback says **Dose-history spreadsheet downloaded.** |
| F-5-5 | Closed — the README heading is **Run locally**. |
| F-5-6 | Closed in product markup — privacy provides a direct, marked external destination; external navigation remained outside scope. |
| F-7-1 | Closed — rendered focus contrast is 5.15:1–7.50:1 in both themes on all tested surfaces. |

Earlier unnumbered findings remain closed: the unsupported paid offer is
absent; real/demo stores stay separate; `/?demo=1` works; imports and deletes
validate, confirm, and recover; CSV and print tests inspect complete output;
keyboard order, dialog return, file focus, 200% reflow, and target size pass;
the PWA returns a real styled 404; immutable caching and response protections
are present; connection state is visible; refill input is bounded; and an
empty toast is not shown.

## Release decision

**PASS.** There are zero findings of every severity and zero untested public
claims. No product-code change is required.
