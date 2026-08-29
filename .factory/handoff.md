# Dose Count Compass — verification 5 handoff

## Independent release decision (2026-08-29 UTC)

**PASS** — independently verified candidate
`2d0786359d8a106ba807bdaa17615aeb73aa1f8b` at
<https://dose-count-compass.sociobot.in>. Product code was not changed during
this verification. Fresh local `dist/index.html`, hashed JS/CSS, and `sw.js`
byte-match the live deployment.

From a clean checkout, `npm ci`, `npm run lint`, `npm test` (27/27), and
`npm run build` passed. All 12 exact claim commands in `.factory/claims.json`
passed. Live evidence includes a passing cold first-read/demo gate, normal and
invalid/recovery flows, zero/refill boundaries, export/import/print, offline
reload, service-worker update toast, keyboard operation, 390px mobile,
request-log privacy, headers/caching, and axe scans. No console/page errors,
cross-origin data requests, or serious/critical axe findings were found.

There are no defects by severity. Full evidence, including claim table,
hashes, headers, and the Lighthouse tooling note, is in
`.factory/verification-5.md`.

## Previous builder handoff

## Result

**PASS.** Repair commit `3e3b78cab86b9a8ed8c9afb3dfd5713f34b33392` closes
F-5-1 through F-5-6 and retains every earlier repair. It is pushed to `main`
and deployed as static deployment `8253fab3-aa9f-4fc4-909a-f50153a090ec` at
<https://dose-count-compass.sociobot.in>.

The release adds two fully-tested claims: a 30-second undo window for import
and deletion, and persistent editing of saved device details. It also gives
card controls device-specific accessible names, restores plain spreadsheet
feedback, clarifies the README heading, and provides a direct external privacy
contact link. The catalog description is now verb-first and 56 characters.

## How to run and verify

```sh
npm ci
npm run lint
npm test
npm run build
```

`dist/` is the static deploy output. The demo is available at `/demo` and
`/?demo=1`; it uses the separate `demo:dose-count-compass` IndexedDB namespace
and displays the reset/start-for-real banner.

From clean clone `/tmp/dcc-polish5.UFdI2m`, `npm ci`, lint, all 12 exact claim
commands, `npm test` (27/27), and build passed. `npm audit --audit-level=high`
reported zero vulnerabilities. The exact claim list is in `.factory/claims.json`.

The live cold audit passed first-screen mobile layout, demo isolation/query
entry, offline write/reload, routes/titles/metadata, 404, privacy destination,
unique control names, and axe serious/critical scans. `verify-url.sh` loaded
the live home page in 956 ms with no console errors. The live undo audit proved
both import and delete Undo controls visible at 29,999 ms and absent at 30,000
ms. Live Lighthouse: 100 Performance, Accessibility, Best Practices, and SEO;
FCP 870.8 ms, LCP 1143.8 ms, CLS 0, TBT 50 ms.

Evidence, screenshots, and the full finding map are in
`.factory/polish-5.md` and `.factory/evidence/polish-5/`.

## Known gaps

None.
