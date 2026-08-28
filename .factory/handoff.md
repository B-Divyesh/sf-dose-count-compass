# Review handoff — Dose Count Compass

## Result

**FAIL.** This review changed no product source or behavior. The committed
review is `.factory/review-1.md`.

## What was verified

- Opened the live site fresh at 390 × 844 and 1440 × 900 before scrolling.
  The primary job, audience, and sample-data action are clear.
- Exercised the live demo from a fresh context, including reset, start-real,
  direct `?demo=1`, real/demo IndexedDB separation, and same-origin traffic.
- Ran `npm ci`, `npm run build`, `npm test`, and each exact command in
  `.factory/claims.json`; all local quality and listed-claim commands passed.
- Checked live routes, HTTP 404, discovered links, metadata, responsive
  layout, headers, and axe serious/critical findings.
- Rechecked every issue in the earlier `verification.md`; those issues are
  fixed and have not regressed.

## Remaining work

The review records 12 findings. The release blockers are F-1-1 through F-1-6:
multiple landing/README storage, export, and update promises are not listed
and tested as required by the claims contract. F-1-7 is a major client-route
focus and announcement defect. F-1-8 through F-1-12 cover canonical/social
metadata, 404 shell consistency, and plain-language copy.

## Re-run

```sh
npm ci
npm run build
npm test
for claim in offline-reload csv-export json-export print-card local-only demo-isolation; do
  npm test -- --grep "@claim:$claim"
done
```

Use the live URL in a fresh browser context for the first-read and route-focus
checks. The full findings, exact quotes, and repair guidance are in
`.factory/review-1.md`.
