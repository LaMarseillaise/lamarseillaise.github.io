# Andur Carr

This repository is the source for my personal site, [andurcarr.com](https://andurcarr.com).

## Implementation preference

Keep the site buildless: HTML, CSS, and plain JavaScript with native ES modules.
Use native Web Components where encapsulation helps. Do not add a framework or
runtime dependency for ordinary page interactions.

## Local preview

Serve the repository over HTTP (ES modules require it):

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

- `/projects/`: the browser project collection, with reusable native project cards.
- `/projects/transit/`: MBTA bus arrival cards with a stop map, synchronized list view, optional local location matching, and a recorded example.
- `/projects/fibonacci/`: editable JavaScript, Ruby/WASM and Python/WASM, a cache walkthrough, and Swift/Rust/C#/Go references.
- `/projects/mastermind/` and `/projects/three-card-monte/`: browser games.
- `/projects/native-calculator/`: native `<andur-calculator>` component, adapted from the original React project.
- `/projects/latin/`: Latin reading drafts and user-authored word connections, saved only in the browser.
- `/projects/revolutionary-calendar/`: live Republican date and decimal clock, with history and explicit extrapolation rules.
- `/projects/sql-join-explorer/`: interactive SQL join examples checked against SQLite.
- `/projects/svg-gallery/`: 65 RegimeWeb illustrations, with search, enlarged views and individual source credits.
- `/projects/astrometrics/`: observation and geometry experiments connecting Earth's circumference, orbital distances, lightyears, and parsecs.
- `/musings/`: static essays, with the latest highlighted on the homepage.

Old project entry URLs redirect to `/projects/<slug>/`, preserving query strings
and fragments. Latin drafts keep the same origin and storage key.

See [components](components/README.md) for the native card and carousel interfaces,
and [content](content/README.md) for adding articles and refreshing static indexes.
Run `python3 scripts/check-site.py` to check internal navigation and generated pages.

See each project's README for provenance, behavior, and checks. Publishing is
through the existing GitHub Pages repository; no separate hosting service is needed.
