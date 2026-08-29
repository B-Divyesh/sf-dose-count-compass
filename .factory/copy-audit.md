# Landing copy audit

Words are counted as whitespace-separated words. Labels and headings are
included because a visitor can rely on them. No line exceeds 22 words, and no
banned marketing term appears.

| Copy | Words | Result |
| --- | ---: | --- |
| Online | 1 | factual connection state |
| Count doses before you run out | 6 | `log-updates-count` |
| For people who track doses but do not need a full medicine app. | 13 | pass |
| Try it with sample data | 5 | `demo-isolation` |
| See three devices already counted. | 5 | `demo-isolation` |
| Saved in your browser | 4 | `local-only` |
| Works offline after first visit | 5 | `offline-reload` |
| Free to use | 3 | `free-to-use` |
| Original paper-cut illustration. | 3 | provenance in `.factory/design.md` |
| It does not show a real medicine. | 7 | pass |
| Check doses left and refill status | 6 | `log-updates-count`, `refill-reminder` |
| Download a backup file or dose-history spreadsheet from your device list. | 11 | `json-export`, `csv-export` |
| Enough for now | 3 | `refill-reminder` |
| A refill reminder starts at 30 puffs. | 7 | `refill-reminder` |
| Add a device. | 3 | tested by `local-only` and `free-to-use` |
| Enter the count printed on it. | 6 | pass |
| Log each use. | 3 | `log-updates-count` |
| Update the count. | 3 | `log-updates-count` |
| Plan a refill at your chosen count. | 7 | `refill-reminder` |
| The card shows a refill reminder before zero. | 8 | `refill-reminder` |
| It does not replace the device indicator, prescription label, pharmacist, or clinician. | 12 | pass |
| Check expiry dates separately. | 4 | pass |
| Saved in your browser. | 4 | `local-only` |
| Count doses before a device runs out. | 7 | `log-updates-count` |

## Terminology

| Concept | One term used in visitor copy |
| --- | --- |
| Physical medicine container | device |
| Remaining quantity | doses left |
| Low-count prompt | refill reminder |
| Full data copy | backup file |
| Dose-event download | dose-history spreadsheet |
| Example mode | demo / sample data |

`JSON`, `CSV`, `IndexedDB`, and `threshold` remain only in implementation,
tests, historical reviews, or the README file-format section for developers.

## Catalog description

| Copy | Words | Result |
| --- | ---: | --- |
| Count doses and see when to plan a refill for each medicine device. | 13 | verb-first; `log-updates-count`, `refill-reminder`; 67 characters |

## Missing-page copy

| Copy | Words | Result |
| --- | ---: | --- |
| Page not found | 3 | direct recovery heading; F-4-1 fixed |
| The page you requested does not exist. | 7 | direct explanation |
| Return to your dose count. | 5 | clear next step |
| Go to Dose Count Compass | 5 | result-naming recovery action |
