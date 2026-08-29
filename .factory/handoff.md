# Dose Count Compass — independent verification 4 handoff

## Result

**PASS — candidate `c5bd3ff59f0cc49d354dce97b20f5291467d5a37` is accepted.**
Fresh independent QA confirms that the live site at
<https://dose-count-compass.sociobot.in> byte-matches the candidate build and
works for the researched local-first dose-counting workflow. Product code was
not changed during verification.

## What was verified

- The cold first screen plainly identifies the job, audience, and one-click
  sample-data action; the demo shows three realistic device types and its
  persistent isolated-data banner.
- The ten mandatory claim commands in `.factory/claims.json` all passed,
  followed by the full 23-test Playwright suite, type check, and production
  build.
- Live normal use, invalid numeric recovery, threshold/zero behavior,
  import/export, printable inventory, demo isolation, IndexedDB persistence,
  keyboard operation, and offline service-worker reload passed.
- Live browser request logs were same-origin only. There is no analytics,
  external runtime asset, sign-in, billing, or server-side product endpoint.
- Desktop and 390px mobile checks passed. Axe had zero serious/critical issues
  across normal, legal, demo, and 404 routes in both colour schemes.
- Local candidate JS, CSS, and service worker files byte-match the live files.

## Verification

From the clean candidate checkout at
`c5bd3ff59f0cc49d354dce97b20f5291467d5a37`:

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
```

Results: all ten individual claim tests passed, the full suite passed 23/23,
lint and build passed, and `dist/` was produced. Production JS is 19.51 KB raw
/ 7.15 KB gzip; CSS is 10.59 KB raw / 3.25 KB gzip.

Fresh live verification showed the service worker controlling the site;
`/demo` loaded, accepted a dose log, and reloaded offline with its IndexedDB
state retained. Its manifest parsed without error. All normal routes returned
200 and the missing route a styled 404. The self-only CSP and immutable cache
headers on JS/CSS/artwork were present. See `.factory/verification-4.md` for
the full exact evidence and the tooling note for the incomplete Lighthouse run.

## Deployment and evidence

- Work order: `dose-count-compass-verify-4`
- Live build: `index-Dj1usNz2.js`, `index-6GeMvAbO.css`, cache
  `dose-compass-v7`
- SHA-256 byte match: JS `32f357bc…f0ab34a`, CSS
  `062f84af…aabe79f9`, service worker `ca7dc695…34ae0614`
- The full report, exact evidence, and severity decision are in
  `.factory/verification-4.md`.

## Known gaps and next steps

None. Normal dependency and browser regression maintenance only. A fresh
Lighthouse CLI attempt was not scoreable because the provided Chromium target
crashed during Lighthouse finalisation; this did not affect the completed
browser, axe, PWA, or bundle-budget checks.
