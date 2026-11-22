# Native calculator

Plain JavaScript, a custom element, and Shadow DOM. No React, framework,
third-party dependency, or build step. Import `calculator.js` as a module and use
`<andur-calculator></andur-calculator>`. Multiple instances have separate state;
listeners live on each shadow root and survive removal/reinsertion without being
registered again. Keyboard handling is scoped to the focused component.

## Provenance

Adapted with Codex from Andur Carr's React keypad calculator:
https://github.com/LaMarseillaise/calculator/tree/e9fc56ae367583382ae07b3466e4bc1bfdc8ee30

The original is React, not a native custom element. It supplies the four-column
keypad layout and basic arithmetic behavior. The separate plain-JavaScript form
at https://github.com/LaMarseillaise/html-calculator/tree/433f80500e5390cde5fc5cb7fec194ad2d821c84
was also inspected; it is not a Web Component either. Neither upstream repo is
modified, and the personal site does not require a submodule or remote runtime.

This adaptation separates arithmetic state from DOM rendering, uses actual
buttons, and adds clear/sign/delete, keyboard input, decimal-entry handling and
division-by-zero recovery. It intentionally supports left-to-right chaining and
operator replacement. Repeated equals does nothing after an operation completes.
Input is limited to 15 digits; results use JavaScript Number with display rounding
to 15 significant digits. No `eval`, arbitrary expressions, or decimal-money claim.

The component emits a bubbling `calculate` event after a handled action, with
`detail: { value, error }`. Errors use a null value. Styles are contained within
Shadow DOM; the host sets its own responsive width.

## Checks

`node native-calculator/check.mjs` exercises arithmetic, decimals, chained/replaced
operators, error recovery, new entries, repeated equals, clearing/deleting,
sign changes, input limits, scientific-notation editing and independent model instances.
`component-check.html` is a manual browser fixture for two independent instances,
reconnection, outside input, style isolation, and 320-pixel frames for both new pages.

Verified November 22, 2026: all 25 engine checks passed. In-app browser checks
covered keyboard addition, button-based division by zero and recovery, separate
instance state, reconnect without duplicated listeners, page-style isolation,
and an outside text input. The 320-pixel iframe had a 305-pixel content area after
its scrollbar, with no horizontal overflow. This is browser emulation, not a
physical-device or screen-reader audit. The browser automation reported two
MutationObserver errors during selector actions; the app source does not use a
MutationObserver, and the same interactions worked using native input controls.

The site uses `/native-calculator/` because `/calculator/` is served by the
separate original calculator repository’s GitHub Pages deployment. That original
project and its hosting remain unchanged.
