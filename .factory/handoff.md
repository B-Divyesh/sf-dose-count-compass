# Review 2 handoff — Dose Count Compass

## Result

Adversarial first-read review 2 is complete. The verdict is **FAIL** with ten
findings in `.factory/review-2.md`: five blocking, one major, and four minor.
No product source was changed.

## What was reviewed

- Cold live first reads at 390 × 844 and 1440 × 900.
- One-click demo, Reset, Start for real, real/demo IndexedDB separation,
  browser Back, offline write/reload, and same-origin traffic.
- Every landing and README sentence, term, heading, and landing action.
- Every exact command in `.factory/claims.json` from a clean clone.
- Titles, metadata, link crawl, deep routes, 404, service-worker behavior,
  focus/announcement, axe results, touch targets, reflow, visual identity, and
  asset/security basics.
- Every finding in `.factory/review-1.md` plus earlier verification defects,
  the polish record, and the prior handoff.

## Verification evidence

Clean clone: `/tmp/dcc-review-2.sGVSxp`

```text
npm ci                                      PASS; 20 packages, 0 vulnerabilities
npm run lint                                PASS
npm run build                               PASS; dist/ produced
npm test                                    PASS; 19/19
npm audit --audit-level=high                PASS; 0 vulnerabilities
all 7 exact @claim commands                 PASS; 1 test each
live verify-url.sh                          PASS; title/lang/h1/main/alt/errors
live axe serious/critical route sweep       PASS; 0 on 6 routes
```

Build sizes were 19.14 KB JS (7.03 KB gzip) and 10.51 KB CSS (3.22 KB gzip).
Live assets matched those names and used immutable caching.

## Items left

- Demo changes persist after **Start for real**.
- Core count, hero demo-result, and refill-threshold public claims are not
  fully represented by tagged claim entries/tests.
- The service-worker-controlled 404 is HTTP 200, loses its CSS offline, logs a
  console error, and lacks required route metadata.
- Dashboard device headings skip h2.
- File-format and threshold jargon, one vague heading, and the absent
  price/free fact remain.

See `.factory/review-2.md` for exact quotes, evidence, and concrete fixes.
