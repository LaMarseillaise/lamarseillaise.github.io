# RegimeWeb SVG gallery

65 illustrations selected by Andur Carr from RegimeWeb: all 32 religion/sect
assets, all 8 technical-tool assets, and 25 specifically requested products.
The original SVG bytes are preserved. Rendered as separate images, their
internal IDs and masks remain isolated from other drawings.

`catalog.json` records names, categories, credits, original source paths and
SHA-256 hashes. Source checkout: RegimeWeb at
`5395b9506d15f27b6ff2413fa34a200370d010bb`, inspected November 22, 2026. Selected
assets had no working-tree changes; other work in that checkout was preserved.
The gallery presentation was built with AI assistance; this does not describe
how the original artwork was made.

## Attribution

Andur identifies Hinduism (Om), Sikhism (Khanda), and Daoism (Yin and Yang) as
downloads from public-domain sources. Their original download URLs are not
recorded in the inspected SVGs. No source URL or independent license audit is
invented here. The Hindu sect variants also embed the same Om path and are
credited as Andur's designs incorporating the public-domain symbol. Other
designs are attributed to Andur, consistent with his description of the work.
This gallery does not apply a blanket public-domain license to his drawings.

## Behavior

Plain HTML, CSS and JavaScript; no dependencies or build step. All images and
credits are present in HTML without JavaScript. Search and category filters
are progressive enhancements. Image links open an enlarged native dialog
when supported, with previous/next controls, arrow keys and Escape to close;
modified clicks and the direct SVG link retain normal browser navigation.
Search matches names, symbol titles and parent traditions, ignoring case and
diacritics. Empty results and reset are explicit.

Serve the site root and open `/svg-gallery/`. Verify with:

```sh
python3 svg-gallery/check.py
```
