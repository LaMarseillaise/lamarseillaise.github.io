# AC monogram

Original geometric AC monogram: a taller triangular A beside an open, chamfered C, contained in a rounded square. Drawn directly as SVG paths, with broad strokes for small sizes. No font or third-party logo assets.

- Blue: `#173e86`; black: `#11151c`.
- `mark-blue.svg`, `mark-black.svg`: static vector variants.
- Root `/favicon.svg`: blue in light mode, black in dark mode.
- Both variants have 16, 32, 48, 180, 192 and 512 pixel PNGs.
- Both ICO variants contain 16, 32 and 48 pixel PNG entries; `/favicon.ico` is the blue fallback.
- Apple touch icon: blue 180; web-manifest icons: blue 192 and 512. No offline/PWA behavior or installation prompt is added.

Regenerate with the `@resvg/resvg-js` renderer installed outside the repository:

```
npm install --prefix /tmp/carr-icons --no-audit --no-fund @resvg/resvg-js
node scripts/generate-icons.mjs /tmp/carr-icons/node_modules/@resvg/resvg-js/index.js
```

The favicon head snippet lives in `content/favicon-head.html`; the collection renderer includes it. Static pages have the same explicit links. Artwork and renderer source are retained so exports are reproducible.
