# Dose Count Compass

Count doses in inhalers, sprays, injectables, and other medicine devices before
they run out. It is for people who want a small private inventory, not a full
medication-management account.

The app stores records in browser IndexedDB. It works offline after the first
visit, exports JSON backups and CSV, prints an inventory card, and includes an
isolated sample-data demo at `/demo`.

## Run

```sh
npm install
npm run dev
```

## Test and build

```sh
npm test
npm run build
```

The static deploy output is `dist/`, with `index.html` at its root. Preview it
with `npm run preview`.

## Safety and privacy

Use the count alongside the physical device indicator, prescription label, and
pharmacist or clinician instructions. This is not medical advice. Device data
stays in the browser unless you choose to export it. See `/privacy` and
`/terms`.

## Paid tier

Compass Plus is a one-time $9 license, sold through Sociobot. The checkout is
hosted by Sociobot; a returned or pasted license is stored locally and checked
there at most once per day when online. Counts, exports, and safety notices
remain free.
