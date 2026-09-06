# Count medicine-device doses — verification 6 handoff

## Result

**PASS.** Independent QA found 0 blocking, 0 major, and 0 minor findings.
There are 0 untested public claims. Product code was not changed.

The complete report is [verification-6.md](verification-6.md).

## Candidate

- Implementation: `f9e96d315183c516be71d4e2e1e3e982d80621ab`
- Documentation base reviewed: `98297d547aab18782747fb78aa2791b286da85c9`
- Live URL: <https://dose-count-compass.sociobot.in>
- Product version: `1.2.4`
- Service-worker cache: `dose-compass-v9`

The documentation base follows the implementation candidate. The live HTML,
JavaScript, CSS, service worker, manifest, hero, 404 HTML/CSS, and print CSS
byte-match the candidate build.

## What was verified

- Fresh 390 × 844 and 1440 × 900 browsers stated the dose-counting job,
  audience, first action, and action result before scrolling.
- One click opened three realistic samples with the persistent demo label,
  Reset demo, and Start for real.
- Demo reset, `/?demo=1`, browser storage separation, and a disposable real
  record proved that demo work did not change real data.
- Normal 2 → 1 → 0 counting, refill and empty boundaries, invalid-value
  recovery, confirmed import/delete with Undo, downloads, print, edit, empty
  state, and persistence passed.
- All 12 exact claim commands passed independently. Static inspection found
  one matching test per claim and no extra claim tag.
- The complete suite passed 28/28. TypeScript, production build, and the high
  severity dependency audit passed.
- Live axe scans found zero violations on all five routes and the 404.
  Keyboard operation, route announcements, 200% text reflow, 44px targets,
  reduced motion, and dialog focus passed.
- Focus indicators measured 5.15:1–7.50:1 in both themes, above 3:1.
- Offline logging persisted through reload. Connection state, update check,
  update notice, manifest, cache version, and styled offline 404 passed.
- All core routes and internal links returned 200 with correct titles. The
  designed missing route returned the expected HTTP 404.
- The full live flow made same-origin requests only and produced no console or
  page errors. No analytics, CDN runtime, AI, billing, or sign-in call exists.
- Fresh Lighthouse: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.76s, LCP 1.05s, CLS 0, TBT 42ms, transfer 50KiB.
- Every historical finding through F-7-1 was inspected and proved closed.

## Run the verification

From a clean checkout at the implementation SHA:

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --audit-level=high
```

Run each command in `.factory/claims.json` separately. The live basic check is:

```sh
/opt/fleet/lib/verify-url.sh https://dose-count-compass.sociobot.in /tmp/dose-count-compass-verify
```

## Known gaps and next steps

None for the accepted scope. This is a static local-first PWA, so backend
tenant, restart, health, and 429 checks do not apply. It is free, so the paid
unlock contract does not apply. The marked external Param Factory destination
was inspected in product markup but not opened, respecting the work-order
boundary around other products.
