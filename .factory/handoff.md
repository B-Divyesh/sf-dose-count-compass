# Dose Count Compass — polish round 4 handoff

## Result

**PASS — no known gap remains.** All findings from review rounds 1–4 and the
earlier verification were rechecked. The released product is version `1.2.2`
at <https://dose-count-compass.sociobot.in>.

## What changed

- Replaced the metaphorical missing-page heading with the direct heading
  “Page not found.”
- Added exact raw, service-worker-controlled online, and controlled-offline
  regression assertions for that heading and HTTP 404 status.
- Advanced the service-worker cache to `dose-compass-v7`, ensuring installed
  copies receive the corrected 404 document.
- Updated the catalog line to: “Count doses and see when to plan a refill for
  each medicine device.” It is verb-first and 67 characters.
- Re-audited all ten claims, cumulative review repairs, copy, mobile layout,
  accessibility, privacy, offline behavior, routing, metadata, links, and
  deployment integrity. The complete finding map is `.factory/polish-4.md`.

The paper-cut medicine-cabinet identity, warm paper/moss/coral palette,
Georgia/system type pairing, clipped cards, and physical count gauges were
preserved.

## Verification

From clean clone `/tmp/dcc-polish4-clean.KdbrCF`:

```sh
npm ci
npm run lint
npm test -- --grep @claim:offline-reload
npm test -- --grep @claim:csv-export
npm test -- --grep @claim:json-export
npm test -- --grep @claim:backup-import
npm test -- --grep @claim:print-card
npm test -- --grep @claim:local-only
npm test -- --grep @claim:log-updates-count
npm test -- --grep @claim:refill-reminder
npm test -- --grep @claim:demo-isolation
npm test -- --grep @claim:free-to-use
npm test
npm run build
npm audit --audit-level=high
```

Results: all ten individual claim tests passed, the full suite passed 23/23,
lint and build passed, `dist/` was produced, and the audit found zero
vulnerabilities. Production JS is 19.51 KB raw / 7.12 KB gzip; CSS is
10.59 KB raw / 3.24 KB gzip.

Live verification used fresh mobile and desktop browser contexts after the
static deployment:

- First screen: exact job/audience/action copy, 44 px action at y=388–432,
  privacy/offline/free facts, no overflow, one `h1`, and one `main`.
- Demo: one click, three samples, persistent banner, isolated namespaces,
  reset on exit, and direct `?demo=1` entry.
- Offline: a logged dose survived reload; a missing route remained styled and
  returned HTTP 404 with “Page not found.”
- Routing: five route-specific title/canonical/social metadata sets, focus and
  announcement on navigation/Back, working legal links, and a complete
  200-status link/asset crawl.
- Accessibility/privacy: no serious or critical axe findings on any route or
  404, no browser console errors, and only same-origin requests.
- Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO
  100; FCP 0.8 s, LCP 1.1 s, CLS 0, TBT 30 ms.

Evidence is under `.factory/evidence/polish-4/`: `clean-clone.log`,
`claims-inventory.json`, `live-audit.json`, `live-home-mobile.png`,
`live-demo-mobile.png`, `live-404-desktop.png`, `live-verify/`,
`lighthouse-live.json`, `deployment-integrity.txt`, and `deploy.log`.

## Deployment

- Work order: `dose-count-compass-polish-4`
- Static deployment ID: `1c0b3a90-6b09-49fd-b6d7-509439a5b3bb`
- Live build: `index-Dj1usNz2.js`, `index-6GeMvAbO.css`
- Service-worker cache: `dose-compass-v7`
- Deployment integrity: all checked live artifacts byte-match `dist/`

## Known gaps and next steps

None. Normal dependency and browser regression maintenance only.
