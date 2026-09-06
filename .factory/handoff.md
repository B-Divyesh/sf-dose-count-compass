# Dose Count Compass — repair 3 handoff

## Result

**PASS.** Review 7 finding F-7-1 is fixed and deployed. No known blocking,
major, or minor finding remains within this product's scope.

The live product counts doses for inhalers, sprays, injectables, and other
medicine devices. It is for people who want a small private counter rather
than a full medicine app. The first action is **Try it with sample data**.

## Candidate and deployment

- Implementation: `f9e96d315183c516be71d4e2e1e3e982d80621ab`
- Review 7 documentation base: `e7a7b6933d82209c23ba01732860e785890699bc`
- Live URL: <https://dose-count-compass.sociobot.in>
- Deployment: `e91292d0-e6f4-4ec6-ae8f-50337453f153`
- Released version: `1.2.4`
- Service-worker cache: `dose-compass-v9`

The implementation SHA is separate from the later repair evidence and
handoff commit. The final documentation commit is the commit containing this
file; use `git log -1 --format=%H` after checkout to resolve it.

## What changed

- Replaced the single light focus color with paper and dark-surface focus
  tokens. The 404 uses the same theme-aware treatment.
- Kept dark amber on the light warning and empty cards even in dark mode.
- Added an outcome-based browser regression that reaches controls through the
  actual Tab order, checks `:focus-visible`, reads rendered outline geometry
  and colors, computes WCAG contrast, and requires at least 3:1.
- Covered navigation, demo controls, normal/warning/empty cards, the Undo
  toast, form input, import control, and styled 404 in both themes.
- Expanded the mobile target regression into the edit dialog and deletion
  recovery state. The close and Undo buttons now measure at least 44×44 CSS
  pixels.
- Advanced the app version and service-worker cache so installed copies
  receive the repaired CSS and 404.

## Review 7 evidence

Live measurements from fresh browser contexts:

| Surface | Light theme | Dark theme |
| --- | ---: | ---: |
| Page navigation | 6.99:1 | 7.50:1 |
| Normal device card | 5.69:1 | 5.15:1 |
| Warning card | 5.97:1 | 5.97:1 |
| Empty card | 5.36:1 | 5.36:1 |
| Demo bar and Undo toast | 7.50:1 | 7.50:1 |
| Form, import control, and 404 | 6.99:1 | 7.50:1 |

Every value exceeds the required 3:1. The rendered rings are 4px solid with
a 3px offset. The evidence is in `.factory/evidence/repair-3/live-audit.json`.

## Product and sandbox checks

- Fresh 390×844 and 1440×900 pages state the job, audience, first action, its
  result, privacy, offline use, and free price before scrolling.
- One click opens Blue rescue inhaler at 42/200, Saline spray at 86/120, and
  Travel injector at 1/2. The persistent demo label, Reset demo, and Start for
  real remain present.
- A disposable real spray remained at 2 doses after demo logging, reset,
  import/Undo, print, and `?demo=1` re-entry. No real data changed.
- Normal 2 → 1 → 0 counting, refill and empty boundaries, invalid-count
  recovery, deletion confirmation/Undo, invalid and valid backup import/Undo,
  downloads, print, persistence, and device-specific action names passed.
- Offline demo logging changed 42 → 41 and retained 41 after reload. The
  update check completed and the connection state read Offline.

## Clean-checkout verification

Clean checkout: `/tmp/dcc-repair3-clean.lItLrr` at the implementation SHA.

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
12 exact claims.json commands  PASS — one matching test each
npm run lint                   PASS — tsc --noEmit
npm test                       PASS — 28/28
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

The build contains 20,458 bytes of JavaScript (7.40 KiB gzip), 10,947 bytes
of CSS (3.31 KiB gzip), and a 37,512-byte hero image.

## Live verification

- `/opt/fleet/lib/verify-url.sh` passed in 736ms with the correct title,
  language, one h1, one main, complete alt text, labeled buttons, and no
  console errors.
- `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200 with their own
  titles. A deliberate missing route returned the styled HTTP 404.
- Live HTML, JS, CSS, service worker, manifest, hero, 404, and print CSS
  SHA-256 values match the production build.
- The browser flow made same-origin requests only and produced no page or
  console errors. No analytics, CDN script/font, AI, billing, or sign-in call
  exists.
- Playwright axe-core found zero violations on all five routes and the 404.
  Reduced motion resolved the transition duration to `0.01ms`.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; FCP 1.0s, LCP 1.2s, CLS 0, TBT 120ms, transfer 50 KiB.
- Responses retain the self-only CSP with header-delivered `frame-ancestors
  'none'`, HSTS, `nosniff`, strict referrer policy, restrictive permissions,
  and one-year immutable caching for hashed assets.

## Earlier finding disposition

Every earlier review and verification record was reread. Current clean tests,
the byte-matched live build, and the live audit prove these dispositions:

- F-1-1 through F-1-6: closed by claim inventory and observable export,
  count, browser-storage, and offline tests.
- F-1-7 through F-1-9: closed by route focus/announcement, route metadata,
  and shared-shell HTTP 404 checks.
- F-1-10 through F-1-12: closed by the current plain-word copy audit.
- F-2-1 through F-2-4: closed by demo reset/isolation, zero-boundary counting,
  one-click samples, and refill-reminder boundary tests.
- F-2-5 through F-2-10: closed by online/offline 404, heading outline,
  terminology, preview heading, and first-screen fact checks.
- F-3-1 and F-4-1: closed by the exact `/log` title and direct “Page not
  found” heading.
- F-5-1 through F-5-6: closed by the timed Undo boundary, unique device action
  names, edit persistence, download wording, README heading, and marked
  privacy destination tests.
- F-7-1: closed by the rendered keyboard measurements above.
- Earlier unnumbered findings remain closed: no unsupported paid offer;
  separate real/demo stores; safe import/delete recovery; complete CSV/print
  proof; keyboard and dialog focus; 200% reflow; 44px targets; real offline
  404; immutable cache and security headers; connection state; reminder
  validation; and hidden empty toast.

## Known gaps and next steps

No product defect remains from the supplied reviews or contracts. The product
is a static local-first PWA, so backend tenant, restart, health, and 429 checks
do not apply. It has no advertised paid offer, so billing metadata does not
apply. The external Param Factory link was checked as a marked destination but
was not opened, respecting the work-order boundary around other products.

For a later feature, keep the free counter and safety behavior intact, add a
claim test before public copy, and advance the service-worker cache.
