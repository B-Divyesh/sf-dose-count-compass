# Polish round 2 — cumulative repair record

- Reviewed candidate: `9f163af5e8150f6de3e297b3e98c57d122c5b231`
- Review commit: `49861944efdd1b58f0cda0f6e618dd7ab36bba3a`
- Source repair: `f6ef6958c3a7e093c406029ca5bc0a324908aea2`
- Live URL: <https://dose-count-compass.sociobot.in>
- Live audit: `.factory/evidence/polish-2/live-audit.json`

Every finding from review rounds 1 and 2 was rechecked. The live audit used
fresh 390 × 844 and 1440 × 900 browser contexts after the production deploy.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced file-format jargon with “Download a backup file” and listed every backup promise. | `@claim:json-export`; `clean-claims.log`; live home copy in `live-home-mobile.png`. |
| F-1-2 | Kept the exact “Log each use. Update the count.” behavior under the core count claim. | `@claim:log-updates-count` counts 42 through 0 and checks storage/disabled state; `clean-claims.log`. |
| F-1-3 | Standardized landing privacy copy to “Saved in your browser” and listed all public locations. | `@claim:local-only`; live audit reports no cross-origin traffic. |
| F-1-4 | Connection copy states only Online/Offline; offline persistence has its own exact claim. | `@claim:offline-reload`; live audit writes 42 → 41 offline and retains 41 after reload. |
| F-1-5 | Removed IndexedDB jargon from README visitor copy and tests real browser persistence. | `@claim:local-only`; `clean-claims.log`. |
| F-1-6 | README uses the same tested “Saved in your browser” wording. | `@claim:local-only`; live audit `privacy.crossOriginRequests: []`. |
| F-1-7 | Route h1 elements accept programmatic focus and a polite route announcer reports navigation and Back. | `route navigation updates focus, announcement, canonical, and social metadata`; live audit `routeFocus: true`. |
| F-1-8 | Every SPA route updates title, description, canonical, Open Graph URL/title/description, and Twitter title/description. | Same route test; live audit `routeMetadata` checks `/`, `/demo`, `/log`, `/privacy`, and `/terms`. |
| F-1-9 | The designed 404 uses the shared navigation/footer and includes Privacy and Terms. | `production routes return a real missing-page response and secure cache headers`; `live-404-desktop.png`; live audit `online404`. |
| F-1-10 | Replaced the unclear eyebrow with “PRIVATE DOSE COUNT.” | `live-home-mobile.png`; `.factory/copy-audit.md`. |
| F-1-11 | Landing and README now say “people who track doses but do not need a full medicine app.” | Live audit `firstScreen.lead`; `.factory/copy-audit.md`. |
| F-1-12 | Split README capabilities into short sentences and mapped each promise to a claim. | `.factory/copy-audit.md`; all 10 commands in `clean-claims.log`. |
| F-2-1 | **Start for real** restores only the demo namespace before loading the untouched real namespace. | `@claim:demo-isolation`; live audit changes 42 → 41, exits, re-enters through `?demo=1`, sees 42, and retains the real record. |
| F-2-2 | Expanded the core claim to the hero, metadata, footer, dashboard, and README; its test runs to zero. | `@claim:log-updates-count`; one test counts 42 through 0, checks 44 stored logs, “Empty,” and the disabled control. |
| F-2-3 | Added the hero outcome to demo isolation and made the tagged test click the home action before checking all three samples. | `@claim:demo-isolation`; live audit `demoIsolation`; `live-demo-mobile.png`. |
| F-2-4 | Added a refill-reminder claim and an exact transition test above, at, and below 30. | `@claim:refill-reminder`; `clean-claims.log`. |
| F-2-5 | Precached `404.css`, synthesizes a cached HTTP 404 response, added complete 404 metadata, and retained the shared styled shell offline. | `controlled PWA returns a styled 404 online and offline without resource errors`; live audit reports offline and online status 404, Georgia styling, full metadata, and legal links; `live-404-desktop.png`. |
| F-2-6 | Added the visible “Tracked devices” h2 above h3 device names. | `dashboard heading outlines are sequential when empty and populated`; live levels `[1,2,3,3,3,2]`. |
| F-2-7 | Visitor copy/actions now use “backup file” and “dose-history spreadsheet”; extensions appear only in the developer file-format note. | `@claim:json-export`; `@claim:csv-export`; `live-home-mobile.png`; `.factory/copy-audit.md`. |
| F-2-8 | Replaced “threshold” and vague “Act” copy with “refill reminder” and “Plan a refill at your chosen count.” | `@claim:refill-reminder`; `live-home-mobile.png`; `.factory/copy-audit.md`. |
| F-2-9 | Renamed the preview heading to “Check doses left and refill status.” | `live-home-mobile.png`; `.factory/copy-audit.md`. |
| F-2-10 | The three first-screen facts now cover browser privacy, offline use, and “Free to use.” | `@claim:free-to-use`; live audit `firstScreen.facts`; action bottom 432 px at 390 × 844. |

## Cumulative regression evidence

Earlier verification defects remain covered by the 23-test suite: unsupported
paid offer absent; real/demo namespace isolation; safe confirmed import and
delete with Undo; full CSV and print contents; keyboard/dialog/file focus;
200% reflow; 44 px mobile targets; HTTP 404; immutable caching; CSP/security
headers; connection state; reminder validation; and hidden toast state.

- Clean clone: `npm ci`, `npm run lint`, all 10 exact claim commands,
  `npm test` (23/23), and `npm run build` passed. Logs are in
  `.factory/evidence/polish-2/clean-*.log`.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.7 s, CLS 0, total blocking time 0 ms.
- Live verifier: title/lang/h1/main/alt/button labels passed with no home-page
  console errors. See `live-verify/verify.json`.
- Live axe: zero serious or critical findings on all five routes and the 404.
- Production assets exactly matched the deployed build:
  `index-B8_aQWlQ.js` and `index-6GeMvAbO.css`.

No finding of either severity remains open.
