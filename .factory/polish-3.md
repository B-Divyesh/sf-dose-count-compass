# Polish round 3 — zero-finding repair record

- Reviewed release candidate: `9a719cddecc2acdd4d06e704c668880e3b27519a`
- Review report: `983f77f6b03b7a99826a93649afc8a43aa5bd391`
- Repair commit: `4bbf4ea619e46c1571745b3c97aa26c6fb3cbd2b`
- Deployed build: `index-VEeVEOSw.js`, service-worker cache `dose-compass-v6`
- Live URL: <https://dose-count-compass.sociobot.in>

This record covers every finding in `review-1.md`, `review-2.md`,
`review-3.md`, `verification.md`, and `verification-2.md`. Earlier repairs
were retained and rechecked from a clean clone and on the deployed site. The
only new code defect was F-3-1.

## Review findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Visitor copy uses “backup file”; the JSON-download claim lists landing and README locations. | `@claim:json-export`; live [home](evidence/polish-3/live-home-mobile.png); live audit. |
| F-1-2 | The count flow says “Log each use. Update the count” and is claimed through zero. | `@claim:log-updates-count`; live audit count/storage check. |
| F-1-3 | Privacy copy is consistently “Saved in your browser.” | `@claim:local-only`; live audit same-origin request check. |
| F-1-4 | Connection status is factual Online/Offline; offline logging survives reload. | `@claim:offline-reload`; live audit 42 → 41 offline reload. |
| F-1-5 | README no longer exposes IndexedDB jargon and matches the browser-storage claim. | `@claim:local-only`; clean-clone claim run. |
| F-1-6 | README uses the same tested browser-storage wording instead of an untested boundary promise. | `@claim:local-only`; live audit same-origin request check. |
| F-1-7 | SPA navigation and Back focus the route h1 and announce the destination. | `route navigation updates focus, announcement, canonical, and social metadata`; live audit `routeFocus: true`. |
| F-1-8 | Each SPA route updates title, description, canonical, Open Graph, and Twitter metadata. | Route-metadata test; live audit `routes`. |
| F-1-9 | The 404 has the shared navigation/footer and legal links. | `production routes return a real missing-page response and secure cache headers`; live [404](evidence/polish-3/live-404-desktop.png). |
| F-1-10 | The eyebrow is “PRIVATE DOSE COUNT.” | Live [390 px home](evidence/polish-3/live-home-mobile.png). |
| F-1-11 | Landing and README say “full medicine app.” | Live home screenshot; copy audit. |
| F-1-12 | README capabilities are short, separate sentences with matching claims. | `copy-audit.md`; all clean-clone claim commands. |
| F-2-1 | **Start for real** resets only the demo namespace before returning to real data. | `@claim:demo-isolation`; live demo audit resets Blue rescue inhaler to 42. |
| F-2-2 | The core count claim includes hero, dashboard, footer, README, and catalog wording. | `@claim:log-updates-count`; 42 → 0 plus stored 44-log assertion. |
| F-2-3 | The landing action enters the seeded demo in one click. | `@claim:demo-isolation`; live [demo](evidence/polish-3/live-demo-mobile.png). |
| F-2-4 | Refill-reminder behavior has a precise claim and at/below-count test. | `@claim:refill-reminder`; live demo screenshot. |
| F-2-5 | The service worker precaches the 404 style and synthesizes HTTP 404 responses. | `controlled PWA returns a styled 404 online and offline without resource errors`; live audit reports HTTP 404 and Georgia styling offline. |
| F-2-6 | “Tracked devices” is an h2 before device h3 headings. | `dashboard heading outlines are sequential when empty and populated`; live audit route scan. |
| F-2-7 | Visitor wording uses backup file and dose-history spreadsheet; extensions are developer documentation only. | `@claim:json-export`, `@claim:csv-export`; copy audit and live home screenshot. |
| F-2-8 | “Threshold” and vague action copy were replaced by “refill reminder” and “Plan a refill at your chosen count.” | `@claim:refill-reminder`; copy audit. |
| F-2-9 | The preview heading is “Check doses left and refill status.” | Live home screenshot; copy audit. |
| F-2-10 | The first screen states tested privacy, offline, and free-use facts. | `@claim:free-to-use`; live audit action is 44 px and ends at y=432 at 390 × 844. |
| F-3-1 | Changed `/log` title, Open Graph title, and Twitter title to **Dose Count Compass — Track device doses**. Added exact regression assertions. | `route navigation updates focus, announcement, canonical, and social metadata`; live audit `f3_1`; [live log screenshot](evidence/polish-3/live-log-title.png). |

All screenshot and live-audit evidence in the table was captured from
<https://dose-count-compass.sociobot.in> after static deployment.

## Earlier verification findings

| Finding group | Retained repair and current evidence |
| --- | --- |
| Broken paid offer / absent unlock | The unsupported offer remains absent. `@claim:free-to-use` completes add-and-log with no billing traffic. |
| Real/demo leakage and broken `?demo=1` | Separate `real:` and `demo:` IndexedDB namespaces; `@claim:demo-isolation` and live audit verify query normalization, no leakage, and reset-on-exit. |
| Unsafe import or deletion | Schema validation, explicit replacement confirmation, and 30-second Undo remain. `@claim:backup-import`; `deleting a device is confirmed and can be undone`. |
| Weak CSV or print proof | CSV assertions inspect three device rows and five dose-log rows; print assertions inspect all sample names. `@claim:csv-export`; `@claim:print-card`. |
| Keyboard, file focus, dialog return, 200% reflow, and target size | Skip-link order, dialog return focus, visible import focus, 200% reflow, and 390 px 44-px targets are covered by the named keyboard and mobile tests. |
| Missing page, caching, CSP/permissions, connection status, threshold validation, and hidden toast | The CSP/404 suite verifies status, cache headers, PWA 404, and no CSS resource error. Full suite verifies the remaining behavior. |

## Verification

Fresh clone `/tmp/dcc-clean-polish3.WqJNU6` at the repair commit passed:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS
npm run build                  PASS — dist/ produced
npm test                       PASS — 23 Playwright tests
10 exact claims.json commands  PASS — one matching tagged test each
```

The ten independently run claim commands were `offline-reload`, `csv-export`,
`json-export`, `backup-import`, `print-card`, `local-only`,
`log-updates-count`, `refill-reminder`, `demo-isolation`, and `free-to-use`.
The static inventory check also found exactly 10 claims and exactly one tagged
test for each.

Live checks passed after deployment: `verify-url.sh` cold-loaded the home page
in 829 ms with no console errors; `live-audit.mjs` passed the mobile first
screen, demo isolation, offline reload, focus announcement, five SPA routes,
real 404, same-origin traffic, and six live axe scans. Live mobile Lighthouse:
Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s,
LCP 1.2 s, CLS 0, TBT 40 ms.

There are no remaining findings or known gaps.
