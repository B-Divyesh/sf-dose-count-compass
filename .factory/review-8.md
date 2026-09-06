# Count medicine-device doses — review 8

- Reviewed: 2026-09-06 UTC
- Work order: `dose-count-compass-review-8`
- Live URL: <https://dose-count-compass.sociobot.in>
- Implementation candidate: `f9e96d315183c516be71d4e2e1e3e982d80621ab`
- Documentation base reviewed: `37b829a7e6f32ef4f82008279bd77fb75e64daee`
- Verdict: **PASS**
- Findings: **0 blocking, 0 major, 0 minor**
- Untested public claims: **0**

**PASS.** There are zero findings of every severity and zero untested public claims. Product code was not changed.

## First screen before scrolling

Fresh phone (390 × 844) and desktop (1440 × 900) contexts opened the live home page at scroll position zero.

- Job: **Count doses before you run out.**
- Audience: **For people who track doses but do not need a full medicine app.**
- First action: **Try it with sample data**; it says **See three devices already counted.**

Both contexts returned 200, had no horizontal overflow, one `h1`, one `main`, `lang="en"`, the title **Dose Count Compass — Count medicine doses**, and no console, page, failed-request, or cross-origin request error. The three facts state browser storage, offline use after the first visit, and free use. Rendered landing, legal, app, README, and catalog copy remains plain and consistent; reliance claims map to the claims inventory.

## Live job and sandbox checks

- One landing click opened Blue rescue inhaler 42/200, Saline spray 86/120, and Travel injector 1/2.
- The persistent **Demo — sample data, nothing is saved** label included **Reset demo** and **Start for real**. Blue changed 42 → 41; reset restored 42.
- A disposable real record remained absent in demo, returned after Start for real, and remained absent after `/?demo=1` normalized to `/demo`. The query route reset Blue to 42. This proves the exercised real/demo stores remained isolated.
- A real device completed 2 → 1 → 0; it showed **Refill reminder** at one, **Empty — refill now** at zero, and disabled further logging. Invalid counts kept the form open and announced a correction; corrected values recovered normally.
- The clean suite proves invalid-backup rejection, confirmed replacement and Undo, named delete confirmation and Undo, complete JSON/CSV downloads, print content, and saved edits. Both Undo paths remain available at 29,999 ms and expire at 30,000 ms.
- Offline demo logging changed Blue 42 → 41 and retained 41 after reload. The live interface displayed **Offline**. The controlling worker is `/sw.js`; `registration.update()` completed. The manifest is standalone with versioned start URL, matching colors, and 192/512 maskable icons.

The complete live demo/real/download/print flow made same-origin requests only. There is no analytics, CDN runtime, AI, billing, sign-in, backend, or API. This static local-first PWA has no tenant, restart, health, or 429/`Retry-After` surface; those backend checks do not apply. It is free, so paid-unlock checks do not apply.

## Claims and clean checkout

Clean checkout: `/tmp/dcc-review8-clean.UMb2bc` at documentation SHA `37b829a`. The two commits after the implementation candidate change only review evidence, handoff, and verification documentation, so this clean build represents candidate `f9e96d3`.

After `npm ci`, every declared command in `.factory/claims.json` ran separately and passed. Static inspection found 12 unique entries, exactly one matching `@claim:<id>` test per entry, and no extra claim tag.

| Claim | Exact command | Result |
| --- | --- | --- |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — offline 42 → 41 reloads retained |
| `csv-export` | `npm test -- --grep @claim:csv-export` | PASS — 3 device and 5 log rows |
| `json-export` | `npm test -- --grep @claim:json-export` | PASS — all 3 samples in backup |
| `backup-import` | `npm test -- --grep @claim:backup-import` | PASS — reject, confirm, replace, Undo |
| `print-card` | `npm test -- --grep @claim:print-card` | PASS — all 3 samples on card |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — real persistence and same-origin traffic |
| `log-updates-count` | `npm test -- --grep @claim:log-updates-count` | PASS — 42 → 0 and disabled zero control |
| `refill-reminder` | `npm test -- --grep @claim:refill-reminder` | PASS — above, at, and below chosen count |
| `demo-isolation` | `npm test -- --grep @claim:demo-isolation` | PASS — samples, reset, and separate storage |
| `free-to-use` | `npm test -- --grep @claim:free-to-use` | PASS — add/log with no billing traffic |
| `undo-window` | `npm test -- --grep @claim:undo-window` | PASS — both 29,999/30,000 ms boundaries |
| `edit-device` | `npm test -- --grep @claim:edit-device` | PASS — details survive reload |

```text
npm ci                         PASS — 20 packages, 0 vulnerabilities
npm run lint                   PASS — tsc --noEmit
npm test                       PASS — 28/28 Playwright tests
npm run build                  PASS — dist/ produced
npm audit --audit-level=high   PASS — 0 vulnerabilities
```

There are **zero false, incomplete, missing, or untested public claims**.

## Accessibility, routes, privacy, and design

- Live axe-core 4.10.3 scans had zero violations, including minor, moderate, serious, and critical, on `/`, `/demo`, `/log`, `/privacy`, `/terms`, and the designed 404 in light and dark modes.
- `verify-url.sh` passed in 611 ms with title, language, h1, main, alt text, labels, and no console errors on the 200 home page.
- Keyboard Tab reached the skip link; Enter, Escape, dialog return focus, file focus, client-route focus/announcement, 200% text reflow, and 44px targets pass in the clean suite. Reduced motion resolved to 0.01 ms.
- Fresh live focus measurements found a 4px light ring at **6.99:1** against Paper and a dark ring at **7.50:1** against Night, both above the 3:1 rule.
- `/`, `/demo`, `/log`, `/privacy`, and `/terms` returned 200 with route titles. All internal links resolve to those routes. The marked external privacy link was verified in markup but not opened, respecting the work-order boundary.
- `/review8-intentional-missing` returned HTTP 404 and rendered **Page not found**, shared navigation/footer, legal links, and a route home. Its expected browser 404 resource console line is not a defect.
- The live response has self-only CSP with header-delivered `frame-ancestors 'none'`, HSTS, `nosniff`, strict referrer policy, and restrictive permissions. The visual system matches the documented paper-cut medicine-cabinet thesis and records original-art provenance.

Fresh mobile Lighthouse 13.0.1: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.76 s, LCP 1.05 s, CLS 0, TBT 43 ms, and 51,227 bytes transfer. The clean build contains 20,458 bytes of JS and 10,947 bytes of CSS, plus the 37,512-byte hero image, within budget.

## Candidate and live match

SHA-256 values match between the clean candidate build and live `index.html`, hashed JS/CSS, service worker, manifest, hero, icons, social image, 404 HTML/CSS, print CSS, robots, and sitemap. The deployed product is the implementation reviewed, not merely a later report-only commit.

## Earlier finding disposition

Every finding in earlier review and verification reports, including minor findings, was checked against current live behavior or the clean suite.

| Finding | Current disposition |
| --- | --- |
| F-1-1 | Closed — backup wording maps to the complete JSON download test. |
| F-1-2 | Closed — count is tested 42 through zero without unsupported timing. |
| F-1-3 | Closed — storage wording is listed; live flow stayed same-origin. |
| F-1-4 | Closed — connection state and offline reload work. |
| F-1-5, F-1-6 | Closed — README uses the tested browser-storage boundary. |
| F-1-7 | Closed — route focus/announcement, dialog return, and focus contrast pass. |
| F-1-8 | Closed — route title, description, canonical, and social metadata update. |
| F-1-9, F-4-1 | Closed — online and cached missing routes render the shared styled 404. |
| F-1-10, F-1-11, F-1-12 | Closed — first-screen label/audience and README plain wording pass. |
| F-2-1 | Closed — real/demo storage stays separate through reset and re-entry. |
| F-2-2, F-2-3 | Closed — count-through-zero and one-click three-sample demo pass. |
| F-2-4 | Closed — reminder status passes above, at, and below its count. |
| F-2-5 | Closed — controlled online/offline missing routes return styled 404s. |
| F-2-6 | Closed — `Tracked devices` h2 precedes device h3 headings. |
| F-2-7, F-2-8, F-2-9, F-2-10 | Closed — terminology, preview, and first facts are consistent. |
| F-3-1 | Closed — `/log` title is **Dose Count Compass — Track device doses**. |
| F-5-1 | Closed — both Undo boundaries pass at 29,999/30,000 ms. |
| F-5-2, F-5-3 | Closed — device-specific names and persistent edits pass. |
| F-5-4, F-5-5 | Closed — download wording and README heading remain direct. |
| F-5-6 | Closed in markup — marked direct external privacy destination is present. |
| F-7-1 | Closed — live focus rings measure 6.99:1 light and 7.50:1 dark. |

Earlier unnumbered defects are also closed: removed broken paid offer; demo leak/query repair; import/delete recovery; complete CSV/print proof; keyboard, reflow, target-size, response-protection, cache, connection-state, invalid refill-count, and empty-toast coverage. No finding remains open.

## Release decision

**PASS.** Zero findings of every severity. Zero untested public claims.
