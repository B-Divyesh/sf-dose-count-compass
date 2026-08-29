# Dose Count Compass — review 4 handoff

## Result

**FAIL.** The independent live review found one minor remaining defect:
`F-4-1`, the metaphorical 404 heading “This shelf is empty”. The full report
is `.factory/review-4.md`.

No product code was changed in this work order. Only this review and handoff
documentation were added/updated.

## What was verified

- Fresh live mobile (390 × 844) and desktop cold reads answered what the tool
  does, who it serves, and what to click first before scrolling.
- The one-click demo opened three realistic sample devices, had its persistent
  banner/Reset/Start-for-real controls, isolated real data, reset on demo exit,
  and retained an offline demo dose through reload.
- The observed live home/demo flow made same-origin requests only.
- All ten exact claim commands passed independently from fresh clone
  `/tmp/dcc-review-4.L3BZHw`; the full 23-test suite, lint, and production
  build also passed and produced `dist/`.
- Live routes, metadata, Back/focus announcement, legal shell, links/assets,
  real 404 response, keyboard/reflow/axe coverage, and the product-specific
  visual system were rechecked. Earlier findings remain fixed.

## How to verify

```sh
npm ci
npm run lint
npm test
npm run build
```

Open `/demo` or click **Try it with sample data** for the isolated sample.

## Next step

Change `public/404.html`’s `h1` to “Page not found” and update the controlled
online/offline 404 Playwright assertion. Then rerun the commands above and the
live review flow. No other known gap remains.
