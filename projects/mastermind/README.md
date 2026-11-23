# Mastermind

A buildless browser adaptation of Andur Carr's [Swift game](https://github.com/LaMarseillaise/mastermind-swift), translated into JavaScript with AI assistance. Source baseline: `02b4e8155d63a1d64bd543daf09d81754c045864` (`Code.swift`, `Game.swift`, `Knuth.swift`, `Piece.swift`, and `Turn.swift`). The original repository is unchanged.

## Play

Serve the personal-site repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/mastermind/`. ES modules and a module Web Worker require HTTP serving; opening the HTML as a `file://` URL is not supported. No build, account, backend, package install, or AI API is needed.

- **Break:** select from the six numbered pegs above the board. Each click/tap (or key 1–6) appends a peg to the current guess; the fourth submits immediately. Repeats are allowed.
- **Make:** enter four pegs in the code row. The fourth starts the computer, which automatically submits each minimax guess as soon as it is available. No stepping or confirmation is required.
- Click/tap any peg in an unfinished guess or code to remove it and shift later pegs left. Backspace removes the last draft peg. Submitted rows are fixed.
- The board always has thirteen rows: one code row and twelve guess rows. Each has four code/guess positions and four grading positions, separated vertically; a horizontal divider separates the code from the guesses.
- Red grading pegs are exact matches; white pegs are partial matches. Red precedes white, with unused holes left empty. Grades do not identify individual positions. Numbered code pegs and spoken feedback supplement color.
- ↻ starts a new round; 🏳️ ends it and reveals the code. The inline 🛟 replaces any partial draft with an optimal minimax guess and submits it immediately. Buttons retain accessible names and keyboard support.
- New, End, and role changes cancel pending work. Worker failures leave Break mode playable and provide a restart message in Make mode.

### Board texture

`wood.svg` is a fixed oak rendering of Andur's procedural RegimeWeb wood
texture (`app/javascript/textures/wood.js`, last source-file commit
`cbcc3edf108a12e828fb74d68dbc5bea24ab5669`). Generated with seed 1729 at
640 × 780, then compacted by removing comments/whitespace and rounding long
fractional coordinates to four decimal places. The source repository is
unchanged. A static SVG avoids a runtime texture generator or framework.

## Translation decisions

`engine.mjs` replaces the Swift model and solver; `app.mjs` replaces console I/O with DOM controls. The Swift version pads incomplete console input randomly; the browser collects an explicit four-peg draft and submits when it becomes complete. `session.mjs` isolates editing, round transitions, and automatic solver play from rendering.

The solver preserves the two-pair opening, candidate filtering, minimax search over *all* guesses (including non-candidates), and preference for a candidate when scores tie. The opening is fixed to Black–Black–Blue–Blue and remaining ties use numeric order instead of Swift's random selection. This makes results reproducible. Solved histories are handled explicitly, rather than filtering out the correct answer as Swift's in-game-only pruning does.

A lazy 1,296-by-1,296 byte feedback table (1,679,616 bytes, about 1.6 MiB) avoids repeated scoring during search. It is built inside the solver's Web Worker. Only guess/feedback history is posted to the worker; the game secret is not sent. New rounds terminate outstanding computation so an old response cannot update a new game. The browser's game state is not intended to be tamper-proof against developer tools.

Minimax minimizes the largest group of remaining candidates on the next turn. This is not a claim of globally minimal average guesses.

## Verification

Run from the repository root:

```sh
node projects/mastermind/check.mjs
node projects/mastermind/session-check.mjs
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

The interaction-state checks cover append/removal and shifting, auto-submission,
help replacing a partial draft, automatic Make play, repeated clicks while busy,
worker errors, stale results after New/End/role changes, the twelve-guess limit,
and automatic play with the real minimax implementation. Browser checks also
exercise the rendered board, grading pegs, controls, keyboard input, and narrow
screen layout. No secret is passed to the solver.
