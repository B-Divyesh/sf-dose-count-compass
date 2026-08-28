# Polish round 1 — repair record

- Base reviewed: `714dab49dc24142ebab97185dddad90c42dbb8a2`
- Repair commit: `af36a72fa1584e802d1893add329b3c61a11ca42`
- Local evidence: `.factory/evidence/local/screenshot-desktop.png` and
  `.factory/evidence/local/screenshot-mobile.png`
- Live recheck: pending the static deployment triggered by the repair push.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced “Export a backup any time” with “Export a JSON backup”; added the landing location to the JSON claim. | `@claim:json-export`; local demo screenshot. |
| F-1-2 | Rewrote the step as “Log each use. Update the count.” and added an observable count-and-IndexedDB claim. | `@claim:log-updates-count`. |
| F-1-3 | Standardized the landing privacy wording to “Saved in your browser” and listed every landing/privacy/README location. | `@claim:local-only`; local demo screenshot. |
| F-1-4 | Reduced connection text to factual Online/Offline state; strengthened the offline claim to log a dose offline, reload offline, and retain it. | `@claim:offline-reload`. |
| F-1-5 | Replaced IndexedDB jargon in README with the tested browser-storage wording. | `@claim:local-only`. |
| F-1-6 | Replaced the README data-boundary promise with the same tested browser-storage wording. | `@claim:local-only`. |
| F-1-7 | Route h1 elements are focusable; client navigation and Back focus the h1 and update a dedicated polite route announcer. | `route navigation updates focus, announcement, canonical, and social metadata`. |
| F-1-8 | Added dynamic canonical, description, Open Graph URL/title/description, and Twitter title/description for each SPA route. | `route navigation updates focus, announcement, canonical, and social metadata`. |
| F-1-9 | Added the shared wordmark/nav and legal/footer shell to the designed 404. | `production routes return a real missing-page response and secure cache headers`; axe route sweep. |
| F-1-10 | Replaced “OFFLINE DEVICE COUNTER” with “PRIVATE DOSE COUNT.” | local desktop/mobile screenshots; `.factory/copy-audit.md`. |
| F-1-11 | Rewrote audience text in the landing and README to “For people who track doses but do not need a full medicine app.” | local desktop/mobile screenshots; `.factory/copy-audit.md`. |
| F-1-12 | Split the README capability sentence into five short sentences, each mapped to an existing claim where applicable. | `.factory/copy-audit.md`; individual claim commands. |

Earlier findings in `.factory/verification.md` remain covered by the existing
browser tests: demo namespace isolation, valid import/delete recovery,
event-level CSV, print inventory contents, keyboard/reflow, real 404, touch
targets, CSP/headers, and threshold validation.
