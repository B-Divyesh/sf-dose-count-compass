# Dose Count Compass — polish round 3 handoff

## Result

**PASS — no known gaps.** Repair commit
`4bbf4ea619e46c1571745b3c97aa26c6fb3cbd2b` changes `/log` to the required
title and social-title value: “Dose Count Compass — Track device doses.” The
exact Playwright route-metadata test now prevents regression. The PWA is
versioned 1.2.1 with a new `dose-compass-v6` cache and manifest start URL.

The catalog description is now verb-first and 67 characters:
“Count doses and see refill reminders before a medicine device runs out.” Its
two behavior claims are listed in `.factory/claims.json` and tested.

## Deployment

The built `dist/` artifact was deployed through the static work order with
deployment ID `a7ea3449-1e1e-487b-9b4e-4fe83dcb3d7d`. The production URL is
<https://dose-count-compass.sociobot.in>; it serves
`assets/index-VEeVEOSw.js`, byte-identical to the built artifact.

## Exact verification evidence

Fresh clone: `/tmp/dcc-clean-polish3.WqJNU6` at the repair commit.

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS — tsc --noEmit
npm run build                  PASS — dist/ with index.html at its root
npm test                       PASS — 23 Playwright tests
npm audit --audit-level=high   PASS — 0 vulnerabilities (repair checkout)
```

Every command named by `.factory/claims.json` was run separately in that clean
clone and passed with its one tagged test:

```text
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
```

The live cold check (`verify-url.sh`) loaded in 829 ms with no console errors,
one h1, a main landmark, English language, and no missing image alt text.
`evidence/polish-3/live-audit.json` records a live 390 px first screen, exact
`/log` title/OG/Twitter metadata, one-click demo isolation and reset, offline
write/reload (42 → 41), same-origin-only traffic, route focus announcement,
all route metadata/legal links, a styled online/offline 404, and zero
serious/critical axe findings on all six scanned routes. Screenshots are next
to that audit.

Live mobile Lighthouse recorded Performance 100, Accessibility 100, Best
Practices 100, and SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, and TBT 40 ms.
Built assets are 19.51 KB JS / 7.12 KB gzip and 10.59 KB CSS / 3.24 KB gzip.

## Run and deploy

```sh
npm ci
npm run lint
npm test
npm run build
npm run preview
```

Deploy `dist/` with the static work order. `public/staticwebapp.config.json`
must remain alongside the output so headers, SPA routes, and the true 404 are
preserved.

## Known gaps

None. The product remains intentionally local-first and has no AI, payment,
analytics, CDN, or third-party runtime dependency.
