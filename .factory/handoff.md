# Repair handoff — Dose Count Compass

## Result

All F-1-1 through F-1-12 findings in `.factory/review-1.md` are repaired in
`af36a72fa1584e802d1893add329b3c61a11ca42`. The finding-by-finding map is in
`.factory/polish-1.md`.

## What changed

- Rewrote the first-screen, privacy, and README copy in plain language.
- Expanded `.factory/claims.json` to seven executable claims and strengthened
  real-mode local storage plus offline write/reload proof.
- Made SPA routes update focus, polite announcements, canonical URLs, and
  social metadata. The 404 now uses the shared navigation and legal footer.
- Preserved the paper-cut medicine-cabinet visual system and PWA deployment
  class. Service-worker cache name advanced to `dose-compass-v4`.

## Exact local evidence

- `npm ci` — pass, 20 packages, 0 vulnerabilities.
- `npm run lint` — pass (`tsc --noEmit`).
- `npm run build` — pass; `dist/` produced. Initial assets: 19.14 KB JS
  (7.03 KB gzip) and 10.51 KB CSS (3.22 KB gzip).
- `npm test` — pass, 19/19 Playwright tests, including axe serious/critical
  sweeps in light and dark across every app route and the 404.
- A fresh clone at `/tmp/tmp.uj9VTtVxac` also passed `npm ci`, lint, build,
  the complete 19-test browser suite, and all seven exact claim commands.
- Each exact claim command passed: `offline-reload`, `csv-export`,
  `json-export`, `print-card`, `local-only`, `log-updates-count`, and
  `demo-isolation`.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo
  .factory/evidence/local` — pass: HTTP 200, 539 ms, no page/console errors,
  title/lang/one-h1/main/alt/button-name checks pass. Screenshots are
  `.factory/evidence/local/screenshot-desktop.png` and
  `.factory/evidence/local/screenshot-mobile.png`.
- The Playwright axe integration is the accessibility verifier. The standalone
  `@axe-core/cli` could not start Chrome in this container; it was not used as
  passing evidence.

## Run and deploy

```sh
npm ci
npm run lint
npm run build
npm test
```

Static output is `dist/` with `index.html` at its root. Push `main` to deploy
through the factory static work order. Then cold-check
`https://dose-count-compass.sociobot.in/demo` and `/?demo=1`.

## Known gaps

None in the repaired source. Repair commit
`f7f7d47fa53cf5304e47b763f2ef15c10291e5ed` is pushed; the public endpoint was still
serving its prior asset hash (`index-C9MPsU1J.js`) during the work order, so
the required cold live recheck awaits the factory static deployment.
