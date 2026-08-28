# Handoff — Dose Count Compass CSP repair

## Repaired

- Reproduced candidate `352c0ab494d410d0aee967e476d67985b7b59902` on the
  live `/demo` route with three runtime `style` attributes and three browser
  console errors from `style-src 'self'`.
- Replaced dynamic gauge `style="width:…"` attributes with semantic native
  `<progress>` elements. Their light, dark, low, and empty states now come only
  from the bundled stylesheet.
- Replaced the printable card's injected `<style>` block with the same-origin
  `/print.css` asset. The strict deployment CSP is unchanged and contains no
  `unsafe-inline` exception.
- Added a production-header test server and a focused Playwright regression.
  It loads built `dist/` under the deployment CSP, exercises dose, edit, and
  print flows, asserts zero CSP console errors, and rejects runtime inline
  styles in the app and print window.
- Added `print.css` to the offline shell, advanced the service-worker cache to
  `dose-compass-v2`, and removed superseded Dose Count Compass caches on update.
  First install no longer reports a false update notification.
- Fixed dark-theme device-card and eyebrow contrast found during the repair
  audit. The axe check now covers light and dark themes.

## Clean build and automated checks

Executed from `/work/repo` on 2026-08-28:

```sh
npm ci && npm run build
npx tsc --noEmit
npm test
```

- Clean install/build: pass; `dist/index.html` exists.
- TypeScript: pass.
- Playwright 1.58.2: **8/8 pass**. This covers all five claims, browser CSP,
  keyboard device creation, light/dark accessibility, production print, and
  offline reload.
- Production output: initial JS **17.23 KB / 6.59 KB gzip**; CSS **9.40 KB /
  2.96 KB gzip**; total Lighthouse transfer **68 KiB**.
- Static scan of `src`, `tests`, `scripts`, `public`, and `dist`: no `style=`
  attributes, `<style>` blocks, `unsafe-inline`, or `javascript:` URLs.

## Browser, mobile, offline, privacy, and accessibility evidence

- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/ ...`: HTTP 200;
  no console errors; title and `lang="en"`; one `h1`; one `main`; no missing
  image alt text or unnamed buttons.
- Chromium at 390×844 on `/`, `/demo`, `/log`, `/privacy`, `/terms`, and the
  designed missing-page state: no horizontal overflow, no console errors, no
  CSP errors, one `h1`, one `main`, and zero runtime inline styles.
- Axe 4.10.3 on `/demo` in light and dark modes: zero serious or critical
  findings. Keyboard-only device creation passes. Reduced-motion transition
  duration resolves to `0.01ms`.
- Offline/update check: the page is service-worker controlled, reloads
  offline, exposes only cache `dose-compass-v2`, and opens the inventory card
  offline with `/print.css` applied.
- Privacy check: the complete route crawl and demo dose flow made zero
  cross-origin requests. Demo and real data remain in separate IndexedDB
  namespaces.
- Mobile Lighthouse 13.0.3: Performance **100**, Accessibility **100**, Best
  Practices **100**, SEO **100**, LCP **1.7 s**, CLS **0**.

Evidence screenshots and reports from the disposable worker are under
`test-results/repair/` and are intentionally not committed.

## Deployment and live identity

Deployment target: static PWA at
`https://dose-count-compass.sociobot.in`, using:

```sh
/opt/fleet/lib/deploy-static.sh dose-count-compass dist
```

Deployment completed successfully with Azure Static Web Apps deployment ID
`3197775b-0c65-4062-afb3-a6c362971941`. The custom domain remained ready and
returned HTTPS 200.

- `/opt/fleet/lib/verify-url.sh https://dose-count-compass.sociobot.in/ ...`:
  pass; load 910 ms; zero console errors; title, language, landmark, heading,
  image-alt, and button-name checks all pass.
- Fresh Chromium on live `/demo`: HTTP 200; title `Demo — Dose Count Compass`;
  three `progress.gauge` elements; zero `[style]` or `<style>` nodes; zero page
  or CSP console errors after dose, edit, cancel, and print actions.
- The live response keeps `style-src 'self'` with no relaxation. The print
  window has zero inline styles and loads only
  `https://dose-count-compass.sociobot.in/print.css`.
- Live identity/assets: custom hostname is correct; JS is
  `index-CTqnuuSi.js`; CSS is `index-DzZ7wf_z.css`; and `sw.js` contains
  `dose-compass-v2` plus `/print.css`.

## Known gaps

No known repair gaps. The counter remains a personal log, not a medical or
device-status guarantee. Users must check the physical device, label, expiry
date, and clinician or pharmacist instructions.
