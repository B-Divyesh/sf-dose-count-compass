# Independent verification 5 — PASS

**Candidate:** `2d0786359d8a106ba807bdaa17615aeb73aa1f8b` (`main`)  
**Production URL:** <https://dose-count-compass.sociobot.in>  
**Verified:** 2026-08-29 UTC  
**Scope:** clean-checkout, independent release QA against the researched brief,
factory contract, and `.factory/claims.json`. Product code was not changed.

## Release decision

**PASS.** The candidate satisfies the offline device-dose-counting job and
the deployed site is byte-identical to its production build. No release
blocker was found.

## Cold first read and demo gate

Fresh live-page reading: this is a tool to **count doses before a device runs
out**, for **people who track doses but do not need a full medicine app**.
The first action is the visible one-click **“Try it with sample data”**, which
says it will show three already-counted devices. The same screen plainly says
that data is saved in the browser, works offline after the first visit, and is
free. This passes the plain-words and demo-sandbox release gates.

## Clean-checkout gates

The checkout started clean at the stated commit. `npm ci` installed 20
packages with zero reported vulnerabilities. All available checks passed:

```text
npm run lint                 PASS — tsc --noEmit
npm test                     PASS — 27/27 Playwright tests
npm run build                PASS — generated dist/
```

Every exact command in `.factory/claims.json` was run from the shipped
production-demo entry point. All 12 passed:

| Claim ID | Result | Observable outcome checked |
| --- | --- | --- |
| `offline-reload` | PASS | Demo dose 42 → 41 survives an offline reload. |
| `csv-export` | PASS | Download contains all device and dose-log rows. |
| `json-export` | PASS | Backup contains all three sample devices. |
| `backup-import` | PASS | Bad input is rejected; replacement confirms and Undo restores. |
| `print-card` | PASS | Printable card includes all three samples. |
| `local-only` | PASS | Real data persists in IndexedDB; no cross-origin request. |
| `log-updates-count` | PASS | Blue inhaler runs 42 → 0, disables logging, and shows empty. |
| `refill-reminder` | PASS | Reminder begins at 30 and remains below it. |
| `demo-isolation` | PASS | `demo:` and `real:` IndexedDB data stay isolated; demo resets. |
| `free-to-use` | PASS | Add/log flow has neither a purchase gate nor billing traffic. |
| `undo-window` | PASS | Import and deletion Undo last through 29,999 ms, not 30,000 ms. |
| `edit-device` | PASS | Changed device details persist after reload. |

## Functional, privacy, and PWA checks

Live desktop and 390 × 844 mobile testing covered normal add/log flows,
threshold and zero boundaries, invalid `remaining > total` recovery, import
validation/Undo, export, print, demo reset/start-for-real, and route
navigation. The invalid-count dialog remains open and announces the actionable
whole-number/threshold error; correcting it saves a zero-dose card with its
log action disabled.

The live request log for the landing, demo, data flow, and offline test
contained only same-origin HTML, JS, CSS, image, and service-worker requests.
There were no console errors, page errors, or failed requests. Data is stored
in the separate `real:dose-count-compass` and `demo:dose-count-compass`
IndexedDB databases. There are no product server endpoints, sign-in,
payment/product-unlock calls, or third-party data calls; rate-limit and Entra
checks are therefore not applicable.

PWA evidence: Chromium reports no installability errors. After one online
visit, `/demo` was service-worker controlled; a dose logged while offline
persisted from 42 to 41 after offline reload. A controlled temporary-server
update test changed only the served worker revision, called
`registration.update()`, and observed the product toast **“A new version is
ready.”** with no console error.

## Deployment integrity, headers, performance

Fresh local production files byte-match live deployment:

```text
index.html                   5da467a02eec9d22010ae2caca818329ae3a1a7eff3704e355f250e7aaa39e3f
assets/index-BfVHYZVo.js     915a2f93dbce03247f9e5fb189f3fa094e63b10089ec10c4ee8f139ba3d57189
assets/index-6GeMvAbO.css    062f84afca4a5da2486207997462d2531bc0bb18e1e584c30a0b956caabe79f9
sw.js                        1a82cc1e1ac5f99534fc44f6e30b5fff5c4b644a8cc049b22048904e149bf051
```

Live `/`, `/demo`, `/log`, `/privacy`, `/terms`, `robots.txt`, and `sitemap.xml`
return 200. An unknown route returns the styled 404. Responses carry the
self-only CSP, `nosniff`, strict-origin referrer policy, restrictive
permissions policy, and HSTS. Hashed JS has `public, max-age=31536000,
immutable`; HTML revalidates at 30 seconds.

Build sizes: JS 20,458 bytes raw / 7,400 bytes gzip; CSS 10,585 / 3,240;
hero WebP 37,512 bytes. They are comfortably within static-PWA budgets. A
local mobile Lighthouse run produced Performance 99, Accessibility 100, Best
Practices 100, SEO 100 (FCP 1.1 s, LCP 1.6 s, CLS 0, TBT 120 ms); Lighthouse
then emitted a `TARGET_CRASHED` error during final screenshot capture. The
score output is therefore supplemental rather than relied upon; completed
browser, axe, header, and bundle checks above are the release evidence.

## Accessibility and interaction

- axe-core WCAG 2 A/AA scans found zero serious or critical findings on `/`,
  `/demo`, `/log`, `/privacy`, and `/terms` in both light and dark schemes.
- At 390 px every checked route had `scrollWidth === innerWidth`; reduced
  motion reduced transition duration to `0.01ms`.
- Keyboard Tab reaches the sample-data action in six tabs with a visible
  `rgb(230, 169, 61)` 4px focus ring; Enter opens `/demo`.
- Live routes have route-specific titles, `lang="en"`, one main landmark and
  one h1. Internal and external product links resolved successfully.

## Defects by severity

No defects found.
