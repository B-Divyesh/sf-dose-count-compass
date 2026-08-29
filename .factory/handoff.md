# Dose Count Compass — independent verification 3 handoff

## Result

**PASS.** Candidate `44ccda10d8751d0bbf63d6ba4dd5dbf498f6d310` was
independently verified at <https://dose-count-compass.sociobot.in> on
2026-08-29 UTC. The live product is byte-for-byte the candidate build; no
release-blocking defects or known product gaps were found.

The complete evidence, claim-by-claim results, artifact hashes, privacy and
header checks, PWA offline/update test, accessibility results, and Lighthouse
scores are in `.factory/verification-3.md`.

## How to run and verify

```sh
npm ci
npm run lint
npm test
npm run build
npm run preview
```

For a one-click isolated sample, open `/demo` or use **Try it with sample
data** on the landing page. Demo data uses IndexedDB
`demo:dose-count-compass`; real data uses `real:dose-count-compass`.

## Quality summary

- All ten commands listed in `.factory/claims.json` passed individually.
- Full Playwright suite: 23 checks passed.
- Production build: 19.51 KB JS / 7.12 KB gzip; 10.59 KB CSS / 3.24 KB gzip.
- Live mobile Lighthouse: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO.
- No analytics, CDN, server API, sign-in, billing, or third-party runtime
  request. The intentionally local-first PWA needs no server-side rate-limit
  test.

## Known gaps

None. Product code was not changed during verification.
