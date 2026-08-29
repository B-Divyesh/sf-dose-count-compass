# Independent verification 4 — PASS

**Candidate:** `c5bd3ff59f0cc49d354dce97b20f5291467d5a37` (`main`)  
**Production URL:** <https://dose-count-compass.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Scope:** independent release QA against the researched brief, factory work
order, and `.factory/claims.json`. Product code was not changed.

## Release decision

**PASS.** Fresh evidence shows that the live deployment is the tested
candidate and that the offline dose-counting job works end to end. No release
blocker was found.

### Cold first read

In a fresh 390px browser context, the first screen says **“Count doses before
you run out”**, says it is **“For people who track doses but do not need a full
medicine app,”** and has the visible one-click **“Try it with sample data”**
action alongside **“See three devices already counted.”** It also plainly
states the privacy, offline, and free-use facts. The required first-read and
demo-sandbox gates pass.

## Clean checkout gates

The checkout was clean at the candidate before testing. `npm ci` installed 20
packages with zero reported vulnerabilities. These commands passed:

```text
npm run lint                 PASS — tsc --noEmit
npm test                     PASS — 23/23 Playwright tests
npm run build                PASS — dist/ produced
```

All ten exact commands named by `.factory/claims.json` were first run from the
production-demo test entry point, as required. They all passed:

| Claim ID | Result | Observable assertion exercised |
| --- | --- | --- |
| `offline-reload` | PASS | Demo 42 → 41 survives offline reload. |
| `csv-export` | PASS | CSV contains all device and dose-log rows. |
| `json-export` | PASS | JSON backup contains all three samples. |
| `backup-import` | PASS | Invalid data is rejected; valid replacement confirms and Undo restores it. |
| `print-card` | PASS | Printable card lists the three sample devices. |
| `local-only` | PASS | Real record persists in IndexedDB with no cross-origin request. |
| `log-updates-count` | PASS | Blue inhaler counts 42 → 0, disables logging, and shows the empty state. |
| `refill-reminder` | PASS | Reminder begins at 30 and remains below the threshold. |
| `demo-isolation` | PASS | Demo and real IndexedDB namespaces stay separate; demo resets on re-entry. |
| `free-to-use` | PASS | Add-and-log flow has no purchase control or billing traffic. |

## Live deployment, privacy, and PWA

The live page loaded cold with status 200, no console/page errors, and only
same-origin HTML, JS, CSS, and `hero-diorama.webp` requests. A separate live
normal-use flow added a Spray, rejected a remaining count above its total with
the actionable count error, recovered after correction, logged one spray,
persisted it in `real:dose-count-compass`, and made no cross-origin request.

The service worker registered at the site root and controlled the page. In a
fresh live context, `/demo` loaded once online, then operated and reloaded
offline with the saved count retained in `demo:dose-count-compass`. Calling
`registration.update()` succeeded without error; its active worker is
`/sw.js`. Chromium parsed the deployed manifest with no manifest errors and
recognised standalone display, start URL, theme/background colours, and both
maskable icons.

There are no server-side product endpoints, authentication, payment, or
product-unlock calls. Rate-limit and Sociobot Entra checks are therefore not
applicable.

## Deployment integrity, headers, and budget

Fresh local `dist` files byte-match the deployment:

```text
assets/index-Dj1usNz2.js  32f357bc583b1a9112295e0b6df53c88737a64de10827a751678ddae5f0ab34a
assets/index-6GeMvAbO.css 062f84afca4a5da2486207997462d2531bc0bb18e1e584c30a0b956caabe79f9
sw.js                     ca7dc695897752b777dde52fc2f5136a1a29d446ec5ef4f6371c539734ae0614
```

The live responses have the expected self-only CSP, `X-Content-Type-Options:
nosniff`, strict-origin referrer policy, and restrictive permissions policy.
`/`, `/demo`, `/log`, `/privacy`, and `/terms` return 200; an unknown route
returns a styled real 404. Hashed JS/CSS and the hero image have
`public, max-age=31536000, immutable`; HTML and service worker revalidate after
30 seconds.

Build sizes: JavaScript 19,510 bytes raw / 7,146 bytes gzip; CSS 10,585 bytes
raw / 3,251 bytes gzip; hero image 37,512 bytes. These meet the static PWA
budgets. I attempted a fresh Lighthouse mobile run; the installed Chromium
target crashed during Lighthouse finalisation, so I do not report a synthetic
score from that failed tool run. The independent axe, browser, response, and
bundle checks above completed successfully.

## Accessibility and interaction

- Axe-core Playwright audit: zero serious or critical findings over `/`,
  `/demo`, `/log`, `/privacy`, `/terms`, and the 404, in both light and dark
  schemes.
- At 390 × 844, there was no horizontal overflow and no visible interactive
  control smaller than 44 × 44 CSS px.
- Keyboard Tab reaches the Skip to content link, with a designed 4px solid
  focus ring. The product suite also verifies Enter, Escape/focus return,
  labels, dialog handling, focus after route navigation, and 200% reflow.
- Reduced-motion media produces effectively instant transition and animation
  durations.
- Every checked route has `lang="en"`, a route-specific title, exactly one
  `h1`, and one `main`; all product links resolve successfully.

## Defects by severity

No defects found.

## Evidence notes

Relevant fresh commands and observations are recorded above. The attempted
standalone `@axe-core/cli` could not start because its bundled ChromeDriver
only supports Chrome 152 while the provided Playwright Chromium is 145; this
is an environment tooling mismatch, not a product failure. The same axe-core
version was run successfully through Playwright on every route.
