# Independent verification 3 — PASS

**Candidate:** `44ccda10d8751d0bbf63d6ba4dd5dbf498f6d310` (`main`)  
**Production URL:** <https://dose-count-compass.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Scope:** independent release QA against the researched brief, factory work order, and required claims.

## Release decision

**PASS.** The real offline dose-counting workflow works on the verified
production artifact. No release-blocking defect was found.

Cold first-read result: the opening screen says it helps people who track
medicine doses count them before they run out, identifies people who do not
need a full medicine app, and gives a visible one-click **Try it with sample
data** action with the result stated beside it: “See three devices already
counted.” The demo loads three realistic device types and displays the required
isolated “Demo — sample data, nothing is saved” banner with Reset demo and
Start for real controls.

## Clean-checkout gates

`npm ci` completed (20 packages; `npm audit --audit-level=high`: 0
vulnerabilities). These commands passed:

```text
npm run lint                 PASS — tsc --noEmit
npm run build                PASS — dist/ produced
npm test                     PASS — 23 Playwright tests completed without failure
```

The production build is small: JavaScript is 19.51 KB (7,146 bytes gzip) and
CSS is 10.59 KB (3,251 bytes gzip), well below the 200 KB / 50 KB static-PWA
budgets.

## Required claim tests

`.factory/claims.json` exists and all ten listed commands passed individually
from the clean candidate checkout through the packaged production demo entry
point:

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `offline-reload` | PASS | Demo dose 42 → 41 persisted through an offline reload. |
| `csv-export` | PASS | CSV download contained 3 device rows and dose-log rows. |
| `json-export` | PASS | Backup download contained all 3 sample devices. |
| `backup-import` | PASS | Invalid data was rejected; valid replacement required confirmation and Undo restored the prior list. |
| `print-card` | PASS | Printable inventory card contained Blue rescue inhaler, Saline spray, and Travel injector. |
| `local-only` | PASS | A real device persisted in `real:dose-count-compass`; test observed no cross-origin traffic. |
| `log-updates-count` | PASS | Blue rescue inhaler counted 42 → 0, then disabled logging and showed “Empty — refill now.” |
| `refill-reminder` | PASS | Status changed from normal at 31 to refill reminder at 30 and stayed there below the threshold. |
| `demo-isolation` | PASS | Demo used `demo:dose-count-compass`, reset on re-entry, and did not change `real:dose-count-compass`. |
| `free-to-use` | PASS | Add-and-log flow completed with no purchase control or billing request. |

## Live deployment and PWA evidence

The live artifact is the tested candidate. SHA-256 of each local build output
matched its production response exactly:

```text
index.html                    9c6b77f6a60d27da31a429e6457131ba152d812baf80cb90f75ee1de22ee9bda
assets/index-VEeVEOSw.js      1d3c4c8d4c6cd97a54c1ec732b1c4c05beb57fc0ba519381499658e541ae9a23
assets/index-6GeMvAbO.css     062f84afca4a5da2486207997462d2531bc0bb18e1e584c30a0b956caabe79f9
sw.js                         7c98df72f5600f25ad51fed82e3ea3a5d31cc47c9141983d5183e8eaddf91a63
manifest.webmanifest          8c55d6d6420a5c0cecb4ee55e920b6d22509e895a3c305c5cef43b00f49d2f46
hero-diorama.webp             848655ed9c348f5f4076696c238ba115acd7f3f4f2ec8ecb5fcc3380434a4ae6
404.html                      a811b4119b7c9ba915bafe8277a23de06d7bb32cb63fbab8ab2abfca7cd3b95c
```

In a fresh live browser context, service-worker registration completed; after
the first visit, `42 → 41` survived offline reload of `/demo`; and registering
an updated worker showed “A new version is ready.” Live normal/demo traffic
was same-origin only (HTML, JS, CSS, and product artwork). There are no server
endpoints, authentication, payment, or product-unlock calls, so rate-limit and
Entra checks are not applicable.

The production responses have an effective self-only CSP, `X-Content-Type-
Options: nosniff`, strict-origin referrer policy, HSTS, permissions policy, and
immutable one-year cache headers for hashed JS/CSS. `/`, `/demo`, `/log`,
`/privacy`, and `/terms` returned 200; the styled unknown route returned a real
404.

## Experience, accessibility, and performance

- Representative normal, threshold, zero-count, malformed-import, valid
  import/Undo, deletion/Undo, and persistence paths passed in the full suite.
- Keyboard check passed on production: Tab reaches the skip link; Enter opens
  Add a device; Escape returns focus to its trigger. Dialogs, labels, required
  numeric bounds, and recovery messages are covered by the suite.
- At 390 × 844 the demo has no horizontal overflow and no visible interactive
  target below 44 × 44 px.
- axe-core found **zero serious or critical findings** on `/`, `/demo`, `/log`,
  `/privacy`, `/terms`, and the 404 in both light and dark schemes. All normal
  routes loaded with no browser console or page errors. (Chromium reports the
  expected failed-resource message when navigating directly to the intentional
  HTTP 404.)
- Reduced-motion CSS sets animations and transitions effectively instant.
- Mobile Lighthouse: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**; FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 20 ms.

## Defects by severity

None found.

## Verification notes

This is a static, local-first PWA. User data is kept in browser IndexedDB:
`real:dose-count-compass` for real use and `demo:dose-count-compass` for the
sample sandbox. No analytics, CDN, third-party runtime request, server API,
sign-in, or paid feature is present. Product code was not changed during this
verification.
