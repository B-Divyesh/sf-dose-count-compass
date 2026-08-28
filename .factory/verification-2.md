# Independent product verification — PASS

- Candidate: `714dab49dc24142ebab97185dddad90c42dbb8a2`
- Live URL: <https://dose-count-compass.sociobot.in>
- Verified: 2026-08-28 UTC
- Work order: `dose-count-compass-verify-2`
- Result: **PASS — release candidate accepted**

This was a fresh independent verification of the deployed PWA. No product
source files were changed.

## Mandatory first checks

### Claims, run first from the demo entry point

`.factory/claims.json` exists and lists six claims. After the clean locked
install (`npm ci`: 20 packages, 0 vulnerabilities), every exact command in the
inventory passed independently:

| Claim | Exact command | Result |
| --- | --- | --- |
| Works offline after the first visit | `npm test -- --grep @claim:offline-reload` | PASS, 1 test |
| Exports the log as CSV | `npm test -- --grep @claim:csv-export` | PASS, 1 test |
| Exports a JSON backup | `npm test -- --grep @claim:json-export` | PASS, 1 test |
| Prints an inventory card | `npm test -- --grep @claim:print-card` | PASS, 1 test |
| Saved on this device | `npm test -- --grep @claim:local-only` | PASS, 1 test |
| Demo — sample data, nothing is saved | `npm test -- --grep @claim:demo-isolation` | PASS, 1 test |

The tests use the shipped `/demo` sample inventory. Independent live checks
also confirmed event-level CSV rows, three JSON devices, a three-row printable
inventory, same-origin-only requests, and real/demo storage isolation across
history navigation.

### Cold first read, live site

PASS. A fresh browser at `/` says what it does: “Count doses before you run
out”; for whom: people tracking inhalers, sprays, injectables, and other
medicine devices without an account; and what to click: “Try it with sample
data”, with “See three devices already counted.” The action is visible on the
first screen and reaches the seeded dashboard in one click.

The cold page has a specific title, `lang="en"`, one `h1`, one `main`, useful
hero alt text, and no console or page errors.

## Clean local gates

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS — tsc --noEmit
npm run build                  PASS — dist/ produced
npm test                       PASS — 17/17 Playwright tests
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

The exact production build produces 18.33 KB JavaScript (6.82 KB gzip),
10.37 KB CSS (3.17 KB gzip), no font payload, and a 37.5 KB hero image. These
are within the static/PWA budgets.

## Independent functional evidence, live site

- Created an inhaler at 2/2, persisted it through reload, logged it to the
  refill threshold and then empty, and confirmed the zero-count action is
  disabled.
- An invalid `remaining > total` edit showed an announced correction message
  and left the dialog open for recovery.
- An invalid backup left existing data intact. A valid backup showed the
  replacement confirmation and the 30-second Undo restored the original list.
- Demo mode showed only sample data; real mode showed only the real record;
  browser Back returned to sample data without leaking the real record.
- The print card opened with all three sample devices. The complete demo
  dose/print flow made requests only to the product origin.

## PWA, accessibility, and performance

- Chromium reports a valid manifest and zero installability errors. The active
  service worker is `/sw.js`, cache `dose-compass-v3`.
- After the first `/demo` visit, an offline reload retained all three sample
  cards and accepted an offline dose log. `registration.update()` completed
  without errors. The worker contains versioned precaching, `skipWaiting`, and
  `clientsClaim` for updates.
- At 390×844, no horizontal overflow or visible interactive target under
  44×44 px was found. At 200% root text size, width remained 390 px.
- Keyboard smoke tests passed: the first Tab focuses the skip link; Escape
  closes the device dialog and restores focus to Add a device. Reduced motion
  resolves transitions/animations to `0.00001s`.
- Local Playwright axe scans across `/`, `/demo`, `/log`, `/privacy`, `/terms`,
  and the 404 page in light and dark found zero serious or critical issues.
  An independent live axe scan of `/demo` also found zero serious/critical
  issues.
- Live Lighthouse 13.4.1 mobile run: Performance **98**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 160 ms,
  transfer 49 KiB.

## Privacy, deployment, and policies

- No analytics, third-party scripts, CDN fonts, sign-in, or cross-origin demo
  requests were observed. Data is stored in separate `real:` and `demo:`
  IndexedDB namespaces; exports require an explicit action.
- The product has no server-side application endpoint or product-unlock call.
  Rate-limit and Sociobot Entra tenant checks are therefore not applicable.
- Live SHA-256 values exactly match this candidate's `dist/index.html`, hashed
  JS, CSS, and `sw.js`. The live deployment is this candidate, not a stale
  version.
- HTTPS responses include CSP with `frame-ancestors 'none'`, HSTS, `nosniff`,
  strict referrer policy, and a restrictive Permissions-Policy. Hashed JS/CSS
  assets have `public, max-age=31536000, immutable`; `/not-a-real-page`
  returns a styled HTTP 404. `robots.txt` and `sitemap.xml` are present.

## Defects by severity

None found. No known release-blocking gaps remain for the researched
local-first dose-counting scope.
