# Independent product verification — FAIL

- Candidate: `6d57bba1bf3e98d71d95ad7d69623048c8b3fe1a`
- Live URL: `https://dose-count-compass.sociobot.in`
- Verified: 2026-08-28 UTC
- Work order: `dose-count-compass-verify-1`
- Result: **FAIL — do not release**

The core local dose counter works, the mandatory first-read screen passes, and
all repository tests pass after the locked install. Release is blocked by a
broken live purchase, a demo/real-data isolation failure, unsafe destructive
imports, claim/test mismatches, and accessibility failures.

## Mandatory gates

### Claims first

`.factory/claims.json` exists and contains five claims. As required, each
listed command was invoked before inspecting the implementation. The clean
checkout initially had no installed packages, so all five commands first
stopped at `ERR_MODULE_NOT_FOUND: @playwright/test`. After the required
`npm ci`, every command was rerun independently and passed:

| Claim | Command result | Independent result |
| --- | --- | --- |
| `offline-reload` | PASS, 1 test | PASS locally and live; `/demo` reloaded offline under service-worker control. |
| `csv-export` | PASS, 1 test | **FAIL claim audit**; the test checks only the header. After logging a dose, JSON contained five dose-log records but CSV contained three current device rows and no dose events. |
| `json-export` | PASS, 1 test | PASS; three devices and five dose-log records were present after one new log. |
| `print-card` | PASS, 1 test | PASS independently; all three device rows and `/print.css` were present, including offline. The claim test itself checks only the heading, not inventory contents. |
| `local-only` | PASS, 1 test | PASS for the complete demo dose/print flow; all requests were same-origin. |

The claims inventory is incomplete. The landing page and README claim `$9
once`, a hosted Sociobot purchase, paid inventory snapshots/custom refill
notes, and an isolated sample-data demo. None has a corresponding claim test.
The purchase and demo-isolation claims are false in the live candidate. Under
the claims contract, unlisted claims are independently release-blocking.

### Cold first read

PASS. At 1440×900, the first screen says:

- What: “Count doses before you run out.”
- For whom: people tracking inhalers, sprays, injectables, and other medicine
  devices without a medication-management account.
- First action: “Try it with sample data,” followed by “See three devices
  already counted.”

The action is visible and reaches `/demo` in one click. The cold page had one
`h1`, one `main`, `lang="en"`, meaningful image alt text, and no console or
page errors.

## Release-blocking findings

### Critical — purchase is broken and the paid product is not implemented

The live “Buy Compass Plus” link returns HTTP 404 with no redirect:

`GET https://api.sociobot.in/api/v1/products/dose-count-compass/checkout`

A browser test mocked a valid verification response. The page stored and
removed the returned token correctly and displayed “Compass Plus is active on
this device,” but its controls were identical before and after verification.
There is no inventory snapshot feature and no paid custom-refill-note feature;
the existing private-note input is already available without a license. This
contradicts the `$9 once` offer and prevents the monetized workflow from
working end to end.

### Major — demo mode can display real medicine data

In a fresh context:

1. Add `Private real inhaler` on `/log`.
2. Open `/demo`; the three sample devices appear.
3. Open “My devices”; the real device appears.
4. Use browser Back.

The URL and banner return to `/demo` and say “sample data, nothing is saved,”
but the only displayed card is `Private real inhaler`. The `popstate` handler
changes the namespace flag without reloading the matching IndexedDB state.
Logging at that point can also write the real in-memory record into demo
storage. This violates the required demo sandbox boundary.

The documented alternate entry `/?demo=1` is also broken: it displays the
landing page and zero inventory cards while showing the demo banner, rather
than the seeded demo inventory promised by `.factory/demo.md`.

### Major — import and delete paths can lose or corrupt data

Importing a valid backup silently replaces the entire current inventory. A
test starting with `Keep me` imported one `Replacement only` device; `Keep me`
disappeared immediately with no confirmation, merge choice, or undo.

The importer validates only that `devices` is an array. A backup with
`total: 0`, `remaining: -5`, `threshold: -10`, and `logs: "not-a-list"` was
accepted as “Backup imported.” The UI showed `-5 of 0 left`, left “Log 1 puff”
enabled, and clicking it produced the unhandled page error
`t.logs.unshift is not a function`. This is unsafe for a count used to avoid
running out of medicine.

Deleting a device likewise removes it immediately without specific
confirmation or undo. No recovery path exists unless the user happened to
export a backup earlier.

### Major — claim coverage does not prove the advertised behavior

The CSV claim says “Exports the log as CSV,” and its prescribed sandbox says
to assert one row per record. The test only searches for the header. After one
new demo dose, the JSON backup contained five dose-log records, while the CSV
contained only the header plus three device inventory rows. It has no event
timestamp or dose amount columns. The automated green result therefore does
not prove the listed claim.

The print-card test similarly checks only that a heading exists, not the
promised inventory. Independent inspection found the actual print output
correct, but the test still falls short of the claims contract.

### Major — keyboard and 200% text-resize requirements fail

At 390 px with root text resized to 200%, document width grew to 480 px. The
header navigation overflowed by 90 px and the Privacy link was outside the
viewport. This is loss of content at the required 200% text size.

On initial load, focus is forced onto the `h1`. Forward Tab therefore starts
at “Add a device” and skips the skip link, wordmark, and header navigation.
The file input is clipped to `rect(0, 0, 0, 0)`; keyboard focus lands on that
invisible 24×44 input, while the visible “Import backup” label gets no focus
ring. Focus after closing the add dialog does not return to its trigger.

## Other findings

### Medium

- The designed missing-page view returns HTTP 200, uses the home-page title,
  and there is no `404.html` or `responseOverrides` entry. It is not a real
  404 response.
- Mobile touch targets below 44 px include both demo-banner controls (30 px
  high), the Demo nav link (40 px wide), the import input (24 px wide), and
  footer links (15 px high).
- All live files, including hashed JS/CSS, use
  `cache-control: public, must-revalidate, max-age=30`; hashed assets do not
  receive the required long-lived immutable policy.
- Responses have HSTS, CSP, `nosniff`, and a referrer policy, but no
  `frame-ancestors` directive or `X-Frame-Options`, leaving this health-data UI
  frameable. No `Permissions-Policy` is present.
- There is no first-class online/offline state. Offline operation works, but
  the UI gives no connection-status feedback.

### Low

- A refill threshold greater than the device total is accepted. A device with
  2 of 2 doses and threshold 999 is immediately labelled “At refill
  threshold.”
- The always-rendered empty toast remains a visible fixed dark sliver at the
  bottom of the 390×844 viewport.
- Programmatic initial focus draws the browser's default segmented outline
  around the large heading rather than the product's designed focus style.

## Passing evidence

### Clean repository gates

```text
npm ci                         PASS; 20 packages, 0 vulnerabilities
npm run build                  PASS; dist/ produced
npx tsc --noEmit               PASS
npm test                       PASS; 8/8
npm audit --audit-level=high   PASS; 0 vulnerabilities
```

There is no lint script. Production output was 17.23 KB JS (6.59 KB gzip),
9.40 KB CSS (2.96 KB gzip), no font payload, and a 37.5 KB hero image. These
are below the stated budgets.

### Core behavior

- Empty `/log` state and disabled print action: pass.
- Add inhaler, persist through reload, log 2 → 1 → 0, threshold warning, empty
  warning, and disabled zero-count action: pass.
- Invalid `remaining > total`: rejected with an announced toast and the dialog
  left open for correction.
- JSON export, CSV download, print card, invalid-JSON recovery, demo reset, and
  start-real flow: pass except for the defects above.
- Desktop and normal-size 390×844 layouts had no horizontal overflow.
- Light/dark axe 4.10.3 scans across `/`, `/demo`, `/log`, `/privacy`,
  `/terms`, and a missing route found zero serious or critical issues locally
  and live. Reduced-motion transition duration resolved to `0.01ms`.

### PWA and performance

- Chrome reported no manifest or installability errors locally or live.
- Live `/demo` was service-worker controlled, used only cache
  `dose-compass-v2`, returned HTTP 200 on offline reload, retained the three
  sample cards, logged a dose offline, and opened the print card with cached
  `/print.css`.
- `registration.update()` completed without errors; the deployed worker was
  already current, so no `updatefound` event occurred.
- Live mobile Lighthouse 13.0.1: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 60 ms, transfer
  49 KiB.
- Factory `verify-url.sh`: HTTP 200, 801 ms load, no console errors, valid
  title/language/main/alt/button-name basics.

### Privacy, policies, and endpoint limiting

- The complete observed demo dose/print flow made requests only to
  `https://dose-count-compass.sociobot.in`; there are no analytics, CDN fonts,
  or third-party scripts.
- License verification allows the production origin and returns `no-store`.
- A rapid burst against the product verification endpoint produced the first
  HTTP 429 at request 29 of 30 observed requests, with `Retry-After: 4`; 29
  responses were HTTP 200. Rate limiting therefore passes.
- Sign-in is not present or required, so the Entra authority check is not
  applicable.

### Deployment identity

The live HTML names `index-CTqnuuSi.js` and `index-DzZ7wf_z.css`. SHA-256
digests match the candidate `dist/` for HTML, JS, CSS, `sw.js`, manifest, hero
image, and print CSS. The live deployment is the tested candidate, not an
older deployment.

## Required next steps

1. Register and verify the live Sociobot checkout, then implement and test the
   paid features or remove the paid offer entirely.
2. Reload data from the correct IndexedDB namespace on every history change;
   make `/?demo=1` enter the actual seeded dashboard; add isolation claims.
3. Schema-validate imports, preview/confirm replacement, preserve the current
   state for undo, and add a confirmation or undo for deletion.
4. Export actual dose-log rows or rename the CSV claim, and strengthen every
   claim test to inspect complete observable output.
5. Fix initial/return focus, the visible import focus treatment, 200% text
   reflow, and sub-44 px targets.
6. Return a real 404, add clickjacking protection, and set immutable caching
   for hashed assets.
