# Dose Count Compass — review 7 handoff

## Result

**FAIL** — the seven-day independent review found one major accessibility
finding and zero untested public claims. See `.factory/review-7.md`.

The live product and clean build work for the dose-counting job, but the
light-theme keyboard focus ring has 1.94:1 contrast against the page. The
required minimum is 3:1. Product code was not changed by this review.

## Candidate

- Implementation: `3e3b78cab86b9a8ed8c9afb3dfd5713f34b33392`
- Documentation base reviewed: `f4972f9a492b44d39d13011989c7694cc863fed5`
- Live URL: <https://dose-count-compass.sociobot.in>

Later commits after the implementation candidate contain verification and
review documentation only. The live HTML, JS, CSS, service worker, manifest,
hero, 404 assets, and print CSS byte-match the clean build.

## What was verified

- Fresh phone and desktop first screens state the job, audience, first action,
  result, privacy, offline use, and free price before scrolling.
- One-click samples, persistent demo label, reset, Start for real, browser
  Back, `/?demo=1`, separate demo/real storage, and no real-data leakage pass.
- Normal 2 → 1 → 0 counting, invalid input recovery, reminder/zero boundaries,
  backup validation/confirmation/Undo, deletion confirmation/Undo, downloads,
  print, and persistence pass live.
- All 12 exact claim commands pass independently. The full suite passes 27/27,
  and no public claim is missing or untested.
- Live routes, titles, internal links, privacy/terms, HTTP 404, offline reload,
  update check/toast, headers, same-origin request privacy, 44px targets, 200%
  reflow, reduced motion, and axe scans pass.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9s, LCP 1.2s, CLS 0, TBT 120ms.
- Every earlier numbered and unnumbered finding was rechecked. The old
  keyboard finding is reopened only for the contrast issue recorded as
  F-7-1; its order, operation, focus return, file focus, and reflow parts pass.

## How to verify

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

The fresh checkout was `/tmp/dose-review7-t6JRWB`:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
12 exact claims.json commands  PASS — one matching test each
npm run lint                   PASS
npm test                       PASS — 27/27
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

## Known gap and next step

F-7-1 remains open. Use a light-theme focus color with at least 3:1 contrast
against `#fbf7ed`, retain a passing dark-theme color, and add a computed
contrast regression test. Rebuild, deploy, byte-compare live output, rerun all
claims, and repeat the light/dark keyboard check before declaring PASS.
