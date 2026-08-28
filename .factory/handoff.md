# Repair handoff — Dose Count Compass

Repair target: verifier report recorded in `aa98a921fa23053e71e748e4114d9e6841f46acf`, against candidate `6d57bba1bf3e98d71d95ad7d69623048c8b3fe1a`.

## What changed

- Removed the unregistered Compass Plus purchase offer and all $9/license copy. There was no registered checkout or paid capability, so retaining the offer would have been false. The complete free dose-counting workflow remains.
- Corrected demo routing and namespace loading. `/demo`, `/?demo=1`, forward, and Back now reload the matching `demo:` or `real:` IndexedDB database before rendering. Demo exports cannot contain real records.
- Made import safe: backups must have version `1`, valid device/log arrays, whole-number plausible counts, valid timestamps, and unique IDs. A valid import previews its replacement count, requires an explicit confirmation, and exposes a 30-second undo.
- Deleting a device now asks for the named device and has the same undo path. Refill thresholds cannot exceed total doses.
- CSV now exports device rows and every dose-log event, including timestamp and dose amount. Claim tests inspect the complete CSV and printable inventory.
- Repaired keyboard/reflow/touch behavior: no initial forced heading focus, visible proxy focus for backup import, modal focus return, 44px controls, 390px layout and 200% reflow coverage, and no idle toast artifact.
- Added explicit online/offline status, a real 404 response/page, immutable caching for hashed assets, `frame-ancestors 'none'`, and Permissions-Policy. The service-worker cache is now `dose-compass-v3` and precaches the 404 page.

## How to run

```sh
npm ci
npm run lint
npm run build
npm test
npm run serve:test
```

The production artifact is `dist/` with `index.html` at its root. The demo is at `/demo` (or `/?demo=1`); it uses IndexedDB `demo:dose-count-compass`. Real records use `real:dose-count-compass`.

## Verification evidence

Run locally on 2026-08-28 UTC:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS — tsc --noEmit
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
npm test                       PASS — 17/17 Playwright tests
```

The five original claim commands and the added `demo-isolation` claim all run from `npm test` and pass independently. They cover offline reload, event-level CSV, JSON backup, printable inventory contents, no cross-origin demo requests, and browser-history demo isolation.

Browser coverage includes desktop, 390×844 mobile, 200% text reflow, Tab/Escape and focus return, import focus treatment, light/dark axe scans across `/`, `/demo`, `/log`, `/privacy`, `/terms`, and 404, plus reduced-motion coverage. There were no serious or critical axe findings. The factory `verify-url.sh` against the local production server passed: HTTP 200 in 542 ms, zero page or console errors, title/lang/main, image alt text, and button names all valid.

Final build payload: 18.33 KB JavaScript (6.82 KB gzip) and 10.37 KB CSS (3.17 KB gzip), below the static-product budgets. The original 37.5 KB hero image remains below the mobile image budget. A Lighthouse CLI attempt was made with the installed Chromium but the container's Lighthouse 13 runner closed its browser during the BFCache audit before producing a report; this is a local runner limitation, not a product failure. The prior independent live run was 100/100/100/100; rerun Lighthouse after deployment for a fresh live score.

## Known gaps / next steps

- No paid tier is shipped. Register a real Sociobot product and implement a distinct paid capability only when that commercial workflow is authorized.
- Deployment is performed after this handoff using the factory static deploy script for `dose-count-compass`; verify the live URL, headers, offline reload, and service-worker update after propagation.
