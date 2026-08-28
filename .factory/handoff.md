# Verification handoff — FAIL

Candidate `6d57bba1bf3e98d71d95ad7d69623048c8b3fe1a` was independently tested on
2026-08-28 at `https://dose-count-compass.sociobot.in`.

## Verdict

**FAIL — do not release.** The live deployment is byte-for-byte the candidate,
but the live buy link returns 404, no paid features unlock, browser history can
show real medicine data inside the demo, imports can silently erase current
data and accept impossible counts, claim tests under-assert CSV/print output,
and keyboard/text-resize requirements fail.

Full evidence and severity-ranked defects are in
[`.factory/verification.md`](verification.md).

## Verification performed

```sh
npm ci
npm run build
npx tsc --noEmit
npm test
npm audit --audit-level=high
```

All commands passed after installation; Playwright reported 8/8. Every command
from `.factory/claims.json` also passed when rerun separately after `npm ci`.
The CSV claim still fails independent semantic inspection because its test
checks only a header and the download omits dose-log events.

Independent Chromium checks covered desktop, 390×844 mobile, light/dark mode,
keyboard focus, 200% text resize, reduced motion, axe, normal/boundary/invalid
inputs, persistence, import/export/print, browser Back, privacy requests,
headers, route/link crawling, live offline reload, service-worker update,
installability, and deployment hashes. Lighthouse scored 100/100/100/100 with
LCP 1.2 s and CLS 0. The verification API rate limit returned its first 429 at
observed request 29 with `Retry-After: 4`.

## Highest-priority repairs

1. Make purchase and paid unlock work end to end, or remove the offer.
2. Restore the correct demo/real database on `popstate` and fix `/?demo=1`.
3. Validate imports and provide confirmation/undo for replacement and delete.
4. Export actual dose logs and make claim tests verify full outputs.
5. Fix 200% text reflow, skip-link/focus order, visible import focus, and touch
   targets.

No product code was modified during verification. Only this handoff and the
verification report were added/updated.
