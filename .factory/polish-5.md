# Polish round 5 — cumulative zero-finding repair record

- Reviewed release candidate: `59c9c2ff7d7314b326a7adf48401f3849eee21a3`
- Review report: `d70f89838c85e963392f0a45cd06acf01269f381`
- Repair commit: `3e3b78cab86b9a8ed8c9afb3dfd5713f34b33392`
- Released version: `1.2.3`; service-worker cache: `dose-compass-v8`
- Static deployment: `8253fab3-aa9f-4fc4-909a-f50153a090ec`
- Live URL: <https://dose-count-compass.sociobot.in>

All `review-*.md`, `polish-*.md`, and verification records were reread. This
record maps every numbered finding, including repairs retained from earlier
rounds. The live audit and screenshots are in `.factory/evidence/polish-5/`.

## Finding map

| Finding | Change in the current product | Evidence |
| --- | --- | --- |
| F-1-1 | Uses “backup file”; the JSON-download claim lists the landing, tools, privacy page, and README. | `@claim:json-export`; live audit and `live-home-mobile.png`. |
| F-1-2 | The count claim covers the headline, dashboard, footer, README, catalog, zero state, and stored dose log. | `@claim:log-updates-count`; live demo audit. |
| F-1-3 | Privacy copy consistently says “Saved in your browser.” | `@claim:local-only`; live audit same-origin flow. |
| F-1-4 | Connection text is factual Online/Offline; a dose logged offline survives reload. | `@claim:offline-reload`; `live-audit.json` records 42 → 41 after offline reload. |
| F-1-5 | README uses plain browser-storage copy rather than IndexedDB jargon. | `@claim:local-only`; `.factory/copy-audit.md`. |
| F-1-6 | README uses the same tested browser-storage wording as the product. | `@claim:local-only`; clean-clone claim run. |
| F-1-7 | SPA navigation and Back focus the destination h1 and update the polite route announcer. | `route navigation updates focus, announcement, canonical, and social metadata`; live route audit. |
| F-1-8 | Every SPA route updates title, description, canonical, Open Graph, and Twitter metadata. | Route metadata test; live route audit. |
| F-1-9 | The styled 404 has shared navigation/footer plus Privacy and Terms. | `production routes return a real missing-page response and secure cache headers`; `live-404-desktop.png`. |
| F-1-10 | The first-screen supporting label is “PRIVATE DOSE COUNT.” | `.factory/copy-audit.md`; `live-home-mobile.png`. |
| F-1-11 | Landing and README say “full medicine app.” | `.factory/copy-audit.md`; live first-screen audit. |
| F-1-12 | README capability sentences are short and individually claim-covered. | `.factory/copy-audit.md`; all clean-clone claim commands. |
| F-2-1 | **Start for real** restores the demo namespace and preserves the real namespace. | `@claim:demo-isolation`; live audit confirms reset to 42 and no real-data leakage. |
| F-2-2 | The core count promise is claimed at every public location and driven through zero. | `@claim:log-updates-count`. |
| F-2-3 | The landing action opens three seeded samples in one click; `?demo=1` enters the same isolated demo. | `@claim:demo-isolation`; `live-demo-mobile.png`; live audit. |
| F-2-4 | Refill reminder behavior is proved above, at, and below the chosen count. | `@claim:refill-reminder`. |
| F-2-5 | The service worker precaches the styled 404 and returns HTTP 404 online and offline. | `controlled PWA returns a styled 404 online and offline without resource errors`; `live-404-desktop.png`. |
| F-2-6 | “Tracked devices” is an h2 before device-card h3 headings. | `dashboard heading outlines are sequential when empty and populated`. |
| F-2-7 | Visitor copy uses “backup file” and “dose-history spreadsheet.” | `@claim:json-export`, `@claim:csv-export`; copy audit. |
| F-2-8 | Product copy and forms use “refill reminder” with a specific refill action. | `@claim:refill-reminder`; copy audit. |
| F-2-9 | The preview heading names its contents: “Check doses left and refill status.” | `live-home-mobile.png`; copy audit. |
| F-2-10 | The first screen gives tested browser, offline, and free-use facts. | `@claim:free-to-use`; live first-screen audit shows a 44 px action fully visible at 390 × 844. |
| F-3-1 | `/log` title and social title are “Dose Count Compass — Track device doses.” | Route metadata regression test; live route audit. |
| F-4-1 | The online and cached missing-page h1 is “Page not found.” | Controlled 404 test; `live-404-desktop.png`. |
| F-5-1 | Added the `undo-window` claim and a timer-boundary test for both import and deletion. Recovery state now persists across same-namespace rerenders but is cleared before a real/demo namespace switch. | `@claim:undo-window`; live check at `/demo` found Undo visible at 29,999 ms and hidden at 30,000 ms for both paths; `live-undo-window.png`. |
| F-5-2 | Dose and Edit controls expose a device-specific accessible name; progress labels also name the device. | `device-card action names identify their device`; `live-audit.json` lists six unique sample action names. |
| F-5-3 | Rewrote the form help as “You can edit the device details later” and added a persistence claim. | `@claim:edit-device`; live edit/reload check preserved “Live edited” with 6 doses left. |
| F-5-4 | Download success feedback says “Dose-history spreadsheet downloaded.” | `live-audit.json`; `live-demo-mobile.png`. |
| F-5-5 | Renamed the README heading to “Run locally.” | `README.md`; `.factory/copy-audit.md`. |
| F-5-6 | The privacy page now links to the marked external Param Factory product listing. | `privacy page provides a direct, marked external product-listing link`; live audit reached <https://hello-factory.sociobot.in/catalog/?q=dose-count-compass> with HTTP 200. |

## Earlier unnumbered verification findings

The complete suite retains coverage for the unsupported paid offer, demo/real
storage isolation, import validation and confirmation, deletion recovery,
complete CSV/print contents, keyboard and dialog focus, 200% reflow, 44 px
touch targets, immutable assets, CSP/permissions policy, connection state,
refill-count validation, and the hidden empty-toast state. No prior repair
regressed.

## Exact verification evidence

Fresh clone `/tmp/dcc-polish5.UFdI2m` at repair commit `3e3b78c` passed:

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS
12 exact claims.json commands  PASS — one matching tagged test each
npm test                       PASS — 27/27 Playwright tests
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

The 12 individually run commands covered `offline-reload`, `csv-export`,
`json-export`, `backup-import`, `print-card`, `local-only`,
`log-updates-count`, `refill-reminder`, `demo-isolation`, `free-to-use`,
`undo-window`, and `edit-device`. The claim inventory check found exactly 12
claims and exactly one tag for each.

After deployment, `verify-url.sh` cold-loaded the live home page in 956 ms
with no console errors and verified title, language, h1, main, alt text, and
button labels. The live Playwright audit passed the 390 × 844 first screen,
one-click demo, isolated `?demo=1` entry, unique accessible names, live
privacy link, offline write/reload, every core route, styled 404, and axe
serious/critical scans. The deployed JS (`index-BfVHYZVo.js`) and CSS
(`index-6GeMvAbO.css`) byte-match `dist/`.

Live Lighthouse scored 100 for Performance, Accessibility, Best Practices,
and SEO. FCP was 870.8 ms, LCP 1143.8 ms, CLS 0, and TBT 50 ms; raw initial JS
is 20.46 kB (7.40 kB gzip).

No finding remains open.
