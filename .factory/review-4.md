# Adversarial first-read review 4 — Dose Count Compass

- Reviewed: 2026-08-29 UTC
- Live target: <https://dose-count-compass.sociobot.in>
- Base: `b208cb80027309d716a1bae1a4c1e0d6a5dea38a`
- Verdict: **FAIL**

One plain-language defect remains. A pass requires zero findings, so the
otherwise working product does not pass this round.

## Cold first read

Fresh Chromium contexts, with no existing site storage, opened the live home
page at 390 × 844 and 1440 × 900. Before scrolling, both screens answer all
three questions:

- **What it does:** “Count doses before you run out.”
- **For whom:** “For people who track doses but do not need a full medicine
  app.”
- **What to click first:** “Try it with sample data.” The adjacent outcome is
  “See three devices already counted.”

At 390 px, the primary action occupied y=388–432 and the outcome ended at
y=480. The three privacy/offline/price facts ended at y=593. There was one
`h1`, a `main`, useful art alt text, no horizontal overflow, and no console or
page error. This mandatory gate passes.

## Findings

### Minor

#### F-4-1 — The 404 heading is a metaphor, not a recovery heading

- **Quote/location:** live missing route `/missing-review-4` and
  `public/404.html`: “This shelf is empty”.
- **Why:** this does not name the page state for a visitor or for a screen
  reader’s heading list. It is paper-cabinet mood copy. A visitor has to read
  the following paragraph to learn that the requested page does not exist.
  The plain-words requirement says headings name the section and prohibits
  metaphor headings that carry no direct information.
- **Concrete fix:** change the `h1` to **“Page not found”**. Keep the existing
  useful paragraph, “The page you requested does not exist. Return to your
  dose count.” Add a regression assertion for the replacement heading in the
  online and controlled-offline 404 test.

## Copy audit

Words are whitespace-separated. Headings, actions, labels, preview text, and
footer copy are included so the audit is useful on a cold visit. No audited
landing or README line exceeds 22 words. There are no banned marketing
adjectives, generic action buttons, or inconsistent terms. `F-4-1` is the
only plain-words flag and is on the 404, not the landing or README.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Online | 1 | factual state |
| PRIVATE DOSE COUNT | 3 | clear supporting label |
| Count doses before you run out | 6 | `log-updates-count` |
| For people who track doses but do not need a full medicine app. | 13 | clear audience |
| Try it with sample data | 5 | result-naming action; `demo-isolation` |
| See three devices already counted. | 5 | `demo-isolation` |
| Saved in your browser | 4 | `local-only` |
| Works offline after first visit | 5 | `offline-reload` |
| Free to use | 3 | `free-to-use` |
| Original paper-cut illustration. | 3 | asset provenance is recorded in `design.md` |
| It does not show a real medicine. | 7 | useful art clarification |
| A SMALL INVENTORY | 3 | section label |
| Check doses left and refill status | 6 | clear section heading |
| Download a backup file or dose-history spreadsheet from your device list. | 11 | `json-export`, `csv-export` |
| Inhaler | 1 | sample type label |
| Enough for now | 3 | sample status, corroborated by count |
| Blue rescue inhaler | 3 | sample device name |
| of 200 left | 3 | sample count label |
| 42 puffs | 2 | sample unit |
| A refill reminder starts at 30 puffs. | 7 | `refill-reminder` |
| How dose counting works | 4 | clear section heading |
| Add a device. | 3 | clear verb step |
| Enter the count printed on it. | 6 | clear verb step |
| Log each use. | 3 | `log-updates-count` |
| Update the count. | 3 | `log-updates-count` |
| Plan a refill at your chosen count. | 7 | `refill-reminder` |
| The card shows a refill reminder before zero. | 8 | `refill-reminder` |
| What this does not do | 5 | clear section heading |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | useful safety limit |
| Check expiry dates separately. | 4 | useful safety instruction |
| Saved in your browser. | 4 | `local-only` |
| Count doses before a device runs out. | 7 | `log-updates-count` |

The primary action names its outcome. “Device” consistently means the
physical medicine container; “doses left”, “refill reminder”, “backup file”,
“dose-history spreadsheet”, and “sample data” keep their same meaning.

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Count doses in inhalers, sprays, injectables, and other medicine devices before they run out. | 14 | `log-updates-count` |
| It is for people who track doses but do not need a full medicine app. | 15 | clear audience |
| It is free to use. | 5 | `free-to-use` |
| Saved in your browser. | 4 | `local-only` |
| It works offline after the first visit. | 7 | `offline-reload` |
| Download a backup file or dose-history spreadsheet. | 7 | export claims |
| Import a backup with confirmation and Undo. | 7 | `backup-import` |
| Print an inventory card. | 4 | `print-card` |
| Try three separate sample devices at `/?demo=1`. | 7 | `demo-isolation` |
| The static deploy output is `dist/`, with `index.html` at its root. | 11 | run/deploy instruction |
| Preview it with `npm run preview`. | 6 | run instruction |
| Build with `npm run build`. | 4 | deploy instruction |
| The factory static work order publishes the resulting `dist/` directory with `public/staticwebapp.config.json`. | 13 | deploy instruction |
| Backup files use `.json`. | 4 | developer file-format note |
| Dose-history spreadsheet files use `.csv`. | 4 | developer file-format note |
| Use the count alongside the physical device indicator, prescription label, and pharmacist or clinician instructions. | 15 | useful safety instruction |
| This is not medical advice. | 5 | useful safety limit |
| Saved in your browser. | 4 | `local-only` |
| See `/privacy` and `/terms`. | 4 | clear route instruction |

No landing- or README-facing product-performance promise lacks a matching
entry in `.factory/claims.json`. Scope and medical-safety disclaimers are not
performance promises.

## Demo, claims, privacy, and sandbox behaviour

- One click on **Try it with sample data** opened `/demo` with Blue rescue
  inhaler, Saline spray, and Travel injector already displayed. The first
  screen is a working counter, not a setup page.
- The persistent banner read “Demo — sample data, nothing is saved” and showed
  **Reset demo** and **Start for real**. Reset restored the Blue rescue
  inhaler to 42.
- In a fresh context, a real `Review real inhaler` appeared only at `/log`.
  Demo showed only the three samples. After changing a demo count to 41,
  **Start for real** opened the untouched real list; `/?demo=1` returned to
  the original sample list with Blue at 42. This confirms separate real/demo
  namespaces and reset-on-exit.
- After service-worker control, a fresh demo logged Blue 42 → 41 offline and
  retained 41 through an offline reload.
- The complete cold home/demo flow made same-origin requests only (HTML, CSS,
  JS, and product artwork). There were no analytics, CDN fonts/scripts, model
  calls, or other cross-origin requests.

From a fresh clone at `/tmp/dcc-review-4.L3BZHw`, `npm ci` succeeded. Each of
the ten exact commands in `.factory/claims.json` passed independently:
`offline-reload`, `csv-export`, `json-export`, `backup-import`, `print-card`,
`local-only`, `log-updates-count`, `refill-reminder`, `demo-isolation`, and
`free-to-use`. The full 23-test Playwright suite, `npm run lint`, and
`npm run build` also passed; `dist/` was produced.

## Structure, routing, accessibility, and visual identity

- Cold live browser checks confirmed correct runtime titles, descriptions,
  canonicals, Open Graph titles, and one `h1` on `/`, `/demo`, `/log`,
  `/privacy`, and `/terms`. Titles follow the required product/route pattern.
- Client navigation and Back focused the route `h1` and announced “Now
  viewing: …”. The skip link, header navigation, footer legal links, and
  shared shell are present on the normal routes and 404.
- Every discovered route and asset returned 200: `/`, `/demo`, `/log`,
  `/privacy`, `/terms`, `robots.txt`, `sitemap.xml`, manifest, icons, social
  image, 404 stylesheet, and hero artwork. A missing route returned the
  designed HTTP 404. The only 404 issue is `F-4-1`.
- The full suite covers keyboard order, dialog return focus, file-input focus,
  200% reflow, 390 px targets, reduced motion, and axe serious/critical scans
  across light/dark routes and 404; it passed. Live home and demo introduced
  no console or page error.
- The warm paper, ink, moss, coral, clipped-card, physical-gauge system and
  original paper-cut medicine-cabinet art match `.factory/design.md`. This is
  a distinct product identity rather than a generic SaaS template.
- Backup import/export, dose-history export, and print are the expected
  portability features. The brief does not imply sync, and an AI feature
  would add health-adjacent data sharing without advancing the manual count;
  no missed-leverage finding is raised.

## Earlier findings rechecked

Every earlier `review-*.md`, `polish-*.md`, verification record, and previous
handoff was read. The checks below confirm live behaviour and current code;
they do not rely on earlier “fixed” labels.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | fixed: backup wording/location and JSON-download test cover the landing promise |
| F-1-2 | fixed: core count claim logs to zero and covers public count wording |
| F-1-3 | fixed: browser-storage privacy wording/location is tested |
| F-1-4 | fixed: factual connection state plus offline log/reload test |
| F-1-5 | fixed: README has no IndexedDB jargon and storage is tested |
| F-1-6 | fixed: README uses the tested browser-storage wording |
| F-1-7 | fixed: navigation and Back focus/announce the `h1` |
| F-1-8 | fixed: SPA route metadata updates on direct route load and navigation |
| F-1-9 | fixed: 404 has shared header, footer, Privacy, and Terms links |
| F-1-10 | fixed: first-screen eyebrow is “PRIVATE DOSE COUNT” |
| F-1-11 | fixed: audience says “full medicine app” |
| F-1-12 | fixed: README capability copy is split into short sentences |
| F-2-1 | fixed: Start for real resets demo without changing real data |
| F-2-2 | fixed: hero/footer/README count promise is inventoried and tested to zero |
| F-2-3 | fixed: hero click opens the three-record sample dashboard |
| F-2-4 | fixed: reminder test verifies above, at, and below the chosen count |
| F-2-5 | fixed: controlled online/offline PWA missing routes return styled HTTP 404 |
| F-2-6 | fixed: “Tracked devices” is an `h2` before device `h3`s |
| F-2-7 | fixed: visitor copy says backup file and dose-history spreadsheet |
| F-2-8 | fixed: visitor copy says refill reminder and names the refill action |
| F-2-9 | fixed: preview heading names doses left and refill status |
| F-2-10 | fixed: first screen shows browser privacy, offline use, and free status |
| F-3-1 | fixed: `/log` runtime title and social title are “Dose Count Compass — Track device doses” |
| Earlier verification: paid offer | fixed: no unsupported paid offer or purchase endpoint remains |
| Earlier verification: sandbox/import/delete/export/print | fixed: isolation, validation, confirmation/Undo, event CSV rows, and print contents pass |
| Earlier verification: keyboard/reflow/security/cache/connection | fixed: the current full suite and live checks pass these behaviours |

No earlier finding is reopened. `F-4-1` is new.

## What would make this perfect

Replace the metaphorical 404 `h1` with “Page not found”, add the exact heading
to the online/offline PWA 404 regression test, then rerun the ten claim
commands, full suite, build, live cold read, demo-isolation flow, offline
reload, and route/link crawl. With that and no new defect, the product can
pass the zero-finding standard.
