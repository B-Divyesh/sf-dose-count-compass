# Dose Count Compass

Count doses in inhalers, sprays, injectables, and other medicine devices before
they run out. It is for people who track doses but do not need a full medicine
app. It is free to use.

Saved in your browser. It works offline after the first visit. Download a
backup file or dose-history spreadsheet. Import a backup with confirmation and
Undo. Print an inventory card. Try three separate sample devices at
`/?demo=1`.

## Run locally

```sh
npm ci
npm run dev
```

## Test and build

```sh
npm test
npm run build
```

The static deploy output is `dist/`, with `index.html` at its root. Preview it
with `npm run preview`.

## Deploy

Build with `npm run build`. The factory static work order publishes the
resulting `dist/` directory with `public/staticwebapp.config.json`.

## File formats

Backup files use `.json`. Dose-history spreadsheet files use `.csv`.

## Safety and privacy

Use the count alongside the physical device indicator, prescription label, and
pharmacist or clinician instructions. This is not medical advice. Saved in
your browser. See `/privacy` and `/terms`.
