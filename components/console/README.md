# The source-reader entrance

`entrance.mjs` installs a frozen `andur` namespace without replacing an existing
one, and prints a single short invitation. Collection pages load it through
`components/index.js`; Mastermind and `/agents.html` import it directly. No
DevTools detection, polling, console clearing, analytics, or network calls occur
on import. Browser module caching prevents repeat greetings within a document.
Game code loads on `play()`, the solver worker/Wasm on the first computer guess,
and the public project catalog on `projects()`.

The homepage and Mastermind HTML comments point to `/agents.html`. There is no
visible incoming navigation link or carousel card; the guide is `noindex`.
This is discovery by curiosity, not access control. It contains only public data.
Common Ground links to the user-supplied app.commonground.builders domain,
with its landing page explicitly marked in preparation (November 25, 2026).
No public application access or agent API is claimed.

## Console contract

- `help()`, `about()`, `guide()` print introductory material.
- `await projects()` prints and returns current public demo/source links.
- `await play('mastermind', {engine: 'swift'})` starts an independent Break round.
  `javascript` is an explicit alternative; failures never silently change engines.
- `guess('1123')` validates four digits 1–6, then submits. No random padding.
- `board()` uses the original Swift emoji palette, box drawing and unordered
  red/white grades. Numeric guesses and grade counts accompany the emoji.
  `board('text')` substitutes letters/numbers for emoji. Font widths may differ.
- `await hint()` submits a minimax guess; in Make mode it resumes automatic play.
- `await make('6654', {engine: 'swift'})` runs the solver to completion.
- `quit()` cancels work and reveals the code; a fresh `play()` replaces the round.

`mastermind.mjs` adapts `ConsoleView.swift` from the original
[Swift repository](https://github.com/LaMarseillaise/mastermind-swift), inspected
locally in `../mastermind/mastermind/`. It reuses the site's JavaScript `Game`
and shipped Swift or JavaScript solver workers. The Wasm binary contains the
Swift solver, not the terminal I/O loop. The original source remains unchanged.
No hidden secret crosses the worker boundary. New/quit invalidates late results;
worker errors and a 30-second timeout release pending work. Reload clears state.
No persistent storage is used. No console changes affect the visible board.

## Verification

Run `node components/console/check.mjs` for scoring, input boundaries, both roles,
cancellation, failure recovery, and the worker client lifecycle. Serve the site
and open `components/console/check.html` for real browser Worker/Wasm and lazy
entrypoint checks. `python3 scripts/check-site.py` checks navigation/generation.

Verified November 25, 2026: Node checks and the browser fixture passed, including
real Swift/Wasm and JavaScript workers, lazy entrypoint loading, canceled import,
Break/Make/hints, secret concealment, independent games, and the project catalog.
The source-reader guide was visually inspected. Static navigation/content checks
passed. No change was made to the existing solver algorithms or Wasm binary.
