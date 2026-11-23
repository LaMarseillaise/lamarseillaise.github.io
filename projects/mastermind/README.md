# Mastermind

A browser adaptation with JavaScript and Swift/WebAssembly solver options, based on Andur Carr's [Swift game](https://github.com/LaMarseillaise/mastermind-swift), translated into JavaScript with AI assistance. Source baseline: `02b4e8155d63a1d64bd543daf09d81754c045864` (`Code.swift`, `Game.swift`, `Knuth.swift`, `Piece.swift`, and `Turn.swift`). The original repository is unchanged.

## Play

Serve the personal-site repository with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://127.0.0.1:8765/projects/mastermind/`. ES modules and a module Web Worker require HTTP serving; opening the HTML as a `file://` URL is not supported. No build, account, backend, package install, or AI API is needed to play. The checked-in Wasm binary is rebuilt only when its Swift source changes.

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

`engine.mjs` provides the JavaScript model and solver; `app.mjs` replaces console I/O with DOM controls. The Swift version pads incomplete console input randomly; the browser collects an explicit four-peg draft and submits when it becomes complete. `session.mjs` isolates editing, round transitions, and automatic solver play from rendering.

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


## Swift / WebAssembly alternative — 23 November 2026

Choose **Computer solver → Swift / WebAssembly**, or open `?engine=swift`. Changing the solver starts a new round in the current role and terminates pending computation. JavaScript remains the default. There is no automatic, silent fallback: a load error is shown, with manual play still available in Break and the other solver available from the selector.

The Swift option compiles a newly adapted `MastermindSolver` from the original `Code`/`Knuth` design. It uses the same numeric code IDs, two-pair opening, candidate-preferred deterministic tie order, duplicate-aware feedback table and minimax objective as the JavaScript adaptation. The original Swift repository remains unchanged. This is compiled Swift, not Swift translated to JavaScript.

- [`swift/Sources/MastermindCore/MastermindSolver.swift`](swift/Sources/MastermindCore/MastermindSolver.swift): platform-independent Swift core, packaged with SwiftPM for later native use. No iOS interface is included yet.
- [`swift/Bridge.swift`](swift/Bridge.swift): integer ABI. Only guesses and feedback cross the boundary. No game secret is sent to either solver worker.
- [`swift-solver.mjs`](swift-solver.mjs): validates values before Wasm integer coercion, initializes the module and maps results/errors into the existing solver interface.
- [`swift-worker.mjs`](swift-worker.mjs): lazy loading and worker messaging. Only selecting Swift and requesting a computer guess downloads the binary. No JavaScriptKit, WASI host shim, network API or framework is needed by the compiled module.
- The board, random secret generation and session state remain JavaScript. This is a shared-core demonstration, not an iOS emulator.

`mastermind.wasm` is **20,101 bytes** before HTTP compression. The runtime feedback table is still 1,679,616 bytes; small download size does not mean zero runtime memory. Built with the official **Swift 6.4.3** compiler and matching Wasm SDK, using its experimental Embedded Swift subset. The binary imports no host functions. Its SHA-256 is `744daed41c8e3d35a86e357fc26c40a2dcb4ec168677357c76a4048f612de741`.

Per-call timing appears inside “From Swift to the browser.” Swift setup includes fetch, compilation and table initialization. JavaScript initializes its table within its first solver call. Later calls reuse the worker, while New/End/role/engine changes discard it. These are device-specific observations, not a claim of speed superiority. The interface also accepts older cached JavaScript workers that return no timing data.

### Checks actually performed

```sh
node projects/mastermind/wasm-check.mjs
node projects/mastermind/check.mjs
node projects/mastermind/session-check.mjs
python3 scripts/check-site.py
```

All passed. The shipped Wasm binary matched JavaScript for **1,679,616 scoring pairs** and **1,378 decision-tree nodes**, including chosen guess, candidate count and worst-case group size. All 1,296 secrets have the same distribution shown above, with at most five guesses. The JavaScript check independently verifies scoring against an unmatched-peg oracle and minimax at early depths.

Wasm checks also cover invalid/coerced inputs, contradictory feedback without partial mutation, solved/turn-limit rejection, reset, worker protocol, and a failed download followed by successful retry. The same Swift core was compiled natively on macOS and solved all 1,296 secrets within five guesses. See [`swift/README.md`](swift/README.md) for rebuild and native-check instructions.

Browser checks exercised Swift help, automatic Make play, switching back to JavaScript, matching rounds for code 6–6–6–6, draft removal/shift and compatibility with a cached worker missing telemetry. The new selector and board were inspected at 375 px and 320 px, with no horizontal page overflow at 320 px. These are focused smoke checks, not a complete cross-browser audit.
