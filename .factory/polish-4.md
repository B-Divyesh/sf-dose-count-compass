# Polish round 4 — cumulative zero-finding repair record

- Reviewed release candidate: `44ccda10d8751d0bbf63d6ba4dd5dbf498f6d310`
- Review report commit: `0bf3fb319e62d0c01966a3a416cb88cd0fb9e978`
- Product repair commit: `264b90c0507ff7e6cfd11f9d083e08c9820bc84a`
- Released version: `1.2.2`; service-worker cache: `dose-compass-v7`
- Static deployment: `1c0b3a90-6b09-49fd-b6d7-509439a5b3bb`
- Live URL: <https://dose-count-compass.sociobot.in>

Every finding in `review-1.md` through `review-4.md` and every earlier polish
record was rechecked against the implementation, from a clean clone, and on
the deployed site. The live audit is
`.factory/evidence/polish-4/live-audit.json`.

## Review finding map

| Finding | Change retained or made | Test and deployed evidence |
| --- | --- | --- |
| F-1-1 | Visitor copy says “backup file”; the backup claim includes landing, tools, privacy, and README locations. | `@claim:json-export`; `clean-clone.log`; live home in `live-home-mobile.png`. |
| F-1-2 | The count flow says “Log each use. Update the count” and is proven through zero. | `@claim:log-updates-count`; clean clone; live demo flow in `live-audit.json`. |
| F-1-3 | Privacy copy consistently says “Saved in your browser.” | `@claim:local-only`; live audit reports `sameOriginOnly: true`. |
| F-1-4 | The shell states only Online/Offline; offline logging persists through reload. | `@claim:offline-reload`; live audit retains 41 after an offline reload. |
| F-1-5 | README uses plain browser-storage wording, not IndexedDB jargon. | `@claim:local-only`; `.factory/copy-audit.md`; live same-origin/storage flow. |
| F-1-6 | README and the product use the same tested browser-storage wording. | `@claim:local-only`; `clean-clone.log`. |
| F-1-7 | Client navigation and Back focus the route `h1` and update a polite announcer. | `route navigation updates focus, announcement, canonical, and social metadata`; live audit `routeFocus: true`. |
| F-1-8 | Every SPA route updates title, description, canonical, Open Graph, and Twitter metadata. | Same route test; all five live routes recorded in `live-audit.json`. |
| F-1-9 | The styled 404 uses the shared navigation, footer, Privacy, and Terms links. | `production routes return a real missing-page response and secure cache headers`; `live-404-desktop.png`. |
| F-1-10 | The first-screen label is “PRIVATE DOSE COUNT.” | `.factory/copy-audit.md`; `live-home-mobile.png`. |
| F-1-11 | Landing and README say “full medicine app.” | `.factory/copy-audit.md`; live mobile screenshot. |
| F-1-12 | README capabilities are separate short sentences; none exceeds 22 words. | `.factory/copy-audit.md`; all exact claim commands in `clean-clone.log`. |
| F-2-1 | **Start for real** restores only the demo namespace, preserving real data. | `@claim:demo-isolation`; live audit changes 42→41, exits, and returns to 42. |
| F-2-2 | The core count claim covers hero, metadata, dashboard, footer, README, and catalog. | `@claim:log-updates-count`; 42→0 with stored history and disabled zero state. |
| F-2-3 | The landing action opens three ready-to-use samples in one click. | `@claim:demo-isolation`; `live-demo-mobile.png`; live audit `samples: 3`. |
| F-2-4 | Refill reminder behavior is claimed and checked above, at, and below the chosen count. | `@claim:refill-reminder`; clean-clone claim transcript. |
| F-2-5 | The PWA precaches the styled 404 and returns HTTP 404 online and offline. | `controlled PWA returns a styled 404 online and offline without resource errors`; live audit `missingStatus: 404`. |
| F-2-6 | “Tracked devices” is an `h2` before device-card `h3`s. | `dashboard heading outlines are sequential when empty and populated`; 23-test suite. |
| F-2-7 | Visitor copy uses “backup file” and “dose-history spreadsheet.” | `@claim:json-export`, `@claim:csv-export`; `.factory/copy-audit.md`. |
| F-2-8 | Copy and forms use “refill reminder” and name the refill action. | `@claim:refill-reminder`; `.factory/copy-audit.md`; live home screenshot. |
| F-2-9 | The preview heading is “Check doses left and refill status.” | `.factory/copy-audit.md`; `live-home-mobile.png`. |
| F-2-10 | The first screen states browser privacy, offline use, and free status. | `@claim:free-to-use`; live audit shows all three facts and a visible 44 px action. |
| F-3-1 | `/log` uses “Dose Count Compass — Track device doses” for document and social titles. | Route metadata test; exact live title values in `live-audit.json`. |
| F-4-1 | Replaced “This shelf is empty” with the direct `h1` “Page not found.” Advanced the PWA cache so existing installs receive the corrected document. | `production routes return a real missing-page response and secure cache headers`; `controlled PWA returns a styled 404 online and offline without resource errors`; live raw/offline checks; `live-404-desktop.png`. |

## Earlier unnumbered verification findings

| Finding group | Current implementation and evidence |
| --- | --- |
| Broken paid offer | The unsupported offer remains removed. `@claim:free-to-use` completes core use without purchase controls or billing traffic. |
| Demo/real leakage and broken `?demo=1` | Separate `real:` and `demo:` IndexedDB databases, history reloads the active namespace, and `?demo=1` enters `/demo`. `@claim:demo-isolation` and the live audit pass. |
| Unsafe import and delete loss | Imports are schema-validated and confirmed with Undo; deletion is confirmed and undoable. `@claim:backup-import` and `deleting a device is confirmed and can be undone` pass. |
| Weak CSV and print tests | CSV checks all three device rows and five log rows; print checks all three sample names. `@claim:csv-export` and `@claim:print-card` pass. |
| Keyboard, focus, and 200% reflow | Skip-link order, dialog return focus, visible import focus, and 200% reflow pass in `keyboard order, dialog return focus, file focus, and 200% reflow are usable`. |
| Touch targets and mobile overflow | `390px mobile has no horizontal overflow and all visible controls meet target size` passes; live first-screen evidence is `live-home-mobile.png`. |
| Missing routes, caching, and security headers | Raw and controlled routes return styled HTTP 404; immutable assets, CSP `frame-ancestors`, and Permissions-Policy pass in `tests/csp.spec.ts`. |
| Connection, validation, toast, and initial focus | Online/Offline state, refill-count validation, hidden toast, normal initial focus, and dialog return focus remain covered by the full suite. |

## Claims, build, and live evidence

`.factory/claims.json` contains ten unique claims. Each has exactly one
`@claim:<id>` test and there are no extra claim tags; see
`claims-inventory.json`. From clean clone `/tmp/dcc-polish4-final.hAxzhT` at
commit `437c4f3ea37cc4fa112cf25edfab5dfe7aa006db`:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS
10 exact claims.json commands  PASS — one test each
npm test                       PASS — 23/23
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

The public cold-browser audit passed the 390 × 844 first screen, demo
isolation/reset, `?demo=1`, offline write/reload, route focus/announcements,
five route metadata sets, raw and controlled 404s, all internal links and
required assets, same-origin-only traffic, and axe scans on every route plus
404. `verify-url.sh` found no console errors. Live Lighthouse scored 100 for
Performance, Accessibility, Best Practices, and SEO; FCP was 0.8 s, LCP
1.1 s, CLS 0, and TBT 30 ms.

`deployment-integrity.txt` confirms that the live HTML, JS, CSS, service
worker, 404, manifest, and hero image byte-match `dist/`. No finding remains.
