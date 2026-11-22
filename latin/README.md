# Latin, connected

A buildless reading notebook, implemented with Codex. Users supply their own
translations and annotations; there are no supplied English translations, grammar
solutions, model calls, or claims of automatic parsing.

## Sources

Public-domain Latin excerpts checked November 22, 2026:

- Cicero, *Laelius de amicitia* §80: https://www.thelatinlibrary.com/cicero/amic.shtml
- Vulgata, Genesis 1:27, the edition at https://www.drbo.org/lvb/chapter/01001.htm

`passages.mjs` holds text, source, and stable passage IDs. These editions' wording
and punctuation are retained. Token indices are zero-based whitespace positions;
punctuation-only tokens cannot be selected in the UI. If editing a passage's text,
change its ID to prevent old saved annotations attaching to the wrong words.

## Interaction and storage

Choose a relationship and select two words. Subject/verb and verb/object links
are directed; agreement and shared-reference links are non-directional. These
are separate categories: syntactic connection does not imply shared reference.
Repeated identical links are ignored. Hover or focus a connection's list row
to emphasize its endpoints; the textual list carries all information represented
by the SVG lines and colors. Hide connections for unassisted reading.

Translations, notes, and links are saved per passage in `localStorage`, under
`andur-latin-readings-v1`. They are local to this origin/browser, not synced,
submitted, or published. An unavailable store produces a visible warning; JSON
export remains usable. Export is a backup/interchange artifact; this iteration
does not offer import or cross-tab merging. No English-word alignment or public
translation gallery is implemented yet. User prose is inserted using textContent
or textarea values, never interpreted as HTML.

Serve over HTTP and open `/latin/`. `node latin/check.mjs` validates passage IDs,
link endpoints/types, and directional duplicate handling. Browser checks should
exercise connecting/removing words, passage switches, reload persistence, hidden
links, export, wrapped-line geometry, and narrow viewports.

Verified November 22, 2026: data checks passed; in-app browser testing covered
connection creation/deletion, duplicate suppression, per-passage draft isolation,
reload persistence, hiding/showing links, and JSON export (downloaded contents
matched the draft and connection). Wrapped-line connectors were checked and
rerouted through the margin. At a 320-pixel frame width (305-pixel content area
after the scrollbar), no horizontal overflow occurred. The Latin page's captured
warning/error log was empty. Temporary test drafts and connections were cleared
through the UI. No actual translations were written. Storage-denial handling was
reviewed in code but not simulated in the browser; no cross-browser/device audit
or import round-trip is claimed.

## Latin and transformers

The page explains the user's reported Latin/attention intuition while distinguishing
explicit grammatical and reference links from learned numerical attention weights.
Technical sources checked November 22, 2026:

- Vaswani et al., https://arxiv.org/html/1706.03762v7#S3.SS2
- Jain and Wallace, https://aclanthology.org/N19-1357/

Browser-assistance research (not integrated or benchmarked):

- Qwen3-1.7B ONNX is documented for Transformers.js:
  https://huggingface.co/onnx-community/Qwen3-1.7B-ONNX
- Browser inference with WASM/WebGPU:
  https://huggingface.co/docs/transformers.js/index
- LatinCy UDPipe provides Latin morphology/dependency analysis in a 72.3 MB model:
  https://huggingface.co/latincy/la_udpipe_latincy
  Its documented R/Python/CLI runtimes are not a verified browser drop-in. A WASM
  port or another browser-compatible export would need implementation/validation.

A future suggestion layer should be opt-in, load a pinned model only on request,
run in a worker, preserve manual annotations, validate token IDs and relation types,
and require accepting/rejecting each proposal. Dependency labels, morphology and
coreference need separate evaluation; fluent explanations and valid JSON do not
establish grammatical accuracy. Do not generate the user's translations.
