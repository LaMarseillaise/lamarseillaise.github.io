# Fibonacci playground

Buildless, native custom elements: `fibonacci-lab` owns source drafts and execution; `memo-walkthrough` owns an explanatory trace. `model.mjs` supplies an independent iterative oracle and trace events; `samples.mjs` supplies teaching code. C# is adapted from Andur's local C-Sharp/Fibonacci.cs (original unchanged); original expected-value comments were off by one. The other samples are newly authored with AI assistance, not attributed as recovered originals.

JavaScript, Ruby and Python are editable/runnable. Swift, Rust, C# and Go are explicitly read-only references, not simulated execution. No compiled artifacts for these four ship in this increment. Fixed-width Swift/Rust examples guard their domains. Growing-integer examples use nonnegative indices; the UI allows 0–500, with separate stack and time limits.

Run `node projects/fibonacci/check.mjs` (Node, native Ruby and Python required), `python3 scripts/check-site.py`, and browser checks of all three runtimes, edits, cancellation, errors, draft switching, keyboard controls and narrow layout. Native tests do not substitute for WASM browser tests.

## Execution and dependencies

Fresh opaque-origin iframe (`sandbox="allow-scripts"`, intentionally no same-origin privilege) per run; it creates a classic Worker with dynamic ES module imports from local trusted runner source. The parent's message handler checks frame identity and per-run token. Editing code cannot access the parent DOM or site storage. CSP restricts network access to jsDelivr for runtimes; the worker has a 4-second execution timeout and runtime loading has a 90-second timeout. Removing the frame cancels execution. Runtime output is rendered as text, capped at 10,000 characters; source is not persisted or imported from URL parameters. This is a local teaching playground, not a service for accepting untrusted third-party submissions. Runtime packages have JavaScript bridges and may access the allowed CDN; do not describe it as entirely network-isolated.

Dependencies are loaded only on Run and pinned to ruby.wasm 2.10.1 / Ruby 4.0 and Pyodide 314.0.8. They are fetched from upstream jsDelivr distributions, not vendored; upstream licenses apply. JavaScript needs no third-party runtime. Timings separate runtime preparation from source evaluation + calculation. Each run starts a new VM and cache; timings are explicitly not a cross-language benchmark. The UI compares one result against its own oracle, not a full correctness proof. Trace controls always describe the included algorithm, not edited source.

## Follow-up: open-data transit (user direction, November 25)

Use an explicit “Use my location” action to request browser geolocation, then locate nearby stops. Handle denied permission, unavailable position and timeout with a useful manual city/place/stop search. Never re-prompt in a loop. Offer IP-based approximate location only as an explicit alternative with a named provider and clear disclosure; it sends a request revealing the visitor's IP and can be wrong, especially on mobile networks or VPNs. Do not silently substitute it after a refusal. No location API or IP provider is contacted by the Fibonacci page. Transit remains a separate, unimplemented project; confirm provider terms, browser CORS and stop/real-time feeds before choosing it.

## Verification — November 25, 2026

- Native checks passed for all three approaches in JavaScript, Ruby and Python, including independent fixtures through F(500) for memoization/iteration, naive cases through F(20), invalid input rejection, and exact trace/call counts for 0–20.
- In-app browser: JavaScript F(10)/F(500), Python F(10)/F(500), Ruby F(100)/F(500) matched the oracle. Edited wrong output reported a mismatch; a syntax error reported a recoverable error. Infinite-loop execution stopped at four seconds; explicit Stop worked and the next run succeeded. C# was read-only with execution disabled; switching back preserved a JavaScript draft. Full F(6) trace ended in 8 after 11 calls.
- Tab moved out of the editor to Run with a visible focus outline. Document width equaled viewport width at 320, 390, 768 and 1280 px; the source editor scrolls internally. This was a browser smoke check, not a full screen-reader or cross-browser audit.
- Module workers created from blob URLs failed to start in the preview browser's opaque frame; classic workers with dynamic imports worked for all three runtimes. Keep this distinction in future compatibility tests.
- Site navigation/generation check passed: 29 HTML files, 564 local targets. JavaScript syntax checks and whitespace diff check passed. Swift/Rust/C#/Go reference examples were reviewed but not compiled in this environment.
