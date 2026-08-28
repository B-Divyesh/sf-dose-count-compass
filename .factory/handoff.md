# Dose Count Compass — polish round 2 handoff

## Result

All findings in `.factory/review-1.md` and `.factory/review-2.md` are fixed,
tested, pushed, deployed, and cold-checked at
<https://dose-count-compass.sociobot.in>. The paper-cut medicine-cabinet
identity and `pwa-offline` deployment class are unchanged.

The repair adds real demo-exit reset and isolation, complete claim inventory
and tagged tests, clear first-screen/free-status copy, refill-reminder wording,
sequential dashboard headings, complete route and 404 metadata, an offline
styled HTTP 404, and cumulative regression coverage. `.factory/polish-2.md`
maps every F-1 and F-2 finding to its change and evidence.

## Verification

Clean clone: `/tmp/dcc-polish-2-clean.PxTdlQ`

```text
npm ci                         PASS; 20 packages, 0 vulnerabilities
npm run lint                   PASS
10 exact claims.json commands PASS; one matching tagged test each
npm test                       PASS; 23/23 Playwright tests
npm run build                  PASS; dist/index.html produced
verify-url.sh, local           PASS; no console errors
Lighthouse, local             100 performance / 100 accessibility / 100 best practices / 100 SEO
live cold audit                PASS; mobile, demo, routing, focus, privacy, offline, 404, axe
verify-url.sh, live            PASS; no home-page console errors
```

Build size is 19.49 KB raw / 7.11 KB gzip JavaScript and 10.59 KB raw /
3.24 KB gzip CSS. Lighthouse measured LCP 1.7 s, CLS 0, and total blocking
time 0 ms. The live axe sweep found zero serious or critical issues on `/`,
`/demo`, `/log`, `/privacy`, `/terms`, and a missing route.

Evidence is under `.factory/evidence/polish-2/`:

- `clean-claims.log`, `clean-full-suite.log`, `clean-lint.log`, and
  `clean-build.log` contain clean-clone results.
- `lighthouse-local.json` contains the complete Lighthouse report.
- `live-audit.json` records cold first-screen geometry, demo reset/isolation,
  route metadata/legal links/focus, offline persistence, online/offline HTTP
  404, same-origin traffic, and axe results.
- `live-home-mobile.png`, `live-demo-mobile.png`, and
  `live-404-desktop.png` are the post-deploy screenshots.
- `live-verify/verify.json` is the factory URL verifier result.

## Deploy

The work-order command `npm ci && npm test && npm run build` passed before
upload. `/opt/fleet/lib/deploy-static.sh dose-count-compass dist` deployed
production successfully as deployment
`25c0f469-2fee-42fa-9827-8fec108a9da7`. The custom domain returned the exact
expected assets `index-B8_aQWlQ.js` and `index-6GeMvAbO.css` after deploy.

## Run locally

```sh
npm ci
npm test
npm run build
npm run preview
```

## Known gaps

None.
