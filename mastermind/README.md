# Mastermind

A buildless browser adaptation of Andur Carr's [Swift game](https://github.com/LaMarseillaise/mastermind-swift), translated into JavaScript with AI assistance. Source baseline: `02b4e8155d63a1d64bd543daf09d81754c045864` (`Code.swift`, `Game.swift`, `Knuth.swift`, `Piece.swift`, and `Turn.swift`). The original repository is unchanged.

## Play

Serve the personal-site repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/mastermind/`. ES modules and a module Web Worker require HTTP serving; opening the HTML as a `file://` URL is not supported. No build, account, backend, package install, or AI API is needed.

- **Break a code:** the browser generates four independently random colors; repeats are allowed. Submit guesses, optionally ask for a suggested guess, or reveal the code to end the round.
- **Set a code:** choose four colors, lock the code, and step through the computer's guesses. The game scores feedback automatically.
- Six original colors and twelve attempts are retained. Exact matches consume their pegs before partial matches. Feedback is a pair of totals, not a position-by-position clue.
- Color menus support native keyboard interaction, and numbered pegs plus a named legend supplement color. Status changes are announced, and finishing a round focuses New round.

## Translation decisions

`engine.mjs` replaces the Swift model and solver; `app.mjs` replaces console I/O with DOM controls. The Swift version pads incomplete console input randomly; the browser instead always offers four explicit color selections.

The solver preserves the two-pair opening, candidate filtering, minimax search over *all* guesses (including non-candidates), and preference for a candidate when scores tie. The opening is fixed to Black–Black–Blue–Blue and remaining ties use numeric order instead of Swift's random selection. This makes results reproducible. Solved histories are handled explicitly, rather than filtering out the correct answer as Swift's in-game-only pruning does.

A lazy 1,296-by-1,296 byte feedback table (1,679,616 bytes, about 1.6 MiB) avoids repeated scoring during search. It is built inside the solver's Web Worker. Only guess/feedback history is posted to the worker; the game secret is not sent. New rounds terminate outstanding computation so an old response cannot update a new game. The browser's game state is not intended to be tamper-proof against developer tools.

Minimax minimizes the largest group of remaining candidates on the next turn. This is not a claim of globally minimal average guesses.

## Verification

Run from the repository root:

```sh
node mastermind/check.mjs
```

The dependency-free check compares scoring against an independent unmatched-peg oracle for all **1,679,616** secret/guess pairs, explores the complete solver decision tree, independently checks minimax scores at the first two depths, checks game boundaries/defensive copies/invalid input/random-source endpoints, and exercises the shipped worker message protocol in a Node adapter.

All **1,296** secrets solve in at most **five guesses** under this deterministic tie order:

| Guesses | Secrets |
| --- | --- |
| 1 | 1 |
| 2 | 6 |
| 3 | 62 |
| 4 | 533 |
| 5 | 694 |

This verifies the fixed four-peg, six-color game, not variants with different sizes. Node worker tests are not a substitute for browser interaction checks.
