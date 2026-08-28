# Handoff — Dose Count Compass v1

## Delivered

- Offline-first Vite + TypeScript PWA with a separate IndexedDB namespace for
  real use (`real:dose-count-compass`) and demo use (`demo:dose-count-compass`).
- Device-specific inhaler, spray, injector, and other counters; dose logging;
  refill threshold status; editing; JSON/CSV export/import; printable inventory
  card; and clear safety language.
- `/demo` starts with three realistic sample devices and retains a persistent
  sandbox banner with reset and start-for-real actions.
- `/privacy`, `/terms`, a styled 404 state, manifest, service worker,
  robots/sitemap, static-host configuration, one-time $9 license checkout and
  restore/verify flow.
- Original paper-cut hero art at `public/hero-diorama.webp` (37 KB). Prompt,
  model provenance, visual tokens, and interaction policy are in `design.md`.

## Run and verify

```sh
npm install
npm run build
npm test
```

Build output is `dist/` and has `dist/index.html` at its root. The Playwright
suite has seven passing tests: all five documented claims, keyboard device
creation, and an axe-core serious/critical accessibility check. Claims are in
`claims.json`; the sandbox details are in `demo.md`.

## Measured checks

- `npm run build` passes. Initial JS: 6.63 KB gzip; CSS: 2.89 KB gzip.
- `npm test` passes (7/7), including a service-worker offline reload from
  `/demo`, local-only request checking, and exports/print verification.
- Lighthouse mobile-style run: Performance **100**, Accessibility **100**,
  LCP **1.6 s**, CLS **0**.
- Manual 390px and desktop visual checks passed. The paper-cut image has
  explicit dimensions, alt text, and is under the 300 KB hero budget.

## Known gaps and next steps

No known functional gaps for v1. The count is intentionally not presented as a
medical or device-status guarantee; users must keep checking the device
indicator, label, expiry date, and clinician or pharmacist instructions.
