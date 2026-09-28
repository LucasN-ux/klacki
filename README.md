# Klacki

The keyboard shortcuts of creative software — 3D, texturing, VFX, video,
photo, design, audio — in one place, for Windows and Mac, in English and
French. Every key is checked against the publisher's own documentation.

**Live:** [klacki.vercel.app](https://klacki.vercel.app)

## What it does

- **Search everything at once**, by action ("undo", "frame selection") or by
  key ("F9", "ctrl+z"), accents and word order ignored.
- **Windows or Mac**: one toggle rewrites every key. Keys are stored per
  platform and never converted, because Ctrl does not always become ⌘.
- **My board**: tick the software you know and the ones you are learning; each
  action becomes a card, one line per distinct combination, with the traps
  flagged (the same keys doing something else in another software). A board
  can be shared by link.
- **Visual keyboard**: hover (or tap) the keys of a shortcut to see them lit
  on a US QWERTY keyboard, with the numeric pad and the mouse when needed.
- **Favourites** and **copy a shortcut in one click**, kept in the browser.
- **Honest gaps**: when a publisher does not document an everyday action
  (undo, redo, save, open), the page says so instead of guessing.

## How it is built

- **Next.js (app router), React, TypeScript, Zod, CSS Modules.** No backend,
  no database, no account: every page is generated at build time and served
  as a file.
- **One JSON file per software** in `src/data/software/`. The server reads the
  folder and checks each file with a Zod schema when the site is built: a
  wrong or incomplete file stops the build instead of reaching a visitor.
- **Built for a growing catalogue.** Pages never bundle the catalogue. The
  build writes one static file per software (`/data/software/<id>.json`) and
  one search index per language (`/data/search/<locale>.json`); each page
  downloads only what it shows.
- **Rules live in plain TypeScript** (`src/domain/`), without React, so they
  are easy to test: search, board cards and traps, platform differences, the
  keyboard layout.
- **Browser state** (platform, favourites, board) lives in `localStorage`,
  read through `useSyncExternalStore` and validated with Zod.
- **Privacy by design**: no analytics, no cookies, no third-party request; a
  strict Content Security Policy.

```
src/data/software/*.json   the shortcuts, one file per software
src/domain/                the rules, framework-free
src/app/[locale]/          the pages, one tree for /en and /fr
src/app/data/              the static data files the browser downloads
src/components/            drawing (ui/) and stateful pieces (features/)
src/i18n/{en,fr}.json      every word a visitor reads
```
